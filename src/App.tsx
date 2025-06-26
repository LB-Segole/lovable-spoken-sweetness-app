
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  LandingPage,
  Dashboard, 
  Campaigns, 
  CallHistory, 
  CallCenter, 
  Assistants,
  Login,
  Register,
  About,
  Faq,
  Pricing,
  Blog,
  BlogPost,
  ContactSales,
  Documentation,
  ApiDocumentation,
  Tutorials,
  CaseStudies,
  PrivacyPolicy,
  TermsOfService,
  CookiePolicy,
  NotFound,
  CampaignDetail,
  Index,
  Marketplace
} from '@/pages';
import VoiceAgents from '@/pages/VoiceAgents';
import AgentFlowEditor from '@/pages/AgentFlowEditor';
import { AgentOrchestration } from '@/pages/AgentOrchestration';
import IntegrationsPage from '@/pages/IntegrationsPage';
import { TeamManagement } from '@/pages/TeamManagement';
import Settings from '@/pages/Settings';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/index" element={<Index />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact-sales" element={<ContactSales />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/api-docs" element={<ApiDocumentation />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <Campaigns />
              </ProtectedRoute>
            } />
            <Route path="/campaigns/:id" element={
              <ProtectedRoute>
                <CampaignDetail />
              </ProtectedRoute>
            } />
            <Route path="/call-history" element={
              <ProtectedRoute>
                <CallHistory />
              </ProtectedRoute>
            } />
            <Route path="/call-center" element={
              <ProtectedRoute>
                <CallCenter />
              </ProtectedRoute>
            } />
            <Route path="/assistants" element={
              <ProtectedRoute>
                <Assistants />
              </ProtectedRoute>
            } />
            <Route path="/voice-agents" element={
              <ProtectedRoute>
                <VoiceAgents />
              </ProtectedRoute>
            } />
            <Route path="/agent-flow-editor" element={
              <ProtectedRoute>
                <AgentFlowEditor />
              </ProtectedRoute>
            } />
            <Route path="/agent-flow-editor/:id" element={
              <ProtectedRoute>
                <AgentFlowEditor />
              </ProtectedRoute>
            } />
            <Route path="/orchestration" element={
              <ProtectedRoute>
                <AgentOrchestration />
              </ProtectedRoute>
            } />
            <Route path="/integrations" element={
              <ProtectedRoute>
                <IntegrationsPage />
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } />
            <Route path="/teams" element={
              <ProtectedRoute>
                <TeamManagement />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
