/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Project, ProjectFile, ChatMessage, Service } from '../types';
import { Lock, FileText, Download, Upload, Send, CheckCircle2, AlertTriangle, Clock, ArrowRight, MessageSquare, Files, Activity, Sparkles, ChevronDown, Star, Coins, Receipt, Share2, Copy } from 'lucide-react';
import { motion } from 'motion/react';

interface ClientPortalProps {
  projects: Project[];
  isLoggedIn: boolean;
  loggedInProject: Project | null;
  onLogin: (password: string) => boolean;
  onLogout: () => void;
  onAddMessage: (projectCode: string, message: ChatMessage) => void;
  onUploadFile: (projectCode: string, file: ProjectFile) => void;
  onUpdateProject?: (updatedProject: Project) => void;
  services?: Service[];
}

export default function ClientPortal({
  projects,
  isLoggedIn,
  loggedInProject,
  onLogin,
  onLogout,
  onAddMessage,
  onUploadFile,
  onUpdateProject,
  services
}: ClientPortalProps) {
  // Login states
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Active section inside portal
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'files' | 'chat' | 'history' | 'financials'>('overview');

  // Client rating/review states
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [copiedLedger, setCopiedLedger] = useState(false);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDesc, setUploadDesc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat input
  const [chatText, setChatText] = useState('');
  const [chatAttachment, setChatAttachment] = useState<{ name: string; size: string } | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = onLogin(password.trim());
    if (!success) {
      setLoginError('كلمة المرور غير صحيحة، يرجى المحاولة مجدداً أو مراجعة الرسالة المسلمة لك.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && loggedInProject) {
      const file = e.target.files[0];
      setIsUploading(true);
      setUploadProgress(10);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
              const newFile: ProjectFile = {
                id: `file_${Date.now()}`,
                name: file.name,
                version: 'V' + ((loggedInProject.files.length + 1) || 1) + '.0',
                date: new Date().toISOString().split('T')[0],
                size: `${sizeInMB} MB`,
                description: uploadDesc || 'ملف مرفق ومرفوع من قبل العميل لمراجعته.',
                type: file.name.split('.').pop()?.toUpperCase() || 'FILE'
              };
              onUploadFile(loggedInProject.code, newFile);
              setIsUploading(false);
              setUploadDesc('');
              setUploadProgress(0);
            }, 500);
            return 100;
          }
          return prev + 30;
        });
      }, 200);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!chatText.trim() && !chatAttachment) || !loggedInProject) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'client',
      text: chatText.trim(),
      date: new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      attachment: chatAttachment ? { name: chatAttachment.name, size: chatAttachment.size } : undefined
    };

    onAddMessage(loggedInProject.code, newMsg);
    setChatText('');
    setChatAttachment(null);

    // Simulate an automatic designer acknowledgement response to make the chat feel alive!
    setTimeout(() => {
      const systemAck: ChatMessage = {
        id: `msg_sys_${Date.now()}`,
        sender: 'admin',
        text: 'نشكرك على ملاحظتك وسؤالك. تم تمرير التحديث مباشرة للمخرج الإبداعي المشرف على مشروعكم وسيتم الإجابة أو تعديل الملفات المطلوبة خلال ساعات العمل الرسمية.',
        date: new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      };
      onAddMessage(loggedInProject.code, systemAck);
    }, 2500);
  };

  const handleChatFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setChatAttachment({ name: file.name, size: `${sizeInMB} MB` });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold">تم استلام الطلب</span>;
      case 'design':
        return <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-full text-xs font-bold">مرحلة التصميم والإعداد</span>;
      case 'review':
        return <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold">مراجعة العميل</span>;
      case 'modification':
        return <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold">إجراء التعديلات</span>;
      case 'delivered':
        return <span className="bg-alert-success/10 text-alert-success border border-alert-success/20 px-3 py-1 rounded-full text-xs font-bold">تم التسليم النهائي</span>;
      default:
        return null;
    }
  };

  // If client is not logged in, show secure glassmorphic login screen
  if (!isLoggedIn || !loggedInProject) {
    return (
      <div className="py-24 flex items-center justify-center min-h-[70vh]" dir="rtl">
        <div className="max-w-md w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 rounded-3xl border border-white/40 dark:border-white/5 shadow-2xl space-y-6 text-center"
          >
            <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mx-auto">
              <Lock size={22} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-brand-dark dark:text-white">دخول بوابة العميل الآمنة</h2>
              <p className="text-xs text-brand-dark-gray dark:text-brand-gray/60 leading-relaxed">
                يرجى إدخال كلمة المرور الخاصة بمشروعك (مثال: elh9482) لمتابعة سير العمل وتحميل وتعديل الملفات.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-right">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-dark dark:text-white">كلمة المرور الخاصة بالمشروع</label>
                <input
                  type="text"
                  required
                  placeholder="elhXXXX"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm bg-white dark:bg-brand-dark border border-brand-gray dark:border-brand-dark-gray/40 rounded-xl py-2.5 px-4 outline-none focus:border-brand-primary transition-colors text-right font-mono"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-alert-error/15 border border-alert-error/20 text-alert-error text-xs leading-relaxed flex gap-2 items-start">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-bold text-xs rounded-xl transition-all glow-primary flex items-center justify-center gap-2"
              >
                <span>التحقق والدخول للبوابة الآمنة</span>
                <ArrowRight size={14} className="rotate-180" />
              </button>
            </form>

            <div className="pt-2 border-t border-brand-gray/20 dark:border-brand-dark-gray/20 text-center">
              <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40">
                مشروعك جديد؟ اطلب مشروعاً لتوليد كلمة مرور دخول تلقائية.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Dashboard calculations for progress circle
  const strokeDashoffset = 251.2 - (251.2 * loggedInProject.progress) / 100;

  return (
    <div className="py-24" dir="rtl">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-dark dark:bg-white text-white dark:text-brand-dark px-5 py-3 rounded-2xl shadow-xl border border-white/10 dark:border-brand-dark-gray/10 text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#12C7C3] animate-pulse"></span>
          {toastMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top welcome band & status */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
          <div className="space-y-2 text-right">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-brand-primary font-bold">{loggedInProject.company}</span>
              {getStatusBadge(loggedInProject.status)}
            </div>
            <h2 className="text-2xl font-bold text-brand-dark dark:text-white">
              {loggedInProject.name}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-dark-gray/60 dark:text-brand-gray/40">
              <span>كود المشروع: <b className="font-mono">{loggedInProject.code}</b></span>
              <span>•</span>
              <span>تاريخ البداية: {loggedInProject.startDate}</span>
              <span>•</span>
              <span>موعد التسليم المتوقع: {loggedInProject.deliveryDate}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="text-xs font-semibold text-alert-error hover:bg-alert-error/10 border border-alert-error/20 py-2 px-4 rounded-xl transition-colors"
          >
            تسجيل خروج من البوابة
          </button>
        </div>

        {/* Core Workspace Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-brand-primary text-brand-dark'
                : 'bg-brand-light dark:bg-brand-dark-gray/20 text-brand-dark-gray dark:text-brand-gray hover:bg-brand-gray/30'
            }`}
          >
            <Activity size={14} />
            نظرة عامة ومستجدات
          </button>
          
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'bg-brand-primary text-brand-dark'
                : 'bg-brand-light dark:bg-brand-dark-gray/20 text-brand-dark-gray dark:text-brand-gray hover:bg-brand-gray/30'
            }`}
          >
            <Clock size={14} />
            مراحل المشروع (Timeline)
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'files'
                ? 'bg-brand-primary text-brand-dark'
                : 'bg-brand-light dark:bg-brand-dark-gray/20 text-brand-dark-gray dark:text-brand-gray hover:bg-brand-gray/30'
            }`}
          >
            <Files size={14} />
            الرواسم والملفات ({loggedInProject.files.length})
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-brand-primary text-brand-dark'
                : 'bg-brand-light dark:bg-brand-dark-gray/20 text-brand-dark-gray dark:text-brand-gray hover:bg-brand-gray/30'
            }`}
          >
            <MessageSquare size={14} />
            تبادل الملاحظات والدردشة ({loggedInProject.notes.length})
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'financials'
                ? 'bg-brand-primary text-brand-dark shadow-[0_2px_10px_rgba(18,199,195,0.2)]'
                : 'bg-brand-light dark:bg-brand-dark-gray/20 text-brand-dark-gray dark:text-brand-gray hover:bg-brand-gray/30'
            }`}
          >
            <Coins size={14} />
            الحساب المالي والتقييم
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (() => {
          const activeStep = loggedInProject.timeline.find(step => step.status === 'active') || loggedInProject.timeline[loggedInProject.timeline.length - 1];
          const activeStepTitle = activeStep ? activeStep.title : 'قيد المراجعة';
          
          // Calculate dynamic percentage of timeline completed
          const activeIndex = loggedInProject.timeline.findIndex(s => s.status === 'active');
          const completedCount = loggedInProject.timeline.filter(s => s.status === 'completed').length;
          const totalSteps = loggedInProject.timeline.length;
          const linePercent = totalSteps > 1 ? (completedCount / (totalSteps - 1)) * 100 : 0;

          // Helper to get extension class color
          const getFileExtColor = (ext: string) => {
            switch (ext.toUpperCase()) {
              case 'PDF': return 'text-red-500';
              case 'SVG': return 'text-blue-500';
              case 'AI': return 'text-amber-500';
              case 'ZIP': return 'text-purple-500';
              default: return 'text-emerald-500';
            }
          };

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-right">
              
              {/* Right Side Column (col-span-4): Project Stats & Progress */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Progress Card */}
                <div className="bg-white dark:bg-[#1a1a1a]/95 rounded-[32px] p-8 shadow-xl shadow-black/[0.03] dark:shadow-black/20 border border-white dark:border-white/5 flex flex-col items-center">
                  <h3 className="text-brand-dark-gray dark:text-brand-gray/80 text-sm font-medium mb-6 w-full text-right">حالة المشروع الإجمالية</h3>
                  
                  {/* Circle SVG */}
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="var(--color-brand-light)" className="dark:stroke-brand-dark-gray/20" strokeWidth="12" fill="transparent" />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="#12C7C3"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray="552.92"
                        strokeDashoffset={552.92 - (552.92 * loggedInProject.progress) / 100}
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(18,199,195,0.4)] transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-brand-dark dark:text-white">{loggedInProject.progress}%</span>
                      <span className="text-[10px] uppercase tracking-widest text-[#4A4F57] dark:text-brand-gray/60 opacity-60 font-semibold">قيد التنفيذ</span>
                    </div>
                  </div>

                  {/* Highlight pill details */}
                  <div className="mt-8 flex gap-4 w-full" dir="rtl">
                    <div className="flex-1 bg-brand-light dark:bg-brand-dark-gray/10 p-4 rounded-2xl">
                      <span className="block text-[10px] text-brand-dark-gray dark:text-brand-gray/50 mb-1">المرحلة الحالية</span>
                      <span className="text-xs font-bold text-brand-dark dark:text-white line-clamp-1">{activeStepTitle.split(' ').slice(0, 2).join(' ')}</span>
                    </div>
                    <div className="flex-1 bg-brand-light dark:bg-brand-dark-gray/10 p-4 rounded-2xl">
                      <span className="block text-[10px] text-brand-dark-gray dark:text-brand-gray/50 mb-1">موعد التسليم</span>
                      <span className="text-xs font-bold text-brand-dark dark:text-white">{loggedInProject.deliveryDate}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Files list */}
                <div className="bg-white dark:bg-[#1a1a1a]/95 rounded-[32px] p-8 shadow-xl shadow-black/[0.03] dark:shadow-black/20 border border-white dark:border-white/5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold text-brand-dark dark:text-white">الملفات والمسودات الأخيرة</h3>
                      <button onClick={() => setActiveTab('files')} className="text-[#12C7C3] text-xs font-bold hover:underline">عرض الكل</button>
                    </div>
                    
                    <div className="space-y-4">
                      {loggedInProject.files.slice(0, 3).map((file) => (
                        <div
                          key={file.id}
                          onClick={() => triggerToast(`بدء تحميل وتنزيل الملف: ${file.name}`)}
                          className="flex items-center p-3 bg-brand-light/50 dark:bg-brand-dark-gray/10 rounded-2xl border border-transparent hover:border-[#12C7C3]/30 transition-all cursor-pointer"
                        >
                          <div className={`w-10 h-10 bg-white dark:bg-brand-dark rounded-xl flex items-center justify-center ${getFileExtColor(file.type)} shadow-sm ml-4 font-mono text-xs font-bold shrink-0`}>
                            {file.type}
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <p className="text-xs font-bold text-brand-dark dark:text-white truncate">{file.name}</p>
                            <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40">{file.size} • نسخة {file.version}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-brand-gray/10">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 bg-brand-primary/10 hover:bg-brand-primary/25 text-brand-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Upload size={14} />
                      <span>رفع ملف جديد للمخرج</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Service Details Card */}
                {(() => {
                  const matchedService = services?.find(s => s.id === loggedInProject.type);
                  if (!matchedService) return null;
                  return (
                    <div className="bg-white dark:bg-[#1a1a1a]/95 rounded-[32px] p-6 shadow-xl shadow-black/[0.03] dark:shadow-black/20 border border-white dark:border-white/5 space-y-4 text-right" dir="rtl">
                      <div className="flex items-center gap-2 text-brand-primary">
                        <Sparkles size={16} />
                        <h3 className="text-xs font-black uppercase tracking-widest">تفاصيل باقة الخدمة المعتمدة</h3>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-brand-dark dark:text-white">{matchedService.title}</h4>
                        <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 leading-relaxed">
                          {matchedService.description}
                        </p>
                      </div>
                      {matchedService.features && matchedService.features.length > 0 && (
                        <div className="pt-3 border-t border-brand-gray/10 dark:border-brand-dark-gray/10">
                          <span className="text-[9px] font-bold text-[#12C7C3] block mb-2">مميزات ومخرجات الخدمة:</span>
                          <ul className="space-y-1.5">
                            {matchedService.features.map((feature, fIdx) => (
                              <li key={fIdx} className="text-[10px] text-brand-dark-gray dark:text-brand-gray/80 flex items-start gap-1.5">
                                <span className="text-[#12C7C3] text-[8px] mt-0.5">•</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {matchedService.priceRange && (
                        <div className="pt-3 border-t border-brand-gray/10 dark:border-brand-dark-gray/10 flex justify-between items-center text-[10px]">
                          <span className="text-brand-dark-gray/60 dark:text-brand-gray/40">مستوى الاستثمار التقريبي:</span>
                          <span className="font-bold text-brand-primary font-mono">{matchedService.priceRange}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>

              {/* Left Side Column (col-span-8): Timeline & Communication */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Project Header & Timeline nodes block */}
                <div className="bg-white dark:bg-[#1a1a1a]/95 rounded-[32px] p-8 shadow-xl shadow-black/[0.03] dark:shadow-black/20 border border-white dark:border-white/5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                    <div>
                      <span className="text-[#12C7C3] text-xs font-bold tracking-widest block mb-1 uppercase font-mono">مشروع رقم #{loggedInProject.code}</span>
                      <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark dark:text-white">{loggedInProject.name}</h1>
                    </div>
                    <button
                      onClick={() => {
                        const target = document.getElementById('chat-input-dashboard');
                        if (target) target.focus();
                      }}
                      className="bg-[#12C7C3] text-brand-dark px-6 py-3 rounded-full text-xs font-bold shadow-[0_4px_20px_rgba(18,199,195,0.3)] hover:scale-105 active:scale-95 transition-all"
                    >
                      إرسال ملاحظة للمصمم
                    </button>
                  </div>

                  {/* Horizontal Timeline Track */}
                  <div className="relative flex justify-between items-center px-4 pt-4 pb-2 overflow-x-auto no-scrollbar">
                    {/* Background connection gray line */}
                    <div className="absolute h-0.5 bg-brand-gray/30 dark:bg-brand-dark-gray/20 left-0 right-0 top-[40px] -translate-y-1/2 z-0"></div>
                    
                    {/* Active teal highlight line */}
                    <div
                      className="absolute h-0.5 bg-[#12C7C3] right-0 top-[40px] -translate-y-1/2 z-0 transition-all duration-1000 shadow-[0_0_8px_rgba(18,199,195,0.5)]"
                      style={{
                        width: `${linePercent}%`,
                        left: 'auto'
                      }}
                    ></div>
                    
                    {/* Timeline dynamic nodes */}
                    {loggedInProject.timeline.map((step, idx) => {
                      const isCompleted = step.status === 'completed';
                      const isActive = step.status === 'active';
                      return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center min-w-[70px] sm:min-w-[90px] text-center">
                          {isCompleted ? (
                            <div className="w-10 h-10 rounded-full bg-[#12C7C3] border-4 border-white dark:border-[#1a1a1a] shadow-lg shadow-[#12C7C3]/20 flex items-center justify-center text-brand-dark">
                              <svg className="w-4 h-4 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : isActive ? (
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] border-4 border-[#12C7C3] shadow-lg shadow-[#12C7C3]/10 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#12C7C3] animate-pulse"></div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] border-4 border-brand-gray/30 dark:border-brand-dark-gray/30 shadow-sm flex items-center justify-center" />
                          )}
                          <span className={`mt-3 text-[10px] font-bold leading-tight ${isActive ? 'text-[#12C7C3]' : 'text-brand-dark-gray dark:text-brand-gray/70'}`}>
                            {step.title.split(' ').slice(0, 2).join(' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Updates Feed & Communication Chat Box */}
                <div className="bg-white dark:bg-[#1a1a1a]/95 rounded-[32px] p-8 shadow-xl shadow-black/[0.03] dark:shadow-black/20 border border-white dark:border-white/5 flex-1 flex flex-col justify-between min-h-[420px] overflow-hidden">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#12C7C3]" />
                      <h3 className="text-sm font-bold text-brand-dark dark:text-white">قناة التواصل المباشر</h3>
                    </div>

                    {/* Chat Messages Thread */}
                    <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2 pl-1 custom-scrollbar">
                      {loggedInProject.notes.slice(-5).map((msg) => {
                        const isClient = msg.sender === 'client';
                        return (
                          <div key={msg.id} className={`flex gap-4 ${isClient ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] shrink-0 font-bold ${
                              isClient ? 'bg-[#12C7C3] text-brand-dark' : 'bg-brand-dark dark:bg-brand-dark-gray'
                            }`}>
                              {isClient ? 'أنت' : 'الاستوديو'}
                            </div>
                            
                            <div className={`p-4 rounded-2xl max-w-[80%] text-right ${
                              isClient 
                                ? 'bg-brand-primary/10 border border-brand-primary/15 text-brand-dark dark:text-white rounded-tl-none' 
                                : 'bg-[#F5F7F8] dark:bg-brand-dark-gray/10 text-brand-dark dark:text-white rounded-tr-none'
                            }`}>
                              <p className="text-xs leading-relaxed">{msg.text}</p>
                              <span className="text-[9px] text-[#4A4F57] dark:text-brand-gray/40 mt-2 block font-mono">{msg.date}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submission form */}
                  <div className="mt-6">
                    <form onSubmit={handleSendMessage} className="relative">
                      <input
                        type="text"
                        id="chat-input-dashboard"
                        placeholder="اكتب استفسارك أو طلب التعديل هنا..."
                        value={chatText}
                        onChange={(e) => setChatText(e.target.value)}
                        className="w-full bg-[#F5F7F8] dark:bg-brand-dark text-brand-dark dark:text-white rounded-2xl py-4 px-6 pr-6 pl-14 text-xs outline-none focus:ring-2 focus:ring-[#12C7C3]/25 border border-transparent focus:border-[#12C7C3]/30 transition-all text-right"
                      />
                      <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#12C7C3] hover:scale-105 active:scale-95 transition-all">
                        <Send size={18} className="rotate-180" />
                      </button>
                    </form>
                  </div>

                </div>

              </div>
              
            </div>
          );
        })()}

        {/* Tab 2: Timeline */}
        {activeTab === 'timeline' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-white/5 space-y-8 text-right">
            <div className="border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-4">
              <h3 className="text-lg font-bold text-brand-dark dark:text-white">الجدول الزمني ومراحل المشروع</h3>
              <p className="text-xs text-brand-dark-gray/60 dark:text-brand-gray/40">تتبع خطوات إنتاج هوية علامتك التجارية والتقدم الفعلي لكل مرحلة</p>
            </div>

            {/* Vertical high-end timeline track */}
            <div className="space-y-8 relative before:absolute before:top-1 before:bottom-1 before:right-4 before:w-0.5 before:bg-brand-gray/30 dark:before:bg-brand-dark-gray/30">
              {loggedInProject.timeline.map((step, idx) => (
                <div key={step.id} className="relative pr-10">
                  
                  {/* Indicator bullet according to status */}
                  <span className={`absolute right-1.5 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    step.status === 'completed'
                      ? 'bg-brand-primary border-brand-primary text-brand-dark'
                      : step.status === 'active'
                      ? 'bg-brand-primary/20 border-brand-primary text-brand-primary animate-pulse'
                      : 'bg-white dark:bg-brand-dark border-brand-gray/40 text-brand-dark-gray/40'
                  }`}>
                    {step.status === 'completed' ? '✓' : idx + 1}
                  </span>

                  <div className="bg-brand-light/30 dark:bg-brand-dark-gray/10 rounded-2xl p-4 border border-brand-gray/10 space-y-2">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <h4 className={`text-sm font-bold ${
                        step.status === 'active' ? 'text-brand-primary' : 'text-brand-dark dark:text-white'
                      }`}>
                        {step.title}
                      </h4>
                      {step.date && (
                        <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-bold">
                          تم بتاريخ: {step.date}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-brand-dark-gray dark:text-brand-gray/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Files & Downloads */}
        {activeTab === 'files' && (
          <div className="space-y-8 text-right">
            
            {/* Final Delivered Package Box (shown when Delivered) */}
            {loggedInProject.status === 'delivered' && loggedInProject.finalFiles && loggedInProject.finalFiles.length > 0 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-alert-success/30 bg-alert-success/5 space-y-6">
                <div className="flex items-center gap-3 text-alert-success border-b border-alert-success/15 pb-4">
                  <CheckCircle2 size={24} />
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark dark:text-white">ملفات التسليم المعتمدة والنهائية</h3>
                    <p className="text-xs text-brand-dark-gray dark:text-brand-gray/50">قم بتحميل الأصول المتجهة ودليل الهوية الكامل بجميع صيغ الإنتاج الفنية</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {loggedInProject.finalFiles.map((final) => (
                    <div key={final.id} className="bg-white dark:bg-brand-dark p-4 rounded-2xl border border-brand-gray/20 dark:border-brand-dark-gray/20 flex flex-col justify-between h-[150px]">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] bg-brand-primary text-brand-dark font-mono font-bold px-2 py-0.5 rounded-full">{final.type}</span>
                          <span className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40">{final.size}</span>
                        </div>
                        <h4 className="text-xs font-bold text-brand-dark dark:text-white mt-3 truncate">{final.name}</h4>
                        <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 line-clamp-2 mt-1">{final.description}</p>
                      </div>
                      
                      <button
                        onClick={() => triggerToast(`بدء تحميل الملف المعتمد: ${final.name}`)}
                        className="w-full py-2 bg-brand-primary text-brand-dark hover:bg-brand-secondary rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download size={12} />
                        تحميل الملف المتجه (AI/PDF)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Review Files list */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-white/5 space-y-6">
              <div className="border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-brand-dark dark:text-white">ملفات المراجعة والمسودات</h3>
                  <p className="text-xs text-brand-dark-gray/60 dark:text-brand-gray/40">المقترحات، خيارات الشعار ونماذج التغليف المطروحة للمناقشة والمراجعة</p>
                </div>
                
                {/* Client File Upload Trigger Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="py-2 px-4 bg-brand-primary text-brand-dark font-bold text-xs rounded-xl hover:bg-brand-secondary transition-colors flex items-center gap-2"
                >
                  <Upload size={14} />
                  <span>{isUploading ? 'جاري الرفع...' : 'رفع ملف إضافي'}</span>
                </button>
              </div>

              {/* Upload settings section */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              {isUploading && (
                <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 space-y-2">
                  <div className="flex justify-between items-center text-xs text-brand-dark-gray dark:text-brand-gray">
                    <span>جاري رفع أصول المراجعة إلى خوادم إلهامك...</span>
                    <span className="font-bold text-brand-primary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-gray/30 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Standard Files Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loggedInProject.files.map((file) => (
                  <div key={file.id} className="bg-brand-light/30 dark:bg-brand-dark-gray/10 p-4 rounded-2xl border border-brand-gray/10 flex items-center justify-between text-xs gap-4 hover:border-brand-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-[11px] shrink-0">
                        {file.type}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand-dark dark:text-white truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40">{file.size} • نسخة {file.version} • {file.date}</p>
                        <p className="text-[10px] text-brand-dark-gray/50 dark:text-brand-gray/40 mt-1 line-clamp-1">{file.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => triggerToast(`بدء تنزيل الملف المرفق: ${file.name}`)}
                      className="p-2 bg-white dark:bg-brand-dark text-brand-primary hover:bg-brand-primary hover:text-brand-dark rounded-xl transition-all border border-brand-gray/10 shrink-0"
                      title="تحميل الملف"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* Tab 4: Interactive Chat Message Notes */}
        {activeTab === 'chat' && (
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-lg flex flex-col h-[600px] text-right justify-between">
            
            {/* Chat header */}
            <div className="border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-4 mb-4">
              <h3 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
                <MessageSquare size={16} className="text-brand-primary" />
                دردشة المشروع وتعديلات المخرج المشرف
              </h3>
              <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40">تبادل التوجيهات، الملاحظات الإيجابية وسجل طلب التعديلات بصفة فورية</p>
            </div>

            {/* Message Thread container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 pl-2 mb-4 scrollbar">
              {loggedInProject.notes.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'client' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-4 text-xs ${
                    msg.sender === 'client'
                      ? 'bg-brand-primary text-brand-dark font-semibold rounded-br-none'
                      : 'bg-brand-light dark:bg-brand-dark-gray/30 border border-brand-gray/20 dark:border-brand-dark-gray/30 text-brand-dark dark:text-white rounded-bl-none'
                  }`}>
                    <div className="flex justify-between items-center gap-6 mb-1 text-[9px] opacity-75">
                      <span className="font-bold">{msg.sender === 'client' ? 'أنت (العميل)' : 'استوديو إلهامك'}</span>
                      <span className="font-mono">{msg.date}</span>
                    </div>
                    
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    
                    {msg.attachment && (
                      <div className={`mt-2 p-2 rounded-xl text-[10px] flex items-center justify-between gap-4 ${
                        msg.sender === 'client' ? 'bg-brand-dark/10' : 'bg-brand-primary/10 text-brand-primary'
                      }`}>
                        <span className="truncate max-w-[150px] font-bold">{msg.attachment.name}</span>
                        <span className="opacity-75">{msg.attachment.size}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Attachment preview */}
            {chatAttachment && (
              <div className="bg-brand-primary/5 p-2 rounded-xl border border-brand-primary/20 text-xs flex justify-between items-center mb-2">
                <span className="font-semibold text-brand-primary truncate max-w-[200px]">مرفق جاهز: {chatAttachment.name} ({chatAttachment.size})</span>
                <button
                  type="button"
                  onClick={() => setChatAttachment(null)}
                  className="text-alert-error hover:underline text-[10px]"
                >
                  إلغاء المرفق
                </button>
              </div>
            )}

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
              
              {/* Message Input */}
              <input
                type="text"
                placeholder="اكتب ملاحظات التعديل، أو استفسارك هنا..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                className="flex-1 bg-white dark:bg-brand-dark border border-brand-gray dark:border-brand-dark-gray/40 rounded-xl py-3 px-4 outline-none focus:border-brand-primary text-sm text-right text-brand-dark dark:text-white"
              />

              {/* Attach File Clip */}
              <button
                type="button"
                onClick={() => chatInputRef.current?.click()}
                className="p-3 bg-brand-light dark:bg-brand-dark-gray/20 hover:bg-brand-primary/10 text-brand-dark-gray dark:text-brand-gray rounded-xl transition-colors shrink-0"
                title="إرفاق ملف"
              >
                <Upload size={16} />
              </button>
              <input
                type="file"
                ref={chatInputRef}
                onChange={handleChatFileAttach}
                className="hidden"
              />

              {/* Send Button */}
              <button
                type="submit"
                className="p-3 bg-brand-primary hover:bg-brand-secondary text-brand-dark rounded-xl transition-all shrink-0 glow-primary"
                title="إرسال الرسالة"
              >
                <Send size={16} className="rotate-180" />
              </button>

            </form>

          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-8" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Financial Summary card 1: Price */}
              <div className="bg-white dark:bg-[#1a1a1a]/95 rounded-3xl p-6 shadow-md border border-white dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:scale-125"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-xs font-bold text-brand-dark-gray/60 dark:text-brand-gray/40">إجمالي قيمة التعاقد</span>
                  <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
                    <Receipt size={18} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-brand-dark dark:text-white font-mono relative z-10">
                  {(loggedInProject.totalPrice || 0).toLocaleString()} <span className="text-xs font-bold">ر.س</span>
                </h3>
                <div className="mt-4 text-[10px] text-brand-dark-gray/50 dark:text-brand-gray/30 relative z-10">
                  قيمة المشروع المعتمدة شاملة كافة المخرجات المتفق عليها.
                </div>
              </div>

              {/* Financial Summary card 2: Paid */}
              <div className="bg-white dark:bg-[#1a1a1a]/95 rounded-3xl p-6 shadow-md border border-white dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#12C7C3]/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:scale-125"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-xs font-bold text-brand-dark-gray/60 dark:text-brand-gray/40">المبلغ المدفوع</span>
                  <div className="w-10 h-10 bg-[#12C7C3]/10 text-[#12C7C3] rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-[#12C7C3] font-mono relative z-10">
                  {(loggedInProject.paidAmount || 0).toLocaleString()} <span className="text-xs font-bold">ر.س</span>
                </h3>
                <div className="mt-4 text-[10px] text-brand-dark-gray/50 dark:text-brand-gray/30 relative z-10">
                  مجموع الدفعات التي تم استلامها وتوثيقها من الإدارة.
                </div>
              </div>

              {/* Financial Summary card 3: Remaining */}
              <div className="bg-white dark:bg-[#1a1a1a]/95 rounded-3xl p-6 shadow-md border border-white dark:border-white/5 relative overflow-hidden group">
                {((loggedInProject.totalPrice || 0) - (loggedInProject.paidAmount || 0)) > 0 ? (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-alert-warning/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:scale-125"></div>
                ) : (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#12C7C3]/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:scale-125"></div>
                )}
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-xs font-bold text-brand-dark-gray/60 dark:text-brand-gray/40">الرصيد المتبقي</span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    ((loggedInProject.totalPrice || 0) - (loggedInProject.paidAmount || 0)) > 0
                      ? 'bg-alert-warning/10 text-alert-warning'
                      : 'bg-[#12C7C3]/10 text-[#12C7C3]'
                  }`}>
                    <Coins size={18} />
                  </div>
                </div>
                <h3 className={`text-2xl font-black font-mono relative z-10 ${
                  ((loggedInProject.totalPrice || 0) - (loggedInProject.paidAmount || 0)) > 0
                    ? 'text-alert-warning'
                    : 'text-[#12C7C3]'
                }`}>
                  {Math.max(0, (loggedInProject.totalPrice || 0) - (loggedInProject.paidAmount || 0)).toLocaleString()} <span className="text-xs font-bold">ر.س</span>
                </h3>
                <div className="mt-4 text-[10px] text-brand-dark-gray/50 dark:text-brand-gray/30 relative z-10">
                  {((loggedInProject.totalPrice || 0) - (loggedInProject.paidAmount || 0)) > 0
                    ? 'الرصيد المستحق دفعه عند الانتهاء من مخرجات المراحل القادمة.'
                    : 'رصيد الحساب مكتمل بالكامل، شكراً لك!'}
                </div>
              </div>

            </div>

            {/* Financial Ledger Details Table */}
            <div className="bg-white dark:bg-[#1a1a1a]/95 rounded-[32px] p-8 shadow-xl border border-white dark:border-white/5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-brand-gray/10 dark:border-brand-dark-gray/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-brand-dark dark:text-white">كشف الحساب وسجل الدفعات</h3>
                  <p className="text-xs text-brand-dark-gray/60 dark:text-brand-gray/40">تفاصيل المبالغ الموثقة في نظامنا المالي للمشروع</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const ledgerText = `📄 كشف حساب مشروع إلهامك الفني
المشروع: ${loggedInProject.name}
العميل: ${loggedInProject.clientName}
الرمز: ${loggedInProject.code}

إجمالي قيمة التعاقد: ${(loggedInProject.totalPrice || 0).toLocaleString()} ر.س
المبلغ المسدد: ${(loggedInProject.paidAmount || 0).toLocaleString()} ر.س
الرصيد المتبقي: ${Math.max(0, (loggedInProject.totalPrice || 0) - (loggedInProject.paidAmount || 0)).toLocaleString()} ر.س
حالة السداد: ${
                        loggedInProject.financialStatus === 'paid' ? 'تم السداد بالكامل' :
                        loggedInProject.financialStatus === 'partially_paid' ? 'مسدد جزئياً' : 'غير مسدد'
                      }

شكراً لتعاملكم معنا! ✨`;
                      navigator.clipboard.writeText(ledgerText);
                      setCopiedLedger(true);
                      triggerToast('تم نسخ تفاصيل الرصيد والبيانات المالية إلى الحافظة بنجاح!');
                      setTimeout(() => setCopiedLedger(false), 2000);
                    }}
                    className="py-2.5 px-4 bg-brand-primary text-brand-dark hover:bg-brand-secondary rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                  >
                    {copiedLedger ? <CheckCircle2 size={14} /> : <Share2 size={14} />}
                    <span>{copiedLedger ? 'تم النسخ!' : 'مشاركة الرصيد الحالي'}</span>
                  </button>
                </div>
              </div>

              {!loggedInProject.financialTransactions || loggedInProject.financialTransactions.length === 0 ? (
                <div className="text-center py-10 text-brand-dark-gray/50 dark:text-brand-gray/40 space-y-2">
                  <div className="w-12 h-12 bg-brand-light dark:bg-brand-dark-gray/20 rounded-full flex items-center justify-center mx-auto text-brand-dark-gray/40">
                    <Receipt size={20} />
                  </div>
                  <p className="text-xs font-bold">لا يوجد دفعات مسجلة بعد لهذا المشروع.</p>
                  <p className="text-[10px]">عند دفع دفعة أولى أو تحصيل مبالغ، ستظهر الإيصالات هنا تفصيلياً.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-brand-gray/10 dark:border-brand-dark-gray/10 text-brand-dark-gray/60 dark:text-brand-gray/40">
                        <th className="py-3 px-2 text-right">التاريخ</th>
                        <th className="py-3 px-2 text-right">المعاملة</th>
                        <th className="py-3 px-2 text-right">الوصف</th>
                        <th className="py-3 px-2 text-left">المبلغ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray/5 dark:divide-brand-dark-gray/5">
                      {loggedInProject.financialTransactions.map((tx) => (
                        <tr key={tx.id} className="text-brand-dark dark:text-white/80">
                          <td className="py-4 px-2 font-mono text-[10px]">{tx.date}</td>
                          <td className="py-4 px-2">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.type === 'income' ? 'bg-[#12C7C3]/10 text-[#12C7C3]' : 'bg-alert-error/10 text-alert-error'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${tx.type === 'income' ? 'bg-[#12C7C3]' : 'bg-alert-error'}`}></span>
                              {tx.type === 'income' ? 'دفعة مستلمة' : 'مسترد'}
                            </span>
                          </td>
                          <td className="py-4 px-2 font-semibold text-xs">{tx.description}</td>
                          <td className="py-4 px-2 text-left font-mono font-black text-[#12C7C3]">
                            {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} ر.س
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Customer Review Section */}
            <div className="bg-white dark:bg-[#1a1a1a]/95 rounded-[32px] p-8 shadow-xl border border-white dark:border-white/5">
              <div className="mb-6">
                <h3 className="text-base font-bold text-brand-dark dark:text-white">تقييم جودة مخرجات العمل والتجربة</h3>
                <p className="text-xs text-brand-dark-gray/60 dark:text-brand-gray/40">رأيك يهمنا ويساعدنا على تقديم أرقى خدمات الهوية والتصميم</p>
              </div>

              {loggedInProject.clientReview ? (
                <div className="bg-brand-primary/5 dark:bg-brand-dark-gray/10 rounded-2xl p-6 border border-brand-primary/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-alert-warning">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          fill={s <= (loggedInProject.clientReview?.rating || 5) ? "currentColor" : "none"}
                          className={s <= (loggedInProject.clientReview?.rating || 5) ? "text-alert-warning" : "text-brand-gray"}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-brand-dark-gray/50 dark:text-brand-gray/40 font-mono">{loggedInProject.clientReview.date}</span>
                  </div>
                  
                  <div className="relative">
                    <span className="absolute -top-3 right-0 text-3xl font-serif text-brand-primary/20">“</span>
                    <p className="text-xs text-brand-dark dark:text-white leading-relaxed pr-6 pl-4 italic">
                      {loggedInProject.clientReview.comment}
                    </p>
                    <span className="absolute -bottom-3 left-0 text-3xl font-serif text-brand-primary/20">”</span>
                  </div>

                  <div className="pt-2 border-t border-brand-gray/10 dark:border-brand-dark-gray/10 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-brand-dark dark:text-white">بواسطة: {loggedInProject.clientReview.reviewerName || loggedInProject.clientName}</span>
                    <span className="text-[10px] text-[#12C7C3] font-bold">شكراً لك! تم تفعيل ومزامنة تقييمك بنجاح في الصفحة الرئيسية ✨</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center p-6 bg-brand-light/30 dark:bg-brand-dark-gray/5 rounded-2xl border border-brand-gray/10">
                    <p className="text-xs font-bold text-brand-dark dark:text-white mb-3">اختر التقييم بـ 5 نجوم:</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="text-brand-gray hover:scale-125 transition-transform"
                        >
                          <Star
                            size={32}
                            className={`transition-colors ${
                              star <= (hoverRating || rating) ? 'text-alert-warning' : 'text-brand-gray/40 dark:text-brand-dark-gray/60'
                            }`}
                            fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-xs font-bold text-brand-primary mt-2">
                        {rating === 5 ? 'ممتاز جداً ومحترف للغاية 🌟' :
                         rating === 4 ? 'رائع ومتميز 👍' :
                         rating === 3 ? 'جيد جداً ' :
                         rating === 2 ? 'مقبول ' : 'يحتاج للتطوير'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-dark dark:text-white block">اكتب تعليقك وانطباعك بخصوص جودة العمل والخدمة:</label>
                    <textarea
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="يسعدنا كتابة تعليقك ليعبر عن انطباعك بخصوص التصميم والتواصل مع فريق إلهامك..."
                      className="w-full bg-brand-light/20 dark:bg-brand-dark text-xs border border-brand-gray dark:border-brand-dark-gray/40 rounded-2xl p-4 outline-none focus:border-brand-primary text-brand-dark dark:text-white resize-none"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (rating === 0) {
                        triggerToast('يرجى اختيار التقييم بالنجوم أولاً!');
                        return;
                      }
                      if (!reviewComment.trim()) {
                        triggerToast('يرجى تعبئة خانة التعليق بكلمة طيبة!');
                        return;
                      }
                      
                      const todayStr = new Date().toISOString().split('T')[0];
                      const updatedProject = {
                        ...loggedInProject,
                        clientReview: {
                          rating,
                          comment: reviewComment,
                          date: todayStr,
                          reviewerName: loggedInProject.clientName,
                          showOnHome: true
                        }
                      };

                      if (onUpdateProject) {
                        onUpdateProject(updatedProject);
                        triggerToast('شكراً لك! تم تسجيل التقييم ومزامنته في كامل لوحات الاستوديو والصفحة الرئيسية بنجاح ✨');
                      }
                    }}
                    className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-brand-dark rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} />
                    <span>إرسال التقييم ومزامنته مباشرة</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
