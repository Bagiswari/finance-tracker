const pool = require('../config/database');

class Budget {
  // Create or update budget
  static async upsert(userId, categoryId, amount, month, year) {
    try {
      const query = `
        INSERT INTO budgets (user_id, category_id, amount, month, year)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, category_id, month, year)
        DO UPDATE SET amount = $3, created_at = NOW()
        RETURNING *
      `;

      const result = await pool.query(query, [userId, categoryId, amount, month, year]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Budget.upsert error:', error.message);
      throw error;
    }
  }

  // Get budgets for a month
  static async findByMonth(userId, month, year) {
    try {
      const query = `
        SELECT 
          b.*,
          c.name as category_name,
          c.icon as category_icon,
          COALESCE(SUM(t.amount), 0) as spent
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN transactions t ON 
          t.category_id = b.category_id AND
          t.user_id = b.user_id AND
          EXTRACT(MONTH FROM t.date) = b.month AND
          EXTRACT(YEAR FROM t.date) = b.year AND
          t.type = 'expense'
        WHERE b.user_id = $1 AND b.month = $2 AND b.year = $3
        GROUP BY b.id, c.name, c.icon
        ORDER BY b.amount DESC
      `;

      const result = await pool.query(query, [userId, month, year]);
      return result.rows;
    } catch (error) {
      console.error('❌ Budget.findByMonth error:', error.message);
      throw error;
    }
  }

  // Delete budget
  static async delete(id, userId) {
    try {
      const query = `
        DELETE FROM budgets
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [id, userId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Budget.delete error:', error.message);
      throw error;
    }
  }

  // Get budget alerts (over budget categories)
  static async getAlerts(userId, month, year) {
    try {
      const budgets = await this.findByMonth(userId, month, year);
      
      const alerts = budgets
        .filter(b => parseFloat(b.spent) > parseFloat(b.amount))
        .map(b => ({
          category: b.category_name,
          budget: parseFloat(b.amount),
          spent: parseFloat(b.spent),
          overspent: parseFloat(b.spent) - parseFloat(b.amount),
          percentage: ((parseFloat(b.spent) / parseFloat(b.amount)) * 100).toFixed(1)
        }));

      return alerts;
    } catch (error) {
      console.error('❌ Budget.getAlerts error:', error.message);
      throw error;
    }
  }
}

module.exports = Budget;