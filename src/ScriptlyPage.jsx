import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { executeWithTokens } from './utils/tokenService';
import { handleCampaignTaskCompletion } from './services/campaignService';

function ScriptlyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignId = location.state?.campaignId;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Form state
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('YouTube Shorts');
  const [scriptLength, setScriptLength] = useState('45');
  const [variations, setVariations] = useState('3');
  const [specificHook, setSpecificHook] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [cta, setCta] = useState('');
  const [language, setLanguage] = useState('hinglish');

  const platformOptions = [
    'YouTube Shorts',
    'Instagram Reels',
    'TikTok',
    'LinkedIn'
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'hinglish', label: 'Hinglish' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' }
  ];

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setSession(session);
      }
    };
    getSession();
  }, [navigate]);

  const handleGenerate = async () => {
    if (!url.trim()) {
      alert('Please enter a video URL');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const requestData = {
        url: url.trim(),
        platform,
        scriptLength: `${scriptLength} seconds`,
        variations: variations.toString(),
        specificHook: specificHook.trim(),
        keyMessage: keyMessage.trim(),
        cta: cta.trim(),
        language
      };

      const outputSummary = `${variations} script variations for ${platform} (${scriptLength}s) in ${language}`;

      const tokenResult = await executeWithTokens(
        session.user.id,
        'Scriptly',
        async () => {
          const response = await fetch('https://glowing-g79w8.crab.containers.automata.host/webhook/scriptly', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([requestData])
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Scriptly API Error:', errorText);
            throw new Error(`Scriptly API error: ${response.status} - ${errorText}`);
          }

          const responseText = await response.text();
          if (!responseText || responseText.trim() === '') {
            throw new Error('Empty response from Scriptly webhook');
          }

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            throw new Error('Invalid JSON response from Scriptly webhook');
          }

          return data;
        },
        requestData,
        1, // Token multiplier (Scriptly uses 1x the base cost of 300 tokens)
        outputSummary,
        campaignId
      );

      if (tokenResult.success) {
        setResult(tokenResult.data);

        // Handle campaign integration
        if (campaignId && tokenResult.logId) {
          try {
            const { data: agentData, error: agentError } = await supabase
              .from('agents')
              .select('id')
              .eq('name', 'Scriptly')
              .single();

            if (agentError) {
              console.error('Error fetching Scriptly agent ID:', agentError);
            } else if (agentData) {
              await handleCampaignTaskCompletion(
                campaignId,
                agentData.id,
                'Scriptly',
                tokenResult.logId,
                tokenResult.data,
                outputSummary
              );

              alert('Script variations saved to campaign! You can run this agent again to create additional variations.');
            }
          } catch (campaignError) {
            console.error('Campaign completion error:', campaignError);
          }
        }
      } else {
        alert(tokenResult.message || 'Failed to generate scripts');
      }
    } catch (error) {
      console.error('Scriptly Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderVariations = () => {
    if (!result || !Array.isArray(result) || result.length === 0) return null;

    const outputData = result[0]?.output;
    if (!outputData) return null;

    const variationKeys = Object.keys(outputData).filter(key => key.startsWith('variation_'));

    return (
      <div style={styles.resultsContainer}>
        <div style={styles.resultsHeader}>
          <h2 style={styles.resultsTitle}>📝 Script Variations</h2>
          <button style={styles.newAnalysisButton} onClick={() => setResult(null)}>
            🎬 Generate New Scripts
          </button>
        </div>
        {variationKeys.map((key, index) => {
          const variation = outputData[key];
          return (
            <div key={key} style={styles.variationCard}>
              <div style={styles.variationHeader}>
                <h3 style={styles.variationNumber}>Variation {index + 1}</h3>
                <span style={styles.retentionBadge}>
                  📊 {variation.estimated_retention_score}
                </span>
              </div>

              <div style={styles.variationTitle}>
                <strong style={styles.sectionLabel}>Title:</strong>
                <div style={styles.sectionContent}>{variation.title}</div>
              </div>

              <div style={styles.hookStrategy}>
                <strong style={styles.sectionLabel}>Hook Strategy:</strong>
                <div style={styles.sectionContent}>{variation.hook_strategy}</div>
              </div>

              <div style={styles.fullScript}>
                <strong style={styles.scriptLabel}>Full Script:</strong>
                <p style={styles.scriptText}>{variation.full_script}</p>
              </div>

              {variation.scene_breakdown && variation.scene_breakdown.length > 0 && (
                <div style={styles.sceneBreakdown}>
                  <strong style={styles.breakdownLabel}>Scene Breakdown:</strong>
                  {variation.scene_breakdown.map((scene, sceneIndex) => (
                    <div key={sceneIndex} style={styles.sceneItem}>
                      <div style={styles.sceneTimestamp}>⏱️ {scene.timestamp}</div>
                      <div style={styles.sceneDetail}>
                        <strong style={styles.detailLabel}>Voiceover:</strong> {scene.voiceover}
                      </div>
                      <div style={styles.sceneDetail}>
                        <strong style={styles.detailLabel}>Visual:</strong> {scene.visual}
                      </div>
                      <div style={styles.sceneDetail}>
                        <strong style={styles.detailLabel}>On-Screen Text:</strong> {scene.on_screen_text}
                      </div>
                      {scene.note && (
                        <div style={styles.sceneNote}>
                          <strong>Note:</strong> {scene.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={styles.whyWorks}>
                <strong style={styles.sectionLabel}>Why This Works:</strong>
                <div style={styles.sectionContent}>{variation.why_this_works}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <style>{keyframes}</style>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎬 Scriptly</h1>
          <p style={styles.subtitle}>Generate viral short-form video scripts with AI</p>
          <button style={styles.backButton} onClick={() => navigate(campaignId ? `/campaigns/${campaignId}` : '/')}>
            ← Back to {campaignId ? 'Campaign' : 'Dashboard'}
          </button>
        </div>

        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingAnimation}>
              <div style={styles.videoTape}>🎥</div>
              <div style={styles.arrow}>→</div>
              <div style={styles.script}>📝</div>
            </div>
            <p style={styles.loadingText}>Converting video to viral scripts...</p>
            <p style={styles.loadingSubtext}>Analyzing hooks, pacing, and retention patterns</p>
          </div>
        )}

        {!loading && !result && (
          <div style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Video URL *</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                style={styles.input}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  style={styles.select}
                >
                  {platformOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Script Length (seconds)</label>
                <input
                  type="number"
                  value={scriptLength}
                  onChange={(e) => setScriptLength(e.target.value)}
                  min="15"
                  max="90"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Number of Variations (1-5)</label>
                <input
                  type="number"
                  value={variations}
                  onChange={(e) => setVariations(Math.min(5, Math.max(1, e.target.value)))}
                  min="1"
                  max="5"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={styles.select}
                >
                  {languageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Specific Hook</label>
              <input
                type="text"
                value={specificHook}
                onChange={(e) => setSpecificHook(e.target.value)}
                placeholder="What if AI could actually feel fear?"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Key Message for Body</label>
              <textarea
                value={keyMessage}
                onChange={(e) => setKeyMessage(e.target.value)}
                placeholder="A new AI model shows early signs of self-awareness — and it's terrifying researchers."
                rows="3"
                style={styles.textarea}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Call to Action</label>
              <input
                type="text"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="Subscribe for more AI revelations."
                style={styles.input}
              />
            </div>

            <button
              style={styles.generateButton}
              onClick={handleGenerate}
            >
              🎬 Generate Scripts
            </button>

            <div style={styles.tokenInfo}>
              💎 Cost: 300 tokens per generation
            </div>
          </div>
        )}

        {!loading && result && renderVariations()}
      </div>
    </div>
  );
}

const keyframes = `
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.1);
    }
  }

  @keyframes slideArrow {
    0%, 100% {
      opacity: 0.4;
      transform: translateX(0);
    }
    50% {
      opacity: 1;
      transform: translateX(10px);
    }
  }
`;

const styles = {
  page: {
    minHeight: '100vh',
    background: '#000000',
    padding: '2rem 1rem',
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    color: 'white',
    animation: 'fadeInDown 0.6s ease-out',
  },
  title: {
    fontSize: '3.5rem',
    margin: '0 0 1rem 0',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: '1.25rem',
    opacity: 0.9,
    marginBottom: '1.5rem',
    color: '#D1D5DB',
    fontWeight: '400',
  },
  backButton: {
    background: 'rgba(0, 217, 255, 0.05)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    color: '#00D9FF',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  loadingContainer: {
    background: 'rgba(0, 217, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 217, 255, 0.1)',
    borderRadius: '24px',
    padding: '4rem 3rem',
    textAlign: 'center',
    animation: 'fadeInUp 0.6s ease-out',
  },
  loadingAnimation: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '2rem',
    marginBottom: '2rem',
    fontSize: '4rem',
  },
  videoTape: {
    animation: 'pulse 2s ease-in-out infinite',
    color: '#00D9FF',
  },
  arrow: {
    animation: 'slideArrow 1.5s ease-in-out infinite',
    color: '#00D9FF',
    fontSize: '3rem',
  },
  script: {
    animation: 'pulse 2s ease-in-out infinite 0.5s',
    color: '#00D9FF',
  },
  loadingText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
  },
  loadingSubtext: {
    fontSize: '1rem',
    color: '#D1D5DB',
    fontStyle: 'italic',
  },
  form: {
    background: 'rgba(0, 217, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 217, 255, 0.1)',
    borderRadius: '24px',
    padding: '3rem',
    boxShadow: '0 0 60px rgba(0, 217, 255, 0.2)',
    animation: 'fadeInUp 0.6s ease-out 0.1s both',
  },
  formGroup: {
    marginBottom: '2rem',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#D1D5DB',
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'rgba(0, 217, 255, 0.05)',
    border: '2px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '12px',
    fontSize: '1rem',
    color: '#FFFFFF',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'rgba(0, 217, 255, 0.05)',
    border: '2px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '12px',
    fontSize: '1rem',
    color: '#FFFFFF',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'rgba(0, 217, 255, 0.05)',
    border: '2px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '12px',
    fontSize: '1rem',
    color: '#FFFFFF',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '100px',
    lineHeight: '1.6',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  generateButton: {
    width: '100%',
    padding: '1.25rem 2rem',
    background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)',
    color: '#000000',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.125rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 0 40px rgba(0, 217, 255, 0.4)',
    marginTop: '1.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tokenInfo: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#D1D5DB',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '1rem',
    background: 'rgba(0, 217, 255, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(0, 217, 255, 0.2)',
  },
  resultsContainer: {
    animation: 'fadeInUp 0.6s ease-out 0.2s both',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  resultsTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },
  newAnalysisButton: {
    background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)',
    color: '#000000',
    border: 'none',
    padding: '0.875rem 1.75rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 0 30px rgba(0, 217, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  variationCard: {
    background: 'rgba(0, 217, 255, 0.03)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '20px',
    padding: '2.5rem',
    marginBottom: '2.5rem',
    boxShadow: '0 0 40px rgba(0, 217, 255, 0.2)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  variationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid rgba(0, 217, 255, 0.1)',
  },
  variationNumber: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  retentionBadge: {
    background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)',
    color: '#000000',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    fontWeight: '700',
    fontSize: '1rem',
    boxShadow: '0 0 30px rgba(0, 217, 255, 0.4)',
  },
  variationTitle: {
    marginBottom: '1.5rem',
    padding: '1.25rem 1.5rem',
    background: 'rgba(0, 217, 255, 0.05)',
    borderRadius: '12px',
    borderLeft: '4px solid #00D9FF',
  },
  hookStrategy: {
    marginBottom: '1.5rem',
    padding: '1.25rem 1.5rem',
    background: 'rgba(0, 217, 255, 0.05)',
    borderRadius: '12px',
    borderLeft: '4px solid #00D9FF',
  },
  whyWorks: {
    padding: '1.25rem 1.5rem',
    background: 'rgba(0, 217, 255, 0.1)',
    borderRadius: '12px',
    borderLeft: '4px solid #00D9FF',
  },
  sectionLabel: {
    display: 'block',
    color: '#00D9FF',
    marginBottom: '0.75rem',
    fontSize: '0.95rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '700',
  },
  sectionContent: {
    color: '#D1D5DB',
    lineHeight: '1.7',
    fontSize: '1rem',
  },
  fullScript: {
    marginBottom: '2rem',
    padding: '2rem',
    background: 'rgba(0, 217, 255, 0.05)',
    borderRadius: '16px',
    border: '2px solid rgba(0, 217, 255, 0.3)',
    boxShadow: '0 0 40px rgba(0, 217, 255, 0.2)',
  },
  scriptLabel: {
    display: 'block',
    color: '#00D9FF',
    marginBottom: '1rem',
    fontSize: '1.125rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '700',
  },
  scriptText: {
    margin: 0,
    lineHeight: '1.9',
    color: '#FFFFFF',
    whiteSpace: 'pre-wrap',
    fontSize: '1rem',
  },
  sceneBreakdown: {
    marginBottom: '2rem',
    padding: '2rem',
    background: 'rgba(0, 217, 255, 0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(0, 217, 255, 0.1)',
  },
  breakdownLabel: {
    display: 'block',
    color: '#00D9FF',
    marginBottom: '1.5rem',
    fontSize: '1.125rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '700',
  },
  sceneItem: {
    background: 'rgba(0, 217, 255, 0.05)',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.25rem',
    borderLeft: '4px solid #00D9FF',
    boxShadow: '0 0 20px rgba(0, 217, 255, 0.15)',
  },
  sceneTimestamp: {
    fontWeight: '800',
    color: '#00D9FF',
    marginBottom: '1rem',
    fontSize: '1.125rem',
    letterSpacing: '0.5px',
  },
  sceneDetail: {
    marginBottom: '0.75rem',
    lineHeight: '1.7',
    color: '#D1D5DB',
    fontSize: '0.95rem',
  },
  detailLabel: {
    color: '#00D9FF',
    marginRight: '0.5rem',
    fontWeight: '600',
  },
  sceneNote: {
    color: '#D1D5DB',
    fontStyle: 'italic',
    paddingLeft: '1.25rem',
    borderLeft: '3px solid rgba(0, 217, 255, 0.3)',
    marginTop: '1rem',
    lineHeight: '1.7',
  },
};

export default ScriptlyPage;
