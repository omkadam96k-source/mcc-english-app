'use client';

import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* LEFT PANEL - Branding (Fkt Laptop/PC var disel) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white flex-col justify-center items-start p-16 relative overflow-hidden">
        
        {/* Background Animations / Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute top-[20%] right-[15%] w-16 h-16 border border-white/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-[30%] left-[10%] w-8 h-8 border border-white/20 rounded-full animate-bounce"></div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl">
            <span className="text-5xl">🎓</span>
          </div>
          
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">
              MCC Portal
            </span>
          </h1>
          
          <p className="text-2xl text-blue-100 font-light mb-6">
            Matoshri Coaching Classes
          </p>
          
          <div className="h-1.5 w-24 bg-gradient-to-r from-blue-400 to-emerald-300 rounded-full mb-6"></div>
          
          {/* Hya line madhe error fix kela ahe */}
          <p className="text-xl text-gray-300 italic font-medium">
            &quot;Right Choice for the Bright Future&quot;
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - Login Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-8 relative">
        
        <div className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 z-10">
          
          {/* Mobile Header (Fkt Mobile var disel) */}
          <div className="md:hidden text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-blue-100">
              🎓
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">MCC Portal</h2>
            <p className="text-gray-500 font-medium mt-1">Matoshri Coaching Classes</p>
          </div>

          {/* Desktop Login Header */}
          <div className="text-center md:text-left mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500 font-medium text-sm">Secure access to teacher dashboard</p>
          </div>

          {/* Unique Google Button */}
          <button 
            onClick={handleGoogleLogin}
            className="group relative w-full flex items-center justify-center gap-4 bg-white text-gray-700 font-bold py-4 px-4 rounded-2xl border-2 border-gray-100 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="bg-gray-50 p-2 rounded-full group-hover:bg-white transition-colors duration-300">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <span className="text-lg">Continue with Google</span>
          </button>

          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <span className="text-xs font-bold uppercase tracking-widest">Secured via Firebase</span>
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}