<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class MerchantRegistrationController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'email' => 'required|email|unique:merchant_details,email',
            'phone_number' => 'required|string|max:20',
            'password' => 'required|string|min:6',
            'full_address' => 'required|string',
            'city' => 'required|string|max:100',
            'postal_code' => 'required|string|max:10',
            'bank_name' => 'nullable|string|max:100',
            'account_number' => 'nullable|string|max:50',
            'product_type' => 'nullable|string|max:255',
            'avg_parcels_per_day' => 'nullable|integer',
            'business_document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = [
                'business_name' => $request->business_name,
                'owner_name' => $request->owner_name,
                'email' => $request->email,
                'phone_number' => $request->phone_number,
                'password' => Hash::make($request->password),
                'full_address' => $request->full_address,
                'city' => $request->city,
                'postal_code' => $request->postal_code,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'product_type' => $request->product_type,
                'avg_parcels_per_day' => $request->avg_parcels_per_day ?? 0,
                'approval_status' => 'pending',
                'is_active' => false
            ];

            if ($request->hasFile('business_document')) {
                $file = $request->file('business_document');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads/merchant_documents'), $filename);
                $data['business_document'] = 'uploads/merchant_documents/' . $filename;
            }

            $merchantId = DB::table('merchant_details')->insertGetId($data);

            return response()->json([
                'success' => true,
                'message' => 'Merchant registration submitted successfully',
                'data' => ['id' => $merchantId]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $query = DB::table('merchant_details');

        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }

        if ($request->has('city')) {
            $query->where('city', $request->city);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $merchants = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $merchants
        ]);
    }

    public function show($id)
    {
        $merchant = DB::table('merchant_details')->where('id', $id)->first();

        if (!$merchant) {
            return response()->json([
                'success' => false,
                'message' => 'Merchant not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $merchant
        ]);
    }

    public function approve($id)
    {
        try {
            DB::table('merchant_details')
                ->where('id', $id)
                ->update([
                    'approval_status' => 'approved',
                    'is_active' => true,
                    'approved_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Merchant approved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Approval failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::table('merchant_details')
                ->where('id', $id)
                ->update([
                    'approval_status' => 'rejected',
                    'rejection_reason' => $request->reason,
                    'is_active' => false
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Merchant rejected'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rejection failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
