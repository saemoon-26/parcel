# Backend APIs for Rider Authentication - UPDATED

## Required Database Changes

### 1. Update rider_registrations table
```sql
-- Add password column to existing table
ALTER TABLE rider_registrations ADD COLUMN password VARCHAR(255) AFTER email;
```

### 2. Create riders_auth table (for approved riders)
```sql
CREATE TABLE riders_auth (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT UNSIGNED,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile_primary VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES rider_registrations(id)
);
```

## Updated API Routes

### 1. Registration API (UPDATED)
**POST** `/api/rider-registrations`

**Request Body:** (Add password field)
```json
{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "mobile_primary": "03001234567",
    "father_name": "Father Name",
    "cnic_number": "12345-1234567-1",
    "address": "Address here",
    "city": "Karachi",
    "state": "Sindh",
    "vehicle_type": "Bike",
    "vehicle_brand": "Honda",
    "vehicle_registration": "ABC-123",
    "driving_license_number": "12345",
    // ... other fields + files
}
```

**Response Success (201):**
```json
{
    "success": true,
    "message": "Registration submitted successfully",
    "registration_id": 1
}
```

### 2. Approve Rider API (UPDATED)
**POST** `/api/rider-registrations/{id}/approve`

**New Logic:**
```php
public function approve($id)
{
    $registration = RiderRegistration::findOrFail($id);
    
    // Create login account for approved rider
    RiderAuth::create([
        'registration_id' => $registration->id,
        'full_name' => $registration->full_name,
        'email' => $registration->email,
        'mobile_primary' => $registration->mobile_primary,
        'password' => $registration->password, // Already hashed from registration
        'status' => 'active'
    ]);
    
    // Update registration status
    $registration->update(['status' => 'approved']);
    
    return response()->json([
        'success' => true,
        'message' => 'Rider approved and login access granted'
    ]);
}
```

### 3. NEW - Rider Login API
**POST** `/api/rider/login`

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "Login successful",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "rider": {
        "id": 1,
        "full_name": "John Doe",
        "email": "john@example.com",
        "mobile_primary": "03001234567",
        "status": "active"
    }
}
```

**Response Error (401):**
```json
{
    "success": false,
    "message": "Invalid credentials or account not approved"
}
```

### 4. NEW - Check Registration Status API
**POST** `/api/rider/check-status`

**Request Body:**
```json
{
    "email": "john@example.com"
}
```

**Response Success (200):**
```json
{
    "success": true,
    "status": "pending", // pending, approved, rejected
    "message": "Registration is under review",
    "registration_date": "2024-01-01T00:00:00Z",
    "rejection_reason": null // only if rejected
}
```

**Response Not Found (404):**
```json
{
    "success": false,
    "message": "No registration found with this email"
}
```

### 5. Email Notification System

**When Admin Approves:**
```php
// Send approval email
Mail::to($registration->email)->send(new RiderApprovedMail($registration));
```

**When Admin Rejects:**
```php
// Send rejection email
Mail::to($registration->email)->send(new RiderRejectedMail($registration, $reason));
```

## Updated Laravel Implementation

### 1. Update RiderRegistrationController.php
```php
public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'full_name' => 'required|string|max:255',
        'email' => 'required|email|unique:rider_registrations,email',
        'password' => 'required|string|min:6', // ADD THIS
        'mobile_primary' => 'required|string',
        // ... other validations
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $registration = RiderRegistration::create([
        'full_name' => $request->full_name,
        'email' => $request->email,
        'password' => Hash::make($request->password), // ADD THIS
        'mobile_primary' => $request->mobile_primary,
        // ... other fields
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Registration submitted successfully',
        'registration_id' => $registration->id
    ]);
}
```

### 3. Create RiderAuthController.php (UPDATED)
```php
<?php

namespace App\Http\Controllers;

use App\Models\RiderAuth;
use App\Models\RiderRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Tymon\JWTAuth\Facades\JWTAuth;

class RiderAuthController extends Controller
{
    public function checkStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $registration = RiderRegistration::where('email', $request->email)->first();
        
        if (!$registration) {
            return response()->json([
                'success' => false,
                'message' => 'No registration found with this email'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'status' => $registration->status ?? 'pending',
            'message' => $this->getStatusMessage($registration->status ?? 'pending'),
            'registration_date' => $registration->created_at,
            'rejection_reason' => $registration->rejection_reason ?? null
        ]);
    }

    private function getStatusMessage($status)
    {
        switch ($status) {
            case 'approved':
                return 'Your registration has been approved. You can now login.';
            case 'rejected':
                return 'Your registration was not approved.';
            case 'pending':
            default:
                return 'Your registration is under review.';
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if rider exists in riders_auth (approved riders only)
        $rider = RiderAuth::where('email', $request->email)->first();
        
        if (!$rider || !Hash::check($request->password, $rider->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials or account not approved'
            ], 401);
        }

        // Generate JWT token
        $token = JWTAuth::fromUser($rider);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'rider' => [
                'id' => $rider->id,
                'full_name' => $rider->full_name,
                'email' => $rider->email,
                'mobile_primary' => $rider->mobile_primary,
                'status' => $rider->status
            ]
        ]);
    }

    public function profile()
    {
        $rider = JWTAuth::user();
        
        return response()->json([
            'success' => true,
            'rider' => $rider
        ]);
    }
}
```

### 3. Create RiderAuth Model
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class RiderAuth extends Authenticatable implements JWTSubject
{
    protected $table = 'riders_auth';
    
    protected $fillable = [
        'registration_id',
        'full_name',
        'email', 
        'mobile_primary',
        'password',
        'status'
    ];

    protected $hidden = [
        'password'
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
    
    public function registration()
    {
        return $this->belongsTo(RiderRegistration::class, 'registration_id');
    }
}
```

### 4. Update routes/api.php
```php
// Existing registration route (updated to accept password)
Route::post('rider-registrations', [RiderRegistrationController::class, 'store']);
Route::post('rider-registrations/{id}/approve', [RiderRegistrationController::class, 'approve']);

// NEW - Rider authentication routes
Route::prefix('rider')->group(function () {
    Route::post('login', [RiderAuthController::class, 'login']);
    
    Route::middleware('jwt.auth')->group(function () {
        Route::get('profile', [RiderAuthController::class, 'profile']);
    });
});
```

## Summary of Changes

1. **Registration API** - Now accepts password field
2. **Approve API** - Creates entry in riders_auth table
3. **Login API** - New endpoint for rider login
4. **Profile API** - New endpoint for rider profile
5. **Database** - New riders_auth table for approved riders

**Flow:**
1. Registration → Saves password in rider_registrations
2. Admin Approval → Copies data to riders_auth table
3. Login → Uses riders_auth table for authentication