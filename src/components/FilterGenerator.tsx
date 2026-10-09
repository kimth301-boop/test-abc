import React, { useState } from 'react';
import { Filter, Check, X, Sparkles, RefreshCw, Bookmark, AlertCircle } from 'lucide-react';
import { LottoBall } from './LottoBall';
import { FilterOptions, LottoGame } from '../types/lotto';
import { generateFilteredLotto, getBallColor } from '../utils/lottoGenerator';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface FilterGeneratorProps {
  onSaveGame: (game: LottoGame) => void;
}

export const FilterGenerator: React.FC<FilterGeneratorProps> = ({ onSaveGame }) => {
  const [includeNumbers, setIncludeNumbers] = useState<number[]>([]);
  const [excludeNumbers, setExcludeNumbers] = useState<number[]>([]);
  const [minSum, setMinSum] = useState<number>(100);
  const [maxSum, setMaxSum] = useState<number>(175);
  const [oddEvenRatio, setOddEvenRatio] = useState<FilterOptions['oddEvenRatio']>('all');
  const [allowConsecutive, setAllowConsecutive] = useState<boolean>(true);

  const [generatedResults, setGeneratedResults] = useState<number[][]>([]);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Toggle ball status: None -> Include -> Exclude -> None
  const handleBallClick = (num: number) => {
    soundManager.playClick();
    setErrorMsg(null);

    if (includeNumbers.includes(num)) {
      // Switch from include to exclude
      setIncludeNumbers((prev) => prev.filter((n) => n !== num));
      setExcludeNumbers((prev) => [...prev, num]);
    } else if (excludeNumbers.includes(num)) {
      // Clear
      setExcludeNumbers((prev) => prev.filter((n) => n !== num));
    } else {
      // Try to include
      if (includeNumbers.length >= 5) {
        // Can't include more than 5 (need at least 1 random)
        setExcludeNumbers((prev) => [...prev, num]);
      } else {
        setIncludeNumbers((prev) => [...prev, num]);
      }
    }
  };

  const handleGenerate = (count = 3) => {
    soundManager.playClick();
    setErrorMsg(null);

    const options: FilterOptions = {
      includeNumbers,
      excludeNumbers,
      minSum,
      maxSum,
      oddEvenRatio,
      allowConsecutive,
    };

    const newResults: number[][] = [];
    for (let i = 0; i < count; i++) {
      const res = generateFilteredLotto(options);
      if (res) {
        newResults.push(res);
      }
    }

    if (newResults.length === 0) {
      setErrorMsg('설정된 필터 조건(고정수/제외수/총합/홀짝)을 만족하는 번호 조합을 찾지 못했습니다. 조건을 완화해 보세요.');
      return;
    }

    setGeneratedResults(newResults);
    setSavedIndex(null);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleResetFilters = () => {
    soundManager.playClick();
    setIncludeNumbers([]);
    setExcludeNumbers([]);
    setMinSum(100);
    setMaxSum(175);
    setOddEvenRatio('all');
    setAllowConsecutive(true);
    setErrorMsg(null);
  };

  const handleSaveResult = (numbers: number[], idx: number) => {
    soundManager.playClick();
    const game: LottoGame = {
      id: `filter-game-${Date.now()}-${idx}`,
      numbers,
      type: includeNumbers.length > 0 ? '반자동' : '자동',
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      note: `고정수:${includeNumbers.length}개 / 제외수:${excludeNumbers.length}개`,
    };
    onSaveGame(game);
    setSavedIndex(idx);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* 1~45 Number Picker Board */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
              <Filter className="w-5 h-5 text-amber-400" /> 맞춤형 고정수 & 제외수 선택 보드
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              번호를 클릭하여 <span className="text-emerald-400 font-bold">고정수(초록/최대5개)</span>, <span className="text-rose-400 font-bold">제외수(빨강)</span>를 지정하세요.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              선택 초기화
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 py-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white">✓</span>
            <span className="text-slate-300">고정수 ({includeNumbers.length}/5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-600 flex items-center justify-center text-[10px] text-white">✕</span>
            <span className="text-slate-300">제외수 ({excludeNumbers.length}/39)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>미선택: 무작위 후보</span>
          </div>
        </div>

        {/* 1 to 45 grid */}
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 sm:gap-2 my-2">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
            const isInc = includeNumbers.includes(num);
            const isExc = excludeNumbers.includes(num);
            const col = getBallColor(num);

            let statusClasses = 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800';
            if (isInc) {
              statusClasses = 'bg-emerald-600/90 border-emerald-400 text-white font-black shadow-lg shadow-emerald-500/30 scale-105';
            } else if (isExc) {
              statusClasses = 'bg-rose-950/70 border-rose-700 text-rose-400 opacity-60 line-through';
            }

            return (
              <button
                key={num}
                onClick={() => handleBallClick(num)}
                className={`relative flex items-center justify-center h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer select-none ${statusClasses}`}
              >
                {/* Number */}
                <span>{num}</span>

                {/* Status indicator badges */}
                {isInc && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-400 text-slate-950 rounded-full text-[9px] flex items-center justify-center font-black">
                    ✓
                  </span>
                )}
                {isExc && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center font-black">
                    ✕
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Constraints Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 mt-4 border-t border-slate-800">
          {/* Sum Range */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>번호 총합 구간</span>
              <span className="text-amber-400 font-mono">{minSum} ~ {maxSum}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="60"
                max="140"
                value={minSum}
                onChange={(e) => setMinSum(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <input
                type="range"
                min="140"
                max="220"
                value={maxSum}
                onChange={(e) => setMaxSum(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              (역대 당첨 통계상 100~175 구간 출현율 73%)
            </span>
          </div>

          {/* Odd/Even Ratio */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              홀짝 비율 지정
            </label>
            <select
              value={oddEvenRatio}
              onChange={(e) => setOddEvenRatio(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-amber-400 outline-hidden"
            >
              <option value="all">무관 (전체 허용)</option>
              <option value="3:3">홀수 3개 : 짝수 3개 (최다 출현)</option>
              <option value="4:2">홀수 4개 : 짝수 2개</option>
              <option value="2:4">홀수 2개 : 짝수 4개</option>
              <option value="5:1">홀수 5개 : 짝수 1개</option>
              <option value="1:5">홀수 1개 : 짝수 5개</option>
            </select>
          </div>

          {/* Consecutive numbers toggle */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              연속 번호 포함 (예: 14, 15)
            </label>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {allowConsecutive ? '연속 번호 허용' : '연속 번호 제외'}
              </span>
              <button
                type="button"
                onClick={() => setAllowConsecutive(!allowConsecutive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  allowConsecutive ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowConsecutive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => handleGenerate(3)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" /> 필터 적용 3게임 추출
          </button>
          <button
            onClick={() => handleGenerate(5)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
          >
            5게임 한꺼번에 추출
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Generated Results Showcase */}
      {generatedResults.length > 0 && (
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl">
          <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center justify-between">
            <span>필터 추출 결과 ({generatedResults.length}세트)</span>
            <span className="text-xs text-amber-400 font-normal">
              고정수: {includeNumbers.length}개 / 제외수: {excludeNumbers.length}개 반영됨
            </span>
          </h3>

          <div className="space-y-3">
            {generatedResults.map((nums, idx) => {
              const sum = nums.reduce((a, b) => a + b, 0);
              const odd = nums.filter((n) => n % 2 !== 0).length;

              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 gap-3 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-amber-400/20 text-amber-400 text-xs font-black flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs text-slate-400">
                      합: <strong className="text-slate-200">{sum}</strong> (홀{odd}:짝{6 - odd})
                    </span>
                  </div>

                  {/* Balls */}
                  <div className="flex items-center justify-center gap-2">
                    {nums.map((num) => {
                      const isFixed = includeNumbers.includes(num);
                      return (
                        <div key={num} className="relative">
                          <LottoBall num={num} size="md" />
                          {isFixed && (
                            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black flex items-center justify-center ring-1 ring-slate-900">
                              ★
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => handleSaveResult(nums, idx)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        savedIndex === idx
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {savedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-amber-400" />}
                      {savedIndex === idx ? '저장됨' : '보관함'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
