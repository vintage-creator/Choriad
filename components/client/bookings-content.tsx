// components/client/bookings-content.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  User,
  Star,
  ChevronRight,
  Eye,
  PiggyBank,
  Building,
  Calendar,
  AlertCircle,
  Filter,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { BookingsFilterSort } from "@/components/client/bookings-filter-sort";
import { BookingsCalendar } from "@/components/client/bookings-calendar";

interface Booking {
  id: string;
  status: string;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
  total_amount: number | null;
  amount_ngn: number | null;
  commission_ngn: number;
  jobs: {
    title: string;
    category: string;
    location_city: string | null;
    location_area: string | null;
    location_address: string | null;
  } | null;
  workers: {
    id: string;
    profile_pictures_urls: string[] | null;
    rating: number | null;
    completed_jobs: number | null;
    profiles: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
}

interface ClientBookingsContentProps {
  profile: any;
  bookings: Booking[];
  categories: string[];
  statusOptions: string[];
}

interface FilterState {
  status: string;
  category: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  minAmount: string;
  maxAmount: string;
  workerName: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export function ClientBookingsContent({
  profile,
  bookings,
  categories,
  statusOptions,
}: ClientBookingsContentProps) {
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(bookings);
  const [view, setView] = useState<
    "all" | "upcoming" | "completed" | "cancelled"
  >("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    category: "all",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    minAmount: "",
    maxAmount: "",
    workerName: "",
    sortBy: "date",
    sortOrder: "desc",
  });

  // Apply filters and sorting
  const applyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);

    let filtered = [...bookings];

    // Filter by status
    if (newFilters.status !== "all") {
      filtered = filtered.filter(
        (booking) => booking.status === newFilters.status
      );
    }

    // Filter by category
    if (newFilters.category !== "all") {
      filtered = filtered.filter(
        (booking) => booking.jobs?.category === newFilters.category
      );
    }

    // Filter by date range
    if (newFilters.dateRange.from || newFilters.dateRange.to) {
      filtered = filtered.filter((booking) => {
        const bookingDate = booking.scheduled_date
          ? new Date(booking.scheduled_date)
          : new Date(booking.created_at);

        if (newFilters.dateRange.from && newFilters.dateRange.to) {
          return (
            bookingDate >= newFilters.dateRange.from &&
            bookingDate <= newFilters.dateRange.to
          );
        } else if (newFilters.dateRange.from) {
          return bookingDate >= newFilters.dateRange.from;
        } else if (newFilters.dateRange.to) {
          return bookingDate <= newFilters.dateRange.to;
        }
        return true;
      });
    }

    // Filter by amount range
    if (newFilters.minAmount || newFilters.maxAmount) {
      filtered = filtered.filter((booking) => {
        const amount = booking.total_amount || 0;
        const min = newFilters.minAmount ? parseFloat(newFilters.minAmount) : 0;
        const max = newFilters.maxAmount
          ? parseFloat(newFilters.maxAmount)
          : Infinity;
        return amount >= min && amount <= max;
      });
    }

    // Filter by worker name
    if (newFilters.workerName) {
      filtered = filtered.filter((booking) =>
        booking.workers?.profiles?.full_name
          ?.toLowerCase()
          .includes(newFilters.workerName.toLowerCase())
      );
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any = 0;
      let bValue: any = 0;

      switch (newFilters.sortBy) {
        case "date":
          aValue = new Date(a.scheduled_date || a.created_at).getTime();
          bValue = new Date(b.scheduled_date || b.created_at).getTime();
          break;
        case "amount":
          aValue = a.total_amount || 0;
          bValue = b.total_amount || 0;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "worker":
          aValue = a.workers?.profiles?.full_name || "";
          bValue = b.workers?.profiles?.full_name || "";
          break;
      }

      if (newFilters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBookings(filtered);
  };

  // Initialize with all bookings
  useEffect(() => {
    setFilteredBookings(bookings);
  }, [bookings]);

  // Filter bookings based on selected view
  const displayBookings = useMemo(() => {
    switch (view) {
      case "upcoming":
        return filteredBookings.filter((b) =>
          ["confirmed", "scheduled"].includes(b.status)
        );
      case "completed":
        return filteredBookings.filter((b) => b.status === "completed");
      case "cancelled":
        return filteredBookings.filter((b) => b.status === "cancelled");
      default:
        return filteredBookings;
    }
  }, [view, filteredBookings]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get status badge configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          label: "Confirmed",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        };
      case "scheduled":
        return {
          label: "Scheduled",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Calendar,
        };
      case "completed":
        return {
          label: "Completed",
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: CheckCircle,
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
        };
      case "pending":
        return {
          label: "Pending",
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: Clock,
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: AlertCircle,
        };
    }
  };

  // Calculate stats for filtered bookings
  const stats = {
    total: filteredBookings.length,
    upcoming: filteredBookings.filter((b) =>
      ["confirmed", "scheduled"].includes(b.status)
    ).length,
    completed: filteredBookings.filter((b) => b.status === "completed").length,
    inProgress: filteredBookings.filter((b) => b.status === "confirmed").length,
  };

  const totalSpent = filteredBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + ((b.amount_ngn ?? 0) + b.commission_ngn), 0);

  const mostBookedCategory = (() => {
    const categoryCounts = filteredBookings.reduce(
      (acc: Record<string, number>, booking) => {
        const category = booking.jobs?.category || "Unknown";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {}
    );

    return Object.entries(categoryCounts).reduce(
      (a, b) => (a[1] > b[1] ? a : b),
      ["None", 0]
    )[0];
  })();

  return (
    <>
      {/* Filter and Calendar Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <BookingsFilterSort
          open={filterOpen}
          onOpenChange={setFilterOpen}
          onApplyFilters={applyFilters}
          categories={categories}
          statusOptions={statusOptions}
        />
        <BookingsCalendar
          bookings={filteredBookings}
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
        />
      </div>

      {profile?.full_name && (
        <p className="text-sm text-slate-500 mb-6">
          Logged in as {profile.full_name}
        </p>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Bookings List */}
        <div className="lg:col-span-2 space-y-6">
          {/* View Tabs */}
          <div className="flex flex-wrap gap-2 border-b pb-4">
            <Button
              variant={view === "all" ? "default" : "ghost"}
              onClick={() => setView("all")}
              className="rounded-full"
            >
              All ({stats.total})
            </Button>
            <Button
              variant={view === "upcoming" ? "default" : "ghost"}
              onClick={() => setView("upcoming")}
              className="rounded-full"
            >
              Upcoming ({stats.upcoming})
            </Button>
            <Button
              variant={view === "completed" ? "default" : "ghost"}
              onClick={() => setView("completed")}
              className="rounded-full"
            >
              Completed ({stats.completed})
            </Button>
            <Button
              variant={view === "cancelled" ? "default" : "ghost"}
              onClick={() => setView("cancelled")}
              className="rounded-full"
            >
              Cancelled (
              {filteredBookings.filter((b) => b.status === "cancelled").length})
            </Button>
          </div>

          {/* Active Filters Badge */}
          {filters.status !== "all" ||
          filters.category !== "all" ||
          filters.dateRange.from ||
          filters.dateRange.to ||
          filters.minAmount ||
          filters.maxAmount ||
          filters.workerName ? (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Filter className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                Active Filters:
              </span>

              {filters.status !== "all" && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Status: {filters.status}
                </Badge>
              )}

              {filters.category !== "all" && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Category: {filters.category}
                </Badge>
              )}

              {filters.dateRange.from && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  From: {filters.dateRange.from.toLocaleDateString()}
                </Badge>
              )}

              {filters.dateRange.to && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  To: {filters.dateRange.to.toLocaleDateString()}
                </Badge>
              )}

              {(filters.minAmount || filters.maxAmount) && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Amount: {filters.minAmount || "0"} -{" "}
                  {filters.maxAmount || "∞"}
                </Badge>
              )}

              {filters.workerName && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Worker: {filters.workerName}
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  applyFilters({
                    status: "all",
                    category: "all",
                    dateRange: { from: undefined, to: undefined },
                    minAmount: "",
                    maxAmount: "",
                    workerName: "",
                    sortBy: "date",
                    sortOrder: "desc",
                  })
                }
                className="ml-auto text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </Button>
            </div>
          ) : null}

          {/* Bookings Cards */}
          <div className="space-y-4">
            {displayBookings.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 sm:p-12 text-center">
                  <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    No Bookings Found
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                    {view === "all"
                      ? "No bookings match your current filters."
                      : `You don't have any ${view} bookings.`}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full sm:w-auto"
                    >
                      <Link href="/client/jobs/new">Create New Booking</Link>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() =>
                        applyFilters({
                          status: "all",
                          category: "all",
                          dateRange: { from: undefined, to: undefined },
                          minAmount: "",
                          maxAmount: "",
                          workerName: "",
                          sortBy: "date",
                          sortOrder: "desc",
                        })
                      }
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              displayBookings.map((booking) => {
                const statusConfig = getStatusConfig(booking.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Card
                    key={booking.id}
                    className="border-0 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* LEFT CONTENT */}
                        <div className="flex-1 min-w-0">
                          {/* Status + Date */}
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <Badge
                              className={`${statusConfig.color} border px-3 py-1 flex items-center gap-2`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>

                            <span className="text-xs sm:text-sm text-slate-500">
                              {formatDate(
                                booking.scheduled_date || booking.created_at
                              )}
                            </span>
                          </div>

                          {/* Job title */}
                          <h4 className="font-semibold text-base sm:text-lg mb-3 truncate">
                            {booking.jobs?.title || "Untitled Job"}
                          </h4>

                          {/* Meta info */}
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-sm text-slate-600 mb-4">
                            <div className="flex items-center gap-2">
                              <PiggyBank className="h-4 w-4 text-slate-400" />
                              <span className="font-medium">
                                ₦
                                {(
                                  (booking.amount_ngn || 0) +
                                  (booking.commission_ngn || 0)
                                ).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span className="truncate">
                                {booking.jobs?.location_city || "Location"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-slate-400" />
                              <span>{booking.jobs?.category || "General"}</span>
                            </div>
                          </div>

                          {/* Worker Info */}
                          {booking.workers && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                              <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                                <AvatarImage
                                  src={
                                    booking.workers
                                      .profile_pictures_urls?.[0] ??
                                    booking.workers.profiles?.avatar_url ??
                                    undefined
                                  }
                                />
                                <AvatarFallback>
                                  {booking.workers.profiles?.full_name?.[0] ||
                                    "W"}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {booking.workers.profiles?.full_name ||
                                    "Worker"}
                                </p>
                                {/* <div className="flex items-center gap-2 flex-wrap">
                                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                  <span className="text-xs sm:text-sm text-slate-600">
                                    {booking.workers.rating?.toFixed(1) ||
                                      "N/A"}{" "}
                                    • {booking.workers.completed_jobs || 0} jobs
                                  </span>
                                </div> */}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ACTION */}
                        <div className="w-full lg:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="w-full lg:w-auto"
                          >
                            <Link href={`/client/bookings/${booking.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Manage your bookings efficiently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => setFilterOpen(true)}
              >
                <Filter className="h-4 w-4 text-blue-500" />
                Filter & Sort
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => setCalendarOpen(true)}
              >
                <CalendarDays className="h-4 w-4 text-emerald-500" />
                Calendar View
              </Button>

              <Button
                disabled
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Report Issue
              </Button>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Filtered Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Filtered Bookings</span>
                  <span className="font-bold">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Spent</span>
                  <span className="font-bold">
                    ₦{totalSpent.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Most Booked Category</span>
                  <span className="font-bold">{mostBookedCategory}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Need Help?
                  </h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Our support team is here to help with any booking issues
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
