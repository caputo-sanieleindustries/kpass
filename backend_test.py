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
    def __init__(self, base_url="https://secure-vault-56.preview.emergentagent.com"):
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
        test_headers = {}
        
        # Only add Content-Type for requests that have data
        if data is not None:
            test_headers['Content-Type'] = 'application/json'
        
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

    def test_password_recovery(self):
        """Test password recovery using recovery key"""
        if not hasattr(self, 'recovery_key') or not self.username:
            self.log_test("Password Recovery", False, "No recovery key or username available")
            return False
            
        new_password = "NewTestPassword456!"
        
        success, response = self.run_test(
            "Password Recovery with Recovery Key",
            "POST",
            "auth/recover",
            200,
            data={
                "master_username": self.username,
                "recovery_key": self.recovery_key,
                "new_master_password": new_password
            }
        )
        
        if success:
            # Update stored password for future tests
            self.master_password = new_password
            print("   Password recovery successful")
            return True
        return False

    def test_export_csv(self):
        """Test CSV export functionality"""
        if not self.token:
            self.log_test("Export CSV", False, "No token available")
            return False
            
        # First create a password to export
        password_data = {
            "title": "Export Test Account",
            "email": "export@test.com", 
            "username": "exportuser",
            "encrypted_password": "encrypted_export_password",
            "url": "https://export-test.com",
            "notes": "Test account for export testing"
        }
        
        create_success, create_response = self.run_test(
            "Create Password for Export",
            "POST",
            "passwords",
            200,
            data=password_data
        )
        
        if not create_success:
            return False
            
        # Test CSV export
        try:
            url = f"{self.api_url}/passwords/export?format=csv"
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                self.log_test("Export CSV", True)
                print("   CSV export successful")
                return True
            else:
                self.log_test("Export CSV", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Export CSV", False, f"Request failed: {str(e)}")
            return False

    def test_export_xml(self):
        """Test XML export functionality"""
        if not self.token:
            self.log_test("Export XML", False, "No token available")
            return False
            
        try:
            url = f"{self.api_url}/passwords/export?format=xml"
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                self.log_test("Export XML", True)
                print("   XML export successful")
                return True
            else:
                self.log_test("Export XML", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Export XML", False, f"Request failed: {str(e)}")
            return False

    def test_export_xlsx(self):
        """Test XLSX export functionality"""
        if not self.token:
            self.log_test("Export XLSX", False, "No token available")
            return False
            
        try:
            url = f"{self.api_url}/passwords/export?format=xlsx"
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                self.log_test("Export XLSX", True)
                print("   XLSX export successful")
                return True
            else:
                self.log_test("Export XLSX", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Export XLSX", False, f"Request failed: {str(e)}")
            return False

    def test_export_xlsm(self):
        """Test XLSM export functionality"""
        if not self.token:
            self.log_test("Export XLSM", False, "No token available")
            return False
            
        try:
            url = f"{self.api_url}/passwords/export?format=xlsm"
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                self.log_test("Export XLSM", True)
                print("   XLSM export successful")
                return True
            else:
                self.log_test("Export XLSM", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Export XLSM", False, f"Request failed: {str(e)}")
            return False

    def test_import_route_removed(self):
        """Test that import route has been removed (should return 404)"""
        if not self.token:
            self.log_test("Import Route Removed", False, "No token available")
            return False
            
        try:
            url = f"{self.api_url}/passwords/import"
            headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
            
            # Test POST request to import endpoint
            response = requests.post(url, json={"test": "data"}, headers=headers, timeout=10)
            
            # Should return 404 since import route is removed
            if response.status_code == 404:
                self.log_test("Import Route Removed", True)
                print("   Import route correctly removed (404)")
                return True
            else:
                self.log_test("Import Route Removed", False, f"Expected 404, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Import Route Removed", False, f"Request failed: {str(e)}")
            return False

    def test_export_without_auth(self):
        """Test export endpoint without authentication (should return 401)"""
        try:
            url = f"{self.api_url}/passwords/export?format=csv"
            # No Authorization header
            response = requests.get(url, timeout=10)
            
            if response.status_code == 401:
                self.log_test("Export Without Auth (should fail)", True)
                print("   Export correctly requires authentication (401)")
                return True
            else:
                self.log_test("Export Without Auth (should fail)", False, f"Expected 401, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Export Without Auth (should fail)", False, f"Request failed: {str(e)}")
            return False

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
        
        # Recovery Tests
        print("\n🔑 RECOVERY TESTS")
        self.test_password_recovery()
        
        # Password Management Tests  
        print("\n🔐 PASSWORD MANAGEMENT TESTS")
        self.test_get_empty_passwords()
        self.test_create_password()
        self.test_get_passwords()
        self.test_update_password()
        self.test_delete_password()
        
        # Import/Export Tests
        print("\n📁 IMPORT/EXPORT TESTS")
        self.test_import_route_removed()
        self.test_export_without_auth()
        self.test_export_csv()
        self.test_export_xml()
        self.test_export_xlsx()
        self.test_export_xlsm()
        
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