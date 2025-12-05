/**
 * Vendor Types
 * 
 * Type definitions for vendor workspace
 */

export type VendorCategory = 'hotel' | 'av' | 'graphics' | 'logistics' | 'other';

export type VendorPriority = 'low' | 'medium' | 'high' | 'critical';

export type VendorStatus = 'planned' | 'in_progress' | 'done' | 'blocked';

export interface VendorNote {
  id: string;
  event_id: string;
  category: VendorCategory;
  title: string;
  content: string | null;
  vendor_name: string | null;
  owner: string | null;
  priority: VendorPriority;
  status: VendorStatus;
  due_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get label for category
 */
export function getCategoryLabel(category: VendorCategory): string {
  const labels: Record<VendorCategory, string> = {
    hotel: 'Hotel',
    av: 'AV',
    graphics: 'Graphics',
    logistics: 'Logistics',
    other: 'Other',
  };
  return labels[category];
}

/**
 * Get color class for priority
 */
export function getPriorityColor(priority: VendorPriority): string {
  const colors: Record<VendorPriority, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
  };
  return colors[priority];
}

/**
 * Get color class for status
 */
export function getStatusColor(status: VendorStatus): string {
  const colors: Record<VendorStatus, string> = {
    planned: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    done: 'bg-emerald-100 text-emerald-700',
    blocked: 'bg-red-100 text-red-700',
  };
  return colors[status];
}

/**
 * Get label for priority
 */
export function getPriorityLabel(priority: VendorPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

/**
 * Get label for status
 */
export function getStatusLabel(status: VendorStatus): string {
  const labels: Record<VendorStatus, string> = {
    planned: 'Planned',
    in_progress: 'In Progress',
    done: 'Done',
    blocked: 'Blocked',
  };
  return labels[status];
}

