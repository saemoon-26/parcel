-- Merchant Details Table with Approval System
USE parcel_delivery;

CREATE TABLE IF NOT EXISTS merchant_details (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Basic Info
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    
    -- Pickup Address
    full_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    
    -- Payment Details
    bank_name VARCHAR(100) NULL,
    account_number VARCHAR(50) NULL,
    
    -- Business Info
    product_type VARCHAR(255) NULL,
    avg_parcels_per_day INT DEFAULT 0,
    
    -- Documents
    business_document VARCHAR(500) NULL,
    
    -- Approval System
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT NULL,
    approved_at TIMESTAMP NULL,
    approved_by BIGINT UNSIGNED NULL,
    
    -- Additional Fields
    is_active BOOLEAN DEFAULT FALSE,
    total_parcels INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_approval_status (approval_status),
    INDEX idx_city (city),
    INDEX idx_phone (phone_number),
    
    -- Foreign Key
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample merchant data
INSERT INTO merchant_details (
    business_name, owner_name, email, phone_number, password,
    full_address, city, postal_code, bank_name, account_number,
    product_type, avg_parcels_per_day, approval_status
) VALUES 
('Tech Store', 'Ali Ahmed', 'ali@techstore.com', '03001234567', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'Shop 12, Main Market, Block A', 'Karachi', '75500', 'HBL', '12345678901234',
 'Electronics', 50, 'approved'),
 
('Fashion Hub', 'Sara Khan', 'sara@fashionhub.com', '03009876543', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'Plaza 5, Liberty Market', 'Lahore', '54000', 'UBL', '98765432109876',
 'Clothing', 30, 'pending');
