import React, { useState } from 'react';
import { ArrowLeft, Search, TrendingUp, Target, BarChart3, CheckCircle, AlertCircle, Loader2, Zap, Brain, FileText, ChevronDown, ChevronUp, Globe, Code, Activity, Clock } from 'lucide-react';

function SEOrixPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  const handleSubmit = async () => {
    if (!url) {
      setError('Please enter a website URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('https://glowing-g79w8.crab.containers.automata.host/webhook/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website_url: url })
      });

      if (!response.ok) throw new Error('Failed to analyze');
      
      const data = await response.json();
      setResult(data[0]?.output?.seo_analysis_report || data);
      setExpanded({ critical: true, high_priority: true });
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const getColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const report = result;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => window.history.back()}>
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      {!result && (
        <div style={s.hero}>
          <div style={s.heroIcon}><Brain size={40} /></div>
          <h1 style={s.title}>SEOrix AI Analysis</h1>
          <p style={s.subtitle}>Complete SEO audit powered by AI</p>
        </div>
      )}

      <div style={s.main}>
        {!result && !loading && (
          <div style={s.card}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              style={s.input}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
            {error && <div style={s.error}><AlertCircle size={16} /> {error}</div>}
            <button onClick={handleSubmit} style={s.btn}>
              <Search size={18} /> Analyze Website
            </button>
          </div>
        )}

        {loading && (
          <div style={s.loading}>
            <Loader2 size={48} style={s.spin} />
            <h2 style={s.loadTitle}>Analyzing your website...</h2>
            <p style={s.loadText}>Scanning SEO, performance, content & competitors</p>
          </div>
        )}

        {report && (
          <div style={s.results}>
            <div style={s.resultHeader}>
              <div>
                <h1 style={s.reportTitle}>SEO Analysis Report</h1>
                <p style={s.reportSub}>{report.target_url}</p>
              </div>
              <button onClick={() => setResult(null)} style={s.newBtn}>
                <Search size={16} /> New Analysis
              </button>
            </div>

            {/* Overall Score */}
            {report.overall_score && (
              <div style={s.card}>
                <div style={s.scoreSection}>
                  <div style={s.scoreCircle}>
                    <div style={{...s.circle, borderColor: getColor(report.overall_score.total)}}>
                      <span style={{...s.scoreNum, color: getColor(report.overall_score.total)}}>
                        {report.overall_score.total}
                      </span>
                      <span style={s.scoreMax}>/100</span>
                    </div>
                    <div style={s.grade}>{report.overall_score.grade}</div>
                  </div>
                  <div style={s.scoreBreakdown}>
                    <h3 style={s.h3}>Score Breakdown</h3>
                    {Object.entries(report.overall_score.breakdown).map(([key, val]) => (
                      <div key={key} style={s.barItem}>
                        <div style={s.barLabel}>
                          <span>{key.replace(/_/g, ' ')}</span>
                          <span style={s.barVal}>{val.percentage}%</span>
                        </div>
                        <div style={s.barBg}>
                          <div style={{...s.barFill, width: `${val.percentage}%`, background: getColor(val.percentage)}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {report.executive_summary && (
                  <div style={s.summary}>
                    <strong>Executive Summary:</strong> {report.executive_summary}
                  </div>
                )}
              </div>
            )}

            {/* Keywords */}
            {report.keyword_analysis?.primary_keywords?.length > 0 && (
              <div style={s.card}>
                <h2 style={s.h2}><Target size={20} /> Keyword Analysis</h2>
                {report.keyword_analysis.primary_keywords.map((kw, i) => (
                  <div key={i} style={s.kwCard}>
                    <div style={s.kwHeader} onClick={() => toggle(`kw-${i}`)}>
                      <div>
                        <strong style={s.kwName}>{kw.keyword}</strong>
                        <div style={s.badges}>
                          <span style={s.badge}>Rank: {kw.current_rank}</span>
                          <span style={s.badge}>{kw.intent}</span>
                        </div>
                      </div>
                      {expanded[`kw-${i}`] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                    {expanded[`kw-${i}`] && (
                      <div style={s.kwDetails}>
                        <div style={s.kwGrid}>
                          <div><span style={s.label}>Volume</span><strong>{kw.search_volume?.toLocaleString()}</strong></div>
                          <div><span style={s.label}>Difficulty</span><strong>{kw.difficulty}/100</strong></div>
                          <div><span style={s.label}>Competition</span><strong>{kw.competition}</strong></div>
                          <div><span style={s.label}>Opportunity</span><strong>{kw.opportunity_score}/10</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {report.keyword_analysis.ai_recommendations?.length > 0 && (
                  <div style={s.aiBox}>
                    <h4 style={s.h4}>💡 AI Recommendations</h4>
                    {report.keyword_analysis.ai_recommendations.map((rec, i) => (
                      <div key={i} style={s.recItem}>• {rec}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content Analysis */}
            {report.content_analysis && (
              <div style={s.card}>
                <h2 style={s.h2}><FileText size={20} /> Content Analysis</h2>
                <div style={s.grid}>
                  <div style={s.metric}>
                    <span style={s.label}>Word Count</span>
                    <strong style={s.metricVal}>{report.content_analysis.word_count}</strong>
                  </div>
                  <div style={s.metric}>
                    <span style={s.label}>Readability</span>
                    <strong style={s.metricVal}>{report.content_analysis.readability?.score}/100</strong>
                  </div>
                  <div style={s.metric}>
                    <span style={s.label}>Grade Level</span>
                    <strong style={s.metricVal}>{report.content_analysis.readability?.grade_level}</strong>
                  </div>
                  <div style={s.metric}>
                    <span style={s.label}>Keyword Density</span>
                    <strong style={s.metricVal}>{report.content_analysis.keyword_density?.primary_keyword}%</strong>
                  </div>
                </div>
                {report.content_analysis.structure && (
                  <div style={s.structure}>
                    <h4 style={s.h4}>Content Structure</h4>
                    <div style={s.structGrid}>
                      <span>H1: {report.content_analysis.structure.h1_count}</span>
                      <span>H2: {report.content_analysis.structure.h2_count}</span>
                      <span>H3: {report.content_analysis.structure.h3_count}</span>
                      <span>Paragraphs: {report.content_analysis.structure.paragraph_count}</span>
                    </div>
                  </div>
                )}
                {report.content_analysis.issues_found?.length > 0 && (
                  <div style={s.issues}>
                    <h4 style={s.h4}>⚠️ Issues Found</h4>
                    {report.content_analysis.issues_found.map((issue, i) => (
                      <div key={i} style={s.issue}>• {issue}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Technical SEO */}
            {report.technical_seo?.pagespeed_insights && (
              <div style={s.card}>
                <h2 style={s.h2}><Activity size={20} /> Technical SEO</h2>
                <div style={s.grid}>
                  <div style={s.metric}>
                    <span style={s.label}>Mobile Score</span>
                    <strong style={{...s.metricVal, color: getColor(report.technical_seo.pagespeed_insights.mobile.performance_score)}}>
                      {report.technical_seo.pagespeed_insights.mobile.performance_score}
                    </strong>
                  </div>
                  <div style={s.metric}>
                    <span style={s.label}>Desktop Score</span>
                    <strong style={{...s.metricVal, color: getColor(report.technical_seo.pagespeed_insights.desktop.performance_score)}}>
                      {report.technical_seo.pagespeed_insights.desktop.performance_score}
                    </strong>
                  </div>
                </div>
                
                {report.technical_seo.pagespeed_insights.mobile.core_web_vitals && (
                  <div style={s.vitals}>
                    <h4 style={s.h4}>Core Web Vitals</h4>
                    <div style={s.vitalsGrid}>
                      {Object.entries(report.technical_seo.pagespeed_insights.mobile.core_web_vitals).slice(0, 3).map(([key, val]) => (
                        <div key={key} style={s.vitalCard}>
                          <span style={s.vitalName}>{key.toUpperCase()}</span>
                          <strong style={{color: val.rating === 'good' ? '#10b981' : val.rating === 'needs-improvement' ? '#f59e0b' : '#ef4444'}}>
                            {val.value} {val.unit}
                          </strong>
                          <span style={s.vitalRating}>{val.rating}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Meta Tags */}
            {report.meta_tags_schema && (
              <div style={s.card}>
                <h2 style={s.h2}><Code size={20} /> Meta Tags & Schema</h2>
                <div style={s.metaGrid}>
                  <div style={s.metaCard}>
                    <div style={s.metaHeader}>
                      <strong>Title Tag</strong>
                      {report.meta_tags_schema.title_tag?.status === 'optimal' ? 
                        <CheckCircle size={16} color="#10b981" /> : 
                        <AlertCircle size={16} color="#f59e0b" />}
                    </div>
                    <p style={s.metaText}>{report.meta_tags_schema.title_tag?.content}</p>
                    <span style={s.metaLen}>{report.meta_tags_schema.title_tag?.length} chars</span>
                  </div>
                  <div style={s.metaCard}>
                    <div style={s.metaHeader}>
                      <strong>Meta Description</strong>
                      {report.meta_tags_schema.meta_description?.status === 'optimal' ? 
                        <CheckCircle size={16} color="#10b981" /> : 
                        <AlertCircle size={16} color="#f59e0b" />}
                    </div>
                    <p style={s.metaText}>{report.meta_tags_schema.meta_description?.content}</p>
                    <span style={s.metaLen}>{report.meta_tags_schema.meta_description?.length} chars</span>
                  </div>
                </div>
              </div>
            )}

            {/* Competitors */}
            {report.competitor_analysis?.competitors?.length > 0 && (
              <div style={s.card}>
                <h2 style={s.h2}><Users size={20} /> Competitor Analysis</h2>
                {report.competitor_analysis.competitors.map((comp, i) => (
                  <div key={i} style={s.compCard}>
                    <div style={s.compHeader}>
                      <strong>{comp.name}</strong>
                      <span style={s.compScore}>{comp.seo_score}/100</span>
                    </div>
                    <a href={comp.url} style={s.link} target="_blank" rel="noopener noreferrer">{comp.url}</a>
                  </div>
                ))}
                {report.competitor_analysis.competitive_gaps?.length > 0 && (
                  <div style={s.gaps}>
                    <h4 style={s.h4}>⚠️ Competitive Gaps</h4>
                    {report.competitor_analysis.competitive_gaps.map((gap, i) => (
                      <div key={i} style={s.gapItem}>• {gap}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Priority Recommendations */}
            {report.priority_recommendations && (
              <div style={s.card}>
                <h2 style={s.h2}><Zap size={20} /> Priority Recommendations</h2>
                {Object.entries(report.priority_recommendations).map(([priority, items]) => items?.length > 0 && (
                  <div key={priority} style={s.prioritySection}>
                    <div style={s.priorityHeader} onClick={() => toggle(priority)}>
                      <h3 style={s.priorityTitle}>
                        {priority === 'critical' && '🔥'}
                        {priority === 'high_priority' && '⚡'}
                        {priority === 'medium_priority' && '🧩'}
                        {priority === 'low_priority' && '🕓'}
                        {' '}{priority.replace(/_/g, ' ').toUpperCase()}
                      </h3>
                      {expanded[priority] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                    {expanded[priority] && items.map((item, i) => (
                      <div key={i} style={s.recCard}>
                        <div style={s.recHeader}>
                          <strong>{item.issue}</strong>
                          <span style={s.effort}>{item.estimated_effort}</span>
                        </div>
                        <p style={s.recText}>{item.solution}</p>
                        <div style={s.recFooter}>
                          <span style={s.impact}>Impact: {item.expected_impact}</span>
                          {item.tools_needed?.length > 0 && (
                            <span style={s.tools}>Tools: {item.tools_needed.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Expected Impact */}
            {report.expected_impact && (
              <div style={s.card}>
                <h2 style={s.h2}><TrendingUp size={20} /> Expected Impact</h2>
                {['immediate_fixes', 'medium_term_fixes', 'long_term_optimization'].map((term) => 
                  report.expected_impact[term] && (
                    <div key={term} style={s.impactCard}>
                      <h4 style={s.h4}>{report.expected_impact[term].timeframe}</h4>
                      <div style={s.impactGrid}>
                        <div style={s.impactItem}>
                          <span style={s.label}>SEO Score</span>
                          <strong style={s.impactVal}>
                            {report.expected_impact[term].expected_improvements?.seo_score?.current} → {report.expected_impact[term].expected_improvements?.seo_score?.projected}
                            <span style={{color: '#10b981'}}> (+{report.expected_impact[term].expected_improvements?.seo_score?.increase})</span>
                          </strong>
                        </div>
                        <div style={s.impactItem}>
                          <span style={s.label}>Ranking Impact</span>
                          <strong>{report.expected_impact[term].expected_improvements?.ranking_impact}</strong>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Next Steps */}
            {report.next_steps && (
              <div style={s.card}>
                <h2 style={s.h2}><Clock size={20} /> Next Steps Timeline</h2>
                {Object.entries(report.next_steps).map(([week, tasks]) => tasks?.length > 0 && (
                  <div key={week} style={s.weekCard}>
                    <h4 style={s.weekTitle}>{week.replace(/_/g, ' ').toUpperCase()}</h4>
                    {tasks.map((task, i) => (
                      <div key={i} style={s.task}>
                        <CheckCircle size={14} color="#8b5cf6" /> {task}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.95rem' },
  hero: { textAlign: 'center', padding: '4rem 2rem' },
  heroIcon: { display: 'inline-flex', padding: '1.5rem', background: 'rgba(139,92,246,0.1)', borderRadius: '20px', marginBottom: '1.5rem', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6' },
  title: { fontSize: '3rem', fontWeight: '700', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' },
  subtitle: { fontSize: '1.25rem', color: '#94a3b8' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  card: { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem' },
  input: { width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0', fontSize: '1rem', marginBottom: '1rem', boxSizing: 'border-box' },
  error: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' },
  btn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', color: 'white', padding: '1.25rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '4rem 2rem' },
  spin: { color: '#8b5cf6', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' },
  loadTitle: { fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' },
  loadText: { fontSize: '1.1rem', color: '#94a3b8' },
  results: { animation: 'fadeIn 0.5s ease' },
  resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  reportTitle: { fontSize: '2.5rem', fontWeight: '700', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' },
  reportSub: { fontSize: '1rem', color: '#94a3b8' },
  newBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', color: 'white', padding: '0.875rem 1.75rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' },
  scoreSection: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'center', marginBottom: '2rem' },
  scoreCircle: { textAlign: 'center' },
  circle: { width: '140px', height: '140px', borderRadius: '50%', border: '8px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' },
  scoreNum: { fontSize: '2.5rem', fontWeight: '700' },
  scoreMax: { fontSize: '1rem', color: '#94a3b8' },
  grade: { fontSize: '1.25rem', fontWeight: '600', color: '#e2e8f0' },
  scoreBreakdown: { flex: 1 },
  h2: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#e2e8f0' },
  h3: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#e2e8f0' },
  h4: { fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#e2e8f0' },
  barItem: { marginBottom: '1rem' },
  barLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'capitalize' },
  barVal: { fontWeight: '600', color: '#e2e8f0' },
  barBg: { height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '4px', transition: 'width 1s ease' },
  summary: { padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', lineHeight: '1.6', color: '#cbd5e1' },
  kwCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', marginBottom: '1rem', overflow: 'hidden' },
  kwHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', cursor: 'pointer' },
  kwName: { fontSize: '1.1rem', display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' },
  badges: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  badge: { padding: '0.25rem 0.75rem', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '12px', fontSize: '0.75rem', color: '#c4b5fd' },
  kwDetails: { padding: '0 1.5rem 1.5rem' },
  kwGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' },
  label: { display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' },
  aiBox: { marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px' },
  recItem: { padding: '0.5rem 0', color: '#cbd5e1', lineHeight: '1.6' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  metric: { padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' },
  metricVal: { display: 'block', fontSize: '1.75rem', fontWeight: '700', marginTop: '0.5rem', color: '#e2e8f0' },
  structure: { padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '1rem' },
  structGrid: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#cbd5e1' },
  issues: { padding: '1.5rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px' },
  issue: { padding: '0.5rem 0', color: '#fca5a5', lineHeight: '1.6' },
  vitals: { marginTop: '1.5rem' },
  vitalsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' },
  vitalCard: { padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' },
  vitalName: { display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' },
  vitalRating: { display: 'block', fontSize: '0.85rem', marginTop: '0.5rem', color: '#cbd5e1', textTransform: 'capitalize' },
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' },
  metaCard: { padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' },
  metaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  metaText: { fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.5rem', lineHeight: '1.5' },
  metaLen: { fontSize: '0.8rem', color: '#94a3b8' },
  compCard: { padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' },
  compHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  compScore: { padding: '0.25rem 0.75rem', background: 'rgba(139,92,246,0.2)', borderRadius: '12px', fontSize: '0.85rem', color: '#c4b5fd' },
  link: { fontSize: '0.85rem', color: '#8b5cf6', textDecoration: 'none' },
  gaps: { marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px' },
  gapItem: { padding: '0.5rem 0', color: '#fca5a5', lineHeight: '1.6' },
  prioritySection: { marginBottom: '1rem' },
  priorityHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', cursor: 'pointer', marginBottom: '0.5rem' },
  priorityTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0', margin: 0 },
  recCard: { padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', marginBottom: '1rem' },
  recHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem' },
  effort: { padding: '0.25rem 0.75rem', background: 'rgba(59,130,246,0.2)', borderRadius: '12px', fontSize: '0.75rem', color: '#93c5fd', whiteSpace: 'nowrap' },
  recText: { color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1rem' },
  recFooter: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', gap: '1rem', flexWrap: 'wrap' },
  impact: { color: '#10b981' },
  tools: { color: '#94a3b8' },
  impactCard: { padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' },
  impactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  impactItem: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  impactVal: { fontSize: '1.1rem', color: '#e2e8f0' },
  weekCard: { padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' },
  weekTitle: { fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#e2e8f0', textTransform: 'capitalize' },
  task: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', color: '#cbd5e1', lineHeight: '1.6' },
};

const css = document.createElement('style');
css.textContent = `@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`;
document.head.appendChild(css);

export default SEOrixPage;