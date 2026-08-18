import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Briefcase, FileCheck, CreditCard, Calendar, LogOut, 
  Sun, Moon, ShieldCheck, UserCheck, MessageCircle, Phone, Sparkles, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Consumer-Friendly Web App Header */}
      <header className="no-print sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/25 shrink-0 ring-2 ring-blue-500/20">
            ARS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 dark:text-slate-100 text-sm tracking-wide leading-tight">
                ARS VISA & CONSULTANTS
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-sky-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                Client Portal
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
              Your Personal Visa & Application Hub
            </span>
          </div>
        </div>

        {/* Client Actions Header */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Switch to Staff CRM (If authorized) */}
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all border border-slate-200 dark:border-slate-700"
            title="Switch back to Staff CRM"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Staff CRM</span>
          </button>

          {/* WhatsApp Support Direct Button */}
          <a
            href="https://wa.me/94774443322"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 font-bold text-xs transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Need Help?</span>
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Customer Avatar Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                SD
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                Sanduni De Silva
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">
                Client #CUST-002
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
            title="Sign out of Client Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 pb-24 sm:pb-8 space-y-8">
        <Outlet />
      </main>

      {/* Mobile Touch Bottom Navbar */}
      <nav className="no-print fixed bottom-3 left-4 right-4 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl px-3 py-2 flex items-center justify-around shadow-2xl sm:hidden">
        <NavLink
          to="/portal"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all ${
              isActive ? 'text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/80 shadow-xs' : 'text-slate-500'
            }`
          }
        >
          <Briefcase className="w-5 h-5" />
          <span>My Visa</span>
        </NavLink>

        <a
          href="#documents"
          className="flex flex-col items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-xl text-slate-500 hover:text-blue-600"
        >
          <FileCheck className="w-5 h-5" />
          <span>Documents</span>
        </a>

        <a
          href="#payments"
          className="flex flex-col items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-xl text-slate-500 hover:text-blue-600"
        >
          <CreditCard className="w-5 h-5" />
          <span>Payments</span>
        </a>

        <a
          href="#appointments"
          className="flex flex-col items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-xl text-slate-500 hover:text-blue-600"
        >
          <Calendar className="w-5 h-5" />
          <span>Schedule</span>
        </a>
      </nav>
    </div>
  );
};

export default CustomerLayout;
