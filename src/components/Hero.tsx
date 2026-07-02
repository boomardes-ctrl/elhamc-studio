/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowUpLeft, ShieldCheck, Clock, Layers, Star } from 'lucide-react';
import { motion } from 'motion/react';

import { SiteTexts, Project } from '../types';

interface HeroProps {
  onStartProject: () => void;
  onEnterPortal: () => void;
  siteTexts: SiteTexts;
  projects?: Project[];
}

export default function Hero({ onStartProject, onEnterPortal, siteTexts, projects = [] }: HeroProps) {
  // Determine if we should pull real dynamic project info
  const useRealData = siteTexts.heroMockupUseRealData !== false;
  const latestProject = useRealData && projects.length > 0 ? projects[0] : null;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received': return 'قيد المراجعة';
      case 'design': return 'قيد التصميم';
      case 'review': return 'مراجعة العميل';
      case 'modification': return 'جاري التعديل';
      case 'delivered': return 'تم التسليم';
      default: return status;
    }
  };

  // 1. Project Name
  const mockupProjName = latestProject 
    ? (latestProject.name.startsWith('مشروع') ? latestProject.name : `مشروع: ${latestProject.name}`) 
    : (siteTexts.heroMockupProjectName || 'مشروع: هوية أصيل المتميزة');

  // 2. Status
  const mockupStatus = latestProject 
    ? getStatusLabel(latestProject.status) 
    : (siteTexts.heroMockupStatus || 'قيد المراجعة');

  // 3. Progress
  const mockupProgressVal = latestProject 
    ? latestProject.progress 
    : parseInt(siteTexts.heroMockupProgress || '75', 10);

  // 4. Step 1 (Completed or first step)
  const step1 = latestProject?.timeline && latestProject.timeline.length > 0 
    ? latestProject.timeline[0] 
    : null;
  const mockupStep1Title = step1 
    ? step1.title 
    : (siteTexts.heroMockupStep1Title || 'اعتماد خطوط وشعار الهوية');
  const mockupStep1Desc = step1 
    ? step1.description 
    : (siteTexts.heroMockupStep1Desc || 'بموافقة أ. عبد الرحمن');

  // 5. Step 2 (Active or second step)
  const step2 = latestProject?.timeline && latestProject.timeline.length > 1 
    ? (latestProject.timeline.find(t => t.status === 'active') || latestProject.timeline[1]) 
    : null;
  const mockupStep2Title = step2 
    ? step2.title 
    : (siteTexts.heroMockupStep2Title || 'تصاميم التغليف والعلب الخارجية');
  const mockupStep2Desc = step2 
    ? step2.description 
    : (siteTexts.heroMockupStep2Desc || 'جاري مراجعة النماذج ثلاثية الأبعاد');

  // 6. Latest File
  const latestFile = latestProject?.files && latestProject.files.length > 0 
    ? latestProject.files[latestProject.files.length - 1] 
    : null;
  const mockupFileName = latestFile 
    ? latestFile.name 
    : (siteTexts.heroMockupFileName || 'مخطط_التغليف_V2.pdf');
  const mockupFileSize = latestFile 
    ? latestFile.size 
    : (siteTexts.heroMockupFileSize || '24.1 MB');

  // 7. Float widgets
  const ratingText = siteTexts.heroMockupRatingText || '5.0/5.0 الماسي';
  const projectsCountText = useRealData && projects.length > 0
    ? `+${projects.length + 38} مشروع متميز`
    : (siteTexts.heroMockupProjectsCount || '+40 مشروع متميز');

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden">
      {/* Absolute Decorative Background Elements */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-brand-secondary/5 rounded-full blur-[100px] -z-10"></div>
      
      {/* Subtle lines grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(18,199,195,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(18,199,195,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] -z-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8 text-right">
            
            {/* Tag / Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold"
            >
              <Sparkles size={13} className="animate-spin-slow" />
              <span>{siteTexts.heroTag || 'استوديو إلهامك الفني والهوية البصرية'}</span>
            </motion.div>

            {/* Display Headings */}
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-dark dark:text-white leading-[1.2]"
              >
                {siteTexts.heroTitle || 'نبتكر'} <span className="text-transparent bg-clip-text bg-gradient-to-l from-brand-primary to-brand-secondary relative">{siteTexts.heroTitleHighlighted || 'الهويات البصرية'}</span> <br />
                {siteTexts.heroTitleRest || 'التي تصنع الفارق الفريد'}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-brand-dark-gray dark:text-brand-gray/80 max-w-2xl leading-relaxed"
              >
                {siteTexts.heroDesc || 'نحن لسنا مجرد مصممين؛ نحن شركاؤك الاستراتيجيون في صياغة هوية علامتك التجارية الراقية، وإدارة كامل تفاصيل مشروعك معنا خطوة بخطوة من خلال بوابتك الخاصة المبتكرة.'}
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={onStartProject}
                className="px-8 py-4 bg-brand-primary text-brand-dark font-bold text-sm rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-primary/20 flex items-center gap-2 glow-primary"
              >
                {siteTexts.heroCtaPrimary || 'أطلق مشروعك معنا'}
                <ArrowUpLeft size={16} />
              </button>
              
              <button
                onClick={onEnterPortal}
                className="px-8 py-4 bg-transparent border border-brand-gray dark:border-brand-dark-gray/60 hover:border-brand-primary hover:text-brand-primary text-brand-dark dark:text-white font-semibold text-sm rounded-2xl transition-all duration-300"
              >
                {siteTexts.heroCtaSecondary || 'بوابة العميل التفاعلية'}
              </button>
            </motion.div>

            {/* Core Values / Bullet Highlights */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-gray/30 dark:border-brand-dark-gray/30"
            >
              <div className="flex flex-col">
                <span className="text-xs text-brand-dark-gray dark:text-brand-gray/50 mb-1 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-brand-primary" /> شفافية كاملة
                </span>
                <span className="text-sm font-bold text-brand-dark dark:text-white">بوابة العميل الخاصة</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-brand-dark-gray dark:text-brand-gray/50 mb-1 flex items-center gap-1">
                  <Clock size={12} className="text-brand-primary" /> دقة في التنفيذ
                </span>
                <span className="text-sm font-bold text-brand-dark dark:text-white">تخطيط زمني صارم</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-brand-dark-gray dark:text-brand-gray/50 mb-1 flex items-center gap-1">
                  <Layers size={12} className="text-brand-primary" /> جودة استثنائية
                </span>
                <span className="text-sm font-bold text-brand-dark dark:text-white">تفاصيل مجهرية</span>
              </div>
            </motion.div>

          </div>

          {/* Luxury Interactive Visual Mockup representing the design studio workspace */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto max-w-[420px]"
            >
              {/* Central Premium Graphic Card */}
              <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/40 dark:border-white/5 relative z-10 space-y-6">
                
                {/* Simulated Project Header */}
                <div className="flex items-center justify-between border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse"></span>
                    <span className="text-xs font-bold text-brand-dark dark:text-white line-clamp-1">{mockupProjName}</span>
                  </div>
                  <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full font-bold shrink-0">
                    {mockupStatus}
                  </span>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-brand-dark-gray dark:text-brand-gray">
                    <span>نسبة الإنجاز الحالية</span>
                    <span className="font-bold text-brand-primary">{mockupProgressVal}%</span>
                  </div>
                  {/* Progress bar inside visual mockup */}
                  <div className="w-full h-2 bg-brand-gray/40 dark:bg-brand-dark-gray/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full" style={{ width: `${mockupProgressVal}%` }}></div>
                  </div>
                </div>

                {/* Steps visual mockup */}
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-brand-primary text-brand-dark flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</div>
                    <div className="text-right">
                      <h4 className="text-xs font-bold text-brand-dark dark:text-white line-clamp-1">{mockupStep1Title}</h4>
                      <p className="text-[10px] text-brand-dark-gray dark:text-brand-gray/50 line-clamp-1">{mockupStep1Desc}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-brand-primary/20 border border-brand-primary/50 text-brand-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">●</div>
                    <div className="text-right">
                      <h4 className="text-xs font-bold text-brand-dark dark:text-white line-clamp-1">{mockupStep2Title}</h4>
                      <p className="text-[10px] text-brand-dark-gray dark:text-brand-gray/50 line-clamp-1">{mockupStep2Desc}</p>
                    </div>
                  </div>
                </div>

                {/* Simulated File List */}
                <div className="bg-brand-light/50 dark:bg-brand-dark-gray/20 rounded-2xl p-3 border border-brand-gray/10 dark:border-brand-dark-gray/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-[10px] shrink-0">PDF</div>
                    <div className="text-right truncate">
                      <p className="font-semibold text-brand-dark dark:text-white truncate">{mockupFileName}</p>
                      <p className="text-[9px] text-brand-dark-gray/60 dark:text-brand-gray/40">{mockupFileSize}</p>
                    </div>
                  </div>
                  <span className="p-1.5 text-brand-primary font-semibold text-[10px] shrink-0">تحميل</span>
                </div>

              </div>

              {/* Backing decorative shapes */}
              <div className="absolute top-10 -left-6 w-32 h-32 bg-brand-secondary/20 rounded-full blur-2xl z-0"></div>
              <div className="absolute -bottom-6 -right-6 w-44 h-44 bg-brand-primary/20 rounded-full blur-2xl z-0"></div>
              
              {/* Smaller floating widget 1: Satisfaction */}
              <div className="absolute -left-10 bottom-12 glass-panel p-3 rounded-2xl shadow-lg border border-white/40 dark:border-white/5 z-20 flex items-center gap-2 max-w-[150px]">
                <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500 shrink-0">
                  <Star size={14} fill="currentColor" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-brand-dark-gray/50 dark:text-brand-gray/50">تقييم العملاء</p>
                  <p className="text-xs font-bold text-brand-dark dark:text-white">{ratingText}</p>
                </div>
              </div>

              {/* Smaller floating widget 2: Projects active counter */}
              <div className="absolute -right-10 top-16 glass-panel p-3 rounded-2xl shadow-lg border border-white/40 dark:border-white/5 z-20 flex items-center gap-2 max-w-[150px]">
                <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary shrink-0">
                  <Layers size={14} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-brand-dark-gray/50 dark:text-brand-gray/50">النشاط الإبداعي</p>
                  <p className="text-xs font-bold text-brand-dark dark:text-white">{projectsCountText}</p>
                </div>
              </div>

            </motion.div>
          </div>

        </div>

        {/* Client Logos Row (Branding details) */}
        <div className="mt-24 pt-10 border-t border-brand-gray/20 dark:border-brand-dark-gray/20">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-brand-dark-gray dark:text-brand-gray/40 mb-8">
            {siteTexts.heroLogosTitle || 'فخورون بالتعاون مع كيانات رائدة وتطوير علاماتها التجارية'}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="text-lg font-bold tracking-widest text-brand-dark dark:text-white font-sans">أصيل للعطور</span>
            <span className="text-lg font-bold tracking-widest text-brand-dark dark:text-white font-sans">مجموعة مدى</span>
            <span className="text-lg font-bold tracking-widest text-brand-dark dark:text-white font-sans">سديم الرقمية</span>
            <span className="text-lg font-bold tracking-widest text-brand-dark dark:text-white font-sans">سنام للاستشارات</span>
            <span className="text-lg font-bold tracking-widest text-brand-dark dark:text-white font-sans">روافد الفنية</span>
          </div>
        </div>

      </div>
    </section>
  );
}
