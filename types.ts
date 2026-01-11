
export interface MatchAnalysis {
  matchName: string;
  prediction: string;
  confidence: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  keyStats: string[];
  suggestedBets: {
    market: string;
    odd: string;
    reasoning: string;
  }[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  groundingLinks?: { title: string; uri: string }[];
  analysisData?: MatchAnalysis;
}
