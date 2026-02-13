-- Manually enable tracking for testing
UPDATE parcel 
SET tracking_active = 1, parcel_status = 'out_for_delivery' 
WHERE tracking_code = 'TRK-26907CB8';

-- Insert fake rider location for testing
INSERT INTO rider_locations (rider_id, parcel_id, latitude, longitude, recorded_at)
SELECT assigned_to, parcel_id, 31.4180, 73.0790, NOW()
FROM parcel 
WHERE tracking_code = 'TRK-26907CB8';
