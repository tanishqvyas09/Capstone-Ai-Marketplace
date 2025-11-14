import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getCampaignsWithStats, deleteCampaign, updateCampaign } from './services/campaignService';
import { Plus, Folder, ChevronDown, Search, Filter, Trash2, Edit, Play, Pause, CheckCircle, MoreVertical, ArrowLeft, FolderOpen } from 'lucide-react';
import CreateCampaignModal from './CreateCampaignModal';
import CampaignsBackground3D from './components/CampaignsBackground3D';

const CampaignsPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/login');
      return;
    }

    const result = await getCampaignsWithStats(session.user.id);
    if (result.success) {
      setCampaigns(result.campaigns);
    }
    setLoading(false);
  };

  const handleCreateCampaign = () => {
    setShowCreateModal(true);
  };

  const handleCampaignCreated = () => {
    loadCampaigns();
    setShowCreateModal(false);
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign? All associated data will be lost.')) {
      return;
    }

    const result = await deleteCampaign(campaignId);
    if (result.success) {
      loadCampaigns();
    }
  };

  const handleStatusChange = async (campaignId, newStatus) => {
    const result = await updateCampaign(campaignId, { status: newStatus });
    if (result.success) {
      loadCampaigns();
    }
    setShowDropdown(null);
  };

  const handleCampaignClick = (campaignId) => {
    navigate(`/campaigns/${campaignId}`);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return { color: '#00D9FF', text: 'Active', dot: '#00D9FF' };
      case 'Paused': return { color: '#0EA5E9', text: 'Paused', dot: '#0EA5E9' };
      case 'Completed': return { color: '#6B7280', text: 'Completed', dot: '#6B7280' };
      default: return { color: '#6B7280', text: status, dot: '#6B7280' };
    }
  };

  return (
    <div className="campaigns-container">
      {/* 3D Interactive Background */}
      <CampaignsBackground3D />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .campaigns-container {
          min-height: 100vh;
          background: #000000;
          color: #FFFFFF;
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .campaigns-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle at 30% 50%,
            rgba(0, 217, 255, 0.02) 0%,
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
          font-family: 'Space Grotesk', sans-serif;
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

        .create-button {
          background: linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%);
          border: none;
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          color: #000000;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0, 217, 255, 0.4);
          font-family: 'Space Grotesk', sans-serif;
        }

        .create-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 217, 255, 0.6);
        }

        /* Main Content */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .campaigns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .campaign-card {
          background: rgba(10, 20, 30, 0.6);
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid rgba(0, 217, 255, 0.2);
          backdrop-filter: blur(20px);
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          overflow: hidden;
        }

        .campaign-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #00D9FF, transparent);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .campaign-card:hover::before {
          opacity: 1;
        }

        .campaign-card:hover {
          background: rgba(10, 20, 30, 0.8);
          border-color: rgba(0, 217, 255, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 217, 255, 0.15);
        }

        .campaign-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
          position: relative;
        }

        .campaign-name {
          font-size: 1.4rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00D9FF 0%, #FFFFFF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.85rem;
          borderRadius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          background: rgba(0, 217, 255, 0.1);
          border: 1px solid rgba(0, 217, 255, 0.3);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .campaign-description {
          font-size: 0.875rem;
          color: #9CA3AF;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          position: relative;
          z-index: 10;
        }

        .icon-button {
          background: rgba(0, 217, 255, 0.1);
          border: 1px solid rgba(0, 217, 255, 0.3);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #00D9FF;
          flex-shrink: 0;
        }

        .icon-button:hover {
          transform: scale(1.1);
          background: rgba(0, 217, 255, 0.2);
          border-color: #00D9FF;
          box-shadow: 0 4px 16px rgba(0, 217, 255, 0.4);
        }

        .icon-button.delete {
          background: rgba(255, 107, 107, 0.1) !important;
          border-color: rgba(255, 107, 107, 0.4) !important;
          color: #FF6B6B !important;
        }

        .icon-button.delete:hover {
          background: rgba(255, 107, 107, 0.2) !important;
          border-color: #FF6B6B !important;
          transform: scale(1.15) !important;
          box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5) !important;
        }

        .progress-section {
          margin-bottom: 1.5rem;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          color: #9CA3AF;
          font-weight: 500;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(0, 217, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00D9FF 0%, #0EA5E9 100%);
          border-radius: 10px;
          transition: width 0.3s ease;
          box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
        }

        .dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid rgba(0, 217, 255, 0.3);
          border-radius: 12px;
          padding: 0.5rem;
          min-width: 160px;
          z-index: 10;
          box-shadow: 0 8px 32px rgba(0, 217, 255, 0.2);
          backdrop-filter: blur(20px);
        }

        .dropdown-item {
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.875rem;
          color: #D1D5DB;
          font-weight: 500;
        }

        .dropdown-item:hover {
          background: rgba(0, 217, 255, 0.15);
          color: #00D9FF;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 217, 255, 0.15);
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
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
          .campaigns-grid {
            grid-template-columns: 1fr;
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
              Back to Dashboard
            </button>
            <div className="title">
              <FolderOpen size={28} className="title-icon" />
              Campaigns
            </div>
            <button 
              className="create-button"
              onClick={handleCreateCampaign}
            >
              <Plus size={20} />
              New Campaign
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner"></div>
              <div>Loading campaigns...</div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FolderOpen size={40} color="#00D9FF" />
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: '#D1D5DB' }}>No campaigns yet</h3>
              <p style={{ marginBottom: '2rem' }}>Create your first campaign to organize your agent runs.</p>
              <button 
                className="create-button"
                onClick={handleCreateCampaign}
              >
                <Plus size={20} />
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="campaigns-grid">
              {filteredCampaigns.map((campaign) => {
                const statusInfo = getStatusColor(campaign.status);
                return (
                  <div 
                    key={campaign.id} 
                    className="campaign-card"
                    onClick={() => handleCampaignClick(campaign.id)}
                  >
                    <div className="campaign-header">
                      <div style={{ flex: 1 }}>
                        <div className="campaign-name">{campaign.name}</div>
                        <div className="status-badge">
                          <span className="status-dot" style={{ background: statusInfo.dot }}></span>
                          <span style={{ color: statusInfo.color }}>{statusInfo.text}</span>
                        </div>
                      </div>
                      <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="icon-button delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCampaign(campaign.id);
                          }}
                          title="Delete campaign"
                        >
                          <Trash2 size={20} strokeWidth={2.5} />
                        </button>
                        <button 
                          className="icon-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDropdown(showDropdown === campaign.id ? null : campaign.id);
                          }}
                          title="More options"
                        >
                          <MoreVertical size={20} strokeWidth={2.5} />
                        </button>
                        {showDropdown === campaign.id && (
                          <div className="dropdown">
                            <div 
                              className="dropdown-item"
                              onClick={() => handleStatusChange(campaign.id, 'Active')}
                            >
                              <Play size={14} /> Active
                            </div>
                            <div 
                              className="dropdown-item"
                              onClick={() => handleStatusChange(campaign.id, 'Paused')}
                            >
                              <Pause size={14} /> Paused
                            </div>
                            <div 
                              className="dropdown-item"
                              onClick={() => handleStatusChange(campaign.id, 'Completed')}
                            >
                              <CheckCircle size={14} /> Completed
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {campaign.description && (
                      <div className="campaign-description">{campaign.description}</div>
                    )}
                    
                    <div className="progress-section">
                      <div className="progress-info">
                        <span>Progress</span>
                        <span style={{ color: '#00D9FF', fontWeight: '600' }}>{campaign.progress_percentage || 0}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${campaign.progress_percentage || 0}%`
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="stats-grid">
                      <div className="stat">
                        <div className="stat-value">{campaign.total_tasks || 0}</div>
                        <div className="stat-label">Tasks</div>
                      </div>
                      <div className="stat">
                        <div className="stat-value">{campaign.completed_tasks || 0}</div>
                        <div className="stat-label">Completed</div>
                      </div>
                      <div className="stat">
                        <div className="stat-value" style={{ fontSize: '0.9rem' }}>
                          {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : '-'}
                        </div>
                        <div className="stat-label">Created</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCampaignCreated}
        />
      )}
    </div>
  );
}

export default CampaignsPage;
