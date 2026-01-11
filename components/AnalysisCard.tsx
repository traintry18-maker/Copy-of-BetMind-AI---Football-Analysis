
import React from 'react';
import { MatchAnalysis } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisCardProps {
  data: MatchAnalysis;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ data }) => {
  const chartData = [
    { name: 'Home', value: data.homeWinProb, color: '#3b82f6' },
    { name: 'Draw', value: data.drawProb, color: '#94a3b8' },
    { name: 'Away', value: data.awayWinProb, color: '#ef4444' },
  ];

  return (
    <div className="w-full mt-4 glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">{data.matchName}</h3>
          <p className="text-sm text-zinc-400">AI Confidence: {(data.confidence * 100).toFixed(0)}%</p>
        </div>
        <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Pro Analysis
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-semibold text-zinc-500 uppercase mb-4 tracking-widest">Win Probability</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px'}}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Key Performance Indicators</h4>
          <ul className="space-y-2">
            {data.keyStats.map((stat, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                {stat}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-6 bg-zinc-900/50">
        <h4 className="text-sm font-semibold text-zinc-500 uppercase mb-4 tracking-widest">Value Bet Suggestions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.suggestedBets.map((bet, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-white">{bet.market}</span>
                <span className="text-blue-400 font-mono font-bold">{bet.odd}</span>
              </div>
              <p className="text-xs text-zinc-400 italic leading-relaxed">{bet.reasoning}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 text-center bg-blue-600/10 border-t border-white/5">
        <p className="text-xs text-blue-400">
          <i className="fas fa-exclamation-triangle mr-1"></i> 
          Prediction: <span className="font-bold text-white uppercase">{data.prediction}</span>
        </p>
      </div>
    </div>
  );
};

export default AnalysisCard;
