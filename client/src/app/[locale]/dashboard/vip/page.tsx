'use client';

import React from 'react';
import { useClientAuth } from '@/contexts/ClientAuthContext';

interface VIPTier {
  name: string;
  minPoints: number;
  color: string;
  gradient: string;
  shadowColor: string;
  benefits: string[];
}

const vipTiers: VIPTier[] = [
  {
    name: 'Standard',
    minPoints: 0,
    color: 'text-gray-600',
    gradient: 'from-gray-400 to-gray-600',
    shadowColor: 'shadow-gray-500/30',
    benefits: [
      'Earn 1 point per $1 spent',
      'Birthday surprise',
      'Newsletter with exclusive offers',
    ],
  },
  {
    name: 'Silver',
    minPoints: 500,
    color: 'text-slate-600',
    gradient: 'from-slate-400 to-slate-600',
    shadowColor: 'shadow-slate-500/30',
    benefits: [
      'Earn 1.5 points per $1 spent',
      'Priority reservations',
      '10% discount on selected items',
      'Complimentary welcome drink',
      'Early access to events',
    ],
  },
  {
    name: 'Gold',
    minPoints: 1500,
    color: 'text-amber-600',
    gradient: 'from-amber-400 to-amber-600',
    shadowColor: 'shadow-amber-500/30',
    benefits: [
      'Earn 2 points per $1 spent',
      'VIP seating preference',
      '15% discount on all orders',
      'Complimentary premium hookah monthly',
      'Exclusive Gold member events',
      'Personal concierge service',
    ],
  },
  {
    name: 'Platinum',
    minPoints: 5000,
    color: 'text-violet-600',
    gradient: 'from-violet-400 to-violet-600',
    shadowColor: 'shadow-violet-500/30',
    benefits: [
      'Earn 3 points per $1 spent',
      'Guaranteed table availability',
      '20% discount on everything',
      'Private lounge access',
      'Complimentary bottle service monthly',
      'VIP parking',
      'Exclusive Platinum experiences',
      'Personal account manager',
    ],
  },
];

export default function VIPPage() {
  const { user } = useClientAuth();
  const currentPoints = user?.loyalty_points || 0;
  const currentTierName = user?.vip_tier || 'Standard';

  const currentTierIndex = vipTiers.findIndex(t => t.name === currentTierName);
  const currentTier = vipTiers[currentTierIndex] || vipTiers[0];
  const nextTier = vipTiers[currentTierIndex + 1];

  const pointsToNext = nextTier ? nextTier.minPoints - currentPoints : 0;
  const progressPercent = nextTier
    ? ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">VIP Program</h1>
        <p className="text-gray-500">Your exclusive membership benefits</p>
      </div>

      {/* Current Status Card */}
      <div className={`bg-gradient-to-br ${currentTier.gradient} rounded-3xl p-6 lg:p-8 text-white shadow-xl ${currentTier.shadowColor} mb-8`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="text-white/70 text-sm">Your Tier</p>
                <h2 className="text-3xl font-bold">{currentTier.name}</h2>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{currentPoints.toLocaleString()}</span>
              <span className="text-white/70">points</span>
            </div>
          </div>

          {nextTier && (
            <div className="lg:text-right">
              <p className="text-white/70 text-sm mb-2">Progress to {nextTier.name}</p>
              <div className="w-full lg:w-64 h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
              <p className="text-white/90 font-medium">
                {pointsToNext.toLocaleString()} points to go
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Current Benefits */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Benefits</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {currentTier.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={`w-6 h-6 bg-gradient-to-br ${currentTier.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All Tiers */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Membership Tiers</h3>
        <div className="space-y-4">
          {vipTiers.map((tier, index) => {
            const isCurrentTier = tier.name === currentTierName;
            const isLocked = tier.minPoints > currentPoints;

            return (
              <div
                key={tier.name}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 ${
                  isCurrentTier
                    ? 'border-amber-300 shadow-lg shadow-amber-500/10'
                    : isLocked
                      ? 'border-gray-200/50 opacity-60'
                      : 'border-gray-200/50'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${tier.gradient} rounded-xl flex items-center justify-center text-white shadow-lg ${tier.shadowColor}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          {tier.name}
                          {isCurrentTier && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                              Current
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {tier.minPoints === 0 ? 'Starting tier' : `${tier.minPoints.toLocaleString()} points required`}
                        </p>
                      </div>
                    </div>
                    {isLocked && (
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    {tier.benefits.slice(0, 4).map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className={`w-4 h-4 ${tier.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {benefit}
                      </div>
                    ))}
                    {tier.benefits.length > 4 && (
                      <div className="text-sm text-gray-400">
                        +{tier.benefits.length - 4} more benefits
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to Earn Points */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Earn Points</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { action: 'Dining', points: '1-3x per $1', icon: '🍽️' },
            { action: 'Hookah', points: '2x per order', icon: '💨' },
            { action: 'Drinks', points: '1x per $1', icon: '🍸' },
            { action: 'Events', points: '50 bonus', icon: '🎉' },
            { action: 'Referral', points: '100 bonus', icon: '👥' },
            { action: 'Reviews', points: '25 bonus', icon: '⭐' },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{item.action}</p>
                <p className="text-sm text-gray-500">{item.points}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
