import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "../supabaseClient";
import { 
  ArrowLeft, TrendingUp, BarChart3, PieChart, Calendar, Zap, Activity
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AnalyticsBackground3D from './components/AnalyticsBackground3D';

function AnalyticsPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [timeRange, setTimeRange] = useState(30); // days

  const COLORS = ['#00D9FF', '#0EA5E9', '#06B6D4', '#22D3EE', '#38BDF8', '#7DD3FC', '#BAE6FD', '#E0F2FE'];

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setSession(session);
      }
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      fetchAnalytics();
    }
  }, [session, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - timeRange);

      // Fetch usage logs
      const { data: logs, error } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'success')
        .gte('ran_at', startDate.toISOString())
        .order('ran_at', { ascending: true });
      
      if (error) throw error;

      // Process daily data
      const dailyMap = {};
      const agentMap = {};

      logs.forEach(log => {
        const date = new Date(log.ran_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Daily aggregation
        if (!dailyMap[date]) {
          dailyMap[date] = { date, tokens: 0, runs: 0 };
        }
        dailyMap[date].tokens += log.tokens_spent || 0;
        dailyMap[date].runs += 1;

        // Agent aggregation
        if (!agentMap[log.agent_name]) {
          agentMap[log.agent_name] = { name: log.agent_name, runs: 0, tokens: 0 };
        }
        agentMap[log.agent_name].runs += 1;
        agentMap[log.agent_name].tokens += log.tokens_spent || 0;
      });

      setDailyData(Object.values(dailyMap));
      setAgentData(Object.values(agentMap).sort((a, b) => b.runs - a.runs));
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.95)',
          border: '1px solid rgba(0, 217, 255, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 217, 255, 0.2)'
        }}>
          <p style={{ color: '#FFFFFF', marginBottom: '0.5rem', fontWeight: '600' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, fontSize: '0.9rem', fontWeight: '500' }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-container">
      {/* 3D Interactive Background */}
      <AnalyticsBackground3D />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .analytics-container {
          min-height: 100vh;
          background: #000000;
          color: #FFFFFF;
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* Subtle background gradient */
        .analytics-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle at 20% 50%,
            rgba(0, 217, 255, 0.02) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 80% 80%,
            rgba(14, 165, 233, 0.02) 0%,
            transparent 50%
          );
          pointer-events: none;
          z-index: 0;
        }

        .content-wrapper {
          position: relative;
          z-index: 1;
        }

        /* Header */
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(20px) saturate(180%);
          background: rgba(0, 0, 0, 0.85);
          border-bottom: 1px solid rgba(0, 217, 255, 0.15);
          padding: 1.5rem 2rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .back-button {
          background: rgba(0, 217, 255, 0.05);
          border: 1px solid rgba(0, 217, 255, 0.3);
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          color: #FFFFFF;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .back-button:hover {
          background: rgba(0, 217, 255, 0.1);
          border-color: rgba(0, 217, 255, 0.5);
          transform: translateX(-4px);
          box-shadow: 0 4px 16px rgba(0, 217, 255, 0.2);
        }

        .title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          letter-spacing: -0.02em;
        }

        .title-icon {
          color: #00D9FF;
          filter: drop-shadow(0 0 8px rgba(0, 217, 255, 0.6));
        }

        /* Main Content */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Filter Section */
        .filter-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 2.5rem;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .filter-button {
          padding: 0.875rem 1.5rem;
          background: rgba(0, 217, 255, 0.05);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 12px;
          color: #FFFFFF;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          font-family: 'Space Grotesk', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .filter-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .filter-button:hover::before {
          left: 100%;
        }

        .filter-button:hover {
          background: rgba(0, 217, 255, 0.1);
          border-color: #00D9FF;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
          transform: translateY(-2px);
        }

        .filter-button-active {
          background: rgba(0, 217, 255, 0.15);
          border-color: #00D9FF;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.4), inset 0 0 20px rgba(0, 217, 255, 0.1);
        }

        /* Chart Container */
        .chart-container {
          background: rgba(10, 20, 30, 0.6);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(0, 217, 255, 0.2);
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .chart-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00D9FF, transparent);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .chart-container:hover::before {
          opacity: 1;
        }

        .chart-container:hover {
          background: rgba(10, 20, 30, 0.8);
          border-color: rgba(0, 217, 255, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 217, 255, 0.15);
        }

        .chart-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }

        .chart-icon {
          color: #00D9FF;
          filter: drop-shadow(0 0 6px rgba(0, 217, 255, 0.6));
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6B7280;
        }

        .empty-icon {
          width: 100px;
          height: 100px;
          background: rgba(0, 217, 255, 0.05);
          border: 2px solid rgba(0, 217, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(0, 217, 255, 0.2);
          border-top-color: #00D9FF;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 3rem auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Recharts customization */
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke: rgba(0, 217, 255, 0.1);
        }

        .recharts-text {
          fill: #9CA3AF;
          font-family: 'Space Grotesk', sans-serif;
        }

        .recharts-legend-item-text {
          color: #D1D5DB !important;
          font-weight: 500;
        }

        .recharts-tooltip-wrapper {
          outline: none;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 217, 255, 0.3);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 217, 255, 0.5);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }

          .filter-section {
            justify-content: stretch;
          }

          .filter-button {
            flex: 1;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .title {
            font-size: 1.5rem;
          }
        }
      `}</style>

      {/* Content Wrapper */}
      <div className="content-wrapper">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <button 
              className="back-button"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
            <div className="title">
              <BarChart3 size={28} className="title-icon" />
              Analytics Dashboard
            </div>
            <div style={{ width: '160px' }} />
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Time Range Filter */}
          <div className="filter-section">
            <button
              className={`filter-button ${timeRange === 7 ? 'filter-button-active' : ''}`}
              onClick={() => setTimeRange(7)}
            >
              Last 7 Days
            </button>
            <button
              className={`filter-button ${timeRange === 30 ? 'filter-button-active' : ''}`}
              onClick={() => setTimeRange(30)}
            >
              Last 30 Days
            </button>
            <button
              className={`filter-button ${timeRange === 90 ? 'filter-button-active' : ''}`}
              onClick={() => setTimeRange(90)}
            >
              Last 90 Days
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner"></div>
              <div>Loading analytics...</div>
            </div>
          ) : dailyData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <BarChart3 size={40} color="#00D9FF" />
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: '#D1D5DB' }}>No data yet</h3>
              <p>Start using agents to see your analytics here.</p>
            </div>
          ) : (
            <>
              {/* Token Spend & Agent Runs Over Time - Side by Side */}
              <div className="charts-grid">
                {/* Token Spend Over Time */}
                <div className="chart-container">
                  <div className="chart-title">
                    <TrendingUp size={24} className="chart-icon" />
                    Token Spend Over Time
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        style={{ fontSize: '0.875rem' }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        style={{ fontSize: '0.875rem' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="tokens" 
                        stroke="#00D9FF" 
                        strokeWidth={3}
                        dot={{ fill: '#00D9FF', r: 5, strokeWidth: 2, stroke: '#000' }}
                        activeDot={{ r: 7, fill: '#00D9FF', stroke: '#FFF', strokeWidth: 2 }}
                        name="Tokens Spent"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Agent Runs Over Time */}
                <div className="chart-container">
                  <div className="chart-title">
                    <Activity size={24} className="chart-icon" />
                    Agent Runs Over Time
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        style={{ fontSize: '0.875rem' }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        style={{ fontSize: '0.875rem' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="runs" 
                        stroke="#0EA5E9" 
                        strokeWidth={3}
                        dot={{ fill: '#0EA5E9', r: 5, strokeWidth: 2, stroke: '#000' }}
                        activeDot={{ r: 7, fill: '#0EA5E9', stroke: '#FFF', strokeWidth: 2 }}
                        name="Agent Runs"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Agent Usage Breakdown */}
              <div className="charts-grid">
                {/* Pie Chart */}
                <div className="chart-container">
                  <div className="chart-title">
                    <PieChart size={24} className="chart-icon" />
                    Agent Usage by Runs
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <RePieChart>
                      <Pie
                        data={agentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="runs"
                      >
                        {agentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="chart-container">
                  <div className="chart-title">
                    <BarChart3 size={24} className="chart-icon" />
                    Token Spend by Agent
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={agentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6B7280"
                        style={{ fontSize: '0.75rem' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        style={{ fontSize: '0.875rem' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="tokens" 
                        fill="#00D9FF" 
                        radius={[8, 8, 0, 0]} 
                        name="Tokens Spent"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
