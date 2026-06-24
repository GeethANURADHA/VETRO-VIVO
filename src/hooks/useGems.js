import { useState, useCallback } from 'react';
import { gemsApi } from '../services/api';

/**
 * Custom hook to manage gems state and operations
 */
export function useGems() {
  const [gems, setGems] = useState([]);
  const [gem, setGem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGems = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await gemsApi.getAll(filters);
      setGems(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch gems');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedGems = useCallback(async (limit = 3) => {
    setLoading(true);
    setError(null);
    try {
      const data = await gemsApi.getFeatured(limit);
      setGems(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch featured gems');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await gemsApi.getById(id);
      setGem(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch gemstone details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createGem = useCallback(async (gemData) => {
    setLoading(true);
    setError(null);
    try {
      const newGem = await gemsApi.create(gemData);
      setGems(prev => [newGem, ...prev]);
      return newGem;
    } catch (err) {
      setError(err.message || 'Failed to create gem listing');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGem = useCallback(async (id, gemData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedGem = await gemsApi.update(id, gemData);
      setGems(prev => prev.map(g => g.id === id ? updatedGem : g));
      if (gem && gem.id === id) {
        setGem(updatedGem);
      }
      return updatedGem;
    } catch (err) {
      setError(err.message || 'Failed to update gem listing');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [gem]);

  const deleteGem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await gemsApi.delete(id);
      setGems(prev => prev.filter(g => g.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete gem listing');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const publicUrl = await gemsApi.uploadImage(file);
      return publicUrl;
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    gems,
    gem,
    loading,
    error,
    fetchGems,
    fetchFeaturedGems,
    fetchGem,
    createGem,
    updateGem,
    deleteGem,
    uploadImage,
    setError
  };
}
