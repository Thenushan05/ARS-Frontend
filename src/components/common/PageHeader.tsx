import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions
}) => {
  return (
    <div className="mb-6 space-y-2">
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-1.5 mb-2">
          <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-sky-400 flex items-center transition-colors">
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Dashboard</span>
          </Link>
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
              {item.href ? (
                <Link to={item.href} className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
