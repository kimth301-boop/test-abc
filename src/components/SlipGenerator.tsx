import React, { useState } from 'react';
import { RefreshCw, Copy, Check, Printer, Bookmark, Sparkles, SlidersHorizontal, Dice5 } from 'lucide-react';
import { LottoBall } from './LottoBall';
import { generateRandomLotto, generateStatWeightedLotto } from '../utils/lottoGenerator';
import { soundManager } from '../utils/audio';
import { LottoGame } from '../types/lotto';
import confetti from 'canvas-confetti';

interface SlipGeneratorProps {
  onSaveGames: (games: LottoGame[]) => void;
}

export const SlipGenerator: React.FC<SlipGeneratorProps> = ({ onSaveGames }) => {
  const [gameCount, setGameCount] = useState<number>(5);
  const [strategy, setStrategy] = useState<'random' | 'hot' | 'cold' | 'balanced'>('random');
  const [copied, setCopied] = useState(false);
  const [savedAll, setSavedAll] = useState(false);

  // Generate initial games
  const [games, setGames] = useState<LottoGame[]>(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `game-${i}-${Date.now()}`,
      numbers: generateRandomLotto().numbers,
      type: '자동',
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    }));
  });

  // Re-generate all games
  const handleGenerateAll = () => {
    soundManager.playClick();
    const newGames: LottoGame[] = [];
    for (let i = 0; i < gameCount; i++) {
      let nums: number[] = [];
      let type: LottoGame['type'] = '자동';

      if (strategy === 'random') {
        nums = generateRandomLotto().numbers;
        type = '자동';
      } else if (strategy === 'hot') {
        nums = generateStatWeightedLotto('hot');
        type = '통계가중';
      } else if (strategy === 'cold') {
        nums = generateStatWeightedLotto('cold');
        type = '통계가중';
      } else {
        nums = generateStatWeightedLotto('balanced');
        type = '통계가중';
      }

      newGames.push({
        id: `game-${i}-${Date.now()}-${Math.random()}`,
        numbers: nums,
        type,
        createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      });
    }

    setGames(newGames);
    setSavedAll(false);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  // Re-roll single game
  const handleRerollSingle = (index: number) => {
    soundManager.playClick();
    setGames((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        id: `game-${index}-${Date.now()}`,
        numbers: generateRandomLotto().numbers,
      };
      return copy;
    });
    setSavedAll(false);
  };

  // Copy all games text
  const handleCopySlip = () => {
    soundManager.playClick();
    const lines = games.map((g, idx) => {
      const letter = String.fromCharCode(65 + idx);
      return `[${letter}] ${g.type} : ${g.numbers.map((n) => n.toString().padStart(2, '0')).join('  ')}`;
    });

    const slipText = `===== 로또 6/45 복권 발급 =====\n${lines.join('\n')}\n금액: ${games.length * 1000}원\n행운을 빕니다!`;
    navigator.clipboard.writeText(slipText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save all games
  const handleSaveAll = () => {
    soundManager.playClick();
    onSaveGames(games);
    setSavedAll(true);
    setTimeout(() => setSavedAll(false), 3000);
  };

  // Print slip
  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  const gameLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Control Configuration Bar */}
      <div className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Game Count Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <Dice5 className="w-3.5 h-3.5 text-amber-400" /> 게임 수량
            </label>
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              {[1, 2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => {
                    setGameCount(cnt);
                    soundManager.playClick();
                    if (games.length < cnt) {
                      const needed = cnt - games.length;
                      const added: LottoGame[] = Array.from({ length: needed }, (_, i) => ({
                        id: `game-${games.length + i}-${Date.now()}`,
                        numbers: generateRandomLotto().numbers,
                        type: '자동',
                        createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                      }));
                      setGames([...games, ...added]);
                    } else if (games.length > cnt) {
                      setGames(games.slice(0, cnt));
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    gameCount === cnt
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cnt}게임 ({cnt * 1000}원)
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Option */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" /> 번호 생성 전략
            </label>
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              {[
                { id: 'random', label: '순수 무작위' },
                { id: 'hot', label: '자주 나온 번호' },
                { id: 'cold', label: '덜 나온 번호' },
                { id: 'balanced', label: '통계 균형형' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setStrategy(s.id as any);
                    soundManager.playClick();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    strategy === s.id
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Generate Button */}
          <button
            onClick={handleGenerateAll}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 transition shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> 전체 번호 다시 받기
          </button>
        </div>
      </div>

      {/* Realistic Paper Ticket Slip Card */}
      <div className="relative w-full max-w-xl bg-amber-50/95 text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-amber-200 print:shadow-none print:m-0 print:border-none">
        {/* Ticket Header Jagged Top effect with SVG dots */}
        <div className="bg-amber-100 border-b-2 border-dashed border-amber-300/80 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded tracking-tighter">
                제 6/45회
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                로또 6/45 복권
              </h2>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 font-mono">
              발행일시: {new Date().toLocaleDateString('ko-KR')} | 번호추첨기 발급용지
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 block">금액</span>
            <span className="text-lg font-black text-rose-600 font-mono">
              ₩{(games.length * 1000).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Ticket Games Body */}
        <div className="p-4 sm:p-6 space-y-3 font-mono">
          {games.map((game, index) => {
            const sum = game.numbers.reduce((a, b) => a + b, 0);
            const oddCount = game.numbers.filter((n) => n % 2 !== 0).length;

            return (
              <div
                key={game.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200/80 hover:border-amber-400 transition shadow-xs gap-2"
              >
                <div className="flex items-center gap-2.5">
                  {/* Game letter icon */}
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shadow-xs">
                    {gameLetters[index]}
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {game.type}
                  </span>
                </div>

                {/* 6 Balls row */}
                <div className="flex items-center gap-1.5 sm:gap-2 justify-center sm:justify-start">
                  {game.numbers.map((num) => (
                    <LottoBall key={num} num={num} size="sm" />
                  ))}
                </div>

                {/* Stats + Individual Reroll */}
                <div className="flex items-center justify-between sm:justify-end gap-2 text-[11px] text-slate-500">
                  <span>합:{sum}</span>
                  <span>(홀{oddCount}:짝{6 - oddCount})</span>
                  <button
                    onClick={() => handleRerollSingle(index)}
                    className="p-1 text-slate-400 hover:text-amber-600 rounded hover:bg-amber-100 transition cursor-pointer print:hidden"
                    title="이 게임만 다시 생성"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ticket Bottom Barcode Graphic */}
        <div className="bg-amber-100/70 border-t-2 border-dashed border-amber-300/80 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Simulated Barcode */}
            <div className="flex items-end h-8 gap-[2px]">
              {Array.from({ length: 42 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-800"
                  style={{
                    width: i % 3 === 0 ? '3px' : '1.5px',
                    height: `${18 + (i % 5) * 2.5}px`,
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-slate-500 tracking-wider">
              TR-9481-7729-002
            </span>
          </div>

          <div className="text-[11px] text-slate-600 text-center sm:text-right font-medium">
            🍀 당첨을 진심으로 축하드립니다
          </div>
        </div>
      </div>

      {/* Slip Action Buttons */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 print:hidden">
        <button
          onClick={handleSaveAll}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
            savedAll
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
          }`}
        >
          {savedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4 text-amber-400" />}
          {savedAll ? '전체 저장 완료!' : `${games.length}게임 보관함 저장`}
        </button>

        <button
          onClick={handleCopySlip}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
          {copied ? '복권 내용 복사 완료!' : '용지 내용 텍스트 복사'}
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-400" />
          용지 인쇄하기
        </button>
      </div>
    </div>
  );
};
