import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'precious',
    image_url: ''
  });

  useEffect(() => {
    if (isEditing) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name,
          type: data.type || 'precious',
          image_url: data.image_url || ''
        });
        if (data.image_url) setImagePreview(data.image_url);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image_url;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `categories/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('gem-images')
      .upload(fileName, imageFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('gem-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalImageUrl = formData.image_url;
      
      if (imageFile) {
        finalImageUrl = await uploadImage();
      }

      const categoryData = {
        name: formData.name,
        type: formData.type,
        image_url: finalImageUrl
      };

      if (isEditing) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);
        if (error) throw error;
      }

      navigate('/admin/categories');
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sapphire-600 dark:text-gold-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/admin/categories" className="flex items-center gap-2 text-sm text-slate-500 hover:text-sapphire-600 dark:hover:text-gold-500 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Categories
        </Link>
        <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </h1>
      </div>

      <div className="max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire-500 dark:text-white"
                  placeholder="e.g. Sapphires"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire-500 dark:text-white"
                >
                  <option value="precious">Precious Gems</option>
                  <option value="semi-precious">Semi Precious</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category Image (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative h-64 flex flex-col items-center justify-center">
                {imagePreview ? (
                  <div className="absolute inset-0 p-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                      <span className="text-white font-medium flex items-center gap-2">
                        <Upload className="h-5 w-5" /> Change Image
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3 text-slate-500 dark:text-slate-400">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="text-sm">
                      <span className="text-sapphire-600 dark:text-gold-500 font-medium">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-xs">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
            <Link 
              to="/admin/categories"
              className="px-6 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-sapphire-600 hover:bg-sapphire-700 dark:bg-gold-600 dark:hover:bg-gold-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {isEditing ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
