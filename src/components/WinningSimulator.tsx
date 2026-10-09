import React, { useState } from 'react';
import { Award, Play, RotateCcw, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LottoBall } from './LottoBall';
import { runLottoSimulation, checkTicketWin, generateRandomLotto } from '../utils/lottoGenerator';
import { SimulationResult, LottoGame } from '../types/lotto';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface WinningSimulatorProps {
  savedGames: LottoGame[];
}

export const WinningSimulator: React.FC<WinningSimulatorProps> = ({ savedGames }) => {
  // Target test numbers (6 numbers)
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([7, 12, 19, 23, 34, 42]);
  const [customBallInput, setCustomBallInput] = useState<number | ''>('');

  // Official mock latest round
  const [targetWinning] = useState<{ round: number; numbers: number[]; bonus: number }>({
    round: 1145,
    numbers: [6, 11, 17, 24, 38, 43],
    bonus: 27,
  });

  // Simulator state
  const [simRuns, setSimRuns] = useState<number>(1000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  // Check current numbers win result against mock round
  const currentCheck = checkTicketWin(selectedNumbers, targetWinning.numbers, targetWinning.bonus);

  // Toggle number in selectedNumbers
  const handleToggleNumber = (n: number) => {
    soundManager.playClick();
    if (selectedNumbers.includes(n)) {
      setSelectedNumbers(selectedNumbers.filter((num) => num !== n));
    } else {
      if (selectedNumbers.length < 6) {
        setSelectedNumbers([...selectedNumbers, n].sort((a, b) => a - b));
      }
    }
  };

  // Pick random 6
  const handlePickRandom = () => {
    soundManager.playClick();
    setSelectedNumbers(generateRandomLotto().numbers);
  };

  // Load from saved game
  const handleLoadSaved = (game: LottoGame) => {
    soundManager.playClick();
    setSelectedNumbers(game.numbers);
  };

  // Run Monte Carlo Simulation
  const handleRunSimulation = () => {
    if (selectedNumbers.length !== 6) return;
    soundManager.playClick();
    setIsSimulating(true);

    setTimeout(() => {
      const res = runLottoSimulation(selectedNumbers, simRuns);
      setSimResult(res);
      setIsSimulating(false);

      if (res.rank1 > 0 || res.rank2 > 0 || res.rank3 > 0) {
        soundManager.playFanfare();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        soundManager.playClick();
      }
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* SECTION 1: LATEST WINNING NUMBERS COMPARISON */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                제 {targetWinning.round}회
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                최신 당첨 번호 대조 결과
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              내 번호 6개가 이번 주 당첨 번호와 일치하는지 확인합니다.
            </p>
          </div>

          <div className="flex items-center gap-1.5 justify-center">
            {targetWinning.numbers.map((n) => (
              <LottoBall key={n} num={n} size="sm" />
            ))}
            <span className="text-amber-400 font-bold px-1">+</span>
            <LottoBall num={targetWinning.bonus} size="sm" isBonus />
          </div>
        </div>

        {/* Selected numbers for check */}
        <div className="mt-5 flex flex-col items-center">
          <span className="text-xs font-bold text-slate-400 mb-2">
            내가 선택한 번호 ({selectedNumbers.length}/6개 선택됨)
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-3 px-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            {selectedNumbers.length === 0 ? (
              <span className="text-xs text-slate-500">아래에서 6개의 번호를 선택하세요</span>
            ) : (
              selectedNumbers.map((num) => {
                const isMatched = targetWinning.numbers.includes(num);
                const isBonus = num === targetWinning.bonus;
                return (
                  <div key={num} className="relative">
                    <LottoBall num={num} size="md" isMatched={isMatched || isBonus} />
                    {isMatched && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-950">
                        ✓
                      </span>
                    )}
                    {isBonus && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-950">
                        ★
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handlePickRandom}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              무작위 6개 자동 선택
            </button>
            {savedGames.length > 0 && (
              <button
                onClick={() => handleLoadSaved(savedGames[0])}
                className="text-xs text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-950/70 px-3 py-1.5 rounded-lg border border-amber-800/60 transition cursor-pointer"
              >
                보관함 번호 불러오기
              </button>
            )}
          </div>

          {/* Result banner */}
          {selectedNumbers.length === 6 && (
            <div
              className={`mt-4 w-full p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm ${
                currentCheck.rank > 0
                  ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {currentCheck.rank > 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-slate-500 shrink-0" />
                )}
                <span>
                  일치: <strong>{currentCheck.matched.length}개</strong>
                  {currentCheck.hasBonus ? ' (+보너스 일치)' : ''}
                </span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-amber-300">{currentCheck.prizeName}</span>
                {currentCheck.prizeAmount > 0 && (
                  <span className="block text-[11px] text-emerald-400 font-mono">
                    당첨금 ₩{currentCheck.prizeAmount.toLocaleString()}원
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: MONTE CARLO PROBABILITY SIMULATION */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> 가상 연속 추첨 시뮬레이터
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              "내 번호로 매주 복권을 샀다면 실제로 돈을 벌었을까?" 대규모 확률 시뮬레이션
            </p>
          </div>

          {/* Runs selector */}
          <div className="flex items-center gap-1.5">
            {[100, 1000, 10000, 50000].map((count) => (
              <button
                key={count}
                onClick={() => setSimRuns(count)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  simRuns === count
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {count >= 10000 ? `${count / 10000}만회` : `${count}회`}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 flex flex-col items-center">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating || selectedNumbers.length !== 6}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm sm:text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 transition shadow-lg shadow-amber-500/25 active:scale-98 cursor-pointer"
          >
            <Play className={`w-4 h-4 fill-slate-950 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? '초고속 시뮬레이션 계산 중...' : `${simRuns.toLocaleString()}회 가상 추첨 돌리기`}
          </button>
          <span className="text-[11px] text-slate-500 mt-2">
            가상 구매 비용: ₩{(simRuns * 1000).toLocaleString()}원 (게임당 1,000원)
          </span>
        </div>

        {/* Simulation Output Dashboard */}
        {simResult && (
          <div className="mt-6 pt-5 border-t border-slate-800 animate-scale-in">
            {/* High-level summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">총 구매 비용</span>
                <span className="text-lg font-black text-slate-200 font-mono">
                  ₩{simResult.totalCost.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {simResult.totalRuns.toLocaleString()}장 구매
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">총 당첨 수령액</span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  ₩{simResult.totalPrize.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  수령 세금 제외 전
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">수익률 (ROI)</span>
                <div className="flex items-center gap-1.5">
                  {simResult.roi >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                  )}
                  <span
                    className={`text-lg font-black font-mono ${
                      simResult.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {simResult.roi > 0 ? `+${simResult.roi}%` : `${simResult.roi}%`}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {simResult.roi < 0 ? '손실 구간 (기댓값 정상)' : '극적인 대박 달성!'}
                </span>
              </div>
            </div>

            {/* Detailed Rank breakdown table */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs">
              <h4 className="font-bold text-slate-300 mb-3">등수별 당첨 내역</h4>
              <div className="space-y-2">
                {[
                  { rank: '1등 (6개 일치)', count: simResult.rank1, prize: '약 20억원', color: 'text-amber-400' },
                  { rank: '2등 (5개+보너스)', count: simResult.rank2, prize: '약 5,000만원', color: 'text-sky-400' },
                  { rank: '3등 (5개 일치)', count: simResult.rank3, prize: '약 150만원', color: 'text-emerald-400' },
                  { rank: '4등 (4개 일치)', count: simResult.rank4, prize: '50,000원', color: 'text-slate-300' },
                  { rank: '5등 (3개 일치)', count: simResult.rank5, prize: '5,000원', color: 'text-slate-400' },
                  { rank: '낙첨 (0~2개 일치)', count: simResult.noPrize, prize: '0원', color: 'text-slate-600' },
                ].map((row) => (
                  <div
                    key={row.rank}
                    className="flex items-center justify-between py-1.5 border-b border-slate-900 last:border-none"
                  >
                    <span className={`font-semibold ${row.color}`}>{row.rank}</span>
                    <span className="text-slate-500">{row.prize}</span>
                    <span className="font-mono font-bold text-slate-200">
                      {row.count.toLocaleString()}회
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-500 text-center leading-relaxed">
              💡 로또 6/45의 이론상 1등 확률은 <strong>1 / 8,145,060 (약 0.000012%)</strong>입니다. 복권은 삶의 작은 즐거움과 희망으로 건전하게 즐기는 것이 가장 좋습니다!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
