import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
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
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <Layout>
                  <AssetUploadPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyCampaigns />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateCampaign />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmailPreviewPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/approval-queue"
            element={
              <ProtectedRoute>
                <Layout>
                  <ApprovalQueuePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/approval-queue/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CampaignReviewPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring"
            element={
              <ProtectedRoute>
                <Layout>
                  <MonitoringPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
