/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectStatus, ProjectFile, ChatMessage, ProjectUpdate, Service, CaseStudy, SiteTexts } from '../types';
import { 
  DollarSign, ShieldAlert, Plus, Edit, Trash2, CheckCircle2, RefreshCw, Eye, 
  MessageSquare, Files, Activity, User, ShieldCheck, Mail, Phone, Calendar, 
  Layers, Palette, FileText, ArrowLeft, Image, Sparkles, Upload, Receipt, Coins, TrendingDown, TrendingUp, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  projects: Project[];
  onUpdateProject: (updatedProject: Project) => void;
  onDeleteProject: (id: string) => void;
  
  services: Service[];
  onUpdateServices: (updatedServices: Service[]) => void;
  
  caseStudies: CaseStudy[];
  onUpdateCaseStudies: (updatedCaseStudies: CaseStudy[]) => void;
  
  siteTexts: SiteTexts;
  onUpdateSiteTexts: (updatedSiteTexts: SiteTexts) => void;

  onImportBackup: (data: { projects?: Project[]; services?: Service[]; caseStudies?: CaseStudy[]; siteTexts?: SiteTexts }) => void;
  adminPassword?: string;
  onUpdateAdminPassword?: (newPassword: string) => void;
}

export default function AdminDashboard({
  projects,
  onUpdateProject,
  onDeleteProject,
  services,
  onUpdateServices,
  caseStudies,
  onUpdateCaseStudies,
  siteTexts,
  onUpdateSiteTexts,
  onImportBackup,
  adminPassword = '5398538',
  onUpdateAdminPassword
}: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'texts' | 'services' | 'portfolio' | 'backup' | 'financials'>('projects');
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Accounting and Ledger states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('marketing');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Record Payment Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentProjectCode, setPaymentProjectCode] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDesc, setPaymentDesc] = useState('دفعة مستلمة لتنفيذ أعمال المرحلة');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit Contract Price modal states
  const [isContractPriceModalOpen, setIsContractPriceModalOpen] = useState(false);
  const [contractPriceProjectCode, setContractPriceProjectCode] = useState('');
  const [contractPriceAmount, setContractPriceAmount] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateAdminPassword) return;

    if (currentPass !== adminPassword) {
      triggerToast('❌ كلمة المرور الحالية غير صحيحة.');
      return;
    }
    if (newPass.trim().length < 4) {
      triggerToast('❌ يجب أن تتكون كلمة المرور الجديدة من 4 خانات على الأقل.');
      return;
    }
    if (newPass !== confirmPass) {
      triggerToast('❌ كلمة المرور الجديدة وتأكيدها غير متطابقتين.');
      return;
    }

    onUpdateAdminPassword(newPass.trim());
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    triggerToast('✓ تم تغيير كلمة مرور الإدارة بنجاح ومزامنتها!');
  };
  
  // ----------------------------------------------------
  // Projects tab state and logic
  // ----------------------------------------------------
  const [editStatus, setEditStatus] = useState<ProjectStatus>('received');
  const [editProgress, setEditProgress] = useState(0);
  const [editPassword, setEditPassword] = useState('');
  const [updateLogTitle, setUpdateLogTitle] = useState('');
  const [updateLogContent, setUpdateLogContent] = useState('');
  const [replyText, setReplyText] = useState('');
  const [finalFileName, setFinalFileName] = useState('');
  const [finalFileType, setFinalFileType] = useState('AI');
  const [finalFileDesc, setFinalFileDesc] = useState('');

  const handleSelectProject = (proj: Project) => {
    setSelectedProject(proj);
    setEditStatus(proj.status);
    setEditProgress(proj.progress);
    setEditPassword(proj.password || '');
    setUpdateLogTitle('');
    setUpdateLogContent('');
    setReplyText('');
    setFinalFileName('');
    setFinalFileDesc('');
  };

  const handleApplyChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    let updatedUpdates = [...selectedProject.updates];
    const todayStr = new Date().toISOString().split('T')[0];

    if (updateLogTitle.trim() && updateLogContent.trim()) {
      const newUp: ProjectUpdate = {
        id: `up_${Date.now()}`,
        date: `${todayStr} ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`,
        title: updateLogTitle.trim(),
        content: updateLogContent.trim(),
        author: 'admin'
      };
      updatedUpdates = [newUp, ...updatedUpdates];
    }

    if (editStatus !== selectedProject.status) {
      const statusChangeMsg: ProjectUpdate = {
        id: `up_status_${Date.now()}`,
        date: `${todayStr} ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`,
        title: `تعديل حالة المشروع إلى: ${getStatusLabel(editStatus)}`,
        content: `تم تغيير حالة سير المشروع حالياً لتصبح [${getStatusLabel(editStatus)}] بنسبة تقدم بلغت ${editProgress}%.`,
        author: 'system'
      };
      updatedUpdates = [statusChangeMsg, ...updatedUpdates];
    }

    const updatedTimeline = selectedProject.timeline.map((step, idx) => {
      if (editStatus === 'received' && idx > 0) return { ...step, status: 'pending' as const };
      if (editStatus === 'design' && idx === 1) return { ...step, status: 'active' as const, date: todayStr };
      if (editStatus === 'review' && idx === 2) return { ...step, status: 'active' as const, date: todayStr };
      if (editStatus === 'modification' && idx === 3) return { ...step, status: 'active' as const, date: todayStr };
      if (editStatus === 'delivered') return { ...step, status: 'completed' as const, date: todayStr };
      
      if (editProgress >= 90 && idx < 4) return { ...step, status: 'completed' as const, date: todayStr };
      if (editProgress >= 60 && idx < 3) return { ...step, status: 'completed' as const, date: todayStr };
      if (editProgress >= 30 && idx < 2) return { ...step, status: 'completed' as const, date: todayStr };
      
      return step;
    });

    const updatedProject: Project = {
      ...selectedProject,
      status: editStatus,
      progress: editProgress,
      password: editPassword,
      updates: updatedUpdates,
      timeline: updatedTimeline
    };

    onUpdateProject(updatedProject);
    setSelectedProject(updatedProject);
    setUpdateLogTitle('');
    setUpdateLogContent('');
    triggerToast('✓ تم حفظ جميع تعديلات التقدم والحالة بنجاح.');
  };

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedProject) return;

    const replyMsg: ChatMessage = {
      id: `msg_admin_${Date.now()}`,
      sender: 'admin',
      text: replyText.trim(),
      date: new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedProject: Project = {
      ...selectedProject,
      notes: [...selectedProject.notes, replyMsg]
    };

    onUpdateProject(updatedProject);
    setSelectedProject(updatedProject);
    setReplyText('');
  };

  const handleAddFinalFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalFileName.trim() || !selectedProject) return;

    const newFinal: ProjectFile = {
      id: `final_${Date.now()}`,
      name: finalFileName.trim(),
      version: 'Final',
      date: new Date().toISOString().split('T')[0],
      size: '15.4 MB',
      description: finalFileDesc.trim() || 'ملفات الإنتاج الفنية المعتمدة عالية الدقة.',
      type: finalFileType
    };

    const updatedProject: Project = {
      ...selectedProject,
      finalFiles: [...(selectedProject.finalFiles || []), newFinal]
    };

    onUpdateProject(updatedProject);
    setSelectedProject(updatedProject);
    setFinalFileName('');
    setFinalFileDesc('');
    triggerToast('✓ تم إضافة ملف التسليم النهائي بنجاح.');
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case 'received': return 'استلام الطلب';
      case 'design': return 'قيد التصميم';
      case 'review': return 'مراجعة العميل';
      case 'modification': return 'جاري التعديل';
      case 'delivered': return 'تم التسليم';
    }
  };

  // Stats Calculations
  const totalBudgetVolume = projects.reduce((acc, p) => {
    const numericPart = parseInt(p.budget.replace(/[^0-9]/g, ''), 10) || 0;
    return acc + numericPart;
  }, 0);

  const activeProjectsCount = projects.filter(p => p.status !== 'delivered').length;
  const completedProjectsCount = projects.filter(p => p.status === 'delivered').length;
  const totalFilesUploaded = projects.reduce((acc, p) => acc + p.files.length, 0);
  const totalClientNotes = projects.reduce((acc, p) => acc + p.notes.length, 0);

  // ----------------------------------------------------
  // Texts Tab states and logic
  // ----------------------------------------------------
  const [localTexts, setLocalTexts] = useState<SiteTexts>(() => JSON.parse(JSON.stringify(siteTexts)));
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  
  useEffect(() => {
    if (siteTexts) {
      setLocalTexts(JSON.parse(JSON.stringify(siteTexts)));
    }
  }, [siteTexts]);

  const handleUpdateSiteTextProp = (prop: keyof SiteTexts, value: any) => {
    setLocalTexts(prev => ({
      ...prev,
      [prop]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        triggerToast('❌ يرجى اختيار ملف صورة فقط.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          handleUpdateSiteTextProp('logoUrl', base64Url);
          triggerToast('✓ تم تحميل صورة الشعار بنجاح! لا تنسَ حفظ التغييرات بالضغط على زر الحفظ بالأسفل.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAllSiteTexts = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteTexts(localTexts);
    triggerToast('✓ تم تحديث نصوص الموقع بالكامل وحفظ التغييرات بنجاح!');
  };

  // ----------------------------------------------------
  // Services Tab states and logic
  // ----------------------------------------------------
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [srvTitle, setSrvTitle] = useState('');
  const [srvPrice, setSrvPrice] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvImage, setSrvImage] = useState('');
  const [srvFeaturesStr, setSrvFeaturesStr] = useState('');

  const handleEditServiceClick = (srv: Service) => {
    setSelectedService(srv);
    setSrvTitle(srv.title);
    setSrvPrice(srv.priceRange);
    setSrvDesc(srv.description);
    setSrvImage(srv.image || '');
    setSrvFeaturesStr(srv.features.join('\n'));
  };

  const handleAddNewServiceClick = () => {
    setSelectedService({
      id: `srv_${Date.now()}`,
      title: '',
      description: '',
      iconName: 'Sparkles',
      features: [],
      priceRange: ''
    });
    setSrvTitle('');
    setSrvPrice('');
    setSrvDesc('');
    setSrvImage('');
    setSrvFeaturesStr('');
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الخدمة بالكامل؟')) {
      const updated = services.filter(s => s.id !== id);
      onUpdateServices(updated);
      setSelectedService(null);
      triggerToast('✓ تم حذف الخدمة بنجاح!');
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const exists = services.some(s => s.id === selectedService.id);
    let updated: Service[];

    const newServiceData: Service = {
      ...selectedService,
      title: srvTitle,
      priceRange: srvPrice,
      description: srvDesc,
      image: srvImage || undefined,
      features: srvFeaturesStr.split('\n').filter(f => f.trim() !== '')
    };

    if (exists) {
      updated = services.map(s => s.id === selectedService.id ? newServiceData : s);
      triggerToast('✓ تم تعديل الخدمة وتحديث السعر والصورة بنجاح!');
    } else {
      updated = [...services, newServiceData];
      triggerToast('✓ تم إضافة الخدمة الجديدة بنجاح!');
    }

    onUpdateServices(updated);
    setSelectedService(null);
  };

  // ----------------------------------------------------
  // Portfolio Tab states and logic
  // ----------------------------------------------------
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [isAddingNewCase, setIsAddingNewCase] = useState(false);
  
  // Case Study fields
  const [caseTitle, setCaseTitle] = useState('');
  const [caseClient, setCaseClient] = useState('');
  const [caseCategory, setCaseCategory] = useState('identity');
  const [caseCover, setCaseCover] = useState('');
  const [caseDesc, setCaseDesc] = useState('');
  const [caseChallenges, setCaseChallenges] = useState('');
  const [caseSolutions, setCaseSolutions] = useState('');
  const [caseTagsStr, setCaseTagsStr] = useState('');

  // 3 project mockup images (up to 3 images from device or links)
  const [mockupImages, setMockupImages] = useState<{ title: string; image: string }[]>([
    { title: 'التطبيق الأول للعلامة التجارية', image: '' },
    { title: 'التطبيق الثاني للعلامة التجارية', image: '' },
    { title: 'التطبيق الثالث للعلامة التجارية', image: '' }
  ]);

  const resetCaseForm = () => {
    setCaseTitle('');
    setCaseClient('');
    setCaseCategory('identity');
    setCaseCover('');
    setCaseDesc('');
    setCaseChallenges('');
    setCaseSolutions('');
    setCaseTagsStr('');
    setMockupImages([
      { title: 'التطبيق الأول للعلامة التجارية', image: '' },
      { title: 'التطبيق الثاني للعلامة التجارية', image: '' },
      { title: 'التطبيق الثالث للعلامة التجارية', image: '' }
    ]);
  };

  const handleEditCaseClick = (study: CaseStudy) => {
    setEditingCase(study);
    setIsAddingNewCase(false);
    setCaseTitle(study.title);
    setCaseClient(study.clientName);
    setCaseCategory(study.category);
    setCaseCover(study.coverImage);
    setCaseDesc(study.solutions || ''); // Fallback as desc
    setCaseChallenges(study.challenges);
    setCaseSolutions(study.solutions);
    setCaseTagsStr(study.tags.join(', '));
    
    // Load up to 3 mockups
    const m = study.mockups || [];
    setMockupImages([
      { title: m[0]?.title || 'التطبيق الأول للعلامة التجارية', image: m[0]?.image || '' },
      { title: m[1]?.title || 'التطبيق الثاني للعلامة التجارية', image: m[1]?.image || '' },
      { title: m[2]?.title || 'التطبيق الثالث للعلامة التجارية', image: m[2]?.image || '' }
    ]);
  };

  const handleAddNewCaseClick = () => {
    setEditingCase(null);
    setIsAddingNewCase(true);
    resetCaseForm();
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        triggerToast('❌ يرجى اختيار ملف صورة فقط.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setCaseCover(base64Url);
        triggerToast('✓ تم رفع غلاف المشروع بنجاح من الجهاز!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMockupImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        triggerToast('❌ يرجى اختيار ملف صورة فقط.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setMockupImages(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], image: base64Url };
          return updated;
        });
        triggerToast(`✓ تم تحميل الصورة ${index + 1} بنجاح من الجهاز!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCaseStudy = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedTags = caseTagsStr.split(',').map(t => t.trim()).filter(t => t !== '');
    const defaultDesignStages = [
      { title: 'التخطيط والتحليل', description: 'دراسة وتحليل متطلبات المشروع وبناء الفكرة الاستراتيجية.' },
      { title: 'بناء الهيكل الفني', description: 'هندسة تجربة تصفح العميل وصياغة الأبعاد والكتل المرئية.' },
      { title: 'التصميم الإبداعي الرغيد', description: 'ابتكار الشعارات ودمج الطباعة الفاخرة والألوان المينيمال.' },
      { title: 'دليل استخدام الهوية الشامل', description: 'تأسيس المعايير الصارمة لثبات الهوية وعقد المراجعات.' }
    ];

    // Filter out mockups that don't have images
    const finalMockups = mockupImages.filter(img => img.image.trim() !== '');
    // Fallback to cover image if none uploaded
    if (finalMockups.length === 0) {
      finalMockups.push({
        title: 'المفهوم الأساسي والتطبيقات',
        image: caseCover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'
      });
    }

    if (isAddingNewCase) {
      const newStudy: CaseStudy = {
        id: `case_${Date.now()}`,
        title: caseTitle,
        clientName: caseClient,
        category: caseCategory,
        date: new Date().getFullYear().toString(),
        coverImage: caseCover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
        tags: parsedTags.length > 0 ? parsedTags : [caseCategory, 'هوية فخمة'],
        challenges: caseChallenges || 'التحدي الإبداعي وصناعة هوية فخمة تليق برؤية العميل الرائد وتوجهه الاستراتيجي.',
        solutions: caseSolutions || caseDesc || 'ابتكار الهوية البصرية المتكاملة بنمط مينيمال يعزز من قيمة ومستوى جودة العلامة.',
        designStages: defaultDesignStages,
        sketches: [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop'
        ],
        colors: ['#0A0A0A', '#1C1C1E', '#12C7C3', '#E5E5EA'],
        fonts: ['Inter', 'Space Grotesk', 'Fira Code'],
        mockups: finalMockups
      };

      onUpdateCaseStudies([newStudy, ...caseStudies]);
      setIsAddingNewCase(false);
      triggerToast('✓ تم إضافة مشروع جديد بنجاح لمعرض الأعمال!');
    } else if (editingCase) {
      const updated = caseStudies.map(study => {
        if (study.id === editingCase.id) {
          return {
            ...study,
            title: caseTitle,
            clientName: caseClient,
            category: caseCategory,
            coverImage: caseCover,
            tags: parsedTags.length > 0 ? parsedTags : study.tags,
            challenges: caseChallenges || study.challenges,
            solutions: caseSolutions || study.solutions,
            mockups: finalMockups
          };
        }
        return study;
      });

      onUpdateCaseStudies(updated);
      setEditingCase(null);
      triggerToast('✓ تم حفظ تعديلات مشروع معرض الأعمال بنجاح!');
    }
  };

  const handleDeleteCaseStudy = (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا المشروع من معرض الأعمال بالكامل؟')) {
      onUpdateCaseStudies(caseStudies.filter(study => study.id !== id));
      triggerToast('✓ تم حذف المشروع بنجاح من معرض الأعمال.');
      if (editingCase?.id === id) {
        setEditingCase(null);
      }
    }
  };

  return (
    <div className="py-24" dir="rtl">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-dark dark:bg-white text-white dark:text-brand-dark px-5 py-3 rounded-2xl shadow-xl border border-white/10 dark:border-brand-dark-gray/10 text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#12C7C3] animate-pulse"></span>
          {toastMessage}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-right">
        
        {/* Dashboard Title & Meta */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={24} className="text-brand-primary animate-pulse" />
              <h2 className="text-2xl font-bold text-brand-dark dark:text-white">بوابة التحكم الإدارية المطلقة</h2>
            </div>
            <p className="text-xs text-brand-dark-gray/60 dark:text-brand-gray/40">تعديل نصوص الموقع، إدارة الأسعار والخدمات، تحديث معرض الأعمال، وتتبع طلبات العملاء.</p>
          </div>
          
          {/* Main SubTab Selector */}
          <div className="flex flex-wrap gap-2 bg-brand-light/40 dark:bg-brand-dark-gray/30 p-1.5 rounded-2xl border border-brand-gray/10">
            <button
              onClick={() => setActiveSubTab('projects')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'projects'
                  ? 'bg-brand-primary text-brand-dark shadow'
                  : 'text-brand-dark-gray hover:text-brand-primary dark:text-brand-gray/80'
              }`}
            >
              <MessageSquare size={14} />
              طلبات المشاريع ({projects.length})
            </button>
            <button
              onClick={() => setActiveSubTab('texts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'texts'
                  ? 'bg-brand-primary text-brand-dark shadow'
                  : 'text-brand-dark-gray hover:text-brand-primary dark:text-brand-gray/80'
              }`}
            >
              <FileText size={14} />
              تعديل نصوص الموقع
            </button>
            <button
              onClick={() => setActiveSubTab('services')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'services'
                  ? 'bg-brand-primary text-brand-dark shadow'
                  : 'text-brand-dark-gray hover:text-brand-primary dark:text-brand-gray/80'
              }`}
            >
              <Layers size={14} />
              الخدمات والأسعار
            </button>
            <button
              onClick={() => setActiveSubTab('portfolio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'portfolio'
                  ? 'bg-brand-primary text-brand-dark shadow'
                  : 'text-brand-dark-gray hover:text-brand-primary dark:text-brand-gray/80'
              }`}
            >
              <Palette size={14} />
              إدارة معرض الأعمال
            </button>
            <button
              onClick={() => setActiveSubTab('financials')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'financials'
                  ? 'bg-brand-primary text-brand-dark shadow'
                  : 'text-brand-dark-gray hover:text-brand-primary dark:text-brand-gray/80'
              }`}
            >
              <DollarSign size={14} />
              النظام المالي والمحاسبي
            </button>
            <button
              onClick={() => setActiveSubTab('backup')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'backup'
                  ? 'bg-brand-primary text-brand-dark shadow'
                  : 'text-brand-dark-gray hover:text-brand-primary dark:text-brand-gray/80'
              }`}
            >
              <RefreshCw size={14} className={activeSubTab === 'backup' ? "animate-spin" : ""} />
              النسخ الاحتياطي وقاعدة البيانات
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------
            SUB-TAB: PROJECTS (طلبات المشاريع الحالية)
            ---------------------------------------------------- */}
        {activeSubTab === 'projects' && (
          <div className="space-y-10">
            {/* Stats Bento Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="glass-panel p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-md space-y-2">
                <span className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 font-bold uppercase tracking-widest">موازنة المشاريع النشطة</span>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xl font-bold text-brand-dark dark:text-white">~ {totalBudgetVolume.toLocaleString('ar-SA')} ر.س</span>
                  <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <DollarSign size={16} />
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-md space-y-2">
                <span className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 font-bold uppercase tracking-widest">مشاريع قيد الإنجاز</span>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xl font-bold text-brand-dark dark:text-white">{activeProjectsCount} مشروع نشط</span>
                  <div className="p-2.5 bg-alert-warning/10 rounded-xl text-alert-warning">
                    <Activity size={16} />
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-md space-y-2">
                <span className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 font-bold uppercase tracking-widest">مشاريع تم تسليمها</span>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xl font-bold text-brand-dark dark:text-white">{completedProjectsCount} مكتمل</span>
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-md space-y-2">
                <span className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 font-bold uppercase tracking-widest">إجمالي المراسلات والملفات</span>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xl font-bold text-brand-dark dark:text-white">{totalFilesUploaded + totalClientNotes} إخطار إجمالي</span>
                  <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500">
                    <Files size={16} />
                  </div>
                </div>
              </div>

            </div>

            {/* Master Project Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Project selection list */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-sm font-bold text-brand-dark dark:text-white border-b border-brand-gray/20 pb-2">جميع المشاريع في المنصة ({projects.length})</h3>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar pr-1">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => handleSelectProject(proj)}
                      className={`p-4 rounded-xl border text-right cursor-pointer transition-all ${
                        selectedProject?.id === proj.id
                          ? 'bg-brand-primary/10 border-brand-primary shadow'
                          : 'bg-white dark:bg-brand-dark border-brand-gray/20 dark:border-brand-dark-gray/50 hover:bg-brand-light/40 dark:hover:bg-brand-dark-gray/20'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-brand-dark-gray/60 dark:text-brand-gray/40">{proj.code}</span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                          proj.status === 'delivered' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-brand-primary/15 text-brand-primary'
                        }`}>
                          {getStatusLabel(proj.status)}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-brand-dark dark:text-white mt-2 line-clamp-1">{proj.name}</h4>
                      
                      <div className="flex justify-between items-center text-[10px] text-brand-dark-gray/50 dark:text-brand-gray/40 mt-3 pt-2 border-t border-brand-gray/10">
                        <span>العميل: {proj.clientName}</span>
                        <span className="font-bold text-brand-primary">{proj.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Management Panel */}
              <div className="lg:col-span-8">
                {selectedProject ? (
                  <div className="space-y-8">
                    
                    {/* Project Brief inside editor */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 space-y-4">
                      <div className="flex justify-between items-center border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-3">
                        <div>
                          <h3 className="text-lg font-bold text-brand-dark dark:text-white">{selectedProject.name}</h3>
                          <p className="text-xs text-brand-dark-gray/60 dark:text-brand-gray/40">العميل: {selectedProject.clientName} | {selectedProject.company}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من رغبتك في حذف هذا المشروع بالكامل؟')) {
                              onDeleteProject(selectedProject.id);
                              setSelectedProject(null);
                            }
                          }}
                          className="p-2 text-alert-error hover:bg-alert-error/10 rounded-xl transition-colors"
                          title="حذف المشروع"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Project Specifications */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                        <div className="bg-brand-light/40 dark:bg-brand-dark-gray/20 p-2.5 rounded-xl">
                          <span className="text-brand-dark-gray/50 dark:text-brand-gray/40">الميزانية</span>
                          <p className="font-bold text-brand-dark dark:text-white mt-0.5">{selectedProject.budget}</p>
                        </div>
                        <div className="bg-brand-light/40 dark:bg-brand-dark-gray/20 p-2.5 rounded-xl">
                          <span className="text-brand-dark-gray/50 dark:text-brand-gray/40">البريد الإلكتروني</span>
                          <p className="font-bold text-brand-dark dark:text-white mt-0.5 truncate">{selectedProject.email}</p>
                        </div>
                        <div className="bg-brand-light/40 dark:bg-brand-dark-gray/20 p-2.5 rounded-xl">
                          <span className="text-brand-dark-gray/50 dark:text-brand-gray/40">رقم الهاتف</span>
                          <p className="font-bold text-brand-dark dark:text-white mt-0.5 font-mono">{selectedProject.phone}</p>
                        </div>
                        <div className="bg-brand-light/40 dark:bg-brand-dark-gray/20 p-2.5 rounded-xl">
                          <span className="text-brand-dark-gray/50 dark:text-brand-gray/40">موعد التسليم</span>
                          <p className="font-bold text-brand-dark dark:text-white mt-0.5">{selectedProject.deliveryDate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status and Progress Changer Form */}
                    <form onSubmit={handleApplyChanges} className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 space-y-6">
                      <h4 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
                        <RefreshCw size={14} className="text-brand-primary" />
                        تحديث الحالة ونسبة التقدم
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        
                        {/* Status Select */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">حالة المشروع الإستراتيجية</label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                            className="w-full p-2.5 text-xs bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl"
                          >
                            <option value="received">استلام الطلب</option>
                            <option value="design">قيد التصميم</option>
                            <option value="review">مراجعة العميل</option>
                            <option value="modification">جاري التعديل</option>
                            <option value="delivered">تم التسليم النهائي</option>
                          </select>
                        </div>

                        {/* Progress slider */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">نسبة الإنجاز الفعلية</label>
                            <span className="text-[10px] font-bold text-brand-primary">{editProgress}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={editProgress}
                            onChange={(e) => setEditProgress(parseInt(e.target.value, 10))}
                            className="w-full accent-brand-primary h-2 bg-brand-gray dark:bg-brand-dark-gray rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Client Access Password */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">رمز مرور العميل</label>
                          <input
                            type="text"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="رمز الدخول"
                            className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs font-mono"
                          />
                        </div>

                      </div>

                      {/* Log update message */}
                      <div className="space-y-3 pt-2 border-t border-brand-gray/10 dark:border-brand-dark-gray/10">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">عنوان التحديث المضاف للجدول الزمني (اختياري)</label>
                          <input
                            type="text"
                            value={updateLogTitle}
                            onChange={(e) => setUpdateLogTitle(e.target.value)}
                            placeholder="مثال: انتهاء حزمة الشعارات المبدئية"
                            className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">محتوى شرح التحديث الفني</label>
                          <textarea
                            value={updateLogContent}
                            onChange={(e) => setUpdateLogContent(e.target.value)}
                            placeholder="تفاصيل التحديث التي يراها العميل بوضوح..."
                            rows={2}
                            className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-brand-primary text-brand-dark text-xs font-bold rounded-xl transition-all hover:bg-brand-secondary"
                      >
                        حفظ ومزامنة التحديثات الحالية للمشروع
                      </button>
                    </form>

                    {/* Chat replies / Interactive communication */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Interactive messaging */}
                      <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 flex flex-col justify-between h-[340px]">
                        <h4 className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-2 mb-3">
                          <MessageSquare size={13} className="text-brand-primary" />
                          قناة المراسلة المباشرة مع العميل
                        </h4>

                        {/* Message list */}
                        <div className="flex-grow overflow-y-auto space-y-3 mb-4 scrollbar pr-1">
                          {selectedProject.notes.length === 0 ? (
                            <div className="text-center py-10 text-brand-dark-gray/40 text-[10px]">لا توجد مراسلات سابقة مع العميل.</div>
                          ) : (
                            selectedProject.notes.map((note) => (
                              <div
                                key={note.id}
                                className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                                  note.sender === 'admin'
                                    ? 'bg-brand-primary/10 mr-auto text-right text-brand-dark dark:text-white border border-brand-primary/10'
                                    : 'bg-brand-light/60 dark:bg-brand-dark-gray/20 ml-auto text-right text-brand-dark dark:text-white'
                                }`}
                              >
                                <p className="leading-relaxed text-justify">{note.text}</p>
                                <span className="block text-[8px] text-brand-dark-gray/40 dark:text-brand-gray/30 text-left mt-1">{note.date}</span>
                              </div>
                            ))
                          )}
                        </div>

                        <form onSubmit={handleSendAdminReply} className="flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="اكتب ردك المباشر للعميل هنا..."
                            className="flex-grow p-2.5 text-xs bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark rounded-xl font-bold text-xs"
                          >
                            إرسال
                          </button>
                        </form>
                      </div>

                      {/* Final file delivery manager */}
                      <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 flex flex-col justify-between h-[340px]">
                        <div>
                          <h4 className="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-2 mb-3">
                            <Files size={13} className="text-brand-primary" />
                            حزمة التسليم والملفات النهائية المفتوحة
                          </h4>

                          {/* Existing final files */}
                          <div className="space-y-2 max-h-[150px] overflow-y-auto mb-3 scrollbar">
                            {(!selectedProject.finalFiles || selectedProject.finalFiles.length === 0) ? (
                              <div className="text-center py-6 text-brand-dark-gray/40 text-[10px]">لا توجد ملفات تسليم نهائي مرفوعة بعد.</div>
                            ) : (
                              selectedProject.finalFiles.map((f) => (
                                <div key={f.id} className="flex justify-between items-center p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px]">
                                  <div className="text-right">
                                    <p className="font-bold text-brand-dark dark:text-white truncate max-w-[200px]">{f.name}</p>
                                    <span className="text-[8px] text-brand-dark-gray/50">{f.description}</span>
                                  </div>
                                  <span className="bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-md font-mono">{f.type}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Form to add final file */}
                        <form onSubmit={handleAddFinalFile} className="space-y-2.5 border-t border-brand-gray/10 pt-3">
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              required
                              value={finalFileName}
                              onChange={(e) => setFinalFileName(e.target.value)}
                              placeholder="اسم الملف (لوجو مفتوح..)"
                              className="col-span-2 p-2 text-xs bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg"
                            />
                            <select
                              value={finalFileType}
                              onChange={(e) => setFinalFileType(e.target.value)}
                              className="p-2 text-xs bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg font-mono"
                            >
                              <option value="AI">AI</option>
                              <option value="PDF">PDF</option>
                              <option value="PSD">PSD</option>
                              <option value="ZIP">ZIP</option>
                              <option value="SVG">SVG</option>
                              <option value="PNG">PNG</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={finalFileDesc}
                              onChange={(e) => setFinalFileDesc(e.target.value)}
                              placeholder="وصف إضافي للملف الفني النهائي..."
                              className="flex-grow p-2 text-[10px] bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg font-bold text-xs hover:bg-emerald-600 shrink-0"
                            >
                              إضافة وتسليم
                            </button>
                          </div>
                        </form>
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="glass-panel p-16 rounded-3xl border border-white/40 dark:border-white/5 text-center text-brand-dark-gray/60 dark:text-brand-gray/50 space-y-4">
                    <User size={32} className="mx-auto text-brand-primary" />
                    <h3 className="font-bold text-sm">حدد أحد المشاريع من القائمة الجانبية للبدء بمتابعته</h3>
                    <p className="text-[10px] max-w-md mx-auto">تتيح لك اللوحة المزامنة الفورية لنسبة الإنجاز، وإرسال الرسائل الحصرية، وإرفاق الملفات النهائية للتحميل بضمان الاستقرار الفني الكامل.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            SUB-TAB: TEXTS (تعديل نصوص الموقع بالكامل)
            ---------------------------------------------------- */}
        {activeSubTab === 'texts' && (
          <form onSubmit={handleSaveAllSiteTexts} className="space-y-8">
            
            {/* Website Logo & Identity Settings */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-primary/10 space-y-6">
              <h3 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2 pb-3 border-b border-brand-gray/10">
                <Palette size={16} className="text-brand-primary" />
                إعدادات وصورة شعار الموقع (Website Logo & Branding)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                <div className="space-y-3 text-right">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">رابط صورة شعار الموقع (Logo Image URL)</label>
                    <input
                      type="text"
                      value={localTexts.logoUrl || ''}
                      onChange={(e) => handleUpdateSiteTextProp('logoUrl', e.target.value)}
                      placeholder="ضع رابط الصورة هنا (مثال: رابط Unsplash أو رابط مباشر)"
                      className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs text-left"
                      dir="ltr"
                    />
                  </div>

                  {/* Direct File Uploader for Logo from Device */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">أو ارفع ملف الشعار مباشرة من جهازك (Direct Upload)</label>
                    <div 
                      onClick={() => logoInputRef.current?.click()}
                      className="border border-dashed border-brand-gray/40 dark:border-brand-dark-gray/60 hover:border-brand-primary rounded-xl p-3 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 bg-brand-light/20 dark:bg-brand-dark-gray/10 group"
                    >
                      <Upload size={14} className="text-brand-dark-gray dark:text-brand-gray/60 group-hover:text-brand-primary transition-colors" />
                      <span className="text-[11px] font-bold text-brand-dark-gray dark:text-brand-gray/80 group-hover:text-brand-primary transition-colors">
                        اضغط هنا لتحديد صورة الشعار من جهازك
                      </span>
                      <input 
                        type="file"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  <p className="text-[9px] text-brand-dark-gray/60 dark:text-brand-gray/40">
                    * اتركه فارغاً لاستخدام شعار عين الإعصار اللانهائي (SVG) الافتراضي الفاخر.
                  </p>
                </div>
                
                <div className="space-y-1.5 text-right">
                  <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">اسم الموقع / الشعار النصي (Brand Text)</label>
                  <input
                    type="text"
                    value={localTexts.logoText || ''}
                    onChange={(e) => handleUpdateSiteTextProp('logoText', e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs font-bold"
                  />
                  <p className="text-[9px] text-brand-dark-gray/60 dark:text-brand-gray/40">
                    * النص الرئيسي الذي يظهر بجوار أيقونة الشعار (الافتراضي: إلهامك).
                  </p>
                </div>

                {/* Live Preview of logo in admin dashboard */}
                <div className="col-span-1 md:col-span-2 p-4 bg-brand-light/30 dark:bg-brand-dark-gray/10 rounded-2xl flex items-center justify-between" dir="rtl">
                  <span className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">معاينة الشعار الحية:</span>
                  <div className="flex items-center gap-3 py-1 px-4 bg-white/50 dark:bg-brand-dark/50 border border-brand-gray/20 rounded-xl">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      {localTexts.logoUrl ? (
                        <img
                          src={localTexts.logoUrl}
                          alt={localTexts.logoText || 'إلهامك'}
                          className="w-8 h-8 object-contain rounded"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <svg viewBox="0 0 100 100" className="w-7 h-7 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round">
                          <path d="M20,50 C20,30 40,20 60,30 C80,40 80,70 55,75 C35,78 25,65 25,50 C25,35 45,25 75,45" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-bold text-brand-dark dark:text-white">
                      {localTexts.logoText || 'إلهامك'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Section Texts */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-primary/10 space-y-6">
              <h3 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2 pb-3 border-b border-brand-gray/10">
                <Sparkles size={16} className="text-brand-primary" />
                تعديل القسم الرئيسي (Hero Section)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">شارة القسم العلوي (Tag)</label>
                  <input
                    type="text"
                    value={localTexts.heroTag || ''}
                    onChange={(e) => handleUpdateSiteTextProp('heroTag', e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">عنوان البداية (Title Start)</label>
                  <input
                    type="text"
                    value={localTexts.heroTitle || ''}
                    onChange={(e) => handleUpdateSiteTextProp('heroTitle', e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">الكلمة الملونة البارزة (Highlighted Word)</label>
                  <input
                    type="text"
                    value={localTexts.heroTitleHighlighted || ''}
                    onChange={(e) => handleUpdateSiteTextProp('heroTitleHighlighted', e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs font-bold text-brand-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">تكملة العنوان الرئيسي (Title Rest)</label>
                  <input
                    type="text"
                    value={localTexts.heroTitleRest || ''}
                    onChange={(e) => handleUpdateSiteTextProp('heroTitleRest', e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">نبذة الشرح المرافقة بالرئيسية (Description)</label>
                  <textarea
                    value={localTexts.heroDesc || ''}
                    onChange={(e) => handleUpdateSiteTextProp('heroDesc', e.target.value)}
                    rows={2}
                    className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">زر إطلاق المشاريع (Primary CTA Button)</label>
                  <input
                    type="text"
                    value={localTexts.heroCtaPrimary || ''}
                    onChange={(e) => handleUpdateSiteTextProp('heroCtaPrimary', e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">زر بوابة العميل (Secondary CTA Button)</label>
                  <input
                    type="text"
                    value={localTexts.heroCtaSecondary || ''}
                    onChange={(e) => handleUpdateSiteTextProp('heroCtaSecondary', e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Hero Interactive Mockup Settings */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-primary/10 space-y-6">
              <h3 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2 pb-3 border-b border-brand-gray/10">
                <Palette size={16} className="text-brand-primary" />
                تعديل ومزامنة اللوحة التفاعلية للقسم الرئيسي (Hero Interactive Mockup)
              </h3>
              
              <div className="space-y-4">
                {/* Use Real Data Sync Switch */}
                <div className="flex items-center justify-between p-3 bg-brand-light/40 dark:bg-brand-dark-gray/20 rounded-xl border border-brand-gray/15">
                  <div className="text-right">
                    <span className="text-xs font-bold text-brand-dark dark:text-white block">المزامنة التلقائية مع قاعدة البيانات 🔗</span>
                    <span className="text-[10px] text-brand-dark-gray/70 dark:text-brand-gray/50">عند التفعيل، سيتم عرض اسم المشروع الفعلي ونسبة الإنجاز والملفات من آخر طلب نشط تلقائياً بالصفحة الرئيسية.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localTexts.heroMockupUseRealData !== false}
                    onChange={(e) => handleUpdateSiteTextProp('heroMockupUseRealData', e.target.checked)}
                    className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-primary focus:ring-2 accent-brand-primary cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">التقييم العائم (مثال: 5.0/5.0 الماسي)</label>
                    <input
                      type="text"
                      value={localTexts.heroMockupRatingText || ''}
                      onChange={(e) => handleUpdateSiteTextProp('heroMockupRatingText', e.target.value)}
                      placeholder="5.0/5.0 الماسي"
                      className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">عداد النشاط الإبداعي (مثال: +40 مشروع متميز)</label>
                    <input
                      type="text"
                      value={localTexts.heroMockupProjectsCount || ''}
                      onChange={(e) => handleUpdateSiteTextProp('heroMockupProjectsCount', e.target.value)}
                      placeholder="+40 مشروع متميز"
                      className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {localTexts.heroMockupUseRealData === false && (
                  <div className="p-4 bg-brand-light/20 dark:bg-brand-dark-gray/10 rounded-2xl border border-brand-gray/10 space-y-4 animate-fadeIn">
                    <h4 className="text-xs font-bold text-brand-primary">تخصيص نصوص اللوحة يدوياً:</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">اسم المشروع الوهمي باللوحة</label>
                        <input
                          type="text"
                          value={localTexts.heroMockupProjectName || ''}
                          onChange={(e) => handleUpdateSiteTextProp('heroMockupProjectName', e.target.value)}
                          placeholder="مشروع: هوية أصيل المتميزة"
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">حالة المشروع (مثال: قيد المراجعة)</label>
                        <input
                          type="text"
                          value={localTexts.heroMockupStatus || ''}
                          onChange={(e) => handleUpdateSiteTextProp('heroMockupStatus', e.target.value)}
                          placeholder="قيد المراجعة"
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">نسبة الإنجاز % (مثال: 75)</label>
                        <input
                          type="text"
                          value={localTexts.heroMockupProgress || ''}
                          onChange={(e) => handleUpdateSiteTextProp('heroMockupProgress', e.target.value)}
                          placeholder="75"
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">عنوان الخطوة الأولى بالجدول</label>
                        <input
                          type="text"
                          value={localTexts.heroMockupStep1Title || ''}
                          onChange={(e) => handleUpdateSiteTextProp('heroMockupStep1Title', e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">وصف الخطوة الأولى</label>
                        <input
                          type="text"
                          value={localTexts.heroMockupStep1Desc || ''}
                          onChange={(e) => handleUpdateSiteTextProp('heroMockupStep1Desc', e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">عنوان الخطوة الثانية</label>
                        <input
                          type="text"
                          value={localTexts.heroMockupStep2Title || ''}
                          onChange={(e) => handleUpdateSiteTextProp('heroMockupStep2Title', e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">وصف الخطوة الثانية</label>
                        <input
                          type="text"
                          value={localTexts.heroMockupStep2Desc || ''}
                          onChange={(e) => handleUpdateSiteTextProp('heroMockupStep2Desc', e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">اسم الملف المرفق للتنزيل</label>
                        <input
                          type="text"
                          value={localTexts.heroMockupFileName || ''}
                          onChange={(e) => handleUpdateSiteTextProp('heroMockupFileName', e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">حجم الملف</label>
                        <input
                          type="text"
                          value={localTexts.heroMockupFileSize || ''}
                          onChange={(e) => handleUpdateSiteTextProp('heroMockupFileSize', e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Why Us Section Texts */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-primary/10 space-y-6">
              <h3 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2 pb-3 border-b border-brand-gray/10">
                <FileText size={16} className="text-brand-primary" />
                تعديل قسم التميز والنهج الخاص (Why Us)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">شارة القسم (Section Tag)</label>
                  <input
                    type="text"
                    value={localTexts.whyUsTag || ''}
                    onChange={(e) => handleUpdateSiteTextProp('whyUsTag', e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">العنوان الرئيسي للنهج</label>
                  <input
                    type="text"
                    value={localTexts.whyUsTitle || ''}
                    onChange={(e) => handleUpdateSiteTextProp('whyUsTitle', e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                  />
                </div>

                <div className="col-span-1 md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">وصف النهج العام</label>
                  <textarea
                    value={localTexts.whyUsDesc || ''}
                    onChange={(e) => handleUpdateSiteTextProp('whyUsDesc', e.target.value)}
                    rows={2}
                    className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                  />
                </div>

                {/* Cards */}
                <div className="p-4 bg-brand-light/30 dark:bg-brand-dark-gray/20 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-brand-primary border-b border-brand-gray/10 pb-1">ميزة 1</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={localTexts.whyUsCard1Title || ''}
                      onChange={(e) => handleUpdateSiteTextProp('whyUsCard1Title', e.target.value)}
                      placeholder="عنوان الميزة الأولى"
                      className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs font-bold"
                    />
                    <textarea
                      value={localTexts.whyUsCard1Desc || ''}
                      onChange={(e) => handleUpdateSiteTextProp('whyUsCard1Desc', e.target.value)}
                      placeholder="شرح الميزة..."
                      rows={3}
                      className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-[10px]"
                    />
                  </div>
                </div>

                <div className="p-4 bg-brand-light/30 dark:bg-brand-dark-gray/20 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-brand-primary border-b border-brand-gray/10 pb-1">ميزة 2</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={localTexts.whyUsCard2Title || ''}
                      onChange={(e) => handleUpdateSiteTextProp('whyUsCard2Title', e.target.value)}
                      placeholder="عنوان الميزة الثانية"
                      className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs font-bold"
                    />
                    <textarea
                      value={localTexts.whyUsCard2Desc || ''}
                      onChange={(e) => handleUpdateSiteTextProp('whyUsCard2Desc', e.target.value)}
                      placeholder="شرح الميزة..."
                      rows={3}
                      className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-[10px]"
                    />
                  </div>
                </div>

                <div className="p-4 bg-brand-light/30 dark:bg-brand-dark-gray/20 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-brand-primary border-b border-brand-gray/10 pb-1">ميزة 3</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={localTexts.whyUsCard3Title || ''}
                      onChange={(e) => handleUpdateSiteTextProp('whyUsCard3Title', e.target.value)}
                      placeholder="عنوان الميزة الثالثة"
                      className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs font-bold"
                    />
                    <textarea
                      value={localTexts.whyUsCard3Desc || ''}
                      onChange={(e) => handleUpdateSiteTextProp('whyUsCard3Desc', e.target.value)}
                      placeholder="شرح الميزة..."
                      rows={3}
                      className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-[10px]"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* FAQ and CTA */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-primary/10 space-y-6">
              <h3 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2 pb-3 border-b border-brand-gray/10">
                <FileText size={16} className="text-brand-primary" />
                الأسئلة الشائعة وعناصر حجز الاستشارة السفلي (FAQ & CTA)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FAQs */}
                <div className="space-y-4 p-4 bg-brand-light/30 dark:bg-brand-dark-gray/10 rounded-2xl col-span-1 md:col-span-2">
                  <h4 className="text-xs font-bold text-brand-primary">الأسئلة الشائعة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-brand-dark-gray">عنوان القسم (FAQ Title)</label>
                      <input
                        type="text"
                        value={localTexts.faqTitle || ''}
                        onChange={(e) => handleUpdateSiteTextProp('faqTitle', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/20 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[9px] text-brand-dark-gray">شرح بسيط لقسم الأسئلة (FAQ Desc)</label>
                      <input
                        type="text"
                        value={localTexts.faqDesc || ''}
                        onChange={(e) => handleUpdateSiteTextProp('faqDesc', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/20 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-3 border-t border-brand-gray/10">
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={localTexts.faqQ1 || ''}
                        onChange={(e) => handleUpdateSiteTextProp('faqQ1', e.target.value)}
                        placeholder="السؤال الأول"
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/20 rounded-lg text-xs font-bold"
                      />
                      <textarea
                        value={localTexts.faqA1 || ''}
                        onChange={(e) => handleUpdateSiteTextProp('faqA1', e.target.value)}
                        placeholder="الإجابة..."
                        rows={2}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/20 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={localTexts.faqQ2 || ''}
                        onChange={(e) => handleUpdateSiteTextProp('faqQ2', e.target.value)}
                        placeholder="السؤال الثاني"
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/20 rounded-lg text-xs font-bold"
                      />
                      <textarea
                        value={localTexts.faqA2 || ''}
                        onChange={(e) => handleUpdateSiteTextProp('faqA2', e.target.value)}
                        placeholder="الإجابة..."
                        rows={2}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/20 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={localTexts.faqQ3 || ''}
                        onChange={(e) => handleUpdateSiteTextProp('faqQ3', e.target.value)}
                        placeholder="السؤال الثالث"
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/20 rounded-lg text-xs font-bold"
                      />
                      <textarea
                        value={localTexts.faqA3 || ''}
                        onChange={(e) => handleUpdateSiteTextProp('faqA3', e.target.value)}
                        placeholder="الإجابة..."
                        rows={2}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/20 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* CTA Box */}
                <div className="space-y-3 p-4 bg-brand-light/30 dark:bg-brand-dark-gray/10 rounded-2xl col-span-1 md:col-span-2">
                  <h4 className="text-xs font-bold text-brand-primary">البانر التحفيزي السفلي (CTA Banner)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-brand-dark-gray">العنوان الرئيسي للبانر</label>
                      <input
                        type="text"
                        value={localTexts.ctaTitle || ''}
                        onChange={(e) => handleUpdateSiteTextProp('ctaTitle', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/20 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-brand-dark-gray">اسم زر الإجراء بالبانر (CTA Button text)</label>
                      <input
                        type="text"
                        value={localTexts.ctaButton || ''}
                        onChange={(e) => handleUpdateSiteTextProp('ctaButton', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/20 rounded-lg text-xs font-bold text-brand-primary"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                      <label className="text-[9px] text-brand-dark-gray">شرح البانر ومحتواه</label>
                      <textarea
                        value={localTexts.ctaDesc || ''}
                        onChange={(e) => handleUpdateSiteTextProp('ctaDesc', e.target.value)}
                        rows={2}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/20 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Custom Sections Titles & Headings */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-primary/10 space-y-6">
              <h3 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2 pb-3 border-b border-brand-gray/10">
                <FileText size={16} className="text-brand-primary" />
                تعديل عناوين وشارات باقي الأقسام (Services, Portfolio & Requests)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Services Section titles */}
                <div className="p-4 bg-brand-light/30 dark:bg-brand-dark-gray/20 rounded-2xl space-y-3 col-span-1 md:col-span-3">
                  <h4 className="text-xs font-bold text-brand-primary border-b border-brand-gray/10 pb-1">قسم الخدمات والأسعار</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">شارة القسم (Services Tag)</label>
                      <input
                        type="text"
                        value={localTexts.servicesTag || ''}
                        onChange={(e) => handleUpdateSiteTextProp('servicesTag', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">العنوان الرئيسي (Services Title)</label>
                      <input
                        type="text"
                        value={localTexts.servicesTitle || ''}
                        onChange={(e) => handleUpdateSiteTextProp('servicesTitle', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">الوصف التفصيلي (Services Desc)</label>
                      <textarea
                        value={localTexts.servicesDesc || ''}
                        onChange={(e) => handleUpdateSiteTextProp('servicesDesc', e.target.value)}
                        rows={2}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Portfolio Section titles */}
                <div className="p-4 bg-brand-light/30 dark:bg-brand-dark-gray/20 rounded-2xl space-y-3 col-span-1 md:col-span-3">
                  <h4 className="text-xs font-bold text-brand-primary border-b border-brand-gray/10 pb-1">قسم معرض الأعمال</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">شارة القسم (Portfolio Tag)</label>
                      <input
                        type="text"
                        value={localTexts.portfolioTag || ''}
                        onChange={(e) => handleUpdateSiteTextProp('portfolioTag', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">العنوان الرئيسي (Portfolio Title)</label>
                      <input
                        type="text"
                        value={localTexts.portfolioTitle || ''}
                        onChange={(e) => handleUpdateSiteTextProp('portfolioTitle', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">الوصف التفصيلي (Portfolio Desc)</label>
                      <textarea
                        value={localTexts.portfolioDesc || ''}
                        onChange={(e) => handleUpdateSiteTextProp('portfolioDesc', e.target.value)}
                        rows={2}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Request Section titles */}
                <div className="p-4 bg-brand-light/30 dark:bg-brand-dark-gray/20 rounded-2xl space-y-3 col-span-1 md:col-span-3">
                  <h4 className="text-xs font-bold text-brand-primary border-b border-brand-gray/10 pb-1">قسم طلب مشروع جديد</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">شارة القسم (Request Tag)</label>
                      <input
                        type="text"
                        value={localTexts.requestTag || ''}
                        onChange={(e) => handleUpdateSiteTextProp('requestTag', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">العنوان الرئيسي (Request Title)</label>
                      <input
                        type="text"
                        value={localTexts.requestTitle || ''}
                        onChange={(e) => handleUpdateSiteTextProp('requestTitle', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">الوصف التفصيلي (Request Desc)</label>
                      <textarea
                        value={localTexts.requestDesc || ''}
                        onChange={(e) => handleUpdateSiteTextProp('requestDesc', e.target.value)}
                        rows={2}
                        className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Logos Header */}
                <div className="col-span-1 md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">عنوان قسم شعارات الشركاء (Logos Row Title)</label>
                  <input
                    type="text"
                    value={localTexts.heroLogosTitle || ''}
                    onChange={(e) => handleUpdateSiteTextProp('heroLogosTitle', e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                  />
                </div>

              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-bold rounded-2xl text-sm shadow-lg shadow-brand-primary/20 glow-primary"
            >
              حفظ وتطبيق جميع النصوص المعدلة على الموقع فوراً
            </button>
          </form>
        )}

        {/* ----------------------------------------------------
            SUB-TAB: SERVICES (إدارة الخدمات والأسعار وتحديث الصور)
            ---------------------------------------------------- */}
        {activeSubTab === 'services' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* List of Services */}
              <div className="md:col-span-1 space-y-4">
                <div className="flex justify-between items-center border-b border-brand-gray/20 pb-2">
                  <h3 className="text-sm font-bold text-brand-dark dark:text-white">الخدمات المتوفرة بالموقع ({services.length})</h3>
                  <button
                    type="button"
                    onClick={handleAddNewServiceClick}
                    className="py-1 px-3 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-lg hover:bg-brand-primary/20 transition-all"
                  >
                    + إضافة خدمة جديدة
                  </button>
                </div>
                <div className="space-y-3">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => handleEditServiceClick(srv)}
                      className={`p-4 rounded-xl border text-right cursor-pointer transition-all ${
                        selectedService?.id === srv.id
                          ? 'bg-brand-primary/10 border-brand-primary shadow'
                          : 'bg-white dark:bg-brand-dark border-brand-gray/20 dark:border-brand-dark-gray/50 hover:bg-brand-light/40 dark:hover:bg-brand-dark-gray/20'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-brand-dark dark:text-white">{srv.title}</h4>
                      <p className="text-[10px] text-brand-primary font-bold mt-1">الاستثمار: {srv.priceRange}</p>
                      {srv.image && (
                        <div className="mt-2 w-full h-12 rounded-lg overflow-hidden border border-brand-primary/10">
                          <img src={srv.image} alt={srv.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Edit Form */}
              <div className="md:col-span-2">
                {selectedService ? (
                  <form onSubmit={handleSaveService} className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 space-y-6">
                    <div className="border-b border-brand-gray/20 pb-3 flex justify-between items-center">
                      <h4 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
                        <Edit size={14} className="text-brand-primary" />
                        {services.some(s => s.id === selectedService.id) ? `تعديل أسعار وبيانات خدمة: ${selectedService.title}` : 'إضافة خدمة جديدة للموقع'}
                      </h4>
                      <span className="text-[10px] font-mono text-brand-dark-gray/50">ID: {selectedService.id}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">عنوان الخدمة الفنية</label>
                        <input
                          type="text"
                          required
                          value={srvTitle}
                          onChange={(e) => setSrvTitle(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">مستوى الاستثمار (السعر / النطاق)</label>
                        <input
                          type="text"
                          required
                          value={srvPrice}
                          onChange={(e) => setSrvPrice(e.target.value)}
                          placeholder="مثال: يبدأ من 3,500 ر.س"
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs text-brand-primary font-bold"
                        />
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">وصف شرح الخدمة</label>
                        <textarea
                          required
                          value={srvDesc}
                          onChange={(e) => setSrvDesc(e.target.value)}
                          rows={3}
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs leading-relaxed"
                        />
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">رابط صورة الخدمة التعريفية (URL)</label>
                        <input
                          type="text"
                          value={srvImage}
                          onChange={(e) => setSrvImage(e.target.value)}
                          placeholder="أدخل رابط صورة مباشر (Unsplash أو غيره)"
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs font-mono"
                        />
                        {srvImage && (
                          <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-brand-primary/20">
                            <img src={srvImage} alt="معاينة الصورة" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">مميزات الخدمة الأساسية (سطر واحد لكل ميزة)</label>
                        <textarea
                          value={srvFeaturesStr}
                          onChange={(e) => setSrvFeaturesStr(e.target.value)}
                          rows={4}
                          placeholder="تطوير 3 مفاهيم شعار&#10;تصميم دليل الهوية البصرية الشامل&#10;تسليم الملفات المصدرية المفتوحة"
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-grow py-3 bg-brand-primary text-brand-dark font-bold text-xs rounded-xl hover:bg-brand-secondary transition-all"
                      >
                        {services.some(s => s.id === selectedService.id) ? 'حفظ التعديلات وتحديث سعر وصورة الخدمة' : 'إضافة الخدمة الجديدة للموقع'}
                      </button>
                      {services.some(s => s.id === selectedService.id) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteService(selectedService.id)}
                          className="px-4 py-3 bg-alert-error/10 hover:bg-alert-error/20 text-alert-error font-bold text-xs rounded-xl transition-all"
                        >
                          حذف
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedService(null)}
                        className="px-6 py-3 bg-brand-gray/20 text-brand-dark dark:text-white font-bold text-xs rounded-xl hover:bg-brand-gray/30 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="glass-panel p-16 rounded-3xl border border-white/40 dark:border-white/5 text-center text-brand-dark-gray/60 dark:text-brand-gray/50 space-y-4">
                    <Layers size={32} className="mx-auto text-brand-primary" />
                    <h3 className="font-bold text-sm">حدد أحد الخدمات من القائمة الجانبية للتعديل</h3>
                    <p className="text-[10px] max-w-md mx-auto">تتيح لك اللوحة تعديل مستوى الاستثمار (الأسعار)، وصورة الغلاف الخاصة بكل خدمة، وتحديث كافة المزايا والخصائص المرفقة بها مباشرة.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            SUB-TAB: PORTFOLIO (إدارة معرض الأعمال - إضافة وتعديل وحذف)
            ---------------------------------------------------- */}
        {activeSubTab === 'portfolio' && (
          <div className="space-y-8">
            
            {/* Top Toolbar */}
            <div className="flex justify-between items-center bg-brand-light/30 dark:bg-brand-dark-gray/10 p-4 rounded-2xl border border-brand-gray/20">
              <span className="text-xs font-bold text-brand-dark dark:text-white">إجمالي مشاريع معرض الأعمال الفنية: ({caseStudies.length})</span>
              <button
                onClick={handleAddNewCaseClick}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark text-xs font-bold rounded-xl transition-all flex items-center gap-2 glow-primary"
              >
                <Plus size={14} />
                إضافة مشروع جديد لمعرض الأعمال
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Case studies list */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-sm font-bold text-brand-dark dark:text-white border-b border-brand-gray/20 pb-2">قائمة مشاريع المعرض</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar">
                  {caseStudies.map((study) => (
                    <div
                      key={study.id}
                      onClick={() => handleEditCaseClick(study)}
                      className={`p-3.5 rounded-xl border text-right cursor-pointer transition-all ${
                        editingCase?.id === study.id && !isAddingNewCase
                          ? 'bg-brand-primary/10 border-brand-primary shadow'
                          : 'bg-white dark:bg-brand-dark border-brand-gray/20 dark:border-brand-dark-gray/50 hover:bg-brand-light/40 dark:hover:bg-brand-dark-gray/20'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="text-right">
                          <h4 className="text-xs font-bold text-brand-dark dark:text-white line-clamp-1">{study.title}</h4>
                          <span className="text-[9px] text-brand-dark-gray/50 dark:text-brand-gray/40">العميل: {study.clientName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCaseStudy(study.id);
                          }}
                          className="p-1.5 text-alert-error hover:bg-alert-error/10 rounded-lg transition-colors shrink-0"
                          title="حذف المشروع"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      
                      {study.coverImage && (
                        <div className="mt-2.5 w-full h-20 rounded-lg overflow-hidden border border-brand-primary/5">
                          <img src={study.coverImage} alt={study.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add / Edit Case Form */}
              <div className="lg:col-span-8">
                {(editingCase || isAddingNewCase) ? (
                  <form onSubmit={handleSaveCaseStudy} className="glass-panel p-6 rounded-3xl border border-brand-primary/20 space-y-6">
                    <div className="border-b border-brand-gray/20 pb-3 flex justify-between items-center">
                      <h4 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
                        {isAddingNewCase ? <Plus size={14} className="text-brand-primary" /> : <Edit size={14} className="text-brand-primary" />}
                        {isAddingNewCase ? 'إضافة مشروع جديد كلياً لمعرض الأعمال' : `تعديل تفاصيل المشروع: ${editingCase?.title}`}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCase(null);
                          setIsAddingNewCase(false);
                        }}
                        className="text-xs text-brand-dark-gray hover:text-brand-primary"
                      >
                        إغلاق
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">اسم المشروع الفني</label>
                        <input
                          type="text"
                          required
                          value={caseTitle}
                          onChange={(e) => setCaseTitle(e.target.value)}
                          placeholder="مثال: الهوية البصرية لشركة ركاز"
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">اسم العميل أو الجهة</label>
                        <input
                          type="text"
                          required
                          value={caseClient}
                          onChange={(e) => setCaseClient(e.target.value)}
                          placeholder="ركاز القابضة"
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">تصنيف المشروع الإبداعي</label>
                        <select
                          value={caseCategory}
                          onChange={(e) => setCaseCategory(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        >
                          <option value="identity">تصميم هوية بصرية</option>
                          <option value="packaging">تغليف متميز</option>
                          <option value="uiux">واجهات UI/UX</option>
                          <option value="development">تطوير برمجيات ومواقع</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">وسوم المشروع (مفصولة بفاصلة)</label>
                        <input
                          type="text"
                          value={caseTagsStr}
                          onChange={(e) => setCaseTagsStr(e.target.value)}
                          placeholder="مثال: هويات فخمة, تصميم تغليف, مينيمال"
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs"
                        />
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">صورة الغلاف الفنية للمشروع (Cover Image)</label>
                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                          <input
                            type="text"
                            required
                            value={caseCover}
                            onChange={(e) => setCaseCover(e.target.value)}
                            placeholder="أدخل رابط صورة غلاف مباشر (أو ارفع صورة من الجهاز بالجانب)"
                            className="flex-grow w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs font-mono"
                          />
                          <label className="shrink-0 w-full sm:w-auto cursor-pointer flex items-center justify-center gap-1 px-4 py-2.5 bg-brand-primary/10 border border-brand-primary/30 rounded-xl text-xs font-bold text-brand-primary hover:bg-brand-primary/20 transition-all">
                            <Upload size={14} />
                            <span>رفع غلاف</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {caseCover && (
                          <div className="mt-2 w-full h-36 rounded-xl overflow-hidden border border-brand-primary/20 relative group">
                            <img src={caseCover} alt="معاينة الغلاف" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Up to 3 Mockups Section */}
                      <div className="col-span-1 sm:col-span-2 border-t border-brand-gray/20 dark:border-brand-dark-gray/20 pt-4 mt-2 space-y-4">
                        <div className="flex items-center gap-2">
                          <Image size={16} className="text-brand-primary" />
                          <h4 className="text-xs font-bold text-brand-dark dark:text-white">تطبيقات وموك ابس المشروع (3 صور كحد أقصى)</h4>
                        </div>
                        <p className="text-[10px] text-brand-dark-gray/70 dark:text-brand-gray/50 -mt-2">يمكنك كتابة تسمية فريدة لكل صورة ورفعها مباشرة من جهازك أو لصق رابط خارجي.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {mockupImages.map((mockup, index) => (
                            <div key={index} className="bg-brand-light/30 dark:bg-brand-dark-gray/10 p-3 rounded-2xl border border-brand-gray/10 space-y-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-brand-dark-gray dark:text-brand-gray">عنوان الصورة {index + 1}</label>
                                <input
                                  type="text"
                                  value={mockup.title}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setMockupImages(prev => {
                                      const updated = [...prev];
                                      updated[index] = { ...updated[index], title: val };
                                      return updated;
                                    });
                                  }}
                                  placeholder={`مثال: تطبيق الهوية على العلب`}
                                  className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-xs"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-brand-dark-gray dark:text-brand-gray">رابط الصورة أو الرفع</label>
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={mockup.image}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setMockupImages(prev => {
                                        const updated = [...prev];
                                        updated[index] = { ...updated[index], image: val };
                                        return updated;
                                      });
                                    }}
                                    placeholder="رابط أو ارفع من جهازك"
                                    className="w-full p-2 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-lg text-[10px] font-mono"
                                  />
                                  <label className="cursor-pointer shrink-0 p-2 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-brand-primary hover:bg-brand-primary/20 transition-all flex items-center justify-center">
                                    <Upload size={13} />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleMockupImageUpload(index, e)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>

                              {mockup.image && (
                                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-brand-gray/20">
                                  <img src={mockup.image} alt={mockup.title} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMockupImages(prev => {
                                        const updated = [...prev];
                                        updated[index] = { ...updated[index], image: '' };
                                        return updated;
                                      });
                                      triggerToast(`✓ تم مسح الصورة ${index + 1}`);
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                                    title="حذف الصورة"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">تحديات المشروع (Challenges)</label>
                        <textarea
                          value={caseChallenges}
                          onChange={(e) => setCaseChallenges(e.target.value)}
                          rows={2}
                          placeholder="ما التحدي الإبداعي أو متطلبات العمل الأساسية؟"
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs leading-relaxed"
                        />
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray">الحلول الإبداعية المبتكرة (Solutions)</label>
                        <textarea
                          value={caseSolutions}
                          onChange={(e) => setCaseSolutions(e.target.value)}
                          rows={2.5}
                          placeholder="كيف تغلب الاستوديو على التحدي وصمم حلولاً فاخرة؟"
                          className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-xs leading-relaxed"
                        />
                      </div>

                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-grow py-3 bg-brand-primary text-brand-dark font-bold text-xs rounded-xl hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/10"
                      >
                        {isAddingNewCase ? 'إضافة المشروع فوراً لمعرض الأعمال' : 'حفظ ومزامنة تعديلات المشروع الحالية'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCase(null);
                          setIsAddingNewCase(false);
                        }}
                        className="px-6 py-3 bg-brand-gray/20 text-brand-dark dark:text-white font-bold text-xs rounded-xl hover:bg-brand-gray/30 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="glass-panel p-16 rounded-3xl border border-white/40 dark:border-white/5 text-center text-brand-dark-gray/60 dark:text-brand-gray/50 space-y-4">
                    <Palette size={32} className="mx-auto text-brand-primary" />
                    <h3 className="font-bold text-sm">حدد مشروعاً لتعديله أو انقر على زر الإضافة بالأعلى</h3>
                    <p className="text-[10px] max-w-md mx-auto">تتيح لك اللوحة التحكم التام بمعرض أعمالك الفنية؛ أضف مشاريع جديدة بصور رائعة، أو عدّل الأسماء، أو احذف الأعمال القديمة بسهولة متناهية لثبات واستقرار فائقين.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            SUB-TAB: FINANCIALS & ACCOUNTING (النظام المالي والمحاسبي والتقارير)
            ---------------------------------------------------- */}
        {activeSubTab === 'financials' && (
          <div className="space-y-8 text-right" dir="rtl">
            
            {/* Top Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Stat 1: Total Contracts Revenue */}
              <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-2xl p-5 border border-brand-gray/10 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-primary/10 rounded-full blur-xl -mr-4 -mt-4"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-brand-dark-gray/60 dark:text-brand-gray/40">قيمة العقود الإجمالية</span>
                  <div className="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center">
                    <Receipt size={14} />
                  </div>
                </div>
                <h4 className="text-lg font-black text-brand-dark dark:text-white font-mono">
                  {projects.filter(p => p.code !== 'SYS-FINANCIALS').reduce((acc, p) => acc + (p.totalPrice || 0), 0).toLocaleString()} <span className="text-[10px] font-bold">ر.س</span>
                </h4>
                <div className="text-[9px] text-brand-dark-gray/50 dark:text-brand-gray/30 mt-2">
                  إيرادات متوقعة من {projects.filter(p => p.code !== 'SYS-FINANCIALS').length} مشروع عميل نشط.
                </div>
              </div>

              {/* Stat 2: Total Collected */}
              <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-2xl p-5 border border-brand-gray/10 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#12C7C3]/10 rounded-full blur-xl -mr-4 -mt-4"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-[#12C7C3]">المبالغ المحصلة فعلياً</span>
                  <div className="w-8 h-8 bg-[#12C7C3]/10 text-[#12C7C3] rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={14} />
                  </div>
                </div>
                <h4 className="text-lg font-black text-[#12C7C3] font-mono">
                  {projects.filter(p => p.code !== 'SYS-FINANCIALS').reduce((acc, p) => acc + (p.paidAmount || 0), 0).toLocaleString()} <span className="text-[10px] font-bold">ر.س</span>
                </h4>
                <div className="text-[9px] text-brand-dark-gray/50 dark:text-brand-gray/30 mt-2">
                  الدفعات المستلمة والموثقة من العملاء بالكامل.
                </div>
              </div>

              {/* Stat 3: Total Outstanding Balance */}
              <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-2xl p-5 border border-brand-gray/10 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-alert-warning/10 rounded-full blur-xl -mr-4 -mt-4"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-alert-warning">المستحقات المعلقة</span>
                  <div className="w-8 h-8 bg-alert-warning/10 text-alert-warning rounded-lg flex items-center justify-center">
                    <Coins size={14} />
                  </div>
                </div>
                <h4 className="text-lg font-black text-alert-warning font-mono">
                  {projects.filter(p => p.code !== 'SYS-FINANCIALS').reduce((acc, p) => acc + Math.max(0, (p.totalPrice || 0) - (p.paidAmount || 0)), 0).toLocaleString()} <span className="text-[10px] font-bold">ر.س</span>
                </h4>
                <div className="text-[9px] text-brand-dark-gray/50 dark:text-brand-gray/30 mt-2">
                  باقي دفعات العقود قيد المتابعة والتحصيل.
                </div>
              </div>

              {/* Stat 4: Total Operating Expenses */}
              <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-2xl p-5 border border-brand-gray/10 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-alert-error/10 rounded-full blur-xl -mr-4 -mt-4"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-alert-error">المصروفات التشغيلية</span>
                  <div className="w-8 h-8 bg-alert-error/10 text-alert-error rounded-lg flex items-center justify-center">
                    <TrendingDown size={14} />
                  </div>
                </div>
                <h4 className="text-lg font-black text-alert-error font-mono">
                  {(projects.find(p => p.code === 'SYS-FINANCIALS')?.financialTransactions || [])
                    .reduce((acc, tx) => acc + tx.amount, 0).toLocaleString()} <span className="text-[10px] font-bold">ر.س</span>
                </h4>
                <div className="text-[9px] text-brand-dark-gray/50 dark:text-brand-gray/30 mt-2">
                  أجور، خدمات سحابية، تسويق، رخص برامج.
                </div>
              </div>

              {/* Stat 5: Net Profit */}
              <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-2xl p-5 border border-brand-gray/10 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-primary/15 rounded-full blur-xl -mr-4 -mt-4"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-brand-primary">صافي الأرباح الفعلية</span>
                  <div className="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center">
                    <TrendingUp size={14} />
                  </div>
                </div>
                <h4 className="text-lg font-black text-brand-primary font-mono">
                  {(
                    projects.filter(p => p.code !== 'SYS-FINANCIALS').reduce((acc, p) => acc + (p.paidAmount || 0), 0) -
                    (projects.find(p => p.code === 'SYS-FINANCIALS')?.financialTransactions || []).reduce((acc, tx) => acc + tx.amount, 0)
                  ).toLocaleString()} <span className="text-[10px] font-bold">ر.س</span>
                </h4>
                <div className="text-[9px] text-brand-dark-gray/50 dark:text-brand-gray/30 mt-2">
                  صافي الدخل المستلم بعد خصم التكاليف التشغيلية.
                </div>
              </div>

            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setPaymentProjectCode('');
                  setPaymentAmount('');
                  setPaymentDesc('دفعة مستلمة لتنفيذ أعمال المرحلة');
                  setIsPaymentModalOpen(true);
                }}
                className="py-2.5 px-4 bg-[#12C7C3] text-white hover:bg-opacity-90 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow"
              >
                <Plus size={14} />
                <span>تسجيل دفعة إيراد من عميل</span>
              </button>

              <button
                onClick={() => {
                  setExpenseTitle('');
                  setExpenseAmount('');
                  setExpenseCategory('marketing');
                  setIsExpenseModalOpen(true);
                }}
                className="py-2.5 px-4 bg-brand-primary text-brand-dark hover:bg-brand-secondary rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow"
              >
                <Plus size={14} />
                <span>إضافة مصروف تشغيلي جديد</span>
              </button>
            </div>

            {/* Client Accounts & Details Interactive Section */}
            {(() => {
              const clientNames = Array.from(new Set(
                projects
                  .filter(p => p.code !== 'SYS-FINANCIALS')
                  .map(p => p.clientName)
                  .filter(Boolean)
              ));

              if (!selectedClientName) {
                return (
                  <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-3xl p-6 border border-brand-gray/10 dark:border-white/5 shadow">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-brand-dark dark:text-white">حسابات العملاء الموحدة والأرصدة</h3>
                      <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40">قائمة حسابات العملاء مجمعة بجميع مشاريعهم لسهولة الإدارة ومتابعة التحصيل والمشاركة</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="border-b border-brand-gray/10 dark:border-brand-dark-gray/15 text-brand-dark-gray/60 dark:text-brand-gray/40">
                            <th className="py-2 px-3">العميل والشركة</th>
                            <th className="py-2 px-3">عدد المشاريع</th>
                            <th className="py-2 px-3">قيمة التعاقد الإجمالية</th>
                            <th className="py-2 px-3">المسدد فعلياً</th>
                            <th className="py-2 px-3">الرصيد المتبقي</th>
                            <th className="py-2 px-3 text-left">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-gray/5 dark:divide-brand-dark-gray/10">
                          {clientNames.map(cName => {
                            const cProjects = projects.filter(p => p.clientName === cName && p.code !== 'SYS-FINANCIALS');
                            const fProj = cProjects[0];
                            const cTotal = cProjects.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
                            const cPaid = cProjects.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
                            const cRemaining = Math.max(0, cTotal - cPaid);
                            
                            return (
                              <tr key={cName} className="hover:bg-brand-light/30 dark:hover:bg-brand-dark-gray/5 transition-colors">
                                <td className="py-3 px-3">
                                  <div className="font-bold text-brand-dark dark:text-white hover:text-[#12C7C3] cursor-pointer" onClick={() => setSelectedClientName(cName)}>
                                    {cName}
                                  </div>
                                  <div className="text-[10px] text-brand-dark-gray/50 dark:text-brand-gray/40 font-mono">
                                    {fProj?.company || 'عميل فردي'}
                                  </div>
                                </td>
                                <td className="py-3 px-3 font-mono">
                                  <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-bold">
                                    {cProjects.length} مشاريع
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-mono font-bold text-brand-dark dark:text-white">
                                  {cTotal.toLocaleString()} ر.س
                                </td>
                                <td className="py-3 px-3 font-mono font-bold text-[#12C7C3]">
                                  {cPaid.toLocaleString()} ر.س
                                </td>
                                <td className={`py-3 px-3 font-mono font-black ${cRemaining > 0 ? 'text-alert-warning' : 'text-[#12C7C3]'}`}>
                                  {cRemaining.toLocaleString()} ر.س
                                </td>
                                <td className="py-3 px-3 text-left">
                                  <button
                                    onClick={() => setSelectedClientName(cName)}
                                    className="px-3 py-1.5 bg-brand-primary text-brand-dark hover:bg-brand-secondary rounded-xl text-[10px] font-bold transition-all shadow"
                                  >
                                    الملف والعمليات المالية
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }

              // Selected Client Details sub-page
              const cProjects = projects.filter(p => p.clientName === selectedClientName && p.code !== 'SYS-FINANCIALS');
              const fProj = cProjects[0];
              const cPhone = fProj?.phone || '';
              const cCompany = fProj?.company || 'عميل فردي';
              const cEmail = fProj?.email || '';
              
              const cTotal = cProjects.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
              const cPaid = cProjects.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
              const cRemaining = Math.max(0, cTotal - cPaid);

              const cleanPhone = cPhone.replace(/[^0-9]/g, '');
              const formattedPhone = cleanPhone.startsWith('05') ? '966' + cleanPhone.substring(1) : cleanPhone;
              const whatsappMsg = `مرحباً أ. ${selectedClientName}، نسعد بالتواصل معك من استوديو التصميم لمتابعة المستجدات المالية والمشاريع الخاصة بك.`;
              const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMsg)}`;

              return (
                <div className="space-y-6">
                  {/* Header card with back button and WhatsApp */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-[#1a1a1a]/90 p-5 rounded-3xl border border-brand-gray/10 dark:border-white/5 gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedClientName(null)}
                        className="p-2 bg-brand-primary/10 hover:bg-brand-primary/25 text-brand-primary rounded-xl transition-colors flex items-center justify-center"
                        title="العودة لقائمة حسابات العملاء"
                      >
                        <ArrowLeft size={16} className="rotate-180" />
                      </button>
                      <div>
                        <span className="text-[9px] font-bold text-[#12C7C3] uppercase tracking-wider block">الملف المالي المتكامل للعميل</span>
                        <h3 className="text-sm font-black text-brand-dark dark:text-white">الأستاذ(ة): {selectedClientName}</h3>
                      </div>
                    </div>

                    {cPhone && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 bg-[#25D366] hover:bg-opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow"
                      >
                        <MessageSquare size={14} />
                        <span>مراسلة واتساب الفورية ({cPhone})</span>
                      </a>
                    )}
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-2xl p-4 border border-brand-gray/10 dark:border-white/5 text-xs space-y-1">
                      <div className="text-[10px] text-brand-primary font-bold mb-2">بيانات الاتصال والجهة</div>
                      <p className="text-brand-dark-gray/50 dark:text-brand-gray/40">الجهة/الشركة: <b className="text-brand-dark dark:text-white">{cCompany}</b></p>
                      <p className="text-brand-dark-gray/50 dark:text-brand-gray/40">الجوال: <b className="text-brand-dark dark:text-white font-mono">{cPhone || 'غير مسجل'}</b></p>
                      <p className="text-brand-dark-gray/50 dark:text-brand-gray/40">البريد الإلكتروني: <b className="text-brand-dark dark:text-white">{cEmail || 'غير مسجل'}</b></p>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-2xl p-4 border border-brand-gray/10 dark:border-white/5 flex flex-col justify-between">
                      <span className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 font-bold">إجمالي ميزانية العقود</span>
                      <h4 className="text-base font-black text-brand-dark dark:text-white font-mono mt-2">
                        {cTotal.toLocaleString()} ر.س
                      </h4>
                      <span className="text-[9px] text-brand-dark-gray/40">لقاء {cProjects.length} مشاريع معتمدة</span>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-2xl p-4 border border-brand-gray/10 dark:border-white/5 flex flex-col justify-between">
                      <span className="text-[10px] text-[#12C7C3] font-bold">إجمالي المبالغ المسددة</span>
                      <h4 className="text-base font-black text-[#12C7C3] font-mono mt-2">
                        {cPaid.toLocaleString()} ر.س
                      </h4>
                      <span className="text-[9px] text-[#12C7C3]/80">نسبة التحصيل: {cTotal > 0 ? Math.round((cPaid / cTotal) * 100) : 0}%</span>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-2xl p-4 border border-brand-gray/10 dark:border-white/5 flex flex-col justify-between">
                      <span className="text-[10px] text-alert-warning font-bold">الرصيد المتبقي مستحق</span>
                      <h4 className="text-base font-black text-alert-warning font-mono mt-2">
                        {cRemaining.toLocaleString()} ر.س
                      </h4>
                      <span className="text-[9px] text-alert-warning/80">المستحقات قيد المتابعة والتحصيل</span>
                    </div>
                  </div>

                  {/* Projects for this client */}
                  <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-3xl p-6 border border-brand-gray/10 dark:border-white/5 shadow space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-brand-dark dark:text-white">المشاريع المتعاقد عليها ({cProjects.length})</h4>
                      <p className="text-[9px] text-brand-dark-gray/60 dark:text-brand-gray/40">إدارة ميزانيات المشاريع المستقلة وإصدار فواتير الدفعات بشكل مزامن</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="border-b border-brand-gray/10 dark:border-brand-dark-gray/15 text-brand-dark-gray/60 dark:text-brand-gray/40">
                            <th className="py-2 px-3">اسم المشروع وكوده</th>
                            <th className="py-2 px-3">ميزانية المشروع</th>
                            <th className="py-2 px-3">المدفوع</th>
                            <th className="py-2 px-3">المتبقي</th>
                            <th className="py-2 px-3">الحالة المالية</th>
                            <th className="py-2 px-3 text-left">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-gray/5 dark:divide-brand-dark-gray/10">
                          {cProjects.map(proj => {
                            const remaining = Math.max(0, (proj.totalPrice || 0) - (proj.paidAmount || 0));
                            return (
                              <tr key={proj.id} className="hover:bg-brand-light/30 dark:hover:bg-brand-dark-gray/5 transition-colors">
                                <td className="py-3 px-3">
                                  <div className="font-bold text-brand-dark dark:text-white">{proj.name}</div>
                                  <div className="text-[9px] text-brand-dark-gray/50 dark:text-brand-gray/40 font-mono">
                                    {proj.code} • تسليم متوقع: {proj.deliveryDate}
                                  </div>
                                </td>
                                <td className="py-3 px-3 font-mono font-bold">
                                  {(proj.totalPrice || 0).toLocaleString()} ر.س
                                </td>
                                <td className="py-3 px-3 font-mono font-bold text-[#12C7C3]">
                                  {(proj.paidAmount || 0).toLocaleString()} ر.س
                                </td>
                                <td className={`py-3 px-3 font-mono font-black ${remaining > 0 ? 'text-alert-warning' : 'text-[#12C7C3]'}`}>
                                  {remaining.toLocaleString()} ر.س
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    proj.financialStatus === 'paid' ? 'bg-[#12C7C3]/10 text-[#12C7C3]' :
                                    proj.financialStatus === 'partially_paid' ? 'bg-alert-warning/10 text-alert-warning' :
                                    'bg-alert-error/10 text-alert-error'
                                  }`}>
                                    {proj.financialStatus === 'paid' ? 'تم السداد بالكامل' :
                                     proj.financialStatus === 'partially_paid' ? 'مسدد جزئياً' : 'غير مسدد'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-left">
                                  <div className="inline-flex gap-2">
                                    <button
                                      onClick={() => {
                                        setPaymentProjectCode(proj.code);
                                        setPaymentAmount('');
                                        setPaymentDesc('دفعة مستلمة لتنفيذ أعمال المرحلة');
                                        setIsPaymentModalOpen(true);
                                      }}
                                      className="px-2.5 py-1 bg-[#12C7C3] text-white hover:bg-opacity-90 rounded-lg text-[10px] font-bold transition-all shadow-sm"
                                    >
                                      + تسجيل دفعة
                                    </button>
                                    <button
                                      onClick={() => {
                                        setContractPriceProjectCode(proj.code);
                                        setContractPriceAmount((proj.totalPrice || 0).toString());
                                        setIsContractPriceModalOpen(true);
                                      }}
                                      className="px-2.5 py-1 bg-brand-primary text-brand-dark hover:bg-brand-secondary rounded-lg text-[10px] font-bold transition-all shadow-sm"
                                    >
                                      تعديل الميزانية
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial history of payments */}
                  <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-3xl p-6 border border-brand-gray/10 dark:border-white/5 shadow space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-brand-dark dark:text-white">سجل الدفعات المقبوضة للعميل</h4>
                      <p className="text-[9px] text-brand-dark-gray/60 dark:text-brand-gray/40">كشف حساب تاريخي بجميع عمليات السداد المالي المستلمة من هذا العميل عبر كافة مشاريعه</p>
                    </div>

                    {(() => {
                      const allTxs = cProjects.flatMap(proj => 
                        (proj.financialTransactions || []).map(tx => ({
                          ...tx,
                          projectCode: proj.code,
                          projectName: proj.name
                        }))
                      ).sort((a, b) => b.date.localeCompare(a.date));

                      if (allTxs.length === 0) {
                        return (
                          <div className="text-center py-8 text-brand-dark-gray/40 text-xs">
                            لا توجد دفعات مالية مسجلة بعد لهذا العميل.
                          </div>
                        );
                      }

                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs">
                            <thead>
                              <tr className="border-b border-brand-gray/10 dark:border-brand-dark-gray/15 text-brand-dark-gray/60 dark:text-brand-gray/40">
                                <th className="py-2 px-2">التاريخ</th>
                                <th className="py-2 px-2">المشروع المرتبط</th>
                                <th className="py-2 px-2">البيان والوصف</th>
                                <th className="py-2 px-2">المبلغ</th>
                                <th className="py-2 px-2 text-left">إجراءات</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-gray/5 dark:divide-brand-dark-gray/10">
                              {allTxs.map(tx => (
                                <tr key={tx.id} className="hover:bg-brand-light/30 dark:hover:bg-brand-dark-gray/5 transition-colors">
                                  <td className="py-3 px-2 font-mono text-[10px]">{tx.date}</td>
                                  <td className="py-3 px-2 font-bold text-brand-dark dark:text-white">{tx.projectName} ({tx.projectCode})</td>
                                  <td className="py-3 px-2 text-brand-dark-gray/70 dark:text-brand-gray/60">{tx.description}</td>
                                  <td className="py-3 px-2 font-mono font-black text-[#12C7C3]">
                                    +{tx.amount.toLocaleString()} ر.س
                                  </td>
                                  <td className="py-3 px-2 text-left">
                                    <button
                                      onClick={() => {
                                        const proj = projects.find(p => p.code === tx.projectCode);
                                        if (proj) {
                                          const updatedTxs = (proj.financialTransactions || []).filter(t => t.id !== tx.id);
                                          const newPaid = Math.max(0, (proj.paidAmount || 0) - tx.amount);
                                          let status: Project['financialStatus'] = 'partially_paid';
                                          if (newPaid >= (proj.totalPrice || 0)) {
                                            status = 'paid';
                                          } else if (newPaid <= 0) {
                                            status = 'unpaid';
                                          }
                                          onUpdateProject({
                                            ...proj,
                                            paidAmount: newPaid,
                                            financialStatus: status,
                                            financialTransactions: updatedTxs
                                          });
                                          triggerToast('تم حذف الدفعة وإعادة تسوية الحساب بنجاح!');
                                        }
                                      }}
                                      className="text-alert-error hover:underline text-[10px] font-bold"
                                    >
                                      حذف الدفعة
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })()}

            {/* Expenses List & Expense Form Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Table of operating expenses (2/3 columns) */}
              <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a]/90 rounded-3xl p-6 border border-brand-gray/10 dark:border-white/5 shadow space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-brand-dark dark:text-white">سجل المصروفات التشغيلية العامة</h3>
                  <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40">المبالغ المصروفة على الإيجارات والرواتب والبرامج والتسويق لضبط صافي الأرباح</p>
                </div>

                {(!projects.find(p => p.code === 'SYS-FINANCIALS')?.financialTransactions || 
                  projects.find(p => p.code === 'SYS-FINANCIALS')?.financialTransactions?.length === 0) ? (
                  <div className="text-center py-12 text-brand-dark-gray/40">
                    <TrendingDown size={28} className="mx-auto mb-2 text-brand-dark-gray/20" />
                    <p className="text-xs font-bold">لم تقم بتسجيل أي مصروفات تشغيلية بعد.</p>
                    <p className="text-[9px]">انقر على زر "إضافة مصروف تشغيلي جديد" لبدء موازنة حساباتك.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-brand-gray/10 dark:border-brand-dark-gray/15 text-brand-dark-gray/60 dark:text-brand-gray/40">
                          <th className="py-2 px-2">التاريخ</th>
                          <th className="py-2 px-2">الاسم</th>
                          <th className="py-2 px-2">المبلغ</th>
                          <th className="py-2 px-2 text-left">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-gray/5 dark:divide-brand-dark-gray/10">
                        {projects.find(p => p.code === 'SYS-FINANCIALS')?.financialTransactions?.map(tx => (
                          <tr key={tx.id} className="hover:bg-brand-light/30 dark:hover:bg-brand-dark-gray/5">
                            <td className="py-3 px-2 font-mono text-[10px]">{tx.date}</td>
                            <td className="py-3 px-2 font-bold text-brand-dark dark:text-white">{tx.description}</td>
                            <td className="py-3 px-2 font-mono font-black text-alert-error">
                              {tx.amount.toLocaleString()} ر.س
                            </td>
                            <td className="py-3 px-2 text-left">
                              <button
                                onClick={() => {
                                  const sys = projects.find(p => p.code === 'SYS-FINANCIALS');
                                  if (sys) {
                                    const updatedTransactions = (sys.financialTransactions || []).filter(t => t.id !== tx.id);
                                    onUpdateProject({
                                      ...sys,
                                      financialTransactions: updatedTransactions
                                    });
                                    triggerToast('تم حذف المصروف وتحديث الميزانية بنجاح!');
                                  }
                                }}
                                className="text-alert-error hover:underline text-[10px]"
                              >
                                حذف
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Quick statistics pie-chart mock or visual progress breakdown (1/3 columns) */}
              <div className="bg-white dark:bg-[#1a1a1a]/90 rounded-3xl p-6 border border-brand-gray/10 dark:border-white/5 shadow space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-brand-dark dark:text-white">المؤشرات المالية الرئيسية</h3>
                  <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40">تحليل جودة التحصيل ومعدلات السداد الفعلي للاستوديو</p>
                </div>

                {/* Progress bar of Paid vs Outstanding */}
                <div className="space-y-4">
                  {(() => {
                    const totalRevenue = projects.filter(p => p.code !== 'SYS-FINANCIALS').reduce((acc, p) => acc + (p.totalPrice || 0), 0);
                    const totalPaid = projects.filter(p => p.code !== 'SYS-FINANCIALS').reduce((acc, p) => acc + (p.paidAmount || 0), 0);
                    const paidPercent = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-[#12C7C3]">نسبة التحصيل الفعلي: {paidPercent}%</span>
                          <span className="text-brand-dark-gray/50 dark:text-brand-gray/40">من إجمالي العقود</span>
                        </div>
                        <div className="w-full h-3 bg-brand-light dark:bg-brand-dark-gray/30 rounded-full overflow-hidden">
                          <div className="h-full bg-[#12C7C3] rounded-full transition-all" style={{ width: `${paidPercent}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Financial guidelines list */}
                  <div className="bg-brand-primary/5 dark:bg-brand-dark-gray/10 rounded-2xl p-4 border border-brand-primary/10 space-y-3">
                    <h4 className="text-xs font-bold text-brand-primary">نصائح إدارة السيولة:</h4>
                    <ul className="text-[10px] text-brand-dark-gray/80 dark:text-brand-gray/30 space-y-2 list-disc pr-4 leading-relaxed">
                      <li>احرص على تحصيل دفعة أولى لا تقل عن 50% قبل البدء بتصميم أي هوية جديدة.</li>
                      <li>قم بطلب الدفعة الأخيرة فور تسليم مسودة الهوية المعتمدة وقبل تسليم الملفات المفتوحة والمصادر.</li>
                      <li>قم بتسجيل جميع التكاليف والرواتب أولاً بأول للحصول على كشوفات أرباح صافية دقيقة.</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* MODAL: Record Payment */}
            {isPaymentModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-brand-dark rounded-3xl max-w-md w-full p-6 border border-brand-primary/10 shadow-2xl space-y-4">
                  <h3 className="text-base font-bold text-brand-dark dark:text-white">تسجيل دفعة إيراد جديدة</h3>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!paymentProjectCode || !paymentAmount) {
                      triggerToast('يرجى اختيار العميل وتحديد مبلغ الدفعة!');
                      return;
                    }

                    const targetProject = projects.find(p => p.code === paymentProjectCode);
                    if (!targetProject) {
                      triggerToast('كود المشروع غير موجود!');
                      return;
                    }

                    const amountNum = parseFloat(paymentAmount);
                    const newPaid = (targetProject.paidAmount || 0) + amountNum;
                    
                    let status: Project['financialStatus'] = 'partially_paid';
                    if (newPaid >= (targetProject.totalPrice || 0)) {
                      status = 'paid';
                    } else if (newPaid <= 0) {
                      status = 'unpaid';
                    }

                    const newTx = {
                      id: `tx_${Date.now()}`,
                      date: paymentDate,
                      amount: amountNum,
                      type: 'income' as const,
                      description: paymentDesc
                    };

                    const updatedProject = {
                      ...targetProject,
                      paidAmount: newPaid,
                      financialStatus: status,
                      financialTransactions: [newTx, ...(targetProject.financialTransactions || [])]
                    };

                    onUpdateProject(updatedProject);
                    setIsPaymentModalOpen(false);
                    triggerToast(`تم تسجيل الدفعة بقيمة ${amountNum.toLocaleString()} ر.س لمشروع ${targetProject.clientName} بنجاح!`);
                  }} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold block">اختر مشروع العميل المستحق:</label>
                      <select
                        value={paymentProjectCode}
                        onChange={(e) => setPaymentProjectCode(e.target.value)}
                        className="w-full bg-brand-light/35 dark:bg-brand-dark-gray/30 text-xs border border-brand-gray/20 rounded-xl p-2.5 text-right outline-none text-brand-dark dark:text-white"
                        required
                      >
                        <option value="">-- اختر المشروع --</option>
                        {projects.filter(p => p.code !== 'SYS-FINANCIALS').map(p => (
                          <option key={p.id} value={p.code}>
                            {p.clientName} - {p.name} ({p.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold block">مبلغ الدفعة المستلمة (ر.س):</label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="مثال: 3500"
                        className="w-full bg-brand-light/35 dark:bg-brand-dark-gray/30 text-xs border border-brand-gray/20 rounded-xl p-2.5 text-right outline-none text-brand-dark dark:text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold block">تاريخ استلام الدفعة:</label>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full bg-brand-light/35 dark:bg-brand-dark-gray/30 text-xs border border-brand-gray/20 rounded-xl p-2.5 text-right outline-none text-brand-dark dark:text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold block">الوصف / البيان:</label>
                      <input
                        type="text"
                        value={paymentDesc}
                        onChange={(e) => setPaymentDesc(e.target.value)}
                        placeholder="مثال: دفعة أولى مقدمة 50%"
                        className="w-full bg-brand-light/35 dark:bg-brand-dark-gray/30 text-xs border border-brand-gray/20 rounded-xl p-2.5 text-right outline-none text-brand-dark dark:text-white"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-grow py-2.5 bg-[#12C7C3] text-white text-xs font-bold rounded-xl hover:bg-opacity-95 transition-all"
                      >
                        تسجيل وتأكيد
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPaymentModalOpen(false)}
                        className="px-4 py-2.5 bg-brand-gray/20 text-brand-dark dark:text-white text-xs font-bold rounded-xl hover:bg-brand-gray/30 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: Add Expense */}
            {isExpenseModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-brand-dark rounded-3xl max-w-md w-full p-6 border border-brand-primary/10 shadow-2xl space-y-4">
                  <h3 className="text-base font-bold text-brand-dark dark:text-white">إضافة مصروف تشغيلي جديد</h3>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!expenseTitle.trim() || !expenseAmount) {
                      triggerToast('يرجى تعبئة جميع البيانات المطلوبة!');
                      return;
                    }

                    let targetSys = projects.find(p => p.code === 'SYS-FINANCIALS');
                    if (!targetSys) {
                      targetSys = {
                        id: 'sys_financials',
                        code: 'SYS-FINANCIALS',
                        name: 'المصاريف التشغيلية والميزانية العامة للاستوديو',
                        clientName: 'النظام المالي',
                        company: 'إلهامك الفني',
                        email: '',
                        phone: '',
                        type: 'identity' as any,
                        status: 'delivered' as any,
                        progress: 100,
                        startDate: '2026-01-01',
                        endDate: '2026-12-31',
                        budget: '0',
                        deliveryDate: '2026-12-31',
                        description: 'ملف الميزانية العامة والمصاريف التشغيلية والرواتب والاشتراكات',
                        timeline: [],
                        files: [],
                        updates: [],
                        notes: [],
                        totalPrice: 0,
                        paidAmount: 0,
                        financialStatus: 'paid',
                        financialTransactions: []
                      };
                    }

                    const amountNum = parseFloat(expenseAmount);
                    const newTx = {
                      id: `exp_${Date.now()}`,
                      date: expenseDate,
                      amount: amountNum,
                      type: 'expense' as const,
                      description: `[${expenseCategory === 'marketing' ? 'تسويق' : expenseCategory === 'salaries' ? 'رواتب' : expenseCategory === 'rent' ? 'إيجار' : 'أدوات واشتراكات'}] ${expenseTitle}`
                    };

                    const updatedSys = {
                      ...targetSys,
                      financialTransactions: [newTx, ...(targetSys.financialTransactions || [])]
                    };

                    onUpdateProject(updatedSys);
                    setIsExpenseModalOpen(false);
                    triggerToast(`تم تسجيل مصروف بقيمة ${amountNum.toLocaleString()} ر.س بنجاح!`);
                  }} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold block">بيان المصروف (الاسم):</label>
                      <input
                        type="text"
                        value={expenseTitle}
                        onChange={(e) => setExpenseTitle(e.target.value)}
                        placeholder="مثال: اشتراك فوتوشوب وميدجورني الشهري"
                        className="w-full bg-brand-light/35 dark:bg-brand-dark-gray/30 text-xs border border-brand-gray/20 rounded-xl p-2.5 text-right outline-none text-brand-dark dark:text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold block">مبلغ المصروف (ر.س):</label>
                      <input
                        type="number"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        placeholder="مثال: 450"
                        className="w-full bg-brand-light/35 dark:bg-brand-dark-gray/30 text-xs border border-brand-gray/20 rounded-xl p-2.5 text-right outline-none text-brand-dark dark:text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold block">التصنيف:</label>
                      <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        className="w-full bg-brand-light/35 dark:bg-brand-dark-gray/30 text-xs border border-brand-gray/20 rounded-xl p-2.5 text-right outline-none text-brand-dark dark:text-white"
                        required
                      >
                        <option value="software">برامج وتراخيص</option>
                        <option value="salaries">رواتب وأجور مستقلين</option>
                        <option value="marketing">تسويق وإعلانات</option>
                        <option value="rent">إيجارات ومصاريف تشغيلية</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold block">التاريخ:</label>
                      <input
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        className="w-full bg-brand-light/35 dark:bg-brand-dark-gray/30 text-xs border border-brand-gray/20 rounded-xl p-2.5 text-right outline-none text-brand-dark dark:text-white"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-grow py-2.5 bg-brand-primary text-brand-dark text-xs font-bold rounded-xl hover:bg-brand-secondary transition-all"
                      >
                        تسجيل وتأكيد المصروف
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsExpenseModalOpen(false)}
                        className="px-4 py-2.5 bg-brand-gray/20 text-brand-dark dark:text-white text-xs font-bold rounded-xl hover:bg-brand-gray/30 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: Edit Contract Price */}
            {isContractPriceModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-brand-dark rounded-3xl max-w-md w-full p-6 border border-brand-primary/10 shadow-2xl space-y-4">
                  <h3 className="text-base font-bold text-brand-dark dark:text-white">تعديل قيمة الميزانية الكلية للمشروع</h3>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!contractPriceProjectCode || !contractPriceAmount) {
                      triggerToast('يرجى تحديد المبلغ الجديد للمشروع!');
                      return;
                    }

                    const targetProject = projects.find(p => p.code === contractPriceProjectCode);
                    if (!targetProject) {
                      triggerToast('كود المشروع غير موجود!');
                      return;
                    }

                    const amountNum = parseFloat(contractPriceAmount);
                    let status: Project['financialStatus'] = 'partially_paid';
                    if ((targetProject.paidAmount || 0) >= amountNum) {
                      status = 'paid';
                    } else if ((targetProject.paidAmount || 0) <= 0) {
                      status = 'unpaid';
                    }

                    const updatedProject = {
                      ...targetProject,
                      totalPrice: amountNum,
                      financialStatus: status
                    };

                    onUpdateProject(updatedProject);
                    setIsContractPriceModalOpen(false);
                    triggerToast(`تم تحديث قيمة التعاقد لمشروع ${targetProject.clientName} إلى ${amountNum.toLocaleString()} ر.س بنجاح!`);
                  }} className="space-y-4">
                    <p className="text-[11px] text-brand-dark-gray/60 dark:text-brand-gray/40 leading-relaxed">
                      تعديل ميزانية المشروع يغير القيمة المستهدفة الكلية للتعاقد بشكل مباشر ويحدث الرصيد المتبقي تلقائياً.
                    </p>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold block">مبلغ الميزانية الإجمالية الجديد (ر.س):</label>
                      <input
                        type="number"
                        value={contractPriceAmount}
                        onChange={(e) => setContractPriceAmount(e.target.value)}
                        placeholder="مثال: 12000"
                        className="w-full bg-brand-light/35 dark:bg-brand-dark-gray/30 text-xs border border-brand-gray/20 rounded-xl p-2.5 text-right outline-none text-brand-dark dark:text-white"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-grow py-2.5 bg-brand-primary text-brand-dark text-xs font-bold rounded-xl hover:bg-brand-secondary transition-all"
                      >
                        تحديث الميزانية الكلية
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsContractPriceModalOpen(false)}
                        className="px-4 py-2.5 bg-brand-gray/20 text-brand-dark dark:text-white text-xs font-bold rounded-xl hover:bg-brand-gray/30 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------
            SUB-TAB: BACKUP & DATABASE (النسخ الاحتياطي وقاعدة البيانات)
            ---------------------------------------------------- */}
        {activeSubTab === 'backup' && (
          <div className="space-y-6" dir="rtl">
            <div className="glass-panel p-8 rounded-3xl border border-white/40 dark:border-white/5 shadow-lg space-y-6">
              <div className="flex items-center gap-4 border-b border-brand-gray/20 dark:border-brand-dark-gray/20 pb-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                  <RefreshCw size={24} className="animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark dark:text-white">إدارة النسخ الاحتياطي والربط المباشر</h3>
                  <p className="text-xs text-brand-dark-gray dark:text-brand-gray/60 mt-1">التحكم في قاعدة بيانات الموقع وتصدير واستيراد البيانات وحفظها السحابي الفوري</p>
                </div>
              </div>

              {/* Server Status Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-brand-light/30 dark:bg-brand-dark-gray/10 p-5 rounded-2xl border border-brand-gray/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                    <h4 className="text-xs font-bold text-brand-dark dark:text-white">حالة التزامن الفوري (Real-time Sync)</h4>
                  </div>
                  <p className="text-[11px] text-brand-dark-gray/80 dark:text-brand-gray/60 leading-relaxed">
                    مفعّل بنجاح! يتم الآن ربط وتحديث أي تعديل تجريه فوراً في خادم موقعك وبثه لجميع العملاء والزوار الآخرين بشكل فوري وتلقائي دون الحاجة لتحديث الصفحة يدوياً.
                  </p>
                </div>

                <div className="bg-brand-light/30 dark:bg-brand-dark-gray/10 p-5 rounded-2xl border border-brand-gray/10 space-y-3">
                  <div className="flex items-center gap-2 text-brand-primary font-bold">
                    <ShieldCheck size={16} />
                    <h4 className="text-xs font-bold text-brand-dark dark:text-white">حماية البيانات والنسخ التلقائي</h4>
                  </div>
                  <p className="text-[11px] text-brand-dark-gray/80 dark:text-brand-gray/60 leading-relaxed">
                    تم تأمين قاعدة بيانات خادمك <span className="font-mono">db.json</span> ضد الفقدان. في كل مرة تقوم فيها بتعديل البيانات، يتم تحديث الملف فورياً على الخادم ليكون جاهزاً للعمل دائماً.
                  </p>
                </div>
              </div>

              {/* Backup Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                
                {/* Download Backup */}
                <div className="glass-panel p-6 rounded-2xl border border-white/20 dark:border-white/5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-brand-dark dark:text-white">تصدير وتنزيل نسخة احتياطية كاملة</h4>
                    <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 leading-relaxed">
                      قم بتحميل ملف البيانات المتكاملة للموقع بصيغة JSON. يحتوي هذا الملف على كافة الطلبات، المحادثات، المرفقات، الخدمات، والأسعار الحالية لسهولة استعادتها مستقبلاً.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      try {
                        const dataToBackup = {
                          projects,
                          services,
                          caseStudies,
                          siteTexts
                        };
                        const blob = new Blob([JSON.stringify(dataToBackup, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        const today = new Date().toISOString().split('T')[0];
                        a.href = url;
                        a.download = `elhamc_database_backup_${today}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        triggerToast('تم توليد وتنزيل النسخة الاحتياطية بنجاح!');
                      } catch (err) {
                        console.error(err);
                        triggerToast('عذراً، فشل تصدير النسخة الاحتياطية.');
                      }
                    }}
                    className="w-full py-3 bg-brand-primary text-brand-dark font-bold text-xs rounded-xl hover:bg-brand-secondary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-primary/10"
                  >
                    <Upload size={14} className="rotate-180" />
                    <span>تنزيل ملف النسخة الاحتياطية (.json)</span>
                  </button>
                </div>

                {/* Import Backup */}
                <div className="glass-panel p-6 rounded-2xl border border-white/20 dark:border-white/5 space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-brand-dark dark:text-white">استيراد واستعادة البيانات</h4>
                    <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 leading-relaxed">
                      اختر ملف نسخة احتياطية من جهازك لاستبدال البيانات الحالية فوراً. يرجى الحذر، حيث سيقوم هذا الإجراء باستبدال كافة المشاريع والإعدادات بالبيانات المستوردة.
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const parsed = JSON.parse(event.target?.result as string);
                            if (parsed.projects || parsed.services || parsed.caseStudies || parsed.siteTexts) {
                              onImportBackup(parsed);
                              triggerToast('تم استعادة كافة بيانات الموقع بنجاح ومزامنتها مع الخادم!');
                            } else {
                              alert('تنبيه: ملف النسخة الاحتياطية لا يحتوي على صيغة بيانات صحيحة.');
                            }
                          } catch (err) {
                            console.error(err);
                            alert('فشل استيراد الملف: يرجى التأكد من اختيار ملف JSON صحيح تم تحميله مسبقاً من الموقع.');
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="py-3 px-4 bg-brand-light dark:bg-brand-dark-gray/40 border border-dashed border-brand-primary/30 rounded-xl text-center text-brand-dark-gray hover:bg-brand-primary/5 transition-all flex items-center justify-center gap-2 text-xs font-semibold">
                      <RefreshCw size={14} />
                      <span>اختر ملف النسخة الاحتياطية (.json)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Change Admin Password Section */}
              <div className="border-t border-brand-gray/20 dark:border-brand-dark-gray/20 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
                  <ShieldAlert size={16} className="text-brand-primary" />
                  <span>تغيير كلمة مرور الإدارة (Admin Security Settings)</span>
                </h4>
                
                <form onSubmit={handlePasswordChangeSubmit} className="glass-panel p-6 rounded-2xl border border-white/20 dark:border-white/5 space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray block">كلمة المرور الحالية</label>
                      <input
                        type="password"
                        required
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="أدخل كلمة المرور الحالية"
                        className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs outline-none focus:border-brand-primary transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray block">كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        required
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="أدخل كلمة المرور الجديدة"
                        className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs outline-none focus:border-brand-primary transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark-gray dark:text-brand-gray block">تأكيد كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        required
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="أعد إدخل كلمة المرور الجديدة"
                        className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 dark:border-brand-dark-gray/60 rounded-xl text-xs outline-none focus:border-brand-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-brand-primary text-brand-dark font-bold text-xs rounded-xl hover:bg-brand-secondary transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-primary/10"
                    >
                      <CheckCircle2 size={14} />
                      <span>حفظ كلمة المرور الجديدة</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Text Backup & Restore */}
              <div className="border-t border-brand-gray/20 dark:border-brand-dark-gray/20 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
                  <FileText size={16} className="text-brand-primary" />
                  <span>النسخ الاحتياطي والاستعادة كنص (نسخ ولصق مباشر)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Copy Backup as Text */}
                  <div className="glass-panel p-5 rounded-2xl border border-white/20 dark:border-white/5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-brand-dark dark:text-white">1. تصدير البيانات كنص (JSON)</span>
                      <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 leading-relaxed">
                        اضغط على الزر أدناه لتوليد ونسخ قاعدة بيانات الموقع بالكامل كنص مشفر إلى الحافظة، لمشاركتها أو حفظها في ملف نصي بسيط.
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const dataToBackup = {
                            projects,
                            services,
                            caseStudies,
                            siteTexts
                          };
                          const text = JSON.stringify(dataToBackup, null, 2);
                          navigator.clipboard.writeText(text);
                          triggerToast('تم نسخ كود النسخة الاحتياطية بالكامل إلى الحافظة!');
                        } catch (err) {
                          console.error(err);
                          triggerToast('فشل نسخ البيانات الاحتياطية.');
                        }
                      }}
                      className="w-full py-2.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-brand-primary/20"
                    >
                      <FileText size={14} />
                      <span>توليد ونسخ كود البيانات بالكامل</span>
                    </button>
                  </div>

                  {/* Restore Backup from Text */}
                  <div className="glass-panel p-5 rounded-2xl border border-white/20 dark:border-white/5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-brand-dark dark:text-white">2. استعادة البيانات من كود نصي</span>
                      <p className="text-[10px] text-brand-dark-gray/60 dark:text-brand-gray/40 leading-relaxed">
                        ألصق كود النسخة الاحتياطية النصي (صيغة JSON) في الحقل أدناه، ثم انقر على زر الاستعادة لتحديث الموقع فوراً.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        id="backup-text-input"
                        placeholder='{"projects": [...], "services": [...]}'
                        rows={2}
                        className="w-full p-2.5 bg-white dark:bg-brand-dark border border-brand-gray/30 rounded-xl text-[10px] font-mono text-left outline-none focus:border-brand-primary transition-colors resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.getElementById('backup-text-input') as HTMLTextAreaElement | null;
                          if (!textarea || !textarea.value.trim()) {
                            alert('يرجى لصق نص النسخة الاحتياطية أولاً في الحقل.');
                            return;
                          }
                          try {
                            const parsed = JSON.parse(textarea.value.trim());
                            if (parsed.projects || parsed.services || parsed.caseStudies || parsed.siteTexts) {
                              onImportBackup(parsed);
                              textarea.value = '';
                              triggerToast('تم استعادة كافة البيانات ومزامنتها بنجاح من النص!');
                            } else {
                              alert('تنبيه: النص الملصق لا يحتوي على صيغة بيانات صحيحة.');
                            }
                          } catch (err) {
                            console.error(err);
                            alert('فشل استيراد النص: يرجى التأكد من أن النص الملصق عبارة عن كود JSON صحيح وخالٍ من الأخطاء.');
                          }
                        }}
                        className="w-full py-2 bg-brand-primary text-brand-dark font-bold text-xs rounded-xl hover:bg-brand-secondary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <RefreshCw size={13} />
                        <span>تحميل واستعادة البيانات من النص الملصق</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
