import React, { useState, useEffect } from 'react';
import { ArticleFormData, Language, WritingStyle, ArticleGoal } from '../types';
import { Loader2, Trash2, Wand2, Sparkles } from 'lucide-react';

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData) => void;
  isLoading: boolean;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    language: Language.INDONESIA,
    keywords: '',
    wordCount: 500,
    style: WritingStyle.INFORMATIONAL,
    goal: ArticleGoal.INFORMATION,
    brand: '',
    subtitles: ['', '', ''],
    additionalPrompt: '',
  });

  const [titleCharCount, setTitleCharCount] = useState(0);

  useEffect(() => {
    setTitleCharCount(formData.title.length);
  }, [formData.title]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubtitleChange = (index: number, value: string) => {
    const newSubtitles = [...formData.subtitles];
    newSubtitles[index] = value;
    
    if (index === newSubtitles.length - 1 && value.trim() !== '') {
       newSubtitles.push('');
    }

    setFormData(prev => ({ ...prev, subtitles: newSubtitles }));
  };

  const removeSubtitle = (index: number) => {
    if (formData.subtitles.length <= 1) return; // Keep at least 1 input
    const newSubtitles = formData.subtitles.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, subtitles: newSubtitles }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Shared classes
  const labelClass = "block text-sm font-medium text-cyan-100 mb-2";
  const inputClass = "w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-white placeholder-slate-500";
  const selectClass = "w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-white appearance-none cursor-pointer";

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-700/50 pb-6">
        <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
          <Sparkles className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Project Details</h2>
          <p className="text-sm text-slate-400">Configure your SEO parameters below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <div>
          <label className={labelClass}>
            Article Title <span className="text-cyan-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={60}
              required
              className={inputClass}
              placeholder="e.g., 5 Ways to Improve SEO Ranking"
            />
            <span className={`absolute right-3 top-3.5 text-xs ${titleCharCount >= 60 ? 'text-red-400' : 'text-slate-500'}`}>
              {titleCharCount}/60
            </span>
          </div>
        </div>

        {/* Language & Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Language</label>
            <div className="relative">
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className={selectClass}
              >
                {Object.values(Language).map((lang) => (
                  <option key={lang} value={lang} className="bg-slate-900">{lang}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Writing Style</label>
            <div className="relative">
              <select
                name="style"
                value={formData.style}
                onChange={handleChange}
                className={selectClass}
              >
                {Object.values(WritingStyle).map((style) => (
                  <option key={style} value={style} className="bg-slate-900">{style}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Goal & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Article Goal</label>
            <div className="relative">
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className={selectClass}
              >
                {Object.values(ArticleGoal).map((goal) => (
                  <option key={goal} value={goal} className="bg-slate-900">{goal}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Brand / Product Name</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., Acme Corp"
            />
          </div>
        </div>

        {/* Keywords & Length */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2">
            <label className={labelClass}>Keywords (Comma separated)</label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="seo, marketing, content writing"
            />
           </div>
           <div>
            <label className={labelClass}>Length (words)</label>
            <input
              type="number"
              name="wordCount"
              value={formData.wordCount}
              onChange={handleChange}
              min={100}
              max={5000}
              className={inputClass}
            />
           </div>
        </div>

        {/* Subtitles */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
          <label className={labelClass}>
            Subtitles / Outline (Optional)
          </label>
          <div className="space-y-3">
            {formData.subtitles.map((subtitle, index) => (
              <div key={index} className="flex gap-3 items-center group">
                <span className="text-sm text-slate-500 w-6 font-mono font-bold">{index + 1}.</span>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => handleSubtitleChange(index, e.target.value)}
                  className={`${inputClass} py-2`}
                  placeholder="Subheading (leave empty to auto-generate)..."
                />
                {formData.subtitles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubtitle(index)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove subheading"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3 ml-9">
            * Leave blank to let the AI generate at least 3 relevant subheadings automatically.
          </p>
        </div>

        {/* Additional Prompt */}
        <div>
           <label className={labelClass}>
            Additional Instructions (Optional)
          </label>
          <textarea
             name="additionalPrompt"
             value={formData.additionalPrompt}
             onChange={handleChange}
             className={`${inputClass} min-h-[100px] resize-y`}
             placeholder="e.g., Focus on tone, include specific statistics, target a specific demographic, or ask to rewrite in a specific voice..."
          />
          <p className="text-xs text-slate-500 mt-2">
            Use this to refine the output further.
          </p>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] border border-transparent
              ${isLoading 
                ? 'bg-slate-700 cursor-not-allowed opacity-70' 
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)] shadow-lg'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-cyan-300" />
                <span>Crafting Masterpiece...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6" />
                <span>Generate Article</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;