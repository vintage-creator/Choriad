// components/worker/job-detail-view.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Calendar,
  PiggyBank,
  Clock,
  Shield,
  User,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Star,
  Mail,
  Building
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyForJob } from "@/app/actions/application";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JobDetailViewProps {
  job: {
    id: string;
    title: string;
    description: string;
    category: string;
    location_city: string;
    location_area?: string;
    location_address?: string;
    budget_min_ngn?: number;
    budget_max_ngn?: number;
    urgency: string;
    created_at: string;
    status: string;
    skills_required?: string[];
    client?: {
      id: string;
      full_name?: string;
      avatar_url?: string;
      phone?: string;
      email?: string;
      created_at?: string;
      profiles?: {
        rating?: number;
        total_reviews?: number;
        completed_jobs?: number;
      };
    } | null;
  };
  hasApplied: boolean;
  workerSkills: string[];
}

export function JobDetailView({ job, hasApplied, workerSkills }: JobDetailViewProps) {
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [proposedAmount, setProposedAmount] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const calculateMatchScore = (requiredSkills: string[], workerSkills: string[]) => {
    if (!requiredSkills.length || !workerSkills.length) return 0;
    const matchingSkills = requiredSkills.filter(skill => workerSkills.includes(skill)).length;
    return Math.round((matchingSkills / requiredSkills.length) * 100);
  };

  const matchScore = calculateMatchScore(job.skills_required || [], workerSkills);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const amount = proposedAmount ? parseInt(proposedAmount) : undefined;

      if (amount && job.budget_max_ngn && amount > job.budget_max_ngn) {
        throw new Error("Your proposed amount exceeds the maximum budget");
      }
      if (amount && job.budget_min_ngn && amount < job.budget_min_ngn) {
        throw new Error("Your proposed amount is below the minimum budget");
      }

      await applyForJob(job.id, amount, coverLetter);
      toast.success("Application submitted successfully!");
      setApplyDialogOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply for job");
    } finally {
      setIsApplying(false);
    }
  };

  const handleQuickApply = async () => {
    setIsApplying(true);
    try {
      await applyForJob(job.id, job.budget_min_ngn, "I'm interested in this job and ready to start immediately.");
      toast.success("Quick application submitted!");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply");
    } finally {
      setIsApplying(false);
    }
  };

  const clientInitial = job.client?.full_name?.charAt(0) || "?";

  return (
    <div className="space-y-6">
      {/* Job Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-blue-100 text-blue-800">{matchScore}% Match</Badge>
            <Badge className={
              job.urgency === "urgent" ? "bg-red-100 text-red-800" :
              job.urgency === "high" ? "bg-orange-100 text-orange-800" :
              "bg-green-100 text-green-800"
            }>
              {job.urgency}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {!hasApplied ? (
            <>
              <Button onClick={handleQuickApply} disabled={isApplying} variant="outline">
                {isApplying ? "Applying..." : "Quick Apply"}
              </Button>
              <Button onClick={() => setApplyDialogOpen(true)} disabled={isApplying}>
                <TrendingUp className="mr-2 h-4 w-4" /> Apply with Proposal
              </Button>
            </>
          ) : (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="mr-1 h-3 w-3" /> Applied
            </Badge>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Job Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Job Description</CardTitle></CardHeader>
            <CardContent><p className="text-gray-700 whitespace-pre-line">{job.description}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Requirements & Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(job.skills_required || []).map((skill, index) => (
                  <Badge
                    key={index}
                    variant={workerSkills.includes(skill) ? "default" : "outline"}
                    className={workerSkills.includes(skill) ? "bg-green-100 text-green-800 border-green-200" : ""}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          {job.client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Client Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    {job.client.avatar_url ? (
                      <AvatarImage src={job.client.avatar_url} />
                    ) : (
                      <AvatarFallback>{clientInitial}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{job.client.full_name || "Unknown"}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {job.client.created_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Member since {new Date(job.client.created_at).getFullYear()}
                        </div>
                      )}
                      {job.client.profiles?.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500" />
                          {job.client.profiles.rating.toFixed(1)} rating
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      {job.client.email && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${job.client.email}`}>
                            <Mail className="mr-2 h-4 w-4" /> Send Email
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" disabled>
                        <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Job Overview */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Job Overview</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><PiggyBank className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">{job.budget_min_ngn ? `₦${job.budget_min_ngn.toLocaleString()} - ₦${job.budget_max_ngn?.toLocaleString()}` : "Negotiable"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg"><MapPin className="h-5 w-5 text-green-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold">{job.location_city}{job.location_area && `, ${job.location_area}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg"><Clock className="h-5 w-5 text-amber-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Urgency</p>
                  <p className="font-semibold capitalize">{job.urgency}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg"><Building className="h-5 w-5 text-purple-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold capitalize">{job.category.replace("_", " ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Tips */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Safety Tips</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Payment is held securely by Choriad until job completion</p>
              <p>• Never pay outside the platform</p>
              <p>• Meet in public places for initial discussions</p>
              <p>• Verify client identity before starting work</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Job</DialogTitle>
            <DialogDescription>Submit your proposal for {job.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proposedAmount">Proposed Amount (₦)</Label>
              <Input
                id="proposedAmount"
                type="number"
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
                placeholder={job.budget_min_ngn ? `Min: ₦${job.budget_min_ngn.toLocaleString()}` : "Enter your proposed amount"}
                min={job.budget_min_ngn || 0}
                max={job.budget_max_ngn || 1000000}
              />
              <p className="text-xs text-muted-foreground">
                Client budget: {job.budget_min_ngn ? `₦${job.budget_min_ngn.toLocaleString()} - ₦${job.budget_max_ngn?.toLocaleString()}` : "Negotiable"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Introduce yourself and explain why you're the best fit for this job..."
                rows={4}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p className="font-semibold">Payment Terms:</p>
              <ul className="mt-1 space-y-1">
                <li>• 15% platform fee deducted from final amount</li>
                <li>• Payment held by Choriad until job completion</li>
                <li>• Funds released within 24 hours of client approval</li>
                <li>• Bank transfer to your verified account</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialogOpen(false)} disabled={isApplying}>Cancel</Button>
            <Button onClick={handleApply} disabled={isApplying || (!!job.budget_min_ngn && !proposedAmount)}>
              {isApplying ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
