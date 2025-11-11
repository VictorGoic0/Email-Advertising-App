import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RequireRole } from '@/components/RequireRole';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import AssetUploadPage from '@/pages/AssetUploadPage';
import CreateCampaign from '@/pages/CreateCampaign';
import MyCampaigns from '@/pages/MyCampaigns';
import EmailPreviewPage from '@/pages/EmailPreviewPage';
import ApprovalQueuePage from '@/pages/ApprovalQueuePage';
import CampaignReviewPage from '@/pages/CampaignReviewPage';
import MonitoringPage from '@/pages/MonitoringPage';
import Layout from '@/components/Layout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard - only accessible to advertisers */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={['advertiser']}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RequireRole>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={['advertiser']}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RequireRole>
              </ProtectedRoute>
            }
          />

          {/* Advertiser-only routes */}
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={['advertiser']}>
                  <Layout>
                    <AssetUploadPage />
                  </Layout>
                </RequireRole>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={['advertiser']}>
                  <Layout>
                    <MyCampaigns />
                  </Layout>
                </RequireRole>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns/new"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={['advertiser']}>
                  <Layout>
                    <CreateCampaign />
                  </Layout>
                </RequireRole>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns/:id"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={['advertiser']}>
                  <Layout>
                    <EmailPreviewPage />
                  </Layout>
                </RequireRole>
              </ProtectedRoute>
            }
          />

          {/* Campaign Manager-only routes */}
          <Route
            path="/approval-queue"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={['campaign_manager']}>
                  <Layout>
                    <ApprovalQueuePage />
                  </Layout>
                </RequireRole>
              </ProtectedRoute>
            }
          />
          <Route
            path="/approval-queue/:id"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={['campaign_manager']}>
                  <Layout>
                    <CampaignReviewPage />
                  </Layout>
                </RequireRole>
              </ProtectedRoute>
            }
          />

          {/* Tech Support-only routes */}
          <Route
            path="/monitoring"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={['tech_support']}>
                  <Layout>
                    <MonitoringPage />
                  </Layout>
                </RequireRole>
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
