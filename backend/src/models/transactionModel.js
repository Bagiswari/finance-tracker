const pool = require('../config/database');

class Transaction {
  // Create new transaction
  static async create(userId, data) {
    try {
      const { categoryId, amount, type, description, date, aiCategorized = false } = data;

      const query = `
        INSERT INTO transactions (user_id, category_id, amount, type, description, date, ai_categorized)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await pool.query(query, [
        userId,
        categoryId,
        amount,
        type,
        description,
        date,
        aiCategorized
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Transaction.create error:', error.message);
      throw error;
    }
  }

  // Get all transactions for a user
  static async findByUserId(userId, filters = {}) {
    try {
      let query = `
        SELECT 
          t.*,
          c.name as category_name,
          c.icon as category_icon
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1
      `;

      const params = [userId];
      let paramCount = 1;

      // Add date filters if provided
      if (filters.startDate) {
        paramCount++;
        query += ` AND t.date >= $${paramCount}`;
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        paramCount++;
        query += ` AND t.date <= $${paramCount}`;
        params.push(filters.endDate);
      }

      // Add type filter (expense/income)
      if (filters.type) {
        paramCount++;
        query += ` AND t.type = $${paramCount}`;
        params.push(filters.type);
      }

      // Add category filter
      if (filters.categoryId) {
        paramCount++;
        query += ` AND t.category_id = $${paramCount}`;
        params.push(filters.categoryId);
      }

      query += ` ORDER BY t.date DESC, t.created_at DESC`;

      // Add limit if provided
      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Transaction.findByUserId error:', error.message);
      throw error;
    }
  }

  // Get single transaction by ID
  static async findById(id, userId) {
    try {
      const query = `
        SELECT 
          t.*,
          c.name as category_name,
          c.icon as category_icon
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = $1 AND t.user_id = $2
      `;

      const result = await pool.query(query, [id, userId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Transaction.findById error:', error.message);
      throw error;
    }
  }

  // Update transaction
  static async update(id, userId, data) {
    try {
      const { categoryId, amount, type, description, date } = data;

      const query = `
        UPDATE transactions
        SET 
          category_id = COALESCE($1, category_id),
          amount = COALESCE($2, amount),
          type = COALESCE($3, type),
          description = COALESCE($4, description),
          date = COALESCE($5, date),
          updated_at = NOW()
        WHERE id = $6 AND user_id = $7
        RETURNING *
      `;

      const result = await pool.query(query, [
        categoryId,
        amount,
        type,
        description,
        date,
        id,
        userId
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Transaction.update error:', error.message);
      throw error;
    }
  }

  // Delete transaction
  static async delete(id, userId) {
    try {
      const query = `
        DELETE FROM transactions
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [id, userId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Transaction.delete error:', error.message);
      throw error;
    }
  }

  // Get monthly summary
  static async getMonthlySummary(userId, month, year) {
    try {
      const query = `
        SELECT 
          t.type,
          c.name as category_name,
          c.icon as category_icon,
          SUM(t.amount) as total_amount,
          COUNT(*) as transaction_count
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1
          AND EXTRACT(MONTH FROM t.date) = $2
          AND EXTRACT(YEAR FROM t.date) = $3
        GROUP BY t.type, c.name, c.icon
        ORDER BY total_amount DESC
      `;

      const result = await pool.query(query, [userId, month, year]);
      return result.rows;
    } catch (error) {
      console.error('❌ Transaction.getMonthlySummary error:', error.message);
      throw error;
    }
  }
}

module.exports = Transaction;