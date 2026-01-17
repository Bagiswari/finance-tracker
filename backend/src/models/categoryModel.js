const pool = require('../config/database');

class Category {
  // Get all categories (default + user's custom)
  static async findAll(userId = null) {
    try {
      let query = `
        SELECT * FROM categories
        WHERE is_default = true
      `;

      const params = [];

      if (userId) {
        query += ` OR user_id = $1`;
        params.push(userId);
      }

      query += ` ORDER BY is_default DESC, name ASC`;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Category.findAll error:', error.message);
      throw error;
    }
  }

  // Create custom category
  static async create(userId, name, type, icon = '📦') {
    try {
      const query = `
        INSERT INTO categories (user_id, name, type, icon, is_default)
        VALUES ($1, $2, $3, $4, false)
        RETURNING *
      `;

      const result = await pool.query(query, [userId, name, type, icon]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Category.create error:', error.message);
      throw error;
    }
  }

  // Find category by name (for AI categorization)
  static async findByName(name) {
    try {
      const query = `
        SELECT * FROM categories
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1
      `;

      const result = await pool.query(query, [name]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Category.findByName error:', error.message);
      throw error;
    }
  }
}

module.exports = Category;