import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import VoiceAgents from '@/pages/VoiceAgents';
import AgentMarketplace from '@/pages/AgentMarketplace';
import Campaigns from '@/pages/Campaigns';
import CallHistory from '@/pages/CallHistory';
import CallCenter from '@/pages/CallCenter';
import Assistants from '@/pages/Assistants';
import About from '@/pages/About';
import Faq from '@/pages/Faq';
import Pricing from '@/pages/Pricing';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import ContactSales from '@/pages/ContactSales';
import Documentation from '@/pages/Documentation';
import ApiDocumentation from '@/pages/ApiDocumentation';
import Tutorials from '@/pages/Tutorials';
import CaseStudies from '@/pages/CaseStudies';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import CookiePolicy from '@/pages/CookiePolicy';
import NotFound from '@/pages/NotFound';
import LandingPage from '@/pages/LandingPage';
import CampaignDetail from '@/pages/CampaignDetail';
import { Index } from '@/pages';
import IntegrationsPage from '@/pages/IntegrationsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/index" element={<Index />} />
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
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/voice-agents" element={
              <ProtectedRoute>
                <VoiceAgents />
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <AgentMarketplace />
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
            <Route path="/integrations" element={
              <ProtectedRoute>
                <IntegrationsPage />
              </ProtectedRoute>
            } />
            
            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
