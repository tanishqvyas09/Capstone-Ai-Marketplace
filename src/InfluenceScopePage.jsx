import React, { useState, useEffect } from 'react';
import { ArrowLeft, Instagram, Search, CheckCircle, Users, TrendingUp, Award, DollarSign, Target, AlertCircle, Sparkles, BarChart3, Shield, ThumbsUp, ThumbsDown, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { executeWithTokens } from './utils/tokenService';
import { handleCampaignTaskCompletion } from './services/campaignService';

function InfluenceScopePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignId = location.state?.campaignId;
  const [session, setSession] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const [analysisData, setAnalysisData] = useState(null);

  // Session management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    // Validation
    if (!username.trim()) {
      setError('Please enter an Instagram username');
      return;
    }

    // Check if user is logged in
    if (!session || !session.user) {
      setError('Please log in to use InfluenceScope');
      navigate('/login');
      return;
    }

    console.log('🔍 Starting InfluenceScope analysis for:', username);
    console.log('📋 Campaign ID:', campaignId || 'Not part of campaign');

    setLoading(true);
    setError('');
    setCompleted(false);
    setAnalysisData(null);

    try {
      const cleanUsername = username.replace('@', '').trim();
      
      console.log('🚀 Starting InfluenceScope with token deduction...');
      
      // Execute with token deduction (100 tokens)
      const tokenResult = await executeWithTokens(
        session.user.id,
        'InfluenceScope',
        async () => {
          // API call logic
          const payload = { username: cleanUsername };
          console.log('📤 Sending payload to webhook:', payload);

          const response = await fetch(
            'https://glowing-g79w8.crab.containers.automata.host/webhook/influencescope',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }
          );

          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
          }

          const data = await response.json();
          console.log('📥 Raw response data:', data);

          // Extract the output from the response
          const output = data[0]?.output || data.output || data;
          console.log('📊 Extracted output:', output);

          return output;
        },
        { username: cleanUsername }, // Request data
        1, // Token multiplier (fixed cost)
        `Instagram analysis for @${cleanUsername}`, // Output summary
        campaignId // Campaign ID (if part of campaign)
      );

      // Check result
      if (!tokenResult.success) {
        setError(tokenResult.error);
        setLoading(false);
        return;
      }

      // Success - tokens deducted
      console.log(`✅ InfluenceScope completed! Tokens deducted: ${tokenResult.tokensDeducted}`);
      console.log(`💰 Remaining tokens: ${tokenResult.tokensRemaining}`);
      
      setAnalysisData(tokenResult.data);
      setLoading(false);
      setCompleted(true);

      // Handle campaign task completion if this is part of a campaign
      if (campaignId) {
        console.log('📁 This is part of campaign:', campaignId);
        console.log('📁 Log ID from tokenResult:', tokenResult.logId);
        
        if (!tokenResult.logId) {
          console.error('❌ No logId returned from tokenService!');
        } else {
          console.log('✅ LogId available, proceeding with campaign artifact save...');
          
          // Get agent ID from database
          const { data: agentData, error: agentError } = await supabase
            .from('agents')
            .select('id')
            .eq('name', 'InfluenceScope')
            .single();
          
          if (agentError) {
            console.error('❌ Error fetching agent ID:', agentError);
          } else if (!agentData) {
            console.error('❌ InfluenceScope agent not found in database');
          } else {
            const agentId = agentData.id;
            console.log('✅ Agent ID:', agentId);
            
            const outputSummary = `Instagram analysis for @${cleanUsername}`;
            
            console.log('📁 Calling handleCampaignTaskCompletion with:', {
              campaignId,
              agentId,
              agentName: 'InfluenceScope',
              logId: tokenResult.logId,
              outputSummary
            });
            
            const campaignResult = await handleCampaignTaskCompletion(
              campaignId,
              agentId,
              'InfluenceScope',
              tokenResult.logId,
              tokenResult.data,
              outputSummary
            );
            
            if (campaignResult.success) {
              console.log('✅ Campaign artifact saved successfully!');
              console.log('✅ Task marked as complete');
            } else {
              console.error('❌ Failed to save campaign artifact:', campaignResult.error);
            }
          }
        }
      } else {
        console.log('📝 Running as standalone agent (not part of campaign)');
      }

    } catch (err) {
      console.error('❌ InfluenceScope error:', err);
      setError(err.message || 'Failed to analyze Instagram profile');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setCompleted(false);
    setLoading(false);
    setError('');
    setAnalysisData(null);
  };

  const getGradeColor = (grade) => {
    if (grade?.includes('A')) return '#10b981';
    if (grade?.includes('B')) return '#00D9FF';
    if (grade?.includes('C')) return '#f59e0b';
    if (grade?.includes('D')) return '#ef4444';
    return '#9ca3af';
  };

  const styles = {
    container: {
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: '#000000',
      padding: '2rem',
      fontFamily: "'Space Grotesk', sans-serif"
    },
    floatingOrb: {
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(60px)',
      opacity: 0.4,
      pointerEvents: 'none'
    },
    orb1: {
      top: '10%',
      left: '10%',
      width: '400px',
      height: '400px',
      background: 'radial-gradient(circle, rgba(0, 217, 255, 0.2), transparent)',
      animation: 'float 8s ease-in-out infinite'
    },
    orb2: {
      top: '60%',
      right: '10%',
      width: '350px',
      height: '350px',
      background: 'radial-gradient(circle, rgba(0, 217, 255, 0.15), transparent)',
      animation: 'float 8s ease-in-out infinite 2s'
    },
    orb3: {
      bottom: '10%',
      left: '50%',
      width: '300px',
      height: '300px',
      background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15), transparent)',
      animation: 'float 8s ease-in-out infinite 4s'
    },
    gridOverlay: {
      position: 'absolute',
      inset: 0,
      opacity: 0.1,
      backgroundImage: `linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)`,
      backgroundSize: '50px 50px',
      pointerEvents: 'none'
    },
    content: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '1400px',
      margin: '0 auto'
    },
    backButton: {
      background: 'rgba(0, 217, 255, 0.05)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(0, 217, 255, 0.2)',
      borderRadius: '24px',
      padding: '0.75rem 1.5rem',
      marginBottom: '2rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: '#00D9FF',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '1rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem',
      animation: 'slideIn 0.6s ease-out forwards',
      animationDelay: '0.1s',
      opacity: 0
    },
    aiPoweredBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      marginBottom: '1.5rem',
      background: 'rgba(0, 217, 255, 0.1)',
      border: '1px solid rgba(0, 217, 255, 0.3)',
      color: '#00D9FF',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '600'
    },
    title: {
      fontSize: '4rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      background: 'linear-gradient(90deg, #00D9FF, #0EA5E9, #00D9FF)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'gradientShift 4s ease infinite',
      textShadow: '0 0 30px rgba(0, 217, 255, 0.3)',
      fontFamily: "'Space Grotesk', sans-serif"
    },
    subtitle: {
      fontSize: '1.25rem',
      color: '#d1d5db',
      marginBottom: '1.5rem',
      maxWidth: '48rem',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.1)',
      padding: '2rem',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'slideIn 0.6s ease-out forwards',
      animationDelay: '0.2s',
      opacity: 0
    },
    errorBox: {
      marginBottom: '1.5rem',
      padding: '1rem',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)'
    },
    errorDivider: {
      width: '4px',
      height: '2rem',
      borderRadius: '9999px',
      background: '#ef4444'
    },
    inputWrapper: {
      marginBottom: '2rem'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'white',
      fontWeight: '600',
      marginBottom: '0.75rem',
      fontSize: '1rem'
    },
    input: {
      width: '100%',
      padding: '1rem 1.25rem',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#E4E9F7',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    submitButton: {
      width: '100%',
      padding: '1.25rem',
      borderRadius: '16px',
      border: 'none',
      background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)',
      color: '#000000',
      fontSize: '1.125rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 40px rgba(0, 217, 255, 0.4)'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '3rem',
      animation: 'slideIn 0.6s ease-out forwards'
    },
    progressRing: {
      position: 'relative',
      width: '128px',
      height: '128px',
      margin: '0 auto 2rem'
    },
    progressRingOuter: {
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      border: '4px solid rgba(0, 217, 255, 0.2)'
    },
    progressRingInner: {
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      border: '4px solid transparent',
      borderTopColor: '#00D9FF',
      animation: 'rotate 2s linear infinite'
    },
    progressRingIcon: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1rem',
      background: 'linear-gradient(90deg, #00D9FF, #0EA5E9, #00D9FF)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'gradientShift 4s ease infinite'
    },
    loadingSubtext: {
      fontSize: '1.25rem',
      color: '#d1d5db'
    },
    resultsContainer: {
      animation: 'slideIn 0.6s ease-out forwards'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'rgba(0, 217, 255, 0.03)',
      border: '1px solid rgba(0, 217, 255, 0.1)',
      borderRadius: '16px',
      padding: '1.5rem',
      transition: 'all 0.3s ease'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      background: 'linear-gradient(90deg, #00D9FF, #0EA5E9, #00D9FF)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#9ca3af'
    },
    detailSection: {
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.75rem',
      paddingBottom: '0.75rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600'
    },
    newAnalysisButton: {
      padding: '1rem 3rem',
      borderRadius: '16px',
      border: 'none',
      background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)',
      color: '#000000',
      fontSize: '1.125rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '2rem',
      boxShadow: '0 0 40px rgba(0, 217, 255, 0.4)'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
          }
          
          h1, h2, h3 {
            font-family: 'Poppins', sans-serif;
          }

          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-30px) scale(1.05); }
          }

          @keyframes slideIn {
            from { 
              opacity: 0; 
              transform: translateY(30px);
            }
            to { 
              opacity: 1; 
              transform: translateY(0);
            }
          }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          input::placeholder {
            color: #A3B0D0;
          }

          input:focus {
            background: rgba(0, 217, 255, 0.05);
            borderColor: #00D9FF;
            boxShadow: 0 0 20px rgba(0, 217, 255, 0.3);
          }

          button:hover {
            transform: translateY(-2px);
            boxShadow: 0 10px 40px rgba(0, 217, 255, 0.5), 0 0 30px rgba(0, 217, 255, 0.4);
          }

          button:active {
            transform: translateY(0);
          }

          .stat-card:hover {
            background: rgba(255, 255, 255, 0.06);
            borderColor: rgba(147, 51, 234, 0.3);
            transform: translateY(-4px);
          }
        `}
      </style>

      {/* Floating Orbs */}
      <div style={{...styles.floatingOrb, ...styles.orb1}}></div>
      <div style={{...styles.floatingOrb, ...styles.orb2}}></div>
      <div style={{...styles.floatingOrb, ...styles.orb3}}></div>

      {/* Grid Overlay */}
      <div style={styles.gridOverlay}></div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Back Button */}
        <button style={styles.backButton} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        {!loading && !completed && (
          <>
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.aiPoweredBadge}>
                <Sparkles size={16} style={{color: '#00D9FF'}} />
                <span style={{color: '#00D9FF', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'}}>AI-POWERED INFLUENCER ANALYSIS</span>
              </div>
              
              <h1 style={styles.title}>InfluenceScope</h1>
              
              <p style={styles.subtitle}>
                Deep Instagram influencer analysis with engagement metrics, authenticity scores, and partnership insights
              </p>
            </div>

            {/* Input Form */}
            <div style={styles.glassCard}>
              {error && (
                <div style={styles.errorBox}>
                  <div style={styles.errorDivider}></div>
                  <span style={{color: '#fca5a5'}}>{error}</span>
                </div>
              )}

              <div style={styles.inputWrapper}>
                <label style={styles.label}>
                  <Instagram size={18} style={{color: '#00D9FF'}} />
                  Instagram Username
                </label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="@nikkhil or nikkkhil"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              <button onClick={handleSubmit} style={styles.submitButton}>
                <Search size={22} />
                <span>Analyze Influencer</span>
                <Sparkles size={18} />
              </button>
            </div>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.glassCard}>
              <div style={styles.progressRing}>
                <div style={styles.progressRingOuter}></div>
                <div style={styles.progressRingInner}></div>
                <div style={styles.progressRingIcon}>
                  <Instagram size={48} style={{color: '#00D9FF', animation: 'pulse 1.5s infinite'}} />
                </div>
              </div>

              <h2 style={styles.loadingTitle}>Analyzing Profile</h2>
              
              <p style={styles.loadingSubtext}>
                Gathering engagement metrics, authenticity data, and audience insights...
              </p>
            </div>
          </div>
        )}

        {/* Results State */}
        {completed && analysisData && (
          <div style={styles.resultsContainer}>
            {/* Profile Overview */}
            <div style={styles.glassCard}>
              <h2 style={styles.sectionTitle}>
                <Instagram size={24} style={{color: '#00D9FF'}} />
                Profile Overview
              </h2>
              
              <div style={styles.statsGrid}>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>@{analysisData.profile_overview?.username}</div>
                  <div style={styles.statLabel}>{analysisData.profile_overview?.full_name}</div>
                </div>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>{analysisData.profile_overview?.followers?.toLocaleString()}</div>
                  <div style={styles.statLabel}>Followers</div>
                </div>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>{analysisData.profile_overview?.following?.toLocaleString()}</div>
                  <div style={styles.statLabel}>Following</div>
                </div>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>{analysisData.profile_overview?.total_posts}</div>
                  <div style={styles.statLabel}>Total Posts</div>
                </div>
              </div>

              {/* Classification */}
              <h2 style={{...styles.sectionTitle, marginTop: '2rem'}}>
                <Award size={24} style={{color: '#00D9FF'}} />
                Influencer Classification
              </h2>
              
              <div style={styles.detailSection}>
                <div style={styles.detailRow}>
                  <span style={{color: '#9ca3af'}}>Tier:</span>
                  <span style={{fontWeight: '600', color: 'white'}}>{analysisData.influencer_classification?.tier} ({analysisData.influencer_classification?.tier_range})</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={{color: '#9ca3af'}}>Niche:</span>
                  <span style={{fontWeight: '600', color: 'white'}}>{analysisData.influencer_classification?.niche}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={{color: '#9ca3af'}}>Content Type:</span>
                  <span style={{fontWeight: '600', color: 'white'}}>{analysisData.influencer_classification?.content_type}</span>
                </div>
                {analysisData.influencer_classification?.sub_niches && (
                  <div style={{marginTop: '1rem'}}>
                    <span style={{color: '#9ca3af', marginBottom: '0.5rem', display: 'block'}}>Sub-niches:</span>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                      {analysisData.influencer_classification.sub_niches.map((niche, idx) => (
                        <span key={idx} style={{
                          ...styles.badge,
                          background: 'rgba(147, 51, 234, 0.2)',
                          color: '#c084fc',
                          border: '1px solid rgba(147, 51, 234, 0.3)'
                        }}>
                          {niche}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Engagement Metrics */}
              <h2 style={{...styles.sectionTitle, marginTop: '2rem'}}>
                <TrendingUp size={24} style={{color: '#00D9FF'}} />
                Engagement Metrics
              </h2>
              
              <div style={styles.statsGrid}>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>{analysisData.engagement_metrics?.median_metrics?.engagement_rate}%</div>
                  <div style={styles.statLabel}>Median Engagement Rate</div>
                </div>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>{analysisData.engagement_metrics?.median_metrics?.median_likes?.toLocaleString()}</div>
                  <div style={styles.statLabel}>Median Likes</div>
                </div>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>{analysisData.engagement_metrics?.median_metrics?.median_comments?.toLocaleString()}</div>
                  <div style={styles.statLabel}>Median Comments</div>
                </div>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>{analysisData.engagement_metrics?.median_metrics?.median_video_views?.toLocaleString()}</div>
                  <div style={styles.statLabel}>Median Video Views</div>
                </div>
              </div>

              {/* Authenticity Analysis */}
              <h2 style={{...styles.sectionTitle, marginTop: '2rem'}}>
                <Shield size={24} style={{color: '#10b981'}} />
                Authenticity Analysis
              </h2>
              
              <div style={styles.statsGrid}>
                <div style={styles.statCard} className="stat-card">
                  <div style={{...styles.statValue, color: getGradeColor(analysisData.authenticity_analysis?.authenticity_grade)}}>
                    {analysisData.authenticity_analysis?.authenticity_score}/100
                  </div>
                  <div style={styles.statLabel}>Authenticity Score ({analysisData.authenticity_analysis?.authenticity_grade})</div>
                </div>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>{analysisData.authenticity_analysis?.fake_follower_probability}</div>
                  <div style={styles.statLabel}>Fake Follower Probability</div>
                </div>
              </div>

              {/* Red Flags & Green Flags */}
              {analysisData.authenticity_analysis?.red_flags && analysisData.authenticity_analysis.red_flags.length > 0 && (
                <div style={{...styles.detailSection, marginTop: '1rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                    <ThumbsDown size={20} style={{color: '#ef4444'}} />
                    <span style={{fontWeight: '600', color: 'white'}}>Red Flags</span>
                  </div>
                  {analysisData.authenticity_analysis.red_flags.map((flag, idx) => (
                    <div key={idx} style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5'
                    }}>
                      • {flag}
                    </div>
                  ))}
                </div>
              )}

              {analysisData.authenticity_analysis?.green_flags && analysisData.authenticity_analysis.green_flags.length > 0 && (
                <div style={{...styles.detailSection, marginTop: '1rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                    <ThumbsUp size={20} style={{color: '#10b981'}} />
                    <span style={{fontWeight: '600', color: 'white'}}>Green Flags</span>
                  </div>
                  {analysisData.authenticity_analysis.green_flags.map((flag, idx) => (
                    <div key={idx} style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#86efac'
                    }}>
                      • {flag}
                    </div>
                  ))}
                </div>
              )}

              {/* Audience Quality */}
              <h2 style={{...styles.sectionTitle, marginTop: '2rem'}}>
                <Users size={24} style={{color: '#f59e0b'}} />
                Audience Quality
              </h2>
              
              <div style={styles.statsGrid}>
                <div style={styles.statCard} className="stat-card">
                  <div style={{...styles.statValue, color: getGradeColor(analysisData.audience_quality?.quality_grade)}}>
                    {analysisData.audience_quality?.quality_score}/100
                  </div>
                  <div style={styles.statLabel}>Quality Score ({analysisData.audience_quality?.quality_grade})</div>
                </div>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>{analysisData.audience_quality?.estimated_real_followers?.toLocaleString()}</div>
                  <div style={styles.statLabel}>Estimated Real Followers</div>
                </div>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>{analysisData.audience_quality?.reach_potential?.typical_reach_per_post?.toLocaleString()}</div>
                  <div style={styles.statLabel}>Typical Reach Per Post</div>
                </div>
              </div>

              {/* Brand Partnership Analysis */}
              <h2 style={{...styles.sectionTitle, marginTop: '2rem'}}>
                <DollarSign size={24} style={{color: '#10b981'}} />
                Brand Partnership Analysis
              </h2>
              
              <div style={styles.statsGrid}>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>{analysisData.brand_partnership_analysis?.suitability_score}/100</div>
                  <div style={styles.statLabel}>Partnership Suitability</div>
                </div>
                <div style={styles.statCard} className="stat-card">
                  <div style={styles.statValue}>{analysisData.brand_partnership_analysis?.estimated_rates?.sponsored_reel}</div>
                  <div style={styles.statLabel}>Sponsored Reel Rate</div>
                </div>
              </div>

              {analysisData.brand_partnership_analysis?.ideal_brand_categories && (
                <div style={{...styles.detailSection, marginTop: '1rem'}}>
                  <span style={{color: '#9ca3af', marginBottom: '0.5rem', display: 'block'}}>Ideal Brand Categories:</span>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                    {analysisData.brand_partnership_analysis.ideal_brand_categories.map((category, idx) => (
                      <span key={idx} style={{
                        ...styles.badge,
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#86efac',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation */}
              <h2 style={{...styles.sectionTitle, marginTop: '2rem'}}>
                <Target size={24} style={{color: '#00D9FF'}} />
                Final Recommendation
              </h2>
              
              <div style={styles.detailSection}>
                <div style={styles.detailRow}>
                  <span style={{color: '#9ca3af'}}>Overall Rating:</span>
                  <span style={{fontWeight: '600', color: 'white'}}>{analysisData.recommendation?.overall_rating}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={{color: '#9ca3af'}}>Priority Tier:</span>
                  <span style={{fontWeight: '600', color: 'white'}}>{analysisData.recommendation?.priority_tier}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={{color: '#9ca3af'}}>Confidence Level:</span>
                  <span style={{fontWeight: '600', color: 'white'}}>{analysisData.recommendation?.confidence_level}</span>
                </div>
                {analysisData.recommendation?.summary && (
                  <div style={{marginTop: '1rem', padding: '1rem', background: 'rgba(147, 51, 234, 0.1)', borderRadius: '8px', border: '1px solid rgba(147, 51, 234, 0.3)'}}>
                    <div style={{display: 'flex', alignItems: 'start', gap: '0.5rem'}}>
                      <AlertCircle size={20} style={{color: '#c084fc', marginTop: '0.25rem', flexShrink: 0}} />
                      <span style={{color: '#d1d5db'}}>{analysisData.recommendation.summary}</span>
                    </div>
                  </div>
                )}
                {analysisData.recommendation?.key_insight && (
                  <div style={{marginTop: '1rem', padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.3)'}}>
                    <div style={{display: 'flex', alignItems: 'start', gap: '0.5rem'}}>
                      <Zap size={20} style={{color: '#f9a8d4', marginTop: '0.25rem', flexShrink: 0}} />
                      <span style={{color: '#d1d5db', fontWeight: '600'}}>{analysisData.recommendation.key_insight}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Items */}
              {analysisData.recommendation?.action_items && analysisData.recommendation.action_items.length > 0 && (
                <div style={{...styles.detailSection, marginTop: '1rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                    <CheckCircle size={20} style={{color: '#00D9FF'}} />
                    <span style={{fontWeight: '600', color: 'white'}}>Action Items</span>
                  </div>
                  {analysisData.recommendation.action_items.map((item, idx) => (
                    <div key={idx} style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      borderRadius: '8px',
                      background: 'rgba(0, 217, 255, 0.1)',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      color: '#93c5fd'
                    }}>
                      {idx + 1}. {item}
                    </div>
                  ))}
                </div>
              )}

              <div style={{textAlign: 'center'}}>
                <button onClick={resetForm} style={styles.newAnalysisButton}>
                  Analyze Another Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InfluenceScopePage;
