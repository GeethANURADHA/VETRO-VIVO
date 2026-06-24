import { useState, useCallback } from 'react';
import { categoriesApi } from '../services/api';

/**
 * Custom hook to manage categories state and operations
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.getById(id);
      setCategory(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch category details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await categoriesApi.create(categoryData);
      setCategories(prev => [newCategory, ...prev]);
      return newCategory;
    } catch (err) {
      setError(err.message || 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCategory = await categoriesApi.update(id, categoryData);
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
      if (category && category.id === id) {
        setCategory(updatedCategory);
      }
      return updatedCategory;
    } catch (err) {
      setError(err.message || 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [category]);

  const deleteCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriesApi.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const publicUrl = await categoriesApi.uploadImage(file);
      return publicUrl;
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    category,
    loading,
    error,
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadImage,
    setError
  };
}
