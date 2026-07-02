/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Project, ProjectFile, ChatMessage, Service, CaseStudy, SiteTexts } from './types';
import { INITIAL_PROJECTS, SERVICES, CASE_STUDIES, INITIAL_SITE_TEXTS } from './data';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import RequestProject from './components/RequestProject';
import ClientPortal from './components/ClientPortal';
import AdminDashboard from './components/AdminDashboard';
import { Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Sparkles, ShieldCheck, HelpCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('elhamc_active_tab');
      if (saved && ['home', 'services', 'portfolio', 'request', 'client-portal', 'admin-login', 'admin-dashboard'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'home';
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const savedTheme = localStorage.getItem('elhamc_theme');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        return savedTheme as 'light' | 'dark' | 'system';
      }
    } catch (e) {
      console.error(e);
    }
    return 'dark';
  });
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // Projects state initialized safely from localStorage or defaults (lazy state initialization)
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = localStorage.getItem('elhamc_projects');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading projects from localStorage:', e);
    }
    // Deep clone to ensure INITIAL_PROJECTS is stable and never mutated directly
    return JSON.parse(JSON.stringify(INITIAL_PROJECTS));
  });
  
  // Auth state
  const [isClientLoggedIn, setIsClientLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('elhamc_client_logged_in') === 'true';
    } catch {
      return false;
    }
  });
  const [loggedInProjectCode, setLoggedInProjectCode] = useState<string | null>(() => {
    try {
      return localStorage.getItem('elhamc_logged_in_code');
    } catch {
      return null;
    }
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('elhamc_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      return localStorage.getItem('elhamc_admin_password') || '5398538';
    } catch {
      return '5398538';
    }
  });

  const handleUpdateAdminPassword = (newPassword: string) => {
    try {
      localStorage.setItem('elhamc_admin_password', newPassword);
      setAdminPassword(newPassword);
    } catch (e) {
      console.error(e);
    }
  };
  const [adminLoginError, setAdminLoginError] = useState<string>('');

  // Dynamically derive logged-in project directly from the master projects state for 100% stable sync
  const loggedInProject = isClientLoggedIn && loggedInProjectCode
    ? projects.find(p => p.code.toLowerCase() === loggedInProjectCode.toLowerCase()) || null
    : null;

  // Services state
  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem('elhamc_services');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error reading services:', e);
    }
    return JSON.parse(JSON.stringify(SERVICES));
  });

  // Case studies state (Portfolio)
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(() => {
    try {
      const saved = localStorage.getItem('elhamc_case_studies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error reading case studies:', e);
    }
    return JSON.parse(JSON.stringify(CASE_STUDIES));
  });

  // Site texts state
  const [siteTexts, setSiteTexts] = useState<SiteTexts>(() => {
    try {
      const saved = localStorage.getItem('elhamc_site_texts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading site texts:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_SITE_TEXTS));
  });

  // Load state from Express backend on startup
  useEffect(() => {
    fetch('/api/data')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (data.projects) setProjects(data.projects);
        if (data.services) setServices(data.services);
        if (data.caseStudies) setCaseStudies(data.caseStudies);
        if (data.siteTexts) setSiteTexts(data.siteTexts);
        setIsDataLoaded(true);
      })
      .catch(err => {
        console.error('Error loading database from server, falling back:', err);
        setIsDataLoaded(true);
      });
  }, []);

  // Auto-save state to Express backend whenever any state updates
  useEffect(() => {
    if (!isDataLoaded) return;

    const dataToSave = {
      projects,
      services,
      caseStudies,
      siteTexts
    };

    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSave)
    })
    .catch(err => console.error('Failed to sync to server:', err));
  }, [projects, services, caseStudies, siteTexts, isDataLoaded]);

  // Sync services state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elhamc_services', JSON.stringify(services));
    } catch (e) {
      console.error('Failed to sync services:', e);
    }
  }, [services]);

  // Sync caseStudies state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elhamc_case_studies', JSON.stringify(caseStudies));
    } catch (e) {
      console.error('Failed to sync case studies:', e);
    }
  }, [caseStudies]);

  // Sync siteTexts state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elhamc_site_texts', JSON.stringify(siteTexts));
    } catch (e) {
      console.error('Failed to sync site texts:', e);
    }
  }, [siteTexts]);

  // Sync projects state to localStorage with robust error handling
  useEffect(() => {
    try {
      localStorage.setItem('elhamc_projects', JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to sync projects to localStorage:', e);
      if (e instanceof DOMException && (
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        console.warn('localStorage quota exceeded. Data may not persist across page reloads.');
      }
    }
  }, [projects]);

  // Sync activeTab to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elhamc_active_tab', activeTab);
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);

  // Sync client login state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elhamc_client_logged_in', String(isClientLoggedIn));
    } catch (e) {
      console.error(e);
    }
  }, [isClientLoggedIn]);

  // Sync logged in project code to localStorage
  useEffect(() => {
    try {
      if (loggedInProjectCode) {
        localStorage.setItem('elhamc_logged_in_code', loggedInProjectCode);
      } else {
        localStorage.removeItem('elhamc_logged_in_code');
      }
    } catch (e) {
      console.error(e);
    }
  }, [loggedInProjectCode]);

  // Sync admin login state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elhamc_admin_logged_in', String(isAdminLoggedIn));
    } catch (e) {
      console.error(e);
    }
  }, [isAdminLoggedIn]);

  // Sync theme class with document element and body
  useEffect(() => {
    try {
      localStorage.setItem('elhamc_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    const applyTheme = (dark: boolean) => {
      if (dark) {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  // Derive isDark boolean for conditional rendering if needed
  const isDark = theme === 'system'
    ? (typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true)
    : theme === 'dark';

  // Note: We intentionally avoid an aggressive useEffect logout guard on projects existence here.
  // Instead, loggedInProject is safely and dynamically derived from the master projects state.
  // This keeps the user session perfectly stable and prevents unexpected logouts during active edits,
  // chat updates, file uploads, and hot-reloads. If a project is deleted, ClientPortal gracefully
  // shows the secure login gate.

  // Handle Client Login using ONLY the project password (format: elhXXXX)
  const handleClientLogin = (password: string): boolean => {
    const trimmedPass = password.trim().toLowerCase();
    const project = projects.find(p => p.password && p.password.toLowerCase() === trimmedPass);
    if (project) {
      setLoggedInProjectCode(project.code);
      setIsClientLoggedIn(true);
      setIsAdminLoggedIn(false);
      setActiveTab('client-portal');
      return true;
    }
    return false;
  };

  // Handle Admin Login
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    if (adminPasswordInput.trim() === adminPassword) {
      setIsAdminLoggedIn(true);
      setIsClientLoggedIn(false);
      setLoggedInProjectCode(null);
      setActiveTab('admin-dashboard');
      setAdminPasswordInput('');
    } else {
      setAdminLoginError('رمز الإدارة السري غير صحيح. يرجى إدخال الرمز المعتمد.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsClientLoggedIn(false);
    setLoggedInProjectCode(null);
    setIsAdminLoggedIn(false);
    setActiveTab('home');
  };

  // Add project (triggered by RequestProject success form) using functional state updates and deep copying
  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [JSON.parse(JSON.stringify(newProject)), ...prev]);
  };

  // Update project fields using functional state updates to prevent conflicts and deep copying
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => {
      const exists = prev.some(p => p.id === updatedProject.id);
      if (exists) {
        return prev.map(p => p.id === updatedProject.id ? JSON.parse(JSON.stringify(updatedProject)) : p);
      } else {
        return [JSON.parse(JSON.stringify(updatedProject)), ...prev];
      }
    });
  };

  // Delete project using functional state updates
  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Add Message to Chat Notes using functional state updates and deep copying
  const handleAddMessage = (projectCode: string, message: ChatMessage) => {
    setProjects(prev => prev.map(p => {
      if (p.code.toLowerCase() === projectCode.toLowerCase()) {
        return {
          ...p,
          notes: [...p.notes, JSON.parse(JSON.stringify(message))]
        };
      }
      return p;
    }));
  };

  // Upload file to project files list using functional state updates and deep copying
  const handleUploadFile = (projectCode: string, file: ProjectFile) => {
    setProjects(prev => prev.map(p => {
      if (p.code.toLowerCase() === projectCode.toLowerCase()) {
        return {
          ...p,
          files: [JSON.parse(JSON.stringify(file)), ...p.files]
        };
      }
      return p;
    }));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300 dark:bg-brand-dark bg-brand-light text-brand-dark dark:text-white">
      
      {/* Floating navigation bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        isClientLoggedIn={isClientLoggedIn}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
        clientName={loggedInProject?.clientName}
        clientCompany={loggedInProject?.company}
        siteTexts={siteTexts}
      />

      {/* Main Content Area */}
      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'home' && (
              <div className="space-y-6">
                <Hero
                  onStartProject={() => setActiveTab('request')}
                  onEnterPortal={() => setActiveTab('client-portal')}
                  siteTexts={siteTexts}
                  projects={projects}
                />
                
                {/* Visual sneak peek at Services and Portfolio on homepage */}
                <Services onStartProject={(id) => setActiveTab('request')} services={services} siteTexts={siteTexts} />
                
                <Portfolio onStartProject={() => setActiveTab('request')} caseStudies={caseStudies} siteTexts={siteTexts} />
                
                {/* Why Us section with bento-style list */}
                <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
                  <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-brand-primary">{siteTexts.whyUsTag || 'نهج استوديو إلهامك'}</h2>
                    <h3 className="text-3xl font-bold">{siteTexts.whyUsTitle || 'لماذا يستعين بنا قادة العلامات التجارية؟'}</h3>
                    <p className="text-brand-dark-gray dark:text-brand-gray/60 text-sm leading-relaxed">
                      {siteTexts.whyUsDesc || 'نحن نوفر تجربة تصميم متكاملة تنقل مشروعك من الفكرة المبدئية إلى التميز في الواقع، بأسلوب إدارة آمن ومحكم بنسبة 100%.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <div className="glass-panel p-8 rounded-3xl border border-white/40 dark:border-white/5 shadow-md space-y-4">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary font-bold">✓</div>
                      <h4 className="text-base font-bold text-brand-dark dark:text-white">{siteTexts.whyUsCard1Title || 'إشراف إبداعي مباشر'}</h4>
                      <p className="text-xs text-brand-dark-gray dark:text-brand-gray/70 leading-relaxed text-justify">
                        {siteTexts.whyUsCard1Desc || 'كل مشروع يتم الإشراف عليه وإخراجه من قبل مخرجة إبداعية متخصصة، لضمان التفرد التام والبعد عن تكرار الأفكار السائدة بالسوق.'}
                      </p>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl border border-white/40 dark:border-white/5 shadow-md space-y-4">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary font-bold">✓</div>
                      <h4 className="text-base font-bold text-brand-dark dark:text-white">{siteTexts.whyUsCard2Title || 'منصة تواصل ومتابعة آمنة'}</h4>
                      <p className="text-xs text-brand-dark-gray dark:text-brand-gray/70 leading-relaxed text-justify">
                        {siteTexts.whyUsCard2Desc || 'بوابتنا الحصرية تضمن لك الخصوصية الكاملة. لا بريد عشوائي، لا واتساب متقطع، ملفاتك وتحديثات تعديلاتك مستقرة في مكان واحد آمن.'}
                      </p>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl border border-white/40 dark:border-white/5 shadow-md space-y-4">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary font-bold">✓</div>
                      <h4 className="text-base font-bold text-brand-dark dark:text-white">{siteTexts.whyUsCard3Title || 'التسليم بالصيغ المفتوحة'}</h4>
                      <p className="text-xs text-brand-dark-gray dark:text-brand-gray/70 leading-relaxed text-justify">
                        {siteTexts.whyUsCard3Desc || 'عند انتهاء المشروع، نسلمك حزمة الإنتاج الكاملة وصيغ الطباعة المفتوحة ودليل استخدام الهوية لتسهيل العمل في المستقبل.'}
                      </p>
                    </div>

                  </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-brand-light/40 dark:bg-brand-dark-gray/5 border-y border-brand-gray/20 dark:border-brand-dark-gray/20 text-right" dir="rtl">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="text-center space-y-4 mb-12">
                      <h3 className="text-2xl font-bold">{siteTexts.faqTitle || 'الأسئلة الشائعة'}</h3>
                      <p className="text-xs text-brand-dark-gray/60 dark:text-brand-gray/40">{siteTexts.faqDesc || 'تعرف على نظام العمل الحصري والمبتكر في إلهامك'}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="glass-panel p-5 rounded-2xl border border-white/40 dark:border-white/5">
                        <h4 className="text-sm font-bold text-brand-dark dark:text-white mb-2 flex items-center gap-2">
                          <HelpCircle size={15} className="text-brand-primary" />
                          {siteTexts.faqQ1 || 'هل استوديو إلهامك هو منصة لعرض أعمال المصممين المستقلين؟'}
                        </h4>
                        <p className="text-xs text-brand-dark-gray dark:text-brand-gray/70 leading-relaxed text-justify pr-6">
                          {siteTexts.faqA1 || 'لا، إلهامك هو استوديو تصميم وهوية بصرية خاص ومرموق يعمل به فريق إبداعي موحد ومسؤول عن إنتاج المشاريع بأنفسنا. نحن لسنا منصة للعمل الحر أو لجمع المصممين الخارجيين، بل نحقق أعلى معايير الجودة بشكل موحد وتحت جودة الاستوديو الصارمة.'}
                        </p>
                      </div>

                      <div className="glass-panel p-5 rounded-2xl border border-white/40 dark:border-white/5">
                        <h4 className="text-sm font-bold text-brand-dark dark:text-white mb-2 flex items-center gap-2">
                          <HelpCircle size={15} className="text-brand-primary" />
                          {siteTexts.faqQ2 || 'كيف يمكنني متابعة سير وتطورات تصميم هويتي بعد الحجز؟'}
                        </h4>
                        <p className="text-xs text-brand-dark-gray dark:text-brand-gray/70 leading-relaxed text-justify pr-6">
                          {siteTexts.faqA2 || 'فور تقديمك لطلب مشروع جديد من المنصة، سيولد النظام تلقائياً "كود مشروع" خاص و "كلمة مرور" آمنة. يمكنك كتابتها في (بوابة العميل) لتنتقل إلى لوحتك التفاعلية، حيث يمكنك رؤية نسبة الإنجاز والجدول الزمني الزمني، وتحميل نسخ المراجعة المبدئية، والتحدث مباشرة معنا لطلب أي تعديلات.'}
                        </p>
                      </div>

                      <div className="glass-panel p-5 rounded-2xl border border-white/40 dark:border-white/5">
                        <h4 className="text-sm font-bold text-brand-dark dark:text-white mb-2 flex items-center gap-2">
                          <HelpCircle size={15} className="text-brand-primary" />
                          {siteTexts.faqQ3 || 'ما هي الصيغ والملفات النهائية التي أحصل عليها عند اكتمال المشروع؟'}
                        </h4>
                        <p className="text-xs text-brand-dark-gray dark:text-brand-gray/70 leading-relaxed text-justify pr-6">
                          {siteTexts.faqA3 || 'نحن نسلمك ملفات العمل المتجهة الأصلية والمفتوحة بصيغ (AI, SVG) بالإضافة إلى صيغ الاستخدام المباشر (PDF, PNG) عالية الجودة، فضلاً عن تسليم كتاب إرشادات الهوية (Brand Guidelines) الشامل لمساعدتك على الحفاظ على ثبات تطبيقات هويتك مستقبلاً.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Customer Reviews section */}
                <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
                  <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                    <div className="inline-flex items-center gap-1 text-alert-warning bg-alert-warning/10 px-3 py-1.5 rounded-full text-[10px] font-bold">
                      <Star size={12} fill="currentColor" />
                      <span>آراء عملائنا وتقييمات جودة الأداء</span>
                    </div>
                    <h3 className="text-3xl font-bold">شركاء النجاح يعبرون عن تجربتهم</h3>
                    <p className="text-brand-dark-gray dark:text-brand-gray/60 text-sm leading-relaxed">
                      نؤمن بأن جودة الخدمة، وسلاسة التواصل عبر بوابتنا التفاعلية، والتفرد الفني هي قيمنا الأساسية الموثقة بآراء حقيقية.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Map project reviews */}
                    {projects
                      .filter(p => p.clientReview && p.clientReview.rating > 0)
                      .map((proj, idx) => (
                        <div key={proj.id || idx} className="glass-panel p-8 rounded-[32px] border border-white/40 dark:border-white/5 shadow-md hover:border-brand-primary/20 transition-all flex flex-col justify-between space-y-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1 text-alert-warning">
                                {Array.from({ length: proj.clientReview?.rating || 5 }).map((_, i) => (
                                  <Star key={i} size={14} fill="currentColor" />
                                ))}
                              </div>
                              <span className="text-[10px] text-brand-dark-gray/50 dark:text-brand-gray/40 font-mono">{proj.clientReview?.date}</span>
                            </div>

                            <p className="text-xs text-brand-dark-gray dark:text-brand-gray/80 leading-relaxed text-justify italic">
                              "{proj.clientReview?.comment}"
                            </p>
                          </div>

                          <div className="pt-4 border-t border-brand-gray/10 dark:border-brand-dark-gray/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs shrink-0">
                              {(proj.clientReview?.reviewerName || proj.clientName || 'ع').charAt(0)}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-brand-dark dark:text-white">{proj.clientReview?.reviewerName || proj.clientName}</h5>
                              <p className="text-[9px] text-[#12C7C3] font-bold">{proj.name.split(' ').slice(0, 4).join(' ')}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Show static reviews alongside to keep the space populated and beautiful */}
                    {projects.filter(p => p.id === 'proj_01' && p.clientReview && p.clientReview.rating > 0).length === 0 && (
                      <div className="glass-panel p-8 rounded-[32px] border border-white/40 dark:border-white/5 shadow-md flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 text-alert-warning">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={14} fill="currentColor" />
                              ))}
                            </div>
                            <span className="text-[10px] text-brand-dark-gray/50 dark:text-brand-gray/40 font-mono">2026-06-25</span>
                          </div>
                          <p className="text-xs text-brand-dark-gray dark:text-brand-gray/80 leading-relaxed text-justify italic">
                            "عمل متميز جداً ودقة فائقة في التفاصيل البصرية وتجاوب سريع ومثالي من المخرج الإبداعي المشرف على مشروع عطور أصيل. بوابة متابعة العمل التفاعلية سهلت لنا التواصل والمراجعة بدون أي تعقيد!"
                          </p>
                        </div>
                        <div className="pt-4 border-t border-brand-gray/10 dark:border-brand-dark-gray/10 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs shrink-0">ع</div>
                          <div>
                            <h5 className="text-xs font-bold text-brand-dark dark:text-white">عبد الرحمن السبيعي</h5>
                            <p className="text-[9px] text-[#12C7C3] font-bold">تصميم الهوية البصرية لعلامة أصيل للعطور</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {projects.filter(p => p.id === 'proj_02' && p.clientReview && p.clientReview.rating > 0).length === 0 && (
                      <div className="glass-panel p-8 rounded-[32px] border border-white/40 dark:border-white/5 shadow-md flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 text-alert-warning">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={14} fill="currentColor" />
                              ))}
                            </div>
                            <span className="text-[10px] text-brand-dark-gray/50 dark:text-brand-gray/40 font-mono">2026-06-15</span>
                          </div>
                          <p className="text-xs text-brand-dark-gray dark:text-brand-gray/80 leading-relaxed text-justify italic">
                            "تجربة رائعة للغاية، تتبع نسب الإنجاز والمراحل من خلال بوابتهم التفاعلية غير مفهوم التصميم التقليدي بالنسبة لنا. التصاميم جاءت بفخامة تليق بعلامتنا القابضة."
                          </p>
                        </div>
                        <div className="pt-4 border-t border-brand-gray/10 dark:border-brand-dark-gray/10 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#12C7C3]/10 flex items-center justify-center text-[#12C7C3] font-bold text-xs shrink-0">خ</div>
                          <div>
                            <h5 className="text-xs font-bold text-brand-dark dark:text-white">م. خالد الشهري</h5>
                            <p className="text-[9px] text-[#12C7C3] font-bold">تصميم وتطوير الموقع الإلكتروني لشركة مدى</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
                
                {/* Luxury CTA Banner */}
                <section className="py-24 max-w-5xl mx-auto px-4 text-center">
                  <div className="glass-panel p-10 sm:p-16 rounded-3xl border border-brand-primary/20 shadow-2xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-secondary/10 rounded-full blur-2xl -z-10"></div>
                    
                    <h3 className="text-3xl font-bold tracking-tight text-brand-dark dark:text-white font-sans">
                      {siteTexts.ctaTitle || 'لنصمم شيئاً عظيماً لعلامتك التجارية'}
                    </h3>
                    <p className="text-sm text-brand-dark-gray dark:text-brand-gray/70 max-w-xl mx-auto leading-relaxed">
                      {siteTexts.ctaDesc || 'اتخذ الخطوة اليوم وانضم لنخبة الكيانات التي وثقت في تفاصيل إلهامك لإطلاق هويتها البصرية وإدارة مشاريعها بسلاسة.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('request')}
                      className="px-8 py-4 bg-brand-primary text-brand-dark font-bold text-sm rounded-xl hover:bg-brand-secondary transition-all glow-primary mx-auto"
                    >
                      {siteTexts.ctaButton || 'احجز جلسة استشارية واطلب مشروعك'}
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'services' && (
              <Services onStartProject={(id) => setActiveTab('request')} services={services} siteTexts={siteTexts} />
            )}

            {activeTab === 'portfolio' && (
              <Portfolio onStartProject={() => setActiveTab('request')} caseStudies={caseStudies} siteTexts={siteTexts} />
            )}

            {activeTab === 'request' && (
              <RequestProject
                onAddProject={handleAddProject}
                onNavigateToPortal={() => setActiveTab('client-portal')}
                siteTexts={siteTexts}
                services={services}
              />
            )}

            {activeTab === 'client-portal' && (
              <ClientPortal
                projects={projects}
                isLoggedIn={isClientLoggedIn}
                loggedInProject={loggedInProject}
                onLogin={handleClientLogin}
                onLogout={handleLogout}
                onAddMessage={handleAddMessage}
                onUploadFile={handleUploadFile}
                onUpdateProject={handleUpdateProject}
                services={services}
              />
            )}

            {/* Admin Login Panel tab */}
            {activeTab === 'admin-login' && (
              <div className="py-24 flex items-center justify-center min-h-[60vh]" dir="rtl">
                <div className="max-w-md w-full px-4">
                  <div className="glass-panel p-8 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl space-y-6 text-center">
                    <div className="w-12 h-12 bg-alert-warning/10 rounded-full flex items-center justify-center text-alert-warning mx-auto">
                      <ShieldCheck size={24} />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-brand-dark dark:text-white">تسجيل دخول المشرف العام</h3>
                      <p className="text-xs text-brand-dark-gray dark:text-brand-gray/50">أدخل الرمز للتأكيد والانتقال إلى لوحة التحكم الإدارية</p>
                    </div>

                    <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-right">
                      <div className="space-y-1.5">
                        <label className="text-xs text-brand-dark dark:text-white font-semibold">الرمز السري الرئيسي للإدارة</label>
                        <input
                          type="password"
                          required
                          value={adminPasswordInput}
                          onChange={(e) => setAdminPasswordInput(e.target.value)}
                          placeholder="أدخل كلمة المرور الخاصة بالإدارة..."
                          className="w-full text-xs bg-white dark:bg-brand-dark border border-brand-gray/40 rounded-xl py-2.5 px-4 outline-none focus:border-brand-primary text-center font-mono"
                        />
                      </div>

                      {adminLoginError && (
                        <p className="text-[10px] text-alert-error font-bold text-center">{adminLoginError}</p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 bg-brand-primary text-brand-dark hover:bg-brand-secondary rounded-xl text-xs font-bold transition-all"
                      >
                        تأكيد الدخول للوحة التحكم
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admin-dashboard' && (
              isAdminLoggedIn ? (
                <AdminDashboard
                  projects={projects}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleDeleteProject}
                  services={services}
                  onUpdateServices={setServices}
                  caseStudies={caseStudies}
                  onUpdateCaseStudies={setCaseStudies}
                  siteTexts={siteTexts}
                  onUpdateSiteTexts={setSiteTexts}
                  onImportBackup={(data) => {
                    if (data.projects) setProjects(data.projects);
                    if (data.services) setServices(data.services);
                    if (data.caseStudies) setCaseStudies(data.caseStudies);
                    if (data.siteTexts) setSiteTexts(data.siteTexts);
                  }}
                  adminPassword={adminPassword}
                  onUpdateAdminPassword={handleUpdateAdminPassword}
                />
              ) : (
                <div className="py-24 text-center" dir="rtl">
                  <div className="max-w-md mx-auto px-4">
                    <div className="glass-panel p-8 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl space-y-4">
                      <p className="text-sm text-brand-dark-gray dark:text-brand-gray/60 font-bold">عذراً، يجب تسجيل الدخول كمسؤول للوصول إلى هذه اللوحة.</p>
                      <button
                        onClick={() => setActiveTab('admin-login')}
                        className="px-6 py-2.5 bg-brand-primary text-brand-dark rounded-xl text-xs font-bold transition-all hover:bg-brand-secondary"
                      >
                        الذهاب لصفحة تسجيل دخول الإدارة
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Luxury Footer */}
      <footer className="bg-brand-light dark:bg-[#121212] border-t border-brand-gray/20 dark:border-brand-dark-gray/30 pt-16 pb-12 transition-colors duration-300" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-right">
            
            {/* Branding Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 100 100" className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round">
                  <path d="M20,50 C20,30 40,20 60,30 C80,40 80,70 55,75 C35,78 25,65 25,50 C25,35 45,25 75,45" />
                </svg>
                <div>
                  <h4 className="text-lg font-bold text-brand-dark dark:text-white">استوديو إلهامك</h4>
                  <p className="text-[8px] tracking-[0.2em] text-brand-dark-gray/60 dark:text-brand-gray/40 -mt-1 uppercase">ELHAMC STUDIO</p>
                </div>
              </div>
              
              <p className="text-xs text-brand-dark-gray dark:text-brand-gray/60 leading-relaxed text-justify">
                موقع مصمم جرافيك إبداعي متخصص في تصميم وتطوير الهويات البصرية المتميزة، ابتكار التغليف الفريد، وبناء التجارب الرقمية الراقية وفق معايير هندسية وجمالية تبرز قوة وجودة علامتك التجارية.
              </p>
            </div>

            {/* Links Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-brand-dark dark:text-white">الاستكشاف السريع</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => setActiveTab('home')} className="text-brand-dark-gray dark:text-brand-gray/60 hover:text-brand-primary transition-colors">الرئيسية</button></li>
                <li><button onClick={() => setActiveTab('services')} className="text-brand-dark-gray dark:text-brand-gray/60 hover:text-brand-primary transition-colors">خدمات الاستوديو</button></li>
                <li><button onClick={() => setActiveTab('portfolio')} className="text-brand-dark-gray dark:text-brand-gray/60 hover:text-brand-primary transition-colors">معرض الأعمال المتميزة</button></li>
                <li><button onClick={() => setActiveTab('request')} className="text-brand-dark-gray dark:text-brand-gray/60 hover:text-brand-primary transition-colors">طلب وحجز مشروع</button></li>
              </ul>
            </div>

            {/* Contact Details Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-brand-dark dark:text-white">التواصل المباشر</h4>
              <ul className="space-y-2.5 text-xs text-brand-dark-gray dark:text-brand-gray/60">
                <li className="flex items-center gap-2.5">
                  <Mail size={14} className="text-brand-primary shrink-0" />
                  <span>boomar.des@gmail.com</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone size={14} className="text-brand-primary shrink-0" />
                  <a href="https://wa.me/967775398538" target="_blank" rel="noopener noreferrer" className="font-mono hover:text-[#12C7C3] transition-colors">775398538 (967+)</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-brand-primary font-bold text-xs shrink-0 font-mono">@</span>
                  <a href="https://t.me/boomar_des" target="_blank" rel="noopener noreferrer" className="hover:text-[#12C7C3] transition-colors">@boomar.des</a>
                </li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-brand-dark dark:text-white">نشرة الإلهام الإبداعية</h4>
              <p className="text-xs text-brand-dark-gray dark:text-brand-gray/60 leading-relaxed">
                اشترك لتصلك تحليلات دورية ملهمة ومشاريع استوديو إلهامك الجديدة أولاً بأول.
              </p>
              {subscribed ? (
                <p className="text-xs text-[#12C7C3] font-bold">✓ تم الاشتراك بنجاح في نشرة الإلهام!</p>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="بريدك الإلكتروني..."
                    className="flex-1 text-xs bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/50 rounded-xl py-2 px-3 text-right text-brand-dark dark:text-white outline-none focus:border-brand-primary"
                  />
                  <button
                    onClick={() => setSubscribed(true)}
                    className="py-2 px-4 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-bold text-xs rounded-xl transition-all"
                  >
                    اشتراك
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Social and Copyright bar */}
          <div className="mt-12 pt-8 border-t border-brand-gray/20 dark:border-brand-dark-gray/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-brand-dark-gray/60 dark:text-brand-gray/40">
            <p>© {new Date().getFullYear()} استوديو إلهامك للتصميم والحلول الإبداعية. جميع الحقوق محفوظة.</p>
            
            {/* Social icons */}
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-brand-primary transition-colors text-brand-dark-gray dark:text-brand-gray" aria-label="Instagram"><Instagram size={16} /></a>
              <a href="#" className="hover:text-brand-primary transition-colors text-brand-dark-gray dark:text-brand-gray" aria-label="Twitter"><Twitter size={16} /></a>
              <a href="#" className="hover:text-brand-primary transition-colors text-brand-dark-gray dark:text-brand-gray" aria-label="Linkedin"><Linkedin size={16} /></a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
