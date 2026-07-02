/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Package, Layers, Code, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { SERVICES } from '../data';
import { Service, SiteTexts } from '../types';

interface ServicesProps {
  onStartProject: (serviceType: string) => void;
  services?: Service[];
  siteTexts?: SiteTexts;
}

export default function Services({ onStartProject, services, siteTexts }: ServicesProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const displayServices = services || SERVICES;

  const getIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-brand-primary" />;
      case 'Package':
        return <Package className="w-6 h-6 text-brand-primary" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-brand-primary" />;
      case 'Code':
        return <Code className="w-6 h-6 text-brand-primary" />;
      default:
        return <Sparkles className="w-6 h-6 text-brand-primary" />;
    }
  };

  return (
    <section className="py-24 relative overflow-hidden" dir="rtl">
      {/* Background glowing elements */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[100px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-primary">
            {siteTexts?.servicesTag || 'خدمات الاستوديو'}
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-dark dark:text-white">
            {siteTexts?.servicesTitle || 'حلول تصميم إبداعية بمعايير عالمية احترافية'}
          </h3>
          <p className="text-brand-dark-gray dark:text-brand-gray/60 text-base">
            {siteTexts?.servicesDesc || 'نحن لا نصمم للتصميم فقط، بل نهيكل النظام البصري المتكامل الذي يبرز ريادتك في السوق وينقل قيمتك الحقيقية لجمهورك المستهدف.'}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-panel p-8 rounded-3xl border border-white/40 dark:border-white/5 shadow-md flex flex-col justify-between transition-all duration-300 relative group"
            >
              <div className="space-y-6">
                {service.image && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden mb-2 border border-brand-primary/10">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                {/* Icon Container with subtle glow */}
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-brand-dark transition-all duration-300">
                  {getIcon(service.iconName)}
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-brand-dark dark:text-white group-hover:text-brand-primary transition-colors">
                    {service.title}
                  </h4>
                  <p className="text-sm text-brand-dark-gray dark:text-brand-gray/70 leading-relaxed line-clamp-4">
                    {service.description}
                  </p>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-brand-gray/20 dark:border-brand-dark-gray/20 flex flex-col gap-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-dark-gray/60 dark:text-brand-gray/40">مستوى الاستثمار</span>
                  <span className="font-bold text-brand-primary">{service.priceRange}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="flex-1 py-2 px-3 text-xs font-bold text-center bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-dark rounded-xl transition-all duration-300"
                  >
                    عرض التفاصيل
                  </button>
                  <button
                    onClick={() => onStartProject(service.id)}
                    className="py-2 px-4 text-xs font-bold text-brand-dark bg-brand-primary hover:bg-brand-secondary rounded-xl transition-all"
                  >
                    طلب الخدمة
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Service Modal/Details Detail Panel */}
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-brand-dark border border-brand-gray/20 dark:border-brand-dark-gray/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-6 left-6 text-brand-dark-gray dark:text-brand-gray hover:text-brand-primary transition-colors p-1 rounded-lg"
              >
                ✕
              </button>

              <div className="flex items-center gap-4 border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                  {getIcon(selectedService.iconName)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-brand-dark dark:text-white">{selectedService.title}</h4>
                  <p className="text-xs text-brand-primary">استثمار يبدأ من: {selectedService.priceRange}</p>
                </div>
              </div>

              <div className="space-y-4 text-right">
                {selectedService.image && (
                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-brand-primary/10 mb-4">
                    <img 
                      src={selectedService.image} 
                      alt={selectedService.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <p className="text-sm text-brand-dark-gray dark:text-brand-gray/80 leading-relaxed">
                  {selectedService.description}
                </p>

                <div className="space-y-3">
                  <h5 className="text-sm font-bold text-brand-dark dark:text-white">ماذا يشمل هذا المفهوم الفني؟</h5>
                  <ul className="space-y-2.5">
                    {selectedService.features.map((feature, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-xs text-brand-dark-gray dark:text-brand-gray/70">
                        <CheckCircle2 size={14} className="text-brand-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-brand-gray/20 dark:border-brand-dark-gray/20">
                <button
                  onClick={() => {
                    const id = selectedService.id;
                    setSelectedService(null);
                    onStartProject(id);
                  }}
                  className="flex-1 py-3 px-4 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-bold text-xs rounded-xl transition-colors text-center shadow-md shadow-brand-primary/10"
                >
                  حجز وطلب المشروع الآن
                </button>
                <button
                  onClick={() => setSelectedService(null)}
                  className="py-3 px-6 bg-brand-light dark:bg-brand-dark-gray/20 hover:bg-brand-gray/20 text-brand-dark-gray dark:text-brand-gray font-semibold text-xs rounded-xl transition-colors"
                >
                  إغلاق نافذة التفاصيل
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </section>
  );
}
