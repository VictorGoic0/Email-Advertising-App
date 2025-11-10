## PR #12: Campaign Creation UI

**Branch**: `feature/campaign-creation-ui`

### Campaign Form Component
- [x] 12.1 Create `/frontend/src/components/CampaignForm.tsx`
- [x] 12.2 Add input for campaign name (required)
- [x] 12.3 Add textarea for target audience
- [x] 12.4 Add textarea for campaign goal
- [x] 12.5 Add textarea for additional notes
- [x] 12.6 Implement form validation with zod
- [x] 12.7 Style form with shadcn components

### Campaign Creation Flow
- [x] 12.8 Create `/frontend/src/pages/CreateCampaign.tsx`
- [x] 12.9 Display asset upload section
- [x] 12.10 Display campaign form section
- [x] 12.11 Implement step navigation (assets → details)
- [x] 12.12 Pass uploaded asset IDs to campaign creation
- [x] 12.13 Call create campaign API
- [x] 12.14 Handle campaign creation errors
- [x] 12.15 Redirect to email preview on success

### Campaign Hooks
- [x] 12.16 Create `/frontend/src/hooks/useCampaigns.ts`
- [x] 12.17 Implement createCampaign function
- [x] 12.18 Implement fetchCampaigns function
- [x] 12.19 Implement fetchCampaign function
- [x] 12.20 Implement updateCampaign function
- [x] 12.21 Implement deleteCampaign function
- [x] 12.22 Add loading and error states

### Campaign List Component
- [x] 12.23 Create `/frontend/src/components/CampaignList.tsx`
- [x] 12.24 Fetch campaigns for current user
- [x] 12.25 Display campaigns in card grid
- [x] 12.26 Show campaign status badge
- [x] 12.27 Add click handler to view campaign details
- [x] 12.28 Style with Tailwind

### My Campaigns Page
- [x] 12.29 Create `/frontend/src/pages/MyCampaigns.tsx`
- [x] 12.30 Integrate CampaignList component
- [x] 12.31 Filter campaigns by status (draft, approved, rejected)
- [x] 12.32 Add tabs for different statuses
- [x] 12.33 Add "Create New Campaign" button
- [x] 12.34 Navigate to CreateCampaign page on click

### Testing
- [x] 12.35 Test campaign creation with assets
- [x] 12.36 Test form validation
- [x] 12.37 Test campaign list display
- [x] 12.38 Test navigation between pages

---

## PR #13: Email Preview & Generation UI

**Branch**: `feature/email-preview-ui`

### Email Generation Hook
- [ ] 13.1 Add generateProof function to useCampaigns hook
- [ ] 13.2 Call generate-proof API endpoint
- [ ] 13.3 Handle loading state during generation
- [ ] 13.4 Handle errors from API
- [ ] 13.5 Return MJML, HTML, and generation time

### Email Preview Component
- [ ] 13.6 Create `/frontend/src/components/EmailPreview.tsx`
- [ ] 13.7 Accept emailHtml prop
- [ ] 13.8 Create iframe to render email HTML
- [ ] 13.9 Use srcDoc attribute for iframe content
- [ ] 13.10 Apply sandbox attribute for security
- [ ] 13.11 Add device view toggle (desktop/mobile)
- [ ] 13.12 Style iframe container for desktop view
- [ ] 13.13 Style iframe container for mobile view
- [ ] 13.14 Add CSS for responsive iframe sizing

### Email Preview Page
- [ ] 13.15 Create `/frontend/src/pages/EmailPreviewPage.tsx`
- [ ] 13.16 Fetch campaign details by ID
- [ ] 13.17 Add "Generate Email Proof" button
- [ ] 13.18 Show loading spinner during generation
- [ ] 13.19 Display generation time after completion
- [ ] 13.20 Integrate EmailPreview component
- [ ] 13.21 Add "Regenerate" button
- [ ] 13.22 Add "Submit for Approval" button
- [ ] 13.23 Add "Save as Draft" button
- [ ] 13.24 Implement submit for approval API call
- [ ] 13.25 Show success message after submission
- [ ] 13.26 Redirect to My Campaigns after submission

### Preview Controls
- [ ] 13.27 Create preview toolbar component
- [ ] 13.28 Add desktop/mobile toggle buttons
- [ ] 13.29 Add zoom controls (optional)
- [ ] 13.30 Style toolbar with Tailwind

### Testing
- [ ] 13.31 Test email proof generation
- [ ] 13.32 Verify email renders in iframe correctly
- [ ] 13.33 Test device view toggle
- [ ] 13.34 Test regenerate functionality
- [ ] 13.35 Test submit for approval

---

## PR #14: Approval Queue UI (Campaign Manager)

**Branch**: `feature/approval-queue-ui`

### Approval Queue Component
- [ ] 14.1 Create `/frontend/src/components/ApprovalQueue.tsx`
- [ ] 14.2 Fetch approval queue from API
- [ ] 14.3 Display pending campaigns in list/grid
- [ ] 14.4 Show campaign name, advertiser name, timestamp
- [ ] 14.5 Add thumbnail preview of email
- [ ] 14.6 Sort campaigns by created_at (oldest first)
- [ ] 14.7 Add click handler to view full campaign
- [ ] 14.8 Style with Tailwind

### Campaign Review Component
- [ ] 14.9 Create `/frontend/src/components/CampaignReview.tsx`
- [ ] 14.10 Fetch campaign details with email proof
- [ ] 14.11 Display campaign information
- [ ] 14.12 Integrate EmailPreview component
- [ ] 14.13 Add "Approve" button
- [ ] 14.14 Add "Reject" button
- [ ] 14.15 Show rejection reason modal on reject
- [ ] 14.16 Implement approval API call
- [ ] 14.17 Implement rejection API call with reason
- [ ] 14.18 Show success message after approval/rejection
- [ ] 14.19 Navigate back to approval queue

### Rejection Modal
- [ ] 14.20 Create `/frontend/src/components/RejectionModal.tsx`
- [ ] 14.21 Add textarea for rejection reason
- [ ] 14.22 Validate rejection reason is not empty
- [ ] 14.23 Add "Cancel" and "Submit" buttons
- [ ] 14.24 Style modal with shadcn dialog component

### Approval Queue Page
- [ ] 14.25 Create `/frontend/src/pages/ApprovalQueuePage.tsx`
- [ ] 14.26 Integrate ApprovalQueue component
- [ ] 14.27 Add page header with queue count
- [ ] 14.28 Add refresh button to reload queue
- [ ] 14.29 Handle empty queue state

### Campaign Review Page
- [ ] 14.30 Create `/frontend/src/pages/CampaignReviewPage.tsx`
- [ ] 14.31 Get campaign ID from route params
- [ ] 14.32 Integrate CampaignReview component
- [ ] 14.33 Add back button to queue

### Testing
- [ ] 14.34 Test approval queue displays correctly
- [ ] 14.35 Test campaign approval flow
- [ ] 14.36 Test campaign rejection with reason
- [ ] 14.37 Test navigation between queue and review

---

## PR #15: Performance Monitoring UI (Tech Support)

**Branch**: `feature/monitoring-ui`

### Metrics Hooks
- [ ] 15.1 Create `/frontend/src/hooks/useMetrics.ts`
- [ ] 15.2 Implement fetchUptimeMetrics function
- [ ] 15.3 Implement fetchProofGenerationMetrics function
- [ ] 15.4 Implement fetchQueueDepth function
- [ ] 15.5 Implement fetchApprovalRate function
- [ ] 15.6 Add loading and error states for each

### Metric Card Component
- [ ] 15.7 Create `/frontend/src/components/MetricCard.tsx`
- [ ] 15.8 Accept title, value, subtitle, status props
- [ ] 15.9 Style card with shadcn Card component
- [ ] 15.10 Add color coding for status (green/yellow/red)
- [ ] 15.11 Display large value text
- [ ] 15.12 Display subtitle text

### Performance Dashboard Component
- [ ] 15.13 Create `/frontend/src/components/PerformanceDashboard.tsx`
- [ ] 15.14 Fetch all metrics on mount
- [ ] 15.15 Display MetricCard for API uptime
- [ ] 15.16 Display MetricCard for avg proof generation time
- [ ] 15.17 Display MetricCard for queue depth
- [ ] 15.18 Display MetricCard for approval rate
- [ ] 15.19 Layout cards in responsive grid
- [ ] 15.20 Add auto-refresh every 30 seconds
- [ ] 15.21 Add manual refresh button

### Proof Generation Chart (Optional)
- [ ] 15.22 Install chart library (recharts or similar)
- [ ] 15.23 Create `/frontend/src/components/ProofGenerationChart.tsx`
- [ ] 15.24 Fetch historical proof generation times
- [ ] 15.25 Render line chart showing trend
- [ ] 15.26 Style chart with Tailwind

### Monitoring Page
- [ ] 15.27 Create `/frontend/src/pages/MonitoringPage.tsx`
- [ ] 15.28 Integrate PerformanceDashboard component
- [ ] 15.29 Add page header
- [ ] 15.30 Handle loading state
- [ ] 15.31 Handle error state

### Testing
- [ ] 15.32 Test metrics display correctly
- [ ] 15.33 Test auto-refresh functionality
- [ ] 15.34 Test manual refresh button
- [ ] 15.35 Verify color coding for different statuses

---

## PR #16: Role-Based Dashboard & Navigation

**Branch**: `feature/dashboard-routing`

### Dashboard Component
- [ ] 16.1 Create `/frontend/src/pages/Dashboard.tsx`
- [ ] 16.2 Get user role from AuthContext
- [ ] 16.3 Render AdvertiserDashboard for advertisers
- [ ] 16.4 Render ApprovalQueue for campaign_manager
- [ ] 16.5 Render PerformanceDashboard for tech_support

### Advertiser Dashboard
- [ ] 16.6 Create `/frontend/src/components/AdvertiserDashboard.tsx`
- [ ] 16.7 Display quick stats (total campaigns, approved, pending)
- [ ] 16.8 Show recent campaigns list
- [ ] 16.9 Add "Create New Campaign" CTA button
- [ ] 16.10 Style with Tailwind

### Navigation Component
- [ ] 16.11 Update `/frontend/src/components/Layout.tsx` sidebar
- [ ] 16.12 Add navigation links based on user role
- [ ] 16.13 Advertiser links: Dashboard, My Campaigns, Create Campaign
- [ ] 16.14 Campaign Manager links: Approval Queue
- [ ] 16.15 Tech Support links: Monitoring Dashboard
- [ ] 16.16 Highlight active route
- [ ] 16.17 Style navigation with Tailwind

### App Routing Updates
- [ ] 16.18 Update `/frontend/src/App.tsx` with all routes
- [ ] 16.19 Add route for / (Dashboard)
- [ ] 16.20 Add route for /campaigns (My Campaigns)
- [ ] 16.21 Add route for /campaigns/new (Create Campaign)
- [ ] 16.22 Add route for /campaigns/:id (Email Preview)
- [ ] 16.23 Add route for /approval-queue (Campaign Manager)
- [ ] 16.24 Add route for /approval-queue/:id (Campaign Review)
- [ ] 16.25 Add route for /monitoring (Tech Support)
- [ ] 16.26 Wrap role-specific routes with permission checks

### Permission HOC
- [ ] 16.27 Create `/frontend/src/components/RequireRole.tsx`
- [ ] 16.28 Accept allowedRoles prop
- [ ] 16.29 Check current user role
- [ ] 16.30 Redirect to dashboard if role not allowed
- [ ] 16.31 Render children if role allowed

### Testing
- [ ] 16.32 Test advertiser sees correct dashboard and navigation
- [ ] 16.33 Test campaign manager sees approval queue
- [ ] 16.34 Test tech support sees monitoring dashboard
- [ ] 16.35 Test role-based route protection

---

## PR #17: UI Polish & Final Touches

**Branch**: `feature/ui-polish`

### Loading States
- [ ] 17.1 Create `/frontend/src/components/LoadingSpinner.tsx`
- [ ] 17.2 Add loading spinner to all async operations
- [ ] 17.3 Show skeleton loaders for lists and grids
- [ ] 17.4 Add loading overlay for form submissions

### Error Handling
- [ ] 17.5 Create `/frontend/src/components/ErrorMessage.tsx`
- [ ] 17.6 Display user-friendly error messages
- [ ] 17.7 Add retry buttons for failed requests
- [ ] 17.8 Show toast notifications for errors
- [ ] 17.9 Style error states with Tailwind

### Empty States
- [ ] 17.10 Create empty state components for lists
- [ ] 17.11 Add empty state for no assets
- [ ] 17.12 Add empty state for no campaigns
- [ ] 17.13 Add empty state for empty approval queue
- [ ] 17.14 Include helpful text and action buttons

### Success Messages
- [ ] 17.15 Add toast notifications for successful actions
- [ ] 17.16 Show success message after campaign creation
- [ ] 17.17 Show success message after approval/rejection
- [ ] 17.18 Show success message after asset upload

### Responsive Design
- [ ] 17.19 Test all pages on mobile viewport
- [ ] 17.20 Adjust grid layouts for mobile
- [ ] 17.21 Make navigation responsive (hamburger menu)
- [ ] 17.22 Test tablet viewport
- [ ] 17.23 Fix any layout issues

### Accessibility
- [ ] 17.24 Add aria labels to interactive elements
- [ ] 17.25 Ensure keyboard navigation works
- [ ] 17.26 Add focus styles to all interactive elements
- [ ] 17.27 Test with screen reader (basic check)

### Final Testing
- [ ] 17.28 Test complete advertiser flow end-to-end
- [ ] 17.29 Test complete campaign manager flow end-to-end
- [ ] 17.30 Test tech support dashboard
- [ ] 17.31 Fix any bugs discovered
- [ ] 17.32 Update README with frontend setup instructions

---

## MVP COMPLETE ✅