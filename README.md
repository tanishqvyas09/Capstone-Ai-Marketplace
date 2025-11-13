# 🎯 Market Muse AI — Multi-Agent Marketing Workspace

An all-in-one React + Vite application featuring a marketplace of 13 specialized AI marketing agents with beautiful glassmorphic UIs, comprehensive campaign management, real-time analytics dashboard, and intelligent webhook-based automations.

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Database Setup](#database-setup)
- [AI Agent Marketplace](#ai-agent-marketplace)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Feature Implementations](#feature-implementations)
- [Troubleshooting](#troubleshooting)
- [Recent Updates](#recent-updates)
- [Contributing](#contributing)

---

## 🌟 Overview

Market Muse AI is a next-generation marketing automation platform that provides:
- **13 Specialized AI Agents** covering the entire marketing spectrum
- **Token-based Economy** with intelligent cost calculation and usage tracking
- **Campaign Management System** to organize multi-agent marketing projects
- **Real-time Analytics Dashboard** with interactive charts and insights
- **Usage History & Audit Trail** for complete transparency
- **Live Updates** via Supabase realtime subscriptions
- **Modern Glassmorphic UI** with dark theme and smooth animations

---

## ✨ Key Features

### 🤖 AI Agent Marketplace
- **13 Specialized Marketing Agents** covering SEO, Lead Generation, Social Media, Advertising, Analytics, and more
- **Video Preview Modals** with autoplay demonstrations for each agent
- **Detailed Agent Cards** with descriptions, token costs, and status indicators
- **One-Click Navigation** to agent workspaces with campaign integration
- **Real-time Status Updates** showing active/idle agent states

### 💰 Intelligent Token System
- **Dynamic Token Balance Tracking** with real-time updates
- **Variable Cost Models**: Fixed costs, per-contact pricing (WhatsPulse), and mode-based pricing (TrendIQ)
- **Multiplier Support**: Automatic cost calculation for bulk operations
- **Complete Usage Audit Trail** with detailed logging
- **Token Deduction Safeguards** preventing double-charging
- **Insufficient Balance Protection** with clear error messages

### 📊 Advanced Campaign Management
- **Multi-Agent Campaign Organization** - coordinate multiple agents in one campaign
- **Task-Based Workflow** - break down campaigns into discrete agent tasks
- **Progress Tracking** - monitor campaign status (Not Started, In Progress, Completed)
- **Artifact Storage** - save and display outputs from each agent run
- **Campaign-Specific Results** - view all outputs organized by campaign
- **Reusable Workflows** - run same agent multiple times within a campaign

### 📈 Real-Time Analytics Dashboard
- **Token Spend Tracking** - line chart showing daily token consumption trends
- **Agent Usage Metrics** - line chart displaying agent runs over time
- **Distribution Analysis** - pie chart showing agent usage breakdown
- **Cost Analysis** - bar chart comparing token spend across agents
- **Filterable History Table** - searchable usage logs with date filtering
- **KPI Cards** - quick view of total runs, tokens spent, and favorite agent
- **Export Capabilities** - download usage data for external analysis

### � Usage History & Audit Trail
- **Chronological Agent Run List** with complete execution details
- **Advanced Filtering** by agent, date range, and execution status
- **Input/Output Summaries** with AI-generated descriptions
- **Token Cost Tracking** per execution
- **Status Indicators** (success/failed) with error messages
- **Campaign Association** linking runs to parent campaigns
- **Timestamp Records** with precise execution times

### 🎨 Modern Glassmorphic UI
- **Frosted Glass Effects** with backdrop blur and transparency
- **Animated Floating Orbs** creating dynamic background ambiance
- **Grid Overlays** for depth and visual interest
- **Smooth Transitions** on all interactive elements
- **Responsive Design** adapting to all screen sizes
- **Dark Theme** optimized for reduced eye strain
- **Custom Animations** - slide-ins, fades, pulses, and gradients
- **Lucide React Icons** for consistent iconography
- **Zero External CSS** - all styling via inline JavaScript objects

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern component-based UI library
- **Vite 6.0.5** - Lightning-fast build tool and dev server
- **React Router DOM 7.9.3** - Client-side routing with nested routes
- **Lucide React 0.545.0** - Beautiful, consistent icon library
- **Recharts 3.3.0** - Composable charting library for analytics

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Supabase Auth** - Built-in authentication with email/password
- **Row Level Security (RLS)** - Database-level security policies
- **PostgreSQL Functions** - Server-side token management logic

### Styling & UI
- **Inline JavaScript Styling** - CSS-in-JS for component encapsulation
- **Glassmorphism Design** - Frosted glass effects with backdrop filters
- **Custom Animations** - Keyframe animations for smooth UX
- **Responsive Grids** - Flexible layouts adapting to screen sizes

### Automation & Integration
- **n8n Webhooks** - Serverless workflow automation
- **RESTful APIs** - Agent webhook endpoints for AI processing
- **Cloudinary** - Video hosting for agent preview demonstrations

### Development Tools
- **ESLint 9.17.0** - Code linting and quality enforcement
- **Autoprefixer 10.4.20** - CSS vendor prefix automation
- **PostCSS 8.4.49** - CSS transformation pipeline
- **SWC** - Super-fast TypeScript/JavaScript compiler

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (recommended)
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Capstone-Ai-Marketplace

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# VITE_SUPABASE_URL=https://<your-project>.supabase.co
# VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Start development server
npm run dev
```

The app will open at `http://localhost:5173` (or next available port).

### Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

---

## 🗄️ Database Setup

### Step 1: Run the Main SQL Setup

Execute `supabase-setup.sql` in your Supabase SQL Editor. This will:
- Create `agents` table with all 10 agents
- Create `profiles` table with token management
- Create `token_usage_log` for usage tracking
- Create `usage_logs` table for chat history
- Create `campaigns` and `campaign_tasks` tables
- Create `campaign_artifacts` for storing outputs
- Set up Row Level Security (RLS) policies
- Create necessary functions for token management

### Step 2: Verify Setup

Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- `agents`
- `profiles`
- `token_usage_log`
- `usage_logs`
- `campaigns`
- `campaign_tasks`
- `campaign_artifacts`

### Step 3: Add Initial Token Balance

For testing, give yourself tokens:

```sql
UPDATE profiles 
SET tokens_remaining = 10000 
WHERE id = '<your-user-id>';
```

---

## 🤖 AI Agent Marketplace

### Complete Agent Catalog

| # | Agent | Icon | Token Cost | Description | Capabilities |
|---|-------|------|------------|-------------|--------------|
| 1 | **SEOrix** | 🔍 | 200 | SEO Analysis & Optimization | Analyzes websites for SEO performance, provides actionable recommendations with priority rankings, identifies technical issues, suggests content improvements, and generates optimization strategies |
| 2 | **LeadGen** | 👤 | 150 | Intelligent Lead Generation | Discovers and validates leads from Google Maps, extracts contact information, scores lead quality, provides business insights, and generates CSV exports for CRM integration |
| 3 | **WhatsPulse** | 💬 | 50/contact | WhatsApp Broadcast Automation | Sends personalized WhatsApp messages at scale, supports CSV contact upload, tracks delivery status, provides message personalization with variables, and generates broadcast analytics |
| 4 | **AdVisor** | 🎯 | 200 | AI Ad Creative Generator | Creates compelling ad titles, generates eye-catching visuals with AI, provides multiple creative variations, includes AdBrief integration popup, and optimizes copy for conversion |
| 5 | **SociaPlan** | 📅 | 250 | Social Media Calendar | Generates 7-day content calendars, provides post-specific copy for each platform, includes hashtag recommendations, optimal posting times, content themes, and engagement strategies |
| 6 | **EchoMind** | 🎧 | 150 | Audio Sentiment Analysis | Transcribes customer call recordings, analyzes emotional sentiment, identifies pain points and satisfaction drivers, provides sentiment scores, and generates actionable insights |
| 7 | **TrendIQ** | 📈 | 150/250 | Market Trend Analysis | Scans news, social media, and on-chain data for trends. **Location Mode** (150 tokens): Geographic trend analysis. **Keyword Mode** (250 tokens): Topic-specific trend research with deeper insights |
| 8 | **Scriptly** | 📝 | 300 | Viral Video Script Generator | Creates engaging scripts for YouTube Shorts, Instagram Reels, and TikTok. Generates 3 script variations with different hooks, includes scene-by-scene breakdowns, provides voiceover notes, and optimizes for virality |
| 9 | **Adbrief** | ✨ | 75 | Creative Ad Brief Generator | Produces strategic ad briefs with multiple creative angles, includes target audience analysis, key messaging frameworks, visual direction, tone guidelines, and campaign variations |
| 10 | **ClipGen** | 🎬 | 350 | Viral Clip Generator | Transforms long-form YouTube videos into short viral clips. Analyzes transcript, identifies engaging moments, provides virality scores (0-100), generates captions, recommends optimal platforms, and suggests posting schedules |
| 11 | **RingCast** | 📞 | 40/call | Voice Broadcast System | Automated voice call campaigns with CSV upload support, personalized message delivery, real-time call progress tracking, completion statistics, and campaign performance metrics |
| 12 | **InfluenceScope** | 📸 | 100 | Instagram Influencer Analysis | Deep-dive influencer evaluation including profile metrics, engagement rates, authenticity scores (0-100), fake follower detection, audience quality analysis, brand partnership suitability, estimated rates, and detailed recommendations |
| 13 | **SocialInsight** | 🎥 | 150 | Social Media Content Analyzer | Embedded Streamlit app for YouTube video download/transcription and Instagram profile analysis. Session-based access with upfront token deduction, full-featured interactive interface |

### Agent Categories

#### 🎯 **Advertising & Creative** (4 agents)
- AdVisor, Adbrief, Scriptly, ClipGen
- Generate ads, briefs, scripts, and viral content

#### 📱 **Social Media Management** (3 agents)
- SociaPlan, SocialInsight, InfluenceScope
- Content planning, analysis, and influencer research

#### 🔍 **Lead Generation & Outreach** (3 agents)
- LeadGen, WhatsPulse, RingCast
- Find leads and execute multi-channel campaigns

#### 📊 **Analytics & Intelligence** (3 agents)
- SEOrix, EchoMind, TrendIQ
- SEO analysis, sentiment tracking, and trend monitoring

### Token Cost Structure

**Fixed Cost Agents:**
- SEOrix, LeadGen, AdVisor, SociaPlan, EchoMind: Standard single-execution cost
- Scriptly, Adbrief, ClipGen, InfluenceScope, SocialInsight: Premium single-execution cost

**Variable Cost Agents:**
- **WhatsPulse**: 50 tokens × number of contacts (bulk messaging)
- **RingCast**: 40 tokens × number of calls (voice broadcast)
- **TrendIQ**: 1 token × 150 (location mode) or 1 token × 250 (keyword mode)

---

## 📁 Project Structure

```
Capstone-Ai-Marketplace/
├── public/                          # Static assets
│
├── src/
│   ├── main.jsx                     # Application entry point
│   ├── App.jsx                      # Main app with routing configuration
│   ├── index.css                    # Global styles
│   ├── App.css                      # App-specific styles
│   │
│   ├── DashboardPage.jsx            # Main dashboard - Agent marketplace + KPIs
│   ├── DashboardPage.css            # Dashboard styling
│   ├── LoginPage.jsx                # Supabase authentication
│   ├── LoginPage.css                # Login page styling
│   ├── AnalyticsPage.jsx            # Charts and usage analytics
│   ├── CampaignsPage.jsx            # Campaign list and creation
│   ├── CampaignDetailPage.jsx       # Campaign detail with task artifacts
│   ├── MyAgentsPage.jsx             # Agent usage history/chat logs
│   ├── SettingsPage.jsx             # User settings and preferences
│   │
│   ├── SEOrixPage.jsx               # SEO analysis agent
│   ├── SEOrixPage.css               # SEOrix styling
│   ├── LeadGenPage.jsx              # Lead generation agent
│   ├── WhatsPulsePage.jsx           # WhatsApp broadcast agent
│   ├── AdVisorPage.jsx              # Ad creative generator agent
│   ├── SociaPlanPage.jsx            # Social media calendar agent
│   ├── EchoMindPage.jsx             # Audio sentiment analysis agent
│   ├── TrendIQPage.jsx              # Market trends agent
│   ├── ScriptlyPage.jsx             # Video script generator agent
│   ├── AdbriefPage.jsx              # Ad brief generator agent
│   ├── ClipGenPage.jsx              # Viral clip generator agent
│   ├── RingCastPage.jsx             # Voice broadcast agent
│   ├── InfluenceScopePage.jsx       # Instagram influencer analyzer agent
│   ├── SocialInsightPage.jsx        # YouTube/Instagram content analyzer agent
│   │
│   ├── CreateCampaignModal.jsx      # Campaign creation modal component
│   ├── AdbriefPopup.jsx             # Adbrief integration popup for AdVisor
│   │
│   ├── assets/                      # Images, fonts, icons
│   │
│   ├── services/
│   │   └── campaignService.js       # Campaign CRUD operations and task management
│   │
│   └── utils/
│       ├── tokenService.js          # Token deduction and balance management
│       └── summaryGenerator.js      # AI output summary generation
│
├── supabaseClient.js                # Supabase client configuration
├── supabase-setup.sql               # Complete database schema and seed data
├── socialinsight-agent-setup.sql    # SocialInsight specific setup (if needed)
├── reset-tokens.sql                 # Token balance reset utility
│
├── package.json                     # Dependencies and scripts
├── vite.config.js                   # Vite configuration
├── vercel.json                      # Vercel deployment config
├── eslint.config.js                 # ESLint rules
├── postcss.config.js                # PostCSS configuration
├── index.html                       # HTML entry point
└── README.md                        # This file
```

### Key Directories

**`/src`** - Main application code
- **Pages** - Full-page components with routing
- **Components** - Reusable UI components
- **Services** - Business logic and API interactions
- **Utils** - Helper functions and utilities
- **Assets** - Static media files

**Root Files**
- **supabase-setup.sql** - Database schema, RLS policies, functions, and seed data
- **supabaseClient.js** - Configured Supabase client instance
- **package.json** - Dependencies: React, Vite, Supabase, Recharts, Lucide Icons

---

## 🔐 Environment Setup

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

These are accessed in `supabaseClient.js` via `import.meta.env`.

**Security Notes:**
- Never commit `.env.local` to version control
- Use anon key for frontend (not service role key)
- Configure RLS policies in Supabase for security

---

## 🎯 Feature Implementations

### Token Management System

**Comprehensive Token Lifecycle:**

1. **Balance Check** - `executeWithTokens()` from `tokenService.js`
   - Verifies user has sufficient tokens
   - Calculates cost with multipliers
   - Prevents execution if balance insufficient

2. **Token Deduction** - Server-side PostgreSQL function
   - Atomic transaction ensures data consistency
   - Deducts tokens only on successful agent execution
   - Records tokens_before and tokens_after states
   - Supports multipliers for variable-cost agents

3. **Usage Logging** - Dual logging system
   - `token_usage_log` - Financial audit trail
   - `usage_logs` - Detailed execution history with I/O

4. **Real-time Updates** - Supabase subscriptions
   - Live balance updates via WebSocket
   - Instant UI refresh on token changes
   - No page reload required

**Variable Cost Examples:**

```javascript
// WhatsPulse: 50 tokens per contact
const contactCount = 100;
const totalCost = 50 * contactCount; // 5,000 tokens

// RingCast: 40 tokens per call
const callCount = 75;
const totalCost = 40 * callCount; // 3,000 tokens

// TrendIQ: Mode-based pricing
const locationModeCost = 1 * 150; // 150 tokens
const keywordModeCost = 1 * 250; // 250 tokens
```

**Token Service Key Functions:**
- `executeWithTokens()` - Main execution wrapper with token management
- Handles API calls to agent webhooks
- Manages error states and rollback scenarios
- Returns standardized result object with success/error states
- Automatically logs to campaign artifacts if campaignId provided

---

### Campaign System

**Campaign Architecture:**

```
Campaign (Parent Container)
├── Basic Info (name, description, status, timestamps)
├── Tasks (Agent Assignments)
│   ├── Task 1: Agent Type + Completion Status
│   ├── Task 2: Agent Type + Completion Status
│   └── Task 3: Agent Type + Completion Status
└── Artifacts (Execution Results)
    ├── Artifact 1: Output Data + Usage Log Reference
    ├── Artifact 2: Output Data + Usage Log Reference
    └── Artifact 3: Output Data + Usage Log Reference
```

**Campaign Workflow:**

1. **Create Campaign** - `CampaignsPage.jsx`
   - User defines campaign name and description
   - Selects multiple agents as tasks
   - Campaign saved with "Not Started" status

2. **Navigate to Agent** - From campaign detail page
   - Click task to open agent page
   - `campaignId` passed via React Router state
   - Agent UI shows campaign badge

3. **Execute Agent** - Within campaign context
   - Agent runs normally with full functionality
   - `campaignId` included in token service call
   - Success triggers task completion flow

4. **Save Artifact** - `handleCampaignTaskCompletion()`
   - Links output to usage log
   - Stores full output_data JSON
   - Marks task as complete
   - Updates campaign progress

5. **View Results** - `CampaignDetailPage.jsx`
   - Lists all completed artifacts
   - Custom rendering for each agent type
   - Campaign status auto-updates

**Task Completion Function:**
```javascript
await handleCampaignTaskCompletion(
  campaignId,      // Campaign identifier
  agentId,         // Agent database ID
  agentName,       // Agent display name
  logId,           // Usage log reference
  outputData,      // Full JSON output
  outputSummary    // Human-readable summary
);
```

**Campaign Statuses:**
- **Not Started** - Tasks defined but none executed
- **In Progress** - Some tasks completed, others pending
- **Completed** - All tasks finished successfully

---

### Chat History (Usage Logs)

**Complete Execution Audit Trail:**

**Data Captured Per Run:**
- User ID and timestamp
- Agent ID and name
- Input data (request payload)
- Output data (response payload)
- Output summary (AI-generated)
- Tokens spent
- Execution status (success/failed)
- Error message (if failed)
- Campaign association (if applicable)

**Filtering Capabilities:**
- By agent (dropdown selection)
- By date range (from/to)
- By status (success/failed)
- By campaign (linked runs)

**Display Features:**
- Chronological order (newest first)
- Agent icon and name
- Formatted timestamps
- Input/output previews
- Token cost badges
- Status indicators (✓/✗)
- Campaign links (if associated)

**Auto-Generated Summaries:**
Examples:
- "SEO analysis for example.com"
- "Generated 50 leads for New York restaurants"
- "Broadcast sent to 200 WhatsApp contacts"
- "Created 3 video scripts for fitness niche"

---

### Analytics Dashboard

**Four Primary Visualizations:**

1. **Token Spend Over Time** (Line Chart)
   - X-axis: Date
   - Y-axis: Tokens spent
   - Groups by day/week/month
   - Shows spending trends

2. **Agent Runs Over Time** (Line Chart)
   - X-axis: Date
   - Y-axis: Number of executions
   - Tracks usage frequency
   - Identifies peak activity periods

3. **Agent Usage Distribution** (Pie Chart)
   - Shows percentage of runs per agent
   - Color-coded segments
   - Identifies most-used agents
   - Interactive tooltips

4. **Token Spend by Agent** (Bar Chart)
   - X-axis: Agent names
   - Y-axis: Total tokens spent
   - Compares costs across agents
   - Helps identify budget allocation

**Recharts Implementation:**
- Responsive charts adapting to screen size
- Custom colors matching brand palette
- Tooltips with detailed data on hover
- Legend for easy interpretation
- Smooth animations on load

**Key Performance Indicators (KPIs):**
- Total Agent Runs (all time)
- Total Tokens Spent (all time)
- Favorite Agent (most frequently used)
- Real-time balance display

---

### Artifact Rendering System

**Custom Display Logic Per Agent:**

Each agent has a dedicated rendering function in `CampaignDetailPage.jsx`:

**SEOrix** - Priority-based recommendations
```jsx
- Grouped by priority level (High/Medium/Low)
- Color-coded badges
- Actionable improvement suggestions
- Technical SEO issues highlighted
```

**LeadGen** - Lead cards with quality scores
```jsx
- Business name and category
- Contact information (phone, email, website)
- Lead score indicator (1-100)
- Google Maps integration links
```

**SociaPlan** - Weekly calendar grid
```jsx
- 7-day layout with day headers
- Post content for each day
- Platform indicators (Instagram/Facebook/Twitter)
- Hashtags and engagement tips
- Optimal posting times
```

**EchoMind** - Sentiment analysis results
```jsx
- Overall sentiment score and classification
- Key themes and topics identified
- Positive/negative highlights
- Actionable insights
- Emotional tone breakdown
```

**WhatsPulse** - Broadcast statistics
```jsx
- Total messages sent
- Delivery success rate
- Campaign details
- Contact count
```

**AdVisor** - Ad creative with image
```jsx
- Generated ad title and copy
- AI-generated image with error handling
- Fallback placeholder for missing images
- Multiple creative variations
```

**Scriptly** - Script variations with scenes
```jsx
- 3 distinct script options
- Scene-by-scene breakdown
- Hook, body, and CTA sections
- Voiceover and visual notes
- Duration estimates
```

**Adbrief** - Strategic brief variations
```jsx
- Multiple creative angles
- Target audience definition
- Key messaging points
- Tone and style guidelines
- Visual direction
```

**TrendIQ** - Trend analysis (location/keyword modes)
```jsx
- Location Mode: Geographic trends, regional insights
- Keyword Mode: Topic trends, sentiment analysis
- Data sources cited
- Trend trajectory (rising/falling/stable)
```

**ClipGen** - Viral clip recommendations
```jsx
- Ranked clips by virality score (0-100)
- Transcript excerpts
- Generated captions
- Platform recommendations (Instagram/TikTok/YouTube)
- Posting schedule suggestions
```

**RingCast** - Voice campaign results
```jsx
- Campaign name and message
- Total calls made
- Success rate
- Duration statistics
```

**InfluenceScope** - Influencer profile analysis
```jsx
- Profile metrics (followers, engagement rate)
- Authenticity score (0-100) with grade (A-F)
- Audience quality analysis
- Brand partnership suitability
- Estimated rates for sponsored content
- Red flags and green flags
- Recommendation summary
```

**SocialInsight** - Session access confirmation
```jsx
- Access granted indicator
- Embedded Streamlit app display
- YouTube download/transcription interface
- Instagram analysis tools
```

**Data Format Handling:**
Supports multiple webhook response structures:
- `[{output: {...}}]` - Array with output wrapper
- `{output: {...}}` - Object with output wrapper
- `{...}` - Direct output object

---

### Real-time Updates

**Supabase Realtime Subscriptions:**

1. **Profile Balance Updates**
```javascript
supabase
  .channel('public:profiles')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'profiles',
    filter: `id=eq.${userId}`
  }, (payload) => {
    setProfile(payload.new); // Live balance update
  })
  .subscribe();
```

2. **Campaign Status Changes**
- Auto-refresh when tasks complete
- Live progress percentage updates
- Real-time artifact additions

3. **Usage Log Additions**
- New runs appear instantly in analytics
- Charts update without refresh
- History table reflects latest data

---

### Security & Data Protection

**Row Level Security (RLS) Policies:**

All tables have RLS enabled with policies ensuring:
- Users can only see their own data
- No cross-user data leakage
- Server-side authorization checks

**Authentication:**
- Supabase Auth with email/password
- Session management via secure tokens
- Auto-logout on token expiration
- Protected routes require valid session

**Token Management Security:**
- Server-side balance checks prevent manipulation
- Atomic transactions ensure consistency
- Audit trail for all token movements
- No client-side cost calculation trust

**Data Validation:**
- Input sanitization on all forms
- Type checking for numeric inputs
- URL validation for web endpoints
- CSV format validation for uploads

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### **1. Port Already in Use**
```bash
# Vite automatically increments port (5173 → 5174 → 5175)
# Or specify a custom port:
npm run dev -- --port 3000
```

#### **2. Supabase Authentication Errors**
**Symptoms:**
- "Session not found" errors
- Automatic redirects to login
- Auth state not persisting

**Solutions:**
- Verify `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after changing environment variables
- Check Supabase project status at dashboard.supabase.com
- Clear browser cache and localStorage
- Ensure no CORS issues in browser console

#### **3. Token Deduction Not Working**
**Symptoms:**
- Tokens not decreasing after agent runs
- "Insufficient tokens" despite having balance
- Token balance stuck at same value

**Solutions:**
- Verify `supabase-setup.sql` executed completely without errors
- Check RLS policies are enabled on `profiles` table
- Ensure user has a profile row (auto-created on signup)
- Verify `deduct_tokens()` function exists in database
- Check browser console for JavaScript errors
- Confirm webhook is returning success status

**Debugging Commands:**
```sql
-- Check user profile exists
SELECT * FROM profiles WHERE id = '<your-user-id>';

-- Check token_usage_log for recent entries
SELECT * FROM token_usage_log 
WHERE user_id = '<your-user-id>' 
ORDER BY created_at DESC LIMIT 5;

-- Verify agent exists
SELECT * FROM agents WHERE name = 'SEOrix';
```

#### **4. Agent Webhook Timeouts**
**Symptoms:**
- "Request timeout" errors
- Long loading times with no response
- Agents stuck in loading state

**Solutions:**
- **SEOrix**: 10-minute timeout (crawls entire sites)
- **Others**: 5-minute timeout
- Check n8n workflow is running and accessible
- Verify webhook URL in agent page code
- Ensure CORS headers configured on webhook
- Check n8n execution logs for errors
- Test webhook directly with Postman/curl

**Webhook Testing:**
```bash
curl -X POST https://your-webhook-url \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

#### **5. Images Not Loading (AdVisor)**
**Symptoms:**
- Broken image icons
- Placeholder images showing
- "Failed to load" errors

**Solutions:**
- Check `imageUrl` field exists in AdVisor output
- Verify image host allows cross-origin requests (CORS)
- Inspect browser Network tab for 403/404 errors
- Ensure image URL is publicly accessible
- Check if image format is supported (jpg/png/webp)
- Placeholder automatically shown for missing images

#### **6. Campaign Artifacts Not Displaying**
**Symptoms:**
- "No artifacts found" message
- Raw JSON showing instead of formatted output
- Agent output not saving to campaign

**Solutions:**
- Check browser console for data structure errors
- Verify agent has rendering case in `CampaignDetailPage.jsx`
- Ensure `output_data` format matches expected structure
- Confirm `logId` was returned from token service
- Verify `handleCampaignTaskCompletion()` was called successfully
- Check `campaign_artifacts` table for saved data

**Debugging:**
```javascript
// In browser console
console.log('Output Data:', artifactData.output_data);
console.log('Type:', typeof artifactData.output_data);
console.log('Is Array:', Array.isArray(artifactData.output_data));
```

#### **7. CSV Upload Failures (WhatsPulse/RingCast)**
**Symptoms:**
- "Invalid CSV" error
- Contact count shows 0
- File not being read

**Solutions:**
- Ensure CSV format: `Name,PhoneNumber` (header row + data rows)
- Check file encoding is UTF-8
- Remove special characters from names
- Verify phone numbers are in correct format
- No empty lines in CSV
- Use standard comma delimiter (not semicolon)

**Valid CSV Example:**
```csv
Name,PhoneNumber
John Doe,+1234567890
Jane Smith,+9876543210
```

#### **8. ClipGen Not Generating Clips**
**Symptoms:**
- "No clips generated" message
- Empty results array
- Invalid data structure error

**Solutions:**
- Verify YouTube URL is valid and public
- Ensure video has captions/transcript available
- Check video isn't age-restricted or private
- Video must be >2 minutes long for clip extraction
- Wait for webhook processing (can take 1-2 minutes)
- Check browser console for parsing errors

#### **9. SocialInsight Iframe Not Loading**
**Symptoms:**
- Blank iframe
- Loading forever
- Streamlit app not visible

**Solutions:**
- Check if Streamlit app URL is accessible
- Verify embed parameters in iframe src
- Disable browser extensions blocking iframes
- Check browser console for CORS/CSP errors
- Try accessing Streamlit URL directly first
- Clear browser cache and cookies

#### **10. Real-time Updates Not Working**
**Symptoms:**
- Token balance not updating automatically
- Need to refresh page to see changes
- Charts not showing latest data

**Solutions:**
- Verify Supabase Realtime is enabled for project
- Check if WebSocket connection is established (Network tab)
- Ensure subscription code is not being unmounted
- Verify RLS policies allow SELECT on updated rows
- Check if browser is blocking WebSocket connections
- Refresh page to re-establish subscription

---

### Database Maintenance

**Reset Token Balance:**
```sql
UPDATE profiles 
SET tokens_remaining = 5000 
WHERE email = 'your-email@example.com';
```

**View Recent Usage:**
```sql
SELECT 
  agent_name, 
  tokens_deducted, 
  created_at,
  status
FROM token_usage_log 
WHERE user_id = '<your-id>' 
ORDER BY created_at DESC 
LIMIT 10;
```

**Check Campaign Progress:**
```sql
SELECT 
  c.name, 
  c.status, 
  COUNT(ct.id) as task_count,
  COUNT(ca.id) as artifact_count
FROM campaigns c
LEFT JOIN campaign_tasks ct ON c.id = ct.campaign_id
LEFT JOIN campaign_artifacts ca ON c.id = ca.campaign_id
WHERE c.user_id = '<your-id>'
GROUP BY c.id, c.name, c.status;
```

**View Agent Performance:**
```sql
SELECT 
  agent_name,
  COUNT(*) as total_runs,
  SUM(tokens_deducted) as total_cost,
  AVG(tokens_deducted) as avg_cost,
  COUNT(*) FILTER (WHERE status = 'success') as successful_runs
FROM token_usage_log
WHERE user_id = '<your-id>'
GROUP BY agent_name
ORDER BY total_runs DESC;
```

**Find Failed Executions:**
```sql
SELECT 
  agent_name,
  created_at,
  error_message,
  request_data
FROM usage_logs
WHERE user_id = '<your-id>' 
  AND status = 'failed'
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🔄 Recent Updates

### ✅ v2.0 - Major Feature Expansion (Current)

**New Agents Added:**
- ✨ **ClipGen** (350 tokens) - Viral clip generator from long-form videos
- 📞 **RingCast** (40 tokens/call) - Automated voice broadcast system
- 📸 **InfluenceScope** (100 tokens) - Instagram influencer deep analysis
- 🎥 **SocialInsight** (150 tokens) - YouTube & Instagram content analyzer

**New Features:**
- 🎬 **ClipGen Functionality**: Transform YouTube videos into viral clips with virality scoring, captions, and platform recommendations
- 📞 **Voice Broadcasting**: CSV-based contact upload with personalized voice message delivery
- 🔍 **Influencer Analytics**: Comprehensive Instagram analysis with authenticity scores, audience quality, and partnership insights
- 📊 **Embedded Analytics**: Streamlit app integration for advanced content analysis
- 💰 **Variable Pricing Models**: Per-call (RingCast) and per-contact (WhatsPulse) token calculations
- 🔐 **Session-Based Access**: Upfront token deduction for embedded app access (SocialInsight)

**UI/UX Improvements:**
- 🎨 Enhanced glassmorphic design with animated floating orbs
- 📱 Improved mobile responsiveness across all agent pages
- ⚡ Faster loading animations and smoother transitions
- 🎯 Better error messaging and user feedback
- 🖼️ Image fallback handling for AdVisor
- 📊 Expanded artifact rendering for new agents

**Technical Enhancements:**
- 🔧 Refactored token service with better error handling
- 📦 Data format normalization for all agents
- 🚀 Optimized webhook timeout configurations
- 🐛 Fixed double token deduction prevention
- 📝 Improved logging and debugging capabilities
- 🔄 Better state management in React components

### ✅ v1.5 - Analytics & Campaign System

**Features Added:**
- Split analytics charts (Token Spend + Agent Runs as separate visualizations)
- Enhanced campaign artifact display system
- TrendIQ artifact rendering (was showing raw JSON)
- Improved data unwrapping logic for all agents
- Better console logging for debugging

**Bug Fixes:**
- Fixed image error handling in AdVisor artifacts
- Resolved artifact display issues for TrendIQ
- Improved data structure validation
- Enhanced error messages throughout platform

### ✅ v1.0 - Initial Release

**Core Features:**
- 10 AI marketing agents (SEOrix, LeadGen, WhatsPulse, AdVisor, SociaPlan, EchoMind, TrendIQ, Scriptly, Adbrief, GraphiGen)
- Token-based economy system
- Campaign management (create, track, view artifacts)
- Analytics dashboard with 4 chart types
- Usage history/chat logs
- Supabase authentication
- Complete database schema with RLS policies

---

## 🤝 Contributing

This is a proprietary project. For any questions or feature requests, please contact the development team.

**Development Guidelines:**
1. Follow existing code style and naming conventions
2. Test all token deduction flows thoroughly
3. Ensure RLS policies are respected
4. Add console logs for debugging complex flows
5. Update this README when adding new agents or features
6. Maintain inline styling consistency (no external CSS for components)
7. Preserve glassmorphic design language

**Adding a New Agent:**
1. Create new page component in `/src/AgentNamePage.jsx`
2. Add route in `App.jsx`
3. Update `agentDetails` array in `DashboardPage.jsx`
4. Insert agent record in `supabase-setup.sql`
5. Add artifact rendering case in `CampaignDetailPage.jsx`
6. Update this README with agent details
7. Test token deduction and campaign integration

---

## 📄 License

This project is proprietary. All rights reserved. © 2025 Market Muse AI

---

## 📞 Support

For technical support or questions:
- Check [Troubleshooting](#troubleshooting) section
- Review browser console logs
- Inspect Supabase database tables
- Test webhooks independently
- Verify environment variables

---

**Built with ❤️ using React + Vite + Supabase**

*Last Updated: November 2025*
