import React, { useState } from 'react';
import { BarChart3, Flame, Snowflake, PieChart, TrendingUp, Sparkles, Check, Bookmark } from 'lucide-react';
import { LottoBall } from './LottoBall';
import { HISTORICAL_FREQUENCY, generateStatWeightedLotto } from '../utils/lottoGenerator';
import { LottoGame } from '../types/lotto';
import { soundManager } from '../utils/audio';

interface StatsAnalyzerProps {
  onSaveGame: (game: LottoGame) => void;
}

export const StatsAnalyzer: React.FC<StatsAnalyzerProps> = ({ onSaveGame }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ranking' | 'color' | 'pattern'>('ranking');
  const [quickSaved, setQuickSaved] = useState<string | null>(null);

  // Sort frequency entries
  const entries = Object.entries(HISTORICAL_FREQUENCY).map(([num, count]) => ({
    num: Number(num),
    count,
  }));

  const top10 = [...entries].sort((a, b) => b.count - a.count).slice(0, 10);
  const bottom10 = [...entries].sort((a, b) => a.count - b.count).slice(0, 10);
  const maxFreq = Math.max(...entries.map((e) => e.count));

  // Color Section counts
  const colorCounts = {
    yellow: entries.filter((e) => e.num <= 10).reduce((acc, c) => acc + c.count, 0),
    blue: entries.filter((e) => e.num > 10 && e.num <= 20).reduce((acc, c) => acc + c.count, 0),
    red: entries.filter((e) => e.num > 20 && e.num <= 30).reduce((acc, c) => acc + c.count, 0),
    gray: entries.filter((e) => e.num > 30 && e.num <= 40).reduce((acc, c) => acc + c.count, 0),
    green: entries.filter((e) => e.num > 40).reduce((acc, c) => acc + c.count, 0),
  };
  const totalColorCounts = Object.values(colorCounts).reduce((a, b) => a + b, 0);

  // Generate combo from stats
  const handleQuickStatGame = (type: 'hot' | 'cold') => {
    soundManager.playClick();
    const nums = generateStatWeightedLotto(type);
    const game: LottoGame = {
      id: `stat-${type}-${Date.now()}`,
      numbers: nums,
      type: '통계가중',
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      note: type === 'hot' ? '🔥 역대 최다 출현 가중치 조합' : '❄️ 미출현 콜드 번호 가중치 조합',
    };
    onSaveGame(game);
    setQuickSaved(type);
    setTimeout(() => setQuickSaved(null), 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Sub Nav */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-2xl bg-slate-900 p-1.5 border border-slate-800 shadow-xl">
          <button
            onClick={() => {
              setActiveSubTab('ranking');
              soundManager.playClick();
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeSubTab === 'ranking'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> 번호별 출현 랭킹
          </button>
          <button
            onClick={() => {
              setActiveSubTab('color');
              soundManager.playClick();
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeSubTab === 'color'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChart className="w-4 h-4" /> 구간별 색상 분포
          </button>
          <button
            onClick={() => {
              setActiveSubTab('pattern');
              soundManager.playClick();
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeSubTab === 'pattern'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> 홀짝 & 총합 패턴
          </button>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-blue-500/15 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> 통계 가중치 1클릭 추천 생성
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            역대 출현 통계를 수학적 확률 분포로 모델링하여 최적의 6개 번호를 추출합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleQuickStatGame('hot')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-md shadow-rose-600/20 cursor-pointer"
          >
            {quickSaved === 'hot' ? <Check className="w-3.5 h-3.5 text-white" /> : <Flame className="w-3.5 h-3.5" />}
            {quickSaved === 'hot' ? '저장 완료!' : '🔥 핫 넘버 조합'}
          </button>

          <button
            onClick={() => handleQuickStatGame('cold')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-md shadow-blue-600/20 cursor-pointer"
          >
            {quickSaved === 'cold' ? <Check className="w-3.5 h-3.5 text-white" /> : <Snowflake className="w-3.5 h-3.5" />}
            {quickSaved === 'cold' ? '저장 완료!' : '❄️ 콜드 넘버 조합'}
          </button>
        </div>
      </div>

      {/* TAB 1: RANKING */}
      {activeSubTab === 'ranking' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top 10 Most Frequent */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-black text-rose-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" /> 최다 출현 번호 TOP 10 (Hot Numbers)
              </h3>
              <span className="text-xs text-slate-500">누적 기준</span>
            </div>

            <div className="space-y-2.5">
              {top10.map((item, idx) => {
                const percent = ((item.count / maxFreq) * 100).toFixed(0);
                return (
                  <div key={item.num} className="flex items-center gap-3">
                    <span className="w-5 text-xs font-black text-slate-500 text-right">
                      {idx + 1}
                    </span>
                    <LottoBall num={item.num} size="sm" />
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] mb-1 font-semibold">
                        <span className="text-slate-300">{item.num}번</span>
                        <span className="text-rose-400 font-mono font-bold">{item.count}회 출현</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom 10 Least Frequent */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-black text-blue-400 flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-400" /> 최소 출현 번호 TOP 10 (Cold Numbers)
              </h3>
              <span className="text-xs text-slate-500">당첨 가뭄수</span>
            </div>

            <div className="space-y-2.5">
              {bottom10.map((item, idx) => {
                const percent = ((item.count / maxFreq) * 100).toFixed(0);
                return (
                  <div key={item.num} className="flex items-center gap-3">
                    <span className="w-5 text-xs font-black text-slate-500 text-right">
                      {idx + 1}
                    </span>
                    <LottoBall num={item.num} size="sm" />
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] mb-1 font-semibold">
                        <span className="text-slate-300">{item.num}번</span>
                        <span className="text-blue-400 font-mono font-bold">{item.count}회 출현</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLOR DISTRIBUTION */}
      {activeSubTab === 'color' && (
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl">
          <h3 className="text-sm sm:text-base font-black text-amber-300 mb-2">
            구간별 색상별 출현 비율
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            역대 추첨에서 각 색상 구간별로 몇 개의 번호가 출현했는지 공식 통계 비율입니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
            {[
              { label: '황금색 (1~10)', count: colorCounts.yellow, color: 'bg-amber-400 text-amber-950', border: 'border-amber-400/40' },
              { label: '파랑색 (11~20)', count: colorCounts.blue, color: 'bg-blue-500 text-white', border: 'border-blue-400/40' },
              { label: '빨강색 (21~30)', count: colorCounts.red, color: 'bg-rose-500 text-white', border: 'border-rose-400/40' },
              { label: '회색 (31~40)', count: colorCounts.gray, color: 'bg-slate-500 text-white', border: 'border-slate-400/40' },
              { label: '녹색 (41~45)', count: colorCounts.green, color: 'bg-emerald-500 text-white', border: 'border-emerald-400/40' },
            ].map((col) => {
              const pct = ((col.count / totalColorCounts) * 100).toFixed(1);
              return (
                <div
                  key={col.label}
                  className={`p-4 rounded-2xl bg-slate-950/80 border ${col.border} flex flex-col items-center text-center`}
                >
                  <span className={`w-10 h-10 rounded-full ${col.color} flex items-center justify-center font-black text-sm mb-2 shadow`}>
                    ●
                  </span>
                  <span className="text-xs font-bold text-slate-300">{col.label}</span>
                  <span className="text-lg font-black text-amber-400 font-mono mt-1">
                    {pct}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {col.count.toLocaleString()}회
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            💡 <strong>당첨 팁:</strong> 당첨 번호 6개 중 특정 한 가지 색상만 5~6개 몰려서 나오는 확률은 0.1% 미만입니다. 일반적으로 3~4가지 색상이 골고루 섞여 나오는 패턴이 85% 이상을 차지합니다.
          </div>
        </div>
      )}

      {/* TAB 3: ODD/EVEN & SUM */}
      {activeSubTab === 'pattern' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl">
            <h3 className="text-sm font-black text-amber-300 mb-4">
              홀수 / 짝수 출현 비율 통계
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { ratio: '홀수 3 : 짝수 3', pct: 33.5, label: '가장 빈번 (최다 추천)' },
                { ratio: '홀수 4 : 짝수 2', pct: 24.3, label: '우수 패턴' },
                { ratio: '홀수 2 : 짝수 4', pct: 23.8, label: '우수 패턴' },
                { ratio: '홀수 5 : 짝수 1', pct: 8.7, label: '다소 낮음' },
                { ratio: '홀수 1 : 짝수 5', pct: 8.3, label: '다소 낮음' },
                { ratio: '홀수 6 : 짝수 0 또는 0 : 6', pct: 1.4, label: '극히 희박' },
              ].map((p) => (
                <div key={p.ratio} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-200">{p.ratio}</span>
                    <span className="font-black text-amber-400 font-mono">{p.pct}%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>{p.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl">
            <h3 className="text-sm font-black text-amber-300 mb-4">
              당첨 번호 6개 총합(Sum) 구간 분포
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { range: '100 미만 (극단적 저번호)', pct: 8.2, status: '비추천' },
                { range: '100 ~ 120 구간', pct: 19.4, status: '추천' },
                { range: '121 ~ 140 구간 (황금 구간)', pct: 28.5, status: '최우수 황금구간' },
                { range: '141 ~ 160 구간 (황금 구간)', pct: 25.1, status: '최우수 황금구간' },
                { range: '161 ~ 180 구간', pct: 13.8, status: '추천' },
                { range: '180 초과 (극단적 고번호)', pct: 5.0, status: '비추천' },
              ].map((s) => (
                <div key={s.range} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-200">{s.range}</span>
                    <span className="font-black text-emerald-400 font-mono">{s.pct}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
