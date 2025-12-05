import React from 'react';
import { GeneratedContent } from '../types';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, FileText, Tag, Search, Terminal } from 'lucide-react';

interface ArticleResultProps {
  content: GeneratedContent;
}

const ArticleResult: React.FC<ArticleResultProps> = ({ content }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    // Construct the copy text
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
        <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
          <Terminal className="w-5 h-5 text-cyan-500" />
          <h2 className="font-bold text-slate-100">Article Output</h2>
        </div>
        <div className="p-6 md:p-10 prose prose-invert prose-slate prose-headings:text-cyan-100 prose-a:text-cyan-400 prose-strong:text-white max-w-none">
           <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-6 mt-6" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mb-4 mt-8 pb-2 border-b border-slate-700" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-cyan-100 mb-3 mt-6" {...props} />,
              p: ({node, ...props}) => <p className="mb-5 leading-relaxed text-slate-300" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-5 space-y-2 text-slate-300" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-5 space-y-2 text-slate-300" {...props} />,
              li: ({node, ...props}) => <li className="pl-1" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-cyan-200" {...props} />,
            }}
           >
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
    </div>
  );
};

export default ArticleResult;