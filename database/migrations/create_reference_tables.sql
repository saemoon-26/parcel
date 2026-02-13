-- Reference Tables for Dropdown Data

-- Cities Table
CREATE TABLE cities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    state_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- States Table  
CREATE TABLE states (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Brands Table
CREATE TABLE vehicle_brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert States
INSERT INTO states (name) VALUES 
('Punjab'),
('Sindh'), 
('Khyber Pakhtunkhwa'),
('Balochistan'),
('Gilgit-Baltistan'),
('Azad Kashmir'),
('Islamabad Capital Territory');

-- Insert Cities
INSERT INTO cities (name, state_id) VALUES 
('Karachi', 2),
('Lahore', 1),
('Islamabad', 7),
('Rawalpindi', 1),
('Faisalabad', 1),
('Multan', 1),
('Peshawar', 3),
('Quetta', 4),
('Sialkot', 1),
('Gujranwala', 1);

-- Insert Vehicle Brands
INSERT INTO vehicle_brands (name) VALUES 
('Honda'),
('Suzuki'),
('Toyota'),
('Yamaha'),
('KTM'),
('United'),
('Changan'),
('Hyundai'),
('Kia'),
('Daihatsu');