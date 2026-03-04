# Laravel Backend - Merchant Parcels API

## Add this route in routes/api.php:

```php
Route::get('/merchant/{merchantId}/parcels', [ParcelController::class, 'getMerchantParcels']);
```

## Add this method in ParcelController.php:

```php
public function getMerchantParcels($merchantId)
{
    try {
        $parcels = DB::table('parcels')
            ->where('merchant_id', $merchantId)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($parcels);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch parcels'], 500);
    }
}
```

## Note:
- Make sure 'parcels' table has 'merchant_id' column
- If table name is different, update accordingly
