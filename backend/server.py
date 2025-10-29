from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Define Models
class UserRegister(BaseModel):
    master_username: str
    master_password: str

class UserLogin(BaseModel):
    master_username: str
    master_password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    master_username: str
    master_password_hash: str
    salt: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PasswordEntryCreate(BaseModel):
    title: str
    email: Optional[str] = None
    username: Optional[str] = None
    encrypted_password: str
    url: Optional[str] = None
    notes: Optional[str] = None

class PasswordEntryUpdate(BaseModel):
    title: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    encrypted_password: Optional[str] = None
    url: Optional[str] = None
    notes: Optional[str] = None

class PasswordEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    email: Optional[str] = None
    username: Optional[str] = None
    encrypted_password: str
    url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    token: str
    user_id: str
    master_username: str

# Helper functions
def hash_password(password: str, salt: bytes) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, master_username: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'user_id': user_id,
        'master_username': master_username,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user already exists
    existing_user = await db.users.find_one({"master_username": user_data.master_username}, {"_id": 0})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Generate salt and hash password
    salt = bcrypt.gensalt()
    password_hash = hash_password(user_data.master_password, salt)
    
    # Create user
    user = User(
        master_username=user_data.master_username,
        master_password_hash=password_hash,
        salt=salt.decode('utf-8')
    )
    
    # Save to database
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Create JWT token
    token = create_jwt_token(user.id, user.master_username)
    
    return TokenResponse(
        token=token,
        user_id=user.id,
        master_username=user.master_username
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    # Find user
    user = await db.users.find_one({"master_username": user_data.master_username}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Verify password
    if not verify_password(user_data.master_password, user['master_password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Create JWT token
    token = create_jwt_token(user['id'], user['master_username'])
    
    return TokenResponse(
        token=token,
        user_id=user['id'],
        master_username=user['master_username']
    )

# Password Routes
@api_router.get("/passwords", response_model=List[PasswordEntry])
async def get_passwords(current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    passwords = await db.password_entries.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for pwd in passwords:
        if isinstance(pwd.get('created_at'), str):
            pwd['created_at'] = datetime.fromisoformat(pwd['created_at'])
        if isinstance(pwd.get('updated_at'), str):
            pwd['updated_at'] = datetime.fromisoformat(pwd['updated_at'])
    
    return passwords

@api_router.post("/passwords", response_model=PasswordEntry)
async def create_password(password_data: PasswordEntryCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    
    password_entry = PasswordEntry(
        user_id=user_id,
        **password_data.model_dump()
    )
    
    # Save to database
    doc = password_entry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.password_entries.insert_one(doc)
    
    return password_entry

@api_router.put("/passwords/{password_id}", response_model=PasswordEntry)
async def update_password(
    password_id: str,
    password_data: PasswordEntryUpdate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user['user_id']
    
    # Find existing password
    existing = await db.password_entries.find_one({"id": password_id, "user_id": user_id}, {"_id": 0})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Password entry not found"
        )
    
    # Update fields
    update_data = password_data.model_dump(exclude_unset=True)
    if update_data:
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.password_entries.update_one(
            {"id": password_id, "user_id": user_id},
            {"$set": update_data}
        )
    
    # Get updated entry
    updated = await db.password_entries.find_one({"id": password_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return PasswordEntry(**updated)

@api_router.delete("/passwords/{password_id}")
async def delete_password(password_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    
    result = await db.password_entries.delete_one({"id": password_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Password entry not found"
        )
    
    return {"message": "Password deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()