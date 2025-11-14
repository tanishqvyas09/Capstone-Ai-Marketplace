import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getCampaignTemplates, createCampaign, getAllAgents } from './services/campaignService';
import { X, ChevronRight, ChevronLeft, Rocket, Search as SearchIcon, FolderOpen, Plus, Minus, Check } from 'lucide-react';

const CreateCampaignModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Template, 2: Details, 3: Agents
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [allAgents, setAllAgents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active'
  });
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadAgents();
  }, []);

  const loadTemplates = async () => {
    const result = await getCampaignTemplates();
    if (result.success) {
      setTemplates(result.templates);
    }
  };

  const loadAgents = async () => {
    const result = await getAllAgents();
    if (result.success) {
      setAllAgents(result.agents);
    }
  };

  const handleTemplateSelect = async (template) => {
    setSelectedTemplate(template);
    
    // Pre-load agents for this template
    if (template.agent_names && template.agent_names.length > 0) {
      const preloadedAgents = allAgents.filter(agent => 
        template.agent_names.includes(agent.name)
      );
      setSelectedAgents(preloadedAgents.map(a => a.id));
    } else {
      setSelectedAgents([]);
    }
    
    setStep(2);
  };

  const handleAgentToggle = (agentId) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please log in to create a campaign');
      return;
    }

    const campaignData = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      template_type: selectedTemplate?.id || 'blank',
      agent_ids: selectedAgents
    };

    const result = await createCampaign(session.user.id, campaignData);
    
    setLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      alert('Failed to create campaign: ' + result.error);
    }
  };

  const filteredAgents = allAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTemplateIcon = (icon) => {
    const icons = {
      '📝': FolderOpen,
      '🚀': Rocket,
      '🔍': SearchIcon,
      '✍️': FolderOpen,
      '📱': FolderOpen
    };
    const IconComponent = icons[icon] || FolderOpen;
    return <IconComponent size={32} />;
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              {step === 1 && 'Choose a Template'}
              {step === 2 && 'Campaign Details'}
              {step === 3 && 'Add Agents'}
            </h2>
            <p style={styles.subtitle}>
              {step === 1 && 'Start with a pre-configured template or create from scratch'}
              {step === 2 && 'Give your campaign a name and description'}
              {step === 3 && 'Select the AI agents you want to use in this campaign'}
            </p>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressStep,
            ...(step >= 1 ? styles.progressStepActive : {})
          }}>
            <span style={styles.progressNumber}>1</span>
            <span style={styles.progressLabel}>Template</span>
          </div>
          <div style={styles.progressLine}>
            <div style={{
              ...styles.progressLineFill,
              width: step >= 2 ? '100%' : '0%'
            }} />
          </div>
          <div style={{
            ...styles.progressStep,
            ...(step >= 2 ? styles.progressStepActive : {})
          }}>
            <span style={styles.progressNumber}>2</span>
            <span style={styles.progressLabel}>Details</span>
          </div>
          <div style={styles.progressLine}>
            <div style={{
              ...styles.progressLineFill,
              width: step >= 3 ? '100%' : '0%'
            }} />
          </div>
          <div style={{
            ...styles.progressStep,
            ...(step >= 3 ? styles.progressStepActive : {})
          }}>
            <span style={styles.progressNumber}>3</span>
            <span style={styles.progressLabel}>Agents</span>
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Step 1: Template Selection */}
          {step === 1 && (
            <div style={styles.templatesGrid}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  style={styles.templateCard}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div style={styles.templateIcon}>
                    {template.icon}
                  </div>
                  <h3 style={styles.templateName}>{template.name}</h3>
                  <p style={styles.templateDescription}>
                    {template.description}
                  </p>
                  {template.agent_names && template.agent_names.length > 0 && (
                    <div style={styles.templateAgents}>
                      <span style={styles.agentCount}>
                        {template.agent_names.length} agents included
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Campaign Details */}
          {step === 2 && (
            <div style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Campaign Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="e.g., VavuTiles Launch"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoFocus
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Describe what this campaign is about..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Initial Status</label>
                <select
                  style={styles.select}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>

              {selectedTemplate && selectedTemplate.id !== 'blank' && (
                <div style={styles.templateInfo}>
                  <div style={styles.templateInfoHeader}>
                    <span style={styles.templateInfoIcon}>{selectedTemplate.icon}</span>
                    <div>
                      <div style={styles.templateInfoTitle}>
                        {selectedTemplate.name}
                      </div>
                      <div style={styles.templateInfoText}>
                        {selectedTemplate.agent_names?.length || 0} agents will be added
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Agent Selection */}
          {step === 3 && (
            <div style={styles.agentsSection}>
              <div style={styles.searchBox}>
                <SearchIcon size={20} style={styles.searchIcon} />
                <input
                  type="text"
                  style={styles.searchInput}
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={styles.selectedCount}>
                {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
              </div>

              <div style={styles.agentsList}>
                {filteredAgents.map((agent) => {
                  const isSelected = selectedAgents.includes(agent.id);
                  return (
                    <div
                      key={agent.id}
                      style={{
                        ...styles.agentItem,
                        ...(isSelected ? styles.agentItemSelected : {})
                      }}
                      onClick={() => handleAgentToggle(agent.id)}
                    >
                      <div style={styles.agentInfo}>
                        <div style={styles.agentName}>{agent.name}</div>
                        <div style={styles.agentDescription}>
                          {agent.description || 'No description available'}
                        </div>
                      </div>
                      <div style={styles.agentCheckbox}>
                        {isSelected && <Check size={18} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAgents.length === 0 && (
                <div style={styles.noResults}>
                  No agents found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          {step > 1 && (
            <button
              style={styles.backButton}
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft size={20} />
              Back
            </button>
          )}

          <div style={{ flex: 1 }} />

          {step < 3 ? (
            <button
              style={styles.nextButton}
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !selectedTemplate}
            >
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              style={styles.createButton}
              onClick={handleCreate}
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: '#000000',
    borderRadius: '24px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    boxShadow: '0 0 60px rgba(0, 217, 255, 0.15), 0 20px 60px rgba(0, 0, 0, 0.8)',
  },
  header: {
    padding: '32px 32px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(0, 217, 255, 0.1)',
    background: 'linear-gradient(to bottom, rgba(0, 217, 255, 0.03), transparent)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '8px',
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '15px',
    color: '#D1D5DB',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '10px',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  progressBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '24px 32px',
    background: 'rgba(0, 217, 255, 0.02)',
    borderBottom: '1px solid rgba(0, 217, 255, 0.05)',
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: '#6B7280',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  progressStepActive: {
    color: '#00D9FF',
  },
  progressNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(0, 217, 255, 0.05)',
    border: '2px solid rgba(0, 217, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px',
    fontFamily: "'Space Grotesk', sans-serif",
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  progressLabel: {
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: "'Space Grotesk', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  progressLine: {
    flex: 1,
    height: '2px',
    background: 'rgba(0, 217, 255, 0.1)',
    margin: '0 16px',
    position: 'relative',
  },
  progressLineFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00D9FF 0%, #0EA5E9 100%)',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 0 10px rgba(0, 217, 255, 0.5)',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '32px',
  },
  templatesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
  },
  templateCard: {
    background: 'rgba(0, 217, 255, 0.03)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '16px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textAlign: 'center',
  },
  templateIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    filter: 'drop-shadow(0 0 20px rgba(0, 217, 255, 0.3))',
  },
  templateName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '8px',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  templateDescription: {
    fontSize: '14px',
    color: '#D1D5DB',
    lineHeight: '1.6',
    marginBottom: '12px',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  templateAgents: {
    paddingTop: '12px',
    borderTop: '1px solid rgba(0, 217, 255, 0.1)',
  },
  agentCount: {
    fontSize: '12px',
    color: '#00D9FF',
    fontWeight: '600',
    fontFamily: "'Space Grotesk', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  form: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#00D9FF',
    fontFamily: "'Space Grotesk', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(0, 217, 255, 0.03)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  textarea: {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(0, 217, 255, 0.03)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '15px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: "'Space Grotesk', sans-serif",
    lineHeight: '1.6',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  select: {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(0, 217, 255, 0.03)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '15px',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  templateInfo: {
    background: 'rgba(0, 217, 255, 0.05)',
    border: '1px solid rgba(0, 217, 255, 0.3)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 0 30px rgba(0, 217, 255, 0.1)',
  },
  templateInfoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  templateInfoIcon: {
    fontSize: '32px',
    filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.5))',
  },
  templateInfoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '4px',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  templateInfoText: {
    fontSize: '13px',
    color: '#00D9FF',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  agentsSection: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  searchBox: {
    position: 'relative',
    marginBottom: '16px',
  },
  searchIcon: {
    position: 'absolute',
    left: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#00D9FF',
    opacity: 0.6,
  },
  searchInput: {
    width: '100%',
    padding: '14px 18px 14px 50px',
    background: 'rgba(0, 217, 255, 0.03)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '15px',
    outline: 'none',
    fontFamily: "'Space Grotesk', sans-serif",
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  selectedCount: {
    fontSize: '14px',
    color: '#00D9FF',
    marginBottom: '16px',
    fontWeight: '600',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  agentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '400px',
    overflow: 'auto',
  },
  agentItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px',
    background: 'rgba(0, 217, 255, 0.03)',
    border: '1px solid rgba(0, 217, 255, 0.15)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  agentItemSelected: {
    background: 'rgba(0, 217, 255, 0.1)',
    borderColor: 'rgba(0, 217, 255, 0.4)',
    boxShadow: '0 0 20px rgba(0, 217, 255, 0.15)',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '4px',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  agentDescription: {
    fontSize: '13px',
    color: '#D1D5DB',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  agentCheckbox: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    border: '2px solid rgba(0, 217, 255, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 217, 255, 0.1)',
    color: '#00D9FF',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6B7280',
    fontSize: '15px',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 32px',
    borderTop: '1px solid rgba(0, 217, 255, 0.1)',
    background: 'linear-gradient(to top, rgba(0, 217, 255, 0.03), transparent)',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'rgba(0, 217, 255, 0.05)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  nextButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#000000',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Space Grotesk', sans-serif",
    boxShadow: '0 0 30px rgba(0, 217, 255, 0.4)',
  },
  createButton: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#000000',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Space Grotesk', sans-serif",
    boxShadow: '0 0 30px rgba(0, 217, 255, 0.4)',
  },
};

export default CreateCampaignModal;
