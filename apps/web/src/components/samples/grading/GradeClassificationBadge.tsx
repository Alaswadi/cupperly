'use client';

import { GradeClassification } from '@/types';
import { CheckCircle, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';

interface GradeClassificationBadgeProps {
  classification: GradeClassification;
  grade?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function GradeClassificationBadge({
  classification,
  grade,
  size = 'md',
  showIcon = true,
}: GradeClassificationBadgeProps) {
  const getClassificationStyles = () => {
    switch (classification) {
      case 'SPECIALTY_GRADE':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          icon: CheckCircle,
        };
      case 'PREMIUM_GRADE':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-300',
          icon: AlertCircle,
        };
      case 'EXCHANGE_GRADE':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          icon: AlertTriangle,
        };
      case 'BELOW_STANDARD':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          icon: XCircle,
        };
      case 'OFF_GRADE':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-300',
          icon: XCircle,
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-300',
          icon: AlertCircle,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: 'px-2 py-1',
          text: 'text-xs',
          iconSize: 'h-3 w-3',
          gap: 'gap-1',
        };
      case 'lg':
        return {
          padding: 'px-4 py-2',
          text: 'text-base',
          iconSize: 'h-5 w-5',
          gap: 'gap-2',
        };
      default: // md
        return {
          padding: 'px-3 py-1.5',
          text: 'text-sm',
          iconSize: 'h-4 w-4',
          gap: 'gap-1.5',
        };
    }
  };

  const styles = getClassificationStyles();
  const sizeStyles = getSizeStyles();
  const Icon = styles.icon;

  const displayText = grade || classification.replace(/_/g, ' ');

  return (
    <span
      className={`
        inline-flex items-center ${sizeStyles.gap} ${sizeStyles.padding}
        ${styles.bg} ${styles.text} border ${styles.border}
        rounded-full font-medium ${sizeStyles.text}
      `}
    >
      {showIcon && <Icon className={sizeStyles.iconSize} />}
      {displayText}
    </span>
  );
}

