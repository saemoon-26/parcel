<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RiderRegistrationController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes for Rider Registration
|--------------------------------------------------------------------------
*/

Route::prefix('api')->group(function () {
    
    // Authentication routes (public)
    Route::post('/rider/login', [AuthController::class, 'riderLogin']);
    Route::post('/rider/check-status', [AuthController::class, 'checkStatus']);
    
    // Public routes (no authentication required)
    Route::post('/rider-registrations', [RiderRegistrationController::class, 'store']);
    
    // Protected routes (require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        
        // Get all registrations with filters
        Route::get('/rider-registrations', [RiderRegistrationController::class, 'index']);
        
        // Get specific registration
        Route::get('/rider-registrations/{id}', [RiderRegistrationController::class, 'show']);
        
        // Approve registration
        Route::post('/rider-registrations/{id}/approve', [RiderRegistrationController::class, 'approve']);
        
        // Reject registration
        Route::post('/rider-registrations/{id}/reject', [RiderRegistrationController::class, 'reject']);
        
        // Update status
        Route::patch('/rider-registrations/{id}/status', [RiderRegistrationController::class, 'updateStatus']);
        
        // Get documents
        Route::get('/rider-registrations/{id}/documents', [RiderRegistrationController::class, 'getDocuments']);
        
    });
});

/*
|--------------------------------------------------------------------------
| Example API Usage
|--------------------------------------------------------------------------
|
| POST /api/rider-registrations
| - Submit new rider registration with documents
| - Content-Type: multipart/form-data
| - Fields: all form fields + file uploads
|
| GET /api/rider-registrations
| - Get all registrations (paginated)
| - Query params: ?status=pending&city=Karachi&search=john
|
| GET /api/rider-registrations/{id}
| - Get specific registration details
|
| POST /api/rider-registrations/{id}/approve
| - Approve a registration
|
| POST /api/rider-registrations/{id}/reject
| - Reject a registration
| - Body: {"reason": "Documents not clear"}
|
| GET /api/rider-registrations/{id}/documents
| - Get all document URLs for a registration
|
*/