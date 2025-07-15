"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Crown, ChevronRight, Globe } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

const plans = [
  {
    id: "monthly",
    nameKey: "payment.monthly.name",
    descriptionKey: "payment.monthly.description",
    price: "￥29.99",
    features: [
      "payment.feature.unlimited",
      "payment.feature.priority",
      "payment.feature.advanced",
    ],
  },
  {
    id: "yearly",
    nameKey: "payment.yearly.name",
    descriptionKey: "payment.yearly.description",
    price: "￥299.99",
    features: [
      "payment.feature.unlimited",
      "payment.feature.priority",
      "payment.feature.advanced",
      "payment.feature.support",
      "payment.feature.report",
    ],
    featured: true,
  },
  {
    id: "lifetime",
    nameKey: "payment.lifetime.name",
    descriptionKey: "payment.lifetime.description",
    price: "￥999.99",
    features: [
      "payment.feature.unlimited",
      "payment.feature.priority",
      "payment.feature.advanced",
      "payment.feature.support",
      "payment.feature.report",
      "payment.feature.vip",
    ],
  },
];

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>("yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const { t, locale, setLocale } = useI18n();

  // Refs for scroll animation
  const titleRef = useRef(null);
  const plansRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);

    // 这里仅作演示，实际项目应连接支付接口
    alert("支付功能尚未开发，敬请期待！");
    setIsProcessing(false);
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 卡片动画变体
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  // 标题动画变体
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  // 字符动画变体（用于标题文字动效）
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 container max-w-6xl mx-auto py-12 px-4 mt-16">
        <motion.div
          className="text-center mb-12"
          ref={titleRef}
          initial="hidden"
          animate="visible"
          variants={titleVariants}
        >
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-cyan-500">
            {t("payment.title")
              .split("")
              .map((char, i) => (
                <motion.span
                  key={i}
                  variants={letterVariants}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
          </h1>
          <motion.p
            className="mt-4 text-muted-foreground max-w-xl mx-auto"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { delay: 0.3, duration: 0.5 },
              },
            }}
          >
            {t("payment.subtitle")}
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mt-8" ref={plansRef}>
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              custom={i}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={cardVariants}
              onClick={() => handleSelectPlan(plan.id)}
              className="cursor-pointer"
            >
              <Card
                className={`relative overflow-hidden transition-all h-full border-0 ${
                  selectedPlan === plan.id ? "ring-2 ring-primary" : ""
                }`}
                style={{
                  boxShadow:
                    selectedPlan === plan.id
                      ? "0 20px 25px -5px rgba(59, 130, 246, 0.4), 0 10px 10px -6px rgba(59, 130, 246, 0.3)"
                      : plan.featured
                      ? "0 10px 25px -5px rgba(59, 130, 246, 0.3), 0 8px 10px -6px rgba(59, 130, 246, 0.2)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              >
                {plan.featured && (
                  <motion.div
                    className="absolute top-0 right-0 bg-gradient-to-r from-primary to-blue-400 text-white px-3 py-1 text-xs font-medium"
                    initial={{ x: 100 }}
                    animate={{ x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  >
                    {t("payment.most.popular")}
                  </motion.div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {t(plan.nameKey)}
                    {plan.featured && (
                      <motion.div
                        animate={{ rotate: [0, 10, 0] }}
                        transition={{
                          repeat: Infinity,
                          repeatDelay: 2,
                          duration: 0.5,
                        }}
                      >
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </motion.div>
                    )}
                  </CardTitle>
                  <CardDescription>{t(plan.descriptionKey)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="mb-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500">
                      {plan.price}
                    </span>
                  </motion.div>
                  <ul className="space-y-2 mt-4">
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{t(feature)}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          ref={ctaRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            whileHover={selectedPlan ? { scale: 1.05 } : {}}
            whileTap={selectedPlan ? { scale: 0.95 } : {}}
          >
            <Button
              size="lg"
              onClick={handlePayment}
              disabled={!selectedPlan || isProcessing}
              className={`px-8 transition-all ${
                selectedPlan
                  ? "bg-gradient-to-r from-primary via-blue-500 to-cyan-500 shadow-lg hover:shadow-primary/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("payment.processing")}
                </>
              ) : selectedPlan ? (
                t("payment.buy.now")
              ) : (
                t("payment.select.first")
              )}
            </Button>
          </motion.div>

          <motion.p
            className="mt-4 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {t("payment.support.message")}
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}
