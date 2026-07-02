/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CASE_STUDIES } from '../data';
import { CaseStudy, SiteTexts } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Eye, Layers, Palette, BookOpen, ExternalLink, PenTool } from 'lucide-react';

interface PortfolioProps {
  onStartProject: () => void;
  caseStudies?: CaseStudy[];
  siteTexts?: SiteTexts;
}

export default function Portfolio({ onStartProject, caseStudies, siteTexts }: PortfolioProps) {
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudy | null>(null);
  const displayCaseStudies = caseStudies || CASE_STUDIES;

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'identity': return 'تصميم هوية بصرية';
      case 'packaging': return 'تغليف متميز';
      case 'uiux': return 'واجهات UI/UX';
      case 'development': return 'تطوير برمجيات';
      default: return cat;
    }
  };

  return (
    <div className="py-24" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Render Case Study Detail if selected */}
        {activeCaseStudy ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="space-y-12"
          >
            {/* Case Study Header Back Nav */}
            <div className="flex items-center justify-between border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-6">
              <button
                onClick={() => setActiveCaseStudy(null)}
                className="flex items-center gap-2 text-sm font-semibold text-brand-dark-gray dark:text-brand-gray hover:text-brand-primary transition-colors py-2 px-4 rounded-xl hover:bg-brand-primary/10"
              >
                <ArrowRight size={16} />
                <span>العودة إلى معرض الأعمال</span>
              </button>
              
              <span className="text-xs bg-brand-primary/10 text-brand-primary font-bold px-3 py-1.5 rounded-full">
                {activeCaseStudy.category}
              </span>
            </div>

            {/* Case Study Hero Title / Cover */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-6 text-right">
                <span className="text-sm text-brand-primary font-bold uppercase tracking-widest">{activeCaseStudy.clientName}</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-dark dark:text-white leading-tight">
                  {activeCaseStudy.title}
                </h2>
                <p className="text-xs text-brand-dark-gray/60 dark:text-brand-gray/40">تاريخ الإنجاز: {activeCaseStudy.date}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {activeCaseStudy.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-brand-light dark:bg-brand-dark-gray/20 text-brand-dark-gray dark:text-brand-gray/70 px-3 py-1 rounded-full border border-brand-gray/10 dark:border-brand-dark-gray/10">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-2xl h-[300px] sm:h-[400px]">
                <img
                  src={activeCaseStudy.coverImage}
                  alt={activeCaseStudy.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback gradient if unsplash image fails to load in sandbox
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent flex items-end p-6">
                  <div className="text-white text-right">
                    <p className="text-xs text-brand-primary font-bold">دراسة حالة متكاملة</p>
                    <h4 className="text-lg font-bold">{activeCaseStudy.title}</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Challenges & Solutions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 rounded-3xl border border-white/40 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-3 border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-3 text-alert-warning">
                  <BookOpen size={20} />
                  <h3 className="text-lg font-bold text-brand-dark dark:text-white">التحدي الإبداعي</h3>
                </div>
                <p className="text-sm text-brand-dark-gray dark:text-brand-gray/80 leading-relaxed text-justify">
                  {activeCaseStudy.challenges}
                </p>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/40 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-3 border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-3 text-brand-primary">
                  <Palette size={20} />
                  <h3 className="text-lg font-bold text-brand-dark dark:text-white">الحل البصري والحلول</h3>
                </div>
                <p className="text-sm text-brand-dark-gray dark:text-brand-gray/80 leading-relaxed text-justify">
                  {activeCaseStudy.solutions}
                </p>
              </div>
            </div>

            {/* Design Process / Stages */}
            <div className="space-y-6">
              <div className="text-right">
                <h3 className="text-2xl font-bold text-brand-dark dark:text-white">منهجية العمل والخطوات</h3>
                <p className="text-sm text-brand-dark-gray/60 dark:text-brand-gray/50">كيف وصلنا إلى هذه النتيجة الراقية</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeCaseStudy.designStages.map((stage, i) => (
                  <div key={i} className="glass-panel p-6 rounded-2xl border border-white/20 dark:border-white/5 relative">
                    <div className="absolute top-4 left-4 text-3xl font-bold text-brand-primary/20">0{i+1}</div>
                    <h4 className="text-sm font-bold text-brand-dark dark:text-white mb-2">{stage.title}</h4>
                    <p className="text-xs text-brand-dark-gray dark:text-brand-gray/70 leading-relaxed">{stage.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sketches & Concepts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 space-y-4 text-right">
                <div className="inline-flex p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                  <PenTool size={20} />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark dark:text-white">الاسكتشات والمفاهيم الأولية</h3>
                <p className="text-sm text-brand-dark-gray dark:text-brand-gray/70 leading-relaxed">
                  نبدأ كل مشروع بالرسم اليدوي الحر وعمل العصف الذهني على الورق لنضمن التميز المطلق والبعد عن النمطية والأفكار الجاهزة.
                </p>
              </div>
              
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeCaseStudy.sketches.map((sketch, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden h-[200px] border border-brand-gray/20 dark:border-brand-dark-gray/20">
                    <img
                      src={sketch}
                      alt="اسكتش أولي للمشروع"
                      className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Style System (Colors & Typography) */}
            <div className="glass-panel p-8 rounded-3xl border border-white/40 dark:border-white/5 space-y-8">
              <div className="border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-4">
                <h3 className="text-xl font-bold text-brand-dark dark:text-white text-right">النظام البصري المعتمد</h3>
                <p className="text-xs text-brand-dark-gray/60 dark:text-brand-gray/50 text-right">الألوان والخطوط المستخدمة في الهوية</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                
                {/* Colors palette */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-brand-dark dark:text-white">لوحة الألوان الأساسية</h4>
                  <div className="flex gap-4">
                    {activeCaseStudy.colors.map((color, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-xl shadow-inner border border-brand-gray/30" style={{ backgroundColor: color }}></div>
                        <span className="text-[10px] font-mono font-bold text-brand-dark-gray dark:text-brand-gray">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography showcase */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-brand-dark dark:text-white">الخطوط المستخدمة</h4>
                  <div className="space-y-2">
                    {activeCaseStudy.fonts.map((font, i) => (
                      <div key={i} className="p-3 bg-brand-light/50 dark:bg-brand-dark-gray/10 rounded-xl border border-brand-gray/10 dark:border-brand-dark-gray/10">
                        <p className="text-xs font-semibold text-brand-dark dark:text-white">{font}</p>
                        <p className="text-lg font-bold text-brand-primary mt-1">أبجد هوز حطي كلمن</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* High Fidelity Mockups */}
            <div className="space-y-6">
              <div className="text-right">
                <h3 className="text-2xl font-bold text-brand-dark dark:text-white">موك ابس وتطبيقات الهوية</h3>
                <p className="text-sm text-brand-dark-gray/60 dark:text-brand-gray/50">عرض تفصيلي للهوية في بيئتها الطبيعية والواقعية</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeCaseStudy.mockups.map((mockup, idx) => (
                  <div key={idx} className="glass-panel rounded-2xl border border-white/20 dark:border-white/5 overflow-hidden shadow-lg group">
                    <div className="h-[240px] overflow-hidden">
                      <img
                        src={mockup.image}
                        alt={mockup.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="p-4 text-right border-t border-brand-gray/20 dark:border-brand-dark-gray/20">
                      <h4 className="text-xs font-bold text-brand-dark dark:text-white">{mockup.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA inside Case Study */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-primary/20 via-brand-secondary/10 to-transparent border border-brand-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 text-right">
              <div>
                <h4 className="text-lg font-bold text-brand-dark dark:text-white">هل أعجبك هذا العمل الإبداعي؟</h4>
                <p className="text-xs text-brand-dark-gray dark:text-brand-gray/70">دعنا نبتكر لعلامتك التجارية هوية بصرية مذهلة بمثل هذه التفاصيل الراقية.</p>
              </div>
              <button
                onClick={() => {
                  setActiveCaseStudy(null);
                  onStartProject();
                }}
                className="px-6 py-3 bg-brand-primary text-brand-dark font-bold text-xs rounded-xl hover:bg-brand-secondary transition-colors glow-primary whitespace-nowrap"
              >
                أطلق مشروعك المماثل الآن
              </button>
            </div>

          </motion.div>
        ) : (
          <div className="space-y-12">
            
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-primary">
                {siteTexts?.portfolioTag || 'معرض أعمالنا'}
              </h2>
              <h3 className="text-3xl sm:text-4xl font-bold text-brand-dark dark:text-white">
                {siteTexts?.portfolioTitle || 'هويات بصرية صممت لتبهر وتلهم'}
              </h3>
              <p className="text-brand-dark-gray dark:text-brand-gray/60 text-base">
                {siteTexts?.portfolioDesc || 'كل مشروع نخرجه هو قصة تفرد جديدة، تجسد دمج التفاصيل الدقيقة بالفخامة المينيمال لتقديم جودة استثنائية تفخر بها علامتك.'}
              </p>
            </div>

            {/* Case Studies Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayCaseStudies.map((study) => (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="glass-panel rounded-3xl border border-white/40 dark:border-white/5 overflow-hidden shadow-lg group hover:shadow-xl transition-all duration-300"
                >
                  {/* Card Cover image */}
                  <div className="h-[280px] overflow-hidden relative">
                    <img
                      src={study.coverImage}
                      alt={study.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-brand-dark/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-brand-primary border border-brand-primary/20">
                      {study.category}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 sm:p-8 space-y-4 text-right">
                    <div className="flex justify-between items-center text-xs text-brand-dark-gray/60 dark:text-brand-gray/40">
                      <span>العميل: {study.clientName}</span>
                      <span>تاريخ النشر: {study.date}</span>
                    </div>

                    <h3 className="text-xl font-bold text-brand-dark dark:text-white group-hover:text-brand-primary transition-colors">
                      {study.title}
                    </h3>

                    {/* Tags pill */}
                    <div className="flex flex-wrap gap-1.5">
                      {study.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] bg-brand-light dark:bg-brand-dark-gray/30 text-brand-dark-gray dark:text-brand-gray px-2.5 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Brief solution */}
                    <p className="text-xs text-brand-dark-gray dark:text-brand-gray/70 leading-relaxed line-clamp-3">
                      {study.challenges}
                    </p>

                    {/* Links row */}
                    <div className="pt-4 border-t border-brand-gray/20 dark:border-brand-dark-gray/20 flex gap-3">
                      <button
                        onClick={() => setActiveCaseStudy(study)}
                        className="flex-1 py-3 px-4 bg-brand-primary text-brand-dark font-bold text-xs rounded-xl hover:bg-brand-secondary transition-colors text-center flex items-center justify-center gap-2"
                      >
                        <Eye size={14} />
                        عرض دراسة الحالة بالكامل
                      </button>
                      <button
                        onClick={onStartProject}
                        className="py-3 px-4 bg-brand-light dark:bg-brand-dark-gray/20 hover:bg-brand-gray/20 text-brand-dark-gray dark:text-brand-gray font-semibold text-xs rounded-xl transition-colors"
                      >
                        أريد مشروعاً مماثلاً
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
