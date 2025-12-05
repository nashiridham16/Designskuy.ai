import React, { useState } from 'react';
import ArticleForm from './components/ArticleForm';
import ArticleResult from './components/ArticleResult';
import { generateSEOArticle } from './services/geminiService';
import { ArticleFormData, GeneratedContent } from './types';
import { Hexagon, PenTool, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: ArticleFormData) => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    // Scroll slightly to indicate start
    window.scrollTo({ top: 100, behavior: 'smooth' });

    try {
      const cleanSubtitles = data.subtitles.filter(s => s.trim().length > 0);
      
      const result = await generateSEOArticle({
        ...data,
        subtitles: cleanSubtitles // Pass cleaned subtitles directly. Service handles empty array.
      });
      
      setGeneratedContent(result);
    } catch (err) {
      setError("Failed to generate article. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to create a new article? This will clear all current data.")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617] pb-20 text-slate-200">
      {/* Navbar / Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#020617]/80 border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Construction: Hexagon + Pen */}
            <div className="relative flex items-center justify-center w-10 h-10">
              <Hexagon className="w-10 h-10 text-cyan-500 fill-cyan-500/10 stroke-[1.5]" />
              <PenTool className="absolute w-5 h-5 text-white -rotate-90 pb-0.5 pl-0.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Designskuy<span className="text-cyan-400">.ai</span>
              </h1>
            </div>
          </div>
          <div className="hidden sm:block text-xs font-medium text-cyan-300 bg-cyan-950/30 px-3 py-1.5 rounded-full border border-cyan-900/50">
            AI SEO Content Generator
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-12">
        
        {/* Single Column Layout */}
        <div className="space-y-10">
          
          {/* Hero Text */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 mb-4">
              Create Content That Ranks
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Generate 100% unique, human-like, and E-E-A-T optimized articles in seconds.
            </p>
          </div>

          {/* Form Section */}
          <ArticleForm onSubmit={handleFormSubmit} isLoading={isLoading} />

          {/* Results Section */}
          <div id="results">
            {error && (
              <div className="bg-red-950/30 text-red-400 p-6 rounded-2xl border border-red-900/50 mb-6 flex items-center gap-4">
                <span className="text-2xl">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {!generatedContent && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <div className="p-4 bg-slate-800/50 rounded-full mb-4">
                   <PenTool className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg font-medium text-slate-500">Your generated masterpiece will appear here</p>
              </div>
            )}

            {isLoading && (
              <div className="space-y-6 animate-pulse">
                <div className="h-20 bg-slate-800 rounded-2xl"></div>
                <div className="h-96 bg-slate-800 rounded-2xl"></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-40 bg-slate-800 rounded-2xl"></div>
                  <div className="h-40 bg-slate-800 rounded-2xl"></div>
                </div>
              </div>
            )}

            {generatedContent && (
              <ArticleResult content={generatedContent} />
            )}
          </div>

          {/* Create New Article Button */}
          <div className="flex justify-center pt-8 pb-4">
             <button 
               onClick={handleReset}
               className="group flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-900/50 rounded-full transition-all duration-300 shadow-lg hover:shadow-rose-900/20"
             >
               <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
               <span className="font-medium text-sm">Create New Article</span>
             </button>
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="max-w-4xl mx-auto mt-20 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Designskuy.ai. Optimized for Excellence.</p>
      </footer>
    </div>
  );
};

export default App;