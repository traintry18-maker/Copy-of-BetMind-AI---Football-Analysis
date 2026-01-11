
import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { getFootballAnalysis } from './services/geminiService';
import AnalysisCard from './components/AnalysisCard';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to BetMind AI. I provide professional analysis and real-time answers for football leagues worldwide. How can I help you today?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await getFootballAnalysis(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        timestamp: Date.now(),
        groundingLinks: result.links,
        analysisData: result.analysis
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error while processing global football data. Please try again.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 glass p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
            <i className="fas fa-globe"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">BETMIND <span className="text-blue-500 italic">AI</span></h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Global Football Intelligence</p>
          </div>
        </div>
        <div className="hidden sm:flex gap-6">
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase font-bold">Coverage</p>
            <p className="text-sm font-bold text-green-500">Worldwide</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase font-bold">Engine</p>
            <p className="text-sm font-bold text-blue-500">Gemini 3 Pro</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden relative glass rounded-3xl flex flex-col shadow-2xl">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-zinc-800/80 text-zinc-200 border border-white/5 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
                
                {m.analysisData && <AnalysisCard data={m.analysisData} />}

                {m.groundingLinks && m.groundingLinks.length > 0 && (
                  <div className="mt-4 w-full">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2 tracking-widest">Live Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {m.groundingLinks.map((link, idx) => (
                        <a 
                          key={idx} 
                          href={link.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs bg-white/5 hover:bg-white/10 text-blue-400 px-3 py-1 rounded-full transition-all border border-white/5 flex items-center gap-2"
                        >
                          <i className="fas fa-external-link-alt text-[10px]"></i>
                          {link.title || 'Source'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <span className="text-[10px] text-zinc-600 mt-2 font-mono">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800/80 p-4 rounded-2xl rounded-tl-none border border-white/5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-zinc-900/50 border-t border-white/5">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about any match, league, or player worldwide..."
                className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-zinc-500 shadow-inner"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
            >
              {isLoading ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-search"></i>}
            </button>
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
             <button 
                onClick={() => setInput('Analyze the next Argentina Liga Profesional matches')}
                className="text-[10px] text-zinc-500 hover:text-blue-400 font-bold uppercase tracking-tighter transition-colors"
             >
                <i className="fas fa-chart-line mr-1 text-blue-500"></i> SA Leagues
             </button>
             <button 
                onClick={() => setInput('Who are the top scorers in the J-League right now?')}
                className="text-[10px] text-zinc-500 hover:text-blue-400 font-bold uppercase tracking-tighter transition-colors"
             >
                <i className="fas fa-star mr-1 text-yellow-500"></i> Asia Stats
             </button>
             <button 
                onClick={() => setInput('Predict the outcome of Al-Hilal vs Al-Nassr')}
                className="text-[10px] text-zinc-500 hover:text-blue-400 font-bold uppercase tracking-tighter transition-colors"
             >
                <i className="fas fa-bolt mr-1 text-green-500"></i> High Value
             </button>
          </div>
        </div>
      </main>

      <footer className="mt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
        <div className="mb-2 sm:mb-0">© 2024 GLOBAL FOOTBALL ANALYTICS ENGINE</div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> GLOBAL API UP</span>
          <span>REGION: GLOBAL (v3.0)</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
