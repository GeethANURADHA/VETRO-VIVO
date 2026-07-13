import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../services/api';

/**
 * Custom hook to manage homepage settings.
 * Provides fetching, updating, and image upload for hero section configuration.
 */
export function useHomepageSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (err) {
      setError(err.message || 'Failed to load homepage settings');
      // Use defaults on failure
      setSettings(settingsApi.getDefaults());
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      setSaving(true);
      setError(null);
      const saved = await settingsApi.updateSettings(newSettings);
      setSettings(saved);
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
      const url = await settingsApi.uploadHeroImage(file);
      return url;
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    fetchSettings,
    updateSettings,
    uploadHeroImage,
  };
}
