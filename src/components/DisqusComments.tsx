import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Trash2,
  Sparkles,
  Lock,
  User,
  Heart,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { LottoBall } from './LottoBall';
import { soundManager } from '../utils/audio';

export interface CommentItem {
  id: string;
  author: string;
  password?: string;
  content: string;
  emoji: string;
  attachedNumbers?: number[];
  likes: number;
  createdAt: string;
}

const SEED_COMMENTS: CommentItem[] = [
  {
    id: 'seed-1',
    author: '대박꿈나무',
    content: '이번 주 토요일 1등은 바로 저입니다! 모두 기운 받아가세요 🙏🍀',
    emoji: '🍀',
    attachedNumbers: [3, 12, 24, 31, 38, 45],
    likes: 18,
    createdAt: '방금 전',
  },
  {
    id: 'seed-2',
    author: '황금돼지',
    content: '어젯밤에 돼지꿈 꾸고 여기서 번호 뽑아서 5게임 샀습니다. 이번 주 느낌이 너무 좋네요!',
    emoji: '🐷',
    attachedNumbers: [7, 16, 22, 29, 37, 42],
    likes: 12,
    createdAt: '15분 전',
  },
  {
    id: 'seed-3',
    author: '인생역전가즈아',
    content: '볼 회전 애니메이션 진짜 복권기계 같고 재미있네요 ㅎㅎ 1등 명당 기운 팍팍 받아갑니다~',
    emoji: '💰',
    likes: 9,
    createdAt: '1시간 전',
  },
  {
    id: 'seed-4',
    author: '로또매니아',
    content: '통계 분석 보니까 34번이랑 18번 진짜 자주 나오네요. 필터링으로 고정수 넣고 돌렸습니다.',
    emoji: '🎯',
    attachedNumbers: [1, 9, 18, 27, 34, 40],
    likes: 15,
    createdAt: '3시간 전',
  },
];

export const DisqusComments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'native' | 'disqus'>('native');

  // Native comment board state
  const [comments, setComments] = useState<CommentItem[]>(() => {
    try {
      const stored = localStorage.getItem('lotto_comments_list');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return SEED_COMMENTS;
  });

  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🍀');
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState(false);

  // Save to localStorage whenever comments change
  const saveComments = (newComments: CommentItem[]) => {
    setComments(newComments);
    try {
      localStorage.setItem('lotto_comments_list', JSON.stringify(newComments));
    } catch {
      // ignore
    }
  };

  // Submit comment
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    soundManager.playClick();
    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      author: author.trim(),
      password: password.trim() || '1234',
      content: content.trim(),
      emoji: selectedEmoji,
      likes: 0,
      createdAt: '방금 전',
    };

    saveComments([newComment, ...comments]);
    setAuthor('');
    setPassword('');
    setContent('');
  };

  // Like comment
  const handleLike = (id: string) => {
    if (likedIds.includes(id)) return;
    soundManager.playClick();
    setLikedIds([...likedIds, id]);
    const updated = comments.map((c) =>
      c.id === id ? { ...c, likes: c.likes + 1 } : c
    );
    saveComments(updated);
  };

  // Delete comment
  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId) return;

    const target = comments.find((c) => c.id === deleteId);
    if (!target) return;

    if (target.password && target.password !== deletePassword) {
      setDeleteError(true);
      return;
    }

    soundManager.playClick();
    const updated = comments.filter((c) => c.id !== deleteId);
    saveComments(updated);
    setDeleteId(null);
    setDeletePassword('');
    setDeleteError(false);
  };

  // Load Disqus when switched to disqus tab
  useEffect(() => {
    if (activeTab === 'disqus') {
      const win = window as any;
      win.disqus_config = function (this: any) {
        this.page.url = 'https://test-abc-e2h.pages.dev/';
        this.page.identifier = 'test-abc-e2h-lotto-main';
        this.language = 'ko';
      };

      if (win.DISQUS) {
        win.DISQUS.reset({
          reload: true,
          config: function (this: any) {
            this.page.url = 'https://test-abc-e2h.pages.dev/';
            this.page.identifier = 'test-abc-e2h-lotto-main';
            this.language = 'ko';
          },
        });
      } else {
        const existingScript = document.getElementById('disqus-embed-script');
        if (existingScript) existingScript.remove();

        const d = document;
        const s = d.createElement('script');
        s.id = 'disqus-embed-script';
        s.src = 'https://test-abc-e2h.disqus.com/embed.js';
        s.setAttribute('data-timestamp', String(+new Date()));
        (d.head || d.body).appendChild(s);
      }
    }
  }, [activeTab]);

  return (
    <section className="w-full max-w-4xl mx-auto my-10 px-2 sm:px-0">
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-8 shadow-2xl">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                행운의 당첨 기원 댓글 & 방명록
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              이번 주 1등 당첨 기원 한마디와 행운의 번호 후기를 자유롭게 남겨보세요!
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('native');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'native'
                  ? 'bg-amber-400 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>간편 방명록 (로그인 불필요)</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('disqus');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'disqus'
                  ? 'bg-amber-400 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Disqus 댓글</span>
            </button>
          </div>
        </div>

        {/* TAB 1: NATIVE INSTANT COMMENT FORM & LIST */}
        {activeTab === 'native' && (
          <div className="mt-6 space-y-6 animate-fade-in">
            {/* Input Form Box */}
            <form
              onSubmit={handleSubmit}
              className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-inner"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-slate-300">
                  ✏️ 당첨 기원 글 남기기
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  회원가입 없이 즉시 작성
                </span>
              </div>

              {/* Author & Password in row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div className="sm:col-span-1">
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="닉네임 (예: 1등당첨자)"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-hidden transition"
                    />
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호 4자리 (삭제용)"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-hidden transition"
                    />
                  </div>
                </div>

                {/* Emoji Sticker Select */}
                <div className="sm:col-span-1 flex items-center gap-1.5 overflow-x-auto py-1">
                  {['🍀', '🙏', '🐷', '💰', '🎯', '🔥', '🐉'].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setSelectedEmoji(emo)}
                      className={`text-lg p-1 rounded-lg transition cursor-pointer ${
                        selectedEmoji === emo
                          ? 'bg-amber-400/20 border border-amber-400 scale-110'
                          : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="relative mb-3">
                <textarea
                  required
                  rows={2}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="이번 주 꼭 1등 되게 해주세요! 모두 대박 나시고 행복한 한 주 되세요~"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl p-3 text-xs text-white placeholder-slate-600 outline-hidden transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  매너 있는 댓글 문화를 지켜주세요 🌸
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 fill-slate-950" />
                  댓글 등록
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 flex items-center justify-between">
                <span>등록된 응원 댓글 ({comments.length}개)</span>
                <span className="text-[10px] text-slate-500">최신순 정렬</span>
              </h3>

              {comments.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700/80 transition flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.emoji}</span>
                      <strong className="text-xs text-white font-bold">
                        {item.author}
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        {item.createdAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Like button */}
                      <button
                        onClick={() => handleLike(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                          likedIds.includes(item.id)
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                            : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                        }`}
                      >
                        <Heart
                          className={`w-3 h-3 ${
                            likedIds.includes(item.id) ? 'fill-rose-400 text-rose-400' : ''
                          }`}
                        />
                        <span>{item.likes}</span>
                      </button>

                      {/* Delete trigger */}
                      <button
                        onClick={() => {
                          setDeleteId(item.id);
                          setDeleteError(false);
                          setDeletePassword('');
                        }}
                        className="text-slate-600 hover:text-rose-400 p-1 transition cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs text-slate-300 leading-relaxed pl-7">
                    {item.content}
                  </p>

                  {/* Attached Lotto Numbers if any */}
                  {item.attachedNumbers && (
                    <div className="pl-7 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                        추천조합:
                      </span>
                      {item.attachedNumbers.map((num) => (
                        <LottoBall key={num} num={num} size="sm" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Delete Modal */}
            {deleteId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
                <form
                  onSubmit={handleDeleteSubmit}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center"
                >
                  <h4 className="text-sm font-bold text-white mb-2">댓글 삭제</h4>
                  <p className="text-xs text-slate-400 mb-3">
                    작성 시 입력했던 비밀번호 4자리를 입력해 주세요.
                  </p>

                  <input
                    type="password"
                    required
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="비밀번호 입력"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white mb-3 text-center outline-hidden"
                  />

                  {deleteError && (
                    <p className="text-rose-400 text-[11px] mb-2 font-semibold">
                      비밀번호가 일치하지 않습니다.
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      삭제하기
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(null)}
                      className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DISQUS EMBED */}
        {activeTab === 'disqus' && (
          <div className="mt-6 min-h-[260px] animate-fade-in">
            <div id="disqus_thread" className="w-full" />
            <noscript>
              <p className="text-xs text-slate-400 text-center py-6">
                댓글을 보거나 작성하시려면 자바스크립트를 활성화해 주세요.{' '}
                <a href="https://disqus.com/?ref_noscript" className="text-amber-400 underline">
                  Disqus 제공 댓글 시스템
                </a>
              </p>
            </noscript>
          </div>
        )}
      </div>
    </section>
  );
};
