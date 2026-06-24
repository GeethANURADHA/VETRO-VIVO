import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

// Carat tiers matching the Catalog filtering
export const CARAT_TIERS = [
  { label: 'Points (Below 1.00 Carat)', min: 0, max: 0.99 },
  { label: '1.00 To 1.49 Carat', min: 1.00, max: 1.49 },
  { label: '1.50 To 1.99 Carat', min: 1.50, max: 1.99 },
  { label: '2.00 To 2.49 Carat', min: 2.00, max: 2.49 },
  { label: '2.50 To 2.99 Carat', min: 2.50, max: 2.99 },
  { label: '3.00 To 3.49 Carat', min: 3.00, max: 3.49 },
  { label: '3.50 To 3.99 Carat', min: 3.50, max: 3.99 },
  { label: '4.00 To 4.49 Carat', min: 4.00, max: 4.49 },
  { label: '4.50 To 4.99 Carat', min: 4.50, max: 4.99 },
  { label: '5.00 To 5.99 Carat', min: 5.00, max: 5.99 },
  { label: '6.00 To 6.99 Carat', min: 6.00, max: 6.99 },
  { label: '7.00 To 7.99 Carat', min: 7.00, max: 7.99 },
  { label: '8.00 To 8.99 Carat', min: 8.00, max: 8.99 },
];

/**
 * Gems API services
 */
export const gemsApi = {
  /**
   * Fetch gems with optional filtering
   */
  async getAll(filters = {}) {
    try {
      const { search, category, minPrice, maxPrice, caratTier, sortBy } = filters;
      let query = supabase.from('gems').select('*, categories(name)');

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      if (category) {
        query = query.eq('category_id', category);
      }
      if (minPrice) {
        query = query.gte('price', parseFloat(minPrice));
      }
      if (maxPrice) {
        query = query.lte('price', parseFloat(maxPrice));
      }
      if (caratTier) {
        const tier = CARAT_TIERS.find(t => t.label === caratTier);
        if (tier) {
          query = query.gte('carat', tier.min).lte('carat', tier.max);
        }
      }

      // Sort logic
      if (sortBy === 'Price: Low to High') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'Price: High to Low') {
        query = query.order('price', { ascending: false });
      } else if (sortBy === 'Carat: High to Low') {
        query = query.order('carat', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch gems', error);
      throw error;
    }
  },

  /**
   * Fetch featured gems
   */
  async getFeatured(limit = 3) {
    try {
      const { data, error } = await supabase
        .from('gems')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch featured gems', error);
      throw error;
    }
  },

  /**
   * Fetch a single gem by ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('gems')
        .select('*, categories(name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error(`Failed to fetch gem with id: ${id}`, error);
      throw error;
    }
  },

  /**
   * Create a new gem listing
   */
  async create(gemData) {
    try {
      const { data, error } = await supabase
        .from('gems')
        .insert([gemData])
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      logger.error('Failed to create gem listing', error);
      throw error;
    }
  },

  /**
   * Update an existing gem listing
   */
  async update(id, gemData) {
    try {
      const { data, error } = await supabase
        .from('gems')
        .update(gemData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      logger.error(`Failed to update gem listing: ${id}`, error);
      throw error;
    }
  },

  /**
   * Delete a gem listing
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('gems')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Failed to delete gem listing: ${id}`, error);
      throw error;
    }
  },

  /**
   * Upload image to storage bucket
   */
  async uploadImage(file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gems/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gem-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('gem-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      logger.error('Failed to upload gem image', error);
      throw error;
    }
  }
};

/**
 * Categories API services
 */
export const categoriesApi = {
  /**
   * Fetch all categories
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*, gems(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch categories', error);
      throw error;
    }
  },

  /**
   * Fetch a single category by ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error(`Failed to fetch category with id: ${id}`, error);
      throw error;
    }
  },

  /**
   * Create a new category
   */
  async create(categoryData) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      logger.error('Failed to create category', error);
      throw error;
    }
  },

  /**
   * Update a category
   */
  async update(id, categoryData) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      logger.error(`Failed to update category: ${id}`, error);
      throw error;
    }
  },

  /**
   * Delete a category
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Failed to delete category: ${id}`, error);
      throw error;
    }
  },

  /**
   * Upload category image
   */
  async uploadImage(file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `categories/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gem-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('gem-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      logger.error('Failed to upload category image', error);
      throw error;
    }
  }
};

/**
 * Inquiries API services
 */
export const inquiriesApi = {
  /**
   * Fetch all inquiries
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, gems(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch inquiries', error);
      throw error;
    }
  },

  /**
   * Submit a new inquiry
   */
  async create(inquiryData) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([inquiryData])
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      logger.error('Failed to submit inquiry', error);
      throw error;
    }
  }
};

/**
 * Users/Admins API services
 */
export const usersApi = {
  /**
   * Fetch all admins
   */
  async getAllAdmins() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['admin', 'main_admin'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch admins', error);
      throw error;
    }
  },

  /**
   * Fetch a single user by ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error(`Failed to fetch user with id: ${id}`, error);
      throw error;
    }
  },

  /**
   * Create an admin user (requires Auth registration first)
   */
  async createAdmin(email, password, name, role) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            name,
            email,
            role
          }]);

        if (dbError) throw dbError;
      }
      return authData;
    } catch (error) {
      logger.error('Failed to create admin user', error);
      throw error;
    }
  },

  /**
   * Update admin user info
   */
  async updateAdmin(id, { name, role }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ name, role })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      logger.error(`Failed to update admin user: ${id}`, error);
      throw error;
    }
  },

  /**
   * Remove admin user privileges
   */
  async deleteAdmin(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Failed to delete admin user: ${id}`, error);
      throw error;
    }
  }
};

/**
 * Statistics API services
 */
export const statsApi = {
  /**
   * Fetch aggregate statistics for the dashboard
   */
  async getDashboardStats() {
    try {
      // 1. Total Gems Count
      const { count: gemsCount, error: gemsError } = await supabase
        .from('gems')
        .select('*', { count: 'exact', head: true });

      if (gemsError) throw gemsError;

      // 2. Total Inquiries Count
      const { count: inquiriesCount, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true });

      if (inquiriesError) throw inquiriesError;

      // 3. Total Admins Count
      const { count: adminsCount, error: adminsError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .in('role', ['admin', 'main_admin']);

      if (adminsError) throw adminsError;

      // Calculate mock views derived realistically or returned as default
      const simulatedViews = (gemsCount || 0) * 42 + (inquiriesCount || 0) * 15 + 120;

      return {
        totalGems: gemsCount || 0,
        totalInquiries: inquiriesCount || 0,
        totalAdmins: adminsCount || 0,
        totalViews: simulatedViews
      };
    } catch (error) {
      logger.error('Failed to calculate dashboard statistics', error);
      throw error;
    }
  },

  /**
   * Fetch gems grouped by category
   */
  async getGemsByCategory() {
    try {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name');

      if (catError) throw catError;

      const { data: gems, error: gemsError } = await supabase
        .from('gems')
        .select('category_id');

      if (gemsError) throw gemsError;

      // Map categories to counts
      const counts = categories.map(cat => {
        const count = gems.filter(g => g.category_id === cat.id).length;
        return {
          name: cat.name,
          value: count
        };
      }).filter(item => item.value > 0);

      // Add "Uncategorized" if any
      const uncategorizedCount = gems.filter(g => !g.category_id).length;
      if (uncategorizedCount > 0) {
        counts.push({ name: 'Uncategorized', value: uncategorizedCount });
      }

      return counts;
    } catch (error) {
      logger.error('Failed to calculate gems by category', error);
      throw error;
    }
  },

  /**
   * Fetch inquiries trends over time
   */
  async getInquiriesOverTime() {
    try {
      const { data: inquiries, error } = await supabase
        .from('inquiries')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date (YYYY-MM-DD)
      const grouped = {};
      inquiries.forEach(inq => {
        const dateStr = new Date(inq.created_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        });
        grouped[dateStr] = (grouped[dateStr] || 0) + 1;
      });

      return Object.entries(grouped).map(([date, count]) => ({
        date,
        inquiries: count
      }));
    } catch (error) {
      logger.error('Failed to calculate inquiries over time', error);
      throw error;
    }
  }
};
