import { api } from '@/shared/lib/api';
import {
  LeadFilters,
  CreateLeadPayload,
  UpdateLeadPayload,
  BulkUpdatePayload,
} from '../types/leads.types';

function buildParams(filters: LeadFilters) {
  const params: Record<string, string | number> = {};
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;
  if (filters.productInterest) params.productInterest = filters.productInterest;
  if (filters.assignedToId) params.assignedToId = filters.assignedToId;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  return params;
}

export const leadsService = {
  list: (filters: LeadFilters = {}) =>
    api.get('/leads', { params: buildParams(filters) }),

  getById: (id: string) =>
    api.get(`/leads/${id}`),

  create: (payload: CreateLeadPayload) =>
    api.post('/leads', payload),

  update: (id: string, payload: UpdateLeadPayload) =>
    api.patch(`/leads/${id}`, payload),

  remove: (id: string) =>
    api.delete(`/leads/${id}`),

  bulkUpdateStatus: (payload: BulkUpdatePayload) =>
    api.post('/leads/bulk-status', payload),
};
