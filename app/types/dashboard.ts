export type UserRole = 'admin' | 'user';

export interface StatItem {
  label: string;
  value: string;
  trend?: string; // e.g., "+12%"
  icon: any; // Component type
  color: 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export interface EventItem {
  title: string;
  sub: string;
  icon: any;
  color: 'indigo' | 'emerald' | 'amber' | 'rose';
}

export interface DashboardData {
  stats: StatItem[];
  events: EventItem[];
  distribution: { label: string; value: string; color: string }[];
  highlight: {
    title: string;
    description: string;
    action: string;
  };
}