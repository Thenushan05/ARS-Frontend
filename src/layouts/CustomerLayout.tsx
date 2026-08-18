import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Briefcase, FileCheck, CreditCard, Calendar, LogOut, 
  Sun, Moon, ShieldCheck, UserCheck, Bell
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Customer Header */}
      <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/20">
            ARS
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs tracking-wide block leading-tight">
              ARS VISA & CONSULTANTS
            </span>
            <span className="text-[10px] text-blue-600 dark:text-sky-400 font-bold uppercase tracking-wider block">
              CLIENT APPLICATION PORTAL
            </span>
          </div>
        </div>

        {/* Client Profile Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Client Name Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Sanduni De Silva'}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
            title="Sign out of Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Portal View Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-20 sm:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="no-print fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-lg sm:hidden">
        <NavLink
          to="/portal"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/80' : 'text-slate-500'
            }`
          }
        >
          <Briefcase className="w-5 h-5" />
          <span>Application</span>
        </NavLink>

        <NavLink
          to="/portal#documents"
          className="flex flex-col items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-xl text-slate-500 hover:text-blue-600"
        >
          <FileCheck className="w-5 h-5" />
          <span>Documents</span>
        </NavLink>

        <NavLink
          to="/portal#payments"
          className="flex flex-col items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-xl text-slate-500 hover:text-blue-600"
        >
          <CreditCard className="w-5 h-5" />
          <span>Payments</span>
        </NavLink>

        <NavLink
          to="/portal#appointments"
          className="flex flex-col items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-xl text-slate-500 hover:text-blue-600"
        >
          <Calendar className="w-5 h-5" />
          <span>Appointments</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default CustomerLayout;
