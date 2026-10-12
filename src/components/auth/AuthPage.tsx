import React, { useState } from 'react';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';
import { useSchool } from '../../context/SchoolContext';
import { ArrowLeft, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
  onBackToHome?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signin',
  onSuccess,
  onBackToHome,
}) => {
  const { schoolInfo } = useSchool();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [prefilledEmail, setPrefilledEmail] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSignUpCompleted = (registeredEmail?: string, message?: string) => {
    if (registeredEmail) {
      setPrefilledEmail(registeredEmail);
    }
    if (message) {
      setSuccessNotice(message);
    } else {
      setSuccessNotice('Check your email and confirm your account before logging in');
    }
    setMode('signin');
  };

  const handleAuthSuccess = () => {
    // 3) After successful login: Redirect the user to the Home page ("/")
    if (onSuccess) {
      onSuccess();
    }
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleReturnHome = () => {
    if (onBackToHome) {
      onBackToHome();
    }
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back to Home Button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <button
          onClick={handleReturnHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to School Home & Portal</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200">
          
          {/* Institutional Branding */}
          <div className="text-center mb-6 space-y-2">
            <div className="flex justify-center">
              <img
                src="/src/assets/images/jaroy_school_crest_1791659609817.jpg"
                alt="Jaroy School of Management and Technology"
                className="w-16 h-16 rounded-full object-cover border border-blue-200 shadow-xs"
              />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                {schoolInfo.name}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Idi Aba, Abeokuta · Supabase Institutional Portal
              </p>
            </div>
          </div>

          {/* Segmented Mode Switcher (Sign In vs Sign Up) */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Active Auth Form */}
          {mode === 'signin' ? (
            <SignIn
              initialEmail={prefilledEmail}
              initialSuccessMsg={successNotice}
              onSuccess={handleAuthSuccess}
              onSwitchToSignUp={() => {
                setSuccessNotice(null);
                setMode('signup');
              }}
            />
          ) : (
            <SignUp
              onSuccess={handleAuthSuccess}
              onSwitchToSignIn={handleSignUpCompleted}
            />
          )}

          {/* Institutional Trust Notice */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Secured with Supabase Authentication</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
