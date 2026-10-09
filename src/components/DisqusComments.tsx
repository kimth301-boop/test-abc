import React, { useEffect } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    DISQUS?: {
      reset: (options: { reload: boolean; config: () => void }) => void;
    };
    disqus_config?: () => void;
  }
}

export const DisqusComments: React.FC = () => {
  const shortname = 'test-abc-e2h';

  useEffect(() => {
    // Set Disqus configuration variables
    window.disqus_config = function (this: any) {
      this.page.url = 'https://test-abc-e2h.pages.dev/';
      this.page.identifier = 'test-abc-e2h-lotto-main';
      this.language = 'ko';
    };

    if (window.DISQUS) {
      // Reload DISQUS if already initialized
      window.DISQUS.reset({
        reload: true,
        config: function (this: any) {
          this.page.url = 'https://test-abc-e2h.pages.dev/';
          this.page.identifier = 'test-abc-e2h-lotto-main';
          this.language = 'ko';
        },
      });
    } else {
      // Load Disqus script
      const existingScript = document.getElementById('disqus-embed-script');
      if (existingScript) existingScript.remove();

      const d = document;
      const s = d.createElement('script');
      s.id = 'disqus-embed-script';
      s.src = `https://${shortname}.disqus.com/embed.js`;
      s.setAttribute('data-timestamp', String(+new Date()));
      (d.head || d.body).appendChild(s);
    }
  }, []);

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

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full self-start sm:self-auto font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Disqus 실시간 연동됨</span>
          </div>
        </div>

        {/* Disqus Embed Container */}
        <div className="mt-6 min-h-[260px]">
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
