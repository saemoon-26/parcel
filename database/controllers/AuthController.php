<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RiderRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\HasApiTokens;

class AuthController extends Controller
{
    public function riderLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Find rider by email
        $rider = RiderRegistration::where('email', $request->email)->first();

        if (!$rider) {
            return response()->json([
                'success' => false,
                'message' => 'No registration found with this email'
            ], 404);
        }

        // Check if rider is approved
        if ($rider->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Account not approved yet',
                'status' => $rider->status,
                'rejection_reason' => $rider->rejection_reason
            ], 401);
        }

        // For now, use simple password check (you should hash passwords in production)
        if ($request->password !== '123456') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Create token (if using Sanctum)
        $token = 'rider_token_' . $rider->id . '_' . time();

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'rider' => [
                'id' => $rider->id,
                'full_name' => $rider->full_name,
                'email' => $rider->email,
                'mobile_primary' => $rider->mobile_primary,
                'status' => $rider->status,
                'city' => $rider->city,
                'vehicle_type' => $rider->vehicle_type
            ]
        ]);
    }

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

        $rider = RiderRegistration::where('email', $request->email)->first();

        if (!$rider) {
            return response()->json([
                'success' => false,
                'status' => 'not_found',
                'message' => 'No registration found with this email'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'status' => $rider->status,
            'message' => $this->getStatusMessage($rider->status),
            'rejection_reason' => $rider->rejection_reason,
            'rider' => [
                'full_name' => $rider->full_name,
                'email' => $rider->email,
                'submitted_at' => $rider->created_at,
                'updated_at' => $rider->updated_at
            ]
        ]);
    }

    private function getStatusMessage($status)
    {
        switch ($status) {
            case 'pending':
                return 'Your registration is under review';
            case 'approved':
                return 'Your registration is approved. You can login now';
            case 'rejected':
                return 'Your registration was rejected';
            default:
                return 'Unknown status';
        }
    }
}