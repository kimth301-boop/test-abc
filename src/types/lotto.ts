export interface LottoGame {
  id: string;
  numbers: number[]; // 6 numbers sorted
  bonus?: number;
  type: '자동' | '수동' | '반자동' | '꿈해몽' | '통계가중' | '행운운세';
  createdAt: string;
  note?: string;
}

export interface SavedTicket {
  id: string;
  createdAt: string;
  title: string;
  games: LottoGame[];
}

export type BallColor = 'yellow' | 'blue' | 'red' | 'gray' | 'green';

export interface FilterOptions {
  includeNumbers: number[]; // 고정수 (최대 5개)
  excludeNumbers: number[]; // 제외수 (최대 39개)
  minSum: number; // 기본 100
  maxSum: number; // 기본 175
  oddEvenRatio: 'all' | '3:3' | '2:4' | '4:2' | '1:5' | '5:1';
  allowConsecutive: boolean;
}

export interface SimulationResult {
  totalRuns: number;
  totalCost: number;
  totalPrize: number;
  roi: number; // %
  rank1: number; // 6개 일치 (약 20억)
  rank2: number; // 5개 + 보너스 (약 5천만)
  rank3: number; // 5개 일치 (약 150만)
  rank4: number; // 4개 일치 (5만)
  rank5: number; // 3개 일치 (5천)
  noPrize: number;
}
