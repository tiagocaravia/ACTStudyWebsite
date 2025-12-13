#!/bin/bash
# Test auth flow with curl

BASE_URL="http://localhost:8000/api"
TEST_EMAIL="signup-test-$(date +%s)@example.com"
TEST_USERNAME="signuptest$(date +%s)"
TEST_PASSWORD="TestPassword123"
TEST_FULL_NAME="Test User"

echo "============================================================"
echo "Testing ACT Study Website Auth Flow"
echo "============================================================"

# 1. Sign up
echo ""
echo "1️⃣  Testing SIGNUP endpoint..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"username\": \"$TEST_USERNAME\",
    \"full_name\": \"$TEST_FULL_NAME\"
  }")

echo "$SIGNUP_RESPONSE" | grep -q "access_token"
if [ $? -eq 0 ]; then
  echo "   ✅ SUCCESS - User signed up"
  TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:30}..."
else
  echo "   ❌ FAILED - Could not sign up"
  echo "   Response: $SIGNUP_RESPONSE"
  exit 1
fi

# 2. Login
echo ""
echo "2️⃣  Testing LOGIN endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | grep -q "access_token"
if [ $? -eq 0 ]; then
  echo "   ✅ SUCCESS - User logged in"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:30}..."
else
  echo "   ❌ FAILED - Could not log in"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi

# 3. Get current user
echo ""
echo "3️⃣  Testing GET /auth/me endpoint (authenticated)..."
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "$ME_RESPONSE" | grep -q "email"
if [ $? -eq 0 ]; then
  echo "   ✅ SUCCESS - Retrieved user profile"
  echo "   Response: $ME_RESPONSE"
else
  echo "   ❌ FAILED - Could not get user profile"
  echo "   Response: $ME_RESPONSE"
  exit 1
fi

# Summary
echo ""
echo "============================================================"
echo "✅ ALL TESTS PASSED!"
echo "============================================================"
echo ""
echo "Auth flow is working correctly:"
echo "✓ Users can sign up"
echo "✓ Users can log in"
echo "✓ Users can retrieve their authenticated profile"
echo ""
echo "🎉 Ready for frontend integration!"
echo ""
