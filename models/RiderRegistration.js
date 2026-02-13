const { pool } = require('../database/config/database');

class RiderRegistration {
  static async create(riderData) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO rider_registrations (
          full_name, father_name, cnic_number, mobile_primary, mobile_alternate,
          email, address, vehicle_type, vehicle_brand, vehicle_model,
          vehicle_registration, profile_picture, vehicle_registration_book,
          vehicle_image, cnic_front_image, cnic_back_image, driving_license_number,
          driving_license_image, electricity_bill, bank_name, account_number,
          account_title, per_parcel_payout, city, state, country, zipcode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          riderData.full_name, riderData.father_name, riderData.cnic_number,
          riderData.mobile_primary, riderData.mobile_alternate, riderData.email,
          riderData.address, riderData.vehicle_type, riderData.vehicle_brand,
          riderData.vehicle_model, riderData.vehicle_registration, riderData.profile_picture,
          riderData.vehicle_registration_book, riderData.vehicle_image, riderData.cnic_front_image,
          riderData.cnic_back_image, riderData.driving_license_number, riderData.driving_license_image,
          riderData.electricity_bill, riderData.bank_name, riderData.account_number,
          riderData.account_title, riderData.per_parcel_payout, riderData.city,
          riderData.state, riderData.country || 'Pakistan', riderData.zipcode || '00000'
        ]
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM rider_registrations WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findByCnic(cnic) {
    const [rows] = await pool.execute(
      'SELECT * FROM rider_registrations WHERE cnic_number = ?',
      [cnic]
    );
    return rows[0];
  }

  static async getAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM rider_registrations ORDER BY created_at DESC'
    );
    return rows;
  }
}

module.exports = RiderRegistration;