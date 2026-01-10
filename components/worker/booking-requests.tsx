// components/worker/booking-requests.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { format, differenceInHours } from "date-fns";
import toast from "react-hot-toast";

interface BookingRequest {
  id: string;
  job_id: string;
  client_id: string;
  worker_id: string;
  scheduled_date: string;
  proposed_amount_ngn: number;
  worker_rate_ngn: number;
  negotiation_note: string | null;
  status: "pending" | "accepted" | "rejected" | "countered";
  expires_at: string;
  created_at: string;
  jobs: {
    title: string;
    description: string;
    location_area: string;
    location_city: string;
    urgency: string;
  };
  client: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface BookingRequestsProps {
  requests: BookingRequest[];
  workerId: string;
}

export function BookingRequests({
  requests: initialRequests,
  workerId,
}: BookingRequestsProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [counterOffer, setCounterOffer] = useState<{ [key: string]: number }>(
    {}
  );
  const [counterNote, setCounterNote] = useState<{ [key: string]: string }>({});

  const handleAccept = async (requestId: string, proposedAmount: number) => {
    const supabase = createClient();
    setIsLoading(requestId);

    try {
      // 1. Update booking request status to "accepted"
      const { error: updateError } = await supabase
        .from("booking_requests")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .eq("worker_id", workerId);

      if (updateError) throw updateError;

      // 2. Get full request details
      const { data: request } = await supabase
        .from("booking_requests")
        .select("*, jobs(*)")
        .eq("id", requestId)
        .single();

      if (!request) throw new Error("Request not found");

      // 3. Update job status to show it's been accepted
      await supabase
        .from("jobs")
        .update({
          status: "assigned",
          assigned_worker_id: workerId,
          final_amount_ngn: proposedAmount,
        })
        .eq("id", request.job_id);

      const paymentUrl = `/client/bookings/${requestId}/pay`; 

      await supabase.from("notifications").insert({
        user_id: request.client_id,
        type: "booking_confirmed",
        title: "Worker Accepted Your Request! 🎉",
        message: `${
          request.jobs.title
        } - Complete payment to secure booking (₦${proposedAmount.toLocaleString()})`,
        data: {
          booking_request_id: requestId,
          job_id: request.job_id,
          payment_url: paymentUrl,
          amount: proposedAmount,
          action_required: true,
        },
        read: false,
      });

      // Update UI
      setRequests((prev) => prev.filter((r) => r.id !== requestId));

      toast.success("✅ Request accepted! Waiting for client payment.", {
        duration: 5000,
        icon: "🎉",
      });
    } catch (error: any) {
      console.error("Error accepting booking:", error);
      toast.error(error.message || "Failed to accept. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const supabase = createClient();
    setIsLoading(requestId);

    try {
      const { error } = await supabase
        .from("booking_requests")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .eq("worker_id", workerId);

      if (error) throw error;

      // Get request details for notification
      const { data: request } = await supabase
        .from("booking_requests")
        .select("*, jobs(*)")
        .eq("id", requestId)
        .single();

      if (request) {
        // Notify client
        await supabase.from("notifications").insert({
          user_id: request.client_id,
          type: "booking_rejected",
          title: "Booking Request Declined",
          message: `${request.jobs.title} - The worker declined. We can help you find alternatives.`,
          data: {
            job_id: request.job_id,
            booking_request_id: requestId,
            action_required: true,
          },
          read: false,
        });
      }

      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.success("Booking request rejected");
    } catch (error: any) {
      console.error("Error rejecting booking:", error);
      toast.error(
        error.message || "Failed to reject booking. Please try again."
      );
    } finally {
      setIsLoading(null);
    }
  };

  const handleCounterOffer = async (requestId: string) => {
    const supabase = createClient();
    const amount = counterOffer[requestId];
    const note = counterNote[requestId];
  
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid counter-offer amount");
      return;
    }
  
    setIsLoading(requestId);
  
    try {
      // 1. Update booking request with counter-offer
      const { error: updateError } = await supabase
        .from("booking_requests")
        .update({
          status: "countered",
          counter_offer_ngn: amount,
          counter_note: note || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .eq("worker_id", workerId);
  
      if (updateError) throw updateError;
  
      // 2. Get request details for notification
      const { data: request, error: requestError } = await supabase
        .from("booking_requests")
        .select("*, jobs(*)")
        .eq("id", requestId)
        .single();
  
      if (requestError || !request) {
        throw new Error("Failed to fetch request details");
      }
  
      // 3. Create notification for client
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: request.client_id,
          type: "booking_counter_offer",
          title: "Counter-Offer Received",
          message: `${request.jobs.title} - Worker proposes ₦${amount.toLocaleString()}${note ? `. ${note}` : ""}`,
          data: {
            booking_request_id: requestId,
            counter_amount: amount,
            counter_note: note,
            original_amount: request.proposed_amount_ngn,
            action_required: true,
          },
          read: false,
        });
  
      if (notifError) {
        console.error("Failed to create notification:", notifError);
        throw new Error("Failed to notify client");
      }
  
      console.log("✅ Counter-offer notification created for client:", request.client_id);
  
      // Update UI
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
  
      toast.success("💬 Counter-offer sent to client!", {
        duration: 4000,
      });
    } catch (error: any) {
      console.error("Error sending counter-offer:", error);
      toast.error(
        error.message || "Failed to send counter-offer. Please try again."
      );
    } finally {
      setIsLoading(null);
    }
  };
  

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No pending booking requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const isExpired = new Date(request.expires_at) < new Date();
        const hoursLeft = Math.max(
          0,
          differenceInHours(new Date(request.expires_at), new Date())
        );
        const isUrgent = hoursLeft <= 6 || request.jobs.urgency === "today";
        const priceDiff = request.proposed_amount_ngn - request.worker_rate_ngn;
        const priceDiffPercent =
          request.worker_rate_ngn > 0
            ? Math.round((priceDiff / request.worker_rate_ngn) * 100)
            : 0;

        return (
          <Card
            key={request.id}
            className={`${isExpired ? "opacity-60" : ""} ${
              isUrgent ? "ring-2 ring-amber-400" : ""
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg">
                      {request.jobs.title}
                    </CardTitle>
                    {isUrgent && !isExpired && (
                      <Badge variant="destructive" className="animate-pulse">
                        <Zap className="w-3 h-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {request.jobs.location_area}, {request.jobs.location_city}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(request.scheduled_date), "MMM d, yyyy")}
                  </div>
                </div>

                {isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : (
                  <Badge variant={isUrgent ? "destructive" : "secondary"}>
                    <Clock className="w-3 h-3 mr-1" />
                    {hoursLeft}h left
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {request.jobs.description}
              </p>

              {/* Price Comparison */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Client Offer
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    ₦{request.proposed_amount_ngn.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Your Rate
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {request.worker_rate_ngn > 0
                      ? `₦${request.worker_rate_ngn.toLocaleString()}`
                      : "Flexible"}
                  </div>
                </div>
              </div>

              {/* Price Difference Alert */}
              {request.worker_rate_ngn > 0 && priceDiff !== 0 && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                    priceDiff < 0
                      ? "bg-amber-50 text-amber-800"
                      : "bg-green-50 text-green-800"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {priceDiff < 0
                    ? `Client's offer is ${Math.abs(
                        priceDiffPercent
                      )}% lower than your rate`
                    : `Client's offer is ${priceDiffPercent}% higher than your rate`}
                </div>
              )}

              {request.negotiation_note && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  <div className="font-medium text-blue-900 mb-1">
                    Note from client:
                  </div>
                  <p className="text-blue-800">{request.negotiation_note}</p>
                </div>
              )}

              {/* Actions */}
              {!isExpired && request.status === "pending" && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        handleAccept(request.id, request.proposed_amount_ngn)
                      }
                      disabled={isLoading === request.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept ₦{request.proposed_amount_ngn.toLocaleString()}
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      disabled={isLoading === request.id}
                      variant="destructive"
                      className="flex-1 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>

                  {/* Counter-offer section */}
                  <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                    <Label className="text-sm font-medium">
                      Or send a counter-offer:
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Your price (₦)"
                          value={counterOffer[request.id] || ""}
                          onChange={(e) =>
                            setCounterOffer((prev) => ({
                              ...prev,
                              [request.id]: Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <Button
                      className="cursor-pointer"
                        onClick={() => handleCounterOffer(request.id)}
                        disabled={
                          isLoading === request.id || !counterOffer[request.id]
                        }
                        variant="outline"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Counter
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Optional: Explain your counter-offer"
                      value={counterNote[request.id] || ""}
                      onChange={(e) =>
                        setCounterNote((prev) => ({
                          ...prev,
                          [request.id]: e.target.value,
                        }))
                      }
                      className="text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
