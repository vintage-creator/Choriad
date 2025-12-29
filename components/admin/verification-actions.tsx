// components/admin/verification-actions.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { verifyWorker, rejectWorker } from "@/app/actions/admin";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface VerificationActionsProps {
  workerId: string;
}

export function VerificationActions({ workerId }: VerificationActionsProps) {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [notes, setNotes] = useState("");

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await verifyWorker(workerId, notes);
      if (result.success) {
        toast.success("Worker verified successfully!");
        router.replace("/admin/verifications");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to verify worker");
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setRejecting(true);
    try {
      const result = await rejectWorker(workerId, notes);
      if (result.success) {
        toast.success("Worker verification rejected");
        router.replace("/admin/verifications");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to reject worker");
      }
    } finally {
      setRejecting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="notes">Admin Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this verification..."
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleVerify}
              disabled={verifying || rejecting}
            >
              {verifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Approve & Verify
            </Button>

            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleReject}
              disabled={verifying || rejecting}
            >
              {rejecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}