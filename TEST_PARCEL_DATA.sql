# Test Data for Parcels Table

## Step 1: Check your merchant_id
First, find your merchant ID from merchant_companies table:
```sql
SELECT id, business_name, email FROM merchant_companies;
```

## Step 2: Insert Test Parcels
Replace `MERCHANT_ID_HERE` with your actual merchant ID (e.g., 1, 2, 3)

```sql
-- Test Parcel 1 (Pending)
INSERT INTO parcels (
    tracking_code, 
    merchant_id, 
    merchant_name,
    sender_name,
    sender_phone,
    sender_address,
    receiver_name, 
    receiver_phone,
    receiver_address,
    receiver_city,
    parcel_weight,
    parcel_type,
    delivery_charges,
    status,
    created_at,
    updated_at
) VALUES (
    'TRK1234567890',
    MERCHANT_ID_HERE,
    'Test Business',
    'Ali Ahmed',
    '03001234567',
    'Shop 123, Main Market, Karachi',
    'Hassan Khan',
    '03009876543',
    'House 456, Block A, Gulshan',
    'Karachi',
    2.5,
    'Electronics',
    500,
    'pending',
    NOW(),
    NOW()
);

-- Test Parcel 2 (In Transit)
INSERT INTO parcels (
    tracking_code, 
    merchant_id, 
    merchant_name,
    sender_name,
    sender_phone,
    sender_address,
    receiver_name, 
    receiver_phone,
    receiver_address,
    receiver_city,
    parcel_weight,
    parcel_type,
    delivery_charges,
    status,
    created_at,
    updated_at
) VALUES (
    'TRK1234567891',
    MERCHANT_ID_HERE,
    'Test Business',
    'Sara Ali',
    '03111234567',
    'Shop 789, Saddar, Karachi',
    'Fatima Noor',
    '03119876543',
    'Flat 12, DHA Phase 5',
    'Karachi',
    1.2,
    'Clothing',
    300,
    'in_transit',
    NOW(),
    NOW()
);

-- Test Parcel 3 (Delivered)
INSERT INTO parcels (
    tracking_code, 
    merchant_id, 
    merchant_name,
    sender_name,
    sender_phone,
    sender_address,
    receiver_name, 
    receiver_phone,
    receiver_address,
    receiver_city,
    parcel_weight,
    parcel_type,
    delivery_charges,
    status,
    created_at,
    updated_at
) VALUES (
    'TRK1234567892',
    MERCHANT_ID_HERE,
    'Test Business',
    'Ahmed Raza',
    '03221234567',
    'Office 5, I.I. Chundrigar Road',
    'Bilal Shah',
    '03229876543',
    'House 789, Clifton Block 8',
    'Karachi',
    3.0,
    'Documents',
    200,
    'delivered',
    NOW(),
    NOW()
);

-- Test Parcel 4 (Pending)
INSERT INTO parcels (
    tracking_code, 
    merchant_id, 
    merchant_name,
    sender_name,
    sender_phone,
    sender_address,
    receiver_name, 
    receiver_phone,
    receiver_address,
    receiver_city,
    parcel_weight,
    parcel_type,
    delivery_charges,
    status,
    created_at,
    updated_at
) VALUES (
    'TRK1234567893',
    MERCHANT_ID_HERE,
    'Test Business',
    'Zainab Khan',
    '03331234567',
    'Shop 22, Tariq Road',
    'Usman Ali',
    '03339876543',
    'Apartment 45, Gulistan-e-Johar',
    'Karachi',
    0.5,
    'Books',
    150,
    'pending',
    NOW(),
    NOW()
);

-- Test Parcel 5 (In Transit)
INSERT INTO parcels (
    tracking_code, 
    merchant_id, 
    merchant_name,
    sender_name,
    sender_phone,
    sender_address,
    receiver_name, 
    receiver_phone,
    receiver_address,
    receiver_city,
    parcel_weight,
    parcel_type,
    delivery_charges,
    status,
    created_at,
    updated_at
) VALUES (
    'TRK1234567894',
    MERCHANT_ID_HERE,
    'Test Business',
    'Kamran Malik',
    '03441234567',
    'Warehouse 3, SITE Area',
    'Ayesha Siddiqui',
    '03449876543',
    'Villa 12, Defence Phase 6',
    'Karachi',
    5.0,
    'Furniture Parts',
    800,
    'in_transit',
    NOW(),
    NOW()
);
```

## Step 3: Verify Data
```sql
SELECT * FROM parcels WHERE merchant_id = MERCHANT_ID_HERE;
```

## Quick Test (All in One)
If your merchant_id is 1, run this:
```sql
INSERT INTO parcels (tracking_code, merchant_id, merchant_name, sender_name, sender_phone, sender_address, receiver_name, receiver_phone, receiver_address, receiver_city, parcel_weight, parcel_type, delivery_charges, status, created_at, updated_at) VALUES 
('TRK1001', 1, 'Test Shop', 'Ali', '0300111', 'Address 1', 'Hassan', '0300222', 'Delivery 1', 'Karachi', 2, 'Electronics', 500, 'pending', NOW(), NOW()),
('TRK1002', 1, 'Test Shop', 'Sara', '0300333', 'Address 2', 'Fatima', '0300444', 'Delivery 2', 'Karachi', 1, 'Clothing', 300, 'in_transit', NOW(), NOW()),
('TRK1003', 1, 'Test Shop', 'Ahmed', '0300555', 'Address 3', 'Bilal', '0300666', 'Delivery 3', 'Karachi', 3, 'Documents', 200, 'delivered', NOW(), NOW());
```

## Note:
- Replace `MERCHANT_ID_HERE` with actual merchant ID
- Make sure `parcels` table exists
- Column names should match your database schema
