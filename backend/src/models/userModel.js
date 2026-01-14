const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(email, password, fullName) {
    try {
      console.log('🔐 Hashing password...');
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      console.log('💾 Inserting into database...');
      const query = `
        INSERT INTO users (email, password_hash, full_name)
        VALUES ($1, $2, $3)
        RETURNING id, email, full_name, created_at
      `;

      const result = await pool.query(query, [email, passwordHash, fullName]);
      console.log('✅ User inserted successfully');
      return result.rows[0];
    } catch (error) {
      console.error('❌ User.create error:', error.message);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ User.findByEmail error:', error.message);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = 'SELECT id, email, full_name, created_at FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ User.findById error:', error.message);
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;