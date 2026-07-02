/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectType = 'identity' | 'logo' | 'packaging' | 'uiux' | 'development' | string;
export type ProjectStatus = 'received' | 'design' | 'review' | 'modification' | 'delivered';

export interface TimelineStep {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed';
  date?: string;
  description: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  version: string;
  date: string;
  size: string;
  description: string;
  type: string;
  url?: string;
}

export interface ProjectUpdate {
  id: string;
  date: string;
  title: string;
  content: string;
  author: 'admin' | 'system';
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'admin';
  text: string;
  date: string;
  attachment?: {
    name: string;
    size: string;
  };
}

export interface Project {
  id: string;
  code: string;
  password?: string;
  name: string;
  clientName: string;
  company: string;
  email: string;
  phone: string;
  type: ProjectType;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  budget: string;
  deliveryDate: string;
  description: string;
  timeline: TimelineStep[];
  files: ProjectFile[];
  updates: ProjectUpdate[];
  notes: ChatMessage[];
  finalFiles?: ProjectFile[];
  totalPrice?: number;
  paidAmount?: number;
  financialStatus?: 'paid' | 'partially_paid' | 'unpaid' | 'refunded';
  clientReview?: {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    showOnHome?: boolean;
  };
  financialTransactions?: {
    id: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
    description: string;
  }[];
}

export interface CaseStudy {
  id: string;
  title: string;
  clientName: string;
  category: string;
  date: string;
  coverImage: string;
  tags: string[];
  challenges: string;
  solutions: string;
  designStages: {
    title: string;
    description: string;
  }[];
  sketches: string[]; // SVGs or generated gradient illustrations
  colors: string[];
  fonts: string[];
  mockups: {
    title: string;
    image: string;
  }[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  features: string[];
  priceRange: string;
  image?: string;
}

export interface SiteTexts {
  heroTag: string;
  heroTitle: string;
  heroTitleHighlighted: string;
  heroTitleRest: string;
  heroDesc: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;

  whyUsTag: string;
  whyUsTitle: string;
  whyUsDesc: string;

  whyUsCard1Title: string;
  whyUsCard1Desc: string;
  whyUsCard2Title: string;
  whyUsCard2Desc: string;
  whyUsCard3Title: string;
  whyUsCard3Desc: string;

  faqTag: string;
  faqTitle: string;
  faqDesc: string;
  
  faqQ1: string;
  faqA1: string;
  faqQ2: string;
  faqA2: string;
  faqQ3: string;
  faqA3: string;

  ctaTitle: string;
  ctaDesc: string;
  ctaButton: string;

  servicesTag: string;
  servicesTitle: string;
  servicesDesc: string;

  portfolioTag: string;
  portfolioTitle: string;
  portfolioDesc: string;

  heroLogosTitle: string;

  requestTag: string;
  requestTitle: string;
  requestDesc: string;

  logoUrl?: string;
  logoText?: string;

  // Hero visual mockup settings
  heroMockupUseRealData?: boolean;
  heroMockupProjectsCount?: string;
  heroMockupRatingText?: string;
  heroMockupProjectName?: string;
  heroMockupStatus?: string;
  heroMockupProgress?: string;
  heroMockupStep1Title?: string;
  heroMockupStep1Desc?: string;
  heroMockupStep2Title?: string;
  heroMockupStep2Desc?: string;
  heroMockupFileName?: string;
  heroMockupFileSize?: string;
}
