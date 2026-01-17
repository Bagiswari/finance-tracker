const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  // Categorize transaction using AI
  static async categorizeTransaction(description, amount, type) {
    try {
      console.log('🤖 AI categorizing:', description);

      // Use the correct model name: gemini-2.5-flash
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are a financial assistant. Categorize this transaction into ONE of these categories:

EXPENSE CATEGORIES:
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Others

INCOME CATEGORIES:
- Salary
- Freelance
- Investments
- Gifts

Transaction Details:
Type: ${type}
Description: ${description}
Amount: ${amount}

Respond with ONLY the category name, nothing else. Pick the most appropriate category.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const category = response.text().trim();

      console.log('✅ AI suggested category:', category);

      return {
        category,
        confidence: 0.85
      };
    } catch (error) {
      console.error('❌ AI categorization error:', error.message);
      throw error;
    }
  }

  // Generate spending insights
  static async generateInsights(transactions, monthlyData) {
    try {
      console.log('🤖 Generating spending insights...');

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Analyze this spending data and provide 3 actionable insights:

Monthly Summary:
- Total Expenses: $${monthlyData.totalExpense}
- Total Income: $${monthlyData.totalIncome}
- Balance: $${monthlyData.balance}

Top Spending Categories:
${monthlyData.topCategories.map(c => `- ${c.name}: $${c.amount}`).join('\n')}

Recent Transactions (last 5):
${transactions.slice(0, 5).map(t => `- ${t.description}: $${t.amount} (${t.category_name || 'Uncategorized'})`).join('\n')}

Provide exactly 3 short insights (one sentence each) to help improve their finances.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const insights = text
        .trim()
        .split('\n')
        .filter(line => line.trim().length > 0 && line.includes('.'))
        .slice(0, 3);

      console.log('✅ Generated insights:', insights.length);

      return insights;
    } catch (error) {
      console.error('❌ AI insights error:', error.message);
      throw error;
    }
  }

  // Suggest budget based on spending patterns
  static async suggestBudget(monthlyData, previousMonths = []) {
    try {
      console.log('🤖 Generating budget suggestions...');

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Based on this spending data, suggest a realistic monthly budget:

Current Month:
- Total Expenses: $${monthlyData.totalExpense}
- Total Income: $${monthlyData.totalIncome}

Category Breakdown:
${monthlyData.categories.map(c => `- ${c.name}: $${c.amount}`).join('\n')}

Suggest budget amounts for each category. Be realistic and slightly lower than current spending to encourage saving.
Format: Category: $Amount`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestions = response.text().trim();

      console.log('✅ Budget suggestions generated');

      return suggestions;
    } catch (error) {
      console.error('❌ AI budget error:', error.message);
      throw error;
    }
  }
}

module.exports = AIService;