'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Lead,
  LeadFilters,
  PaginatedLeads,
  CreateLeadPayload,
  UpdateLeadPayload,
  BulkUpdatePayload,
  LeadStatus,
} from '../types/leads.types';
import { leadsService } from '../services/leads.service';

export function useLeads(initialFilters: LeadFilters = {}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialFilters.page ?? 1);
  const [filters, setFilters] = useState<LeadFilters>({ limit: 20, ...initialFilters });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetch = useCallback(async (overrides?: LeadFilters) => {
    setLoading(true);
    setError(null);
    try {
      const merged = { ...filters, ...overrides, page: overrides?.page ?? page };
      const res = await leadsService.list(merged);
      const result: PaginatedLeads = res.data;
      setLeads(result.data);
      setTotal(result.total);
      setPage(result.page);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load leads';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = useCallback(() => fetch(), [fetch]);

  const applyFilters = useCallback((newFilters: Partial<LeadFilters>) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    setPage(1);
    setSelectedIds([]);
    fetch(updated);
  }, [filters, fetch]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    fetch({ ...filters, page: p });
  }, [filters, fetch]);

  const createLead = useCallback(async (payload: CreateLeadPayload): Promise<Lead> => {
    const res = await leadsService.create(payload);
    await fetch();
    return res.data;
  }, [fetch]);

  const updateLead = useCallback(async (id: string, payload: UpdateLeadPayload): Promise<Lead> => {
    const res = await leadsService.update(id, payload);
    setLeads((prev) => prev.map((l) => (l.id === id ? res.data : l)));
    return res.data;
  }, []);

  const removeLead = useCallback(async (id: string): Promise<void> => {
    await leadsService.remove(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setTotal((prev) => prev - 1);
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
  }, []);

  const bulkUpdateStatus = useCallback(async (payload: BulkUpdatePayload): Promise<void> => {
    await leadsService.bulkUpdateStatus(payload);
    setLeads((prev) =>
      prev.map((l) => (payload.ids.includes(l.id) ? { ...l, status: payload.status } : l)),
    );
    setSelectedIds([]);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === leads.length ? [] : leads.map((l) => l.id),
    );
  }, [leads]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const limit = filters.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  return {
    leads,
    total,
    totalPages,
    page,
    limit,
    filters,
    loading,
    error,
    selectedIds,
    allSelected: leads.length > 0 && selectedIds.length === leads.length,
    refetch,
    applyFilters,
    goToPage,
    createLead,
    updateLead,
    removeLead,
    bulkUpdateStatus,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  };
}

export type UseLeads = ReturnType<typeof useLeads>;
