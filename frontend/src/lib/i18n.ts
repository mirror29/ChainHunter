import { create } from "zustand";

type Locale = "en" | "zh";

type Translations = {
  [key: string]: {
    [key in Locale]: string;
  };
};

// Translation dictionary
export const translations: Translations = {
  // Header
  "site.title": {
    en: "ChainHunter",
    zh: "ChainHunter",
  },
  "site.description": {
    en: "Advanced Agent for Blockchain Trading & Analysis",
    zh: "区块链交易与分析的高级智能代理",
  },
  "nav.home": {
    en: "Home",
    zh: "首页",
  },
  "nav.features": {
    en: "Features",
    zh: "功能",
  },
  "nav.roadmap": {
    en: "Roadmap",
    zh: "路线图",
  },
  "nav.team": {
    en: "Team",
    zh: "团队",
  },
  "nav.contact": {
    en: "Contact",
    zh: "联系我们",
  },

  // Hero section
  "hero.title": {
    en: "Revolutionize Your Crypto Trading",
    zh: "革新您的加密货币交易体验",
  },
  "hero.subtitle": {
    en: "AI-powered agent for automated trading, arbitrage, and blockchain intelligence",
    zh: "由AI驱动的自动化交易、套利和区块链智能代理平台",
  },
  "hero.cta": {
    en: "Get Started",
    zh: "立即开始",
  },
  "hero.secondary": {
    en: "Learn More",
    zh: "了解更多",
  },

  // Features section
  "features.title": {
    en: "Key Features",
    zh: "核心功能",
  },
  "features.description": {
    en: "Explore the core features of ChainHunter to help you capture every opportunity in the blockchain market",
    zh: "探索 ChainHunter 的核心功能，助您抓住区块链市场的每一个机会",
  },
  "features.automated.title": {
    en: "Automated Trading",
    zh: "自动化交易",
  },
  "features.automated.description": {
    en: "Execute complex trading strategies with smart contract automation",
    zh: "通过智能合约自动化执行复杂交易策略",
  },
  "features.arbitrage.title": {
    en: "Market Opportunities",
    zh: "市场机会发现",
  },
  "features.arbitrage.description": {
    en: "Discover and capitalize on arbitrage opportunities across exchanges",
    zh: "发现并利用跨交易所的套利机会",
  },
  "features.quant.title": {
    en: "Quantitative Trading",
    zh: "量化交易",
  },
  "features.quant.description": {
    en: "Advanced algorithms for data-driven trading decisions",
    zh: "基于数据驱动的高级交易算法决策",
  },
  "features.intelligence.title": {
    en: "Project Intelligence",
    zh: "项目背景调查",
  },
  "features.intelligence.description": {
    en: "Comprehensive background checks on crypto projects including funding and investment advice",
    zh: "加密项目的全面背景调查，包括融资情况和投资建议",
  },
  "features.monitoring.title": {
    en: "On-Chain Monitoring",
    zh: "链上监控",
  },
  "features.monitoring.description": {
    en: "Real-time blockchain activity monitoring and alerts",
    zh: "实时区块链活动监控和智能预警",
  },
  "features.more": {
    en: "Learn More Features",
    zh: "了解更多功能",
  },

  // Roadmap section
  "roadmap.title": {
    en: "Project Roadmap",
    zh: "项目路线图",
  },
  "roadmap.description": {
    en: "We are steadily advancing the development of ChainHunter, following a clear roadmap to provide users with cutting-edge blockchain trading and analysis tools.",
    zh: "我们正在稳步推进 ChainHunter 的开发，遵循明确的路线图，为用户提供最先进的区块链交易和分析工具。",
  },
  "roadmap.q1.title": {
    en: "Q1 2024",
    zh: "2024年第一季度",
  },
  "roadmap.q1.description": {
    en: "Project inception and core architecture design",
    zh: "项目启动和核心架构设计",
  },
  "roadmap.q2.title": {
    en: "Q2 2024",
    zh: "2024年第二季度",
  },
  "roadmap.q2.description": {
    en: "Beta release with automated trading capabilities",
    zh: "带有自动化交易功能的测试版发布",
  },
  "roadmap.q3.title": {
    en: "Q3 2024",
    zh: "2024年第三季度",
  },
  "roadmap.q3.description": {
    en: "Integration of market analysis and arbitrage features",
    zh: "市场分析和套利功能的整合",
  },
  "roadmap.q4.title": {
    en: "Q4 2024",
    zh: "2024年第四季度",
  },
  "roadmap.q4.description": {
    en: "Full launch with comprehensive monitoring and intelligence tools",
    zh: "全面的监控和情报工具的完整发布",
  },
  "roadmap.progress": {
    en: "Completion",
    zh: "完成进度",
  },
  "roadmap.inprogress": {
    en: "In Progress",
    zh: "进行中",
  },
  "roadmap.upcoming": {
    en: "Upcoming",
    zh: "即将到来",
  },

  // Team section
  "team.title": {
    en: "Our Team",
    zh: "我们的团队",
  },
  "team.description": {
    en: "A group of blockchain experts, data scientists, and trading professionals",
    zh: "由区块链专家、数据科学家和交易专业人士组成的团队",
  },
  "team.join": {
    en: "We are looking for talented people to join our team",
    zh: "我们正在寻找优秀的人才加入团队",
  },
  "team.joinus": {
    en: "Join Us",
    zh: "加入我们",
  },

  // Contact section
  "contact.title": {
    en: "Contact Us",
    zh: "联系我们",
  },
  "contact.description": {
    en: "Have questions? Reach out to our team",
    zh: "有问题？请联系我们的团队",
  },
  "contact.phone": {
    en: "Phone Support",
    zh: "电话咨询",
  },
  "contact.phoneValue": {
    en: "+86 123 4567 8910",
    zh: "+86 123 4567 8910",
  },
  "contact.address": {
    en: "Office Address",
    zh: "公司地址",
  },
  "contact.addressValue": {
    en: "Shanghai Lujiazui Finance Center, China",
    zh: "中国上海陆家嘴金融中心",
  },
  "contact.name": {
    en: "Name",
    zh: "姓名",
  },
  "contact.namePlaceholder": {
    en: "Enter your name",
    zh: "输入您的姓名",
  },
  "contact.email": {
    en: "Email Support",
    zh: "邮件咨询",
  },
  "contact.emailValue": {
    en: "contact@chainhunter.com",
    zh: "contact@chainhunter.com",
  },
  "contact.emailPlaceholder": {
    en: "Enter your email",
    zh: "输入您的邮箱",
  },
  "contact.message": {
    en: "Message",
    zh: "消息",
  },
  "contact.messagePlaceholder": {
    en: "Enter your message",
    zh: "输入您的消息",
  },
  "contact.submit": {
    en: "Submit",
    zh: "提交",
  },
  "contact.sendMessage": {
    en: "Send Message",
    zh: "发送消息",
  },

  // Footer
  "footer.description": {
    en: "ChainHunter is an advanced AI agent platform focused on blockchain trading and analysis, helping users seize market opportunities and implement intelligent trading strategies.",
    zh: "ChainHunter 是一个专注于区块链交易与分析的高级智能代理平台，帮助用户抓住市场机会，实现智能化交易策略。",
  },
  "footer.quicklinks": {
    en: "Quick Links",
    zh: "快速链接",
  },
  "footer.subscribe": {
    en: "Subscribe to Latest News",
    zh: "订阅最新消息",
  },
  "footer.newsletterDesc": {
    en: "Get timely product updates and industry news",
    zh: "及时获取产品更新和行业资讯",
  },
  "footer.emailPlaceholder": {
    en: "Your email address",
    zh: "您的邮箱地址",
  },
  "footer.subscribeButton": {
    en: "Subscribe",
    zh: "订阅",
  },
  "footer.privacy": {
    en: "Privacy Policy",
    zh: "隐私政策",
  },
  "footer.terms": {
    en: "Terms of Service",
    zh: "服务条款",
  },
  "footer.cookie": {
    en: "Cookie Policy",
    zh: "Cookie 政策",
  },
  "footer.copyright": {
    en: "All rights reserved.",
    zh: "保留所有权利。",
  },
};

// Create a store to manage the current locale
interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const useI18n = create<I18nStore>((set, get) => ({
  locale: "en",
  setLocale: (locale: Locale) => set({ locale }),
  t: (key: string) => {
    const { locale } = get();
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[locale] || translation.en;
  },
}));
