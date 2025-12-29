// components/client/job-details.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
  ChevronRight,
  ExternalLink,
  FileText,
  Edit,
  Share2,
  Bookmark,
  Flag,
  MoreVertical,
  PiggyBank,
  ArrowLeft,
  User,
  Shield,
  Home,
} from "lucide-react";
import Link from "next/link";
import type { Job } from "@/lib/types";
import { TrustBadges } from "@/components/worker/trust-badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface JobDetailsProps {
  job: Job & {
    metrics?: {
      applicants?: number | null;
      completionProgress?: number | null;
    };
  };
  worker: any | null;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  open: {
    label: "Open for Bids",
    color: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white",
    icon: Users,
  },
  assigned: {
    label: "Assigned",
    color: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white",
    icon: Users,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-gradient-to-r from-amber-500 to-orange-600 text-white",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gradient-to-r from-gray-500 to-slate-600 text-white",
    icon: AlertCircle,
  },
};

const urgencyConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  low: {
    label: "Low Priority",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Calendar,
  },
  medium: {
    label: "Standard",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Calendar,
  },
  high: {
    label: "Urgent",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Zap,
  },
  emergency: {
    label: "Emergency",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
  },
};

export function JobDetails({ job, worker }: JobDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const status = job?.status ?? "open";
  const urgency = job?.urgency ?? "medium";
  const StatusIcon = statusConfig[status]?.icon || Users;
  const UrgencyIcon = urgencyConfig[urgency]?.icon || Calendar;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const minBudget = job?.budget_min_ngn ?? null;
  const maxBudget = job?.budget_max_ngn ?? null;
  const hasBudget = minBudget != null || maxBudget != null;

  const formatCurrency = (amount: number | null) => {
    if (amount == null) return null;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const budgetDisplay = () => {
    if (!hasBudget) return { text: "Budget not set", range: false };
    if (minBudget === maxBudget)
      return { text: formatCurrency(minBudget), range: false };
    return {
      text: `${formatCurrency(minBudget)} - ${formatCurrency(maxBudget)}`,
      range: true,
    };
  };

  const budget = budgetDisplay();

  // metrics: prefer parent-injected metrics, else fall back to job columns (snake_case defensive) or zero
  const metrics = {
    applicants: job.metrics?.applicants ?? (job as any).applicants_count ?? 0,
    completionProgress:
      job.metrics?.completionProgress ??
      (job as any).completion_progress ??
      (job.status === "completed"
        ? 100
        : job.status === "in_progress"
        ? 50
        : job.status === "assigned"
        ? 25
        : 0),
  };

  const ratingDisplay =
    worker && worker.rating !== undefined && worker.rating !== null
      ? Number(worker.rating).toFixed(1)
      : "N/A";

  const responseRateDisplay =
    worker &&
    worker.response_rate !== undefined &&
    worker.response_rate !== null
      ? `${worker.response_rate}%`
      : "—";
  const onTimeRateDisplay =
    worker && worker.on_time_rate !== undefined && worker.on_time_rate !== null
      ? `${worker.on_time_rate}%`
      : "—";
  const repeatClientsDisplay =
    worker &&
    worker.repeat_clients !== undefined &&
    worker.repeat_clients !== null
      ? `${worker.repeat_clients}%`
      : "—";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 },
    },
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/20 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-16 gap-4 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-2 hover:bg-slate-100"
              >
                <Link href="/client/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>

              <div className="hidden sm:flex items-center gap-1 text-sm text-slate-500 flex-wrap">
                <Home className="h-4 w-4" />
                <ChevronRight className="h-3 w-3" />
                <span>Jobs</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-slate-900 truncate max-w-xs">
                  {job?.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="gap-2"
              >
                <Bookmark
                  className={cn(
                    "h-4 w-4",
                    isBookmarked && "fill-blue-500 text-blue-500"
                  )}
                />
                {isBookmarked ? "Saved" : "Save"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/client/jobs/${job.id}/edit`}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Job
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Job
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ChevronRight className="mr-2 h-4 w-4" />
                    View Analytics
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Flag className="mr-2 h-4 w-4" />
                    Report Issue
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Job Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge
                  className={`${statusConfig[status]?.color} px-3 py-1.5 border-0 font-semibold`}
                >
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {statusConfig[status]?.label}
                </Badge>

                <Badge
                  variant="outline"
                  className={`${urgencyConfig[urgency]?.color} border font-medium`}
                >
                  <UrgencyIcon className="h-3 w-3 mr-1" />
                  {urgencyConfig[urgency]?.label}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-4">
                {job?.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Posted {formatDate(job?.created_at)}</span>
                </div>

                <div className="w-1 h-1 rounded-full bg-slate-300" />

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>{metrics.applicants ?? 0} applicants</span>
                </div>
              </div>
            </div>

            {hasBudget && (
              <motion.div
                variants={itemVariants}
                className="w-full sm:w-64 flex-shrink-0"
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                        <PiggyBank className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Budget Range
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {budget.text}
                        </p>
                      </div>
                    </div>
                    {budget.range && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Min</span>
                          <span className="text-slate-500">Max</span>
                        </div>
                        <Progress
                          value={metrics.completionProgress ?? 0}
                          className="h-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-3 mb-8"
          >
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg flex-1 sm:flex-auto"
            >
              <Link href={`/client/jobs/${job.id}/match`}>
                <Users className="mr-2 h-4 w-4" />
                View Matches
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button variant="outline" asChild className="flex-1 sm:flex-auto">
              <Link href={`/client/jobs/${job.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </Link>
            </Button>

            <Button variant="outline" asChild className="flex-1 sm:flex-auto">
              <Link href="/client/ai-agent">
                <Zap className="mr-2 h-4 w-4" />
                AI Assistant
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Grid Layout: Main + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs & Overview */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-8 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger
                  value="overview"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md"
                >
                  Overview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Job Description */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Job Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {showFullDescription ||
                        (job?.description?.length ?? 0) <= 500
                          ? job?.description
                          : `${job?.description?.substring(0, 500)}...`}
                      </p>

                      {(job?.description?.length ?? 0) > 500 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowFullDescription(!showFullDescription)
                          }
                          className="mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          {showFullDescription ? "Show less" : "Read more"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Assigned Worker Section */}
            {worker && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle>Assigned Professional</CardTitle>
                          <CardDescription>
                            Your trusted specialist for this project
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
                        <CheckCircle className="h-3 w-3 mr-2" />
                        Active
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                            <AvatarImage
                              src={
                                worker.profile_pictures_urls?.[0] ||
                                worker.profiles?.avatar_url ||
                                ""
                              }
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl">
                              {worker.profiles?.full_name?.[0] ?? "W"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-slate-900 truncate">
                                {worker.profiles?.full_name ?? "Professional"}
                              </h3>
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                              >
                                <Star className="h-3 w-3 mr-1" />
                                Top Rated
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                <span className="font-bold text-slate-900">
                                  {ratingDisplay}
                                </span>
                                <span className="text-sm text-slate-500">
                                  ({worker.total_reviews ?? 0} reviews)
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                <span className="text-sm font-medium text-slate-700">
                                  {worker.completed_jobs ?? 0} jobs
                                </span>
                              </div>
                            </div>

                            <TrustBadges
                              verificationStatus={
                                worker.verification_status || "pending"
                              }
                              rating={worker.rating ?? 0}
                              totalReviews={worker.total_reviews ?? 0}
                              completedJobs={worker.completed_jobs ?? 0}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-auto flex-shrink-0">
                        <Button
                          asChild
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full lg:w-auto"
                        >
                          <Link href={`/worker/public-profile/${worker.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Full Profile
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-200 text-center">
                      <div>
                        <div className="text-3xl font-bold text-emerald-600 mb-1">
                          {worker.completed_jobs ?? 0}
                        </div>
                        <div className="text-sm text-slate-600">Jobs Done</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {responseRateDisplay}
                        </div>
                        <div className="text-sm text-slate-600">
                          Response Rate
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-amber-600 mb-1">
                          {onTimeRateDisplay}
                        </div>
                        <div className="text-sm text-slate-600">On Time</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {repeatClientsDisplay}
                        </div>
                        <div className="text-sm text-slate-600">
                          Repeat Clients
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Job Metrics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">
                        Completion Progress
                      </span>
                      <span className="font-medium">
                        {metrics.completionProgress ?? 0}%
                      </span>
                    </div>
                    <Progress
                      value={metrics.completionProgress ?? 0}
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.applicants ?? 0}
                      </div>
                      <div className="text-xs text-slate-600">Applicants</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50/50">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Need Help?
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">
                      Our support team is here to help with any questions
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Link href={"/contact"}>Contact Support</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
