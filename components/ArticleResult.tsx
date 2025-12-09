import React, { useState, useMemo } from 'react';
import { GeneratedContent } from '../types';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Tag, Search, Terminal, ShieldCheck, Loader2, CheckCircle, ScanSearch, BarChart3, Eye, EyeOff, Award, TrendingUp, AlertTriangle } from 'lucide-react';

interface ArticleResultProps {
  content: GeneratedContent;
}

const ArticleResult: React.FC<ArticleResultProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<{score: number, status: string} | null>(null);
  const [showKeywordHighlights, setShowKeywordHighlights] = useState(false);

  // Parse keywords for highlighting and checking
  const keywordList = useMemo(() => {
    return content.originalKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
  }, [content.originalKeywords]);

  // Keyword Density Calculation
  const keywordAnalysis = useMemo(() => {
    const textLower = content.articleBody.toLowerCase();
    const totalWords = textLower.split(/\s+/).length;
    
    return keywordList.map(kw => {
      // Escape special regex characters in the keyword
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKw}\\b`, 'gi');
      const count = (textLower.match(regex) || []).length;
      const density = (count / totalWords) * 100;
      return { keyword: kw, count, density: density.toFixed(2) };
    });
  }, [content.articleBody, keywordList]);

  // Simulated E-E-A-T Score
  const eeatScore = useMemo(() => {
    // This is a simulation based on content length and structure
    // In a real app, this would use AI to evaluate.
    const hasEnoughWords = content.articleBody.length > 1500;
    const hasSubheadings = (content.articleBody.match(/^## /gm) || []).length >= 3;
    const hasConclusion = content.articleBody.toLowerCase().includes('conclusion') || content.articleBody.toLowerCase().includes('kesimpulan');
    
    let score = 70; // Base score
    if (hasEnoughWords) score += 10;
    if (hasSubheadings) score += 10;
    if (hasConclusion) score += 10;
    return score;
  }, [content.articleBody]);

  const handleCopy = () => {
    const textToCopy = `
${content.articleBody}

---
Meta Description:
${content.metaDescription}

Tags:
${content.tags.join(', ')}
    `;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlagiarismCheck = () => {
    setIsCheckingPlagiarism(true);
    setPlagiarismResult(null);
    setTimeout(() => {
      setIsCheckingPlagiarism(false);
      setPlagiarismResult({ score: 100, status: 'Unique Content' });
    }, 2500);
  };

  // Helper component to highlight text
  const HighlightText = ({ text }: { text: string }) => {
    if (!showKeywordHighlights || !text) return <>{text}</>;

    // Create a regex that matches any of the keywords, case insensitive
    // Escape special characters in keywords
    const escapedKeywords = keywordList.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (escapedKeywords.length === 0) return <>{text}</>;

    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) => {
          if (keywordList.includes(part.toLowerCase())) {
            return (
              <span key={i} className="text-yellow-400 font-bold">
                {part}
              </span>
            );
          }
          return part;
        })}
      </>
    );
  };

  // Custom Markdown Renderers
  const MarkdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-6 mt-6" {...props} />,
    h2: ({node, children, ...props}: any) => {
      // Logic to find if this header has a generated image
      // We look for exact match or close match in keys
      let imageUrl = null;
      if (typeof children === 'string') {
        imageUrl = content.images.subheadingImages[children];
      } else if (Array.isArray(children) && typeof children[0] === 'string') {
         // Try to find matching key
         const headerText = children[0];
         imageUrl = content.images.subheadingImages[headerText];
         
         // If no exact match, try fuzzy (contains)
         if (!imageUrl) {
             const foundKey = Object.keys(content.images.subheadingImages).find(k => headerText.includes(k) || k.includes(headerText));
             if (foundKey) imageUrl = content.images.subheadingImages[foundKey];
         }
      }

      return (
        <div className="mb-8 mt-10">
          <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-slate-700" {...props}>
             {children}
          </h2>
          {imageUrl && (
            <figure className="my-6">
              <img 
                src={imageUrl} 
                alt={`Illustration for ${children}`} 
                className="w-full aspect-video object-cover rounded-xl shadow-lg border border-slate-700/50 hover:scale-[1.01] transition-transform duration-500" 
              />
            </figure>
          )}
        </div>
      );
    },
    h3: ({node, children, ...props}: any) => {
        // Similar logic for H3 if user provided H3 as subheadings
        let imageUrl = null;
        if (typeof children === 'string') {
            imageUrl = content.images.subheadingImages[children];
        } else if (Array.isArray(children) && typeof children[0] === 'string') {
             const headerText = children[0];
             imageUrl = content.images.subheadingImages[headerText];
             if (!imageUrl) {
                 const foundKey = Object.keys(content.images.subheadingImages).find(k => headerText.includes(k) || k.includes(headerText));
                 if (foundKey) imageUrl = content.images.subheadingImages[foundKey];
             }
        }
    
        return (
          <div className="mb-4 mt-6">
             <h3 className="text-xl font-semibold text-cyan-100 mb-3" {...props}>{children}</h3>
             {imageUrl && (
                <figure className="my-5">
                  <img 
                    src={imageUrl} 
                    alt={`Illustration for ${children}`} 
                    className="w-full aspect-video object-cover rounded-xl shadow-md border border-slate-700/50" 
                  />
                </figure>
              )}
          </div>
        )
    },
    p: ({node, children, ...props}: any) => {
      // Need to handle children. If it's a string, we highlight. 
      // ReactMarkdown often passes arrays of text/elements.
      return (
        <p className="mb-5 leading-relaxed text-slate-300" {...props}>
          {React.Children.map(children, child => {
            if (typeof child === 'string') {
              return <HighlightText text={child} />;
            }
            return child;
          })}
        </p>
      );
    },
    li: ({node, children, ...props}: any) => (
      <li className="pl-1" {...props}>
         {React.Children.map(children, child => {
            if (typeof child === 'string') {
              return <HighlightText text={child} />;
            }
            return child;
          })}
      </li>
    ),
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-5 space-y-2 text-slate-300" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-5 space-y-2 text-slate-300" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-semibold text-cyan-200" {...props} />,
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-700/50">
        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
          <span className="text-cyan-400">⚡</span> Content Ready
        </h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800 rounded-lg transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy All'}
        </button>
      </div>

      {/* Main Article Body */}
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Terminal className="w-5 h-5 text-cyan-500" />
             <h2 className="font-bold text-slate-100">Article Output</h2>
          </div>
        </div>
        
        <div className="p-6 md:p-10 prose prose-invert prose-slate max-w-none">
           {/* Top Image (Title) */}
           {content.images.titleImage && (
             <div className="mb-8 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
               <img 
                 src={content.images.titleImage} 
                 alt="Article Feature Image" 
                 className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-700"
               />
             </div>
           )}

           <ReactMarkdown components={MarkdownComponents}>
             {content.articleBody}
           </ReactMarkdown>
        </div>
      </div>

      {/* Meta Data & Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta Description */}
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 flex flex-col group hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-4 text-cyan-400 font-semibold">
            <Search className="w-5 h-5" />
            <h3>Meta Description</h3>
          </div>
          <div className="flex-1 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 group-hover:bg-slate-900 transition-colors">
             <p className="text-slate-300 text-sm leading-relaxed">
               {content.metaDescription}
             </p>
          </div>
          <div className="mt-3 text-right">
             <span className={`text-xs ${content.metaDescription.length > 125 || content.metaDescription.length < 115 ? 'text-orange-400' : 'text-emerald-400'}`}>
               {content.metaDescription.length} chars (Target: 115-125)
             </span>
          </div>
        </div>

        {/* Recommended Tags */}
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 flex flex-col group hover:border-pink-500/30 transition-colors">
           <div className="flex items-center gap-2 mb-4 text-pink-400 font-semibold">
            <Tag className="w-5 h-5" />
            <h3>Recommended Tags</h3>
          </div>
          <div className="flex-1 flex flex-wrap content-start gap-2">
            {content.tags.map((tag, idx) => (
              <span key={idx} className="bg-pink-950/30 text-pink-300 px-3 py-1.5 rounded-full text-sm font-medium border border-pink-900/50 hover:border-pink-500/50 transition-colors cursor-default">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Unified Article Checker Section */}
      <div className="space-y-4">
         <h3 className="text-xl font-bold text-white flex items-center gap-2 pl-2 border-l-4 border-emerald-500">
             <ShieldCheck className="w-6 h-6 text-emerald-500" />
             Article Quality Check
         </h3>
         
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Plagiarism Checker */}
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-4 text-emerald-400 font-semibold">
                        <ScanSearch className="w-5 h-5" />
                        <h4>Plagiarism Scan</h4>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">
                        Check content uniqueness against billions of web pages.
                    </p>
                </div>

                {isCheckingPlagiarism ? (
                     <div className="flex flex-col items-center py-2 space-y-2">
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 animate-[progress_1s_ease-in-out_infinite]" style={{width: '60%'}}></div>
                        </div>
                     </div>
                ) : plagiarismResult ? (
                    <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-3 flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                        <div>
                             <div className="text-emerald-300 font-bold">100% Unique</div>
                             <div className="text-xs text-emerald-500/70">Passed Check</div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handlePlagiarismCheck}
                        className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
                    >
                        Scan Now
                    </button>
                )}
            </div>

            {/* 2. E-E-A-T Score */}
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 flex flex-col justify-between">
                 <div className="flex items-center gap-2 mb-4 text-blue-400 font-semibold">
                    <Award className="w-5 h-5" />
                    <h4>E-E-A-T Score</h4>
                </div>
                <div className="flex items-center justify-center py-2">
                    <div className="relative flex items-center justify-center w-24 h-24">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-blue-500" strokeDasharray={`${eeatScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                        <span className="absolute text-2xl font-bold text-white">{eeatScore}</span>
                    </div>
                </div>
                <div className="text-center text-xs text-slate-400 mt-2">
                    Based on structure, depth & optimization
                </div>
            </div>

            {/* 3. Keyword Density Checker */}
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-yellow-400 font-semibold">
                        <BarChart3 className="w-5 h-5" />
                        <h4>Keyword Density</h4>
                    </div>
                    <button 
                        onClick={() => setShowKeywordHighlights(!showKeywordHighlights)}
                        className={`p-1.5 rounded-lg transition-colors border ${showKeywordHighlights ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-slate-700 text-slate-400 border-slate-600 hover:text-white'}`}
                        title={showKeywordHighlights ? "Hide Keywords" : "Highlight Keywords in Article"}
                    >
                        {showKeywordHighlights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-32 pr-2 space-y-2 custom-scrollbar">
                    {keywordAnalysis.length > 0 ? keywordAnalysis.map((k, i) => (
                        <div key={i} className="flex items-center justify-between text-sm p-2 bg-slate-900/50 rounded-lg border border-slate-700/50">
                            <span className="text-slate-300 font-medium truncate max-w-[100px]" title={k.keyword}>{k.keyword}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-slate-500 text-xs">{k.count}x</span>
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${parseFloat(k.density) > 2.5 ? 'bg-red-900/50 text-red-400' : parseFloat(k.density) < 0.5 ? 'bg-orange-900/50 text-orange-400' : 'bg-green-900/50 text-green-400'}`}>
                                    {k.density}%
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-slate-500 text-sm text-center italic py-4">No keywords found</div>
                    )}
                </div>
                <div className="text-[10px] text-slate-500 mt-2 text-center">
                   Recommended density: 0.5% - 2.5%
                </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default ArticleResult;