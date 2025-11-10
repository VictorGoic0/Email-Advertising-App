# Technical Product Requirements Document (PRD)
## Automated Email Advertising Workflow System

**Project ID**: 7I6vCTUQoLBswu6xcOZW_1762636780105  
**Organization**: [Organization Name]  
**Document Version**: 1.0 (MVP)  
**Last Updated**: November 10, 2025  
**Author**: Technical Team  

---

## Executive Summary

The Automated Email Advertising Workflow System is an AI-accelerated solution designed to streamline email advertising processes. This Technical PRD defines the implementation approach for the MVP, focusing on P0 features that automate asset collection, email proof generation, and approval workflows. The system leverages modern web technologies, AI frameworks, and cloud infrastructure to reduce campaign setup time from hours to minutes.

**MVP Timeline**: Target completion by Wednesday (prioritizing functionality over deployment)

---

## Technical Architecture Overview

### System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │◄───────►│  FastAPI Backend │◄───────►│   PostgreSQL    │
│  (Vite + shadcn)│         │     (Python)     │         │   (Dev: SQLite) │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │   AWS S3 │    │  OpenAI  │    │   MJML   │
              │  Storage │    │   API    │    │ Compiler │
              └──────────┘    └──────────┘    └──────────┘
```

### Technology Stack

**Frontend**:
- **Framework**: Vite + React 18+ with TypeScript
- **UI Components**: shadcn/ui (custom component system)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: React Router v6

**Backend**:
- **Framework**: FastAPI (Python 3.11+)
- **API Documentation**: Auto-generated OpenAPI/Swagger
- **Async Support**: asyncio for concurrent operations
- **Validation**: Pydantic models

**Database**:
- **Development**: SQLite (local development)
- **Production**: PostgreSQL via AWS RDS (future)
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic

**Storage & Infrastructure**:
- **File Storage**: AWS S3 (separate buckets for dev/prod)
- **AI Services**: OpenAI API
  - GPT-3.5-turbo for asset categorization
  - GPT-4 for email content generation
- **Email Templates**: MJML (responsive email framework)

**Deployment** (Post-MVP):
- **Frontend**: Netlify
- **Backend**: Railway
- **Note**: AWS Lambda deployment is out of scope due to configuration complexity

**Development Tools**:
- **Version Control**: Git
- **Package Management**: npm (frontend), pip (backend)
- **Code Quality**: ESLint, Prettier (frontend), Black, Ruff (backend)
- **API Testing**: Pytest (backend only, end of MVP)

---

## Database Schema

### 1. Users Table
Stores all system users with role-based access.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Plain text for MVP (no hashing)
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('advertiser', 'campaign_manager', 'tech_support')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Role Definitions**:
- `advertiser`: Creates campaigns, uploads assets, submits for approval
- `campaign_manager`: Reviews and approves/rejects campaigns
- `tech_support`: Views performance monitoring dashboard only

---

### 2. Assets Table
Stores metadata for all uploaded assets (files stored in S3).

```sql
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(512) NOT NULL,           -- S3 object key
    s3_url TEXT NOT NULL,                    -- Pre-signed or public URL
    file_type VARCHAR(50) NOT NULL,          -- MIME type (image/jpeg, text/plain, etc.)
    file_size_bytes INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('pending', 'logo', 'image', 'copy', 'url')),
    categorization_method VARCHAR(50) CHECK (categorization_method IN ('rules', 'ai', 'manual')),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_uploaded_at ON assets(uploaded_at);
```

**Category Definitions**:
- `pending`: Newly uploaded, awaiting categorization
- `logo`: Company/brand logos
- `image`: General images (hero images, product photos, etc.)
- `copy`: Text content for email body
- `url`: Links/URLs to include in email

---

### 3. Campaigns Table
Stores campaign details, generated content, and approval status.

```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255) NOT NULL,
    target_audience TEXT,
    campaign_goal TEXT,
    additional_notes TEXT,
    
    -- Generated email content
    generated_email_html TEXT,               -- Compiled HTML for email clients
    generated_email_mjml TEXT,               -- Source MJML template
    
    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
    
    -- Approval workflow
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- Optional scheduling (P1 feature - data model ready, UI not implemented)
    scheduled_send_date TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_advertiser_id ON campaigns(advertiser_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX idx_campaigns_reviewed_by ON campaigns(reviewed_by);
```

**Status Workflow**:
1. `draft`: Campaign is being created (assets being uploaded)
2. `pending_approval`: Campaign submitted, awaiting Campaign Manager review
3. `approved`: Campaign Manager approved the email proof
4. `rejected`: Campaign Manager rejected with reason

---

### 4. Campaign_Assets Table
Junction table linking campaigns to assets (many-to-many relationship).

```sql
CREATE TABLE campaign_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    asset_role VARCHAR(50),                  -- 'primary_logo', 'hero_image', 'body_copy', etc.
    display_order INTEGER,                   -- Order for assets of same role
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(campaign_id, asset_id)
);

CREATE INDEX idx_campaign_assets_campaign_id ON campaign_assets(campaign_id);
CREATE INDEX idx_campaign_assets_asset_id ON campaign_assets(asset_id);
```

**Purpose**: 
- Allows assets to be reused across multiple campaigns
- Tracks which assets are used in each campaign
- Defines the role of each asset within a campaign (for AI to properly place in email template)

---

### 5. Performance_Metrics Table
Stores system performance data for monitoring dashboard.

```sql
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(100) NOT NULL,       -- 'proof_generation', 'api_call', etc.
    metric_value DECIMAL(10, 2),
    metadata JSONB,                          -- Flexible storage for additional context
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);
```

**Metric Types for MVP**:
- `proof_generation_time`: Latency in seconds for generating email proofs
- `api_response_time`: API endpoint response times
- `queue_depth`: Number of campaigns in `pending_approval` status
- `approval_rate`: Percentage of approved vs rejected campaigns

---

### 6. System_Health Table
Tracks health checks for different system components.

```sql
CREATE TABLE system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component VARCHAR(100) NOT NULL,         -- 'api', 's3', 'database', 'openai'
    status VARCHAR(50) NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
    response_time_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_health_component ON system_health(component);
CREATE INDEX idx_system_health_checked_at ON system_health(checked_at);
```

---

## Seed Data Script

For MVP development and testing, the following user accounts will be seeded:

```python
# seed_data.py

SEED_USERS = [
    # Advertisers (create campaigns, upload assets)
    {
        "email": "advertiser1@example.com",
        "password": "password123",
        "full_name": "Alice Advertiser",
        "role": "advertiser"
    },
    {
        "email": "advertiser2@example.com",
        "password": "password123",
        "full_name": "Bob Brand",
        "role": "advertiser"
    },
    {
        "email": "advertiser3@example.com",
        "password": "password123",
        "full_name": "Carol Campaign",
        "role": "advertiser"
    },
    
    # Campaign Managers (review and approve campaigns)
    {
        "email": "manager1@example.com",
        "password": "password123",
        "full_name": "David Manager",
        "role": "campaign_manager"
    },
    {
        "email": "manager2@example.com",
        "password": "password123",
        "full_name": "Emma Editor",
        "role": "campaign_manager"
    },
    
    # Technical Support (performance monitoring only)
    {
        "email": "support@example.com",
        "password": "password123",
        "full_name": "Frank Support",
        "role": "tech_support"
    }
]
```

**Note**: Password hashing (bcrypt) is not implemented for MVP. Plain text passwords are acceptable for development.

---

## User Flows & Features

### P0 Features (MVP - Must Have)

#### 1. Asset Collection System

**Goal**: Automate the collection and categorization of advertising assets (logos, images, URLs, copy text).

**User Flow**:

**Step 1: Upload Screen**
- User navigates to campaign creation
- Presented with drag-and-drop upload zone
- Can upload multiple files simultaneously (any file type)
- Files are uploaded to S3
- **Rules-Based Auto-Categorization** happens immediately:
  - `.txt`, `.doc`, `.docx` → Category: `copy`
  - `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` → Category: `image`
  - Files containing "logo" in filename → Category: `logo`
  - Default fallback → Category: `pending`
- Each uploaded file gets a row in `assets` table with:
  - `categorization_method: 'rules'`
  - Auto-assigned category
- User automatically progresses to Review Screen

**Step 2: Review Screen**
- All uploaded assets displayed as cards:
  - **Image cards**: Show thumbnail preview + filename
  - **Text cards**: Show filename + first line of content preview
- Each card displays auto-assigned category tag
- Two options:
  1. **"Looks Good"** button → Proceed to campaign creation (assets marked as categorized, linked to campaign)
  2. **"Recategorize with AI"** button → Trigger AI re-analysis

**Step 3: AI Recategorization (Optional)**
- If user clicks "Recategorize with AI":
  - Backend sends all asset metadata (filenames, file types) to OpenAI API (GPT-3.5-turbo)
  - AI analyzes and suggests new categories
  - Categories update in real-time on frontend
  - `categorization_method` updates to `'ai'`
- User can then:
  - Accept AI suggestions → Proceed to campaign creation
  - OR manually override (drag cards to correct category)

**Step 4: Manual Override (Optional)**
- If AI categorization still incorrect:
  - User drags asset cards between category zones: "Logos", "Images", "URLs", "Copy"
  - `categorization_method` updates to `'manual'`
- User clicks "Confirm" → Proceed to campaign creation

**Technical Implementation**:

**Rules Engine** (FastAPI backend):
```python
def categorize_asset(filename: str, file_type: str) -> tuple[str, str]:
    """
    Returns: (category, categorization_method)
    """
    filename_lower = filename.lower()
    
    # Rule 1: Logo detection
    if 'logo' in filename_lower:
        return ('logo', 'rules')
    
    # Rule 2: File extension mapping
    text_extensions = ['.txt', '.doc', '.docx']
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    
    if any(filename_lower.endswith(ext) for ext in text_extensions):
        return ('copy', 'rules')
    
    if any(filename_lower.endswith(ext) for ext in image_extensions):
        return ('image', 'rules')
    
    # Fallback
    return ('pending', 'rules')
```

**AI Recategorization** (OpenAI integration with GPT-3.5-turbo):
```python
async def ai_categorize_assets(assets: list[Asset]) -> dict[UUID, str]:
    """
    Sends asset metadata to GPT-3.5-turbo for categorization.
    Returns mapping of asset_id -> new_category
    """
    prompt = f"""
    Categorize the following files into: logo, image, copy, or url.
    
    Files:
    {json.dumps([{"filename": a.filename, "type": a.file_type} for a in assets])}
    
    Return JSON: {{"asset_id": "category"}}
    """
    
    response = await openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return json.loads(response.choices[0].message.content)
```

**Data Model Notes**:
- Assets stored in `assets` table with `user_id` (who uploaded)
- For MVP: Assets uploaded during campaign creation are immediately linked via `campaign_assets` table
- Post-MVP: Can add "Asset Library" UI where users browse all their assets across campaigns

---

#### 2. Email Proof Generation

**Goal**: Automatically generate email proofs in under 5 seconds using AI and MJML templates.

**User Flow**:

1. After assets are categorized and linked to campaign, user fills in campaign details:
   - Campaign name
   - Target audience (optional)
   - Campaign goal (optional)
   - Additional notes (optional)

2. User clicks **"Generate Email Proof"** button

3. Backend process:
   - Retrieves campaign details and linked assets from database
   - Sends data to OpenAI API (GPT-4) for content generation
   - AI generates MJML template with:
     - Intelligent asset placement (logo at top, hero image, body copy, CTAs)
     - Optimized email copy if user-provided copy is sparse
     - Proper email structure and formatting
   - MJML compiles to email-safe HTML
   - Both MJML and HTML stored in `campaigns` table

4. Frontend displays:
   - Real-time preview of generated email
   - Side-by-side view (mobile and desktop preview)
   - Edit options (future enhancement)

5. User can:
   - **Submit for Approval** → Campaign status changes to `pending_approval`
   - **Regenerate** → Runs AI generation again (if not satisfied)
   - **Save as Draft** → Campaign status remains `draft`

**Technical Implementation**:

**AI Email Generation** (OpenAI + MJML with GPT-4):
```python
async def generate_email_proof(campaign: Campaign, assets: list[Asset]) -> dict:
    """
    Generates MJML and HTML email using OpenAI GPT-4.
    Target: <5 seconds total execution time
    """
    start_time = time.time()
    
    # Organize assets by category
    logos = [a for a in assets if a.category == 'logo']
    images = [a for a in assets if a.category == 'image']
    copy_assets = [a for a in assets if a.category == 'copy']
    
    # Prepare prompt for OpenAI
    prompt = f"""
    Create an MJML email template for the following campaign:
    
    Campaign Name: {campaign.campaign_name}
    Target Audience: {campaign.target_audience}
    Goal: {campaign.campaign_goal}
    
    Available Assets:
    - Logos: {len(logos)} available
    - Images: {len(images)} available  
    - Copy: {copy_assets[0].filename if copy_assets else "None provided"}
    
    Requirements:
    - Use MJML syntax
    - Place primary logo at top
    - Include hero image if available
    - Generate compelling email copy that aligns with campaign goal
    - Include clear CTA button
    - Ensure mobile responsiveness
    
    Return only valid MJML code.
    """
    
    # Call OpenAI API with GPT-4
    response = await openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    mjml_code = response.choices[0].message.content
    
    # Compile MJML to HTML
    html_output = mjml.mjml_to_html(mjml_code)
    
    # Record performance metric
    generation_time = time.time() - start_time
    await record_metric('proof_generation_time', generation_time)
    
    return {
        'mjml': mjml_code,
        'html': html_output,
        'generation_time': generation_time
    }
```

**MJML Integration**:
- Use Python package: `mjml` (wrapper for Node.js MJML compiler)
- MJML ensures email compatibility across all email clients (Gmail, Outlook, Apple Mail, etc.)
- Responsive by default

**Performance Optimization**:
- OpenAI API call is the bottleneck (typically 2-4 seconds)
- Use streaming responses if available to start rendering sooner
- Cache common templates to reduce AI calls (post-MVP)
- Record all generation times in `performance_metrics` table

---

#### 3. Real-Time Preview System

**Goal**: Allow users to preview generated email campaigns before submission.

**User Flow**:

1. After email proof is generated, user sees **Preview Screen**
2. Preview displays:
   - Full email rendered as HTML
   - Toggle between Desktop and Mobile views
   - Actual asset placement (logos, images, copy)
3. User can:
   - Scroll through entire email
   - Toggle device views
   - Click **"Submit for Approval"** if satisfied
   - Click **"Regenerate"** if changes needed

**Technical Implementation**:

**Frontend (React Component)**:
```tsx
interface EmailPreviewProps {
  emailHtml: string;
  campaignName: string;
}

export function EmailPreview({ emailHtml, campaignName }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  return (
    <div className="email-preview">
      <div className="preview-controls">
        <h2>{campaignName} - Email Preview</h2>
        <div className="view-toggle">
          <button onClick={() => setViewMode('desktop')}>Desktop</button>
          <button onClick={() => setViewMode('mobile')}>Mobile</button>
        </div>
      </div>
      
      <div className={`preview-container ${viewMode}`}>
        <iframe
          srcDoc={emailHtml}
          title="Email Preview"
          sandbox="allow-same-origin"
          className="email-iframe"
        />
      </div>
      
      <div className="preview-actions">
        <button onClick={handleRegenerate}>Regenerate</button>
        <button onClick={handleSubmit}>Submit for Approval</button>
      </div>
    </div>
  );
}
```

**Security Considerations**:
- Email HTML rendered in sandboxed iframe to prevent XSS
- No JavaScript execution in preview
- Use `srcDoc` instead of `src` to avoid CORS issues

---

#### 4. Advertiser Feedback/Approval Workflow

**Goal**: Facilitate seamless communication and approval between Advertisers and Campaign Managers.

**Approval Workflow**:

**Advertiser Side**:
1. After generating email proof and previewing, click **"Submit for Approval"**
2. Campaign status changes from `draft` to `pending_approval`
3. Campaign disappears from Advertiser's active campaigns
4. Advertiser can view submission status (pending, approved, rejected) in **"My Campaigns"** page

**Campaign Manager Side**:
1. Campaign Manager logs in and sees **Approval Queue Dashboard**
2. Dashboard shows all campaigns with status `pending_approval`, sorted by `created_at` (oldest first)
3. Each campaign card displays:
   - Campaign name
   - Advertiser name
   - Submission timestamp
   - Quick preview thumbnail
4. Campaign Manager clicks campaign to view full email proof
5. Campaign Manager can:
   - **Approve** → Campaign status changes to `approved`, visible to Advertiser
   - **Reject** → Must provide rejection reason, status changes to `rejected`

**Post-Approval**:
- If **Approved**: Advertiser sees campaign in "Approved Campaigns" section
- If **Rejected**: Advertiser sees rejection reason, can edit and resubmit

**Technical Implementation**:

**API Endpoints**:

```python
# Submit campaign for approval (Advertiser)
@app.post("/api/campaigns/{campaign_id}/submit")
async def submit_campaign(campaign_id: UUID, user: User = Depends(get_current_user)):
    if user.role != 'advertiser':
        raise HTTPException(403, "Only advertisers can submit campaigns")
    
    campaign = await db.get_campaign(campaign_id)
    if campaign.advertiser_id != user.id:
        raise HTTPException(403, "Not your campaign")
    
    campaign.status = 'pending_approval'
    campaign.updated_at = datetime.now()
    await db.update_campaign(campaign)
    
    return {"message": "Campaign submitted for approval"}

# Get approval queue (Campaign Manager)
@app.get("/api/campaigns/approval-queue")
async def get_approval_queue(user: User = Depends(get_current_user)):
    if user.role != 'campaign_manager':
        raise HTTPException(403, "Only campaign managers can access approval queue")
    
    campaigns = await db.get_campaigns_by_status('pending_approval')
    campaigns.sort(key=lambda c: c.created_at)  # Oldest first
    
    return campaigns

# Approve campaign (Campaign Manager)
@app.post("/api/campaigns/{campaign_id}/approve")
async def approve_campaign(campaign_id: UUID, user: User = Depends(get_current_user)):
    if user.role != 'campaign_manager':
        raise HTTPException(403, "Only campaign managers can approve")
    
    campaign = await db.get_campaign(campaign_id)
    campaign.status = 'approved'
    campaign.reviewed_by = user.id
    campaign.reviewed_at = datetime.now()
    await db.update_campaign(campaign)
    
    # Record approval metric
    await record_metric('campaign_approval', 1)
    
    return {"message": "Campaign approved"}

# Reject campaign (Campaign Manager)
@app.post("/api/campaigns/{campaign_id}/reject")
async def reject_campaign(
    campaign_id: UUID,
    rejection_reason: str,
    user: User = Depends(get_current_user)
):
    if user.role != 'campaign_manager':
        raise HTTPException(403, "Only campaign managers can reject")
    
    campaign = await db.get_campaign(campaign_id)
    campaign.status = 'rejected'
    campaign.reviewed_by = user.id
    campaign.reviewed_at = datetime.now()
    campaign.rejection_reason = rejection_reason
    await db.update_campaign(campaign)
    
    # Record rejection metric
    await record_metric('campaign_rejection', 1)
    
    return {"message": "Campaign rejected"}
```

**Frontend - Approval Queue (Campaign Manager)**:
```tsx
export function ApprovalQueue() {
  const [campaigns, setCampaigns] = useState([]);
  
  useEffect(() => {
    fetchApprovalQueue();
  }, []);
  
  const fetchApprovalQueue = async () => {
    const response = await axios.get('/api/campaigns/approval-queue');
    setCampaigns(response.data);
  };
  
  return (
    <div className="approval-queue">
      <h1>Approval Queue</h1>
      <p>{campaigns?.length || 0} campaigns awaiting review</p>
      
      <div className="campaign-grid">
        {campaigns?.map(campaign => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  );
}
```

**Metrics Tracked**:
- Queue depth: Number of campaigns in `pending_approval` status
- Approval rate: `COUNT(approved) / COUNT(approved + rejected) * 100`
- Time to approval: `AVG(reviewed_at - created_at)` for approved campaigns

---

### P1 Features (Should Have - Optional for MVP)

These features are documented for future implementation but **not included in MVP scope**.

#### 1. Campaign Scheduling and Staging System

**Goal**: Enable advance scheduling of campaigns for future deployment.

**Implementation Notes**:
- Data model already supports this (`scheduled_send_date` field in `campaigns` table)
- Future UI would include:
  - Date/time picker for scheduling
  - Calendar view of scheduled campaigns
  - Edit/cancel scheduled campaigns
- Backend cron job would check for campaigns where `scheduled_send_date <= NOW()` and trigger sends

**Estimated Effort**: 2-3 days post-MVP

---

#### 2. Editorial Review Interface

**Goal**: Provide Campaign Managers with tools to edit campaign content before approval.

**Implementation Notes**:
- Add inline editing capabilities to approval queue
- Campaign Managers can:
  - Edit MJML directly (for advanced users)
  - Use WYSIWYG editor to modify content
  - Regenerate proof after edits
- Requires additional endpoints for updating `generated_email_mjml` and `generated_email_html`

**Estimated Effort**: 3-4 days post-MVP

---

### P2 Features (Nice to Have - Post-MVP)

#### 1. AI-Based Content Suggestions

**Goal**: Offer dynamic content recommendations based on past campaign performance.

**Out of Scope for MVP**: This requires historical campaign data and A/B testing infrastructure.

---

## Authentication System (Mock Auth for MVP)

**Scope**: Simplified authentication without full security features.

**Implementation**:

**Login Flow**:
1. User enters email and password
2. Backend checks against `users` table (plain text password comparison)
3. If valid, backend returns user object including user ID
4. Frontend stores user in React Context
5. All API requests include user ID in `X-User-ID` header (no token verification)

**API Endpoints**:
```python
@app.post("/api/auth/login")
async def login(email: str, password: str):
    user = await db.get_user_by_email(email)
    
    if not user or user.password != password:  # Plain text comparison
        raise HTTPException(401, "Invalid credentials")
    
    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

# Dependency for protected routes
async def get_current_user(user_id: str = Header(alias="X-User-ID")) -> User:
    user = await db.get_user_by_id(UUID(user_id))
    if not user:
        raise HTTPException(401, "Unauthorized")
    return user
```

**Frontend (React Context)**:
```tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/login', { email, password });
    
    if (response.status === 200) {
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Axios Interceptor for Auth Header**:
```tsx
// lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Add user ID to all requests
api.interceptors.request.use((config) => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    const user = JSON.parse(userJson);
    config.headers['X-User-ID'] = user.id;
  }
  return config;
});

export default api;
```

**Role-Based UI Rendering**:
```tsx
export function Dashboard() {
  const { user } = useAuth();
  
  if (user?.role === 'advertiser') {
    return <AdvertiserDashboard />;
  }
  
  if (user?.role === 'campaign_manager') {
    return <ApprovalQueue />;
  }
  
  if (user?.role === 'tech_support') {
    return <PerformanceMonitoring />;
  }
  
  return null;
}
```

**Security Note**: This is intentionally insecure for MVP speed. Post-MVP should implement:
- Password hashing (bcrypt)
- JWT tokens
- Refresh token rotation
- Rate limiting
- CSRF protection

---

## Performance Monitoring Dashboard

**Goal**: Provide Technical Support staff with real-time system health and performance metrics.

**User Access**: Only users with `role = 'tech_support'` can access this dashboard.

**Metrics Displayed**:

### 1. API Uptime
- **Metric**: Percentage of successful health check responses in last 24 hours
- **Calculation**: `(successful_checks / total_checks) * 100`
- **Display**: Large percentage with color coding (green >99%, yellow 95-99%, red <95%)

### 2. Proof Generation Latency
- **Metrics**: 
  - Average generation time
  - P50, P95, P99 percentiles
  - Last 100 generations chart
- **Target**: <5 seconds average
- **Display**: Line chart showing trend over time

### 3. Queue Depth
- **Metric**: Current number of campaigns with status `pending_approval`
- **Calculation**: `SELECT COUNT(*) FROM campaigns WHERE status = 'pending_approval'`
- **Display**: Real-time counter with historical trend

### 4. Approval Rate
- **Metric**: Percentage of campaigns approved vs rejected
- **Calculation**: `(COUNT(approved) / COUNT(approved + rejected)) * 100`
- **Time Range**: Last 7 days, last 30 days
- **Display**: Pie chart + percentage

**Technical Implementation**:

**Backend Endpoints**:
```python
@app.get("/api/metrics/uptime")
async def get_uptime_metrics(user: User = Depends(get_current_user)):
    if user.role != 'tech_support':
        raise HTTPException(403, "Access denied")
    
    # Query system_health table
    checks = await db.query("""
        SELECT status, COUNT(*) as count
        FROM system_health
        WHERE checked_at > NOW() - INTERVAL '24 hours'
        GROUP BY status
    """)
    
    total = sum(c['count'] for c in checks)
    healthy = next((c['count'] for c in checks if c['status'] == 'healthy'), 0)
    
    return {
        "uptime_percentage": (healthy / total * 100) if total > 0 else 0,
        "total_checks": total
    }

@app.get("/api/metrics/proof-generation")
async def get_proof_generation_metrics(user: User = Depends(get_current_user)):
    if user.role != 'tech_support':
        raise HTTPException(403, "Access denied")
    
    metrics = await db.query("""
        SELECT 
            AVG(metric_value) as avg_time,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY metric_value) as p50,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95,
            PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY metric_value) as p99
        FROM performance_metrics
        WHERE metric_type = 'proof_generation_time'
        AND recorded_at > NOW() - INTERVAL '24 hours'
    """)
    
    return metrics[0]

@app.get("/api/metrics/queue-depth")
async def get_queue_depth(user: User = Depends(get_current_user)):
    if user.role != 'tech_support':
        raise HTTPException(403, "Access denied")
    
    count = await db.query("""
        SELECT COUNT(*) as depth
        FROM campaigns
        WHERE status = 'pending_approval'
    """)
    
    return {"queue_depth": count[0]['depth']}

@app.get("/api/metrics/approval-rate")
async def get_approval_rate(
    days: int = 7,
    user: User = Depends(get_current_user)
):
    if user.role != 'tech_support':
        raise HTTPException(403, "Access denied")
    
    stats = await db.query(f"""
        SELECT 
            status,
            COUNT(*) as count
        FROM campaigns
        WHERE status IN ('approved', 'rejected')
        AND reviewed_at > NOW() - INTERVAL '{days} days'
        GROUP BY status
    """)
    
    approved = next((s['count'] for s in stats if s['status'] == 'approved'), 0)
    rejected = next((s['count'] for s in stats if s['status'] == 'rejected'), 0)
    total = approved + rejected
    
    return {
        "approval_rate": (approved / total * 100) if total > 0 else 0,
        "approved": approved,
        "rejected": rejected,
        "total": total
    }
```

**Frontend Dashboard**:
```tsx
export function PerformanceMonitoring() {
  const [uptime, setUptime] = useState(null);
  const [proofMetrics, setProofMetrics] = useState(null);
  const [queueDepth, setQueueDepth] = useState(null);
  const [approvalRate, setApprovalRate] = useState(null);
  
  useEffect(() => {
    fetchMetrics();
  }, []);
  
  const fetchMetrics = async () => {
    const [uptimeRes, proofRes, queueRes, approvalRes] = await Promise.all([
      axios.get('/api/metrics/uptime'),
      axios.get('/api/metrics/proof-generation'),
      axios.get('/api/metrics/queue-depth'),
      axios.get('/api/metrics/approval-rate')
    ]);
    
    setUptime(uptimeRes.data);
    setProofMetrics(proofRes.data);
    setQueueDepth(queueRes.data);
    setApprovalRate(approvalRes.data);
  };
  
  return (
    <div className="monitoring-dashboard">
      <h1>System Performance Monitoring</h1>
      
      <div className="metrics-grid">
        <MetricCard
          title="API Uptime (24h)"
          value={`${uptime?.uptime_percentage.toFixed(2)}%`}
          status={uptime?.uptime_percentage > 99 ? 'healthy' : 'warning'}
        />
        
        <MetricCard
          title="Avg Proof Generation"
          value={`${proofMetrics?.avg_time.toFixed(2)}s`}
          subtitle={`P95: ${proofMetrics?.p95.toFixed(2)}s`}
          status={proofMetrics?.avg_time < 5 ? 'healthy' : 'warning'}
        />
        
        <MetricCard
          title="Approval Queue Depth"
          value={queueDepth?.queue_depth}
          subtitle="Campaigns awaiting review"
        />
        
        <MetricCard
          title="Approval Rate (7d)"
          value={`${approvalRate?.approval_rate.toFixed(1)}%`}
          subtitle={`${approvalRate?.approved} approved, ${approvalRate?.rejected} rejected`}
        />
      </div>
      
      <div className="charts">
        <ProofGenerationChart data={proofMetrics?.history} />
      </div>
    </div>
  );
}
```

**Background Job** (Health Checks):
```python
# Run every 5 minutes via cron or background worker
async def perform_health_checks():
    components = ['api', 's3', 'database', 'openai']
    
    for component in components:
        start_time = time.time()
        
        try:
            if component == 's3':
                # Test S3 connection
                await s3_client.list_buckets()
                status = 'healthy'
            elif component == 'database':
                # Test database connection
                await db.execute("SELECT 1")
                status = 'healthy'
            elif component == 'openai':
                # Test OpenAI API
                await openai.models.list()
                status = 'healthy'
            else:
                status = 'healthy'
            
            response_time = int((time.time() - start_time) * 1000)
            
        except Exception as e:
            status = 'down'
            response_time = None
            error_message = str(e)
        
        # Insert health check record
        await db.insert_system_health({
            'component': component,
            'status': status,
            'response_time_ms': response_time,
            'error_message': error_message if status == 'down' else None
        })
```

---

## API Architecture

### REST API Design

**Base URL**: `http://localhost:8000/api` (development)

**Authentication**: All requests (except `/auth/login`) must include `X-User-ID` header with logged-in user's ID.

### Core Endpoints

#### Authentication
- `POST /api/auth/login` - User login (returns user object)

#### Users
- `GET /api/users/me` - Get current user details

#### Assets
- `POST /api/assets/upload` - Upload asset file to S3, create database record
- `GET /api/assets` - Get all assets for current user
- `GET /api/assets/{asset_id}` - Get specific asset details
- `PATCH /api/assets/{asset_id}/category` - Update asset category (manual override)
- `POST /api/assets/recategorize` - Trigger AI recategorization for multiple assets
- `DELETE /api/assets/{asset_id}` - Delete asset (S3 + database)

#### Campaigns
- `POST /api/campaigns` - Create new campaign (with linked assets)
- `GET /api/campaigns` - Get all campaigns for current user (filtered by role)
- `GET /api/campaigns/{campaign_id}` - Get specific campaign details
- `PATCH /api/campaigns/{campaign_id}` - Update campaign details
- `POST /api/campaigns/{campaign_id}/generate-proof` - Generate email proof using AI
- `POST /api/campaigns/{campaign_id}/submit` - Submit campaign for approval
- `POST /api/campaigns/{campaign_id}/approve` - Approve campaign (Campaign Manager only)
- `POST /api/campaigns/{campaign_id}/reject` - Reject campaign (Campaign Manager only)
- `DELETE /api/campaigns/{campaign_id}` - Delete campaign

#### Approval Queue
- `GET /api/campaigns/approval-queue` - Get all pending campaigns (Campaign Manager only)

#### Performance Metrics
- `GET /api/metrics/uptime` - API uptime statistics (Tech Support only)
- `GET /api/metrics/proof-generation` - Proof generation latency stats (Tech Support only)
- `GET /api/metrics/queue-depth` - Current approval queue depth (Tech Support only)
- `GET /api/metrics/approval-rate` - Campaign approval rate (Tech Support only)

### Example Request/Response

**Upload Asset**:
```bash
POST /api/assets/upload
Headers:
  X-User-ID: 123e4567-e89b-12d3-a456-426614174000
  Content-Type: multipart/form-data

Body:
  file: logo.png

Response (201):
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "filename": "logo.png",
  "s3_url": "https://mybucket.s3.amazonaws.com/...",
  "category": "logo",
  "categorization_method": "rules",
  "uploaded_at": "2025-11-10T10:30:00Z"
}
```

**Generate Email Proof**:
```bash
POST /api/campaigns/{campaign_id}/generate-proof
Headers:
  X-User-ID: 123e4567-e89b-12d3-a456-426614174000

Response (200):
{
  "mjml": "<mjml>...</mjml>",
  "html": "<html>...</html>",
  "generation_time": 3.2,
  "campaign_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/                      # shadcn components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── assets/
│   │   ├── AssetUpload.tsx      # Drag-and-drop upload zone
│   │   ├── AssetReview.tsx      # Review and categorization screen
│   │   ├── AssetCard.tsx        # Individual asset display
│   │   └── CategoryZone.tsx     # Drop zone for manual categorization
│   ├── campaigns/
│   │   ├── CampaignForm.tsx     # Campaign details form
│   │   ├── CampaignList.tsx     # List of user's campaigns
│   │   ├── EmailPreview.tsx     # Email proof preview
│   │   └── ApprovalQueue.tsx    # Campaign Manager approval queue
│   ├── monitoring/
│   │   ├── PerformanceDashboard.tsx
│   │   ├── MetricCard.tsx
│   │   └── ProofGenerationChart.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Layout.tsx
├── contexts/
│   └── AuthContext.tsx          # User authentication state
├── hooks/
│   ├── useAuth.ts
│   ├── useAssets.ts
│   └── useCampaigns.ts
├── lib/
│   ├── axios.ts                 # Axios instance with interceptors
│   └── utils.ts
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx            # Role-based dashboard routing
│   ├── CreateCampaign.tsx
│   ├── MyCampaigns.tsx
│   ├── ApprovalQueue.tsx
│   └── Monitoring.tsx
├── types/
│   └── index.ts                 # TypeScript interfaces
└── App.tsx
```

### Key React Patterns

**Custom Hooks for API Calls with Axios**:
```tsx
// hooks/useCampaigns.ts
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCampaigns();
  }, []);
  
  return { campaigns, loading, refetch: fetchCampaigns };
}

export function useGenerateProof() {
  const [loading, setLoading] = useState(false);
  
  const generateProof = async (campaignId: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/campaigns/${campaignId}/generate-proof`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to generate proof:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return { generateProof, loading };
}
```

**Role-Based Routing**:
```tsx
// App.tsx
function App() {
  const { user } = useAuth();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          {user?.role === 'advertiser' && (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/campaigns/new" element={<CreateCampaign />} />
              <Route path="/campaigns" element={<MyCampaigns />} />
            </>
          )}
          
          {user?.role === 'campaign_manager' && (
            <>
              <Route path="/" element={<ApprovalQueue />} />
              <Route path="/campaigns/:id" element={<CampaignReview />} />
            </>
          )}
          
          {user?.role === 'tech_support' && (
            <Route path="/" element={<PerformanceDashboard />} />
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Development Workflow

### Project Setup

**Backend (FastAPI)**:
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy alembic boto3 openai mjml python-multipart

# Initialize database
alembic init alembic
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head

# Run seed script
python seed_data.py

# Start server
uvicorn main:app --reload --port 8000
```

**Frontend (React + Vite)**:
```bash
# Create Vite project
npm create vite@latest frontend -- --template react-ts

# Install dependencies
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input form

# Start dev server
npm run dev
```

**Environment Variables**:

`.env` (Backend):
```
DATABASE_URL=sqlite:///./dev.db
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=email-assets-dev
OPENAI_API_KEY=your_openai_key
```

`.env` (Frontend):
```
VITE_API_URL=http://localhost:8000/api
```

---

### Git Workflow

**Branch Strategy**:
- `main`: Production-ready code (protected)
- `develop`: Integration branch for features
- `feature/*`: Individual features (e.g., `feature/asset-upload`)
- `bugfix/*`: Bug fixes

**Commit Convention**:
```
feat: Add asset upload functionality
fix: Resolve S3 upload timeout issue
docs: Update API documentation
refactor: Simplify AI categorization logic
```

---

## Testing Strategy

### Backend Tests (Pytest)

**Note**: Backend testing will be implemented at the very end of MVP development.

```python
# tests/test_assets.py

def test_upload_asset(client, test_user):
    """Test asset upload and auto-categorization"""
    with open('test_logo.png', 'rb') as f:
        response = client.post(
            '/api/assets/upload',
            files={'file': f},
            headers={'X-User-ID': str(test_user.id)}
        )
    
    assert response.status_code == 201
    data = response.json()
    assert data['category'] == 'logo'
    assert data['categorization_method'] == 'rules'

def test_ai_recategorization(client, test_assets):
    """Test AI-powered asset recategorization"""
    response = client.post(
        '/api/assets/recategorize',
        json={'asset_ids': [str(test_assets[0].id)]},
        headers={'X-User-ID': '123e4567-e89b-12d3-a456-426614174000'}
    )
    
    assert response.status_code == 200
    # Verify category updated
```

### Frontend Tests

**Note**: Frontend testing is NOT part of MVP scope.

**Testing Priorities for MVP**:
1. Critical path backend tests (login, upload, generate proof, approve) - End of MVP
2. API endpoint tests for all CRUD operations - End of MVP
3. Role-based access control tests - End of MVP

**Post-MVP**:
- Frontend component tests (React Testing Library)
- E2E tests with Playwright
- Performance testing (load testing proof generation)
- Security testing (penetration testing, OWASP checks)

---

## Performance Requirements

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Email proof generation | <5 seconds | Time from API call to HTML response |
| Asset upload | <3 seconds | Time from file selection to S3 upload complete |
| API response time (p95) | <500ms | All non-generation endpoints |
| Concurrent users | 100+ | Simultaneous users without degradation |
| Database query time | <100ms | p95 for all SELECT queries |
| Frontend initial load | <2 seconds | Time to interactive |

### Optimization Strategies

**Backend**:
- Use async/await for all I/O operations (S3, OpenAI, database)
- Implement connection pooling for database
- Cache frequently accessed data (user sessions, template metadata)
- Use background workers for non-critical tasks (health checks, metrics aggregation)

**Frontend**:
- Code splitting with React.lazy()
- Image optimization (WebP format, lazy loading)
- Debounce search inputs
- Optimize bundle size (tree-shaking, minimize dependencies)

**Database**:
- Index all foreign keys and frequently queried fields
- Use EXPLAIN ANALYZE to optimize slow queries
- Implement pagination for large result sets

---

## Security Considerations

### MVP Security (Minimal)

- ✅ HTTPS for all API communication (in production)
- ✅ Input validation using Pydantic models
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ File upload validation (file type, size limits)
- ✅ Sandboxed iframe for email preview (prevent XSS)
- ❌ No password hashing (plain text for MVP)
- ❌ No JWT/session tokens (X-User-ID header only)
- ❌ No rate limiting
- ❌ No CSRF protection

### Post-MVP Security Hardening

- Implement bcrypt password hashing
- Add JWT authentication with refresh tokens
- Rate limiting (per user, per IP)
- CORS configuration
- Content Security Policy (CSP) headers
- File upload virus scanning
- Audit logging for all sensitive operations
- Regular dependency updates (npm audit, safety)

---

## AWS S3 Configuration

### Bucket Structure

**Development Bucket**: `email-assets-dev`
```
email-assets-dev/
├── users/
│   ├── {user_id}/
│   │   ├── logos/
│   │   ├── images/
│   │   ├── copy/
│   │   └── urls/
```

**Production Bucket** (future): `email-assets-prod`

### S3 Permissions

**IAM Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::email-assets-dev/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::email-assets-dev"
    }
  ]
}
```

### Upload Implementation

```python
# backend/services/s3_service.py

import boto3
from botocore.exceptions import ClientError

class S3Service:
    def __init__(self):
        self.client = boto3.client('s3')
        self.bucket = 'email-assets-dev'
    
    async def upload_file(self, file_content: bytes, filename: str, user_id: str) -> dict:
        """
        Uploads file to S3 and returns metadata.
        Returns: {'s3_key': str, 's3_url': str}
        """
        # Generate unique S3 key
        s3_key = f"users/{user_id}/{filename}"
        
        try:
            # Upload to S3
            self.client.put_object(
                Bucket=self.bucket,
                Key=s3_key,
                Body=file_content,
                ContentType=self._get_content_type(filename)
            )
            
            # Generate pre-signed URL (expires in 7 days)
            s3_url = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket, 'Key': s3_key},
                ExpiresIn=604800  # 7 days
            )
            
            return {
                's3_key': s3_key,
                's3_url': s3_url
            }
        
        except ClientError as e:
            raise Exception(f"S3 upload failed: {str(e)}")
    
    def _get_content_type(self, filename: str) -> str:
        """Determine MIME type from filename"""
        extensions = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.txt': 'text/plain',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
        ext = os.path.splitext(filename)[1].lower()
        return extensions.get(ext, 'application/octet-stream')
```

---

## OpenAI Integration

### API Configuration

**Models**: 
- **GPT-3.5-turbo**: Asset categorization
- **GPT-4**: Email content generation

**Max Tokens**: 2000 (for email generation)  
**Temperature**: 0.7 (balanced creativity)

### Cost Optimization

**Estimated Costs** (per campaign):
- Asset categorization (GPT-3.5-turbo): ~$0.005 (if AI recategorization used)
- Email proof generation (GPT-4): ~$0.05-0.10
- Total per campaign: ~$0.055-0.105

**Cost Reduction Strategies**:
1. Use rules-based categorization first (free)
2. Only call AI when user explicitly requests recategorization
3. Use GPT-3.5-turbo for simple categorization tasks (cheaper)
4. Cache common email templates (reduce generation calls)

### Error Handling

```python
# backend/services/openai_service.py

import openai
from tenacity import retry, stop_after_attempt, wait_exponential

class OpenAIService:
    def __init__(self, api_key: str):
        openai.api_key = api_key
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def generate_email_mjml(self, campaign: Campaign, assets: list[Asset]) -> str:
        """
        Generates MJML email template using GPT-4.
        Retries up to 3 times with exponential backoff.
        """
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert email designer. Generate valid MJML code only."},
                    {"role": "user", "content": self._build_prompt(campaign, assets)}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            mjml_code = response.choices[0].message.content
            return self._clean_mjml(mjml_code)
        
        except openai.error.RateLimitError:
            raise Exception("OpenAI rate limit exceeded. Please try again later.")
        except openai.error.APIError as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def categorize_assets(self, assets: list[Asset]) -> dict[UUID, str]:
        """
        Categorizes assets using GPT-3.5-turbo.
        Returns mapping of asset_id -> category
        """
        try:
            prompt = f"""
            Categorize the following files into: logo, image, copy, or url.
            
            Files:
            {json.dumps([{"filename": a.filename, "type": a.file_type} for a in assets])}
            
            Return only JSON: {{"asset_id": "category"}}
            """
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            
            return json.loads(response.choices[0].message.content)
        
        except openai.error.APIError as e:
            raise Exception(f"OpenAI categorization failed: {str(e)}")
    
    def _build_prompt(self, campaign: Campaign, assets: list[Asset]) -> str:
        """Constructs prompt for email generation"""
        prompt = f"""
        Create a professional email campaign using MJML syntax.
        
        Campaign Details:
        - Name: {campaign.campaign_name}
        - Target Audience: {campaign.target_audience}
        - Goal: {campaign.campaign_goal}
        
        Available Assets:
        """
        
        # Add asset details
        for asset in assets:
            prompt += f"\n- {asset.category.capitalize()}: {asset.filename}"
        
        prompt += """
        
        Requirements:
        1. Use MJML syntax only
        2. Include all provided assets appropriately
        3. Create compelling email copy aligned with campaign goal
        4. Ensure mobile responsiveness
        5. Include clear call-to-action button
        
        Return only valid MJML code without explanations.
        """
        
        return prompt
    
    def _clean_mjml(self, raw_mjml: str) -> str:
        """Remove markdown code blocks if present"""
        if raw_mjml.startswith('```mjml'):
            raw_mjml = raw_mjml[7:]  # Remove opening ```mjml
        if raw_mjml.endswith('```'):
            raw_mjml = raw_mjml[:-3]  # Remove closing ```
        return raw_mjml.strip()
```

---

## Deployment Strategy (Post-MVP)

### Frontend Deployment (Netlify)

**Build Configuration**:
```toml
# netlify.toml

[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_API_URL = "https://api.example.com"
```

**Steps**:
1. Connect GitHub repo to Netlify
2. Configure build settings
3. Set environment variables in Netlify dashboard
4. Enable automatic deployments on `main` branch push

---

### Backend Deployment (Railway)

**Configuration**:
```yaml
# railway.json

{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Environment Variables** (set in Railway dashboard):
- `DATABASE_URL`: PostgreSQL connection string (from Railway database)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`: `email-assets-prod`
- `OPENAI_API_KEY`

**Steps**:
1. Create Railway project
2. Provision PostgreSQL database
3. Connect GitHub repo
4. Set environment variables
5. Deploy from `main` branch

---

### Database Migration (SQLite → PostgreSQL)

**When moving to production**:

1. Export SQLite data:
```bash
sqlite3 dev.db .dump > backup.sql
```

2. Update connection string in `.env`:
```
DATABASE_URL=postgresql://user:pass@host:5432/email_prod
```

3. Run migrations:
```bash
alembic upgrade head
```

4. Import data (if needed):
```bash
psql $DATABASE_URL < backup.sql
```

---

## Project Timeline (MVP)

**Target Completion**: Wednesday (3 days from now)

### Day 1 (Monday)
- [ ] Set up project structure (frontend + backend)
- [ ] Implement database schema and seed data
- [ ] Build authentication system (login flow)
- [ ] Create basic layout and routing
- [ ] Implement S3 upload functionality
- [ ] Build asset upload UI (drag-and-drop)

### Day 2 (Tuesday)
- [ ] Implement rules-based asset categorization
- [ ] Build asset review screen
- [ ] Integrate OpenAI for AI recategorization (GPT-3.5-turbo)
- [ ] Implement campaign creation flow
- [ ] Build OpenAI email proof generation (GPT-4)
- [ ] Create email preview component

### Day 3 (Wednesday)
- [ ] Implement approval workflow (submit, approve, reject)
- [ ] Build Campaign Manager approval queue
- [ ] Create performance monitoring dashboard
- [ ] Add basic error handling and loading states
- [ ] **Backend testing (Pytest) - End of MVP**
- [ ] Bug fixes
- [ ] **MVP Complete** 🎉

### Post-Wednesday (If Time Permits)
- [ ] Polish UI/UX
- [ ] Add loading animations and transitions
- [ ] Implement P1 features (scheduling, editorial review)
- [ ] Deploy to Netlify + Railway

---

## Known Limitations & Future Enhancements

### MVP Limitations

1. **No Email Sending**: System only generates proofs, does not integrate with email service provider
2. **No Password Security**: Plain text passwords (not production-ready)
3. **No Asset Library UI**: Assets uploaded per-campaign only
4. **Limited Error Handling**: Basic error messages, no retry logic
5. **No A/B Testing**: Cannot test multiple email variants
6. **No Analytics**: No tracking of email performance metrics
7. **Single Organization**: All users assumed to be in same company
8. **No Frontend Testing**: Frontend tests not included in MVP

### Post-MVP Roadmap

**Phase 2** (1-2 weeks):
- Implement proper authentication (JWT, password hashing)
- Add asset library UI (browse and reuse assets)
- Build campaign scheduling system
- Add email sending integration (SendGrid, AWS SES)
- Frontend testing suite

**Phase 3** (1 month):
- Multi-organization support (separate data per company)
- Advanced analytics dashboard (open rates, click rates)
- A/B testing framework
- Email template library (pre-built templates)

**Phase 4** (2-3 months):
- Advanced AI features (content optimization, send time prediction)
- Collaboration features (comments, team workflows)
- Mobile app (React Native)
- Integration with CRM systems

---

## Success Criteria

### MVP is considered successful if:

1. ✅ Advertisers can upload assets and create campaigns in <5 minutes
2. ✅ Email proofs generate in <5 seconds (average)
3. ✅ Campaign Managers can approve/reject campaigns with reasons
4. ✅ System supports 3 distinct user roles with appropriate access controls
5. ✅ Performance monitoring dashboard displays all key metrics
6. ✅ Asset categorization works with 90%+ accuracy (rules + optional AI)
7. ✅ Zero data loss (all uploads persist to S3 and database)
8. ✅ System handles 10+ concurrent users without degradation
9. ✅ Backend tests pass for critical paths

---

## Appendix

### A. Technology Justifications

**Why FastAPI?**
- Best-in-class performance for Python web frameworks
- Automatic API documentation (OpenAPI/Swagger)
- Native async support for concurrent operations
- Excellent integration with Python AI/ML ecosystem
- Strong typing with Pydantic validation

**Why MJML?**
- Industry standard for responsive email HTML
- Handles email client quirks automatically (Outlook, Gmail, etc.)
- Well-documented, large community
- Compiles to email-safe HTML
- GPT-4 can generate valid MJML code

**Why shadcn/ui?**
- Proven success in previous projects
- Copy-paste components (no npm bloat)
- Full control over styling
- TypeScript support
- Excellent accessibility out-of-the-box

**Why SQLite for Dev?**
- Zero configuration setup
- Fast development iteration
- Easy to reset/seed data
- Smooth migration path to PostgreSQL

**Why Axios over React Query?**
- Simpler mental model for MVP
- More direct control over requests
- Easier to debug
- Less abstraction overhead for small project

---

### B. API Error Codes

| Status Code | Meaning | Example Use Case |
|-------------|---------|------------------|
| 200 | Success | Resource retrieved successfully |
| 201 | Created | Asset uploaded, campaign created |
| 400 | Bad Request | Invalid file type, missing required fields |
| 401 | Unauthorized | User not logged in |
| 403 | Forbidden | User accessing resource they don't own |
| 404 | Not Found | Campaign ID doesn't exist |
| 500 | Internal Server Error | OpenAI API failure, S3 connection error |

---

### C. Database ERD

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password        │
│ full_name       │
│ role            │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐          ┌──────────────────┐
│    ASSETS       │          │    CAMPAIGNS     │
├─────────────────┤          ├──────────────────┤
│ id (PK)         │          │ id (PK)          │
│ user_id (FK)    │          │ advertiser_id(FK)│
│ filename        │          │ campaign_name    │
│ s3_key          │          │ status           │
│ category        │          │ reviewed_by (FK) │
│ uploaded_at     │          │ created_at       │
└────────┬────────┘          └────────┬─────────┘
         │                            │
         │                            │
         │         N:M                │
         │    ┌────────────┐         │
         └────►CAMPAIGN_   ◄─────────┘
              │  ASSETS    │
              ├────────────┤
              │ id (PK)    │
              │ campaign_id│
              │ asset_id   │
              │ asset_role │
              └────────────┘
```

---

### D. Glossary

- **Asset**: Any file uploaded by an advertiser (logo, image, text, URL)
- **Campaign**: A collection of assets and details used to generate an email proof
- **Email Proof**: Generated HTML email preview for approval
- **MJML**: Markup language for responsive email design
- **Approval Queue**: List of campaigns awaiting Campaign Manager review
- **Categorization Method**: How asset category was determined (rules, AI, manual)
- **P0/P1/P2**: Priority levels (P0 = must-have, P1 = should-have, P2 = nice-to-have)

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-10 | Technical Team | Initial MVP technical requirements |

---

**End of Technical PRD**

This document serves as the complete technical blueprint for implementing the Automated Email Advertising Workflow System MVP. All developers, designers, and stakeholders should refer to this document for implementation details and architectural decisions.