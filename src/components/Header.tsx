/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sun, Moon, Laptop, Menu, X, User, ShieldAlert } from 'lucide-react';
import { SiteTexts } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isClientLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  clientName?: string;
  clientCompany?: string;
  siteTexts?: SiteTexts;
}

export default function Header({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  isClientLoggedIn,
  isAdminLoggedIn,
  onLogout,
  clientName,
  clientCompany,
  siteTexts
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showMobileThemeMenu, setShowMobileThemeMenu] = useState(false);

  const themeOptions = [
    { id: 'light', label: 'وضع فاتح', icon: <Sun size={14} /> },
    { id: 'dark', label: 'وضع داكن', icon: <Moon size={14} /> },
    { id: 'system', label: 'وضع النظام', icon: <Laptop size={14} /> },
  ] as const;

  const navItems = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'services', label: 'الخدمات' },
    { id: 'portfolio', label: 'أعمالنا' },
    { id: 'request', label: 'طلب مشروع' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="relative w-10 h-10 flex items-center justify-center">
              {siteTexts?.logoUrl ? (
                <img
                  src={siteTexts.logoUrl}
                  alt={siteTexts.logoText || 'إلهامك'}
                  className="w-10 h-10 object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  <svg viewBox="0 0 100 100" className="w-9 h-9 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round">
                    <path d="M20,50 C20,30 40,20 60,30 C80,40 80,70 55,75 C35,78 25,65 25,50 C25,35 45,25 75,45" />
                  </svg>
                  <div className="absolute inset-0 bg-brand-primary/20 blur-lg rounded-full -z-10 animate-pulse-slow"></div>
                </>
              )}
            </div>
            
            <div className="flex flex-col text-right">
              <span className="text-xl font-bold tracking-wide text-brand-dark dark:text-white font-sans">
                {siteTexts?.logoText || 'إلهامك'}
              </span>
              <span className="text-[9px] tracking-[0.2em] text-brand-dark-gray dark:text-brand-gray/60 uppercase font-sans -mt-1">
                ELHAMC
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" dir="rtl">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-sm font-medium transition-colors relative py-2 ${
                  activeTab === item.id
                    ? 'text-brand-primary font-semibold'
                    : 'text-brand-dark-gray dark:text-brand-gray hover:text-brand-primary'
                }`}
              >
                {item.label}
                {activeTab === item.id && (
                  <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-brand-primary rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Actions & Portal Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Portal navigation */}
            {isClientLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col items-end text-right">
                  <span className="text-[9px] text-brand-dark-gray/60 dark:text-brand-gray/40">أهلاً بك،</span>
                  <span className="text-xs font-bold text-brand-dark dark:text-white max-w-[120px] truncate">{clientCompany || clientName || 'العميل'}</span>
                </div>
                <button
                  onClick={() => setActiveTab('client-portal')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'client-portal'
                      ? 'bg-[#12C7C3] text-brand-dark shadow-[0_0_12px_rgba(18,199,195,0.3)]'
                      : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20'
                  }`}
                >
                  <User size={14} />
                  بوابة العميل
                </button>
              </div>
            ) : isAdminLoggedIn ? (
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'admin-dashboard'
                    ? 'bg-alert-warning text-brand-dark font-bold'
                    : 'bg-alert-warning/10 text-alert-warning hover:bg-alert-warning/20'
                }`}
              >
                <ShieldAlert size={14} />
                لوحة الإدارة
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('client-portal')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all border border-brand-primary/20 hover:border-brand-primary/60 text-brand-primary bg-transparent`}
              >
                <User size={14} />
                بوابة العملاء
              </button>
            )}

            {/* Theme Select Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2.5 rounded-xl bg-brand-light dark:bg-brand-dark-gray/30 hover:bg-brand-gray/40 dark:hover:bg-brand-dark-gray/60 transition-all text-brand-dark-gray dark:text-brand-gray flex items-center justify-center cursor-pointer border border-brand-gray/20 dark:border-brand-dark-gray/40"
                aria-label="Select Theme"
              >
                {theme === 'light' && <Sun size={18} />}
                {theme === 'dark' && <Moon size={18} />}
                {theme === 'system' && <Laptop size={18} />}
              </button>
              
              {showThemeMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
                  <div className="absolute left-0 mt-2 w-36 rounded-xl bg-white dark:bg-brand-dark border border-brand-gray/20 dark:border-brand-dark-gray/20 shadow-xl py-1.5 z-50 overflow-hidden" dir="rtl">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setTheme(opt.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full text-right px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                          theme === opt.id
                            ? 'bg-brand-primary/15 text-brand-primary'
                            : 'text-brand-dark-gray dark:text-brand-gray hover:bg-brand-light dark:hover:bg-brand-dark-gray/20'
                        }`}
                      >
                        <span className={theme === opt.id ? 'text-brand-primary' : 'text-brand-dark-gray/60 dark:text-brand-gray/50'}>
                          {opt.icon}
                        </span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Quick Admin Access */}
            {!isAdminLoggedIn && !isClientLoggedIn && (
              <button
                onClick={() => setActiveTab('admin-login')}
                className="text-[10px] text-brand-dark-gray/40 dark:text-brand-gray/30 hover:text-brand-primary transition-colors py-1 px-2 border border-brand-gray/20 dark:border-brand-dark-gray/20 rounded"
              >
                مدير
              </button>
            )}

            {(isClientLoggedIn || isAdminLoggedIn) && (
              <button
                onClick={onLogout}
                className="text-xs text-alert-error hover:underline px-2"
              >
                خروج
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Mobile Theme Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMobileThemeMenu(!showMobileThemeMenu)}
                className="p-2 rounded-lg bg-brand-light dark:bg-brand-dark-gray/30 text-brand-dark-gray dark:text-brand-gray flex items-center justify-center cursor-pointer border border-brand-gray/20 dark:border-brand-dark-gray/40"
              >
                {theme === 'light' && <Sun size={18} />}
                {theme === 'dark' && <Moon size={18} />}
                {theme === 'system' && <Laptop size={18} />}
              </button>
              
              {showMobileThemeMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMobileThemeMenu(false)} />
                  <div className="absolute left-0 mt-2 w-32 rounded-lg bg-white dark:bg-brand-dark border border-brand-gray/20 dark:border-brand-dark-gray/20 shadow-lg py-1.5 z-50 overflow-hidden text-right" dir="rtl">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setTheme(opt.id);
                          setShowMobileThemeMenu(false);
                        }}
                        className={`w-full text-right px-3 py-1.5 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                          theme === opt.id
                            ? 'bg-brand-primary/15 text-brand-primary'
                            : 'text-brand-dark-gray dark:text-brand-gray hover:bg-brand-light dark:hover:bg-brand-dark-gray/20'
                        }`}
                      >
                        <span className={theme === opt.id ? 'text-brand-primary' : 'text-brand-dark-gray/60 dark:text-brand-gray/50'}>
                          {opt.icon}
                        </span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-brand-light dark:bg-brand-dark-gray/30 text-brand-dark-gray dark:text-brand-gray"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-brand-gray/20 dark:border-brand-dark-gray/20 px-4 pt-4 pb-6 space-y-3" dir="rtl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`block w-full text-right py-2 px-3 rounded-xl text-base font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'hover:bg-brand-light dark:hover:bg-brand-dark-gray/20 text-brand-dark-gray dark:text-brand-gray'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-4 border-t border-brand-gray/20 dark:border-brand-dark-gray/20 space-y-2">
            {isClientLoggedIn ? (
              <button
                onClick={() => {
                  setActiveTab('client-portal');
                  setIsOpen(false);
                }}
                className="flex items-center justify-between w-full py-2.5 px-3 rounded-xl bg-brand-primary text-brand-dark font-bold text-sm"
              >
                <span className="flex items-center gap-2"><User size={16} /> بوابة العميل</span>
              </button>
            ) : isAdminLoggedIn ? (
              <button
                onClick={() => {
                  setActiveTab('admin-dashboard');
                  setIsOpen(false);
                }}
                className="flex items-center justify-between w-full py-2.5 px-3 rounded-xl bg-alert-warning text-brand-dark font-bold text-sm"
              >
                <span className="flex items-center gap-2"><ShieldAlert size={16} /> لوحة الإدارة</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('client-portal');
                  setIsOpen(false);
                }}
                className="flex items-center justify-between w-full py-2.5 px-3 rounded-xl border border-brand-primary/30 text-brand-primary text-sm font-medium"
              >
                <span className="flex items-center gap-2"><User size={16} /> دخول بوابة العملاء</span>
              </button>
            )}

            {!isAdminLoggedIn && !isClientLoggedIn && (
              <button
                onClick={() => {
                  setActiveTab('admin-login');
                  setIsOpen(false);
                }}
                className="block text-center w-full py-2 text-xs text-brand-dark-gray/60 dark:text-brand-gray/40"
              >
                تسجيل دخول الإدارة
              </button>
            )}

            {(isClientLoggedIn || isAdminLoggedIn) && (
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="block text-center w-full py-2 text-xs text-alert-error font-medium"
              >
                تسجيل الخروج
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
