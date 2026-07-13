import { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Upload,
  Trash2,
  Save,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Type,
  Palette,
  RotateCcw,
} from 'lucide-react';
import { useHomepageSettings } from '../hooks/useHomepageSettings';
import { settingsApi } from '../services/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function HomepageSettings() {
  const { settings, loading, saving, error, updateSettings, uploadHeroImage } =
    useHomepageSettings();

  // Local form state
  const [form, setForm] = useState({
    hero_welcome_text: '',
    hero_headline: '',
    hero_paragraph: '',
    hero_overlay_color: '#000000',
    hero_overlay_opacity: 65,
    hero_bg_image_url: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [fileError, setFileError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  // Sync form with fetched settings
  useEffect(() => {
    if (settings) {
      setForm({
        hero_welcome_text: settings.hero_welcome_text || '',
        hero_headline: settings.hero_headline || '',
        hero_paragraph: settings.hero_paragraph || '',
        hero_overlay_color: settings.hero_overlay_color || '#000000',
        hero_overlay_opacity: settings.hero_overlay_opacity ?? 65,
        hero_bg_image_url: settings.hero_bg_image_url || null,
      });
      if (settings.hero_bg_image_url) {
        setPreviewImage(settings.hero_bg_image_url);
      }
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Please select a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Image must be smaller than 5 MB.');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setForm((prev) => ({ ...prev, hero_bg_image_url: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetDefaults = () => {
    const defaults = settingsApi.getDefaults();
    setForm({
      hero_welcome_text: defaults.hero_welcome_text,
      hero_headline: defaults.hero_headline,
      hero_paragraph: defaults.hero_paragraph,
      hero_overlay_color: defaults.hero_overlay_color,
      hero_overlay_opacity: defaults.hero_overlay_opacity,
      hero_bg_image_url: defaults.hero_bg_image_url,
    });
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    try {
      setSuccessMsg('');
      let imageUrl = form.hero_bg_image_url;

      // If there's a new file selected, upload it first
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        imageUrl = await uploadHeroImage(file);
      }

      await updateSettings({ ...form, hero_bg_image_url: imageUrl });
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      // Error is handled by the hook
    }
  };

  // Compute overlay rgba for live preview
  const overlayRgba = (() => {
    const hex = form.hero_overlay_color || '#000000';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = (form.hero_overlay_opacity ?? 65) / 100;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-sapphire-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Settings className="h-7 w-7 text-sapphire-600 dark:text-gold-500" />
          Homepage Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Customize the hero section that visitors see on your homepage.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 animate-fade-in-up">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ── LEFT COLUMN: Controls ── */}
        <div className="space-y-6">
          {/* Background Image */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-sapphire-500" />
              Background Image
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload a JPG, PNG, or WebP image (max 5 MB). The image will cover
              the entire hero area.
            </p>

            {/* Current / Preview Thumbnail */}
            {previewImage && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[16/7]">
                <img
                  src={previewImage}
                  alt="Hero background preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg backdrop-blur-sm transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sapphire-400 dark:hover:border-gold-500 text-slate-500 dark:text-slate-400 hover:text-sapphire-600 dark:hover:text-gold-400 transition-colors text-sm font-medium">
                  <Upload className="h-4 w-4" />
                  {previewImage ? 'Replace Image' : 'Upload Image'}
                </div>
              </label>
            </div>

            {fileError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {fileError}
              </p>
            )}
          </div>

          {/* Overlay Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="h-5 w-5 text-sapphire-500" />
              Overlay Settings
            </h2>

            <div className="space-y-4">
              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Overlay Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.hero_overlay_color}
                    onChange={(e) =>
                      handleChange('hero_overlay_color', e.target.value)
                    }
                    className="w-12 h-10 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
                  />
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                    {form.hero_overlay_color}
                  </span>
                </div>
              </div>

              {/* Opacity slider */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Overlay Opacity:{' '}
                  <span className="text-sapphire-600 dark:text-gold-400 font-bold">
                    {form.hero_overlay_opacity}%
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={form.hero_overlay_opacity}
                  onChange={(e) =>
                    handleChange(
                      'hero_overlay_opacity',
                      parseInt(e.target.value, 10)
                    )
                  }
                  className="w-full accent-sapphire-600 dark:accent-gold-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0% (Transparent)</span>
                  <span>100% (Opaque)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Type className="h-5 w-5 text-sapphire-500" />
              Hero Text Content
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Welcome Text
              </label>
              <input
                type="text"
                value={form.hero_welcome_text}
                onChange={(e) =>
                  handleChange('hero_welcome_text', e.target.value)
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sapphire-500 dark:focus:ring-gold-500 text-sm transition-shadow"
                placeholder="Welcome to VETRO VIVO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Headline
              </label>
              <textarea
                value={form.hero_headline}
                onChange={(e) =>
                  handleChange('hero_headline', e.target.value)
                }
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sapphire-500 dark:focus:ring-gold-500 text-sm resize-none transition-shadow"
                placeholder="Main headline text…"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Supporting Paragraph
              </label>
              <textarea
                value={form.hero_paragraph}
                onChange={(e) =>
                  handleChange('hero_paragraph', e.target.value)
                }
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sapphire-500 dark:focus:ring-gold-500 text-sm resize-none transition-shadow"
                placeholder="Why Choose Us? …"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-sapphire-600 hover:bg-sapphire-700 dark:bg-gold-500 dark:hover:bg-gold-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sapphire-600/20 dark:shadow-gold-500/20"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving…' : 'Save Settings'}
            </button>

            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-2 px-5 py-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-xl transition-colors text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Live Preview ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-sapphire-500" />
            Live Preview
          </h2>

          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl">
            {/* Mini hero preview */}
            <div
              className="relative flex items-center justify-center"
              style={{
                minHeight: 420,
                background: previewImage
                  ? `url(${previewImage}) center / cover no-repeat`
                  : '#6e7380',
              }}
            >
              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: overlayRgba }}
              />

              {/* Content preview */}
              <div className="relative z-10 text-center px-6 py-10 max-w-lg mx-auto">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70 font-medium mb-3">
                  {form.hero_welcome_text || 'Welcome'}
                </p>
                <h3
                  className="text-lg md:text-xl font-serif font-bold mb-3"
                  style={{ color: '#d4a853' }}
                >
                  {form.hero_headline
                    ? form.hero_headline.length > 120
                      ? form.hero_headline.slice(0, 120) + '…'
                      : form.hero_headline
                    : 'Headline text…'}
                </h3>
                <p className="text-white/70 text-xs leading-relaxed line-clamp-4">
                  {form.hero_paragraph
                    ? form.hero_paragraph.length > 200
                      ? form.hero_paragraph.slice(0, 200) + '…'
                      : form.hero_paragraph
                    : 'Supporting paragraph…'}
                </p>

                {/* Mock search bar */}
                <div className="mt-6 mx-auto max-w-xs">
                  <div className="flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-2.5 backdrop-blur-sm">
                    <span className="text-white/40 text-xs flex-1 text-left">
                      Search gems…
                    </span>
                    <div className="w-7 h-7 rounded-full bg-[#d4a853] flex items-center justify-center">
                      <svg
                        className="h-3.5 w-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            This preview approximates how the hero section will look on the
            homepage. The actual rendering may differ slightly due to viewport
            size and typography scaling.
          </p>
        </div>
      </div>
    </div>
  );
}
