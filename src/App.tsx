import React, { useState, useEffect } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { SchoolAdminDashboard } from './components/dashboards/SchoolAdminDashboard';
import { LecturerDashboard } from './components/dashboards/LecturerDashboard';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { FinanceDashboard } from './components/dashboards/FinanceDashboard';
import { RegistrarDashboard } from './components/dashboards/RegistrarDashboard';
import { PublicPortal } from './components/public/PublicPortal';
import { AuthPage } from './components/auth/AuthPage';
import { supabase } from './supabaseClient.js';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useSchool();
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isPublicView, setIsPublicView] = useState(false);
  const [isAuthView, setIsAuthView] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check initial session with supabase.auth.getSession() and handle route protection
  useEffect(() => {
    let isMounted = true;

    const checkSessionAndRoute = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(currentSession);

        const path = window.location.pathname.toLowerCase();

        // 1. Check if user explicitly asked for login/signup/auth URLs
        if (path === '/signin' || path === '/login') {
          setAuthMode('signin');
          setIsAuthView(true);
        } else if (path === '/signup' || path === '/register') {
          setAuthMode('signup');
          setIsAuthView(true);
        } else if (path === '/auth') {
          setAuthMode('signin');
          setIsAuthView(true);
        } else if (!currentSession) {
          // Protect private pages with supabase.auth.getSession()
          // If no session, redirect to /login
          if (path !== '/' && path !== '') {
            // User requested a deep private page without session -> redirect to /login
            if (window.location.pathname !== '/login') {
              window.history.pushState({}, '', '/login');
            }
            setAuthMode('signin');
            setIsAuthView(true);
          } else {
            // Root "/" when no session exists: redirect to /login
            if (window.location.pathname !== '/login') {
              window.history.pushState({}, '', '/login');
            }
            setAuthMode('signin');
            setIsAuthView(true);
          }
        } else {
          // Real session exists!
          if (path === '/login' || path === '/signin' || path === '/signup' || path === '/register') {
            // Already logged in with real session -> redirect to "/"
            if (window.location.pathname !== '/') {
              window.history.pushState({}, '', '/');
            }
            setIsAuthView(false);
          }
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err);
        // Fallback: require login
        if (window.location.pathname !== '/login') {
          window.history.pushState({}, '', '/login');
        }
        setAuthMode('signin');
        setIsAuthView(true);
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkSessionAndRoute();

    // Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);

      if (event === 'SIGNED_IN' && newSession) {
        // Only redirect when a real session exists after login
        setIsAuthView(false);
        if (window.location.pathname !== '/') {
          window.history.pushState({}, '', '/');
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        if (window.location.pathname !== '/login') {
          window.history.pushState({}, '', '/login');
        }
        setAuthMode('signin');
        setIsAuthView(true);
      }
    });

    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/signin' || path === '/login') {
        setAuthMode('signin');
        setIsAuthView(true);
      } else if (path === '/signup' || path === '/register') {
        setAuthMode('signup');
        setIsAuthView(true);
      } else if (path === '/auth') {
        setAuthMode('signin');
        setIsAuthView(true);
      } else {
        // Protect private routes if session is absent
        supabase.auth.getSession().then(({ data: { session: s } }) => {
          if (!s) {
            if (window.location.pathname !== '/login') {
              window.history.pushState({}, '', '/login');
            }
            setAuthMode('signin');
            setIsAuthView(true);
          } else {
            setIsAuthView(false);
          }
        });
      }
    };

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthView(true);
    const targetPath = mode === 'signup' ? '/signup' : '/login';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  const handleAuthSuccess = () => {
    // Only redirect when a real session exists after login
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        setIsAuthView(false);
        if (window.location.pathname !== '/') {
          window.history.pushState({}, '', '/');
        }
      }
    });
  };

  const handleBackToHome = () => {
    // If a session exists, allow going back to dashboard "/"
    // If no session, remain on /login as private pages are protected
    if (session) {
      setIsAuthView(false);
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
    } else {
      setAuthMode('signin');
      if (window.location.pathname !== '/login') {
        window.history.pushState({}, '', '/login');
      }
    }
  };

  // While verifying session
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
          Verifying Institutional Session...
        </p>
      </div>
    );
  }

  // If viewing Supabase Auth Page (Sign In / Sign Up)
  if (isAuthView || !session) {
    return (
      <AuthPage
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
        onBackToHome={handleBackToHome}
      />
    );
  }

  // If viewing public portal
  if (isPublicView) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header
          onToggleSidebar={() => {}}
          isPublicView={isPublicView}
          setIsPublicView={setIsPublicView}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={handleOpenAuth}
        />
        <main className="flex-1">
          <PublicPortal
            onEnterPortal={() => setIsPublicView(false)}
            onOpenAuth={handleOpenAuth}
          />
        </main>
      </div>
    );
  }

  // Dashboard router
  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'super_admin':
        return <SuperAdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'school_admin':
        return <SchoolAdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'lecturer':
        return <LecturerDashboard activeTab={activeTab} />;
      case 'student':
        return <StudentDashboard activeTab={activeTab} />;
      case 'finance_officer':
        return <FinanceDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'registrar':
        return <RegistrarDashboard activeTab={activeTab} />;
      default:
        return <SuperAdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isPublicView={isPublicView}
        setIsPublicView={setIsPublicView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
      />

      <div className="flex-1 flex w-full">
        {/* Responsive Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={isSidebarOpen}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-xs md:hidden"
            aria-hidden="true"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <AppContent />
    </SchoolProvider>
  );
}
