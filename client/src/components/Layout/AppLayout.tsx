import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MainLayout } from './MainLayout';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Public routes that don't need the sidebar layout
  const publicRoutes = [
    '/login',
    '/register', 
    '/landing',
    '/index',
    '/about',
    '/faq',
    '/pricing',
    '/blog',
    '/contact-sales',
    '/documentation',
    '/api-docs',
    '/tutorials',
    '/case-studies',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith('/blog/')
  );
  
  // If user is authenticated and not on a public route, use the main layout with sidebar
  if (user && !isPublicRoute) {
    return <MainLayout>{children}</MainLayout>;
  }
  
  // Otherwise, render children directly
  return <>{children}</>;
};
