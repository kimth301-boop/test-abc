import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Bookmark,
  Clock,
  Dice5,
  SlidersHorizontal,
  Moon,
  BarChart3,
  Award,
  ShieldCheck,
  Share2,
  Mail,
} from 'lucide-react';
import { MachineDrawer } from './components/MachineDrawer';
import { SlipGenerator } from './components/SlipGenerator';
import { FilterGenerator } from './components/FilterGenerator';
import { FortuneDreamPicker } from './components/FortuneDreamPicker';
import { StatsAnalyzer } from './components/StatsAnalyzer';
import { WinningSimulator } from './components/WinningSimulator';
import { SavedNumbersDrawer } from './components/SavedNumbersDrawer';
import { PartnershipModal } from './components/PartnershipModal';
import { LottoGame } from './types/lotto';
import { soundManager } from './utils/audio';

type TabType = 'machine' | 'slip' | 'filter' | 'fortune' | 'stats' | 'simulator';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('machine');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);
  const [isPartnershipOpen, setIsPartnershipOpen] = useState<boolean>(false);
  const [savedGames, setSavedGames] = useState<LottoGame[]>(() => {
    try {
      const stored = localStorage.getItem('lotto_saved_games');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  // Countdown to Saturday 20:35 KST (Korea Standard Time)
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Target next Saturday 20:35
      const target = new Date(now);
      const day = now.getDay();
      let diffDays = (6 - day + 7) % 7;
      if (diffDays === 0 && (now.getHours() > 20 || (now.getHours() === 20 && now.getMinutes() >= 35))) {
        diffDays = 7;
      }
      target.setDate(now.getDate() + diffDays);
      target.setHours(20, 35, 0, 0);

      const diff = target.getTime() - now.getTime();
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setCountdown(`${d}일 ${h.toString().padStart(2, '0')}시간 ${m.toString().padStart(2, '0')}분 ${s.toString().padStart(2, '0')}초`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save games to localStorage
  const handleSaveGame = (game: LottoGame) => {
    setSavedGames((prev) => {
      const updated = [game, ...prev.filter((g) => g.id !== game.id)];
      try {
        localStorage.setItem('lotto_saved_games', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleSaveMultipleGames = (games: LottoGame[]) => {
    setSavedGames((prev) => {
      const updated = [...games, ...prev];
      try {
        localStorage.setItem('lotto_saved_games', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleDeleteGame = (id: string) => {
    soundManager.playClick();
    setSavedGames((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      try {
        localStorage.setItem('lotto_saved_games', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearAllSaved = () => {
    soundManager.playClick();
    setSavedGames([]);
    try {
      localStorage.removeItem('lotto_saved_games');
    } catch {
      // ignore
    }
  };

  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundManager.setMuted(nextState);
    if (!nextState) {
      soundManager.playClick();
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'machine', label: '실시간 볼 추첨기', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'slip', label: '5게임 복권 슬립', icon: <Dice5 className="w-4 h-4 text-sky-400" /> },
    { id: 'filter', label: '맞춤 필터 (고정/제외)', icon: <SlidersHorizontal className="w-4 h-4 text-emerald-400" /> },
    { id: 'fortune', label: '꿈 해몽 & 사주운세', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
    { id: 'stats', label: '역대 통계 분석실', icon: <BarChart3 className="w-4 h-4 text-rose-400" /> },
    { id: 'simulator', label: '당첨확인 & 시뮬레이터', icon: <Award className="w-4 h-4 text-amber-300" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-amber-500/20 shadow-lg">
        {/* Sub Header Notice Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 py-1 px-4 text-center text-xs font-bold flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>이번 주 토요일 20:35 추첨까지 남은 시간: </span>
          <span className="font-mono font-black text-slate-900 bg-amber-300/80 px-2 py-0.2 rounded">
            {countdown}
          </span>
        </div>

        {/* Main Nav Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 text-slate-950 shadow-md shadow-amber-500/30">
              <span className="text-xl font-black font-mono">6/45</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                  황금 행운 로또 추첨기
                </h1>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                실감나는 볼 회전 추첨 엔진 & 5게임 용지 & 통계 필터링 시스템
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Partnership Inquiry Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                setIsPartnershipOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition cursor-pointer"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>제휴문의</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleMute}
              className="p-2 text-slate-300 hover:text-amber-400 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition cursor-pointer"
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Saved Drawer Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                setIsSavedDrawerOpen(true);
              }}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">보관함</span>
              {savedGames.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {savedGames.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-900">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveTab(tab.id);
                  }}
                  className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        {activeTab === 'machine' && (
          <MachineDrawer
            onSaveGame={handleSaveGame}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {activeTab === 'slip' && (
          <SlipGenerator onSaveGames={handleSaveMultipleGames} />
        )}

        {activeTab === 'filter' && (
          <FilterGenerator onSaveGame={handleSaveGame} />
        )}

        {activeTab === 'fortune' && (
          <FortuneDreamPicker onSaveGame={handleSaveGame} />
        )}

        {activeTab === 'stats' && (
          <StatsAnalyzer onSaveGame={handleSaveGame} />
        )}

        {activeTab === 'simulator' && (
          <WinningSimulator savedGames={savedGames} />
        )}
      </main>

      {/* Saved Numbers Drawer Modal */}
      <SavedNumbersDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedGames={savedGames}
        onDeleteGame={handleDeleteGame}
        onClearAll={handleClearAllSaved}
      />

      {/* Business Partnership Inquiry Modal */}
      <PartnershipModal
        isOpen={isPartnershipOpen}
        onClose={() => setIsPartnershipOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              대한민국 공식 로또 6/45 규칙 준수
            </span>
            <span>•</span>
            <span>만 19세 이상 이용 가능</span>
            <span>•</span>
            <span>1등 당첨확률: 1 / 8,145,060</span>
            <span>•</span>
            <button
              onClick={() => {
                soundManager.playClick();
                setIsPartnershipOpen(true);
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 transition cursor-pointer"
            >
              광고 및 제휴문의
            </button>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            본 사이트에서 제공하는 번호는 난수 생성 알고리즘과 통계적 모델링을 통해 생성된 번호이며, 당첨을 100% 보장하지 않습니다. 복권은 소액으로 즐기는 건전한 여가 문화입니다.
          </p>

          <p className="text-[10px] text-slate-700">
            © 2026 로또 6/45 황금 행운 번호 추첨기. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
