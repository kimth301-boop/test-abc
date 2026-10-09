import React, { useState } from 'react';
import { Mail, Send, X, CheckCircle2, AlertCircle, Building2, Phone, MessageSquare, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnershipModal: React.FC<PartnershipModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '광고 및 배너 제휴',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('https://formspree.io/f/xoejwaqr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          '담당자/기업명': formData.name,
          '이메일': formData.email,
          '연락처': formData.phone,
          '제휴 유형': formData.inquiryType,
          '문의 내용': formData.message,
          _subject: `[로또 추첨기 제휴문의] ${formData.name}님의 ${formData.inquiryType}`,
        }),
      });

      if (response.ok) {
        setStatus('success');
        soundManager.playFanfare();
      } else {
        const data = await response.json().catch(() => ({}));
        setStatus('error');
        setErrorMessage(data.error || '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.');
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      inquiryType: '광고 및 배너 제휴',
      message: '',
    });
    setStatus('idle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                비즈니스 & 제휴 문의
              </h3>
              <p className="text-[11px] text-slate-400">
                광고, 마케팅 협업, 콘텐츠 및 서비스 제휴 문의를 남겨주세요.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-lg font-black text-white mb-1.5">
                문의가 정상적으로 전송되었습니다!
              </h4>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed mb-6">
                남겨주신 내용을 확인한 후 담당자가 빠른 시일 내에 기재해주신 이메일(<strong>{formData.email}</strong>)로 회신드리겠습니다.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
                >
                  추가 문의 작성
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Phone in 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" /> 기업명 / 담당자명 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="예: (주)골든파트너스 홍길동"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> 연락처
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="예: 010-1234-5678"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-hidden transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-amber-400" /> 회신받을 이메일 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="예: contact@company.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-hidden transition"
                />
              </div>

              {/* Inquiry Type */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  제휴 유형 <span className="text-rose-400">*</span>
                </label>
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-hidden transition"
                >
                  <option value="광고 및 배너 제휴">배너 및 스폰서십 광고 제휴</option>
                  <option value="공동 프로모션 및 이벤트">공동 프로모션 및 이벤트 제휴</option>
                  <option value="콘텐츠 및 데이터 제휴">로또 통계 / 데이터 제휴</option>
                  <option value="서비스 기능 제휴">비즈니스 연동 및 기능 제휴</option>
                  <option value="기타 제휴 문의">기타 일반 제휴 문의</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> 문의 및 제안 내용 <span className="text-rose-400">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="제휴 제안 내용, 희망 일정, 세부 사항 등을 자유롭게 적어주세요."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-hidden transition resize-none"
                />
              </div>

              {status === 'error' && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 transition shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 fill-slate-950" />
                {status === 'submitting' ? '문의 전송 중...' : '제휴 문의 접수하기'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950/80 border-t border-slate-800/80 px-6 py-3 text-center">
          <p className="text-[10px] text-slate-500">
            Formspree 보안 암호화 전송 시스템을 통해 안전하게 담당자에게 직접 전달됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
