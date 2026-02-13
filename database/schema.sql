-- Rider Registration Database Schema
-- This SQL file creates the complete database structure for rider registrations

CREATE DATABASE IF NOT EXISTS parcel_delivery;
USE parcel_delivery;

-- Create rider_registrations table
CREATE TABLE rider_registrations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Personal Information
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255) NOT NULL,
    cnic_number VARCHAR(20) NOT NULL UNIQUE,
    mobile_primary VARCHAR(20) NOT NULL,
    mobile_alternate VARCHAR(20) NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Pakistan',
    zipcode VARCHAR(10) DEFAULT '00000',
    
    -- Vehicle Information
    vehicle_type ENUM('Bike', 'Car', 'Van') NOT NULL,
    vehicle_brand VARCHAR(100) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_registration VARCHAR(50) NOT NULL UNIQUE,
    
    -- License Information
    driving_license_number VARCHAR(50) NOT NULL,
    
    -- Bank Information (Optional)
    bank_name VARCHAR(100) NULL,
    account_number VARCHAR(50) NULL,
    account_title VARCHAR(255) NULL,
    
    -- Payout Information
    per_parcel_payout DECIMAL(8,2) NULL,
    
    -- Document Paths (File Storage)
    profile_picture VARCHAR(500) NULL,
    vehicle_registration_book VARCHAR(500) NULL,
    vehicle_image VARCHAR(500) NULL,
    cnic_front_image VARCHAR(500) NULL,
    cnic_back_image VARCHAR(500) NULL,
    driving_license_image VARCHAR(500) NULL,
    electricity_bill VARCHAR(500) NULL,
    
    -- Status and Approval
    status ENUM('pending', 'approved', 'rejected', 'under_review') DEFAULT 'pending',
    rejection_reason TEXT NULL,
    approved_at TIMESTAMP NULL,
    approved_by BIGINT UNSIGNED NULL,
    
    -- Additional Fields
    is_active BOOLEAN DEFAULT FALSE,
    documents_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_deliveries INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_status_created (status, created_at),
    INDEX idx_city_status (city, status),
    INDEX idx_active_status (is_active, status),
    INDEX idx_email (email),
    INDEX idx_mobile (mobile_primary),
    INDEX idx_cnic (cnic_number)
);

-- Create users table (if not exists) for admin approval tracking
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add foreign key constraint
ALTER TABLE rider_registrations 
ADD CONSTRAINT fk_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Insert sample admin user (password: 'password' - change in production)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@parcel.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Sample data for testing (optional)
INSERT INTO rider_registrations (
    first_name, last_name, full_name, father_name, cnic_number, 
    mobile_primary, email, address, city, state, 
    vehicle_type, vehicle_brand, vehicle_model, vehicle_registration, 
    driving_license_number, status
) VALUES 
('Ahmed', 'Ali', 'Ahmed Ali', 'Muhammad Ali', '12345-1234567-1', 
 '03001234567', 'ahmed@example.com', 'House 123, Street 1, Block A', 'Karachi', 'Sindh',
 'Bike', 'Honda', 'CD 70', 'KHI-123', 'DL123456', 'pending'),
 
('Sara', 'Khan', 'Sara Khan', 'Imran Khan', '12345-1234567-2', 
 '03001234568', 'sara@example.com', 'House 456, Street 2, Block B', 'Lahore', 'Punjab',
 'Car', 'Toyota', 'Corolla', 'LHR-456', 'DL123457', 'approved');

-- Create view for active riders
CREATE VIEW active_riders AS
SELECT 
    id, full_name, email, mobile_primary, city, vehicle_type, 
    vehicle_brand, vehicle_model, rating, total_deliveries, created_at
FROM rider_registrations 
WHERE status = 'approved' AND is_active = TRUE;

-- Create view for pending registrations
CREATE VIEW pending_registrations AS
SELECT 
    id, full_name, email, mobile_primary, city, vehicle_type, 
    created_at, 
    CASE 
        WHEN profile_picture IS NOT NULL AND vehicle_registration_book IS NOT NULL 
             AND cnic_front_image IS NOT NULL AND cnic_back_image IS NOT NULL 
             AND driving_license_image IS NOT NULL AND electricity_bill IS NOT NULL 
        THEN 'Complete' 
        ELSE 'Incomplete' 
    END as document_status
FROM rider_registrations 
WHERE status = 'pending'
ORDER BY created_at DESC;