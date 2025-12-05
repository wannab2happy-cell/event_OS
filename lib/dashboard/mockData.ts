/**
 * Mock Data for Event Dashboard
 * 
 * Provides sample data for dashboard components
 */

import type { RegistrationDataPoint } from '@/components/dashboard/RegistrationTrendCard';
import type { MailActivityDataPoint } from '@/components/dashboard/MailActivityCard';
import type { RecentActivityItemProps } from '@/components/dashboard/RecentActivityItem';
import { getRelativeTime } from '@/lib/utils/date';

// Generate registration trend data for last 30 days
export function getRegistrationTrendData(): RegistrationDataPoint[] {
  const data: RegistrationDataPoint[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate growth with some randomness
    const baseValue = 100 + (29 - i) * 5;
    const randomVariation = Math.floor(Math.random() * 20) - 10;
    const value = Math.max(0, baseValue + randomVariation);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value,
    });
  }
  
  return data;
}

// Generate mail activity data for last 30 days
export function getMailActivityData(): MailActivityDataPoint[] {
  const data: MailActivityDataPoint[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const sent = Math.floor(Math.random() * 200) + 50;
    const opened = Math.floor(sent * (0.6 + Math.random() * 0.2));
    const delivered = Math.floor(sent * (0.95 + Math.random() * 0.05));
    
    data.push({
      date: date.toISOString().split('T')[0],
      sent,
      opened,
      delivered,
    });
  }
  
  return data;
}

// Generate recent activities
export function getRecentActivities(): RecentActivityItemProps[] {
  const now = new Date();
  const activities: RecentActivityItemProps[] = [
    {
      title: 'New registration',
      description: 'John Doe registered for the event',
      relativeTime: getRelativeTime(new Date(now.getTime() - 5 * 60000)),
      type: 'registration',
    },
    {
      title: 'Email sent',
      description: 'Welcome email job completed (150 recipients)',
      relativeTime: getRelativeTime(new Date(now.getTime() - 15 * 60000)),
      type: 'mail',
    },
    {
      title: 'Table assigned',
      description: 'Table 5 assigned to 8 participants',
      relativeTime: getRelativeTime(new Date(now.getTime() - 30 * 60000)),
      type: 'table',
    },
    {
      title: 'Check-in',
      description: 'Jane Smith checked in at the venue',
      relativeTime: getRelativeTime(new Date(now.getTime() - 60 * 60000)),
      type: 'checkin',
    },
    {
      title: 'New registration',
      description: 'Bob Johnson registered for the event',
      relativeTime: getRelativeTime(new Date(now.getTime() - 90 * 60000)),
      type: 'registration',
    },
    {
      title: 'Email bounced',
      description: '3 emails bounced (invalid addresses)',
      relativeTime: getRelativeTime(new Date(now.getTime() - 120 * 60000)),
      type: 'mail',
    },
    {
      title: 'Table updated',
      description: 'Table 3 capacity increased to 12',
      relativeTime: getRelativeTime(new Date(now.getTime() - 180 * 60000)),
      type: 'table',
    },
    {
      title: 'New registration',
      description: 'Alice Williams registered for the event',
      relativeTime: getRelativeTime(new Date(now.getTime() - 240 * 60000)),
      type: 'registration',
    },
  ];
  
  return activities;
}

