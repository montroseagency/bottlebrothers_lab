'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { updateClientProfile, changePassword, getMyReservations, linkReservation } from '@/lib/api/clientAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface Reservation {
  id: string;
  date: string;
  time: string;
  party_size: number;
  status: string;
  occasion: string | null;
  verification_code: string;
}

interface Message {
  id: string;
  content: string;
  sender_type: 'client' | 'admin';
  sender_name: string;
  is_read: boolean;
  created_at: string;
}

// ============================================
// VIP PACKAGE CONFIGURATION (Reservation-based)
// ============================================
const VIP_THRESHOLDS = {
  VIP: 5,      // Unlock VIP with 5 completed reservations
  DELUXE: 12,  // Unlock Deluxe with 12 completed reservations
} as const;

interface VIPPackage {
  id: 'standard' | 'vip' | 'deluxe';
  name: string;
  description: string;
  requiredReservations: number;
  benefits: string[];
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
}

const VIP_PACKAGES: VIPPackage[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Begin your journey with us',
    requiredReservations: 0,
    benefits: [
      'Access to regular reservations',
      'Newsletter with exclusive offers',
      'Birthday acknowledgment',
    ],
    accentColor: '#6b7280',
    gradientFrom: '#9ca3af',
    gradientTo: '#6b7280',
  },
  {
    id: 'vip',
    name: 'VIP',
    description: 'Elevated dining experience',
    requiredReservations: VIP_THRESHOLDS.VIP,
    benefits: [
      'Priority reservations',
      'Reserved premium seating',
      'Complimentary welcome drink',
      'Exclusive event access',
    ],
    accentColor: '#d4af37',
    gradientFrom: '#e8c252',
    gradientTo: '#d4af37',
  },
  {
    id: 'deluxe',
    name: 'Deluxe',
    description: 'The ultimate luxury experience',
    requiredReservations: VIP_THRESHOLDS.DELUXE,
    benefits: [
      'Best table priority',
      'Faster confirmation',
      'Premium welcome service',
      'Dedicated concierge',
      'Exclusive Deluxe events',
    ],
    accentColor: '#1f2937',
    gradientFrom: '#374151',
    gradientTo: '#111827',
  },
];

export default function ProfilePage() {
  useTranslation();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'sq';
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshProfile } = useClientAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'reservations' | 'vip' | 'messages' | 'security'>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationFilter, setReservationFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [mounted, setMounted] = useState(false);

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    marketing_opt_in: false,
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Link reservation state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ code: '', email: '' });
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  // Messages state (WhatsApp-style direct chat)
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.push(`/${locale}/account/login`);
    }
  }, [mounted, authLoading, isAuthenticated, router, locale]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        marketing_opt_in: user.marketing_opt_in || false,
      });
    }
  }, [user]);

  useEffect(() => {
    if ((activeTab === 'reservations' || activeTab === 'vip') && isAuthenticated) {
      loadReservations();
    }
  }, [activeTab, isAuthenticated, reservationFilter]);

  const loadMessages = useCallback(async (silent = false) => {
    if (!silent) setMessagesLoading(true);
    try {
      const token = getAccessToken();
      const response = await fetch('http://localhost:8000/api/client/support-chat/messages/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
    if (!silent) setMessagesLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'messages' && isAuthenticated) {
      loadMessages();
      pollingRef.current = setInterval(() => {
        loadMessages(true);
      }, 3000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [activeTab, isAuthenticated, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bb_client_tokens');
      if (stored) {
        try {
          const tokens = JSON.parse(stored);
          return tokens.access;
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageToSend = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageToSend,
      sender_type: 'client',
      sender_name: user?.full_name || 'You',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const token = getAccessToken();
      const response = await fetch('http://localhost:8000/api/client/support-chat/messages/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: messageToSend }),
      });
      const data = await response.json();
      if (data.success) {
        loadMessages(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setNewMessage(messageToSend);
    }
    setSendingMessage(false);
  };

  const loadReservations = async () => {
    setReservationsLoading(true);
    try {
      const response = await getMyReservations(reservationFilter);
      if (response.success && response.reservations) {
        setReservations(response.reservations);
      }
    } catch (error) {
      console.error('Failed to load reservations:', error);
    }
    setReservationsLoading(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);

    try {
      const response = await updateClientProfile(profileForm);
      if (response.success) {
        setProfileSuccess('Profile updated successfully');
        setEditMode(false);
        refreshProfile();
      } else {
        setProfileError(response.message || 'Failed to update profile');
      }
    } catch {
      setProfileError('Failed to update profile');
    }
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (response.success) {
        setPasswordSuccess('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(response.message || 'Failed to change password');
      }
    } catch {
      setPasswordError('Failed to change password');
    }
    setPasswordLoading(false);
  };

  const handleLinkReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError(null);
    setLinkLoading(true);

    try {
      const response = await linkReservation(linkForm.code, linkForm.email);
      if (response.success) {
        setShowLinkModal(false);
        setLinkForm({ code: '', email: '' });
        loadReservations();
      } else {
        setLinkError(response.message || 'Failed to link reservation');
      }
    } catch {
      setLinkError('Failed to link reservation');
    }
    setLinkLoading(false);
  };

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'sq' ? 'sq-AL' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20';
    }
  };

  // ============================================
  // VIP PACKAGE HELPERS (Reservation-based)
  // ============================================

  // Calculate reservation stats from the reservations array
  const getReservationStats = () => {
    const now = new Date();
    const completedReservations = reservations.filter(r => r.status === 'completed');
    const upcomingReservations = reservations.filter(r => {
      const resDate = new Date(r.date);
      return resDate >= now && (r.status === 'confirmed' || r.status === 'pending');
    });
    const lastReservation = reservations.length > 0
      ? reservations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : null;

    return {
      total: reservations.length,
      completed: completedReservations.length,
      upcoming: upcomingReservations.length,
      lastDate: lastReservation?.date || null,
    };
  };

  const getCurrentPackage = (): VIPPackage => {
    const stats = getReservationStats();
    const completedCount = stats.completed;

    // Check from highest tier to lowest
    for (let i = VIP_PACKAGES.length - 1; i >= 0; i--) {
      if (completedCount >= VIP_PACKAGES[i].requiredReservations) {
        return VIP_PACKAGES[i];
      }
    }
    return VIP_PACKAGES[0];
  };

  const getNextPackage = (): VIPPackage | null => {
    const current = getCurrentPackage();
    const currentIndex = VIP_PACKAGES.findIndex(p => p.id === current.id);
    if (currentIndex < VIP_PACKAGES.length - 1) {
      return VIP_PACKAGES[currentIndex + 1];
    }
    return null;
  };

  const getProgressToNextPackage = () => {
    const stats = getReservationStats();
    const current = getCurrentPackage();
    const next = getNextPackage();

    if (!next) {
      return { current: stats.completed, required: current.requiredReservations, remaining: 0, percentage: 100 };
    }

    const remaining = next.requiredReservations - stats.completed;
    const progress = current.requiredReservations === 0
      ? stats.completed / next.requiredReservations
      : (stats.completed - current.requiredReservations) / (next.requiredReservations - current.requiredReservations);

    return {
      current: stats.completed,
      required: next.requiredReservations,
      remaining,
      percentage: Math.min(100, Math.max(0, progress * 100)),
    };
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // VIP Package calculations
  const currentPackage = getCurrentPackage();
  const nextPackage = getNextPackage();
  const reservationStats = getReservationStats();
  const progressInfo = getProgressToNextPackage();

  const menuItems = [
    { id: 'profile', name: 'Profile', icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'reservations', name: 'Reservations', icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { id: 'vip', name: 'VIP & Rewards', icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )},
    { id: 'messages', name: 'Messages', icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )},
    { id: 'security', name: 'Security', icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )},
  ];

  const totalUnreadMessages = messages.filter(m => m.sender_type === 'admin' && !m.is_read).length;

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex">
      {/* Premium Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed lg:relative z-40 h-screen transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'}`}
      >
        <div className="h-full p-4">
          <div className="h-full bg-white rounded-2xl border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-5 border-b border-neutral-100">
              <Link href={`/${locale}`} className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8962e] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                {sidebarOpen && (
                  <div className="overflow-hidden">
                    <h1 className="text-base font-semibold text-neutral-800 truncate">Bottle Brothers</h1>
                    <p className="text-[11px] text-[#d4af37] font-medium tracking-wide">My Account</p>
                  </div>
                )}
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as typeof activeTab)}
                    className={`w-full flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-[#d4af37]/10 text-[#d4af37]'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 hover:translate-x-0.5'
                    }`}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#d4af37] rounded-r-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={`flex-shrink-0 ${isActive ? 'text-[#d4af37]' : 'text-neutral-500 group-hover:text-neutral-700'}`}>
                      {item.icon}
                    </span>
                    {sidebarOpen && (
                      <>
                        <span className="text-sm font-medium flex-1 text-left truncate">{item.name}</span>
                        {item.id === 'messages' && totalUnreadMessages > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                            {totalUnreadMessages}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Account Card */}
            <div className="p-3 mt-auto">
              <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent mb-3" />
              {sidebarOpen ? (
                <div className="p-3 bg-neutral-50/80 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8962e] rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-sm">
                        {user?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{user?.full_name || user?.email}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                        <p className="text-xs text-[#d4af37] font-medium">{currentPackage.name} Member</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-3 px-1">
                    <span>Points</span>
                    <span className="font-semibold text-neutral-700">{user?.loyalty_points || 0}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 h-9 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8962e] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : ''}`}>
        {/* Compact Header */}
        <header className="sticky top-0 z-30 bg-[#f8f7f4]/80 backdrop-blur-xl border-b border-neutral-200/50">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-xl hover:bg-neutral-100 transition-colors lg:hidden"
                >
                  <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-800">
                    {menuItems.find(item => item.id === activeTab)?.name || 'Profile'}
                  </h2>
                  <p className="text-sm text-neutral-500">Manage your account settings</p>
                </div>
              </div>
              {activeTab === 'profile' && !editMode && (
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditMode(true)}
                  className="px-5 py-2.5 bg-[#d4af37] text-white text-sm font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Edit Profile
                </motion.button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {/* Profile Section */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  {...fadeInUp}
                  className="grid lg:grid-cols-3 gap-6"
                >
                  {/* Main Info Card */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Profile Header Card */}
                    <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
                      {/* Gradient Banner */}
                      <div className="h-24 bg-gradient-to-r from-[#d4af37] via-[#e8c252] to-[#d4af37] relative">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
                      </div>

                      {/* Profile Info */}
                      <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 relative z-10">
                          {/* Avatar */}
                          <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-[#d4af37] to-[#b8962e] rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                              <span className="text-white font-bold text-3xl">
                                {user?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-white">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>

                          {/* Name & Status */}
                          <div className="flex-1 pt-2 sm:pt-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-neutral-800">{user?.full_name || user?.email}</h3>
                              <span className="px-2.5 py-1 bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/10 text-[#b8962e] text-xs font-semibold rounded-lg border border-[#d4af37]/20">
                                {currentPackage.name} Member
                              </span>
                            </div>
                            <p className="text-sm text-neutral-500">{user?.email}</p>
                          </div>

                          {/* Edit Button */}
                          {!editMode && (
                            <motion.button
                              whileHover={{ scale: 1.02, y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setEditMode(true)}
                              className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-all duration-200 flex items-center gap-2 shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Edit Profile
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Personal Information Card */}
                    <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
                      <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#d4af37]/10 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <h3 className="text-base font-semibold text-neutral-800">Personal Information</h3>
                        </div>
                      </div>

                      <div className="p-6">
                        {profileSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            {profileSuccess}
                          </motion.div>
                        )}
                        {profileError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            {profileError}
                          </motion.div>
                        )}

                        {editMode ? (
                          <form onSubmit={handleProfileSubmit} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                  <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  First Name
                                </label>
                                <input
                                  type="text"
                                  value={profileForm.first_name}
                                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                                  placeholder="Enter your first name"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                  <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  Last Name
                                </label>
                                <input
                                  type="text"
                                  value={profileForm.last_name}
                                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                                  placeholder="Enter your last name"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                                placeholder="Enter your phone number"
                              />
                            </div>
                            <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl cursor-pointer group hover:bg-neutral-100 transition-colors">
                              <input
                                type="checkbox"
                                checked={profileForm.marketing_opt_in}
                                onChange={(e) => setProfileForm({ ...profileForm, marketing_opt_in: e.target.checked })}
                                className="w-5 h-5 text-[#d4af37] border-neutral-300 rounded focus:ring-[#d4af37]/30"
                              />
                              <div>
                                <span className="text-sm font-medium text-neutral-700 block">Marketing Communications</span>
                                <span className="text-xs text-neutral-500">Receive exclusive offers and updates via email</span>
                              </div>
                            </label>
                            <div className="flex gap-3 pt-3">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={profileLoading}
                                className="px-6 py-3 bg-[#d4af37] text-white text-sm font-semibold rounded-xl hover:bg-[#c9a432] disabled:opacity-50 transition-all shadow-sm flex items-center gap-2"
                              >
                                {profileLoading ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save Changes
                                  </>
                                )}
                              </motion.button>
                              <button
                                type="button"
                                onClick={() => setEditMode(false)}
                                className="px-6 py-3 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-4">
                            {/* Info Grid */}
                            <div className="grid sm:grid-cols-2 gap-4">
                              {[
                                {
                                  label: 'Full Name',
                                  value: user?.full_name || 'Not set',
                                  icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  ),
                                  color: 'from-blue-500 to-blue-600'
                                },
                                {
                                  label: 'Email Address',
                                  value: user?.email || 'Not set',
                                  icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                  ),
                                  color: 'from-emerald-500 to-emerald-600'
                                },
                                {
                                  label: 'Phone Number',
                                  value: user?.phone || 'Not set',
                                  icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                  ),
                                  color: 'from-violet-500 to-violet-600'
                                },
                                {
                                  label: 'Member Since',
                                  value: user?.created_at ? formatDate(user.created_at) : 'Not available',
                                  icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  ),
                                  color: 'from-amber-500 to-amber-600'
                                },
                              ].map((field, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="group p-4 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all duration-300"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 bg-gradient-to-br ${field.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                      <span className="text-white">{field.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">{field.label}</p>
                                      <p className="text-sm font-semibold text-neutral-800 truncate">{field.value}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* Account Stats */}
                            <div className="mt-6 pt-5 border-t border-neutral-100">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-[#d4af37]/10 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                </div>
                                <h4 className="text-sm font-semibold text-neutral-700">Account Statistics</h4>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 bg-neutral-50 rounded-xl">
                                  <div className="text-2xl font-bold text-[#d4af37]">{user?.loyalty_points || 0}</div>
                                  <div className="text-xs text-neutral-500 mt-0.5">Points</div>
                                </div>
                                <div className="text-center p-3 bg-neutral-50 rounded-xl">
                                  <div className="text-2xl font-bold text-neutral-800">{currentPackage.name}</div>
                                  <div className="text-xs text-neutral-500 mt-0.5">Package</div>
                                </div>
                                <div className="text-center p-3 bg-neutral-50 rounded-xl">
                                  <div className="text-2xl font-bold text-emerald-600">
                                    <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div className="text-xs text-neutral-500 mt-0.5">Verified</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side Cards */}
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-2xl border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-5"
                    >
                      <h4 className="text-sm font-semibold text-neutral-800 mb-4">Quick Actions</h4>
                      <div className="space-y-2">
                        {[
                          { name: 'Reservations', tab: 'reservations', icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )},
                          { name: 'Messages', tab: 'messages', icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          )},
                          { name: 'Security', tab: 'security', icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )},
                        ].map((action) => (
                          <button
                            key={action.tab}
                            onClick={() => setActiveTab(action.tab as typeof activeTab)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-all duration-200 group"
                          >
                            <span className="text-neutral-400 group-hover:text-[#d4af37] transition-colors">{action.icon}</span>
                            <span className="flex-1">{action.name}</span>
                            <svg className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Membership Overview */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-[#d4af37] to-[#b8962e] rounded-2xl p-5 text-white shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-white/90">Membership Status</h4>
                        <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-bold">{currentPackage.name}</span>
                      </div>
                      <div className="text-3xl font-bold mb-1">{reservationStats.completed}</div>
                      <p className="text-sm text-white/70">Completed Reservations</p>
                      {nextPackage && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-white/70">Next: {nextPackage.name}</span>
                            <span className="text-white/90 font-medium">{progressInfo.remaining} to go</span>
                          </div>
                          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressInfo.percentage}%` }}
                              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full bg-white rounded-full"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Reservations Section */}
              {activeTab === 'reservations' && (
                <motion.div key="reservations" {...fadeInUp} className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                      {(['upcoming', 'past', 'all'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setReservationFilter(f)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            reservationFilter === f
                              ? 'bg-[#d4af37] text-white shadow-sm'
                              : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowLinkModal(true)}
                      className="px-5 py-2.5 bg-[#d4af37] text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      Link Reservation
                    </motion.button>
                  </div>

                  {reservationsLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="w-10 h-10 border-3 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin" />
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-12 text-center">
                      <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-800 mb-2">No reservations found</h3>
                      <p className="text-neutral-500 mb-5">You don&apos;t have any {reservationFilter} reservations.</p>
                      <Link href={`/${locale}/reservations`} className="inline-flex items-center gap-2 text-[#d4af37] hover:text-[#c9a432] font-medium transition-colors">
                        Make a reservation
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {reservations.map((res, idx) => (
                        <motion.div
                          key={res.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white rounded-2xl border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="font-semibold text-neutral-800">{formatDate(res.date)}</p>
                              <p className="text-neutral-600">{res.time} • {res.party_size} guests</p>
                              {res.occasion && <p className="text-sm text-neutral-500">{res.occasion}</p>}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(res.status)}`}>
                              {res.status}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* VIP & Rewards Section - Premium Redesign */}
              {activeTab === 'vip' && (
                <motion.div key="vip" {...fadeInUp} className="space-y-8">
                  {/* Page Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-800">VIP & Rewards</h2>
                      <p className="text-sm text-neutral-500 mt-1">Unlock packages based on completed reservations</p>
                    </div>
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-[#d4af37] transition-colors group">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Package Rules
                    </button>
                  </div>

                  {/* Membership Status Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white rounded-[20px] border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden"
                  >
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                        {/* Package Badge */}
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{ background: `linear-gradient(135deg, ${currentPackage.gradientFrom}, ${currentPackage.gradientTo})` }}
                        >
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-neutral-800">{currentPackage.name} Package</h3>
                            {currentPackage.id !== 'standard' && (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-neutral-500 text-sm mb-4">{currentPackage.description}</p>

                          {/* Progress to next tier */}
                          {nextPackage && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-600">
                                  <span className="font-semibold text-neutral-800">{reservationStats.completed}</span>
                                  <span className="text-neutral-400"> / {nextPackage.requiredReservations}</span>
                                  <span className="text-neutral-500"> reservations to unlock </span>
                                  <span className="font-semibold" style={{ color: nextPackage.accentColor }}>{nextPackage.name}</span>
                                </span>
                                {progressInfo.remaining <= 2 && progressInfo.remaining > 0 && (
                                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Almost there!</span>
                                )}
                              </div>
                              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressInfo.percentage}%` }}
                                  transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                  className="h-full rounded-full"
                                  style={{ background: `linear-gradient(90deg, ${currentPackage.gradientFrom}, ${currentPackage.gradientTo})` }}
                                />
                              </div>
                            </div>
                          )}
                          {!nextPackage && (
                            <div className="flex items-center gap-2 text-sm text-emerald-600">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">You&apos;ve reached the highest tier!</span>
                            </div>
                          )}
                        </div>

                        {/* Mini Stats */}
                        <div className="flex sm:flex-col gap-4 sm:gap-3 sm:text-right">
                          <div>
                            <div className="text-2xl font-bold text-neutral-800">{reservationStats.completed}</div>
                            <div className="text-xs text-neutral-500">Completed</div>
                          </div>
                          <div className="w-px sm:w-auto sm:h-px bg-neutral-200" />
                          <div>
                            <div className="text-2xl font-bold text-[#d4af37]">{reservationStats.upcoming}</div>
                            <div className="text-xs text-neutral-500">Upcoming</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Package Comparison Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Available Packages</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* VIP Package Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                        className="bg-white rounded-[18px] border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300"
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8c252] to-[#d4af37] flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-semibold text-neutral-800">VIP</h4>
                                <p className="text-xs text-neutral-500">Elevated experience</p>
                              </div>
                            </div>
                            {reservationStats.completed >= VIP_THRESHOLDS.VIP ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Unlocked
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-lg">
                                {VIP_THRESHOLDS.VIP - reservationStats.completed} to unlock
                              </span>
                            )}
                          </div>

                          {/* Requirement */}
                          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-100">
                            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Unlock with <span className="font-semibold text-neutral-800">{VIP_THRESHOLDS.VIP}</span> completed reservations</span>
                          </div>

                          {/* Benefits */}
                          <ul className="space-y-2.5">
                            {VIP_PACKAGES[1].benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-600">
                                <svg className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>

                      {/* Deluxe Package Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                        className="bg-white rounded-[18px] border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300"
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#374151] to-[#111827] flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-semibold text-neutral-800">Deluxe</h4>
                                <p className="text-xs text-neutral-500">Ultimate luxury</p>
                              </div>
                            </div>
                            {reservationStats.completed >= VIP_THRESHOLDS.DELUXE ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Unlocked
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-lg">
                                {VIP_THRESHOLDS.DELUXE - reservationStats.completed} to unlock
                              </span>
                            )}
                          </div>

                          {/* Requirement */}
                          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-100">
                            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Unlock with <span className="font-semibold text-neutral-800">{VIP_THRESHOLDS.DELUXE}</span> completed reservations</span>
                          </div>

                          {/* Benefits */}
                          <ul className="space-y-2.5">
                            {VIP_PACKAGES[2].benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-600">
                                <svg className="w-4 h-4 text-neutral-800 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Reservation Activity Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white rounded-[18px] border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                      <h3 className="font-semibold text-neutral-800">Reservation Activity</h3>
                      <button
                        onClick={() => setActiveTab('reservations')}
                        className="text-sm text-[#d4af37] hover:text-[#b8962e] font-medium transition-colors"
                      >
                        View All
                      </button>
                    </div>

                    <div className="p-6">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {[
                          { label: 'Total Reservations', value: reservationStats.total || '—', icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          )},
                          { label: 'Completed', value: reservationStats.completed || '—', icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ), highlight: true },
                          { label: 'Upcoming', value: reservationStats.upcoming || '—', icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )},
                          { label: 'Last Reservation', value: reservationStats.lastDate ? formatDate(reservationStats.lastDate) : '—', icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ), small: true },
                        ].map((stat, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl ${stat.highlight ? 'bg-[#d4af37]/10 border border-[#d4af37]/20' : 'bg-neutral-50'}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.highlight ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-neutral-200/50 text-neutral-500'}`}>
                              {stat.icon}
                            </div>
                            <div className={`font-bold ${stat.small ? 'text-sm' : 'text-xl'} ${stat.highlight ? 'text-[#d4af37]' : 'text-neutral-800'}`}>
                              {stat.value}
                            </div>
                            <div className="text-xs text-neutral-500 mt-0.5">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Recent Reservations List */}
                      {reservations.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-neutral-700 mb-3">Recent Activity</h4>
                          <div className="space-y-2">
                            {reservations.slice(0, 4).map((res, idx) => (
                              <motion.div
                                key={res.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${
                                    res.status === 'completed' ? 'bg-emerald-500' :
                                    res.status === 'confirmed' ? 'bg-blue-500' :
                                    res.status === 'pending' ? 'bg-amber-500' : 'bg-neutral-400'
                                  }`} />
                                  <div>
                                    <p className="text-sm font-medium text-neutral-800">{formatDate(res.date)}</p>
                                    <p className="text-xs text-neutral-500">{res.time} • {res.party_size} guests</p>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${getStatusColor(res.status)}`}>
                                  {res.status}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Empty State */
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h4 className="text-base font-semibold text-neutral-800 mb-1">No reservations yet</h4>
                          <p className="text-sm text-neutral-500 mb-5">Start your journey to VIP status by making a reservation</p>
                          <Link
                            href={`/${locale}/reservations`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] text-white text-sm font-medium rounded-xl hover:bg-[#c9a432] transition-all shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Reserve a Table
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Messages Section */}
              {activeTab === 'messages' && (
                <motion.div key="messages" {...fadeInUp} className="h-[calc(100vh-220px)] flex flex-col bg-white rounded-2xl shadow-lg border border-neutral-200/60 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#d4af37] to-[#b8962e] px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Bottle Brothers Support</h3>
                      <p className="text-xs text-white/80">We typically reply instantly</p>
                    </div>
                  </div>

                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-2"
                    style={{ backgroundColor: '#e5ddd5', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ccc4\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
                  >
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="bg-white/80 rounded-full p-4">
                          <div className="w-8 h-8 border-3 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin" />
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="bg-white rounded-2xl p-6 shadow-lg text-center max-w-sm">
                          <div className="w-14 h-14 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-neutral-800 mb-2">Start a Conversation</h3>
                          <p className="text-sm text-neutral-500">Have a question? Type a message below!</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((message, index) => {
                          const isClient = message.sender_type === 'client';
                          const showDate = index === 0 || new Date(messages[index - 1].created_at).toDateString() !== new Date(message.created_at).toDateString();
                          return (
                            <div key={message.id}>
                              {showDate && (
                                <div className="flex justify-center my-4">
                                  <div className="bg-white/80 text-neutral-600 text-xs px-3 py-1 rounded-full shadow-sm">
                                    {new Date(message.created_at).toLocaleDateString(locale === 'sq' ? 'sq-AL' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                  </div>
                                </div>
                              )}
                              <div className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                                <div className={`relative max-w-[80%] px-3 py-2 shadow-sm ${isClient ? 'bg-[#dcf8c6] rounded-lg rounded-tr-none' : 'bg-white rounded-lg rounded-tl-none'}`}>
                                  <div className={`absolute top-0 w-3 h-3 ${isClient ? '-right-1.5 bg-[#dcf8c6]' : '-left-1.5 bg-white'}`} style={{ clipPath: isClient ? 'polygon(0 0, 100% 0, 0 100%)' : 'polygon(100% 0, 0 0, 100% 100%)' }} />
                                  {!isClient && <p className="text-xs font-medium text-[#d4af37] mb-1">{message.sender_name}</p>}
                                  <p className="text-sm text-neutral-800 whitespace-pre-wrap">{message.content}</p>
                                  <div className={`flex items-center justify-end gap-1 mt-1 ${isClient ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                    <span className="text-[10px]">{new Date(message.created_at).toLocaleTimeString(locale === 'sq' ? 'sq-AL' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isClient && <span className={`text-xs ${message.is_read ? 'text-blue-500' : 'text-neutral-400'}`}>{message.is_read ? '✓✓' : '✓'}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="bg-[#f0f0f0] px-4 py-3 flex items-end gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 bg-white rounded-full text-sm text-neutral-800 placeholder-neutral-500 focus:outline-none shadow-sm"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="w-10 h-10 flex items-center justify-center bg-[#d4af37] text-white rounded-full hover:bg-[#c9a432] disabled:opacity-50 transition-all shadow-md"
                    >
                      {sendingMessage ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Security Section */}
              {activeTab === 'security' && (
                <motion.div key="security" {...fadeInUp} className="max-w-2xl">
                  <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="px-6 py-5 border-b border-neutral-100">
                      <h3 className="text-lg font-semibold text-neutral-800">Change Password</h3>
                    </div>

                    <div className="p-6">
                      {passwordSuccess && (
                        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-3">
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {passwordSuccess}
                        </div>
                      )}
                      {passwordError && (
                        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {passwordError}
                        </div>
                      )}

                      <form onSubmit={handlePasswordSubmit} className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">Current Password</label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">New Password</label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={passwordLoading}
                          className="px-6 py-2.5 bg-[#d4af37] text-white text-sm font-medium rounded-xl hover:bg-[#c9a432] disabled:opacity-50 transition-all shadow-sm"
                        >
                          {passwordLoading ? 'Changing...' : 'Change Password'}
                        </motion.button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Link Reservation Modal */}
      <AnimatePresence>
        {showLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100">
                <h2 className="text-lg font-semibold text-neutral-800">Link Existing Reservation</h2>
                <p className="text-sm text-neutral-500 mt-1">Enter your reservation details</p>
              </div>
              <form onSubmit={handleLinkReservation} className="p-6 space-y-5">
                {linkError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {linkError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={linkForm.code}
                    onChange={(e) => setLinkForm({ ...linkForm, code: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                    placeholder="Enter code from confirmation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Email Used for Booking</label>
                  <input
                    type="email"
                    value={linkForm.email}
                    onChange={(e) => setLinkForm({ ...linkForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={linkLoading}
                    className="flex-1 py-3 bg-[#d4af37] text-white font-medium rounded-xl hover:bg-[#c9a432] disabled:opacity-50 transition-all"
                  >
                    {linkLoading ? 'Linking...' : 'Link Reservation'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => { setShowLinkModal(false); setLinkForm({ code: '', email: '' }); setLinkError(null); }}
                    className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
