'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardTab from '@/components/dashboard/DashboardTab';
import UploadTab from '@/components/dashboard/UploadTab';
import ChatTab from '@/components/dashboard/ChatTab';
import QATab from '@/components/dashboard/QATab';
import ReportsTab from '@/components/dashboard/ReportsTab';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [enableXAI, setEnableXAI] = useState(true);
  const [includeReferences, setIncludeReferences] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show nothing while loading or redirecting
  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const tabs = [
    { label: '🏠 Dashboard', component: DashboardTab, icon: '🏠' },
    { label: '📤 Upload & Analysis', component: UploadTab, icon: '📤' },
    { label: '💬 Collaboration', component: ChatTab, icon: '💬' },
    { label: '❓ Q&A', component: QATab, icon: '❓' },
    { label: '📊 Reports', component: ReportsTab, icon: '📊' },
  ];

  const ActiveComponent = tabs[activeTab].component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">MediScan AI</span>
            </Link>

            {/* Center - Quick Nav */}
            <div className="hidden md:flex items-center gap-1">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === index
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  <span className="hidden lg:inline">{tab.label.split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
            </div>

            {/* Right - User Menu */}
            <div className="flex items-center gap-3">
              {/* Settings Dropdown */}
              <div className="hidden lg:flex items-center gap-2 text-sm">
                <label className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableXAI}
                    onChange={(e) => setEnableXAI(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>🔬 XAI</span>
                </label>
                <label className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeReferences}
                    onChange={(e) => setIncludeReferences(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>📚 Refs</span>
                </label>
              </div>

              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {session.user?.name}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
              >
                Logout
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-2">
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveTab(index);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                      activeTab === index
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Banner - Only on Dashboard Tab */}
        {activeTab === 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {session.user?.name}! 👋
            </h1>
            <p className="text-blue-100">
              Ready to analyze medical images with AI-powered precision
            </p>
          </div>
        )}

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tab Content */}
          <div className="p-6">
            <ActiveComponent
              enableXAI={enableXAI}
              includeReferences={includeReferences}
              setActiveTab={setActiveTab}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
