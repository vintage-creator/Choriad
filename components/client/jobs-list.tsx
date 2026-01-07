// components/client/jobs-list.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  PiggyBank,
  Sparkles,
  Users,
  Edit,
  Star,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Plus,
  ChevronDown,
  CreditCard,
} from "lucide-react";
import type { Job } from "@/lib/types";
import { useState } from "react";
import { deleteJob, updateJobStatus } from "@/app/actions/job";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface JobsListProps {
  jobs: (Job & { applications?: { count: number }[] })[];
  limit?: number; // NEW: Optional limit for displayed jobs
}

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  assigned:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  in_progress:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

const formatDate = (iso?: string) => {
  if (!iso) return "Unknown date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function JobsList({ jobs, limit }: JobsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAll, setShowAll] = useState(false); // NEW: Toggle for showing all jobs

  const handleDeleteJob = async (jobId: string) => {
    setIsDeleting(true);
    try {
      await deleteJob(jobId);
      toast.success("Task deleted successfully");
      setDeleteDialogOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete task"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = async (jobId: string, status: string) => {
    try {
      await updateJobStatus(jobId, status);
      toast.success(`Task marked as ${status.replace("_", " ")}`);
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      );
    }
  };

  if (jobs.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6 text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-blue-100 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground mb-4">
            You haven&apos;t posted any tasks yet
          </p>
          <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
            <Link href="/client/jobs/new">Post Your First Task</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // NEW: Limit displayed jobs
  const displayLimit = limit && !showAll ? limit : jobs.length;
  const displayedJobs = jobs.slice(0, displayLimit);
  const hasMore = jobs.length > displayLimit;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Your Tasks</h2>
          <p className="text-muted-foreground">
            {jobs.length} total task{jobs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/client/jobs/new" className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {displayedJobs.map((job) => {
          const applicationCount = job.applications?.[0]?.count || 0;
          
          // Check if this job has pending payment
          const isPendingPayment = job.status === "assigned"; // Will be enhanced with booking check

          return (
            <Card
              key={job.id}
              className={`hover:shadow-lg transition-shadow duration-300 ${
                isPendingPayment ? "ring-2 ring-amber-300" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <Badge className={statusColors[job.status]}>
                        {job.status.replace("_", " ")}
                      </Badge>
                      {isPendingPayment && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                          <CreditCard className="w-3 h-3 mr-1" />
                          Payment Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Posted {formatDate(job.created_at)}</span>
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/client/jobs/${job.id}`}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {job.status === "open" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/client/jobs/${job.id}/edit`}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Task
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(job.id, "closed")}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Close Task
                          </DropdownMenuItem>
                        </>
                      )}
                      {job.status === "assigned" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(job.id, "in_progress")
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Start Work
                        </DropdownMenuItem>
                      )}
                      {job.status === "in_progress" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(job.id, "completed")
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                      {job.status === "completed" && (
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/client/bookings?job=${job.id}&action=review`}
                            className="cursor-pointer"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Leave Review
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          setJobToDelete(job.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location_city}
                    {job.location_area && `, ${job.location_area}`}
                  </div>

                  {job.budget_max_ngn && (
                    <div className="flex items-center gap-1">
                      <PiggyBank className="h-4 w-4" />₦
                      {job.budget_min_ngn?.toLocaleString()} - ₦
                      {job.budget_max_ngn.toLocaleString()}
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {job.urgency.replace("_", " ")}
                  </div>

                  {applicationCount > 0 && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Users className="h-4 w-4" />
                      {applicationCount}{" "}
                      {applicationCount === 1 ? "application" : "applications"}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/client/jobs/${job.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>

                  {job.status === "open" && (
                    <>
                      {applicationCount > 0 && (
                        <Button size="sm" asChild variant="secondary">
                          <Link href={`/client/jobs/${job.id}/applications`}>
                            <Users className="mr-2 h-4 w-4" />
                            View Applications ({applicationCount})
                          </Link>
                        </Button>
                      )}
                      <Button size="sm" asChild>
                        <Link href={`/client/jobs/${job.id}/match`}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Find Workers
                        </Link>
                      </Button>
                    </>
                  )}

                  {job.status === "assigned" && (
                    <>
                      {isPendingPayment && (
                        <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700">
                          <Link href="/client/bookings">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Complete Payment
                          </Link>
                        </Button>
                      )}
                      <Button size="sm" asChild variant="secondary">
                        <Link href={`/client/jobs/${job.id}/manage`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Manage Worker
                        </Link>
                      </Button>
                    </>
                  )}

                  {job.status === "in_progress" && (
                    <Button size="sm" asChild variant="secondary">
                      <Link href={`/client/jobs/${job.id}/track`}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Track Progress
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* NEW: See More / See Less Button */}
      {limit && hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="w-full sm:w-auto"
          >
            {showAll ? (
              <>
                Show Less
                <ChevronDown className="ml-2 h-4 w-4 rotate-180" />
              </>
            ) : (
              <>
                Show {jobs.length - displayLimit} More Task{jobs.length - displayLimit !== 1 ? "s" : ""}
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone. Any applications or bookings associated with this task
              will also be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => jobToDelete && handleDeleteJob(jobToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}