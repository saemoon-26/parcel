# Authentication Setup Instructions

## Mock Mode Ko Real Authentication Mein Convert Karne Ke Steps:

### 1. Backend Server Start Karein:
```bash
# Laravel server start karein (port 8000 pe)
cd database
php artisan serve --port=8000
```

### 2. Database Setup:
```bash
# Database migrations run karein
php artisan migrate

# Agar Laravel nahi hai to manual SQL run karein:
# MySQL mein rider_registrations table create karein
```

### 3. Test Karne Ke Liye:

#### A) Pehle Rider Register Karein:
- `/rider/register` pe jayen
- Form fill karein
- Registration submit karein

#### B) Admin Se Approval Lein:
- Database mein rider ka status 'approved' karein:
```sql
UPDATE rider_registrations 
SET status = 'approved' 
WHERE email = 'your-email@example.com';
```

#### C) Login Karein:
- Email: jo register kiya tha
- Password: 123456 (default for testing)

### 4. Production Ke Liye:
- Password hashing implement karein
- JWT tokens use karein
- Proper validation add karein
- CORS setup karein

### 5. Current Status:
✅ Mock code removed
✅ Real API endpoints created
✅ Authentication controller ready
✅ Status check functionality
⚠️ Backend server running hona chahiye
⚠️ Database setup hona chahiye

### Troubleshooting:
- Agar "Network Error" aaye to backend server check karein
- Agar "404" aaye to routes check karein
- Database connection issues ke liye .env file check karein