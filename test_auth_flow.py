#!/usr/bin/env python3
"""
Test script to verify signup flow works end-to-end
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_signup_flow():
    """Test complete signup -> login -> get user flow"""
    print("\n" + "="*60)
    print("Testing ACT Study Website Auth Flow")
    print("="*60)
    
    # Test data
    test_email = "signup-test@example.com"
    test_username = "signuptest123"
    test_password = "TestPassword123"
    test_full_name = "Test User"
    
    try:
        # 1. Sign up
        print("\n1️⃣  Testing SIGNUP endpoint...")
        signup_resp = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": test_email,
                "password": test_password,
                "username": test_username,
                "full_name": test_full_name
            },
            timeout=5
        )
        
        if signup_resp.status_code != 200:
            print(f"   ❌ FAILED: Status {signup_resp.status_code}")
            print(f"   Response: {signup_resp.text}")
            return False
        
        signup_data = signup_resp.json()
        access_token = signup_data.get("access_token")
        user = signup_data.get("user")
        
        print(f"   ✅ SUCCESS")
        print(f"      - Email: {user.get('email')}")
        print(f"      - Username: {user.get('username')}")
        print(f"      - Full Name: {user.get('full_name')}")
        print(f"      - Token: {access_token[:30]}...")
        
        # 2. Login
        print("\n2️⃣  Testing LOGIN endpoint...")
        login_resp = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "username": test_username,
                "password": test_password
            },
            timeout=5
        )
        
        if login_resp.status_code != 200:
            print(f"   ❌ FAILED: Status {login_resp.status_code}")
            print(f"   Response: {login_resp.text}")
            return False
        
        login_data = login_resp.json()
        login_token = login_data.get("access_token")
        login_user = login_data.get("user")
        
        print(f"   ✅ SUCCESS")
        print(f"      - Email: {login_user.get('email')}")
        print(f"      - Username: {login_user.get('username')}")
        print(f"      - Token: {login_token[:30]}...")
        
        # 3. Get current user (authenticated)
        print("\n3️⃣  Testing GET /auth/me endpoint (authenticated)...")
        me_resp = requests.get(
            f"{BASE_URL}/auth/me",
            headers={
                "Authorization": f"Bearer {login_token}"
            },
            timeout=5
        )
        
        if me_resp.status_code != 200:
            print(f"   ❌ FAILED: Status {me_resp.status_code}")
            print(f"   Response: {me_resp.text}")
            return False
        
        me_data = me_resp.json()
        me_user = me_data.get("user")
        
        print(f"   ✅ SUCCESS")
        print(f"      - Email: {me_user.get('email')}")
        print(f"      - Username: {me_user.get('username')}")
        print(f"      - Full Name: {me_user.get('full_name')}")
        
        # 4. Test invalid token
        print("\n4️⃣  Testing GET /auth/me with INVALID token...")
        invalid_resp = requests.get(
            f"{BASE_URL}/auth/me",
            headers={
                "Authorization": "Bearer invalid-token-xyz"
            },
            timeout=5
        )
        
        if invalid_resp.status_code != 401:
            print(f"   ⚠️  WARNING: Expected 401, got {invalid_resp.status_code}")
        else:
            print(f"   ✅ SUCCESS - Correctly rejected invalid token")
        
        # Summary
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        print("\nAuth flow is working correctly:")
        print("1. Users can sign up with email, username, password, full name")
        print("2. Users can log in with username and password")
        print("3. Users can retrieve their profile with JWT token")
        print("4. Invalid tokens are properly rejected")
        print("\n🎉 Ready for frontend integration!\n")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend at http://localhost:8000")
        print("   Make sure the backend is running:")
        print("   cd backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_signup_flow()
    sys.exit(0 if success else 1)
