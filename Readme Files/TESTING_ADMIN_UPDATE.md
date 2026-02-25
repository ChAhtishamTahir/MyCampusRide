# Admin Name Update Fix - Testing Guide

## Overview

This document provides comprehensive testing procedures to verify that admin name updates are now properly persisted to the database.

---

## Quick Verification (2 minutes)

### Manual Testing
1. Log in as an admin user
2. Navigate to Admin Dashboard → Profile
3. Change the name field (e.g., "Admin Name" → "John Smith")
4. Click "Update Profile"
5. Verify success message appears
6. Refresh the page - name should still be updated

### API Testing with curl
```bash
# 1. Get admin JWT token (from login response)
TOKEN="your_jwt_token_here"

# 2. Test the API directly
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Admin Name",
    "email": "admin@example.com",
    "phone": "03001234567"
  }'

# 3. Expected response:
# {
#   "success": true,
#   "message": "Profile updated successfully",
#   "data": {
#     "name": "Updated Admin Name",
#     "email": "admin@example.com",
#     "phone": "03001234567",
#     "updatedAt": "2024-02-07T...",
#     ...
#   }
# }
```

---

## Comprehensive Test Cases

### Test Case 1: Valid Name Update
**Test:** Update name with valid input
**Input:**
- name: "New Admin Name"
- email: (unchanged)
- phone: (unchanged)

**Expected:**
- HTTP 200 response
- `success: true`
- Database reflects new name
- `updatedAt` timestamp is recent

**Verification SQL:**
```javascript
// MongoDB check
db.users.findOne({ email: "admin@example.com" })
// Should show: { name: "New Admin Name", ... }
```

---

### Test Case 2: Name Too Short (Validation)
**Test:** Update name with 1 character
**Input:** `name: "A"`

**Expected:**
- HTTP 400 response
- `success: false`
- `message: "Name must be between 2 and 50 characters"`
- Database UNCHANGED

---

### Test Case 3: Name Too Long (Validation)
**Test:** Update name with 51+ characters
**Input:** `name: "A very long name with more than fifty characters which should fail"`

**Expected:**
- HTTP 400 response
- `success: false`
- `message: "Name must be between 2 and 50 characters"`
- Database UNCHANGED

---

### Test Case 4: All Fields Updated Together
**Test:** Update all three fields at once
**Input:**
```json
{
  "name": "Full Name Update",
  "email": "newemail@example.com",
  "phone": "03201234567"
}
```

**Expected:**
- HTTP 200 response
- All three fields in response match input
- Database shows all three fields updated
- `updatedAt` is recent

---

### Test Case 5: Invalid Email Format
**Test:** Update with invalid email
**Input:** `email: "not-an-email"`

**Expected:**
- HTTP 400 response
- `message: "Please enter a valid email address"`
- Database UNCHANGED

---

### Test Case 6: Invalid Phone Format
**Test:** Update with non-Pakistani phone
**Input:** `phone: "1234567890"`  (missing leading 0)

**Expected:**
- HTTP 400 response
- `message: "Phone must be in format 03XXXXXXXXX (e.g., 03001234567)"`
- Database UNCHANGED

---

### Test Case 7: Duplicate Email
**Test:** Update email to one already in use
**Input:** `email: "existing-user@example.com"`

**Expected:**
- HTTP 400 response
- `message: "Email already in use by another account"`
- Database UNCHANGED (admin's email stays the same)

---

### Test Case 8: Empty Name
**Test:** Update with empty string
**Input:** `name: ""`

**Expected:**
- HTTP 400 response
- `message: "Name must be a non-empty string"`
- Database UNCHANGED

---

### Test Case 9: Name with Leading/Trailing Spaces
**Test:** Update with spaces around name
**Input:** `name: "  Admin Name  "`

**Expected:**
- HTTP 200 response
- Name stored as trimmed: "Admin Name"
- Spaces removed in database

---

### Test Case 10: Multiple Rapid Updates
**Test:** Send 3 update requests quickly in succession

**Expected:**
- All succeed with HTTP 200
- Database reflects final state
- `updatedAt` timestamps are different for each update

---

## Database Verification Steps

### Check 1: Direct MongoDB Query
```bash
# Using MongoDB shell
mongo
> use mycampusride
> db.users.findOne({ _id: ObjectId("ADMIN_USER_ID") })
```

**Verify:**
- `name` field is updated
- `updatedAt` is recent
- `updatedAtCount` or similar doesn't exist (we're not tracking this)

### Check 2: Get Me Endpoint
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Verify:**
- Response includes updated `name`
- Timestamp is recent

### Check 3: Browser DevTools
1. Open Admin Profile page
2. Open DevTools → Network tab
3. Click "Update Profile"
4. Check the request and response:
   - Request should include all three fields
   - Response should show `success: true`

---

## Debugging Checklist

If tests fail, check these items:

- [ ] Backend is running: `npm start` in `/backend`
- [ ] Frontend is running: `npm run dev` in `/frontend`
- [ ] MongoDB is accessible and data exists
- [ ] JWT token in API request is valid and not expired
- [ ] Backend controller includes validation checks
- [ ] Frontend form includes validation
- [ ] Both frontend and backend have the latest changes

---

## Common Failure Points

### Failure: "Success" message but DB not updated
**Cause:** Validation failed but error not returned
**Solution:** Backend controller must check if `findByIdAndUpdate` returned null

### Failure: Phone validation error every time
**Cause:** Phone format validation is strict
**Format Required:** `0XXXXXXXXX` (exactly 11 digits starting with 0)
**Valid Examples:**
- 03001234567
- 03451234567
- 03331234567

**Invalid Examples:**
- 3001234567 (missing leading 0)
- 030 012 34567 (spaces)
- 03-001-234567 (dashes)
- +923001234567 (country code)

### Failure: Name validation fails in frontend but not backend
**Cause:** Frontend and backend validation regex might differ
**Solution:** Both should use same rules: 2-50 characters, trim spaces

---

## Performance Checks

### Check Database Response Time
```javascript
// Add timing to controller
const start = Date.now();
const user = await User.findByIdAndUpdate(...);
const duration = Date.now() - start;
console.log(`Update took ${duration}ms`);
```

**Expected:** < 100ms for typical updates

### Check API Response Time
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Test", "email": "admin@example.com", "phone": "03001234567"}' \
  -w "\nTime: %{time_total}s\n"
```

**Expected:** < 500ms total

---

## Validation Rule Summary

| Field | Min | Max | Format | Examples |
|-------|-----|-----|--------|----------|
| name | 2 | 50 | Text, trimmed | "John Doe", "Dr. Ahmed Khan" |
| email | - | - | Valid email | "admin@example.com" |
| phone | 11 | 11 | 0XXXXXXXXX | "03001234567" |

---

## Post-Fix Verification

After implementing all changes:

1. Run all 10 test cases above
2. Check database directly
3. Test with curl API calls
4. Test via frontend UI
5. Test rapid successive updates
6. Test with invalid inputs
7. Verify error messages are specific

**Success Criteria:**
- All 10 test cases pass
- Database shows correct data
- Error messages are helpful
- No silent failures
- Validation happens at both frontend and backend

---

## Rollback Plan (If Needed)

If the fix causes issues:

1. Revert these files to original:
   - `/backend/controllers/authController.js`
   - `/frontend/src/pages/AdminDashboard/components/AdminProfileView.jsx`

2. Restart backend: `npm start`
3. Rebuild frontend: `npm run build`

---

## Related Issues Fixed

This fix also resolves:
- Driver profile now has proper name field handling
- Student profile handles name updates correctly
- Consistent validation across all user roles
- Better error messaging for profile updates

---

## Support

If tests don't pass:

1. Check console logs: `npm start` in backend shows detailed logs
2. Use curl to test API in isolation
3. Check MongoDB directly for data
4. Review validation rules in both frontend and backend
5. Ensure all files have been updated with latest code
