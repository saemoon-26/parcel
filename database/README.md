# Rider Registration Database Setup

## Database Structure

Complete database schema for rider registration system with document management.

## Files Created

1. **Migration**: `migrations/2024_01_01_000001_create_rider_registrations_table.php`
2. **Model**: `models/RiderRegistration.php`
3. **Controller**: `controllers/RiderRegistrationController.php`
4. **Routes**: `routes/api.php`
5. **SQL Schema**: `schema.sql`

## Database Setup

### Option 1: Using SQL File
```sql
mysql -u root -p < database/schema.sql
```

### Option 2: Laravel Migration (if using Laravel)
```bash
php artisan migrate
```

## Table Structure

### rider_registrations
- **Personal Info**: name, father_name, cnic, mobile, email, address
- **Vehicle Info**: type, brand, model, registration
- **Documents**: 7 file upload fields
- **Status**: pending/approved/rejected/under_review
- **Additional**: rating, deliveries, timestamps

## API Endpoints

### Public Routes
- `POST /api/rider-registrations` - Submit registration

### Protected Routes (Admin)
- `GET /api/rider-registrations` - List all registrations
- `GET /api/rider-registrations/{id}` - Get specific registration
- `POST /api/rider-registrations/{id}/approve` - Approve registration
- `POST /api/rider-registrations/{id}/reject` - Reject registration
- `GET /api/rider-registrations/{id}/documents` - Get document URLs

## Document Storage

Documents are stored in `storage/app/public/rider_documents/` with naming:
```
{timestamp}_{field_name}_{original_filename}
```

## Frontend Integration

Your React form already sends data to:
```javascript
axios.post('http://127.0.0.1:8000/api/rider-registrations', formData)
```

## Required Laravel Packages

```bash
composer require laravel/sanctum  # For API authentication
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

## Storage Setup

```bash
php artisan storage:link  # Create symbolic link for file access
```

## Environment Variables

Add to `.env`:
```
FILESYSTEM_DISK=public
```

## Usage Example

### Submit Registration
```javascript
const formData = new FormData()
formData.append('full_name', 'Ahmed Ali')
formData.append('email', 'ahmed@example.com')
formData.append('profile_picture', fileObject)
// ... other fields

axios.post('/api/rider-registrations', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

### Get Registrations (Admin)
```javascript
axios.get('/api/rider-registrations?status=pending&city=Karachi')
```

### Approve Registration
```javascript
axios.post('/api/rider-registrations/1/approve')
```

## Document Access

Documents are accessible via:
```
http://your-domain/storage/rider_documents/{filename}
```

## Security Features

- File type validation (images/PDF only)
- File size limits (2MB for images, 5MB for documents)
- Unique constraints on email, CNIC, vehicle registration
- Status-based access control
- Document URL generation with proper paths

## Database Indexes

Optimized queries with indexes on:
- status + created_at
- city + status  
- is_active + status
- email, mobile, cnic (unique fields)

This setup handles all your registration form fields and provides complete document management with secure file storage.