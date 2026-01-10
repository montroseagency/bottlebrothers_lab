'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { getMyReservations } from '@/lib/api/clientAuth';

interface Reservation {
  id: string;
  date: string;
  time: string;
  party_size: number;
  status: string;
  occasion: string | null;
  verification_code: string;
}

interface DashboardStats {
  upcomingReservations: number;
  vipTier: string;
  rewardPoints: number;
  unreadMessages: number;
}

export default function DashboardOverview() {
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useClientAuth();
  const [loading, setLoading] = useState(true);
  const [nextReservation, setNextReservation] = useState<Reservation | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    upcomingReservations: 0,
    vipTier: 'Standard',
    rewardPoints: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await getMyReservations('upcoming');
      if (response.success && response.reservations) {
        const reservations = response.reservations as Reservation[];
        setStats(prev => ({
          ...prev,
          upcomingReservations: reservations.length,
          vipTier: user?.vip_tier || 'Standard',
          rewardPoints: user?.loyalty_points || 0,
          unreadMessages: 2, // Mock data
        }));
        if (reservations.length > 0) {
          setNextReservation(reservations[0]);
        }
      }
    } catch {
      // Handle error silently
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'sq' ? 'sq-AL' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      label: 'Reserve Table',
      href: `/${locale}/dashboard/reservations?action=new`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'from-amber-400 to-amber-600',
      shadowColor: 'shadow-amber-500/30',
    },
    {
      label: 'View Menu',
      href: `/${locale}/menu`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-emerald-400 to-emerald-600',
      shadowColor: 'shadow-emerald-500/30',
    },
    {
      label: 'VIP Benefits',
      href: `/${locale}/dashboard/vip`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: 'from-violet-400 to-violet-600',
      shadowColor: 'shadow-violet-500/30',
    },
    {
      label: 'Message Lounge',
      href: `/${locale}/dashboard/messages`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'from-blue-400 to-blue-600',
      shadowColor: 'shadow-blue-500/30',
    },
  ];

  const statCards = [
    {
      label: 'Upcoming Reservations',
      value: stats.upcomingReservations,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'VIP Tier',
      value: stats.vipTier,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      label: 'Reward Points',
      value: stats.rewardPoints.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Unread Messages',
      value: stats.unreadMessages,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getGreeting()}, {user?.first_name || 'Guest'}!
        </h1>
        <p className="text-gray-500">
          Welcome back to your dashboard. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Next Reservation Card */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Reservation</h2>
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 animate-pulse">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gray-200 rounded-xl" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-48 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        ) : nextReservation ? (
          <div className="bg-gradient-to-br from-white to-amber-50/30 backdrop-blur-sm rounded-2xl border border-amber-200/50 p-6 shadow-lg shadow-amber-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-amber-500/30">
                <span className="text-2xl font-bold">
                  {new Date(nextReservation.date).getDate()}
                </span>
                <span className="text-xs uppercase opacity-80">
                  {new Date(nextReservation.date).toLocaleDateString('en', { month: 'short' })}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {formatDate(nextReservation.date)}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(nextReservation.time)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {nextReservation.party_size} guests
                  </span>
                  {nextReservation.occasion && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      {nextReservation.occasion}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full capitalize">
                    {nextReservation.status}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    #{nextReservation.verification_code}
                  </span>
                </div>
              </div>
              <div className="flex sm:flex-col gap-2">
                <Link
                  href={`/${locale}/reservations/lookup?code=${nextReservation.verification_code}`}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors text-center"
                >
                  View Details
                </Link>
                <Link
                  href={`/${locale}/dashboard/reservations`}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-center"
                >
                  All Reservations
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Upcoming Reservations</h3>
            <p className="text-gray-500 mb-4">Ready to book your next visit?</p>
            <Link
              href={`/${locale}/dashboard/reservations?action=new`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Make a Reservation
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center text-white shadow-lg ${action.shadowColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{action.label}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
