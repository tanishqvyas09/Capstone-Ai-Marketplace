import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "../supabaseClient";
import ThreeBackground from './components/ThreeBackground';
import { 
  Search, MessageCircle, Image, Target, Key, Phone, Headphones, 
  TrendingUp, FileText, Users, Bell, Settings, LogOut, 
  ChevronDown, Menu, X, Play, Zap, BarChart3, Clock, CheckCircle, UserPlus, Calendar, Sparkles, Film, PhoneCall, Instagram, Youtube
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
  
  // KPI States
  const [totalRuns, setTotalRuns] = useState(0);
  const [tokensSpent, setTokensSpent] = useState(0);
  const [favoriteAgent, setFavoriteAgent] = useState('--');

  // Predefined agents with video links
  const agentDetails = [
    { id: 1, name: 'SEOrix', icon: Search, desc: 'AI agent for search engine optimization', videoUrl: 'https://res.cloudinary.com/dry1chfzv/video/upload/v1760383592/_Create_a_cinematic_futuris_mqsfpe.mp4', status: 'active' },
    { id: 2, name: 'LeadGen', icon: UserPlus, desc: 'Intelligent lead generation and contact discovery', videoUrl: 'https://player.cloudinary.com/embed/?cloud_name=dry1chfzv&public_id=WhatsApp_Video_2025-10-15_at_13.23.05_ztnmkn&profile=cld-default', status: 'active' },
    { id: 3, name: 'WhatsPulse', icon: MessageCircle, desc: 'Automates WhatsApp marketing campaigns', videoUrl: 'https://res.cloudinary.com/dry1chfzv/video/upload/v1760383595/AI_Marketing_Intro_Video_Generation_rucbpj.mp4', status: 'active' },
   // { id: 4, name: 'GraphiGen', icon: Image, desc: 'Generates stunning graphics for ads & social posts', videoUrl: 'https://res.cloudinary.com/dry1chfzv/video/upload/v1760383593/AI_Design_Agent_Intro_Video_Generation_iguoka.mp4', status: 'active' },
    { id: 4, name: 'AdVisor', icon: Target, desc: 'Creates optimized ad titles and visuals', videoUrl: 'https://res.cloudinary.com/dry1chfzv/video/upload/v1760383601/AI_Ad_Strategist_Promo_Video_Generated_c1leqv.mp4', status: 'active' },
    { id: 5, name: 'SociaPlan', icon: Calendar, desc: 'Social Media Calendar Generator - Full week content planning', videoUrl: 'https://player.cloudinary.com/embed/?cloud_name=dry1chfzv&public_id=AI_Social_Media_Content_Calendar_Generation_nddmb9&profile=cld-default', status: 'active' },
    { id: 6, name: 'EchoMind', icon: Headphones, desc: 'Analyzes customer recordings for sentiment patterns', videoUrl: 'https://res.cloudinary.com/dry1chfzv/video/upload/v1760383553/AI_Video_Intro_EchoMind_s_Emotional_Insight_xxcqga.mp4', status: 'active' },
    { id: 7, name: 'TrendIQ', icon: TrendingUp, desc: 'Scans news, social media, and on-chain data - 150 tokens (location) or 250 tokens (keyword)', videoUrl: '' /* Video coming soon: '' */, status: 'active' },
    { id: 8, name: 'Scriptly', icon: FileText, desc: 'Generates viral short-form video scripts with AI - 300 tokens', videoUrl: '', status: 'active' },
    { id: 9, name: 'Adbrief', icon: Sparkles, desc: 'Creates strategic ad briefs with multiple creative angles - 75 tokens', videoUrl: '', status: 'active' },
    { id: 10, name: 'ClipGen', icon: Film, desc: 'Transforms long-form content into viral short-form clips - 350 tokens', videoUrl: '', status: 'active' },
    { id: 11, name: 'RingCast', icon: PhoneCall, desc: 'Automated voice broadcast system - Upload CSV with contacts and send personalized voice messages', videoUrl: '', status: 'active' },
    { id: 12, name: 'InfluenceScope', icon: Instagram, desc: 'Deep Instagram influencer analysis - Enter username to get detailed engagement metrics, authenticity scores, and partnership insights', videoUrl: '', status: 'active' },
    { id: 13, name: 'SocialInsight', icon: Youtube, desc: 'AI-powered YouTube & Instagram content Transcriber ', videoUrl: '', status: 'active' },
    //{ id: 14, name: 'LostLens', icon: Users, desc: 'Diagnoses customer loss reasons & retention patterns', videoUrl: '', status: 'idle' }
  ];

  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase.from('agents').select('*');
      if (error) console.error("Error fetching agents", error);
      else setAgents(data || []);
    };
    fetchAgents();

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          navigate('/login');
          return;
        }
        if (!session) {
          navigate('/login');
        } else {
          setSession(session);
        }
      } catch (err) {
        console.error('Failed to get session:', err);
        navigate('/login');
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
      } else if (event === 'SIGNED_OUT') {
        navigate('/login');
      } else if (!session) {
        navigate('/login');
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

  // Fetch KPI data
  useEffect(() => {
    if (session?.user) {
      const fetchKPIs = async () => {
        try {
          // Fetch total runs
          const { count: runsCount, error: runsError } = await supabase
            .from('usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('status', 'success');
          
          if (!runsError) {
            setTotalRuns(runsCount || 0);
          }

          // Fetch tokens spent
          const { data: spendData, error: spendError } = await supabase
            .from('usage_logs')
            .select('tokens_spent')
            .eq('user_id', session.user.id)
            .eq('status', 'success');
          
          if (!spendError && spendData) {
            const total = spendData.reduce((acc, run) => acc + (run.tokens_spent || 0), 0);
            setTokensSpent(total);
          }

          // Fetch favorite agent
          const { data: favoriteData, error: favoriteError } = await supabase
            .rpc('get_favorite_agent');
          
          if (!favoriteError && favoriteData && favoriteData.length > 0) {
            setFavoriteAgent(favoriteData[0].agent_name || '--');
          }
        } catch (error) {
          console.error('Error fetching KPIs:', error);
        }
      };
      
      fetchKPIs();

      // Subscribe to updates
      const usageListener = supabase
        .channel('usage_logs_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'usage_logs', 
          filter: `user_id=eq.${session.user.id}` 
        }, () => {
          fetchKPIs(); // Refresh KPIs when usage_logs change
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(usageListener);
      };
    }
  }, [session]);

  // Map agent names to their routes
  const agentRoutes = {
    'SEOrix': '/seorix',
    'LeadGen': '/leadgen',
    'WhatsPulse': '/whatspulse',
    'AdVisor': '/advisor',
    'SociaPlan': '/sociaplan',
    'EchoMind': '/echomind',
    'TrendIQ': '/trendiq',
    'Scriptly': '/scriptly',
    'Adbrief': '/adbrief',
    'ClipGen': '/clipgen',
    'RingCast': '/ringcast',
    'InfluenceScope': '/influencescope',
    'SocialInsight': '/socialinsight'
  };

  const handleUseAgent = (agent) => {
    // Open modal for all agents to show video first
    setSelectedAgent(agent);
  };

  const handleNavigateToAgent = (agentName) => {
    const route = agentRoutes[agentName];
    
    if (route) {
      navigate(route);
    } else {
      alert(`${agentName} agent page coming soon!`);
    }
    setSelectedAgent(null);
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000000', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '3px solid rgba(0, 217, 255, 0.1)', 
            borderTop: '3px solid #00D9FF', 
            borderRadius: '50%', 
            animation: 'spin 0.8s linear infinite', 
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
          }}></div>
          <div style={{ 
            color: '#6B7280', 
            fontSize: '0.875rem',
            fontFamily: '"Space Grotesk", -apple-system, sans-serif',
            letterSpacing: '0.1em'
          }}>INITIALIZING WORKSPACE...</div>
        </div>
      </div>
    );
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #141414 100%)',
      position: 'relative',
      color: '#fff',
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    },
    scanlineOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'repeating-linear-gradient(0deg, rgba(0, 217, 255, 0.03) 0px, transparent 1px, transparent 2px, rgba(0, 217, 255, 0.03) 3px)',
      pointerEvents: 'none',
      zIndex: 100,
      animation: 'scanlines 8s linear infinite'
    },
    cyberGrid: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px',
      pointerEvents: 'none',
      zIndex: 0,
      opacity: 0.3
    },
    navbar: {
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(20px) saturate(180%)',
      background: 'rgba(0, 0, 0, 0.85)',
      borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
      padding: '1rem 2rem',
      boxShadow: '0 4px 30px rgba(0, 217, 255, 0.1), inset 0 -1px 0 rgba(0, 217, 255, 0.3)'
    },
    menuButton: {
      width: '40px',
      height: '40px',
      borderRadius: '6px',
      background: 'rgba(0, 217, 255, 0.05)',
      border: '1px solid rgba(0, 217, 255, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: '10px',
      position: 'relative'
    },
    menuLine: {
      width: '20px',
      height: '2px',
      background: '#00D9FF',
      borderRadius: '2px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 0 8px rgba(0, 217, 255, 0.6)'
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
      fontSize: '1.25rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #00D9FF 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.5))'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '1.25rem',
      color: '#000',
      boxShadow: '0 0 30px rgba(0, 217, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    },
    navLinks: {
      display: 'flex',
      gap: '2.5rem',
      alignItems: 'center'
    },
    navLink: {
      color: '#D1D5DB',
      textDecoration: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      position: 'relative',
      padding: '0.5rem 0'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem'
    },
    tokenBadge: {
      padding: '0.625rem 1.25rem',
      background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
      border: '1px solid rgba(0, 217, 255, 0.4)',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.625rem',
      position: 'relative',
      overflow: 'hidden',
      color: '#FFFFFF',
      letterSpacing: '0.05em',
      boxShadow: '0 0 20px rgba(0, 217, 255, 0.2), inset 0 0 20px rgba(0, 217, 255, 0.05)'
    },
    coinIcon: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '0.75rem',
      color: '#000',
      boxShadow: '0 0 15px rgba(0, 217, 255, 0.8)',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '2px solid rgba(0, 217, 255, 0.5)',
      objectFit: 'cover',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      background: '#000',
      boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)'
    },
    userInitial: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%)',
      border: '2px solid rgba(0, 217, 255, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontWeight: '700',
      fontSize: '1rem',
      color: '#000',
      boxShadow: '0 0 20px rgba(0, 217, 255, 0.6)'
    },
    iconButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'rgba(0, 217, 255, 0.05)',
      border: '1px solid rgba(0, 217, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      color: '#00D9FF',
      position: 'relative'
    },
    mainContent: {
      display: 'flex',
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '2.5rem 2rem',
      position: 'relative',
      zIndex: 10
    },
    sidebar: {
      width: showSidebar ? '280px' : '0',
      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden'
    },
    sidebarContent: {
      width: '280px',
      padding: '1.5rem',
      background: 'rgba(0, 0, 0, 0.6)',
      borderRadius: '12px',
      border: '1px solid rgba(0, 217, 255, 0.15)',
      backdropFilter: 'blur(20px) saturate(180%)',
      boxShadow: '0 8px 32px rgba(0, 217, 255, 0.1), inset 0 0 40px rgba(0, 217, 255, 0.02)',
      position: 'relative'
    },
    sidebarItem: {
      padding: '0.875rem 1rem',
      marginBottom: '0.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#9CA3AF',
      letterSpacing: '0.03em',
      position: 'relative',
      overflow: 'hidden'
    },
    content: {
      flex: 1,
      marginLeft: showSidebar ? '2rem' : '0',
      transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    welcomeCard: {
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 217, 255, 0.03) 100%)',
      borderRadius: '16px',
      padding: '3rem 2.5rem',
      marginBottom: '2.5rem',
      border: '1px solid rgba(0, 217, 255, 0.2)',
      backdropFilter: 'blur(20px) saturate(180%)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0, 217, 255, 0.15), inset 0 0 60px rgba(0, 217, 255, 0.03)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
      marginBottom: '3rem'
    },
    statCard: {
      background: 'rgba(0, 0, 0, 0.6)',
      borderRadius: '12px',
      padding: '2rem 1.75rem',
      border: '1px solid rgba(0, 217, 255, 0.15)',
      backdropFilter: 'blur(20px) saturate(180%)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      cursor: 'pointer'
    },
    statValue: {
      fontSize: '2.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #00D9FF 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem',
      letterSpacing: '-0.03em',
      filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.5))',
      fontFamily: '"Space Grotesk", monospace'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6B7280',
      fontWeight: '500',
      letterSpacing: '0.05em',
      textTransform: 'uppercase'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      letterSpacing: '0.02em',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.3))'
    },
    agentsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.75rem',
      marginBottom: '3rem'
    },
    agentCard: {
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '12px',
      padding: '2rem 1.75rem',
      border: '1px solid rgba(0, 217, 255, 0.2)',
      backdropFilter: 'blur(20px) saturate(180%)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      transformStyle: 'preserve-3d',
      perspective: '1000px'
    },
    agentHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      marginBottom: '1.25rem',
      position: 'relative',
      zIndex: 1
    },
    agentIcon: {
      width: '56px',
      height: '56px',
      background: 'linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 30px rgba(0, 217, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden'
    },
    agentName: {
      fontSize: '1.25rem',
      fontWeight: '700',
      marginBottom: '0.375rem',
      color: '#FFFFFF',
      letterSpacing: '0.02em',
      filter: 'drop-shadow(0 0 5px rgba(0, 217, 255, 0.3))'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: '0.375rem 0.75rem',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginTop: '0.5rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase'
    },
    agentDesc: {
      fontSize: '0.875rem',
      color: '#9CA3AF',
      marginBottom: '1.5rem',
      lineHeight: '1.6',
      fontWeight: '400',
      position: 'relative',
      zIndex: 1
    },
    useButton: {
      width: '100%',
      padding: '0.875rem',
      background: 'linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%)',
      border: 'none',
      borderRadius: '8px',
      color: '#000',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 0 30px rgba(0, 217, 255, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.625rem',
      fontSize: '0.875rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(10px)',
      padding: '1rem'
    },
    modalContent: {
      background: 'rgba(0, 0, 0, 0.95)',
      borderRadius: '16px',
      padding: '2.5rem',
      width: '90%',
      maxWidth: '900px',
      border: '1px solid rgba(0, 217, 255, 0.3)',
      backdropFilter: 'blur(40px) saturate(180%)',
      boxShadow: '0 30px 80px rgba(0, 217, 255, 0.2), inset 0 0 60px rgba(0, 217, 255, 0.05)',
      position: 'relative'
    },
    closeButton: {
      position: 'absolute',
      top: '1.5rem',
      right: '1.5rem',
      background: 'rgba(0, 217, 255, 0.1)',
      border: '1px solid rgba(0, 217, 255, 0.3)',
      color: '#00D9FF',
      fontSize: '1.25rem',
      cursor: 'pointer',
      padding: '0.625rem',
      borderRadius: '8px',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 0 20px rgba(0, 217, 255, 0.2)'
    },
    videoContainer: {
      width: '100%',
      aspectRatio: '16/9',
      marginTop: '1.5rem',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid rgba(0, 217, 255, 0.2)',
      boxShadow: '0 0 40px rgba(0, 217, 255, 0.15)'
    },
    tryButton: {
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%)',
      border: 'none',
      borderRadius: '8px',
      color: '#000',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 0 30px rgba(0, 217, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1)',
      marginTop: '2rem',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden'
    }
  };

  return (
    <div style={styles.container}>
      <ThreeBackground />
      <div style={styles.cyberGrid}></div>
      <div style={styles.scanlineOverlay}></div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 217, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 217, 255, 0.6); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateZ(0deg); }
          50% { transform: translateY(-10px) rotateZ(2deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(0, 217, 255, 0.2); }
          50% { border-color: rgba(0, 217, 255, 0.6); }
        }
        
        /* Cyberpunk Hover Effects */
        .menu-button:hover {
          background: rgba(0, 217, 255, 0.15);
          border-color: rgba(0, 217, 255, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
        }
        .menu-button:active {
          transform: translateY(0);
        }
        .user-avatar:hover, .user-initial:hover {
          transform: scale(1.1);
          border-color: rgba(0, 217, 255, 0.8);
          box-shadow: 0 0 30px rgba(0, 217, 255, 0.6);
        }
        
        /* Agent Cards 3D Transform */
        .agent-card {
          transform-style: preserve-3d;
        }
        .agent-card:hover {
          transform: translateY(-8px) translateZ(20px);
          border-color: rgba(0, 217, 255, 0.5);
          box-shadow: 0 20px 60px rgba(0, 217, 255, 0.3), inset 0 0 40px rgba(0, 217, 255, 0.05);
        }
        .agent-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.8), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .agent-card:hover::before {
          opacity: 1;
          animation: shimmer 2s linear infinite;
        }
        .agent-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 217, 255, 0.03), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .agent-card:hover::after {
          opacity: 1;
        }
        
        /* Stat Cards Holographic Effect */
        .stat-card {
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 217, 255, 0.4);
          box-shadow: 0 15px 40px rgba(0, 217, 255, 0.2);
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg, transparent, rgba(0, 217, 255, 0.1), transparent 30%);
          animation: float 8s linear infinite;
        }
        .stat-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(0, 217, 255, 0.1), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .stat-card:hover::after {
          opacity: 1;
        }
        
        .icon-button:hover {
          background: rgba(0, 217, 255, 0.2);
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
        }
        .nav-link {
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0%;
          height: 2px;
          background: linear-gradient(90deg, #00D9FF, #0EA5E9);
          transition: width 0.3s ease;
        }
        .nav-link:hover {
          color: #00D9FF;
          text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .sidebar-item:hover {
          background: rgba(0, 217, 255, 0.1);
          color: #FFFFFF;
          box-shadow: inset 4px 0 0 #00D9FF;
          transform: translateX(4px);
        }
        .use-button:hover, .try-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(0, 217, 255, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.2);
        }
        .use-button:active, .try-button:active {
          transform: translateY(0);
        }
        .use-button::before, .try-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          background-size: 200% 200%;
          animation: shimmer 3s linear infinite;
        }
        .close-btn:hover {
          background: rgba(0, 217, 255, 0.2);
          border-color: rgba(0, 217, 255, 0.5);
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
        }
        
        /* Loading Scanner Effect */
        .loading-scanner {
          position: relative;
        }
        .loading-scanner::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00D9FF, transparent);
          animation: scan 2s linear infinite;
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <button 
              style={styles.menuButton}
              onClick={() => setShowSidebar(!showSidebar)}
              className="menu-button"
            >
              <div style={styles.menuLine}></div>
              <div style={styles.menuLine}></div>
              <div style={styles.menuLine}></div>
            </button>
            <div style={styles.logo}>
              <img 
                src="/Gemini_Generated_Image_v9lm7xv9lm7xv9lm-removebg-preview.png" 
                alt="Market Muse AI Logo" 
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'contain'
                }}
              />
              <span>Market Muse AI</span>
            </div>
          </div>

          <div style={styles.navLinks}>
            <a style={styles.navLink} className="nav-link" onClick={() => navigate('/')}>Dashboard</a>
            <a style={styles.navLink} className="nav-link" onClick={() => navigate('/campaigns')}>Campaigns</a>
            <a style={styles.navLink} className="nav-link" onClick={() => navigate('/analytics')}>Analytics</a>
            <a style={styles.navLink} className="nav-link">Docs</a>
          </div>

          <div style={styles.userSection}>
            <div style={styles.tokenBadge}>
              <div style={styles.coinIcon}>₹</div>
              {profile.tokens_remaining || 0} Tokens
            </div>
            <div style={{ position: 'relative' }}>
              {(session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture) ? (
                <img 
                  src={session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture}
                  alt="User Avatar"
                  style={styles.userAvatar}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="user-avatar"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{
                  ...styles.userInitial,
                  display: (session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture) ? 'none' : 'flex'
                }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-initial"
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  background: 'rgba(15, 10, 30, 0.95)',
                  borderRadius: '10px',
                  padding: '0.5rem',
                  minWidth: '200px',
                  border: '1px solid rgba(254, 119, 16, 0.2)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(254, 119, 16, 0.1)' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#F3F4F6', fontSize: '0.875rem' }}>{displayName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{session.user.email}</div>
                  </div>
                  <button onClick={signOut} style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '6px',
                    marginTop: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
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
            <div style={styles.sidebarItem} className="sidebar-item" onClick={() => navigate('/')}>
              <Zap size={20} />
              <span>Dashboard</span>
            </div>
            <div style={styles.sidebarItem} className="sidebar-item" onClick={() => navigate('/my-agents')}>
              <Users size={20} />
              <span>My Agents</span>
            </div>
            <div style={styles.sidebarItem} className="sidebar-item" onClick={() => navigate('/campaigns')}>
              <BarChart3 size={20} />
              <span>Campaigns</span>
            </div>
            <div style={styles.sidebarItem} className="sidebar-item" onClick={() => navigate('/analytics')}>
              <TrendingUp size={20} />
              <span>Analytics</span>
            </div>
            <div style={styles.sidebarItem} className="sidebar-item" onClick={() => navigate('/settings')}>
              <Settings size={20} />
              <span>Settings</span>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main style={styles.content}>
          {/* Welcome Section */}
          <div style={styles.welcomeCard}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem', letterSpacing: '-0.02em', color: '#F3F4F6' }}>
              {getGreeting()}, {displayName}! 👋
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '0.938rem', fontWeight: '400' }}>
              Your AI copilots are ready to automate, analyze, and amplify your marketing.
            </p>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statValue}>{totalRuns}</div>
              <div style={styles.statLabel}>Total Agents Run</div>
            </div>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statValue}>{tokensSpent.toLocaleString()}</div>
              <div style={styles.statLabel}>Tokens Spent</div>
            </div>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statValue}>{favoriteAgent}</div>
              <div style={styles.statLabel}>Favorite Agent</div>
            </div>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statValue}>{profile.tokens_remaining || 0}</div>
              <div style={styles.statLabel}>Tokens Remaining</div>
            </div>
          </div>

          {/* AI Agents Section */}
          <div style={styles.sectionTitle}>
            <Zap size={28} style={{ filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.8))' }} />
            <span style={{ letterSpacing: '0.1em' }}>AGENT MARKETPLACE</span>
          </div>
          <div style={styles.agentsGrid}>
            {agentDetails.map((agent) => {
              const IconComponent = agent.icon;
              return (
                <div key={agent.id} style={styles.agentCard} className="agent-card">
                  <div style={styles.agentHeader}>
                    <div style={styles.agentIcon}>
                      <IconComponent size={28} color="#000" />
                    </div>
                    <div>
                      <div style={styles.agentName}>{agent.name}</div>
                      <div 
                        style={{
                          ...styles.statusBadge,
                          background: agent.status === 'active' 
                            ? 'rgba(0, 217, 255, 0.15)' 
                            : 'rgba(156, 163, 175, 0.1)',
                          color: agent.status === 'active' ? '#00D9FF' : '#9CA3AF',
                          border: `1px solid ${agent.status === 'active' ? 'rgba(0, 217, 255, 0.4)' : 'rgba(156, 163, 175, 0.2)'}`,
                          boxShadow: agent.status === 'active' ? '0 0 15px rgba(0, 217, 255, 0.3)' : 'none'
                        }}
                      >
                        {agent.status === 'active' ? '● ACTIVE' : '● IDLE'}
                      </div>
                    </div>
                  </div>
                  <p style={styles.agentDesc}>{agent.desc}</p>
                  <button 
                    style={{...styles.useButton, zIndex: 999, position: 'relative', pointerEvents: 'auto'}}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavigateToAgent(agent.name);
                    }}
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
            
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              marginBottom: '0.75rem', 
              background: 'linear-gradient(135deg, #FFFFFF 0%, #00D9FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.3))'
            }}>
              {selectedAgent.name}
            </h2>
            <p style={{ color: '#9CA3AF', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: '400', letterSpacing: '0.02em' }}>
              {selectedAgent.desc}
            </p>

            <div style={styles.videoContainer}>
              {selectedAgent.videoUrl ? (
                selectedAgent.videoUrl.includes('player.cloudinary.com') ? (
                  <iframe
                    src={`${selectedAgent.videoUrl}&autoplay=true`}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: '12px'
                    }}
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      background: '#0F0A1E'
                    }}
                  >
                    <source src={selectedAgent.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  gap: '1rem',
                  color: '#6B7280'
                }}>
                  <Play size={64} style={{ filter: 'drop-shadow(0 0 20px rgba(0, 217, 255, 0.5))' }} color="#00D9FF" />
                  <div style={{ fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Demo Video Coming Soon</div>
                </div>
              )}
            </div>

            <button
              style={styles.tryButton}
              onClick={() => handleNavigateToAgent(selectedAgent.name)}
            >
              <Play size={16} />
              Use This Agent
            </button>

            {outputs[selectedAgent.id] && (
              <div style={{
                marginTop: '2rem',
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                boxShadow: '0 0 20px rgba(0, 217, 255, 0.1)'
              }}>
                <strong style={{ 
                  color: '#00D9FF', 
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textShadow: '0 0 10px rgba(0, 217, 255, 0.5)'
                }}>System Output</strong>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  marginTop: '1rem',
                  fontSize: '0.813rem',
                  color: '#D1D5DB',
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  lineHeight: '1.6',
                  letterSpacing: '0.01em'
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