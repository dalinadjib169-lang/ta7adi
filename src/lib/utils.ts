import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Rank } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRankFromPoints(points: number): Rank {
  if (points >= 80) return 'dragon';
  if (points >= 60) return 'lion';
  if (points >= 40) return 'tiger';
  if (points >= 20) return 'eagle';
  return 'worm';
}

export function getRankIcon(rank: Rank) {
  const icons = {
    worm: '🐛',
    eagle: '🦅',
    tiger: '🐯',
    lion: '🦁',
    dragon: '🐲'
  };
  return icons[rank] || '👤';
}

export function getRankNameAr(rank: Rank) {
  const names = {
    worm: 'دودة',
    eagle: 'نسر',
    tiger: 'نمر',
    lion: 'أسد',
    dragon: 'تنين'
  };
  return names[rank] || 'مبتدئ';
}
