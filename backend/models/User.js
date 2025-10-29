import { v4 as uuidv4 } from 'uuid';

export class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.master_username = data.master_username;
    this.master_password_hash = data.master_password_hash;
    this.salt = data.salt;
    this.recovery_key_hash = data.recovery_key_hash;
    this.created_at = data.created_at || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      master_username: this.master_username,
      master_password_hash: this.master_password_hash,
      salt: this.salt,
      recovery_key_hash: this.recovery_key_hash,
      created_at: this.created_at
    };
  }
}