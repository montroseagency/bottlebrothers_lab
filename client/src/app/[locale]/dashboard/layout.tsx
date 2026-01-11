// Server component layout wrapper for dashboard
// This allows us to use dynamic rendering options

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import DashboardLayoutClient from './DashboardLayoutClient';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
