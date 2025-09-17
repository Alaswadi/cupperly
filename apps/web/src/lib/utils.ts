import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatScore(score: number, maxScore: number = 100) {
  return `${score.toFixed(1)}/${maxScore}`;
}

export function calculateScaaGrade(score: number) {
  if (score >= 90) return 'Outstanding';
  if (score >= 85) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 75) return 'Good';
  if (score >= 70) return 'Fair';
  return 'Poor';
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateSubdomain(subdomain: string) {
  const subdomainRegex = /^[a-z0-9-]+$/;
  return subdomainRegex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 30;
}
