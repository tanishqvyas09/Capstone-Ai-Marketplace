import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "../supabaseClient";
import { 
  ArrowLeft, Clock, CheckCircle, XCircle, Search,
  Zap, MessageSquare, ChevronRight
} from 'lucide-react';
import HistoryBackground3D from './components/HistoryBackground3D';

function MyAgentsPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [usageLogs, setUsageLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
      fetchUsageLogs();
    }
  }, [session]);

  const fetchUsageLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('ran_at', { ascending: false });
      
      if (error) throw error;
      
      setUsageLogs(data || []);
      setFilteredLogs(data || []);
    } catch (error) {
      console.error('Error fetching usage logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterLogs();
  }, [searchTerm, statusFilter, dateFilter, usageLogs]);

  const filterLogs = () => {
    let filtered = [...usageLogs];

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.agent_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === 'today') {
        filterDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'week') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        filterDate.setMonth(now.getMonth() - 1);
      }
      
      filtered = filtered.filter(log => new Date(log.ran_at) >= filterDate);
    }

    setFilteredLogs(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const generateTitle = (log) => {
    if (log.output_summary) return log.output_summary;
    
    const agentName = log.agent_name;
    const inputData = log.input_data;
    
    if (!inputData) return `${agentName} Run`;
    
    switch(agentName) {
      case 'TrendIQ':
        if (inputData.keyword) return `Analyzed "${inputData.keyword}" trends`;
        if (inputData.city) return `Explored trends in ${inputData.city}`;
        return 'Trend Analysis';
      
      case 'SEOrix':
        if (inputData.url) {
          const domain = inputData.url.replace(/^https?:\/\//i, '').split('/')[0];
          return `SEO audit for ${domain}`;
        }
        return 'SEO Analysis';
      
      case 'AdVisor':
        if (inputData.platform) return `${inputData.platform} ad campaign`;
        return 'Ad Campaign';
      
      case 'EchoMind':
        if (inputData.prompt) {
          const shortPrompt = inputData.prompt.slice(0, 40);
          return shortPrompt.length < inputData.prompt.length ? `${shortPrompt}...` : shortPrompt;
        }
        return 'Chat Conversation';
      
      case 'SociaPlan':
        if (inputData.topic) return `Social posts about ${inputData.topic}`;
        return 'Content Planning';
      
      case 'WhatsPulse':
        if (inputData.contactCount) return `Campaign to ${inputData.contactCount} contacts`;
        return 'WhatsApp Campaign';
      
      case 'LeadGen':
        if (inputData.industry) return `Leads in ${inputData.industry}`;
        return 'Lead Generation';
      
      default:
        return `${agentName} Run`;
    }
  };

  const getTotalStats = () => {
    const successLogs = filteredLogs.filter(log => log.status === 'success');
    const totalTokens = successLogs.reduce((sum, log) => sum + (log.tokens_spent || 0), 0);
    const totalRuns = successLogs.length;
    const errorRuns = filteredLogs.filter(log => log.status === 'error').length;
    
    return { totalTokens, totalRuns, errorRuns };
  };

  const stats = getTotalStats();

  return (
    <div className="agents-container">
      {/* 3D Interactive Background */}
      <HistoryBackground3D />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .agents-container {
          min-height: 100vh;
          background: #000000;
          color: #FFFFFF;
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* Subtle animated background gradient - reduced opacity for 3D elements */
        .agents-container::before {
          content: '';
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle at 20% 50%,
            rgba(0, 217, 255, 0.015) 0%,
            transparent 25%
          ),
          radial-gradient(
            circle at 80% 80%,
            rgba(14, 165, 233, 0.015) 0%,
            transparent 25%
          ),
          radial-gradient(
            circle at 40% 20%,
            rgba(0, 217, 255, 0.01) 0%,
            transparent 25%
          );
          animation: gradientShift 15s ease infinite;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes gradientShift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(2%, -3%) rotate(1deg); }
          66% { transform: translate(-2%, 2%) rotate(-1deg); }
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
        }

        /* Main Content */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          background: rgba(10, 20, 30, 0.6);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(0, 217, 255, 0.2);
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card::before {
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

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-card:hover {
          background: rgba(10, 20, 30, 0.8);
          border-color: rgba(0, 217, 255, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 217, 255, 0.15);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          letter-spacing: -0.03em;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #9CA3AF;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* Filter Section */
        .filter-section {
          background: rgba(10, 20, 30, 0.6);
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 2.5rem;
          border: 1px solid rgba(0, 217, 255, 0.2);
          backdrop-filter: blur(20px);
        }

        .filter-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 12px;
          color: #FFFFFF;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.3s;
          font-family: 'Space Grotesk', sans-serif;
        }

        .search-input:focus {
          border-color: #00D9FF;
          background: rgba(0, 0, 0, 0.6);
          box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1);
        }

        .search-input::placeholder {
          color: #6B7280;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6B7280;
          pointer-events: none;
        }

        .filter-button {
          padding: 0.875rem 1.5rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 12px;
          color: #FFFFFF;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
          font-family: 'Space Grotesk', sans-serif;
        }

        .filter-button:hover {
          background: rgba(0, 217, 255, 0.1);
          border-color: #00D9FF;
        }

        .filter-button-active {
          background: rgba(0, 217, 255, 0.15);
          border-color: #00D9FF;
          box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1);
        }

        .filter-divider {
          width: 1px;
          height: 30px;
          background: rgba(0, 217, 255, 0.2);
        }

        /* Cards Grid */
        .table-container {
          background: rgba(10, 20, 30, 0.4);
          border-radius: 20px;
          border: 1px solid rgba(0, 217, 255, 0.2);
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
          padding: 2rem;
        }

        .history-card {
          background: rgba(0, 0, 0, 0.6);
          border-radius: 16px;
          padding: 1.75rem;
          border: 1px solid rgba(0, 217, 255, 0.2);
          backdrop-filter: blur(10px);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .history-card:hover {
          background: rgba(0, 0, 0, 0.8);
          border-color: #00D9FF;
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 217, 255, 0.2);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(0, 217, 255, 0.1);
        }

        .card-header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .agent-badge {
          padding: 0.4rem 1rem;
          background: rgba(0, 217, 255, 0.1);
          color: #00D9FF;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid rgba(0, 217, 255, 0.3);
        }

        .date-text {
          font-size: 0.875rem;
          color: #6B7280;
          font-weight: 500;
        }

        .card-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 0.75rem;
          line-height: 1.4;
          letter-spacing: -0.01em;
        }

        .card-summary {
          font-size: 0.95rem;
          color: #D1D5DB;
          line-height: 1.6;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-summary-placeholder {
          font-size: 0.95rem;
          color: #6B7280;
          font-style: italic;
          margin-bottom: 1rem;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(0, 217, 255, 0.1);
        }

        .tokens-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 1rem;
          background: rgba(0, 217, 255, 0.1);
          border-radius: 8px;
          font-size: 0.875rem;
          color: #00D9FF;
          font-weight: 600;
          border: 1px solid rgba(0, 217, 255, 0.3);
        }

        .view-details-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #6B7280;
          font-weight: 500;
          transition: color 0.3s;
        }

        .history-card:hover .view-details-btn {
          color: #00D9FF;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
          animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: rgba(10, 20, 30, 0.95);
          border-radius: 24px;
          border: 1px solid rgba(0, 217, 255, 0.3);
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          padding: 2rem;
          border-bottom: 1px solid rgba(0, 217, 255, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          background: rgba(10, 20, 30, 0.98);
          backdrop-filter: blur(20px);
          z-index: 1;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .modal-close-btn {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 217, 255, 0.3);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.5rem;
          color: #6B7280;
          transition: all 0.3s;
        }

        .modal-close-btn:hover {
          background: rgba(0, 217, 255, 0.1);
          color: #00D9FF;
          border-color: #00D9FF;
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 2rem;
        }

        .detail-section {
          margin-bottom: 1.5rem;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #6B7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }

        .detail-value {
          font-size: 1rem;
          color: #D1D5DB;
          line-height: 1.6;
        }

        .code-block {
          background: rgba(0, 0, 0, 0.6);
          border-radius: 12px;
          padding: 1.25rem;
          border: 1px solid rgba(0, 217, 255, 0.2);
          max-height: 300px;
          overflow: auto;
        }

        .code-content {
          margin: 0;
          font-size: 0.875rem;
          color: #D1D5DB;
          font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .success-badge {
          background: rgba(0, 217, 255, 0.1);
          color: #00D9FF;
          border: 1px solid rgba(0, 217, 255, 0.3);
        }

        .error-badge {
          background: rgba(239, 68, 68, 0.1);
          color: #FF6B6B;
          border: 1px solid rgba(239, 68, 68, 0.3);
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
          .cards-grid {
            grid-template-columns: 1fr;
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            width: 100%;
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
              <Clock size={28} className="title-icon" />
              Agent Activity Log
            </div>
            <div style={{ width: '160px' }} />
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalRuns}</div>
              <div className="stat-label">Successful Runs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalTokens.toLocaleString()}</div>
              <div className="stat-label">Tokens Spent</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.errorRuns}</div>
              <div className="stat-label">Failed Runs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{filteredLogs.length}</div>
              <div className="stat-label">Total Entries</div>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-section">
            <div className="filter-row">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by agent name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <button
                className={`filter-button ${statusFilter === 'all' ? 'filter-button-active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All Status
              </button>
              <button
                className={`filter-button ${statusFilter === 'success' ? 'filter-button-active' : ''}`}
                onClick={() => setStatusFilter('success')}
              >
                Success
              </button>
              <button
                className={`filter-button ${statusFilter === 'error' ? 'filter-button-active' : ''}`}
                onClick={() => setStatusFilter('error')}
              >
                Error
              </button>
              
              <div className="filter-divider" />
              
              <button
                className={`filter-button ${dateFilter === 'all' ? 'filter-button-active' : ''}`}
                onClick={() => setDateFilter('all')}
              >
                All Time
              </button>
              <button
                className={`filter-button ${dateFilter === 'today' ? 'filter-button-active' : ''}`}
                onClick={() => setDateFilter('today')}
              >
                Today
              </button>
              <button
                className={`filter-button ${dateFilter === 'week' ? 'filter-button-active' : ''}`}
                onClick={() => setDateFilter('week')}
              >
                This Week
              </button>
              <button
                className={`filter-button ${dateFilter === 'month' ? 'filter-button-active' : ''}`}
                onClick={() => setDateFilter('month')}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Activity History Cards */}
          <div className="table-container">
            {loading ? (
              <div className="empty-state">
                <div className="loading-spinner"></div>
                <div>Loading your activity...</div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Clock size={40} color="#00D9FF" />
                </div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: '#D1D5DB' }}>No activity found</h3>
                <p>Start using agents to see your activity history here.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="history-card"
                    onClick={() => {
                      setSelectedLog(log);
                      setShowDetailsModal(true);
                    }}
                  >
                    <div className="card-header">
                      <div className="card-header-left">
                        <MessageSquare size={18} color="#00D9FF" />
                        <span className="agent-badge">{log.agent_name}</span>
                      </div>
                      <div className="card-header-right">
                        <span className="date-text">{formatDate(log.ran_at)}</span>
                        {log.status === 'success' ? (
                          <CheckCircle size={18} color="#00D9FF" />
                        ) : (
                          <XCircle size={18} color="#FF6B6B" />
                        )}
                      </div>
                    </div>

                    <h3 className="card-title">{generateTitle(log)}</h3>

                    {log.output_summary ? (
                      <p className="card-summary">{log.output_summary}</p>
                    ) : (
                      <p className="card-summary-placeholder">
                        {log.status === 'success' 
                          ? 'Task completed successfully' 
                          : 'Task encountered an error'}
                      </p>
                    )}

                    <div className="card-footer">
                      <div className="tokens-badge">
                        <Zap size={14} />
                        <span>{log.tokens_spent} tokens</span>
                      </div>
                      <div className="view-details-btn">
                        <span>View Details</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Run Details</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-label">Agent</div>
                <div className="detail-value">
                  <span className="agent-badge">{selectedLog.agent_name}</span>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  {selectedLog.status === 'success' ? (
                    <span className="status-badge success-badge">
                      <CheckCircle size={16} />
                      Success
                    </span>
                  ) : (
                    <span className="status-badge error-badge">
                      <XCircle size={16} />
                      Error
                    </span>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Date & Time</div>
                <div className="detail-value">{formatFullDate(selectedLog.ran_at)}</div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Tokens Spent</div>
                <div className="detail-value">
                  <span className="tokens-badge">
                    <Zap size={14} />
                    {selectedLog.tokens_spent} tokens
                  </span>
                </div>
              </div>

              {selectedLog.input_data && (
                <div className="detail-section">
                  <div className="detail-label">Input Parameters</div>
                  <div className="code-block">
                    <pre className="code-content">
                      {JSON.stringify(selectedLog.input_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedLog.output_summary && (
                <div className="detail-section">
                  <div className="detail-label">Summary</div>
                  <div className="detail-value">{selectedLog.output_summary}</div>
                </div>
              )}

              {selectedLog.output_data && (
                <div className="detail-section">
                  <div className="detail-label">Full Output</div>
                  <div className="code-block">
                    <pre className="code-content">
                      {JSON.stringify(selectedLog.output_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAgentsPage;
