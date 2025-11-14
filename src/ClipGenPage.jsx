import { useState, useEffect } from 'react';
import { ArrowLeft, Film, Clock, TrendingUp, Scissors, Sparkles, Copy, Check, Zap, Play } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { executeWithTokens } from './utils/tokenService';
import { handleCampaignTaskCompletion } from './services/campaignService';

function ClipGenPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignId = location.state?.campaignId;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedCaption, setCopiedCaption] = useState(null);

  // Form state
  const [sourceUrl, setSourceUrl] = useState('');
  const [clipStyle, setClipStyle] = useState('mix');
  const [maxClips, setMaxClips] = useState(5);

  const clipStyleOptions = [
    { value: 'viral_hooks', label: 'Viral Hooks', desc: 'Bold statements, shocking revelations (15-30s)' },
    { value: 'key_takeaways', label: 'Key Takeaways', desc: 'Quotable insights, summary statements (20-45s)' },
    { value: 'actionable_advice', label: 'Actionable Advice', desc: 'Step-by-step instructions, how-to segments (30-60s)' },
    { value: 'statistical_highlights', label: 'Statistical Highlights', desc: 'Data reveals, research findings (20-40s)' },
    { value: 'storytelling_anecdotes', label: 'Storytelling', desc: 'Complete mini-stories with setup & resolution (45-90s)' },
    { value: 'emotional_peaks', label: 'Emotional Peaks', desc: 'Genuine laughter, passionate delivery (15-45s)' },
    { value: 'controversial_statements', label: 'Controversial', desc: 'Hot takes, debatable opinions (20-35s)' },
    { value: 'qa_segments', label: 'Q&A Segments', desc: 'Question-answer pairs (30-60s)' },
    { value: 'transformation_moments', label: 'Transformation', desc: 'Before/after, breakthrough realizations (40-70s)' },
    { value: 'expert_insights', label: 'Expert Insights', desc: 'Technical deep-dives, insider knowledge (35-60s)' },
    { value: 'relatable_struggles', label: 'Relatable Struggles', desc: 'Pain points, common frustrations (25-50s)' },
    { value: 'myth_busting', label: 'Myth Busting', desc: 'Misconceptions debunked (30-55s)' },
    { value: 'mix', label: 'Mix (Recommended)', desc: 'AI selects best combination of styles' }
  ];

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

  // Redirect if not logged in
  useEffect(() => {
    if (session === null) return;
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);

  const copyToClipboard = (text, clipId) => {
    navigator.clipboard.writeText(text);
    setCopiedCaption(clipId);
    setTimeout(() => setCopiedCaption(null), 2000);
  };

  const getViralityColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const handleGenerate = async () => {
    if (!sourceUrl) {
      alert('Please enter a YouTube URL');
      return;
    }

    if (!session || !session.user) {
      alert('Please log in to use ClipGen');
      navigate('/login');
      return;
    }

    setLoading(true);
    setResult(null);

    const outputSummary = `Generated ${maxClips} viral clips from YouTube video using ${clipStyle} style`;

    try {
      const tokenResult = await executeWithTokens(
        session.user.id,
        'ClipGen',
        async () => {
          console.log('🚀 Sending request to ClipGen webhook...');
          console.log('Sending data:', { url: sourceUrl, clip_style: clipStyle, max_clips: maxClips });
          
          const response = await fetch('https://glowing-g79w8.crab.containers.automata.host/webhook/Clipgen', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              url: sourceUrl,
              clip_style: clipStyle,
              max_clips: maxClips
            })
          });

          console.log('📡 Response status:', response.status);
          console.log('📡 Response headers:', [...response.headers.entries()]);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ ClipGen API Error:', errorText);
            throw new Error(`ClipGen API error: ${response.status} - ${errorText}`);
          }

          const responseText = await response.text();
          console.log('📝 Raw response text length:', responseText?.length || 0);
          console.log('📝 Raw response text:', responseText);
          
          if (!responseText || responseText.trim() === '') {
            console.error('❌ Empty response received from webhook');
            throw new Error('Empty response from ClipGen webhook');
          }

          let data;
          try {
            data = JSON.parse(responseText);
            console.log('✅ Parsed JSON successfully:', data);
          } catch (parseError) {
            console.error('❌ Failed to parse JSON:', responseText);
            console.error('Parse error:', parseError);
            throw new Error('Invalid JSON response from ClipGen webhook');
          }

          console.log('✅ ClipGen Response:', JSON.stringify(data, null, 2));
          return data;
        },
        { url: sourceUrl, clip_style: clipStyle, max_clips: maxClips }, // Request data for logging
        1,
        outputSummary
      );

      if (tokenResult.success) {
        let outputData = tokenResult.data;
        
        console.log('ClipGen raw result:', JSON.stringify(outputData, null, 2));
        console.log('Type of raw result:', typeof outputData);
        console.log('Is array?', Array.isArray(outputData));
        
        if (Array.isArray(outputData) && outputData.length > 0) {
          console.log('Unwrapping array, first element:', outputData[0]);
          outputData = outputData[0];
          console.log('After array unwrap:', outputData);
          console.log('Type after array unwrap:', typeof outputData);
        }
        
        if (outputData && typeof outputData === 'object' && outputData.output) {
          console.log('Found output property, unwrapping...');
          outputData = outputData.output;
          console.log('After output unwrap:', outputData);
          console.log('Type after output unwrap:', typeof outputData);
        }

        console.log('Final extracted data:', JSON.stringify(outputData, null, 2));
        
        if (!outputData || typeof outputData !== 'object') {
          console.error('Invalid data structure. Expected format: {metadata, clips[], strategy, notes}');
          console.error('Received:', outputData);
          console.error('Type:', typeof outputData);
          alert('Received invalid data format from ClipGen. Data is not an object. Please try again.');
          setLoading(false);
          return;
        }

        if (!outputData.clips || !Array.isArray(outputData.clips)) {
          console.error('Invalid data structure. Missing clips array.');
          console.error('Has clips property?', 'clips' in outputData);
          console.error('Clips value:', outputData.clips);
          console.error('Full data:', outputData);
          alert('Received invalid data format from ClipGen. Missing clips array. Please try again.');
          setLoading(false);
          return;
        }

        if (outputData.clips.length === 0) {
          console.warn('No clips generated');
          alert('No clips were generated. Try adjusting your parameters or using a different video.');
          setLoading(false);
          return;
        }

        console.log('Validation passed! Setting result with', outputData.clips.length, 'clips');
        setResult(outputData);

        if (campaignId && tokenResult.logId) {
          console.log('📁 This is part of campaign:', campaignId);
          console.log('📁 Log ID from tokenResult:', tokenResult.logId);
          
          // Get agent ID from database
          const { data: agentData, error: agentError } = await supabase
            .from('agents')
            .select('id')
            .eq('name', 'ClipGen')
            .single();
          
          if (agentError) {
            console.error('❌ Error fetching agent ID:', agentError);
          } else if (!agentData) {
            console.error('❌ ClipGen agent not found in database');
          } else {
            const agentId = agentData.id;
            console.log('✅ Agent ID:', agentId);
            
            console.log('📁 Calling handleCampaignTaskCompletion with:', {
              campaignId,
              agentId,
              agentName: 'ClipGen',
              logId: tokenResult.logId,
              outputSummary
            });
            
            const campaignResult = await handleCampaignTaskCompletion(
              campaignId,
              agentId,
              'ClipGen',
              tokenResult.logId,
              outputData,
              outputSummary
            );
            
            if (campaignResult.success) {
              console.log('✅ Campaign artifact saved successfully!');
            } else {
              console.error('❌ Failed to save campaign artifact:', campaignResult.error);
            }
          }
        }
      } else {
        alert(tokenResult.error || 'Failed to generate clips');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSourceUrl('');
    setClipStyle('mix');
    setMaxClips(5);
  };

  if (!session) {
    return null;
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      {!result && (
        <div style={s.hero}>
          <div style={s.heroIcon}>
            <Film size={48} />
            <Sparkles size={24} style={s.sparkle} />
          </div>
          <h1 style={s.title}>ClipGen AI</h1>
          <p style={s.subtitle}>Transform long-form videos into viral short-form clips with AI-powered analysis</p>
        </div>
      )}

      <div style={s.main}>
        {!result && !loading && (
          <div style={s.card}>
            <div style={s.formGroup}>
              <label style={s.label}>YouTube URL</label>
              <div style={s.inputWrapper}>
                <Play size={20} style={s.inputIcon} />
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={s.input}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                />
              </div>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Clip Style</label>
              <select
                value={clipStyle}
                onChange={(e) => setClipStyle(e.target.value)}
                style={s.select}
              >
                {clipStyleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.desc}
                  </option>
                ))}
              </select>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Maximum Clips: {maxClips}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={maxClips}
                onChange={(e) => setMaxClips(parseInt(e.target.value))}
                style={s.slider}
              />
              <div style={s.sliderLabels}>
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            <div style={s.tokenInfo}>
              <Zap size={20} style={{color: '#f59e0b'}} />
              <span>This will cost <strong>350 tokens</strong></span>
            </div>

            <button onClick={handleGenerate} style={s.btn} disabled={!sourceUrl || loading}>
              <Film size={20} /> Generate Viral Clips
            </button>
          </div>
        )}

        {loading && (
          <div style={s.loading}>
            <div style={s.loaderWrapper}>
              <div style={s.videoIcon}>
                <Film size={60} />
              </div>
              <div style={s.scissorsWrapper}>
                <Scissors size={40} style={s.scissors} />
              </div>
              <div style={s.clipsContainer}>
                <div style={{...s.miniClip, ...s.clip1}}>
                  <Sparkles size={20} />
                </div>
                <div style={{...s.miniClip, ...s.clip2}}>
                  <TrendingUp size={20} />
                </div>
                <div style={{...s.miniClip, ...s.clip3}}>
                  <Zap size={20} />
                </div>
              </div>
            </div>
            <h2 style={s.loadTitle}>Analyzing Your Video...</h2>
            <p style={s.loadText}>🎬 Finding viral moments • ✂️ Crafting clips • 🔥 Scoring virality</p>
          </div>
        )}

        {result && (
          <div style={s.results}>
            <div style={s.resultHeader}>
              <div>
                <h1 style={s.reportTitle}>Viral Clips Report</h1>
                <p style={s.reportSub}>{result.metadata?.source_title || 'YouTube Video'}</p>
                <p style={s.reportMeta}>
                  📹 {Math.floor(result.metadata?.source_duration_sec / 60)}:{(result.metadata?.source_duration_sec % 60).toString().padStart(2, '0')} | 
                  🎬 {result.metadata?.clips_generated || result.clips?.length} clips | 
                  🔥 Score: {result.metadata?.total_virality_score}
                </p>
              </div>
              <button onClick={handleReset} style={s.newBtn}>
                <Film size={18} /> New Analysis
              </button>
            </div>

            {/* Clips */}
            <div style={s.card}>
              <h2 style={s.h2}><Scissors size={24} /> Generated Clips ({result.clips?.length || 0})</h2>

              <div style={s.clipsGrid}>
                {result.clips?.map((clip, idx) => (
                  <div key={clip.clip_id} style={s.clipCard}>
                    <div style={s.clipHeader}>
                      <div style={s.clipLeft}>
                        <div style={s.rankBadge}>#{clip.rank}</div>
                        <div>
                          <div style={s.clipId}>{clip.clip_id}</div>
                          <div style={s.timestamps}>
                            <Clock size={14} />
                            {clip.timestamps?.start} → {clip.timestamps?.end} ({clip.timestamps?.duration_sec}s)
                          </div>
                        </div>
                      </div>
                      <div 
                        style={{
                          ...s.viralityBadge,
                          backgroundColor: `${getViralityColor(clip.virality_score)}20`,
                          borderColor: getViralityColor(clip.virality_score),
                          color: getViralityColor(clip.virality_score)
                        }}
                      >
                        🔥 {clip.virality_score}/100
                      </div>
                    </div>

                    <div style={s.transcript}>
                      <div style={s.sectionLabel}>📝 Transcript</div>
                      <div style={s.transcriptText}>"{clip.transcript}"</div>
                    </div>

                    <div style={s.caption}>
                      <div style={s.sectionLabel}>✨ Caption</div>
                      <div style={s.captionText}>{clip.caption}</div>
                      <button
                        style={copiedCaption === clip.clip_id ? s.copyBtnCopied : s.copyBtn}
                        onClick={() => copyToClipboard(clip.caption, clip.clip_id)}
                      >
                        {copiedCaption === clip.clip_id ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                      </button>
                    </div>

                    <div style={s.platforms}>
                      <div style={s.sectionLabel}>🎯 Platforms</div>
                      <div style={s.platformTags}>
                        {clip.platforms?.map((platform) => (
                          <span
                            key={platform}
                            style={platform === clip.best_platform ? s.platformBest : s.platformTag}
                          >
                            {platform === clip.best_platform && '⭐ '}
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy */}
            {result.strategy && (
              <div style={s.card}>
                <h2 style={s.h2}><Sparkles size={24} /> Publishing Strategy</h2>

                {result.strategy.hashtags && result.strategy.hashtags.length > 0 && (
                  <div style={s.strategySection}>
                    <h3 style={s.h3}>Recommended Hashtags</h3>
                    <div style={s.hashtags}>
                      {result.strategy.hashtags.map((tag, idx) => (
                        <span key={idx} style={s.hashtag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {result.strategy.posting_schedule && result.strategy.posting_schedule.length > 0 && (
                  <div style={s.strategySection}>
                    <h3 style={s.h3}>Posting Schedule</h3>
                    <div style={s.scheduleGrid}>
                      {result.strategy.posting_schedule.map((item, idx) => (
                        <div key={idx} style={s.scheduleItem}>
                          <div style={s.scheduleClip}>{item.clip_id}</div>
                          <div style={s.scheduleDay}>{item.day}</div>
                          <div style={s.scheduleTime}>{item.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {result.notes && (
              <div style={s.card}>
                <h2 style={s.h2}>📌 Notes</h2>
                <p style={s.notesText}>{result.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', background: '#000000', color: '#FFFFFF', fontFamily: "'Space Grotesk', system-ui, sans-serif" },
  header: { padding: '1.5rem 2rem', borderBottom: '1px solid rgba(0, 217, 255, 0.2)' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.2)', color: '#00D9FF', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  hero: { textAlign: 'center', padding: '4rem 2rem', position: 'relative' },
  heroIcon: { position: 'relative', display: 'inline-flex', padding: '1.5rem', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '20px', marginBottom: '1.5rem', border: '1px solid rgba(0, 217, 255, 0.3)', color: '#00D9FF', boxShadow: '0 0 40px rgba(0, 217, 255, 0.3)' },
  sparkle: { position: 'absolute', top: '10px', right: '10px', color: '#00D9FF', animation: 'sparkle 2s infinite' },
  title: { fontSize: '3rem', fontWeight: '700', background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' },
  subtitle: { fontSize: '1.25rem', color: '#D1D5DB' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  card: { background: 'rgba(0, 217, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 217, 255, 0.1)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem' },
  formGroup: { marginBottom: '1.5rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#00D9FF', zIndex: 1 },
  input: { width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '12px', color: '#FFFFFF', fontSize: '1rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxSizing: 'border-box' },
  select: { width: '100%', padding: '1rem', background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '12px', color: '#FFFFFF', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  slider: { width: '100%', height: '6px', background: 'rgba(0, 217, 255, 0.2)', borderRadius: '10px', outline: 'none', appearance: 'none', cursor: 'pointer' },
  sliderLabels: { display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: '#D1D5DB' },
  tokenInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(0, 217, 255, 0.1)', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '12px', marginBottom: '1rem', color: '#00D9FF' },
  btn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)', border: 'none', color: '#000000', padding: '1.25rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 40px rgba(0, 217, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  loading: { textAlign: 'center', padding: '4rem 2rem' },
  loaderWrapper: { position: 'relative', width: '300px', height: '150px', margin: '0 auto 2rem' },
  videoIcon: { position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: '#00D9FF', animation: 'pulse 2s infinite' },
  scissorsWrapper: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 },
  scissors: { color: '#00D9FF', animation: 'scissorsCut 2s ease-in-out infinite' },
  clipsContainer: { position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '1rem' },
  miniClip: { padding: '0.75rem', background: 'rgba(0, 217, 255, 0.2)', borderRadius: '12px', border: '2px solid rgba(0, 217, 255, 0.4)', color: '#00D9FF', opacity: 0, animation: 'clipAppear 2s ease-in-out infinite' },
  clip1: { animationDelay: '0.5s' },
  clip2: { animationDelay: '1s' },
  clip3: { animationDelay: '1.5s' },
  loadTitle: { fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  loadText: { fontSize: '1.1rem', color: '#D1D5DB' },
  results: { animation: 'fadeIn 0.5s ease' },
  resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  reportTitle: { fontSize: '2.5rem', fontWeight: '700', background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' },
  reportSub: { fontSize: '1.1rem', color: '#D1D5DB', marginBottom: '0.25rem' },
  reportMeta: { fontSize: '0.95rem', color: '#D1D5DB' },
  newBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)', border: 'none', color: '#000000', padding: '0.875rem 1.75rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 30px rgba(0, 217, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  h2: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#FFFFFF' },
  h3: { fontSize: '1.1rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '1rem' },
  clipsGrid: { display: 'grid', gap: '1.5rem' },
  clipCard: { background: 'rgba(0, 217, 255, 0.03)', border: '1px solid rgba(0, 217, 255, 0.1)', borderRadius: '16px', padding: '1.5rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  clipHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0, 217, 255, 0.05)' },
  clipLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  rankBadge: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #00D9FF, #0EA5E9)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem', flexShrink: 0, color: '#000000' },
  clipId: { fontSize: '1rem', fontWeight: '600', color: '#FFFFFF', marginBottom: '0.25rem' },
  timestamps: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#D1D5DB' },
  viralityBadge: { padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: '600', fontSize: '0.875rem', border: '2px solid' },
  transcript: { marginBottom: '1rem', padding: '1rem', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '10px', borderLeft: '3px solid #00D9FF' },
  sectionLabel: { fontSize: '0.75rem', fontWeight: '600', color: '#00D9FF', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  transcriptText: { color: '#D1D5DB', lineHeight: '1.6', fontStyle: 'italic' },
  caption: { marginBottom: '1rem', padding: '1rem', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '10px', borderLeft: '3px solid #00D9FF' },
  captionText: { color: '#D1D5DB', lineHeight: '1.6', marginBottom: '0.75rem' },
  copyBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(0, 217, 255, 0.2)', border: '1px solid rgba(0, 217, 255, 0.5)', borderRadius: '8px', color: '#FFFFFF', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  copyBtnCopied: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(0, 217, 255, 0.3)', border: '1px solid rgba(0, 217, 255, 0.5)', borderRadius: '8px', color: '#00D9FF', fontSize: '0.875rem', cursor: 'pointer' },
  platforms: { marginTop: '1rem' },
  platformTags: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  platformTag: { padding: '0.5rem 1rem', background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.1)', borderRadius: '20px', fontSize: '0.875rem', color: '#D1D5DB' },
  platformBest: { padding: '0.5rem 1rem', background: 'rgba(0, 217, 255, 0.2)', border: '2px solid rgba(0, 217, 255, 0.5)', borderRadius: '20px', fontSize: '0.875rem', color: '#00D9FF', fontWeight: '600' },
  strategySection: { marginBottom: '2rem' },
  hashtags: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' },
  hashtag: { padding: '0.5rem 1rem', background: 'rgba(0, 217, 255, 0.2)', border: '1px solid rgba(0, 217, 255, 0.5)', borderRadius: '20px', color: '#00D9FF', fontWeight: '500', fontSize: '0.875rem' },
  scheduleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  scheduleItem: { display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'rgba(0, 217, 255, 0.03)', border: '1px solid rgba(0, 217, 255, 0.1)', borderRadius: '12px' },
  scheduleClip: { fontSize: '0.875rem', color: '#00D9FF', fontWeight: '600' },
  scheduleDay: { fontSize: '1rem', color: '#FFFFFF', fontWeight: '600' },
  scheduleTime: { fontSize: '0.875rem', color: '#D1D5DB' },
  notesText: { color: '#D1D5DB', lineHeight: '1.7', fontSize: '1rem' },
};

const css = document.createElement('style');
css.textContent = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes sparkle { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.2) rotate(180deg); } }
@keyframes scissorsCut { 0%, 100% { transform: rotate(0deg) scale(1); } 25% { transform: rotate(-15deg) scale(1.1); } 75% { transform: rotate(15deg) scale(1.1); } }
@keyframes clipAppear { 0% { opacity: 0; transform: translateX(20px) scale(0.8); } 50% { opacity: 1; transform: translateX(0) scale(1); } 100% { opacity: 1; transform: translateX(0) scale(1); } }
input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: linear-gradient(135deg, #00D9FF, #0EA5E9); border-radius: 50%; cursor: pointer; box-shadow: 0 2px 10px rgba(0, 217, 255, 0.5); }
input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; background: linear-gradient(135deg, #00D9FF, #0EA5E9); border-radius: 50%; cursor: pointer; border: none; box-shadow: 0 2px 10px rgba(0, 217, 255, 0.5); }
input:focus { outline: none; border-color: #00D9FF; box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1); }
button:hover { transform: translateY(-2px); box-shadow: 0 0 60px rgba(0, 217, 255, 0.6) !important; }
button:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
.clip-card:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(0, 217, 255, 0.3); }
`;
document.head.appendChild(css);

export default ClipGenPage;
