import { v4 as uuidv4 } from 'uuid';

export class PasswordEntry {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.user_id = data.user_id;
    this.title = data.title;
    this.email = data.email || null;
    this.username = data.username || null;
    this.encrypted_password = data.encrypted_password;
    this.url = data.url || null;
    this.notes = data.notes || null;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      email: this.email,
      username: this.username,
      encrypted_password: this.encrypted_password,
      url: this.url,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}