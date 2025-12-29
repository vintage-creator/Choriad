// app/earnings-calculator/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/Logo";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Sparkles,
  BarChart3,
  PieChart,
  Clock,
  Repeat,
  ArrowRight,
  X,
  Info,
  RefreshCw,
  Download,
  Share2,
  Star,
  Trophy,
  Rocket,
  Shield,
  CheckCircle,
  Sparkle,
  Home,
  ArrowLeft,
  ChevronLeft,
  Mail,
  Phone,
  Users,
  Award,
  CreditCard,
  Building,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CalculatorData {
  jobRate: number;
  jobsPerMonth: number;
  months: number;
  platformFee: number; // 15%
  providerPayout: number; // 85%
}

export default function EarningsCalculatorPage() {
  const router = useRouter();
  const [data, setData] = useState<CalculatorData>({
    jobRate: 50000,
    jobsPerMonth: 8,
    months: 3,
    platformFee: 15,
    providerPayout: 85,
  });

  const [savedScenarios, setSavedScenarios] = useState<Array<{
    name: string;
    data: CalculatorData;
    timestamp: Date;
  }>>([]);

  const [activeTab, setActiveTab] = useState("basic");
  const [showAnimation, setShowAnimation] = useState(false);

  // Load saved scenarios from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('earningsCalculatorScenarios');
    if (saved) {
      try {
        setSavedScenarios(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved scenarios:', e);
      }
    }
  }, []);

  // Save scenarios to localStorage
  useEffect(() => {
    if (savedScenarios.length > 0) {
      localStorage.setItem('earningsCalculatorScenarios', JSON.stringify(savedScenarios));
    }
  }, [savedScenarios]);

  // Calculate earnings
  const calculateEarnings = () => {
    const monthlyEarnings = data.jobRate * data.jobsPerMonth;
    const monthlyAfterFee = monthlyEarnings * (data.providerPayout / 100);
    const platformCutMonthly = monthlyEarnings * (data.platformFee / 100);
    
    const totalEarnings = monthlyEarnings * data.months;
    const totalAfterFee = monthlyAfterFee * data.months;
    const totalPlatformCut = platformCutMonthly * data.months;

    return {
      monthlyEarnings,
      monthlyAfterFee,
      platformCutMonthly,
      totalEarnings,
      totalAfterFee,
      totalPlatformCut,
      avgDailyEarnings: monthlyAfterFee / 30,
    };
  };

  const earnings = calculateEarnings();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Predefined scenarios
  const scenarios = [
    { 
      name: "Casual Worker", 
      icon: Clock,
      description: "Part-time gigs",
      data: { jobRate: 15000, jobsPerMonth: 4, months: 1 }
    },
    { 
      name: "Regular Pro", 
      icon: TrendingUp,
      description: "Full-time professional",
      data: { jobRate: 50000, jobsPerMonth: 8, months: 3 }
    },
    { 
      name: "Premium Expert", 
      icon: Trophy,
      description: "High-end specialist",
      data: { jobRate: 150000, jobsPerMonth: 6, months: 6 }
    },
    { 
      name: "Quick Boost", 
      icon: Zap,
      description: "Short-term intensive",
      data: { jobRate: 30000, jobsPerMonth: 15, months: 1 }
    },
  ];

  const handleApplyScenario = (scenario: typeof scenarios[0]) => {
    setData(prev => ({
      ...prev,
      ...scenario.data
    }));
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 1000);
  };

  const handleSaveScenario = () => {
    const name = prompt("Name this scenario:");
    if (name && name.trim()) {
      const newScenario = {
        name: name.trim(),
        data: { ...data },
        timestamp: new Date()
      };
      setSavedScenarios(prev => [...prev, newScenario].slice(0, 5)); // Keep only last 5
    }
  };

  const handleReset = () => {
    setData({
      jobRate: 50000,
      jobsPerMonth: 8,
      months: 3,
      platformFee: 15,
      providerPayout: 85,
    });
  };

  const handleShare = () => {
    const text = `I calculated my potential earnings with Choriad: ${formatCurrency(earnings.monthlyAfterFee)}/month! Try it: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Choriad Earnings Calculation',
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Calculation copied to clipboard!');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 },
    },
  };

  const numberVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.5,
        repeat: 1,
      },
    },
  };

  const combinedVariants = {
    ...itemVariants,
    ...numberVariants,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      {/* Header Navigation */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-2 hover:bg-slate-100"
              >
                <Link href="/">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                <Home className="h-4 w-4" />
                <span>/</span>
                <span className="font-medium text-slate-900">Earnings Calculator</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => router.push('/auth/sign-up')}
              >
                Start Earning
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
              <Calculator className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Earnings Calculator
            </h1>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Discover your earning potential as a service provider on Choriad. 
              Keep 85% of every payment - we only take 15% as platform fee.
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <CheckCircle className="h-4 w-4 text-green-300" />
                <span>85% Payout to Providers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <CheckCircle className="h-4 w-4 text-green-300" />
                <span>Transparent Fee Structure</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <CheckCircle className="h-4 w-4 text-green-300" />
                <span>Real-time Calculations</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Calculator Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Inputs */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="basic" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
                  <Calculator className="h-4 w-4 mr-2" />
                  Basic Calculator
                </TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Advanced Projections
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                {/* Job Rate Input */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-500" />
                      Average Job Rate
                    </CardTitle>
                    <CardDescription>
                      How much do you typically charge per job?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">
                          ₦{data.jobRate.toLocaleString()}
                        </Label>
                        <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                          {formatCurrency(data.jobRate)}
                        </Badge>
                      </div>
                      <Slider
                        value={[data.jobRate]}
                        min={5000}
                        max={500000}
                        step={5000}
                        onValueChange={([value]) => setData(prev => ({ ...prev, jobRate: value }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>₦5,000</span>
                        <span>₦500,000</span>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="grid grid-cols-4 gap-2">
                      {[15000, 30000, 75000, 150000].map((rate) => (
                        <Button
                          key={rate}
                          variant="outline"
                          size="sm"
                          onClick={() => setData(prev => ({ ...prev, jobRate: rate }))}
                          className={cn(
                            "hover:border-blue-300 hover:bg-blue-50",
                            data.jobRate === rate && "border-blue-500 bg-blue-50 text-blue-700"
                          )}
                        >
                          ₦{rate.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Jobs Per Month */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-emerald-500" />
                      Jobs Per Month
                    </CardTitle>
                    <CardDescription>
                      Average number of jobs you complete each month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">
                          {data.jobsPerMonth} jobs/month
                        </Label>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                          {data.jobsPerMonth * data.months} total jobs
                        </Badge>
                      </div>
                      <Slider
                        value={[data.jobsPerMonth]}
                        min={1}
                        max={30}
                        step={1}
                        onValueChange={([value]) => setData(prev => ({ ...prev, jobsPerMonth: value }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>1 job</span>
                        <span>30 jobs</span>
                      </div>
                    </div>

                    {/* Frequency Indicators */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className={cn(
                        "text-center p-3 rounded-lg border",
                        data.jobsPerMonth <= 5
                          ? "bg-blue-50 border-blue-200"
                          : "bg-slate-50 border-slate-200"
                      )}>
                        <div className="text-sm font-medium">Casual</div>
                        <div className="text-xs text-slate-500">1-5 jobs</div>
                      </div>
                      <div className={cn(
                        "text-center p-3 rounded-lg border",
                        data.jobsPerMonth > 5 && data.jobsPerMonth <= 15
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-slate-50 border-slate-200"
                      )}>
                        <div className="text-sm font-medium">Regular</div>
                        <div className="text-xs text-slate-500">6-15 jobs</div>
                      </div>
                      <div className={cn(
                        "text-center p-3 rounded-lg border",
                        data.jobsPerMonth > 15
                          ? "bg-purple-50 border-purple-200"
                          : "bg-slate-50 border-slate-200"
                      )}>
                        <div className="text-sm font-medium">Full-time</div>
                        <div className="text-xs text-slate-500">16+ jobs</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Time Period */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-amber-500" />
                      Time Period
                    </CardTitle>
                    <CardDescription>
                      Project your earnings over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">
                          {data.months} {data.months === 1 ? 'month' : 'months'}
                        </Label>
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          {data.months >= 12 ? `${Math.floor(data.months/12)} years` : ''}
                        </Badge>
                      </div>
                      <Slider
                        value={[data.months]}
                        min={1}
                        max={36}
                        step={1}
                        onValueChange={([value]) => setData(prev => ({ ...prev, months: value }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>1 month</span>
                        <span>3 years</span>
                      </div>
                    </div>

                    {/* Quick Periods */}
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 3, 6, 12].map((months) => (
                        <Button
                          key={months}
                          variant="outline"
                          size="sm"
                          onClick={() => setData(prev => ({ ...prev, months }))}
                          className={cn(
                            "hover:border-amber-300 hover:bg-amber-50",
                            data.months === months && "border-amber-500 bg-amber-50 text-amber-700"
                          )}
                        >
                          {months} {months === 1 ? 'month' : 'months'}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6 mt-6">
                {/* Advanced Projections Card */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      Growth Projections
                    </CardTitle>
                    <CardDescription>
                      See how your earnings can grow with experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Growth Rate */}
                      <div className="space-y-4">
                        <Label>Monthly Growth Rate (Job Rate)</Label>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Slider value={[5]} min={0} max={20} step={1} />
                          </div>
                          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                            5% monthly
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          As you gain experience and ratings, you can increase your rates
                        </p>
                      </div>

                      {/* Repeat Clients */}
                      <div className="space-y-4">
                        <Label>Repeat Client Percentage</Label>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Slider value={[30]} min={0} max={80} step={5} />
                          </div>
                          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                            30% repeat clients
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          Repeat clients mean less marketing effort and steady income
                        </p>
                      </div>

                      {/* Projection Chart */}
                      <div className="rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">6-Month Projection</h4>
                          <Sparkle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                          {[1, 2, 3, 4, 5, 6].map((month) => (
                            <div key={month} className="flex items-center gap-3">
                              <div className="w-16 text-sm text-slate-500">
                                Month {month}
                              </div>
                              <div className="flex-1">
                                <Progress 
                                  value={Math.min(100, 20 + (month * 13))} 
                                  className="h-3 bg-slate-100"
                                />
                              </div>
                              <div className="w-24 text-right font-medium">
                                ₦{((data.jobRate * 1.05 ** (month - 1)) * data.jobsPerMonth * 0.85).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Quick Scenarios */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-red-500" />
                  Quick Scenarios
                </CardTitle>
                <CardDescription>
                  Try these common provider scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {scenarios.map((scenario) => {
                    const Icon = scenario.icon;
                    const isActive = 
                      data.jobRate === scenario.data.jobRate &&
                      data.jobsPerMonth === scenario.data.jobsPerMonth &&
                      data.months === scenario.data.months;

                    return (
                      <Button
                        key={scenario.name}
                        variant="outline"
                        className={cn(
                          "h-auto flex-col gap-3 p-4 hover:scale-[1.02] transition-all",
                          isActive && "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        )}
                        onClick={() => handleApplyScenario(scenario)}
                      >
                        <div className={cn(
                          "p-2 rounded-lg",
                          isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-medium">{scenario.name}</div>
                        <div className="text-xs text-slate-500 text-center">
                          {scenario.description}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Ready to Start Earning?</h3>
                    <p className="text-emerald-100">
                      Join thousands of providers who are already earning on Choriad
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      size="lg" 
                      className="bg-white text-emerald-700 hover:bg-emerald-50"
                      onClick={() => router.push('/auth/sign-up')}
                    >
                      Sign Up Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            {/* Earnings Summary */}
            <motion.div
              variants={combinedVariants}
              animate={showAnimation ? "pulse" : "visible"}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 to-blue-900 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-emerald-300" />
                    Your Earnings Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Monthly Breakdown */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold mb-2">
                        {formatCurrency(earnings.monthlyAfterFee)}
                      </div>
                      <div className="text-sm text-blue-300">
                        Monthly Take-home Pay
                      </div>
                    </div>

                    <Separator className="bg-white/20" />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold">
                          {formatCurrency(earnings.monthlyEarnings)}
                        </div>
                        <div className="text-xs text-blue-300">
                          Monthly Gross
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold">
                          {formatCurrency(earnings.platformCutMonthly)}
                        </div>
                        <div className="text-xs text-blue-300">
                          Platform Fee
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Projection */}
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm">Total {data.months}-Month Earnings</div>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                        {formatCurrency(earnings.totalAfterFee)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-blue-300">
                      <span>After {data.platformFee}% platform fee</span>
                      <span>{data.providerPayout}% to you</span>
                    </div>
                  </div>

                  {/* Daily Average */}
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 text-blue-300" />
                      <span className="text-sm">Daily Average:</span>
                      <span className="font-bold">
                        {formatCurrency(earnings.avgDailyEarnings)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Platform Fee Breakdown */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-emerald-500" />
                    Fee Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Fee Visualization */}
                    <div className="relative h-32">
                      {/* Provider Earnings */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg"
                        style={{ width: `${data.providerPayout}%` }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                          Provider: {data.providerPayout}%
                        </div>
                      </div>
                      {/* Platform Cut */}
                      <div 
                        className="absolute right-0 inset-y-0 bg-gradient-to-r from-slate-400 to-slate-500 rounded-r-lg"
                        style={{ width: `${data.platformFee}%` }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                          Platform: {data.platformFee}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                          <span>Your Earnings</span>
                        </div>
                        <span className="font-bold">
                          {formatCurrency(earnings.totalAfterFee)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-400 to-slate-500" />
                          <span>Platform Fee</span>
                        </div>
                        <span className="font-bold">
                          {formatCurrency(earnings.totalPlatformCut)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tips & Notes */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-800">
                    <Sparkles className="h-5 w-5" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Higher ratings can increase your job rate by 20-50%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Complete your profile verification to get more jobs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Specializing in high-demand categories increases rates</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleSaveScenario}
                >
                  <Download className="h-4 w-4" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleReset}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 gap-2"
                onClick={() => router.push('/auth/sign-up')}
              >
                <Shield className="h-4 w-4" />
                Start Earning Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Saved Scenarios */}
            {savedScenarios.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm">Saved Scenarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {savedScenarios.map((scenario, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                          onClick={() => setData(scenario.data)}
                        >
                          <div>
                            <div className="font-medium text-sm">{scenario.name}</div>
                            <div className="text-xs text-slate-500">
                              {formatCurrency(scenario.data.jobRate * scenario.data.jobsPerMonth * 0.85)}/month
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSavedScenarios(prev => prev.filter((_, i) => i !== idx));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  How is the 85% payout calculated?
                </h3>
                <p className="text-slate-600">
                  You keep 85% of every payment you receive. The 15% platform fee covers payment processing, 
                  customer support, marketing, and platform maintenance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-500" />
                  When do I get paid?
                </h3>
                <p className="text-slate-600">
                  Payments are processed within 24-48 hours after a job is completed and approved by the client. 
                  Funds are transferred directly to your verified bank account.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-500" />
                  Are there any hidden fees?
                </h3>
                <p className="text-slate-600">
                  No hidden fees. The 15% platform fee is the only deduction. There are no setup fees, 
                  subscription fees, or withdrawal fees.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  How do I get more jobs?
                </h3>
                <p className="text-slate-600">
                  Complete your profile verification, maintain high ratings, respond quickly to job requests, 
                  and specialize in high-demand service categories to increase your job opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t bg-slate-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-28 sm:w-36">
                <Logo className="w-72 h-auto text-foreground" />
              </div>
            </Link>
              <h3 className="font-semibold text-lg mb-4">Earnings Calculator</h3>
              <p className="text-slate-600 text-sm">
                A tool to help service providers understand their earning potential on Choriad.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Useful Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/faq" className="text-slate-600 hover:text-blue-600">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-600 hover:text-blue-600">
                    Help & Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>support@choriad.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+234 706 573 7817</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Share This Tool</h3>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} Choriad. All rights reserved.
              <br />
              <span className="text-slate-400">
                This calculator provides estimates only. Actual earnings may vary.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}