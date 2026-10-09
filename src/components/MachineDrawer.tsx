import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Zap, Bookmark, Copy, Check, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { LottoBall } from './LottoBall';
import { generateRandomLotto, getBallColor } from '../utils/lottoGenerator';
import { soundManager } from '../utils/audio';
import { LottoGame } from '../types/lotto';

interface BallParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  num: number;
}

interface MachineDrawerProps {
  onSaveGame?: (game: LottoGame) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MachineDrawer: React.FC<MachineDrawerProps> = ({
  onSaveGame,
  isMuted,
  onToggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [includeBonus, setIncludeBonus] = useState(true);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [bonusNumber, setBonusNumber] = useState<number | null>(null);
  const [currentAnnounce, setCurrentAnnounce] = useState<string>('행운의 추첨 준비 완료! 아래 추첨 버튼을 눌러주세요.');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Store pre-picked lottery outcome when draw starts
  const targetNumbersRef = useRef<{ numbers: number[]; bonus?: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<BallParticle[]>([]);
  const blowerSpeedRef = useRef<number>(0.2);

  // Initialize 45 balls in the canvas dome
  useEffect(() => {
    const particles: BallParticle[] = [];
    const width = 300;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 1; i <= 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 80;
      particles.push({
        id: i,
        num: i,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + 30 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 11,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastRollSound = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const domeRadius = 135;

      // Draw globe interior background
      const grad = ctx.createRadialGradient(
        centerX - 30,
        centerY - 30,
        20,
        centerX,
        centerY,
        domeRadius
      );
      grad.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
      grad.addColorStop(0.7, 'rgba(15, 23, 42, 0.8)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, domeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Air blower vortex forces
      const targetSpeed = isDrawing ? 4.8 : 0.4;
      blowerSpeedRef.current += (targetSpeed - blowerSpeedRef.current) * 0.05;
      const speedFactor = blowerSpeedRef.current;

      const particles = particlesRef.current;

      // Sound effects during aggressive mixing
      if (isDrawing && time - lastRollSound > 220) {
        soundManager.playBallRoll();
        lastRollSound = time;
      }

      // Update and draw particles
      particles.forEach((p) => {
        // Gravity & Air vortex
        if (isDrawing) {
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.hypot(dx, dy) || 1;

          // Tangential swirl
          p.vx += (-dy / dist) * speedFactor * 0.8 + (Math.random() - 0.5) * 2;
          p.vy += (dx / dist) * speedFactor * 0.8 - 0.6 + (Math.random() - 0.5) * 2;
        } else {
          // Gentle idle drift & mild gravity
          p.vy += 0.08;
          p.vx *= 0.98;
          p.vy *= 0.98;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Spherical boundary collision
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const dist = Math.hypot(dx, dy);

        if (dist + p.radius > domeRadius) {
          const normalX = dx / dist;
          const normalY = dy / dist;

          // Reposition to boundary
          p.x = centerX + normalX * (domeRadius - p.radius);
          p.y = centerY + normalY * (domeRadius - p.radius);

          // Reflect velocity
          const dot = p.vx * normalX + p.vy * normalY;
          p.vx = (p.vx - 2 * dot * normalX) * 0.75;
          p.vy = (p.vy - 2 * dot * normalY) * 0.75;
        }

        // Color coding for ball
        let ballFill = '#eab308';
        if (p.num <= 10) ballFill = '#f59e0b';
        else if (p.num <= 20) ballFill = '#3b82f6';
        else if (p.num <= 30) ballFill = '#ef4444';
        else if (p.num <= 40) ballFill = '#64748b';
        else ballFill = '#10b981';

        // Draw 3D ball
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = ballFill;
        ctx.fill();

        // Ball specular highlight
        const ballGrad = ctx.createRadialGradient(
          p.x - p.radius * 0.35,
          p.y - p.radius * 0.35,
          1,
          p.x,
          p.y,
          p.radius
        );
        ballGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        ballGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        ballGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ball number text
        ctx.fillStyle = p.num <= 10 ? '#451a03' : '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.num.toString(), p.x, p.y + 0.5);

        ctx.restore();
      });

      // Acrylic glass reflections & glow border
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, domeRadius, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.stroke();

      // Glass specular curve
      ctx.beginPath();
      ctx.ellipse(centerX - 35, centerY - 45, 65, 35, -Math.PI / 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fill();

      // Inner air intake bottom grill
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 115, 45, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDrawing]);

  // Start animated step-by-step draw
  const handleStartDraw = () => {
    if (isDrawing) return;
    soundManager.playClick();
    setDrawnNumbers([]);
    setBonusNumber(null);
    setSaved(false);
    setIsDrawing(true);
    setCurrentAnnounce('🌀 강력한 에어 회오리가 공을 뒤섞고 있습니다...');

    const result = generateRandomLotto(includeBonus);
    targetNumbersRef.current = {
      numbers: result.numbers,
      bonus: result.bonusNumber,
    };

    const targetList = [...result.numbers];
    const targetBonus = result.bonusNumber;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step <= 6) {
        const nextNum = targetList[step - 1];
        setDrawnNumbers((prev) => [...prev, nextNum]);
        soundManager.playBallDrop(step);
        setCurrentAnnounce(`🎯 제 ${step}구 [${nextNum}번] 추첨 완료!`);
      } else if (step === 7 && includeBonus && targetBonus) {
        setBonusNumber(targetBonus);
        soundManager.playBallDrop(7);
        setCurrentAnnounce(`⭐ 보너스 번호 [${targetBonus}번] 추첨 완료!`);
      } else {
        clearInterval(interval);
        setIsDrawing(false);
        soundManager.playFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#f8fafc'],
        });
        setCurrentAnnounce('🎉 행운의 번호 6개가 모두 결정되었습니다! 대박을 기원합니다!');
      }
    }, 1200);
  };

  // Instant draw (skip animation)
  const handleInstantDraw = () => {
    soundManager.playClick();
    const result = generateRandomLotto(includeBonus);
    setDrawnNumbers(result.numbers);
    setBonusNumber(result.bonusNumber || null);
    setIsDrawing(false);
    setSaved(false);
    soundManager.playFanfare();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    setCurrentAnnounce('⚡ 즉시 추첨 완료! 이번 주 1등 번호가 될 준비가 되셨나요?');
  };

  // Reset
  const handleReset = () => {
    soundManager.playClick();
    setDrawnNumbers([]);
    setBonusNumber(null);
    setIsDrawing(false);
    setSaved(false);
    setCurrentAnnounce('새로운 추첨을 시작할 준비가 되었습니다.');
  };

  // Copy
  const handleCopy = () => {
    if (drawnNumbers.length === 0) return;
    const text = `[로또 6/45 추첨 번호] ${drawnNumbers.join(', ')}${bonusNumber ? ` + 보너스 ${bonusNumber}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  // Save
  const handleSave = () => {
    if (drawnNumbers.length < 6 || !onSaveGame) return;
    const game: LottoGame = {
      id: `game-${Date.now()}`,
      numbers: [...drawnNumbers].sort((a, b) => a - b),
      bonus: bonusNumber || undefined,
      type: '자동',
      createdAt: new Date().toLocaleString('ko-KR'),
      note: '추첨기 실시간 추출',
    };
    onSaveGame(game);
    setSaved(true);
    soundManager.playClick();
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Upper Status & Sounds */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDrawing ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isDrawing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-300">
            {isDrawing ? '추첨 엔진 가동 중 (Air Vortex Active)' : '추첨 대기 상태'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-full border border-slate-700 transition">
            <input
              type="checkbox"
              checked={includeBonus}
              onChange={(e) => setIncludeBonus(e.target.checked)}
              className="accent-amber-500 rounded cursor-pointer"
            />
            보너스볼 추첨
          </label>

          <button
            onClick={onToggleMute}
            className="p-1.5 text-slate-300 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-700/80 rounded-full border border-slate-700 transition"
            title={isMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Machine Container */}
      <div className="relative w-full rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-500/20 shadow-2xl shadow-amber-950/20 p-4 sm:p-8 flex flex-col items-center overflow-hidden">
        {/* Stage Ambient Glow lights */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Acrylic Globe + Mechanical Stand */}
        <div className="relative flex flex-col items-center">
          {/* Globe */}
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full p-2 bg-gradient-to-b from-amber-400/20 via-transparent to-amber-500/10 border-2 border-amber-400/40 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="w-full h-full rounded-full"
            />

            {/* Glowing Ball extraction tunnel top indicator */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 rounded-t-full bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 shadow-lg shadow-amber-500/50 flex items-center justify-center">
              <span className="w-4 h-1 bg-amber-100 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Machine Pedestal / Base */}
          <div className="w-56 sm:w-64 h-8 bg-gradient-to-r from-slate-800 via-amber-950/60 to-slate-800 rounded-b-2xl border-t-2 border-amber-500/40 shadow-xl flex items-center justify-center -mt-2">
            <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase drop-shadow">
              LOTTO 6/45 LOTTERY SYSTEM
            </span>
          </div>
        </div>

        {/* Announcer Banner */}
        <div className="mt-6 w-full max-w-xl text-center px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <p className="text-sm sm:text-base font-semibold text-amber-300 tracking-wide flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            {currentAnnounce}
          </p>
        </div>

        {/* Drawn Number Tray */}
        <div className="mt-6 w-full max-w-2xl bg-slate-900/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>추출된 행운 번호 ({drawnNumbers.length}/6)</span>
            </h3>
            {drawnNumbers.length === 6 && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                정렬 순서: {drawnNumbers.slice().sort((a, b) => a - b).join(', ')}
              </span>
            )}
          </div>

          {/* Ball slots */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 min-h-[70px] py-2 bg-slate-950/60 rounded-xl border border-slate-800/60">
            {drawnNumbers.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-500 py-3">
                아래 추첨 시작 버튼을 누르면 1번부터 차례대로 볼이 추출됩니다.
              </p>
            ) : (
              <>
                {drawnNumbers.map((num, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-4 animate-scale-in">
                    <LottoBall num={num} size="lg" animate={idx === drawnNumbers.length - 1} />
                  </div>
                ))}

                {bonusNumber && (
                  <div className="flex items-center gap-2 sm:gap-4 ml-2 border-l border-slate-700 pl-3">
                    <span className="text-lg font-black text-amber-400">+</span>
                    <LottoBall num={bonusNumber} size="lg" isBonus />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={handleStartDraw}
            disabled={isDrawing}
            className="flex-1 sm:flex-initial min-w-[150px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm sm:text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Play className={`w-5 h-5 fill-slate-950 ${isDrawing ? 'animate-spin' : ''}`} />
            {isDrawing ? '추첨 진행 중...' : '실시간 추첨 시작'}
          </button>

          <button
            onClick={handleInstantDraw}
            disabled={isDrawing}
            className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition cursor-pointer"
            title="애니메이션 없이 6개 번호 즉시 추출"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            초고속 추출
          </button>

          <button
            onClick={handleReset}
            disabled={isDrawing || drawnNumbers.length === 0}
            className="inline-flex items-center justify-center gap-1.5 p-3.5 rounded-xl font-semibold text-sm text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar (Copy & Save) */}
        {drawnNumbers.length === 6 && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saved}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                saved
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-amber-400" />}
              {saved ? '보관함에 저장됨' : '보관함에 저장'}
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copied ? '복사 완료!' : '번호 복사'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
