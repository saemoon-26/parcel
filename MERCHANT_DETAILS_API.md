# Laravel Backend - Merchant Details API

## Add this route in routes/api.php (if not already exists):

```php
Route::get('/merchants/{id}', [MerchantController::class, 'show']);
```

## Make sure this method exists in MerchantController.php:

```php
public function show($id)
{
    try {
        $merchant = DB::table('merchant_companies')
            ->where('id', $id)
            ->first();
        
        if (!$merchant) {
            return response()->json(['error' => 'Merchant not found'], 404);
        }
        
        // Format response to match frontend expectations
        $response = [
            'id' => $merchant->id,
            'first_name' => $merchant->owner_name ? explode(' ', $merchant->owner_name)[0] : '',
            'last_name' => $merchant->owner_name ? (explode(' ', $merchant->owner_name)[1] ?? '') : '',
            'email' => $merchant->email,
            'phone' => $merchant->phone_number,
            'company' => [
                'company_name' => $merchant->business_name,
                'product_type' => $merchant->product_type,
                'avg_parcels_per_day' => $merchant->avg_parcels_per_day,
                'bank_name' => $merchant->bank_name,
                'account_number' => $merchant->account_number,
                'business_document' => $merchant->business_document,
                'address' => $merchant->full_address
            ],
            'address' => [
                'city' => $merchant->city,
                'address' => $merchant->full_address
            ],
            'approval_status' => $merchant->approval_status
        ];
        
        return response()->json(['data' => $response]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch merchant'], 500);
    }
}
```

## Note:
- This endpoint returns full merchant details including company and address info
- Frontend will use this to populate the dashboard profile section
