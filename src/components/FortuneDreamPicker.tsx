import React, { useState } from 'react';
import { Sparkles, Moon, Sun, Bookmark, Check, Calendar, Heart } from 'lucide-react';
import { LottoBall } from './LottoBall';
import { DREAM_KEYWORDS, generateBirthdayFortuneLotto } from '../utils/lottoGenerator';
import { LottoGame } from '../types/lotto';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface FortuneDreamPickerProps {
  onSaveGame: (game: LottoGame) => void;
}

export const FortuneDreamPicker: React.FC<FortuneDreamPickerProps> = ({ onSaveGame }) => {
  const [activeTab, setActiveTab] = useState<'dream' | 'fortune'>('dream');

  // Dream tab state
  const [selectedDream, setSelectedDream] = useState<(typeof DREAM_KEYWORDS)[0]>(DREAM_KEYWORDS[0]);
  const [dreamSaved, setDreamSaved] = useState(false);

  // Birthday fortune state
  const [birthdate, setBirthdate] = useState('1995-07-20');
  const [nickname, setNickname] = useState('행운의주인공');
  const [fortuneResult, setFortuneResult] = useState<{
    numbers: number[];
    score: number;
    quote: string;
  } | null>(null);
  const [fortuneSaved, setFortuneSaved] = useState(false);

  // Select Dream
  const handleSelectDream = (dream: (typeof DREAM_KEYWORDS)[0]) => {
    soundManager.playClick();
    setSelectedDream(dream);
    setDreamSaved(false);
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.7 },
    });
  };

  // Generate Fortune
  const handleGenerateFortune = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    const nums = generateBirthdayFortuneLotto(birthdate, nickname);
    const score = 88 + Math.floor(Math.random() * 12); // 88 ~ 99%
    const quotes = [
      '오늘 당신의 재물궁에 서기가 가득합니다. 황금빛 기운이 스며드는 날!',
      '조상님의 음덕과 천운이 맞물리는 길일입니다. 주저 없이 도전해보세요.',
      '뜻밖의 횡재수와 인연이 닿아 있는 날! 긍정의 마인드가 큰 행운을 부릅니다.',
      '동쪽 방향에서 길한 서기가 들어오며 복권 당첨의 운이 크게 상승합니다.',
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    setFortuneResult({
      numbers: nums,
      score,
      quote,
    });
    setFortuneSaved(false);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.65 },
    });
  };

  const handleSaveDreamGame = () => {
    soundManager.playClick();
    const game: LottoGame = {
      id: `dream-${Date.now()}`,
      numbers: selectedDream.numbers,
      type: '꿈해몽',
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      note: `${selectedDream.emoji} ${selectedDream.keyword} 꿈 해몽`,
    };
    onSaveGame(game);
    setDreamSaved(true);
  };

  const handleSaveFortuneGame = () => {
    if (!fortuneResult) return;
    soundManager.playClick();
    const game: LottoGame = {
      id: `fortune-${Date.now()}`,
      numbers: fortuneResult.numbers,
      type: '행운운세',
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      note: `생년월일(${birthdate}) 오늘의 행운 지수 ${fortuneResult.score}%`,
    };
    onSaveGame(game);
    setFortuneSaved(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Sub tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-2xl bg-slate-900 p-1.5 border border-slate-800 shadow-xl">
          <button
            onClick={() => {
              setActiveTab('dream');
              soundManager.playClick();
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'dream'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4" /> 길몽 & 꿈 해몽 번호
          </button>
          <button
            onClick={() => {
              setActiveTab('fortune');
              soundManager.playClick();
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'fortune'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4" /> 사주 & 오늘 재물운 번호
          </button>
        </div>
      </div>

      {/* DREAM INTERPRETATION TAB */}
      {activeTab === 'dream' && (
        <div className="flex flex-col gap-6">
          {/* Selected Dream Showcase */}
          <div className="bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl sm:text-5xl">{selectedDream.emoji}</span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-300">
                    {selectedDream.keyword} 꿈 해몽 번호
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {selectedDream.meaning}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveDreamGame}
                className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                  dreamSaved
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                }`}
              >
                {dreamSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4 fill-slate-950" />}
                {dreamSaved ? '보관함에 저장됨' : '이 번호 저장'}
              </button>
            </div>

            {/* Balls Display */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              {selectedDream.numbers.map((num) => (
                <LottoBall key={num} num={num} size="lg" />
              ))}
            </div>
          </div>

          {/* Dream Keyword Cards Grid */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl">
            <h4 className="text-xs sm:text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
              어젯밤 꾼 꿈을 선택해보세요 (12대 복권 길몽)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {DREAM_KEYWORDS.map((dream) => {
                const isSelected = selectedDream.keyword === dream.keyword;
                return (
                  <button
                    key={dream.keyword}
                    onClick={() => handleSelectDream(dream)}
                    className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10 scale-102'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-3xl mb-1.5">{dream.emoji}</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                      {dream.keyword}
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                      {dream.meaning}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BIRTHDAY FORTUNE TAB */}
      {activeTab === 'fortune' && (
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
            <div className="text-center max-w-md mx-auto mb-6">
              <h3 className="text-lg sm:text-xl font-black text-amber-300 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> 사주 생년월일 맞춤 재물운 번호
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                태어난 날짜의 오행 기운과 오늘의 천간지지 운세를 조합하여 고유한 행운수를 산출합니다.
              </p>
            </div>

            <form onSubmit={handleGenerateFortune} className="max-w-md mx-auto flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  생년월일 (양력 기준)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-amber-400 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  이름 또는 행운의 닉네임
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="예: 행운의주인공"
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-amber-400 outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full py-3.5 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-98 transition shadow-lg shadow-amber-500/25 cursor-pointer"
              >
                오늘의 행운 번호 풀이하기
              </button>
            </form>

            {/* Fortune Result Display */}
            {fortuneResult && (
              <div className="mt-8 pt-6 border-t border-slate-800 animate-scale-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold border border-amber-500/30">
                      오늘의 재물운 지수: {fortuneResult.score}점
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date().toLocaleDateString('ko-KR')}
                    </span>
                  </div>

                  <button
                    onClick={handleSaveFortuneGame}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      fortuneSaved
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {fortuneSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-amber-400" />}
                    {fortuneSaved ? '보관함에 저장됨' : '보관함에 저장'}
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 mb-5 text-center">
                  <p className="text-xs sm:text-sm font-semibold text-amber-200">
                    "{fortuneResult.quote}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  {fortuneResult.numbers.map((num) => (
                    <LottoBall key={num} num={num} size="lg" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
