// components/client/job-applications.tsx - UPDATED
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  Phone,
  Mail,
  Shield,
  TrendingUp,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Award,
  Wrench,
  Car,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  CreditCard,
  User,
} from "lucide-react";
import { useState } from "react";
import { hireWorker } from "@/app/actions/job";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  worker_id: string;
  status: string;
  proposed_amount?: number;
  cover_letter?: string;
  created_at: string;
  worker: {
    id: string;
    user_id: string;
    bio?: string;
    rating: number;
    total_reviews: number;
    completed_jobs: number;
    total_jobs: number;
    verification_status: string;
    skills: string[];
    profile_pictures_urls?: string[];
    phone_number?: string;
    location_city?: string;
    location_area?: string;
    years_experience?: string;
    certifications?: string;
    available_days?: string[];
    available_times?: string;
    transportation?: string;
    tools_equipment?: string;
    hourly_rate_ngn?: number;
    facebook_url?: string;
    twitter_url?: string;
    instagram_url?: string;
    tiktok_url?: string;
    linkedin_url?: string;
    profiles: {
      full_name: string;
      avatar_url?: string;
      email: string;
    };
  };
}

interface JobApplicationsProps {
  job: {
    id: string;
    title: string;
    budget_min_ngn?: number;
    budget_max_ngn?: number;
  };
  applications: Application[];
}

export function JobApplications({ job, applications }: JobApplicationsProps) {
  const router = useRouter();
  const [selectedWorker, setSelectedWorker] = useState<Application | null>(
    null
  );
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [negotiateDialogOpen, setNegotiateDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>(""); 
  const [finalAmount, setFinalAmount] = useState("");
  const [isHiring, setIsHiring] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (appId: string) => {
    setExpandedProfiles((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  };

  const getFirstName = (fullName?: string) =>
    fullName && fullName.trim() ? fullName.trim().split(/\s+/)[0] : "Worker";

  const handleHire = async () => {
    if (!selectedWorker) return;
  
    if (!scheduledDate) {
      toast.error("Please choose a scheduled date & time");
      return;
    }
  
    setIsHiring(true);
    try {
      const amount = parseInt(finalAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }
  
      // convert datetime-local value to ISO string for the server
      const scheduledIso = new Date(scheduledDate).toISOString();
  
      // hireWorker signature now expects scheduledDate (ISO)
      await hireWorker(job.id, selectedWorker.worker.user_id, amount, scheduledIso);
  
      toast.success("Worker selected! Redirecting to secure payment...");
      setHireDialogOpen(false);
  
      // redirect
      setTimeout(() => {
        router.push(`/client/jobs/${job.id}/payment`);
      }, 1500);
  
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to hire worker");
    } finally {
      setIsHiring(false);
    }
  };
  

  const handleSendMessage = async (workerId: string) => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      toast.success("Message sent successfully");
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Negotiable";
    return `₦${amount.toLocaleString()}`;
  };

  const SocialLinks = ({ worker }: { worker: Application["worker"] }) => {
    const socials = [
      {
        url: worker.linkedin_url,
        icon: Linkedin,
        name: "LinkedIn",
        color: "text-blue-600",
      },
      {
        url: worker.facebook_url,
        icon: Facebook,
        name: "Facebook",
        color: "text-blue-700",
      },
      {
        url: worker.twitter_url,
        icon: Twitter,
        name: "Twitter",
        color: "text-sky-500",
      },
      {
        url: worker.instagram_url,
        icon: Instagram,
        name: "Instagram",
        color: "text-pink-600",
      },
      {
        url: worker.tiktok_url,
        icon: () => (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        ),
        name: "TikTok",
        color: "text-black",
      },
    ].filter((s) => s.url);

    if (socials.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {socials.map((social, idx) => (
          <Button key={idx} variant="outline" size="sm" asChild className="h-8">
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              <social.icon className={`h-4 w-4 ${social.color}`} />
              <span className="text-xs">{social.name}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            {applications.length}{" "}
            {applications.length === 1 ? "application" : "applications"}{" "}
            received
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-4">
              No workers have applied for this task yet. Try promoting it or
              adjust the budget.
            </p>
            <Button variant="outline">Promote Task</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => {
            const firstName = getFirstName(
              application.worker.profiles.full_name
            );
            const isExpanded = expandedProfiles.has(application.id);
            const isPending =
              application.status === "pending" ||
              application.status === "applied";
            const isHired =
              application.status === "hired" ||
              application.status === "accepted";

            return (
              <Card
                key={application.id}
                className="hover:shadow-lg transition-shadow overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Header Section */}
                  <div className="p-6 pb-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Worker Basic Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <Avatar
                            className="h-20 w-20 cursor-pointer hover:opacity-80 transition ring-2 ring-primary/10"
                            onClick={() =>
                              setImagePreview(
                                application.worker.profile_pictures_urls?.[0] ||
                                  application.worker.profiles.avatar_url ||
                                  null
                              )
                            }
                          >
                            <AvatarImage
                              src={
                                application.worker.profile_pictures_urls?.[0] ||
                                application.worker.profiles.avatar_url
                              }
                            />
                            <AvatarFallback className="text-lg">
                              {application.worker.profiles.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between flex-wrap gap-2">
                              <div>
                                <h3 className="text-xl font-bold">
                                  {application.worker.profiles.full_name}
                                </h3>

                                {/* Location */}
                                {(application.worker.location_city ||
                                  application.worker.location_area) && (
                                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>
                                      {application.worker.location_area &&
                                        `${application.worker.location_area}, `}
                                      {application.worker.location_city}
                                    </span>
                                  </div>
                                )}

                                {/* Rating & Verification */}
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                    <span className="font-semibold text-sm">
                                      {application.worker.rating?.toFixed(1) ||
                                        "N/A"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      ({application.worker.total_reviews || 0})
                                    </span>
                                  </div>

                                  {application.worker.verification_status ===
                                    "verified" && (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-200"
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}

                                  {application.worker.years_experience && (
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      <Briefcase className="h-3 w-3 mr-1" />
                                      {application.worker.years_experience}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* FIXED: Badge color for different statuses */}
                              <Badge
                                className={
                                  application.status === "pending" ||
                                  application.status === "applied"
                                    ? "bg-blue-100 text-blue-800"
                                    : application.status === "hired" ||
                                      application.status === "accepted"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {application.status}
                              </Badge>
                            </div>

                            {/* Bio */}
                            {application.worker.bio && (
                              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                                {application.worker.bio}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {application.worker.completed_jobs || 0}
                            </div>
                            <div className="text-xs text-blue-700 font-medium">
                              Completed
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {application.worker.rating >= 4.5
                                ? "95%"
                                : application.worker.rating >= 4.0
                                ? "85%"
                                : "75%"}
                            </div>
                            <div className="text-xs text-green-700 font-medium">
                              Success Rate
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {application.proposed_amount
                                ? `₦${(
                                    application.proposed_amount / 1000
                                  ).toFixed(0)}k`
                                : "Flexible"}
                            </div>
                            <div className="text-xs text-purple-700 font-medium">
                              Proposed
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-amber-600">
                              {application.worker.hourly_rate_ngn
                                ? `₦${(
                                    application.worker.hourly_rate_ngn / 1000
                                  ).toFixed(0)}k`
                                : "N/A"}
                            </div>
                            <div className="text-xs text-amber-700 font-medium">
                              Hourly Rate
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="md:w-56 space-y-2.5">
                        {isPending ? (
                          <>
                            <Button
                              type="button" 
                              className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 cursor-pointer"
                              onClick={() => {
                                setSelectedWorker(application);
                                setFinalAmount(
                                  application.proposed_amount?.toString() || ""
                                );
                                setHireDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Hire {firstName}
                            </Button>

                            <Button
                              variant="outline"
                              className="w-full cursor-pointer"
                              onClick={() => {
                                setSelectedWorker(application);
                                setNegotiateDialogOpen(true);
                              }}
                            >
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Negotiate Price
                            </Button>
                          </>
                        ) : isHired ? (
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Hired
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" disabled>
                            {application.status}
                          </Button>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            asChild
                          >
                            <a href={`tel:${application.worker.phone_number}`}>
                              <Phone className="mr-1.5 h-3.5 w-3.5" />
                              Call
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            asChild
                          >
                            <a
                              href={`mailto:${application.worker.profiles.email}`}
                            >
                              <Mail className="mr-1.5 h-3.5 w-3.5" />
                              Email
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Detailed Profile (remains the same) */}
                  <div className="border-t">
                    <button
                      onClick={() => toggleExpanded(application.id)}
                      className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-primary">
                        {isExpanded ? "Hide" : "View"} Full Profile
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-primary" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-primary" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 space-y-6 bg-gray-50/50">
                        <Tabs defaultValue="details" className="w-full">
                          <TabsList className="grid grid-cols-3 gap-2">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="skills">
                              Skills & Experience
                            </TabsTrigger>
                            <TabsTrigger value="availability">
                              Availability
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent
                            value="details"
                            className="space-y-4 mt-4"
                          >
                            {/* Skills */}
                            {application.worker.skills &&
                              application.worker.skills.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2.5 flex items-center gap-2">
                                    <Award className="h-4 w-4 text-primary" />
                                    Skills
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {application.worker.skills.map(
                                      (skill, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="px-3 py-1"
                                        >
                                          {skill}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Tools & Equipment */}
                            {application.worker.tools_equipment && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <Wrench className="h-4 w-4 text-primary" />
                                  Tools & Equipment
                                </h4>
                                <p className="text-sm text-muted-foreground bg-white p-3 rounded-lg border">
                                  {application.worker.tools_equipment}
                                </p>
                              </div>
                            )}

                            {/* Transportation */}
                            {application.worker.transportation && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <Car className="h-4 w-4 text-primary" />
                                  Transportation
                                </h4>
                                <Badge variant="outline" className="capitalize">
                                  {application.worker.transportation}
                                </Badge>
                              </div>
                            )}

                            {/* Social Media */}
                            <div>
                              <h4 className="text-sm font-semibold mb-2.5">
                                Connect
                              </h4>
                              <SocialLinks worker={application.worker} />
                            </div>
                          </TabsContent>

                          <TabsContent
                            value="skills"
                            className="space-y-4 mt-4"
                          >
                            {/* Certifications */}
                            {application.worker.certifications && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <Award className="h-4 w-4 text-primary" />
                                  Certifications
                                </h4>
                                <p className="text-sm text-muted-foreground bg-white p-3 rounded-lg border">
                                  {application.worker.certifications}
                                </p>
                              </div>
                            )}

                            {/* Experience Stats */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-lg border">
                                <div className="text-sm text-muted-foreground mb-1">
                                  Total Jobs
                                </div>
                                <div className="text-xl font-bold text-primary">
                                  {application.worker.total_jobs || 0}
                                </div>
                              </div>
                              <div className="bg-white p-4 rounded-lg border">
                                <div className="text-sm text-muted-foreground mb-1">
                                  Experience
                                </div>
                                <div className="text-xl font-bold text-primary">
                                  {application.worker.years_experience || "N/A"}
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent
                            value="availability"
                            className="space-y-4 mt-4"
                          >
                            {/* Available Days */}
                            {application.worker.available_days &&
                              application.worker.available_days.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2.5 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Available Days
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {application.worker.available_days.map(
                                      (day, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="capitalize px-3 py-1"
                                        >
                                          {day}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Available Times */}
                            {application.worker.available_times && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  Available Times
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="capitalize px-3 py-1.5"
                                >
                                  {application.worker.available_times}
                                </Badge>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>

                        {/* Cover Letter */}
                        {application.cover_letter && (
                          <div className="pt-4 border-t">
                            <h4 className="text-sm font-semibold mb-2.5 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              Cover Letter
                            </h4>
                            <p className="text-sm text-muted-foreground bg-white p-4 rounded-lg border leading-relaxed">
                              {application.cover_letter}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Image Preview Dialog (remains the same) */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogPortal>
          <DialogOverlay className="bg-black/90" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh] p-0 focus:outline-none">
            <DialogHeader className="sr-only">
              <DialogTitle>Worker Profile Image</DialogTitle>
              <DialogDescription>
                Full size worker profile image
              </DialogDescription>
            </DialogHeader>

            {imagePreview && (
              <div className="relative w-full h-full flex items-center justify-center bg-transparent">
                <img
                  src={imagePreview}
                  alt="Worker profile preview"
                  className="max-w-full max-h-full object-contain"
                  onError={() => {
                    toast.error("Failed to load image");
                    setImagePreview(null);
                  }}
                />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
                  aria-label="Close"
                >
                  <XCircle className="h-8 w-8 text-white" />
                </button>
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Hire Dialog */}
      <Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
        <DialogContent className="max-w-xl w-[min(720px,95vw)] !fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-auto z-[9999]">
          <DialogHeader>
            <DialogTitle>
              Hire {selectedWorker?.worker.profiles.full_name}
            </DialogTitle>
            <DialogDescription>
              Secure your booking with escrow protection
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Escrow Protection Notice */}
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm mb-1">
                    Escrow Protection
                  </p>
                  <p className="text-xs text-blue-700">
                    Your payment will be held securely by Choriad until the job
                    is completed.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold mb-2">Payment Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Worker's Proposed Rate:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedWorker?.proposed_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Budget:</span>
                  <span className="font-semibold">
                    {job.budget_min_ngn
                      ? `₦${job.budget_min_ngn.toLocaleString()} - ₦${job.budget_max_ngn?.toLocaleString()}`
                      : "Negotiable"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Platform Fee (15%):</span>
                  <span>
                    {finalAmount
                      ? `₦${Math.round(
                          parseInt(finalAmount) * 0.15
                        ).toLocaleString()}`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalAmount">Agreed Amount (₦) *</Label>
              <Input
                id="finalAmount"
                type="number"
                value={finalAmount}
                onChange={(e) => setFinalAmount(e.target.value)}
                placeholder="Enter final agreed amount"
                min={job.budget_min_ngn || 0}
                max={job.budget_max_ngn || 10000000}
              />
              <p className="text-xs text-muted-foreground">
                Total you'll pay: ₦
                {finalAmount
                  ? (parseInt(finalAmount) * 1.15).toLocaleString()
                  : "0"}{" "}
                (including 15% platform fee)
              </p>
            </div>

            {/* Scheduled Date/time */}
<div className="space-y-2">
  <Label htmlFor="scheduledDate">Scheduled Date & Time *</Label>
  <input
    id="scheduledDate"
    type="datetime-local"
    value={scheduledDate}
    onChange={(e) => setScheduledDate(e.target.value)}
    className="w-full rounded-md border p-2 text-sm"
    min={new Date().toISOString().slice(0,16)}
  />
  <p className="text-xs text-muted-foreground">
    When should the worker start? (Local time)
  </p>
</div>

            {/* How It Works */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-900 text-sm mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                How Escrow Works
              </h4>
              <ol className="text-xs text-emerald-800 space-y-1.5 ml-4 list-decimal">
                <li>Your payment is held securely in escrow</li>
                <li>Worker completes the job</li>
                <li>You review and approve the work</li>
                <li>Payment is released to worker's bank account</li>
              </ol>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setHireDialogOpen(false)}
              disabled={isHiring}
            >
              Cancel
            </Button>
            <Button
              onClick={handleHire}
              disabled={isHiring || !finalAmount || parseInt(finalAmount) <= 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isHiring ? (
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 animate-pulse" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2 cursor-pointer">
                  <Lock className="h-4 w-4" />
                  Proceed to Secure Payment
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Negotiate Dialog */}
      <Dialog open={negotiateDialogOpen} onOpenChange={setNegotiateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Negotiate with {selectedWorker?.worker.profiles.full_name}
            </DialogTitle>
            <DialogDescription>
              Send a message to discuss terms and pricing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, I'd like to discuss the budget. Can we agree on ₦..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="counterOffer">Counter Offer (₦)</Label>
              <Input
                id="counterOffer"
                type="number"
                placeholder="Enter your counter offer"
                min={job.budget_min_ngn || 0}
                max={job.budget_max_ngn || 1000000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNegotiateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedWorker &&
                handleSendMessage(selectedWorker.worker.user_id)
              }
              disabled={!message.trim()}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
