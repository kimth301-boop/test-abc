import React, { useState } from 'react';
import { Bookmark, Trash2, Copy, Check, X, Printer, Share2, Sparkles } from 'lucide-react';
import { LottoBall } from './LottoBall';
import { LottoGame } from '../types/lotto';
import { soundManager } from '../utils/audio';

interface SavedNumbersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedGames: LottoGame[];
  onDeleteGame: (id: string) => void;
  onClearAll: () => void;
}

export const SavedNumbersDrawer: React.FC<SavedNumbersDrawerProps> = ({
  isOpen,
  onClose,
  savedGames,
  onDeleteGame,
  onClearAll,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const handleCopySingle = (game: LottoGame) => {
    soundManager.playClick();
    const text = `[로또 6/45] ${game.numbers.join(', ')}${game.bonus ? ` + 보너스 ${game.bonus}` : ''} (${game.type})`;
    navigator.clipboard.writeText(text);
    setCopiedId(game.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    soundManager.playClick();
    const text = savedGames
      .map(
        (g, i) =>
          `[${i + 1}] ${g.type}: ${g.numbers.join(', ')}${g.bonus ? ` + ${g.bonus}` : ''} (${g.note || ''})`
      )
      .join('\n');
    navigator.clipboard.writeText(`=== 나의 로또 보관함 (${savedGames.length}게임) ===\n${text}`);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-slate-100">
              나의 로또 번호 보관함 ({savedGames.length}게임)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {savedGames.length > 0 && (
              <>
                <button
                  onClick={handleCopyAll}
                  className="text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                  title="전체 복사"
                >
                  {copiedAll ? '복사됨!' : '전체 복사'}
                </button>
                <button
                  onClick={handlePrint}
                  className="text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                  title="인쇄"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClearAll}
                  className="text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 px-2.5 py-1.5 rounded-lg border border-rose-900 transition cursor-pointer"
                  title="모두 비우기"
                >
                  비우기
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body list */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {savedGames.length === 0 ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <Bookmark className="w-12 h-12 text-slate-700 mb-3 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-400">보관된 번호가 없습니다</p>
              <p className="text-xs text-slate-600 mt-1">
                추첨기 또는 5게임 슬립에서 마음에 드는 번호를 보관해 보세요!
              </p>
            </div>
          ) : (
            savedGames.map((game, index) => (
              <div
                key={game.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 gap-3 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded bg-amber-400/20 text-amber-400 text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                      {game.type}
                    </span>
                    {game.note && (
                      <span className="text-[11px] text-amber-400/90 font-medium">
                        {game.note}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    저장: {game.createdAt}
                  </span>
                </div>

                {/* Balls */}
                <div className="flex items-center gap-1.5 justify-center">
                  {game.numbers.map((n) => (
                    <LottoBall key={n} num={n} size="sm" />
                  ))}
                  {game.bonus && (
                    <>
                      <span className="text-amber-400 font-bold text-xs">+</span>
                      <LottoBall num={game.bonus} size="sm" isBonus />
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    onClick={() => handleCopySingle(game)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg hover:bg-slate-700 transition cursor-pointer"
                    title="복사"
                  >
                    {copiedId === game.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteGame(game.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/60 rounded-lg hover:bg-rose-950/40 transition cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            브라우저 로컬 저장소에 안전하게 보관됩니다. 복권 구매 시 참고용으로 활용하세요.
          </p>
        </div>
      </div>
    </div>
  );
};
