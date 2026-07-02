/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Project, ProjectType, SiteTexts, Service } from '../types';
import { Upload, Send, CheckCircle2, Copy, ArrowRight, Sparkles, Phone, Mail, Folder, DollarSign, Calendar, FileText, Share2, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface RequestProjectProps {
  onAddProject: (project: Project) => void;
  onNavigateToPortal: () => void;
  siteTexts?: SiteTexts;
  services?: Service[];
}

export default function RequestProject({ onAddProject, onNavigateToPortal, siteTexts, services }: RequestProjectProps) {
  // Form States
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('');

  // Set default projectType once services are loaded
  useEffect(() => {
    if (services && services.length > 0) {
      setProjectType(services[0].id);
    } else {
      setProjectType('identity');
    }
  }, [services]);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState('ر.س');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [description, setDescription] = useState('');
  
  // Drag and drop attachment states
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success State
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [formError, setFormError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFiles(e.target.files);
    }
  };

  const addFiles = (fileList: FileList) => {
    const list: { name: string; size: string }[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      list.push({ name: file.name, size: `${sizeInMB} MB` });
    }
    setAttachments(prev => [...prev, ...list]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !description || !budgetAmount) {
      setFormError('يرجى ملء جميع الحقول الإلزامية المعلمة بنجمة (*)');
      return;
    }
    setFormError('');

    // Generate project code and password (elhXXXX format)
    const randCodeNum = Math.floor(1000 + Math.random() * 9000);
    const code = `ELH-${randCodeNum}`;
    const password = `elh${randCodeNum}`; // secure portal passcode in format elhXXXX
    
    const todayStr = new Date().toISOString().split('T')[0];

    const projectFiles = attachments.map((att, i) => ({
      id: `att_${Date.now()}_${i}`,
      name: att.name,
      version: 'V1.0',
      date: todayStr,
      size: att.size,
      description: 'ملفات مرفقة من العميل مع طلب المشروع المبدئي.',
      type: att.name.split('.').pop()?.toUpperCase() || 'FILE'
    }));

    const finalBudget = `${budgetAmount} ${budgetCurrency}`;

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      code,
      password,
      name: `مشروع ${getProjectTypeLabel(projectType)} لشركة ${company || name}`,
      clientName: name,
      company: company || 'فردي',
      email: email || '',
      phone,
      type: projectType,
      status: 'received',
      progress: 5,
      startDate: todayStr,
      endDate: deliveryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: finalBudget,
      deliveryDate: deliveryDate || 'يحدد لاحقاً',
      description,
      timeline: [
        { id: 'st_1', title: 'استلام المشروع والاجتماع الأولي', status: 'completed', date: todayStr, description: 'تم استلام طلب المشروع بنجاح عبر النظام المطور وجاري تدقيقه من الإدارة.' },
        { id: 'st_2', title: 'تصميم خيارات الشعار المفهومية', status: 'pending', description: 'تطوير الاتجاهات الإبداعية للعلامة التجارية.' },
        { id: 'st_3', title: 'مراجعة خيارات الهوية واختيار الألوان', status: 'pending', description: 'اجتماع لاعتماد الشعار وتعديل باليت الألوان.' },
        { id: 'st_4', title: 'تعديلات ومواءمة تفاصيل التغليف والتطبيقات', status: 'pending', description: 'العمل على المخرجات الفرعية للبراند.' },
        { id: 'st_5', title: 'التسليم النهائي وإصدار ملف الهوية البصرية', status: 'pending', description: 'تجهيز وتسليم الملفات المفتوحة والمغلقة وكتاب الهوية.' }
      ],
      files: projectFiles,
      updates: [
        { id: 'up_init', date: `${todayStr} 09:00`, title: 'تقديم طلب المشروع بنجاح', content: 'تم تسجيل تفاصيل مشروعكم وتعيين رمز تتبع خاص ومؤقت في النظام التفاعلي لإلهامك.', author: 'system' }
      ],
      notes: [
        { id: 'msg_init', sender: 'admin', text: `مرحباً بك أستاذ ${name} في استوديو إلهامك للتصميم. لقد تلقينا طلبكم بخصوص مشروع ${getProjectTypeLabel(projectType)} لشركة ${company || name}. جاري مراجعة المرفقات والبدء بالتخطيط الفني وتعيين المصمم المعتمد. يمكنك طرح أي استفسار هنا وسنقوم بالرد المباشر عليك.`, date: `${todayStr} 09:05` }
      ],
      finalFiles: [],
      totalPrice: parseInt(budgetAmount.replace(/[^\d]/g, '')) || 0,
      paidAmount: 0,
      financialStatus: 'unpaid',
      financialTransactions: []
    };

    onAddProject(newProject);
    setCreatedProject(newProject);

    // Open WhatsApp link to alert designer
    const designerMsg = `🔔 تنبيه بوجود مشروع جديد!
    
👤 العميل: ${name}
🏢 الشركة: ${company || 'فردي'}
📱 هاتف العميل: ${phone}
📧 البريد: ${email || 'غير متوفر'}
💼 نوع الخدمة: ${getProjectTypeLabel(projectType)}
💰 الميزانية: ${finalBudget}
📅 موعد التسليم: ${deliveryDate || 'يحدد لاحقاً'}

📝 نبذة عن المشروع:
${description}

🔑 كلمة المرور للتتبع: ${password}`;

    const designerWhatsappUrl = `https://wa.me/967775398538?text=${encodeURIComponent(designerMsg)}`;
    try {
      window.open(designerWhatsappUrl, '_blank');
    } catch (e) {
      console.log("Auto-popup blocked, user will click the manual button.");
    }
  };

  const getProjectTypeLabel = (type: ProjectType) => {
    if (services && services.length > 0) {
      const found = services.find(s => s.id === type);
      if (found) return found.title;
    }
    switch (type) {
      case 'identity': return 'هوية بصرية كاملة';
      case 'logo': return 'تصميم شعار حصرى';
      case 'packaging': return 'تصميم التغليف والعلب';
      case 'uiux': return 'تصميم واجهات UI/UX';
      case 'development': return 'تطوير موقع إلكتروني';
      default: return type;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-24" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {createdProject ? (
          /* Receipt Success Screen with custom card */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 sm:p-12 rounded-3xl border border-brand-primary/30 shadow-2xl space-y-8 text-center relative overflow-hidden"
          >
            {/* Ambient turquoise light behind card */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-primary/15 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark dark:text-white">تم استلام طلبكم بنجاح!</h2>
              <p className="text-sm text-brand-dark-gray dark:text-brand-gray/70 max-w-lg mx-auto leading-relaxed">
                مرحباً بك في شركائنا أ. {createdProject.clientName}. قمنا بتسجيل مشروعك تلقائياً في بوابة العملاء وجاري توجيه فريق التصميم للعمل عليه.
              </p>
            </div>

            {/* Ticket Box containing Client Code & Password */}
            <div className="max-w-md mx-auto bg-brand-light/50 dark:bg-brand-dark-gray/20 rounded-2xl p-6 border border-brand-gray/20 dark:border-brand-dark-gray/20 space-y-4">
              <div className="text-center">
                <span className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 uppercase tracking-widest font-bold">بوابة العميل الآمنة</span>
                <p className="text-xs text-brand-primary font-bold mt-1">يرجى حفظ كلمة المرور التالية، فهي كل ما تحتاجه للدخول ومتابعة سير العمل</p>
              </div>

              <div className="text-right pt-2">
                <div className="bg-white dark:bg-brand-dark p-4 rounded-xl border border-brand-gray/15 dark:border-brand-dark-gray/15 relative flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 font-bold">كلمة المرور الخاصة بالدخول</span>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-2xl font-mono font-bold text-brand-primary tracking-wide">{createdProject.password}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdProject.password || '')}
                      className="p-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg text-brand-primary transition-colors"
                      title="نسخ كلمة المرور"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* WhatsApp & Message Share Actions */}
              <div className="pt-4 border-t border-brand-gray/10 dark:border-brand-dark-gray/10 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const msg = `مرحباً بك أ. ${createdProject.clientName}، يسعدنا في استوديو التصميم إبلاغك باعتماد طلب مشروعك بنجاح.

يمكنك تتبع سير مشروعك ومراجعة المخرجات الفنية والتحدث مباشرة معنا عبر بوابة العميل المباشرة:
🔗 الرابط: ${window.location.origin}
🔑 كلمة المرور الخاصة بالدخول المباشر: ${createdProject.password}

أهلاً بك معنا!`;
                    copyToClipboard(msg);
                  }}
                  className="w-full py-2 px-4 bg-brand-light dark:bg-brand-dark-gray/30 text-brand-dark-gray dark:text-brand-gray font-semibold text-xs rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary transition-all flex items-center justify-center gap-2 border border-brand-gray/10"
                >
                  <Copy size={14} />
                  <span>نسخ رسالة الدخول الجاهزة للعميل</span>
                </button>

                <a
                  href={`https://wa.me/${
                    (() => {
                      let cleaned = createdProject.phone.replace(/[^0-9]/g, '');
                      if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);
                      if (cleaned.startsWith('0') && cleaned.length === 10) {
                        cleaned = '966' + cleaned.slice(1);
                      } else if (cleaned.length === 9 && (cleaned.startsWith('77') || cleaned.startsWith('73') || cleaned.startsWith('71') || cleaned.startsWith('70'))) {
                        cleaned = '967' + cleaned;
                      }
                      return cleaned;
                    })()
                  }?text=${encodeURIComponent(
                    `مرحباً بك أ. ${createdProject.clientName}، يسعدنا في استوديو التصميم إبلاغك باعتماد طلب مشروعك بنجاح.

يمكنك تتبع سير مشروعك ومراجعة المخرجات الفنية والتحدث مباشرة معنا عبر بوابة العميل المباشرة:
🔗 الرابط: ${window.location.origin}
🔑 كود المشروع: ${createdProject.code}
🔒 كلمة المرور: ${createdProject.password}

أهلاً بك معنا!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-4 bg-[#25D366] text-white font-bold text-xs rounded-xl hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageSquare size={14} />
                  <span>إرسال تفاصيل الدخول عبر الواتساب</span>
                </a>

                {/* WhatsApp Notification to the Designer */}
                <a
                  href={`https://wa.me/967775398538?text=${encodeURIComponent(
                    `🔔 تنبيه بوجود مشروع جديد!
                    
👤 العميل: ${createdProject.clientName}
🏢 الشركة: ${createdProject.company || 'فردي'}
📱 هاتف العميل: ${createdProject.phone}
📧 البريد: ${createdProject.email || 'غير متوفر'}
💼 نوع الخدمة: ${getProjectTypeLabel(createdProject.type)}
💰 الميزانية: ${createdProject.budget}
📅 موعد التسليم: ${createdProject.deliveryDate || 'يحدد لاحقاً'}

📝 نبذة عن المشروع:
${createdProject.description}

🔑 كلمة المرور للتتبع: ${createdProject.password}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-brand-primary text-brand-dark font-extrabold text-xs rounded-xl hover:bg-brand-secondary transition-all flex items-center justify-center gap-2 shadow-md border-2 border-brand-primary/20"
                >
                  <MessageSquare size={14} />
                  <span>إرسال إشعار للمصمم عبر الواتساب (775398538) 📲</span>
                </a>
              </div>

              {copied && (
                <p className="text-[10px] text-alert-success font-bold text-center transition-opacity">
                  ✓ تم نسخ البيانات بنجاح إلى الحافظة
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto pt-4">
              <button
                onClick={onNavigateToPortal}
                className="flex-1 py-3.5 px-6 bg-brand-primary text-brand-dark font-bold text-xs rounded-xl hover:bg-brand-secondary transition-all flex items-center justify-center gap-2 glow-primary"
              >
                <span>الانتقال المباشر لبوابة العميل</span>
                <ArrowRight size={14} className="rotate-180" />
              </button>
              
              <button
                onClick={() => setCreatedProject(null)}
                className="py-3.5 px-6 bg-brand-light dark:bg-brand-dark-gray/20 hover:bg-brand-gray/20 text-brand-dark-gray dark:text-brand-gray font-semibold text-xs rounded-xl transition-all"
              >
                طلب مشروع آخر
              </button>
            </div>

          </motion.div>
        ) : (
          <div className="space-y-12">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-primary">
                {siteTexts?.requestTag || 'طلب مشروع جديد'}
              </h2>
              <h3 className="text-3xl font-bold text-brand-dark dark:text-white">
                {siteTexts?.requestTitle || 'لنصمم معاً شيئاً مذهلاً'}
              </h3>
              <p className="text-brand-dark-gray dark:text-brand-gray/60 text-sm leading-relaxed">
                {siteTexts?.requestDesc || 'املأ الاستبيان الإبداعي وسيقوم خبراؤنا بدراسة مشروعك فوراً وإنشاء ملف تفاعلي آمن ومباشر لك لمتابعة الخطوات ومراجعة المخرجات الفنية لحظة بلحظة.'}
              </p>
            </div>

            {/* Smart Request Form */}
            <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                    الاسم الكامل <span className="text-alert-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="أ. عبد الله محمد"
                      className="w-full text-sm bg-white dark:bg-brand-dark border border-brand-gray dark:border-brand-dark-gray/40 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-colors text-right"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                    اسم الشركة / المنشأة <span className="text-brand-dark-gray/40">(اختياري)</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="شركة أصيل المحدودة"
                    className="w-full text-sm bg-white dark:bg-brand-dark border border-brand-gray dark:border-brand-dark-gray/40 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-colors text-right"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                    البريد الإلكتروني <span className="text-brand-dark-gray/40">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full text-sm bg-white dark:bg-brand-dark border border-brand-gray dark:border-brand-dark-gray/40 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-colors text-right"
                    />
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                    رقم الواتساب <span className="text-alert-error">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full text-sm bg-white dark:bg-brand-dark border border-brand-gray dark:border-brand-dark-gray/40 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-colors text-right"
                  />
                </div>

                {/* Project Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                    نوع المشروع المطلوبة <span className="text-alert-error">*</span>
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as ProjectType)}
                    className="w-full text-sm bg-white dark:bg-brand-dark border border-brand-gray dark:border-brand-dark-gray/40 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-colors text-right appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2312C7C3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-chevron-down'><path d='m6 9 6 6 6-6'/></svg>")`, backgroundPosition: 'left 12px center', backgroundRepeat: 'no-repeat' }}
                  >
                    {services && services.length > 0 ? (
                      services.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.title}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="identity">تصميم الهوية البصرية والبراندنج</option>
                        <option value="logo">تصميم الشعار وتطبيقاته فقط</option>
                        <option value="packaging">تصميم التغليف والعلب المتميزة</option>
                        <option value="uiux">تصميم واجهات مستخدم UI/UX</option>
                        <option value="development">تطوير موقع إلكتروني احترافي وتفاعلي</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                    الميزانية التقديرية للاستثمار <span className="text-alert-error">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="حدد ميزانيتك (مثال: 5000)"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      className="flex-grow text-sm bg-white dark:bg-brand-dark border border-brand-gray dark:border-brand-dark-gray/40 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-colors text-right"
                    />
                    <select
                      value={budgetCurrency}
                      onChange={(e) => setBudgetCurrency(e.target.value)}
                      className="w-28 text-sm bg-white dark:bg-brand-dark border border-brand-gray dark:border-brand-dark-gray/40 rounded-xl py-3 px-2 outline-none focus:border-brand-primary transition-colors text-center appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2312C7C3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m3 4.5 3 3 3-3'/></svg>")`, backgroundPosition: 'left 8px center', backgroundRepeat: 'no-repeat' }}
                    >
                      <option value="ر.س">سعودي (ر.س)</option>
                      <option value="دولار">دولار ($)</option>
                      <option value="ر.ي">يمني (ر.ي)</option>
                    </select>
                  </div>
                </div>

                {/* Desired Delivery Date */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                    موعد التسليم التقريبي المرغوب <span className="text-brand-dark-gray/40">(اختياري)</span>
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full text-sm bg-white dark:bg-brand-dark border border-brand-gray dark:border-brand-dark-gray/40 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-colors text-right"
                  />
                </div>

                {/* Project Details */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                    شرح وتفاصيل فكرة المشروع <span className="text-alert-error">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="مثال: نرغب في تصميم هوية بصرية مذهلة لبراند عطور جديدة يستهدف جيل الشباب في الخليج. نريد شعاراً يدمج بين تداخل خطوط الكوفية وملمس الزجاج المات..."
                    className="w-full text-sm bg-white dark:bg-brand-dark border border-brand-gray dark:border-brand-dark-gray/40 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-colors text-right leading-relaxed"
                  />
                </div>

                {/* Drag & Drop Attachments */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1.5">
                    رفع ملفات الإلهام، الشعار الحالي أو لوحة المزاج <span className="text-brand-dark-gray/40">(اختياري)</span>
                  </label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 ${
                      isDragActive 
                        ? 'border-brand-primary bg-brand-primary/5' 
                        : 'border-brand-gray dark:border-brand-dark-gray/40 hover:border-brand-primary/60 bg-brand-light/30 dark:bg-brand-dark-gray/5'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <div className="p-3 bg-brand-primary/10 rounded-full text-brand-primary">
                      <Upload size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-brand-dark dark:text-white">اسحب وأسقط الملفات هنا، أو انقر للتصفح</p>
                      <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40">يدعم صيغ PDF, PNG, JPG, AI (بحد أقصى 50 ميجا بايت للملف)</p>
                    </div>
                  </div>

                  {/* Attachment List */}
                  {attachments.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] font-bold text-brand-dark dark:text-white">الملفات المرفقة ({attachments.length}):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attachments.map((att, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-brand-light dark:bg-brand-dark-gray/20 rounded-xl border border-brand-gray/10 text-xs">
                            <span className="font-semibold text-brand-dark dark:text-white truncate max-w-[180px]">{att.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-brand-dark-gray/60 dark:text-brand-gray/40">{att.size}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAttachment(idx);
                                }}
                                className="text-alert-error hover:underline"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {formError && (
                <div className="p-4 bg-alert-error/10 border border-alert-error/20 text-alert-error rounded-xl text-xs font-bold text-center">
                  ⚠️ {formError}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-brand-gray/20 dark:border-brand-dark-gray/20 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-4 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-bold text-sm rounded-2xl transition-all duration-300 flex items-center gap-2 glow-primary"
                >
                  <span>تقديم طلب كود المشروع وتوليد بوابة العميل</span>
                  <Send size={15} className="rotate-180" />
                </button>
              </div>

            </form>

          </div>
        )}

      </div>
    </div>
  );
}
