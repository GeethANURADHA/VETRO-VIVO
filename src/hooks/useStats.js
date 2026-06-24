import { useState, useCallback, useEffect } from 'react';
import { statsApi } from '../services/api';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

/**
 * Custom hook to fetch stats and setup realtime updates
 */
export function useStats(enableRealtime = false) {
  const [stats, setStats] = useState({
    totalGems: 0,
    totalInquiries: 0,
    totalAdmins: 0,
    totalViews: 0
  });
  const [gemsByCategory, setGemsByCategory] = useState([]);
  const [inquiriesOverTime, setInquiriesOverTime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, categoryData, trendsData] = await Promise.all([
        statsApi.getDashboardStats(),
        statsApi.getGemsByCategory(),
        statsApi.getInquiriesOverTime()
      ]);

      setStats(statsData);
      setGemsByCategory(categoryData);
      setInquiriesOverTime(trendsData);
    } catch (err) {
      logger.error('Error fetching dashboard statistics', err);
      setError(err.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  // Realtime subscription setup
  useEffect(() => {
    if (!enableRealtime) return;

    logger.info('Subscribing to realtime updates for gems and inquiries');

    const channel = supabase
      .channel('dashboard-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gems' },
        (payload) => {
          logger.info('Realtime change detected in gems table:', payload);
          fetchAllStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        (payload) => {
          logger.info('Realtime change detected in inquiries table:', payload);
          fetchAllStats();
        }
      )
      .subscribe((status) => {
        logger.info(`Realtime channel status: ${status}`);
      });

    return () => {
      logger.info('Unsubscribing from realtime dashboard channel');
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, fetchAllStats]);

  return {
    stats,
    gemsByCategory,
    inquiriesOverTime,
    loading,
    error,
    refresh: fetchAllStats
  };
}
