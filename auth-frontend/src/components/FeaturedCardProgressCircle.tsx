"use client";

import React from 'react';

interface FeaturedCardProgressCircleProps {
  title: string;
  description: string;
  confirmLabel: string;
  progress: number;
  className?: string;
  onDismiss: () => void;
  onConfirm: () => void;
}

export function FeaturedCardProgressCircle({
  title,
  description,
  confirmLabel,
  progress,
  className = '',
  onDismiss,
  onConfirm
}: FeaturedCardProgressCircleProps) {
  // Calculate SVG circle properties
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 ${className}`}>
      {/* Dismiss Button */}
      <button 
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      {/* Progress Circle & Text content */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0 w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 64 64">
            {/* Background Circle */}
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="32"
              cy="32"
            />
            {/* Progress Circle */}
            <circle
              className="text-primary transition-all duration-1000 ease-out"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="32"
              cy="32"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-900 dark:text-white">
            {progress}%
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={onConfirm}
        className="text-sm font-medium text-primary hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
      >
        {confirmLabel}
      </button>
    </div>
  );
}
