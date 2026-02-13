<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RiderRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class RiderRegistrationController extends Controller
{
    public function index(Request $request)
    {
        $query = RiderRegistration::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by city
        if ($request->has('city')) {
            $query->where('city', $request->city);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('mobile_primary', 'like', "%{$search}%");
            });
        }

        $registrations = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $registrations
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'full_name' => 'required|string|max:255',
            'father_name' => 'required|string|max:255',
            'cnic_number' => 'required|string|unique:rider_registrations,cnic_number',
            'mobile_primary' => 'required|string|max:20',
            'email' => 'required|email|unique:rider_registrations,email',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'vehicle_type' => 'required|string|in:Bike,Car,Van',
            'vehicle_brand' => 'required|string|max:100',
            'vehicle_model' => 'required|string|max:100',
            'vehicle_registration' => 'required|string|unique:rider_registrations,vehicle_registration',
            'driving_license_number' => 'required|string|max:50',
            
            // File validations
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'vehicle_registration_book' => 'nullable|image|mimes:jpeg,png,jpg,pdf|max:5120',
            'vehicle_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'cnic_front_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'cnic_back_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'driving_license_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'electricity_bill' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->except(['profile_picture', 'vehicle_registration_book', 'vehicle_image', 
                                    'cnic_front_image', 'cnic_back_image', 'driving_license_image', 'electricity_bill']);

            // Handle file uploads
            $fileFields = [
                'profile_picture',
                'vehicle_registration_book',
                'vehicle_image',
                'cnic_front_image',
                'cnic_back_image',
                'driving_license_image',
                'electricity_bill'
            ];

            foreach ($fileFields as $field) {
                if ($request->hasFile($field)) {
                    $file = $request->file($field);
                    $filename = time() . '_' . $field . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs('rider_documents', $filename, 'public');
                    $data[$field] = $path;
                }
            }

            $registration = RiderRegistration::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Registration submitted successfully',
                'data' => $registration
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $registration = RiderRegistration::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $registration
        ]);
    }

    public function approve(Request $request, $id)
    {
        $registration = RiderRegistration::findOrFail($id);
        
        $registration->approve($request->user()->id ?? null);

        return response()->json([
            'success' => true,
            'message' => 'Registration approved successfully',
            'data' => $registration->fresh()
        ]);
    }

    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $registration = RiderRegistration::findOrFail($id);
        $registration->reject($request->reason);

        return response()->json([
            'success' => true,
            'message' => 'Registration rejected',
            'data' => $registration->fresh()
        ]);
    }

    public function getDocuments($id)
    {
        $registration = RiderRegistration::findOrFail($id);
        
        $documents = [
            'profile_picture' => $registration->profile_picture_url,
            'vehicle_registration_book' => $registration->vehicle_registration_book_url,
            'vehicle_image' => $registration->vehicle_image_url,
            'cnic_front_image' => $registration->cnic_front_image_url,
            'cnic_back_image' => $registration->cnic_back_image_url,
            'driving_license_image' => $registration->driving_license_image_url,
            'electricity_bill' => $registration->electricity_bill_url,
        ];

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }
}