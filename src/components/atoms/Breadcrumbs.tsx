import React from 'react';
import { Link } from '@tanstack/react-router';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span className="text-teal-500" aria-current="page">
                {item.label}
              </span>
            ) : item.path ? (
              <Link to={item.path as never} className="hover:text-teal-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-400">{item.label}</span>
            )}

            {!isLast && (
              <span className="text-slate-400">&gt;</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
