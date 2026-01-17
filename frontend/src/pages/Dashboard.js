import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get current month dates
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Fetch analytics
      const analyticsData = await transactionAPI.getAnalytics({
        startDate,
        endDate
      });

      if (analyticsData.success) {
        setStats(analyticsData.data.summary);
        setCategoryData(analyticsData.data.byCategory.slice(0, 5));
        setTrendData(analyticsData.data.trend);
      }

      // Fetch recent transactions
      const transactionsData = await transactionAPI.getAll({ limit: 5 });
      if (transactionsData.success) {
        setRecentTransactions(transactionsData.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {user?.fullName?.split(' ')[0]}! 👋
            </h2>
            <p className="text-blue-100">
              Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Sparkles className="w-16 h-16 opacity-20" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">
              {stats.balance >= 0 ? '+' : ''}{((stats.balance / (stats.totalIncome || 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            ${stats.balance.toFixed(2)}
          </p>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Income</p>
          <p className="text-2xl font-bold text-gray-900">
            ${stats.totalIncome.toFixed(2)}
          </p>
        </div>

        {/* Total Expense */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <ArrowDownRight className="w-6 h-6 text-red-600" />
            </div>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Expense</p>
          <p className="text-2xl font-bold text-gray-900">
            ${stats.totalExpense.toFixed(2)}
          </p>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Transactions</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.transactionCount}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Spending Trend
          </h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Categories
          </h3>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600">{cat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ${parseFloat(cat.total).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No category data
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="divide-y">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                    ${transaction.type === 'expense' ? 'bg-red-100' : 'bg-green-100'}
                  `}>
                    {transaction.category_icon || '💰'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description || 'No description'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.category_name || 'Uncategorized'} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={`
                  text-lg font-semibold
                  ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}
                `}>
                  {transaction.type === 'expense' ? '-' : '+'}${parseFloat(transaction.amount).toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400">
              No transactions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;