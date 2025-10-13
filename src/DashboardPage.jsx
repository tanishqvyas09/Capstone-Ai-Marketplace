import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "../supabaseClient";
import { 
  Search, MessageCircle, Image, Target, Key, Phone, Headphones, 
  TrendingUp, FileText, Users, Bell, Settings, LogOut, 
  ChevronDown, Menu, X, Play, Zap, BarChart3, Clock, CheckCircle
} from 'lucide-react';

function DashboardPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [agents, setAgents] = useState([]);
  const [outputs, setOutputs] = useState({});
  const [loadingAgentId, setLoadingAgentId] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Predefined agents with video links
  const agentDetails = [
    { id: 1, name: 'SEOrix', icon: Search, desc: 'AI agent for search engine optimization', videoUrl: 'https://res.cloudinary.com/dry1chfzv/video/upload/v1760383592/_Create_a_cinematic_futuris_mqsfpe.mp4', status: 'active' },
    { id: 2, name: 'WhatsPulse', icon: MessageCircle, desc: 'Automates WhatsApp marketing campaigns', videoUrl: 'https://res.cloudinary.com/dry1chfzv/video/upload/v1760383595/AI_Marketing_Intro_Video_Generation_rucbpj.mp4', status: 'active' },
    { id: 3, name: 'GraphiGen', icon: Image, desc: 'Generates stunning graphics for ads & social posts', videoUrl: 'https://res.cloudinary.com/dry1chfzv/video/upload/v1760383593/AI_Design_Agent_Intro_Video_Generation_iguoka.mp4', status: 'active' },
    { id: 4, name: 'AdVisor', icon: Target, desc: 'Creates optimized ad titles and visuals', videoUrl: 'https://res.cloudinary.com/dry1chfzv/video/upload/v1760383601/AI_Ad_Strategist_Promo_Video_Generated_c1leqv.mp4', status: 'active' },
    { id: 5, name: 'KeyMuse', icon: Key, desc: 'Generates high-performing marketing keywords', videoUrl: '', status: 'idle' },
    { id: 6, name: 'SalesCalla', icon: Phone, desc: 'AI-driven sales calling and lead management', videoUrl: '', status: 'idle' },
    { id: 7, name: 'EchoMind', icon: Headphones, desc: 'Analyzes customer recordings for sentiment patterns', videoUrl: 'https://res.cloudinary.com/dry1chfzv/video/upload/v1760383553/AI_Video_Intro_EchoMind_s_Emotional_Insight_xxcqga.mp4', status: 'active' },
    { id: 8, name: 'TrendIQ', icon: TrendingUp, desc: 'Predicts market trends using data-driven insights', videoUrl: '', status: 'idle' },
    { id: 9, name: 'Scriptly', icon: FileText, desc: 'Writes compelling video scripts instantly', videoUrl: '', status: 'idle' },
    { id: 10, name: 'LostLens', icon: Users, desc: 'Diagnoses customer loss reasons & retention patterns', videoUrl: '', status: 'idle' }
  ];

  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase.from('agents').select('*');
      if (error) console.error("Error fetching agents", error);
      else setAgents(data || []);
    };
    fetchAgents();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setSession(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (error) console.error('Error fetching profile:', error);
        else setProfile(data);
      };
      fetchProfile();

      const profileListener = supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` }, (payload) => {
          setProfile(payload.new);
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(profileListener);
      };
    }
  }, [session]);

  const handleUseAgent = (agent) => {
    setSelectedAgent(agent);
  };

  const handleTryAgent = async (agentId) => {
    setLoadingAgentId(agentId);
    setOutputs(prev => ({ ...prev, [agentId]: 'Running agent...' }));

    const { data, error } = await supabase.rpc('run_agent', {
      agent_id_to_run: agentId
    });

    if (error) {
      setOutputs(prev => ({ ...prev, [agentId]: `Error: ${error.message}` }));
    } else {
      setOutputs(prev => ({ ...prev, [agentId]: JSON.stringify(data, null, 2) }));
    }
    setLoadingAgentId(null);
  };

  const displayName = profile?.full_name || session?.user?.email?.split('@')[0] || 'User';
  
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!session || !profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #16001e 100%)', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid rgba(147,51,234,0.3)', borderTop: '4px solid #9333ea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <div>Loading your workspace...</div>
        </div>
      </div>
    );
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #16001e 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif'
    },
    navbar: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
      background: 'rgba(255, 255, 255, 0.1)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '1rem 2rem'
    },
    navContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '1600px',
      margin: '0 auto'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #c084fc 0%, #f9a8d4 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '1.25rem',
      boxShadow: '0 0 20px rgba(147,51,234,0.5)'
    },
    navLinks: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center'
    },
    navLink: {
      color: '#d1d5db',
      textDecoration: 'none',
      transition: 'color 0.3s',
      cursor: 'pointer',
      fontSize: '0.95rem'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    tokenBadge: {
      padding: '0.5rem 1rem',
      background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(147,51,234,0.3)'
    },
    iconButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s',
      color: '#fff'
    },
    mainContent: {
      display: 'flex',
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '2rem'
    },
    sidebar: {
      width: showSidebar ? '260px' : '0',
      transition: 'width 0.3s',
      overflow: 'hidden'
    },
    sidebarContent: {
      width: '260px',
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)'
    },
    sidebarItem: {
      padding: '0.75rem 1rem',
      marginBottom: '0.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.95rem'
    },
    content: {
      flex: 1,
      marginLeft: showSidebar ? '2rem' : '0'
    },
    welcomeCard: {
      background: 'linear-gradient(135deg, rgba(147,51,234,0.2) 0%, rgba(236,72,153,0.2) 100%)',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      transition: 'all 0.3s'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #c084fc 0%, #f9a8d4 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#9ca3af'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    agentsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '3rem'
    },
    agentCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      transition: 'all 0.3s',
      cursor: 'pointer',
      position: 'relative'
    },
    agentHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem'
    },
    agentIcon: {
      width: '50px',
      height: '50px',
      background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 20px rgba(147,51,234,0.5)'
    },
    agentName: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginTop: '0.5rem'
    },
    agentDesc: {
      fontSize: '0.875rem',
      color: '#9ca3af',
      marginBottom: '1rem',
      lineHeight: '1.5'
    },
    useButton: {
      width: '100%',
      padding: '0.75rem',
      background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
      border: 'none',
      borderRadius: '8px',
      color: '#fff',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 4px 12px rgba(147,51,234,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)',
      padding: '1rem'
    },
    modalContent: {
      background: 'rgba(10, 10, 15, 0.95)',
      borderRadius: '20px',
      padding: '2rem',
      width: '90%',
      maxWidth: '900px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 20px 60px rgba(147,51,234,0.3)'
    },
    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      color: '#fff',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s'
    },
    videoContainer: {
      width: '100%',
      aspectRatio: '16/9',
      marginTop: '1rem',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(147,51,234,0.2) 0%, rgba(236,72,153,0.2) 100%)'
    },
    tryButton: {
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
      border: 'none',
      borderRadius: '8px',
      color: '#fff',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 4px 12px rgba(147,51,234,0.4)',
      marginTop: '1.5rem',
      fontSize: '1rem'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .agent-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(147,51,234,0.3);
          background: rgba(255, 255, 255, 0.1);
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(147,51,234,0.2);
        }
        .icon-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }
        .nav-link:hover {
          color: #fff;
        }
        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .use-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(147,51,234,0.6);
        }
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <button 
              style={{...styles.iconButton, marginRight: '1rem'}}
              onClick={() => setShowSidebar(!showSidebar)}
              className="icon-button"
            >
              <Menu size={20} />
            </button>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>M</div>
              <span>Market Muse AI</span>
            </div>
          </div>

          <div style={styles.navLinks}>
            <a style={styles.navLink} className="nav-link">Dashboard</a>
            <a style={styles.navLink} className="nav-link">Campaigns</a>
            <a style={styles.navLink} className="nav-link">Analytics</a>
            <a style={styles.navLink} className="nav-link">Docs</a>
          </div>

          <div style={styles.userSection}>
            <div style={styles.tokenBadge}>
              {profile.tokens_remaining || 0} Tokens
            </div>
            <button 
              style={styles.iconButton}
              onClick={() => setShowNotifications(!showNotifications)}
              className="icon-button"
            >
              <Bell size={20} />
            </button>
            <div style={{ position: 'relative' }}>
              <button 
                style={styles.iconButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="icon-button"
              >
                <Settings size={20} />
              </button>
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '50px',
                  right: 0,
                  background: 'rgba(10, 10, 15, 0.95)',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  minWidth: '200px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{displayName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{session.user.email}</div>
                  </div>
                  <button onClick={signOut} style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '8px',
                    marginTop: '0.5rem'
                  }} className="sidebar-item">
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarContent}>
            <div style={styles.sidebarItem} className="sidebar-item">
              <Zap size={20} />
              <span>Dashboard</span>
            </div>
            <div style={styles.sidebarItem} className="sidebar-item">
              <Users size={20} />
              <span>My Agents</span>
            </div>
            <div style={styles.sidebarItem} className="sidebar-item">
              <BarChart3 size={20} />
              <span>Campaigns</span>
            </div>
            <div style={styles.sidebarItem} className="sidebar-item">
              <TrendingUp size={20} />
              <span>Analytics</span>
            </div>
            <div style={styles.sidebarItem} className="sidebar-item">
              <Settings size={20} />
              <span>Settings</span>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main style={styles.content}>
          {/* Welcome Section */}
          <div style={styles.welcomeCard}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {getGreeting()}, {displayName}! 👋
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
              Your AI copilots are ready to automate, analyze, and amplify your marketing.
            </p>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statValue}>10</div>
              <div style={styles.statLabel}>Active Agents</div>
            </div>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statValue}>24</div>
              <div style={styles.statLabel}>Campaigns Running</div>
            </div>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statValue}>1,247</div>
              <div style={styles.statLabel}>Tasks Automated Today</div>
            </div>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statValue}>8</div>
              <div style={styles.statLabel}>Pending Insights</div>
            </div>
          </div>

          {/* AI Agents Section */}
          <div style={styles.sectionTitle}>
            <Zap size={24} />
            AI Agent Marketplace
          </div>
          <div style={styles.agentsGrid}>
            {agentDetails.map((agent) => {
              const IconComponent = agent.icon;
              return (
                <div key={agent.id} style={styles.agentCard} className="agent-card">
                  <div style={styles.agentHeader}>
                    <div style={styles.agentIcon}>
                      <IconComponent size={28} color="#fff" />
                    </div>
                    <div>
                      <div style={styles.agentName}>{agent.name}</div>
                      <div 
                        style={{
                          ...styles.statusBadge,
                          background: agent.status === 'active' 
                            ? 'rgba(34,197,94,0.2)' 
                            : 'rgba(156,163,175,0.2)',
                          color: agent.status === 'active' ? '#86efac' : '#9ca3af'
                        }}
                      >
                        {agent.status === 'active' ? '● Active' : '● Idle'}
                      </div>
                    </div>
                  </div>
                  <p style={styles.agentDesc}>{agent.desc}</p>
                  <button 
                    style={styles.useButton}
                    onClick={() => handleUseAgent(agent)}
                    className="use-button"
                  >
                    <Play size={16} />
                    Use This Agent
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Agent Modal */}
      {selectedAgent && (
        <div style={styles.modal} onClick={() => setSelectedAgent(null)}>
          <div style={{...styles.modalContent, position: 'relative'}} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.closeButton}
              onClick={() => setSelectedAgent(null)}
              className="close-btn"
            >
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {selectedAgent.name}
            </h2>
            <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
              {selectedAgent.desc}
            </p>

            <div style={styles.videoContainer}>
              {selectedAgent.videoUrl ? (
                <video
                  controls
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    background: '#1a1a2e'
                  }}
                >
                  <source src={selectedAgent.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  gap: '1rem',
                  color: '#9ca3af'
                }}>
                  <Play size={48} />
                  <div>Demo video coming soon</div>
                </div>
              )}
            </div>

            <button
              style={styles.tryButton}
              onClick={() => handleTryAgent(selectedAgent.id)}
              disabled={loadingAgentId === selectedAgent.id}
            >
              {loadingAgentId === selectedAgent.id ? 'Processing...' : 'Try This Agent Now'}
            </button>

            {outputs[selectedAgent.id] && (
              <div style={{
                marginTop: '1.5rem',
                background: 'rgba(0,0,0,0.3)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <strong style={{ color: '#c084fc' }}>Output:</strong>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  marginTop: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#d1d5db'
                }}>
                  {outputs[selectedAgent.id]}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;