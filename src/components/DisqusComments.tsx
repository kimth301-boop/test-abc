import React, { useEffect, useState } from 'react';
import { MessageSquare, Settings, Sparkles, RefreshCw } from 'lucide-react';

interface DisqusCommentsProps {
  defaultShortname?: string;
}

declare global {
  interface Window {
    DISQUS?: {
      reset: (options: { reload: boolean; config: () => void }) => void;
    };
    disqus_config?: () => void;
  }
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({
  defaultShortname = 'lotto645-golden',
}) => {
  const [shortname, setShortname] = useState<string>(() => {
    try {
      return localStorage.getItem('disqus_shortname') || defaultShortname;
    } catch {
      return defaultShortname;
    }
  });

  const [isEditingShortname, setIsEditingShortname] = useState(false);
  const [tempShortname, setTempShortname] = useState(shortname);

  useEffect(() => {
    // Inject or reset Disqus embed script
    const loadDisqus = () => {
      window.disqus_config = function (this: any) {
        this.page.url = window.location.href;
        this.page.identifier = 'lotto-645-golden-board';
        this.language = 'ko';
      };

      if (window.DISQUS) {
        window.DISQUS.reset({
          reload: true,
          config: function (this: any) {
            this.page.url = window.location.href;
            this.page.identifier = 'lotto-645-golden-board';
            this.language = 'ko';
          },
        });
      } else {
        const d = document;
        const existingScript = document.getElementById('disqus-embed-script');
        if (existingScript) existingScript.remove();

        const s = d.createElement('script');
        s.id = 'disqus-embed-script';
        s.src = `https://${shortname}.disqus.com/embed.js`;
        s.setAttribute('data-timestamp', String(+new Date()));
        (d.head || d.body).appendChild(s);
      }
    };

    loadDisqus();
  }, [shortname]);

  const handleSaveShortname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempShortname.trim()) return;
    const clean = tempShortname.trim().toLowerCase();
    setShortname(clean);
    try {
      localStorage.setItem('disqus_shortname', clean);
    } catch {
      // ignore
    }
    setIsEditingShortname(false);
  };

  return (
    <section className="w-full max-w-4xl mx-auto my-10 px-2 sm:px-0">
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-8 shadow-2xl">
        {/* Board Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                행운의 댓글 & 당첨 기원 게시판
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              이번 주 1등 대박 기원, 행운의 번호 공유 및 추첨 소감을 자유롭게 남겨보세요!
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setIsEditingShortname(!isEditingShortname)}
              className="text-[11px] text-slate-400 hover:text-amber-400 bg-slate-800 hover:bg-slate-700/80 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 transition cursor-pointer"
              title="Disqus Shortname 설정"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>숏네임 변경</span>
            </button>
          </div>
        </div>

        {/* Shortname editor (Optional for owner) */}
        {isEditingShortname && (
          <form
            onSubmit={handleSaveShortname}
            className="my-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row items-center gap-3 animate-fade-in"
          >
            <div className="flex-1 w-full">
              <label className="text-slate-300 font-semibold block mb-1">
                Disqus 사이트 Shortname (현재: <span className="text-amber-400 font-mono">{shortname}</span>)
              </label>
              <input
                type="text"
                value={tempShortname}
                onChange={(e) => setTempShortname(e.target.value)}
                placeholder="예: lotto645-golden 또는 본인의 Disqus shortname"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white outline-hidden focus:border-amber-400"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto mt-2 sm:mt-5">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg transition cursor-pointer"
              >
                적용
              </button>
              <button
                type="button"
                onClick={() => setIsEditingShortname(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition cursor-pointer"
              >
                취소
              </button>
            </div>
          </form>
        )}

        {/* Disqus Embed Container */}
        <div className="mt-6 min-h-[220px]">
          <div id="disqus_thread" className="w-full" />
          <noscript>
            <p className="text-xs text-slate-400 text-center py-6">
              댓글을 보거나 작성하시려면 자바스크립트(JavaScript)를 활성화해 주세요.{' '}
              <a href="https://disqus.com/?ref_noscript" className="text-amber-400 underline">
                Disqus 제공 댓글 시스템
              </a>
            </p>
          </noscript>
        </div>
      </div>
    </section>
  );
};
