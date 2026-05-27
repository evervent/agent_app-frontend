export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  INTERESTED = 'interested',
  QUOTE_REQUIRED = 'quote_required',
  QUOTE_SHARED = 'quote_shared',
  FOLLOW_UP = 'follow_up',
  CONVERTED = 'converted',
  LOST = 'lost',
}

export enum LeadProductInterest {
  HEALTH = 'health',
  MOTOR = 'motor',
  TERM = 'term',
  TRAVEL = 'travel',
  HOME = 'home',
  COMMERCIAL = 'commercial',
}

export enum LeadSource {
  REFERRAL = 'referral',
  WALK_IN = 'walk_in',
  SOCIAL_MEDIA = 'social_media',
  COLD_CALL = 'cold_call',
  WEBSITE = 'website',
  OTHER = 'other',
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Lead {
  id: string;
  workspaceId: string;
  assignedToId: string | null;
  createdById: string;
  name: string;
  mobile: string;
  email: string | null;
  city: string | null;
  state: string | null;
  productInterest: LeadProductInterest | null;
  source: LeadSource | null;
  priority: LeadPriority;
  status: LeadStatus;
  nextFollowupAt: string | null;
  lostReason: string | null;
  notes: string | null;
  convertedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus | '';
  priority?: LeadPriority | '';
  productInterest?: LeadProductInterest | '';
  assignedToId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedLeads {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateLeadPayload {
  name: string;
  mobile: string;
  email?: string;
  city?: string;
  state?: string;
  productInterest?: LeadProductInterest;
  source?: LeadSource;
  priority?: LeadPriority;
  status?: LeadStatus;
  assignedToId?: string;
  nextFollowupAt?: string;
  notes?: string;
}

export type UpdateLeadPayload = Partial<CreateLeadPayload> & {
  lostReason?: string;
};

export interface BulkUpdatePayload {
  ids: string[];
  status: LeadStatus;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'New',
  [LeadStatus.CONTACTED]: 'Contacted',
  [LeadStatus.INTERESTED]: 'Interested',
  [LeadStatus.QUOTE_REQUIRED]: 'Quote Required',
  [LeadStatus.QUOTE_SHARED]: 'Quote Shared',
  [LeadStatus.FOLLOW_UP]: 'Follow-Up',
  [LeadStatus.CONVERTED]: 'Converted',
  [LeadStatus.LOST]: 'Lost',
};

export const LEAD_PRODUCT_LABELS: Record<LeadProductInterest, string> = {
  [LeadProductInterest.HEALTH]: 'Health',
  [LeadProductInterest.MOTOR]: 'Motor',
  [LeadProductInterest.TERM]: 'Term Life',
  [LeadProductInterest.TRAVEL]: 'Travel',
  [LeadProductInterest.HOME]: 'Home',
  [LeadProductInterest.COMMERCIAL]: 'Commercial',
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  [LeadSource.REFERRAL]: 'Referral',
  [LeadSource.WALK_IN]: 'Walk-In',
  [LeadSource.SOCIAL_MEDIA]: 'Social Media',
  [LeadSource.COLD_CALL]: 'Cold Call',
  [LeadSource.WEBSITE]: 'Website',
  [LeadSource.OTHER]: 'Other',
};

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  [LeadPriority.LOW]: 'Low',
  [LeadPriority.MEDIUM]: 'Medium',
  [LeadPriority.HIGH]: 'High',
};
