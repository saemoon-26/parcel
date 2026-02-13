-- Corrected SQL based on actual form fields
-- Copy paste this in phpMyAdmin SQL tab

USE courier;

CREATE TABLE rider_registrations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Personal Information (as per form)
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
    driving_license_number VARCHAR(50) NOT NULL,
    
    -- Bank Information (Optional)
    bank_name VARCHAR(100) NULL,
    account_number VARCHAR(50) NULL,
    account_title VARCHAR(255) NULL,
    per_parcel_payout DECIMAL(8,2) NULL,
    
    -- Document Storage
    profile_picture VARCHAR(500) NULL,
    vehicle_registration_book VARCHAR(500) NULL,
    vehicle_image VARCHAR(500) NULL,
    cnic_front_image VARCHAR(500) NULL,
    cnic_back_image VARCHAR(500) NULL,
    driving_license_image VARCHAR(500) NULL,
    electricity_bill VARCHAR(500) NULL,
    
    -- Status Management
    status ENUM('pending', 'approved', 'rejected', 'under_review') DEFAULT 'pending',
    rejection_reason TEXT NULL,
    approved_at TIMESTAMP NULL,
    approved_by BIGINT UNSIGNED NULL,
    is_active BOOLEAN DEFAULT FALSE,
    documents_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_deliveries INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);