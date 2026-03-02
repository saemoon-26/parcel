# Laravel Backend - Delivery Request Email API

## Add this route in routes/api.php:

```php
Route::post('/merchant/request-delivery', [MerchantController::class, 'requestDelivery']);
```

## Add this method in MerchantController.php:

```php
use Illuminate\Support\Facades\Mail;

public function requestDelivery(Request $request)
{
    try {
        $merchantId = $request->merchant_id;
        $merchantName = $request->merchant_name;
        $merchantEmail = $request->merchant_email;
        $merchantPhone = $request->merchant_phone;
        $pendingParcels = $request->pending_parcels;
        
        // Admin email (change this to your admin email)
        $adminEmail = 'admin@parceldelivery.com';
        
        // Email content
        $emailData = [
            'subject' => 'Delivery Request from ' . $merchantName,
            'merchant_name' => $merchantName,
            'merchant_email' => $merchantEmail,
            'merchant_phone' => $merchantPhone,
            'merchant_id' => $merchantId,
            'pending_parcels' => $pendingParcels,
            'message' => "I want to deliver my parcels. Please arrange pickup for my pending parcels."
        ];
        
        // Send email
        Mail::send('emails.delivery-request', $emailData, function($message) use ($adminEmail, $merchantName) {
            $message->to($adminEmail)
                    ->subject('Delivery Request from ' . $merchantName);
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Delivery request sent successfully'
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to send request: ' . $e->getMessage()
        ], 500);
    }
}
```

## Create email template: resources/views/emails/delivery-request.blade.php

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { background: white; padding: 30px; margin-top: 20px; border-radius: 5px; }
        .info-row { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 3px; }
        .label { font-weight: bold; color: #667eea; }
        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📦 Parcel Delivery Request</h2>
        </div>
        
        <div class="content">
            <h3>New Delivery Request</h3>
            <p>{{ $message }}</p>
            
            <div class="info-row">
                <span class="label">Merchant Name:</span> {{ $merchant_name }}
            </div>
            
            <div class="info-row">
                <span class="label">Merchant ID:</span> {{ $merchant_id }}
            </div>
            
            <div class="info-row">
                <span class="label">Email:</span> {{ $merchant_email }}
            </div>
            
            <div class="info-row">
                <span class="label">Phone:</span> {{ $merchant_phone }}
            </div>
            
            <div class="info-row">
                <span class="label">Pending Parcels:</span> {{ $pending_parcels }}
            </div>
            
            <p style="margin-top: 20px;">
                Please arrange pickup for the merchant's pending parcels at your earliest convenience.
            </p>
        </div>
        
        <div class="footer">
            <p>This is an automated email from Parcel Management System</p>
        </div>
    </div>
</body>
</html>
```

## Configure Email in .env file:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="Parcel Management System"
```

## Note:
- Change admin email in controller
- For Gmail, use App Password (not regular password)
- Test email functionality before production
