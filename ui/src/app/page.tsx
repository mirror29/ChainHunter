"use client";

import {
  BrainCircuit,
  Coins,
  BarChart3,
  Search,
  LineChart,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/feature-card";
import { RoadmapItem } from "@/components/roadmap-item";
import { TeamMember } from "@/components/team-member";
import { useI18n } from "@/lib/i18n";
import {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  Stagger,
} from "@/components/ui/motion";
import { motion } from "framer-motion";
import {
  featureAccentColors,
  featureColors,
  teamMembers,
} from "@/lib/homeConfig";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Data for features section
  const features = [
    {
      icon: BrainCircuit,
      title: t("features.automated.title"),
      description: t("features.automated.description"),
    },
    {
      icon: Coins,
      title: t("features.arbitrage.title"),
      description: t("features.arbitrage.description"),
    },
    {
      icon: BarChart3,
      title: t("features.quant.title"),
      description: t("features.quant.description"),
    },
    {
      icon: Search,
      title: t("features.intelligence.title"),
      description: t("features.intelligence.description"),
    },
    {
      icon: LineChart,
      title: t("features.monitoring.title"),
      description: t("features.monitoring.description"),
    },
  ];

  // Data for roadmap section
  const roadmapItems = [
    {
      quarter: t("roadmap.q1.title"),
      title: t("roadmap.q1.description"),
      isActive: true,
    },
    {
      quarter: t("roadmap.q2.title"),
      title: t("roadmap.q2.description"),
      isActive: false,
    },
    {
      quarter: t("roadmap.q3.title"),
      title: t("roadmap.q3.description"),
      isActive: false,
    },
    {
      quarter: t("roadmap.q4.title"),
      title: t("roadmap.q4.description"),
      isActive: false,
    },
  ];

  const handleGetStarted = () => {
    if (status === "authenticated") {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  };

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar pageType="home" />

      {/* Hero Section */}
      <section
        id="home"
        className="min-h-screen relative flex items-center justify-center overflow-hidden py-20"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background/80 dark:from-blue-900/40 dark:via-background dark:to-background/90" />

        {/* Background hexagon pattern */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Background animation circles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-900/10 dark:bg-blue-900/30"
              style={{
                width: `${Math.random() * 400 + 200}px`,
                height: `${Math.random() * 400 + 200}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1],
                opacity: [0, 0.3, 0],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                delay: i * 5,
              }}
            />
          ))}
        </div>

        <div className="container relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center lg:text-left">
              <FadeInUp>
                <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-blue-400 dark:to-blue-600">
                  {t("hero.title")}
                </h1>
              </FadeInUp>

              <FadeInUp delay={0.1}>
                <p className="text-xl text-muted-foreground mb-8 dark:text-slate-300">
                  {t("hero.subtitle")}
                </p>
              </FadeInUp>

              <FadeInUp delay={0.2}>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary cursor-pointer dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-700"
                    onClick={handleGetStarted}
                  >
                    {t("hero.cta")}
                  </Button>

                  {/* <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-primary/50 text-primary hover:text-primary/80 hover:bg-primary/5 cursor-pointer dark:border-blue-500/70 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                  >
                    {t("hero.secondary")}
                  </Button> */}
                </div>
              </FadeInUp>
            </div>

            <FadeInRight delay={0.3} className="w-full max-w-md">
              <div className="relative w-full aspect-square">
                {/* 恢复原有脉冲背景效果但增加暗色主题适配 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-background animate-pulse dark:from-blue-800/30 dark:to-background/90" />
                <div
                  className="absolute inset-6 rounded-full bg-gradient-to-tr from-primary/30 to-background/80 animate-pulse dark:from-blue-700/30 dark:to-background/80"
                  style={{ animationDelay: "1s" }}
                />
                <div
                  className="absolute inset-12 rounded-full bg-gradient-to-bl from-primary/20 to-background animate-pulse dark:from-blue-600/20 dark:to-background/90"
                  style={{ animationDelay: "2s" }}
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-3/4 h-3/4">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-background/50 rounded-2xl transform rotate-45 animate-pulse dark:from-blue-700/20 dark:to-background/50" />
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background/50 rounded-2xl transform -rotate-45 animate-pulse dark:from-blue-600/20 dark:to-background/50"
                      style={{ animationDelay: "1.5s" }}
                    />
                  </div>
                </div>
              </div>
            </FadeInRight>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 relative overflow-hidden flex flex-col items-center justify-center min-h-screen px-8"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/10 to-background dark:from-blue-950/30 dark:to-background/95" />

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-blue-700/30" />
        <div className="absolute top-40 right-0 w-72 h-72 bg-primary/5 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-primary/5 dark:bg-blue-900/20 rounded-full blur-3xl" />

        <div className="container relative z-10 flex flex-col items-center justify-center min-h-screen">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <FadeInUp>
              <h2 className="text-4xl font-bold mb-4 dark:text-slate-200">
                {t("features.title")}
              </h2>
            </FadeInUp>

            <FadeInUp delay={0.1}>
              <p className="text-muted-foreground dark:text-slate-400">
                {t("features.description")}
              </p>
            </FadeInUp>
          </div>

          <div className="max-w-6xl mx-auto flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 0.1}
                  bgColorClass={featureColors[index % featureColors.length]}
                  accentColorClass={
                    featureAccentColors[index % featureAccentColors.length]
                  }
                />
              ))}
            </div>
          </div>

          <FadeInUp delay={0.6} className="mt-16 text-center">
            <Button
              variant="outline"
              className="rounded-full group border-primary/50 text-primary hover:bg-primary/5 hover:text-primary/80 cursor-pointer dark:border-blue-500/70 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
            >
              {t("features.more")}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </FadeInUp>
        </div>
      </section>

      {/* Roadmap Section */}
      <section
        id="roadmap"
        className="py-24 relative overflow-hidden flex flex-col items-center justify-center min-h-screen px-8"
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:from-background/90 dark:via-background/95 dark:to-blue-900/20" />
        <div className="absolute right-0 top-1/4 w-1/3 h-1/2 bg-gradient-to-br from-primary/10 to-transparent dark:from-blue-900/30 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-1/4 w-1/4 h-1/3 bg-gradient-to-tl from-violet-500/10 to-transparent dark:from-violet-900/20 rounded-full blur-3xl" />

        {/* 添加与其他模块一样的顶部分隔线 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-blue-700/30" />

        {/* Tech background grid */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='currentColor' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <FadeInUp>
                <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-blue-400 dark:to-blue-600">
                  {t("roadmap.title")}
                </h2>
              </FadeInUp>

              <FadeInUp delay={0.1}>
                <p className="text-muted-foreground mx-auto max-w-2xl dark:text-slate-400">
                  {t("roadmap.description")}
                </p>
              </FadeInUp>
            </div>

            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2">
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent dark:from-blue-500/70 dark:via-blue-500/30" />

                  <Stagger className="space-y-0">
                    {roadmapItems.map((item, index) => (
                      <RoadmapItem
                        key={index}
                        quarter={item.quarter}
                        title={item.title}
                        description=""
                        isActive={item.isActive}
                        delay={index * 0.1}
                      />
                    ))}
                  </Stagger>
                </div>
              </div>

              <FadeInRight
                delay={0.3}
                className="lg:w-1/2 h-full flex items-center justify-center"
              >
                <div className="relative w-full max-w-md aspect-square">
                  {/* Circular progress */}
                  <motion.svg className="w-full h-full" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient
                        id="progressGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#4F46E5"
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor="#7C3AED"
                          stopOpacity="0.6"
                        />
                      </linearGradient>
                    </defs>

                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      strokeOpacity="0.1"
                      className="dark:text-slate-400"
                    />

                    {/* 简化为加载动画 */}
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="2"
                      strokeDasharray="283"
                      strokeDashoffset="212"
                      transform="rotate(-90 50 50)"
                      className="text-indigo-600 dark:text-indigo-500"
                      initial={{ strokeDashoffset: 283 }}
                      animate={{ strokeDashoffset: 212 }}
                      transition={{
                        duration: 1.5,
                        ease: "easeOut",
                      }}
                    />

                    {/* Milestone dots */}
                    {[...Array(4)].map((_, index) => {
                      const percent = index / 4;
                      const angle = percent * Math.PI * 2 - Math.PI / 2;
                      const x = 50 + 45 * Math.cos(angle);
                      const y = 50 + 45 * Math.sin(angle);

                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r="2"
                          className={
                            index === 0
                              ? "fill-indigo-600 dark:fill-indigo-500"
                              : "fill-indigo-600/30 dark:fill-indigo-500/40"
                          }
                        />
                      );
                    })}
                  </motion.svg>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-500">
                        25%
                      </div>
                      <div className="text-sm text-muted-foreground dark:text-slate-400">
                        {t("roadmap.progress")}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInRight>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="team"
        className="py-24 relative overflow-hidden flex flex-col items-center justify-center min-h-screen px-8"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background dark:from-background dark:via-blue-900/10 dark:to-background/95" />

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-blue-800/30" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/5 dark:bg-blue-800/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-violet-500/5 dark:bg-violet-800/20 rounded-full blur-3xl" />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <FadeInUp>
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-blue-400 dark:to-blue-600">
                {t("team.title")}
              </h2>
            </FadeInUp>

            <FadeInUp delay={0.1}>
              <p className="text-muted-foreground dark:text-slate-400">
                {t("team.description")}
              </p>
            </FadeInUp>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <TeamMember
                  key={index}
                  name={member.name}
                  role={member.role}
                  bio={member.bio}
                  socialLinks={member.socialLinks}
                  delay={index * 0.1}
                  colorVariant={index % 4}
                />
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <FadeInUp delay={0.6}>
              <div className="inline-block rounded-full px-6 py-3 bg-primary/10 text-foreground/90 dark:bg-blue-900/20 dark:text-slate-200">
                <span className="mr-2">🚀</span>
                {t("team.join")}
                <Button
                  variant="link"
                  className="ml-2 text-primary hover:text-primary/80 cursor-pointer dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {t("team.joinus")}
                </Button>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-24 relative overflow-hidden flex flex-col items-center justify-center min-h-screen px-8"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background to-violet-500/5 dark:from-blue-900/20 dark:via-background/95 dark:to-violet-900/20" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/10 to-transparent dark:from-blue-800/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tl from-violet-500/10 to-transparent dark:from-violet-800/20 rounded-full blur-3xl" />

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <FadeInUp>
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-blue-400 dark:to-blue-600">
                {t("contact.title")}
              </h2>
            </FadeInUp>

            <FadeInUp delay={0.1}>
              <p className="text-muted-foreground max-w-2xl mx-auto dark:text-slate-400">
                {t("contact.description")}
              </p>
            </FadeInUp>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeInLeft delay={0.2} className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-blue-500 group-hover:text-blue-600 transition-colors">
                      {t("contact.phone")}
                    </div>
                    <div className="text-muted-foreground group-hover:text-foreground/80 transition-colors dark:text-slate-400 dark:group-hover:text-slate-300">
                      {t("contact.phoneValue")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-violet-500/5 hover:bg-violet-500/10 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-violet-500 group-hover:text-violet-600 transition-colors">
                      {t("contact.email")}
                    </div>
                    <div className="text-muted-foreground group-hover:text-foreground/80 transition-colors dark:text-slate-400 dark:group-hover:text-slate-300">
                      {t("contact.emailValue")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-emerald-500 group-hover:text-emerald-600 transition-colors">
                      {t("contact.address")}
                    </div>
                    <div className="text-muted-foreground group-hover:text-foreground/80 transition-colors dark:text-slate-400 dark:group-hover:text-slate-300">
                      {t("contact.addressValue")}
                    </div>
                  </div>
                </div>
              </FadeInLeft>
            </div>

            <FadeInRight delay={0.3}>
              <div className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 bg-gradient-to-br from-background to-background/80 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-blue-900/20 border-none">
                <h3 className="text-xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-blue-400 dark:to-blue-600">
                  {t("contact.sendMessage")}
                </h3>
                <form className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block mb-2 text-sm font-medium dark:text-slate-300"
                    >
                      {t("contact.name")}
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder={t("contact.namePlaceholder")}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 dark:bg-card/30 dark:border-blue-900/50 dark:focus:ring-blue-500/50 dark:focus:border-blue-500/50 dark:text-slate-200 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium dark:text-slate-300"
                    >
                      {t("contact.email")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder={t("contact.emailPlaceholder")}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 dark:bg-card/30 dark:border-blue-900/50 dark:focus:ring-blue-500/50 dark:focus:border-blue-500/50 dark:text-slate-200 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block mb-2 text-sm font-medium dark:text-slate-300"
                    >
                      {t("contact.message")}
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder={t("contact.messagePlaceholder")}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 dark:bg-card/30 dark:border-blue-900/50 dark:focus:ring-blue-500/50 dark:focus:border-blue-500/50 dark:text-slate-200 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <Button className="w-full rounded-lg py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary cursor-pointer dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-700">
                    {t("contact.submit")}
                  </Button>
                </form>
              </div>
            </FadeInRight>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border relative overflow-hidden flex flex-col items-center justify-center px-8">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-background to-violet-500/5 dark:from-blue-900/20 dark:via-background/95 dark:to-violet-900/20" />

        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="text-3xl font-bold flex items-center gap-2 mb-4">
                <div className="relative">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-primary dark:from-blue-400 dark:via-cyan-400 dark:to-blue-600">
                    Chain
                  </span>
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary via-blue-500 to-primary dark:from-blue-400 dark:via-cyan-400 dark:to-blue-600"
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 1.5,
                      delay: 0.5,
                      ease: "easeOut",
                    }}
                  />
                </div>
                <motion.span
                  className="dark:text-slate-200"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  Hunter
                </motion.span>
              </div>

              <p className="text-muted-foreground max-w-md mb-6 dark:text-slate-400">
                {t("footer.description")}
              </p>

              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors cursor-pointer dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors cursor-pointer dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors cursor-pointer dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors cursor-pointer dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-blue-400 dark:to-blue-600">
                {t("footer.quicklinks")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#home"
                    className="text-muted-foreground hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    {t("nav.home")}
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-muted-foreground hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    {t("nav.features")}
                  </a>
                </li>
                <li>
                  <a
                    href="#roadmap"
                    className="text-muted-foreground hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    {t("nav.roadmap")}
                  </a>
                </li>
                <li>
                  <a
                    href="#team"
                    className="text-muted-foreground hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    {t("nav.team")}
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-muted-foreground hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    {t("nav.contact")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-blue-400 dark:to-blue-600">
                {t("footer.subscribe")}
              </h3>
              <p className="text-muted-foreground mb-4 dark:text-slate-400">
                {t("footer.newsletterDesc")}
              </p>
              <div className="flex gap-2 items-center">
                <input
                  type="email"
                  placeholder={t("footer.emailPlaceholder")}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 dark:bg-card/30 dark:border-blue-900/50 dark:focus:ring-blue-500/50 dark:focus:border-blue-500/50 dark:text-slate-200 dark:placeholder:text-slate-500"
                />
                <Button
                  size="sm"
                  className="rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary cursor-pointer dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-700"
                >
                  {t("footer.subscribeButton")}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-muted-foreground text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} ChainHunter. {t("footer.copyright")}
            </div>

            <div className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-blue-400"
              >
                {t("footer.privacy")}
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-blue-400"
              >
                {t("footer.terms")}
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-blue-400"
              >
                {t("footer.cookie")}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
