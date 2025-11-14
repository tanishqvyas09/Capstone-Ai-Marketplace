import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "../supabaseClient";
import { 
  ArrowLeft, User, Mail, Shield, Trash2, AlertTriangle,
  Moon, Sun, CreditCard, Key
} from 'lucide-react';
import SettingsBackground3D from './components/SettingsBackground3D';

function SettingsPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // Always dark for now
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

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
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    try {
      // Note: Actual account deletion should be handled by Supabase Auth Admin API
      // This is a placeholder for the UI flow
      alert('Account deletion requested. This feature requires backend implementation.');
      
      // For now, just sign out
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please contact support.');
    }
  };

  return (
    <div className="settings-container">
      {/* 3D Interactive Background */}
      <SettingsBackground3D />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .settings-container {
          min-height: 100vh;
          background: #000000;
          color: #FFFFFF;
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .settings-container::before {
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
          max-width: 1000px;
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

        /* Main Content */
        .main-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }

        .section {
          background: rgba(10, 20, 30, 0.6);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(0, 217, 255, 0.2);
          backdrop-filter: blur(20px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .section::before {
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

        .section:hover::before {
          opacity: 1;
        }

        .section:hover {
          background: rgba(10, 20, 30, 0.8);
          border-color: rgba(0, 217, 255, 0.3);
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }

        .section-icon {
          color: #00D9FF;
          filter: drop-shadow(0 0 6px rgba(0, 217, 255, 0.6));
        }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .label {
          font-size: 0.875rem;
          color: #6B7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .value {
          font-size: 1rem;
          color: #D1D5DB;
          padding: 0.75rem 1rem;
          background: rgba(0, 217, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(0, 217, 255, 0.2);
          transition: all 0.3s;
        }

        .value:hover {
          background: rgba(0, 217, 255, 0.08);
          border-color: rgba(0, 217, 255, 0.3);
        }

        .toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(0, 217, 255, 0.1);
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: #D1D5DB;
          font-weight: 500;
        }

        .toggle {
          width: 50px;
          height: 28px;
          background: rgba(0, 217, 255, 0.1);
          border: 1px solid rgba(0, 217, 255, 0.3);
          border-radius: 14px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toggle-active {
          background: linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%);
          border-color: #00D9FF;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
        }

        .toggle-thumb {
          width: 22px;
          height: 22px;
          background: #FFFFFF;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-thumb-active {
          left: 24px;
        }

        .danger-section {
          background: rgba(255, 107, 107, 0.05);
          border-color: rgba(255, 107, 107, 0.3);
        }

        .danger-section::before {
          background: linear-gradient(90deg, transparent, #FF6B6B, transparent);
        }

        .warning-box {
          background: rgba(255, 107, 107, 0.08);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          gap: 1rem;
        }

        .warning-text {
          font-size: 0.875rem;
          color: #FCA5A5;
          line-height: 1.6;
        }

        .delete-button {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.4);
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          color: #FF6B6B;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Space Grotesk', sans-serif;
        }

        .delete-button:hover {
          background: rgba(255, 107, 107, 0.2);
          border-color: #FF6B6B;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
        }

        .modal {
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
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          border: 1px solid rgba(255, 107, 107, 0.3);
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
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #FF6B6B;
        }

        .modal-text {
          font-size: 0.95rem;
          color: #9CA3AF;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(0, 217, 255, 0.05);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 12px;
          color: #FFFFFF;
          font-size: 0.95rem;
          outline: none;
          margin-bottom: 1.5rem;
          font-family: 'Space Grotesk', sans-serif;
          transition: all 0.3s;
        }

        .input:focus {
          border-color: #FF6B6B;
          background: rgba(255, 107, 107, 0.08);
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
        }

        .confirm-button {
          flex: 1;
          padding: 0.75rem;
          background: rgba(255, 107, 107, 0.15);
          border: 1px solid rgba(255, 107, 107, 0.5);
          border-radius: 12px;
          color: #FF6B6B;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Space Grotesk', sans-serif;
        }

        .confirm-button:hover {
          background: rgba(255, 107, 107, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
        }

        .cancel-button {
          flex: 1;
          padding: 0.75rem;
          background: rgba(0, 217, 255, 0.05);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 12px;
          color: #FFFFFF;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Space Grotesk', sans-serif;
        }

        .cancel-button:hover {
          background: rgba(0, 217, 255, 0.1);
          border-color: #00D9FF;
        }

        .coming-soon {
          background: rgba(0, 217, 255, 0.05);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          color: #6B7280;
          font-size: 0.875rem;
          font-style: italic;
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
          .profile-grid {
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
              <Shield size={28} className="title-icon" />
              Settings
            </div>
            <div style={{ width: '160px' }} />
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div className="loading-spinner"></div>
              <div style={{ color: '#6B7280' }}>Loading settings...</div>
            </div>
          ) : (
            <>
              {/* Profile Section */}
              <div className="section">
                <div className="section-title">
                  <User size={24} className="section-icon" />
                  Profile Information
                </div>
                <div className="profile-grid">
                  <div className="info-item">
                    <div className="label">Full Name</div>
                    <div className="value">
                      {profile?.full_name || 'Not set'}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="label">Email Address</div>
                    <div className="value">
                      {session?.user?.email || 'Not available'}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="label">User ID</div>
                    <div className="value" title={session?.user?.id}>
                      {session?.user?.id?.substring(0, 8)}...
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="label">Tokens Remaining</div>
                    <div className="value">
                      {profile?.tokens_remaining?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appearance Section */}
              <div className="section">
                <div className="section-title">
                  <Moon size={24} className="section-icon" />
                  Appearance
                </div>
                <div className="toggle-row">
                  <div className="toggle-label">
                    <Moon size={20} color="#00D9FF" />
                    Dark Mode
                  </div>
                  <div 
                    className={`toggle ${darkMode ? 'toggle-active' : ''}`}
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    <div className={`toggle-thumb ${darkMode ? 'toggle-thumb-active' : ''}`}></div>
                  </div>
                </div>
                <div className="coming-soon" style={{ marginTop: '1rem' }}>
                  Light mode coming soon
                </div>
              </div>

              {/* Billing Section */}
              <div className="section">
                <div className="section-title">
                  <CreditCard size={24} className="section-icon" />
                  Billing & Tokens
                </div>
                <div className="coming-soon">
                  Token purchase and billing features coming soon
                </div>
              </div>

              {/* Danger Zone */}
              <div className="section danger-section">
                <div className="section-title">
                  <AlertTriangle size={24} style={{ color: '#FF6B6B', filter: 'drop-shadow(0 0 6px rgba(255, 107, 107, 0.6))' }} />
                  Danger Zone
                </div>
                <div className="warning-box">
                  <AlertTriangle size={20} color="#FF6B6B" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#FF6B6B' }}>
                      Delete Account
                    </div>
                    <div className="warning-text">
                      Once you delete your account, there is no going back. All your data, including campaigns, 
                      usage history, and tokens will be permanently deleted.
                    </div>
                  </div>
                </div>
                <button 
                  className="delete-button"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 size={18} />
                  Delete My Account
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <AlertTriangle size={28} color="#FF6B6B" />
              <div className="modal-title">Delete Account</div>
            </div>
            <div className="modal-text">
              This action cannot be undone. This will permanently delete your account, 
              all your campaigns, usage history, and any remaining tokens.
            </div>
            <div className="modal-text">
              Please type <strong style={{ color: '#FF6B6B' }}>DELETE</strong> to confirm:
            </div>
            <input
              type="text"
              className="input"
              placeholder="Type DELETE to confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                }}
              >
                Cancel
              </button>
              <button 
                className="confirm-button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE'}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default SettingsPage;
