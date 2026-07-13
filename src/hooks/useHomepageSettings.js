import { useState, useEffect, useCallback, useRef } from 'react';
import { settingsApi } from '../services/api';

const SETTINGS_KEY = 'vetro_vivo_homepage_settings';

// Read cached settings synchronously so hero renders immediately
function getCachedSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted cache — ignore
  }
  return null;
}

/**
 * Stale-while-revalidate: serve cached settings immediately, then
 * silently refresh from Supabase in the background.
 */
export function useHomepageSettings() {
  const cached = getCachedSettings();
  const [settings, setSettings] = useState(cached || settingsApi.getDefaults());
  // loading is only true when there is NO cache at all
  const [loading, setLoading]   = useState(!cached);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);
  const didFetch                = useRef(false);

  const fetchSettings = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      setError(null);
      const data = await settingsApi.getSettings();
      setSettings(data);
      // persist to cache so next mount is instant
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(data)); } catch {}
    } catch (err) {
      setError(err.message || 'Failed to load homepage settings');
      // keep whatever is already shown (cache or defaults)
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // On mount: if we had a cache, quietly refresh in background.
  // If no cache, show loading until first fetch completes.
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchSettings(!cached); // showLoading = true only when no cache
  }, [fetchSettings, cached]);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      setSaving(true);
      setError(null);
      const saved = await settingsApi.updateSettings(newSettings);
      setSettings(saved);
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved)); } catch {}
      return saved;
    } catch (err) {
      setError(err.message || 'Failed to save settings');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const uploadHeroImage = useCallback(async (file) => {
    try {
      setSaving(true);
      setError(null);
      return await settingsApi.uploadHeroImage(file);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { settings, loading, saving, error, fetchSettings, updateSettings, uploadHeroImage };
}

