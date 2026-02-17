# Reviewer Registration & Approval System
## Complete Developer Guide

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Workflow Diagram](#workflow-diagram)
3. [Architecture](#architecture)
4. [Backend Components](#backend-components)
5. [Frontend Components](#frontend-components)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Code Comments Guide](#code-comments-guide)
9. [Testing](#testing)
10. [Security Considerations](#security-considerations)

---

## 🎯 System Overview

### Purpose
Allow reviewers to self-register while maintaining quality control through admin approval.

### Key Features
- ✅ **Self-Registration**: Reviewers can register without admin intervention
- ✅ **Approval Workflow**: Accounts start inactive until SRC Chair approves
- ✅ **Security**: Prevents unauthorized access through two-tier activation
- ✅ **User Experience**: Clear messaging about approval status
- ✅ **Admin Control**: Easy-to-use approval/rejection interface

### Business Rules
1. Reviewers fill out public registration form
2. Account created as **INACTIVE** (`is_active=False`)
3. **ReviewerProfile** created as **INACTIVE** (`is_active_reviewer=False`)
4. SRC Chair sees pending registration in admin panel
5. SRC Chair can **Approve** (activate account) or **Reject** (delete account)
6. Upon approval, reviewer can login and receive assignments

---

## 🔄 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVIEWER REGISTRATION FLOW                   │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ┌──────────────┐
   │   Reviewer   │──► Visits /register-reviewer
   │              │──► Fills out form (username, email, password, name)
   └──────────────┘
         │
         ▼
   POST /api/auth/register-reviewer/
         │
         ▼
   ┌──────────────────────────────────────────────┐
   │  Backend Creates:                            │
   │  • User (is_active=False)                    │
   │  • Assigns to "Reviewer" group               │
   │  • Creates ReviewerProfile (inactive)        │
   └──────────────────────────────────────────────┘
         │
         ▼
   User sees: "Registration successful! Pending approval."
   (Redirected to /login)


2. APPROVAL STAGE
   ┌──────────────┐
   │  SRC Chair   │──► Logs in to admin panel
   │  (Admin)     │──► Navigates to "Pending Reviewers"
   └──────────────┘
         │
         ▼
   GET /api/auth/pending-reviewers/
   (Returns list of inactive reviewers)
         │
         ▼
   ┌─────────────────────────────────┐
   │  SRC Chair sees:                │
   │  • Reviewer name                │
   │  • Email                        │
   │  • Registration date            │
   │  • [Approve] [Reject] buttons   │
   └─────────────────────────────────┘
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
    APPROVE         REJECT          DO NOTHING
         │              │              │
         ▼              ▼              ▼
  POST /approve-   DELETE /reject-   Stays
  reviewer/<id>/   reviewer/<id>/   pending
         │              │
         ▼              ▼
  Sets:            Deletes user
  • is_active=True    permanently
  • is_active_
    reviewer=True


3. LOGIN
   ┌──────────────┐
   │   Reviewer   │──► Tries to login
   └──────────────┘
         │
         ├─────────────────┬──────────────────┐
         ▼                 ▼                  ▼
   NOT APPROVED      APPROVED           REJECTED
   (is_active=False) (is_active=True)   (user deleted)
         │                 │                  │
         ▼                 ▼                  ▼
   "Account has      Login SUCCESS!     "Invalid
   been disabled"                       credentials"
```

---

## 🏗️ Architecture

### Backend (Django REST Framework)

```
backend/users/
├── models.py              # User model (extends AbstractUser)
├── serializers.py         # ReviewerRegistrationSerializer
│                         # UserListSerializer (with date_joined)
├── views.py              # ReviewerPublicRegistrationView
│                         # PendingReviewersView
│                         # ApproveReviewerView
│                         # RejectReviewerView
└── urls.py               # API endpoint routing
```

### Frontend (React + TypeScript)

```
frontend/src/
├── features/
│   ├── auth/
│   │   ├── Login.tsx              # Enhanced error handling
│   │   └── ReviewerRegistration.tsx  # Registration form
│   └── admin/
│       └── PendingReviewers.tsx   # Approval interface
├── components/
│   └── DashboardLayout.tsx        # Nav link to pending reviewers
└── App.tsx                        # Route configuration
```

---

## 🔧 Backend Components

### 1. **ReviewerRegistrationSerializer**
**File:** `backend/users/serializers.py`

**Purpose:** Validates and creates inactive reviewer accounts

**Key Methods:**
```python
def validate_email(self, value):
    """Ensures email uniqueness"""

def validate_username(self, value):
    """Ensures username uniqueness"""

def create(self, validated_data):
    """Creates inactive user with Reviewer role"""
    # 1. Create user (password auto-hashed)
    # 2. Set is_active=False
    # 3. Assign to Reviewer group
    # 4. Create ReviewerProfile (also inactive)
```

**Fields:**
- `username` - Unique identifier
- `email` - Unique email (validated)
- `password` - Hashed password (write-only)
- `first_name` - Required
- `last_name` - Required

---

### 2. **ReviewerPublicRegistrationView**
**File:** `backend/users/views.py`

**Endpoint:** `POST /api/auth/register-reviewer/`

**Permission:** `AllowAny` (public endpoint)

**What it does:**
1. Validates input data
2. Creates inactive user account
3. Returns success response

**Request Example:**
```json
{
  "username": "john.reviewer",
  "email": "john@nsu.edu",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Reviewer"
}
```

---

### 3. **PendingReviewersView**
**File:** `backend/users/views.py`

**Endpoint:** `GET /api/auth/pending-reviewers/`

**Permission:** `IsAdminUser` (admin only)

**What it does:**
```python
def get_queryset(self):
    return User.objects.filter(
        groups__name='Reviewer',  # Only reviewers
        is_active=False           # Only inactive
    ).order_by('-date_joined')    # Newest first
```

**Response Example:**
```json
[
  {
    "id": 5,
    "username": "john.reviewer",
    "email": "john@nsu.edu",
    "full_name": "John Reviewer",
    "role": "Reviewer",
    "is_active": false,
    "date_joined": "2026-02-12T10:30:00Z"
  }
]
```

---

### 4. **ApproveReviewerView**
**File:** `backend/users/views.py`

**Endpoint:** `POST /api/auth/approve-reviewer/<id>/`

**Permission:** `IsAdminUser` (admin only)

**Workflow:**
```python
1. Fetch user by ID
2. Validate user is in Reviewer group
3. Check is_active == False (prevent duplicate approval)
4. Set User.is_active = True
5. Set ReviewerProfile.is_active_reviewer = True
6. Return success with user data
```

**Safety Checks:**
- ❌ Cannot approve non-existent users (404)
- ❌ Cannot approve non-reviewers (400)
- ❌ Cannot approve already-active reviewers (400)

---

### 5. **RejectReviewerView**
**File:** `backend/users/views.py`

**Endpoint:** `DELETE /api/auth/reject-reviewer/<id>/`

**Permission:** `IsAdminUser` (admin only)

**⚠️ WARNING:** Destructive operation! Permanently deletes account.

**Workflow:**
```python
1. Fetch user by ID
2. Validate user is in Reviewer group
3. CRITICAL CHECK: is_active == False (prevent deleting active users)
4. Delete user (CASCADE deletes ReviewerProfile)
5. Return success message
```

**Safety Checks:**
- ❌ Cannot reject non-existent users (404)
- ❌ Cannot reject non-reviewers (400)
- ❌ **CANNOT reject active reviewers** (400) - SAFETY FEATURE

---

## 💻 Frontend Components

### 1. **ReviewerRegistration Component**
**File:** `frontend/src/features/auth/ReviewerRegistration.tsx`

**Route:** `/register-reviewer`

**Features:**
- ✅ Form validation (password match, length)
- ✅ Real-time error display
- ✅ Password show/hide toggle
- ✅ **Approval notice banner** (blue box)
- ✅ Error handling for DRF array responses

**State Management:**
```typescript
const [formData, setFormData] = useState({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',  // Client-side only
  firstName: '',
  lastName: ''
});
const [error, setError] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
```

**Key Code Sections:**
```typescript
// CLIENT-SIDE VALIDATION
if (formData.password !== formData.confirmPassword) {
  setError('Passwords do not match');
  return;
}

// API CALL
const response = await api.post('/auth/register-reviewer/', {
  username: formData.username,
  email: formData.email,
  password: formData.password,
  first_name: formData.firstName,
  last_name: formData.lastName
  // Note: confirmPassword NOT sent
});

// ERROR HANDLING (DRF returns arrays)
if (errorData.email) {
  errorMessages.push(`Email: ${
    Array.isArray(errorData.email)
      ? errorData.email[0]  // Extract first error
      : errorData.email
  }`);
}
```

---

### 2. **PendingReviewers Component**
**File:** `frontend/src/features/admin/PendingReviewers.tsx`

**Route:** `/admin/pending-reviewers`

**Features:**
- ✅ Lists all pending reviewers
- ✅ Shows registration date
- ✅ **Approve button** (green)
- ✅ **Reject button** (red)
- ✅ Confirmation dialogs
- ✅ Loading states
- ✅ Empty state (when no pending reviewers)

**State Management:**
```typescript
const [pendingReviewers, setPendingReviewers] = useState<PendingReviewer[]>([]);
const [loading, setLoading] = useState(true);
const [processing, setProcessing] = useState<number | null>(null);
```

**Key Functions:**

**Approve Handler:**
```typescript
const handleApprove = async (reviewerId: number) => {
  // Confirmation dialog
  if (!confirm('Are you sure...')) return;

  // Set loading state
  setProcessing(reviewerId);

  // Call API
  await api.post(`/auth/approve-reviewer/${reviewerId}/`);

  // Remove from list (optimistic update)
  setPendingReviewers(prev => prev.filter(r => r.id !== reviewerId));

  // Show success message
  alert('Reviewer approved successfully!');
};
```

**Reject Handler:**
```typescript
const handleReject = async (reviewerId: number) => {
  // Strong warning for destructive action
  if (!confirm('Delete permanently?')) return;

  // Delete user
  await api.delete(`/auth/reject-reviewer/${reviewerId}/`);

  // Remove from list
  setPendingReviewers(prev => prev.filter(r => r.id !== reviewerId));
};
```

---

### 3. **Login Component (Enhanced)**
**File:** `frontend/src/features/auth/Login.tsx`

**Changes Made:**
```typescript
// BEFORE: Generic error
catch (error) {
  alert('Login failed. Please check your credentials.');
}

// AFTER: Specific error messages
catch (error: any) {
  const errorMessage =
    error.response?.data?.non_field_errors?.[0] ||  // "Account disabled"
    error.response?.data?.password?.[0] ||          // "Invalid password"
    error.response?.data?.email?.[0] ||             // "Email not found"
    error.response?.data?.detail ||                 // Generic detail
    'Login failed. Please check your credentials.'; // Fallback

  alert(errorMessage);
}
```

**Result:** Users with pending accounts see "This user account has been disabled" instead of generic error.

---

## 📡 API Endpoints

### Summary Table

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register-reviewer/` | ❌ None | Public registration |
| GET | `/api/auth/pending-reviewers/` | ✅ Admin | List pending reviewers |
| POST | `/api/auth/approve-reviewer/<id>/` | ✅ Admin | Approve reviewer |
| DELETE | `/api/auth/reject-reviewer/<id>/` | ✅ Admin | Reject reviewer |

### Detailed Documentation

#### 1. **Public Registration**
```http
POST /api/auth/register-reviewer/
Content-Type: application/json

{
  "username": "jane.reviewer",
  "email": "jane@nsu.edu",
  "password": "SecurePass123!",
  "first_name": "Jane",
  "last_name": "Reviewer"
}

# Success Response (201 Created)
{
  "id": 5,
  "username": "jane.reviewer",
  "email": "jane@nsu.edu",
  "first_name": "Jane",
  "last_name": "Reviewer"
}

# Error Response (400 Bad Request)
{
  "email": ["A user with this email already exists."],
  "username": ["A user with this username already exists."],
  "password": ["This password is too common."]
}
```

#### 2. **List Pending Reviewers**
```http
GET /api/auth/pending-reviewers/
Authorization: Token abc123...

# Success Response (200 OK)
[
  {
    "id": 5,
    "username": "jane.reviewer",
    "email": "jane@nsu.edu",
    "full_name": "Jane Reviewer",
    "role": "Reviewer",
    "is_active": false,
    "date_joined": "2026-02-12T10:30:00Z"
  }
]
```

#### 3. **Approve Reviewer**
```http
POST /api/auth/approve-reviewer/5/
Authorization: Token abc123...

# Success Response (200 OK)
{
  "message": "Reviewer approved successfully.",
  "user": {
    "id": 5,
    "username": "jane.reviewer",
    "email": "jane@nsu.edu",
    "is_active": true,
    "role": "Reviewer"
  }
}

# Error Response (400 Bad Request)
{
  "error": "Reviewer is already approved."
}
```

#### 4. **Reject Reviewer**
```http
DELETE /api/auth/reject-reviewer/5/
Authorization: Token abc123...

# Success Response (200 OK)
{
  "message": "Reviewer registration rejected."
}

# Error Response (400 Bad Request)
{
  "error": "Cannot reject an active reviewer."
}
```

---

## 💾 Database Schema

### User Model
```python
class User(AbstractUser):
    email = models.EmailField(unique=True)
    expertise_tags = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)  # Set to False for pending
    date_joined = models.DateTimeField(auto_now_add=True)  # From AbstractUser

    # Inherited from AbstractUser:
    # - username
    # - password
    # - first_name
    # - last_name
    # - is_staff
```

### ReviewerProfile Model
```python
class ReviewerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    area_of_expertise = models.TextField()
    max_review_load = models.IntegerField(default=5)
    is_active_reviewer = models.BooleanField(default=True)  # Set to False for pending
```

### Group Membership
```python
# Django's built-in Groups
Group.name = "Reviewer"  # Role assignment
user.groups.add(group)    # Assign user to group
```

---

## 📝 Code Comments Guide

All code files have been enhanced with comprehensive comments following this structure:

### Comment Levels

#### 1. **File-Level Documentation**
```python
"""
============================================================================
FILE NAME / PURPOSE
============================================================================

PURPOSE: Brief description of what this file does

WORKFLOW: Step-by-step explanation

BUSINESS RULES: Key constraints and requirements

SECURITY: Authentication/permission details

API ENDPOINTS USED: List of endpoints
"""
```

#### 2. **Class-Level Documentation**
```python
class ReviewerRegistrationSerializer(serializers.ModelSerializer):
    """
    ============================================================================
    CLASS NAME
    ============================================================================

    PURPOSE: What this class does

    FIELDS: List of fields

    VALIDATION: Validation rules

    EXAMPLE: Request/response examples
    """
```

#### 3. **Section Headers**
```python
# ========================================================================
# SECTION NAME (e.g., STATE MANAGEMENT, ERROR HANDLING)
# ========================================================================
```

#### 4. **Inline Comments**
```python
# Explanation of WHY, not WHAT
# Clarify business logic
# Note edge cases
```

---

## 🧪 Testing

### Automated Test Suite
**File:** `backend/scripts/reviewer_registration_debug.py`

**Run:** `python scripts/reviewer_registration_debug.py`

**Tests:**
1. ✅ Inactive reviewer account creation
2. ✅ Inactive user authentication blocking
3. ✅ Pending reviewers query
4. ✅ Reviewer approval process
5. ✅ Approved user authentication
6. ✅ Pending reviewers count verification

---

## 🔒 Security Considerations

### Public Registration Endpoint
✅ **Safe because:**
- Accounts start inactive
- Cannot login until approved
- Password is hashed (Django validators)
- Email/username uniqueness enforced

### Admin Approval Endpoint
✅ **Protected by:**
- `IsAdminUser` permission (requires is_staff=True)
- Token authentication required
- Cannot approve already-active users
- Cannot approve non-reviewers

### Rejection Endpoint
✅ **Safety features:**
- Cannot delete active reviewers (critical!)
- Confirmation dialog in frontend
- Admin-only access
- Destructive action clearly communicated

---

## 📚 Additional Resources

- [BUG_FIXES_REPORT.md](BUG_FIXES_REPORT.md) - List of bugs found and fixed
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions
- [README.md](README.md) - Project overview

---

**Last Updated:** 2026-02-12
**Version:** 1.0
**Author:** CTRG Development Team
