import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Youtube, Instagram, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { executeWithTokens } from './utils/tokenService';

function SocialInsightPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignId = location.state?.campaignId;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokensDeducted, setTokensDeducted] = useState(false);
  const hasDeductedRef = useRef(false); // Prevent double deduction
  const navigateRef = useRef(navigate); // Keep navigate stable

  // Update navigate ref when it changes
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

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

  // Token deduction when component mounts (user opens the agent)
  useEffect(() => {
    // Prevent multiple executions
    if (!session?.user || hasDeductedRef.current) return;

    const deductTokensForAccess = async () => {
      console.log('🎬 SocialInsight agent accessed, deducting 150 tokens...');
      
      // Mark as processing immediately to prevent race conditions
      hasDeductedRef.current = true;
      
      setLoading(true);
      setError('');

      try {
        // Execute with token deduction (150 tokens)
        const tokenResult = await executeWithTokens(
          session.user.id,
          'SocialInsight',
          async () => {
            // This is a session-based agent, no API call needed upfront
            // Tokens are deducted for access to the Streamlit app
            console.log('✅ Access granted to SocialInsight');
            return { 
              access_granted: true, 
              timestamp: new Date().toISOString() 
            };
          },
          { 
            action: 'access_granted',
            timestamp: new Date().toISOString() 
          }, // Request data
          1, // Token multiplier (fixed cost)
          `SocialInsight session access`, // Output summary
          campaignId // Campaign ID (if part of campaign)
        );

        // Check result
        if (!tokenResult.success) {
          setError(tokenResult.error);
          setLoading(false);
          hasDeductedRef.current = false; // Reset on error so user can try again
          // Redirect back to dashboard after 3 seconds
          setTimeout(() => navigateRef.current('/'), 3000);
          return;
        }

        // Success - tokens deducted
        console.log(`✅ SocialInsight access granted! Tokens deducted: ${tokenResult.tokensDeducted}`);
        console.log(`💰 Remaining tokens: ${tokenResult.tokensRemaining}`);
        
        setTokensDeducted(true);
        setLoading(false);

      } catch (err) {
        console.error('❌ Token deduction error:', err);
        setError(err.message || 'Failed to verify token balance');
        setLoading(false);
        hasDeductedRef.current = false; // Reset on error so user can try again
        // Redirect back to dashboard after 3 seconds
        setTimeout(() => navigateRef.current('/'), 3000);
      }
    };

    deductTokensForAccess();
  }, [session?.user?.id, campaignId]); // Only depend on user ID and campaignId

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
      maxWidth: '1600px',
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
      marginBottom: '2rem',
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
    platformBadges: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginBottom: '2rem'
    },
    platformBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontWeight: '600'
    },
    iframeContainer: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.1)',
      padding: '1rem',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'slideIn 0.6s ease-out forwards',
      animationDelay: '0.2s',
      opacity: 0,
      marginBottom: '2rem',
      minHeight: '900px'
    },
    iframe: {
      width: '100%',
      height: '850px',
      border: 'none',
      borderRadius: '16px',
      background: '#ffffff'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '5rem 2rem'
    },
    loaderWrapper: {
      position: 'relative',
      width: '120px',
      height: '120px',
      margin: '0 auto 2rem'
    },
    loaderRing: {
      position: 'absolute',
      inset: 0,
      border: '4px solid rgba(0, 217, 255, 0.2)',
      borderTop: '4px solid #00D9FF',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    loaderIcon: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#00D9FF',
      animation: 'pulse 2s infinite'
    },
    loadTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    loadText: {
      fontSize: '1.1rem',
      color: '#D1D5DB',
      marginBottom: '0.5rem'
    },
    errorBox: {
      maxWidth: '600px',
      margin: '3rem auto',
      padding: '2rem',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '24px',
      textAlign: 'center'
    },
    errorIcon: {
      width: '64px',
      height: '64px',
      margin: '0 auto 1.5rem',
      color: '#ef4444'
    },
    errorTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#fca5a5',
      marginBottom: '1rem'
    },
    errorText: {
      fontSize: '1rem',
      color: '#fecaca',
      marginBottom: '1.5rem',
      lineHeight: '1.6'
    },
    errorButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1rem 2rem',
      background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)',
      border: 'none',
      borderRadius: '16px',
      color: '#000000',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
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

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          button:hover {
            transform: translateY(-2px);
            boxShadow: 0 10px 40px rgba(147, 51, 234, 0.4), 0 0 20px rgba(236, 72, 153, 0.6);
          }

          button:active {
            transform: translateY(0);
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

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loaderWrapper}>
              <div style={styles.loaderRing}></div>
              <div style={styles.loaderIcon}>
                <Sparkles size={48} />
              </div>
            </div>
            <h2 style={styles.loadTitle}>Verifying Token Balance...</h2>
            <p style={styles.loadText}>Preparing SocialInsight for you</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={styles.errorBox}>
            <AlertCircle style={styles.errorIcon} />
            <h2 style={styles.errorTitle}>Access Denied</h2>
            <p style={styles.errorText}>{error}</p>
            <button style={styles.errorButton} onClick={() => navigate('/')}>
              <ArrowLeft size={18} />
              Return to Dashboard
            </button>
          </div>
        )}

        {/* Main Content - Only show when tokens are deducted */}
        {!loading && !error && tokensDeducted && (
          <>
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.aiPoweredBadge}>
                <Sparkles size={16} style={{color: '#00D9FF'}} />
                <span style={{color: '#00D9FF', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'}}>AI-POWERED SOCIAL MEDIA ANALYSIS</span>
              </div>
              
              <h1 style={styles.title}>SocialInsight</h1>
              
              <p style={styles.subtitle}>
                Download,Transcribe YouTube videos and Instagram profiles with AI
              </p>

              <div style={styles.platformBadges}>
                <div style={styles.platformBadge}>
                  <Youtube size={20} style={{color: '#ff0000'}} />
                  <span>YouTube Analysis</span>
                </div>
                <div style={styles.platformBadge}>
                  <Instagram size={20} style={{color: '#e4405f'}} />
                  <span>Instagram Analysis</span>
                </div>
              </div>
            </div>

            {/* Streamlit App Iframe */}
            <div style={styles.iframeContainer}>
              <iframe
                src="https://instagramwebapp.streamlit.app/?embed=true&embed_options=show_toolbar,show_padding,show_colored_line,show_footer"
                style={styles.iframe}
                title="SocialInsight Analyzer"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SocialInsightPage;
