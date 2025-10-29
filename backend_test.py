#!/usr/bin/env python3
"""
Backend API Testing for SafePass Password Manager
Tests all authentication and password management endpoints
"""

import requests
import sys
import json
from datetime import datetime
import uuid

class SafePassAPITester:
    def __init__(self, base_url="https://safepass-6.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.username = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_test(name, True)
                    return True, response_data
                except:
                    # For DELETE requests that might not return JSON
                    self.log_test(name, True)
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Error: {error_data}")
                except:
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response.text}")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration with recovery key"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_username = f"testuser_{timestamp}"
        test_password = "TestPassword123!"
        
        success, response = self.run_test(
            "User Registration with Recovery Key",
            "POST",
            "auth/register",
            200,
            data={
                "master_username": test_username,
                "master_password": test_password
            }
        )
        
        if success and 'token' in response and 'recovery_key' in response:
            self.token = response['token']
            self.user_id = response['user_id']
            self.username = test_username
            self.master_password = test_password
            self.recovery_key = response['recovery_key']
            print(f"   Registered user: {test_username}")
            print(f"   Recovery key generated: {self.recovery_key}")
            return True
        return False

    def test_duplicate_registration(self):
        """Test duplicate user registration should fail"""
        if not self.username:
            self.log_test("Duplicate Registration", False, "No username available for duplicate test")
            return False
            
        success, response = self.run_test(
            "Duplicate Registration (should fail)",
            "POST", 
            "auth/register",
            400,  # Should return 400 for duplicate
            data={
                "master_username": self.username,
                "master_password": "AnotherPassword123!"
            }
        )
        return success

    def test_user_login(self):
        """Test user login"""
        if not self.username:
            self.log_test("User Login", False, "No username available for login test")
            return False
            
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login", 
            200,
            data={
                "master_username": self.username,
                "master_password": self.master_password
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']  # Update token
            print(f"   Logged in user: {self.username}")
            return True
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login (should fail)",
            "POST",
            "auth/login",
            401,  # Should return 401 for invalid credentials
            data={
                "master_username": "nonexistent_user",
                "master_password": "wrong_password"
            }
        )
        return success

    def test_get_empty_passwords(self):
        """Test getting passwords when none exist"""
        if not self.token:
            self.log_test("Get Empty Passwords", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Get Empty Password List",
            "GET",
            "passwords",
            200
        )
        
        if success and isinstance(response, list) and len(response) == 0:
            print("   Empty password list returned correctly")
            return True
        return False

    def test_create_password(self):
        """Test creating a password entry"""
        if not self.token:
            self.log_test("Create Password", False, "No token available")
            return False
            
        password_data = {
            "title": "Test Gmail Account",
            "email": "test@gmail.com", 
            "username": "testuser",
            "encrypted_password": "encrypted_test_password_123",  # This would be encrypted on client
            "url": "https://gmail.com",
            "notes": "Test account for SafePass testing"
        }
        
        success, response = self.run_test(
            "Create Password Entry",
            "POST",
            "passwords",
            200,
            data=password_data
        )
        
        if success and 'id' in response:
            self.test_password_id = response['id']
            print(f"   Created password entry with ID: {self.test_password_id}")
            return True
        return False

    def test_get_passwords(self):
        """Test getting password list"""
        if not self.token:
            self.log_test("Get Passwords", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Get Password List",
            "GET", 
            "passwords",
            200
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Retrieved {len(response)} password entries")
            return True
        return False

    def test_update_password(self):
        """Test updating a password entry"""
        if not self.token or not hasattr(self, 'test_password_id'):
            self.log_test("Update Password", False, "No token or password ID available")
            return False
            
        update_data = {
            "title": "Updated Gmail Account",
            "email": "updated@gmail.com",
            "notes": "Updated notes for testing"
        }
        
        success, response = self.run_test(
            "Update Password Entry",
            "PUT",
            f"passwords/{self.test_password_id}",
            200,
            data=update_data
        )
        
        if success and response.get('title') == "Updated Gmail Account":
            print("   Password entry updated successfully")
            return True
        return False

    def test_delete_password(self):
        """Test deleting a password entry"""
        if not self.token or not hasattr(self, 'test_password_id'):
            self.log_test("Delete Password", False, "No token or password ID available")
            return False
            
        success, response = self.run_test(
            "Delete Password Entry",
            "DELETE",
            f"passwords/{self.test_password_id}",
            200
        )
        
        if success:
            print("   Password entry deleted successfully")
            return True
        return False

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access (should fail)",
            "GET",
            "passwords", 
            401  # Should return 401 for unauthorized
        )
        
        # Restore token
        self.token = original_token
        return success

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting SafePass Backend API Tests")
        print("=" * 50)
        
        # Authentication Tests
        print("\n📝 AUTHENTICATION TESTS")
        self.test_user_registration()
        self.test_duplicate_registration()
        self.test_user_login()
        self.test_invalid_login()
        self.test_unauthorized_access()
        
        # Password Management Tests  
        print("\n🔐 PASSWORD MANAGEMENT TESTS")
        self.test_get_empty_passwords()
        self.test_create_password()
        self.test_get_passwords()
        self.test_update_password()
        self.test_delete_password()
        
        # Print Results
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS SUMMARY")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed!")
            return 1

def main():
    tester = SafePassAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())