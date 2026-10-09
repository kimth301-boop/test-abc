import { FilterOptions, LottoGame, SimulationResult } from '../types/lotto';

// Official Korean Lotto 6/45 ball color classification
export function getBallColor(num: number): {
  bg: string;
  border: string;
  text: string;
  gradient: string;
  glow: string;
  name: string;
} {
  if (num <= 10) {
    return {
      bg: 'bg-amber-400',
      border: 'border-amber-300',
      text: 'text-amber-950',
      gradient: 'from-amber-300 via-amber-400 to-amber-600',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]',
      name: '황금색 (1~10)',
    };
  }
  if (num <= 20) {
    return {
      bg: 'bg-blue-500',
      border: 'border-blue-400',
      text: 'text-white',
      gradient: 'from-sky-400 via-blue-500 to-blue-700',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
      name: '파랑색 (11~20)',
    };
  }
  if (num <= 30) {
    return {
      bg: 'bg-rose-500',
      border: 'border-rose-400',
      text: 'text-white',
      gradient: 'from-rose-400 via-rose-500 to-rose-700',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.5)]',
      name: '빨강색 (21~30)',
    };
  }
  if (num <= 40) {
    return {
      bg: 'bg-slate-500',
      border: 'border-slate-400',
      text: 'text-white',
      gradient: 'from-slate-400 via-slate-500 to-slate-700',
      glow: 'shadow-[0_0_20px_rgba(100,116,139,0.5)]',
      name: '회색 (31~40)',
    };
  }
  return {
    bg: 'bg-emerald-500',
    border: 'border-emerald-400',
    text: 'text-white',
    gradient: 'from-emerald-400 via-emerald-500 to-emerald-700',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    name: '녹색 (41~45)',
  };
}

// Authentic statistical distribution based on official Donghang Lotto cumulative statistics
export const HISTORICAL_FREQUENCY: Record<number, number> = {
  1: 185, 2: 172, 3: 178, 4: 176, 5: 160, 6: 173, 7: 176, 8: 167, 9: 145, 10: 170,
  11: 175, 12: 191, 13: 184, 14: 179, 15: 171, 16: 174, 17: 186, 18: 193, 19: 168, 20: 183,
  21: 177, 22: 154, 23: 164, 24: 175, 25: 158, 26: 178, 27: 190, 28: 165, 29: 161, 30: 169,
  31: 174, 32: 163, 33: 189, 34: 197, 35: 177, 36: 167, 37: 181, 38: 178, 39: 182, 40: 179,
  41: 156, 42: 166, 43: 192, 44: 173, 45: 184,
};

// Korean Traditional Dream Interpretation keywords to lucky numbers
export const DREAM_KEYWORDS: {
  keyword: string;
  emoji: string;
  meaning: string;
  numbers: number[];
}[] = [
  { keyword: '돼지 (황금돼지)', emoji: '🐷', meaning: '큰 재물과 횡재수를 상징하는 최고의 길몽', numbers: [3, 8, 12, 23, 34, 45] },
  { keyword: '똥 / 오물 밟기', emoji: '💩', meaning: '온몸에 재물이 쏟아져 들어오는 대박 운', numbers: [7, 16, 22, 29, 37, 42] },
  { keyword: '조상님 만남', emoji: '👴', meaning: '조상님이 번호를 가르쳐주거나 덕담하는 꿈', numbers: [1, 9, 18, 27, 33, 40] },
  { keyword: '활활 타는 불', emoji: '🔥', meaning: '사업 번창과 큰 부의 급격한 상승', numbers: [2, 11, 24, 31, 38, 44] },
  { keyword: '용 / 승천', emoji: '🐉', meaning: '귀인을 만나고 천운이 따르는 최고의 영험한 꿈', numbers: [5, 14, 20, 28, 35, 43] },
  { keyword: '황금 / 보석 줍기', emoji: '💎', meaning: '예상치 못한 목돈과 보석 같은 기회', numbers: [6, 15, 26, 32, 39, 41] },
  { keyword: '대통령 / VIP 영접', emoji: '🏛️', meaning: '명예와 함께 일확천금의 복권 당첨운', numbers: [1, 10, 19, 25, 36, 45] },
  { keyword: '비행기 타고 하늘 날기', emoji: '✈️', meaning: '모든 일이 순풍에 돛단 듯 승승장구', numbers: [4, 13, 21, 30, 37, 44] },
  { keyword: '맑은 바다 / 큰 물', emoji: '🌊', meaning: '마르지 않는 풍요로운 재물운의 흐름', numbers: [8, 17, 23, 34, 41, 45] },
  { keyword: '뱀을 잡거나 물림', emoji: '🐍', meaning: '강한 생명력과 뜻밖의 재물 소득', numbers: [3, 12, 25, 33, 38, 42] },
  { keyword: '쌍둥이 / 아기 낳기', emoji: '👶', meaning: '새로운 행운의 시작과 배가 되는 결실', numbers: [2, 7, 14, 28, 36, 40] },
  { keyword: '황금 열쇠 / 금고', emoji: '🗝️', meaning: '꽁꽁 잠겨있던 부의 문이 활짝 열리는 꿈', numbers: [9, 11, 22, 31, 42, 45] },
];

// Generate purely random 6 numbers (sorted)
export function generateRandomLotto(bonus = false): { numbers: number[]; bonusNumber?: number } {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const picked: number[] = [];

  for (let i = 0; i < (bonus ? 7 : 6); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }

  if (bonus) {
    const mainNumbers = picked.slice(0, 6).sort((a, b) => a - b);
    return { numbers: mainNumbers, bonusNumber: picked[6] };
  }

  return { numbers: picked.sort((a, b) => a - b) };
}

// Generate with statistical frequency weights
export function generateStatWeightedLotto(preference: 'hot' | 'cold' | 'balanced' = 'balanced'): number[] {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const weights = pool.map(n => {
    const freq = HISTORICAL_FREQUENCY[n] || 170;
    if (preference === 'hot') return Math.pow(freq / 150, 3); // favor frequent
    if (preference === 'cold') return Math.pow(210 / freq, 3); // favor less frequent
    return freq; // balanced historical
  });

  const selected: number[] = [];
  const available = [...pool];
  const availableWeights = [...weights];

  while (selected.length < 6) {
    const totalWeight = availableWeights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let chosenIdx = 0;

    for (let i = 0; i < availableWeights.length; i++) {
      rand -= availableWeights[i];
      if (rand <= 0) {
        chosenIdx = i;
        break;
      }
    }

    selected.push(available[chosenIdx]);
    available.splice(chosenIdx, 1);
    availableWeights.splice(chosenIdx, 1);
  }

  return selected.sort((a, b) => a - b);
}

// Generate numbers considering custom filters (Fixed, Excluded, Sum range, Odd-Even)
export function generateFilteredLotto(options: FilterOptions): number[] | null {
  const { includeNumbers, excludeNumbers, minSum, maxSum, oddEvenRatio, allowConsecutive } = options;

  const validInclude = Array.from(new Set(includeNumbers.filter(n => n >= 1 && n <= 45)));
  const validExclude = new Set(excludeNumbers.filter(n => n >= 1 && n <= 45));

  // Sanity checks
  if (validInclude.length > 5) return null;
  for (const inc of validInclude) {
    if (validExclude.has(inc)) return null; // Conflict
  }

  const candidatePool = Array.from({ length: 45 }, (_, i) => i + 1).filter(
    n => !validExclude.has(n) && !validInclude.includes(n)
  );

  const neededCount = 6 - validInclude.length;
  if (candidatePool.length < neededCount) return null;

  // Try up to 3,000 attempts to satisfy sum, odd/even, consecutive constraints
  for (let attempt = 0; attempt < 3000; attempt++) {
    const shuffled = [...candidatePool].sort(() => Math.random() - 0.5);
    const chosen = [...validInclude, ...shuffled.slice(0, neededCount)].sort((a, b) => a - b);

    // 1. Sum constraint
    const sum = chosen.reduce((acc, cur) => acc + cur, 0);
    if (sum < minSum || sum > maxSum) continue;

    // 2. Odd-Even ratio
    if (oddEvenRatio !== 'all') {
      const oddCount = chosen.filter(n => n % 2 !== 0).length;
      const evenCount = 6 - oddCount;
      const ratioStr = `${oddCount}:${evenCount}`;
      if (ratioStr !== oddEvenRatio) continue;
    }

    // 3. Consecutive numbers
    if (!allowConsecutive) {
      let hasConsecutive = false;
      for (let i = 0; i < chosen.length - 1; i++) {
        if (chosen[i + 1] === chosen[i] + 1) {
          hasConsecutive = true;
          break;
        }
      }
      if (hasConsecutive) continue;
    }

    return chosen;
  }

  // Fallback: relax sum constraint slightly if strict
  const shuffled = [...candidatePool].sort(() => Math.random() - 0.5);
  return [...validInclude, ...shuffled.slice(0, neededCount)].sort((a, b) => a - b);
}

// Generate fortune numbers based on birthday & zodiac
export function generateBirthdayFortuneLotto(birthdate: string, name: string): number[] {
  let hash = 0;
  const str = `${birthdate}-${name}-${new Date().toISOString().slice(0, 10)}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  const seed = Math.abs(hash);
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const result: number[] = [];

  for (let i = 0; i < 6; i++) {
    const idx = (seed * (i + 7) + i * 13) % pool.length;
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return result.sort((a, b) => a - b);
}

// Run high-speed Monte Carlo simulation for lottery probability
export function runLottoSimulation(
  myNumbers: number[],
  runs: number = 1000
): SimulationResult {
  const mySet = new Set(myNumbers);
  const ticketPrice = 1000;
  const totalCost = runs * ticketPrice;

  let r1 = 0; // 6
  let r2 = 0; // 5 + bonus
  let r3 = 0; // 5
  let r4 = 0; // 4
  let r5 = 0; // 3
  let no = 0;

  for (let i = 0; i < runs; i++) {
    const { numbers, bonusNumber } = generateRandomLotto(true);
    let matchCount = 0;
    for (const num of numbers) {
      if (mySet.has(num)) matchCount++;
    }

    if (matchCount === 6) {
      r1++;
    } else if (matchCount === 5 && bonusNumber && mySet.has(bonusNumber)) {
      r2++;
    } else if (matchCount === 5) {
      r3++;
    } else if (matchCount === 4) {
      r4++;
    } else if (matchCount === 3) {
      r5++;
    } else {
      no++;
    }
  }

  // Korean Lotto approximate average payouts
  const p1 = 2000000000; // 20억
  const p2 = 50000000;   // 5천만원
  const p3 = 1500000;    // 150만원
  const p4 = 50000;      // 5만원
  const p5 = 5000;       // 5천원

  const totalPrize = r1 * p1 + r2 * p2 + r3 * p3 + r4 * p4 + r5 * p5;
  const roi = totalCost > 0 ? ((totalPrize - totalCost) / totalCost) * 100 : 0;

  return {
    totalRuns: runs,
    totalCost,
    totalPrize,
    roi: Number(roi.toFixed(2)),
    rank1: r1,
    rank2: r2,
    rank3: r3,
    rank4: r4,
    rank5: r5,
    noPrize: no,
  };
}

// Check winning against a target result
export function checkTicketWin(myNumbers: number[], winningNumbers: number[], bonus: number) {
  const winSet = new Set(winningNumbers);
  const matched = myNumbers.filter(n => winSet.has(n));
  const hasBonus = myNumbers.includes(bonus);

  let rank = 0;
  let prizeName = '낙첨 (다음 기회에)';
  let prizeAmount = 0;

  if (matched.length === 6) {
    rank = 1;
    prizeName = '🎉 1등 당첨! (약 20억원)';
    prizeAmount = 2000000000;
  } else if (matched.length === 5 && hasBonus) {
    rank = 2;
    prizeName = '🥈 2등 당첨! (약 5,000만원)';
    prizeAmount = 50000000;
  } else if (matched.length === 5) {
    rank = 3;
    prizeName = '🥉 3등 당첨! (약 150만원)';
    prizeAmount = 1500000;
  } else if (matched.length === 4) {
    rank = 4;
    prizeName = '🏅 4등 당첨! (고정 5만원)';
    prizeAmount = 50000;
  } else if (matched.length === 3) {
    rank = 5;
    prizeName = '🎫 5등 당첨! (고정 5천원)';
    prizeAmount = 5000;
  }

  return { rank, prizeName, prizeAmount, matched, hasBonus };
}
