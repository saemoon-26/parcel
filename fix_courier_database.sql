USE courier;

CREATE TABLE IF NOT EXISTS rider_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Personal Information
    full_name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    cnic_number VARCHAR(20),
    mobile_primary VARCHAR(15) NOT NULL,
    mobile_alternate VARCHAR(15),
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    
    -- Vehicle Information
    vehicle_type ENUM('Bike', 'Car', 'Van') NOT NULL,
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_registration VARCHAR(50),
    
    -- Documents (file paths)
    profile_picture VARCHAR(500),
    vehicle_registration_book VARCHAR(500),
    vehicle_image VARCHAR(500),
    cnic_front_image VARCHAR(500),
    cnic_back_image VARCHAR(500),
    driving_license_number VARCHAR(50),
    driving_license_image VARCHAR(500),
    electricity_bill VARCHAR(500),
    
    -- Bank Information
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    account_title VARCHAR(255),
    per_parcel_payout DECIMAL(10,2),
    
    -- Location Information
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Pakistan',
    zipcode VARCHAR(10) DEFAULT '00000',
    
    -- Status and Timestamps
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_mobile (mobile_primary),
    INDEX idx_email (email),
    INDEX idx_cnic (cnic_number),
    INDEX idx_status (status),
    INDEX idx_city (city)
);