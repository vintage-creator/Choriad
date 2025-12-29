// components/client/bookings-calendar.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  scheduled_date: string | null;
  created_at: string;
  status: string;
  total_amount: number | null;
  jobs?: {
    title: string;
    category: string;
    location_city: string | null;
  } | null;
  workers?: {
    profiles?: {
      full_name: string | null;
    } | null;
  } | null;
}

interface BookingsCalendarProps {
  bookings: Booking[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BookingsCalendar({
  bookings,
  open: openProp,
  onOpenChange,
}: BookingsCalendarProps) {
  /* ---------------- controlled + fallback open state ---------------- */
  const [localCalendarOpen, setLocalCalendarOpen] = useState(false);

  const calendarOpen =
    typeof openProp === "boolean" ? openProp : localCalendarOpen;

  const handleCalendarOpenChange = (value: boolean) => {
    onOpenChange?.(value);
    if (openProp === undefined) {
      setLocalCalendarOpen(value);
    }
  };

  /* ---------------- internal state ---------------- */
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);

  /* ---------------- helpers ---------------- */
  const getBookingsForDate = (date: Date) =>
    bookings.filter((booking) => {
      const bookingDate = booking.scheduled_date
        ? parseISO(booking.scheduled_date)
        : parseISO(booking.created_at);
      return isSameDay(bookingDate, date);
    });

  const handleDateClick = (date: Date) => {
    const dayBookings = getBookingsForDate(date);
    setSelectedDate(date);
    setSelectedBookings(dayBookings);
    if (dayBookings.length > 0) {
      setDayDialogOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderDay = (date: Date) => {
    const dayBookings = getBookingsForDate(date);
    const isToday = isSameDay(date, new Date());
    const isSelected = selectedDate && isSameDay(date, selectedDate);

    return (
      <div
        className={cn(
          "relative h-10 w-10 flex items-center justify-center rounded-full cursor-pointer",
          isToday && "bg-blue-100 text-blue-600 font-semibold",
          isSelected && "bg-blue-600 text-white"
        )}
        onClick={() => handleDateClick(date)}
      >
        {format(date, "d")}
        {dayBookings.length > 0 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {dayBookings.slice(0, 3).map((b, i) => (
              <span
                key={i}
                className={cn(
                  "w-1 h-1 rounded-full",
                  getStatusColor(b.status).split(" ")[0]
                )}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const upcomingBookings = bookings
    .filter((b) => ["confirmed", "scheduled"].includes(b.status))
    .slice(0, 5);

  /* ---------------- render ---------------- */
  return (
    <>
      {/* Trigger Button (still usable standalone) */}
      <Button
        variant="outline"
        className="gap-2 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
        onClick={() => handleCalendarOpenChange(true)}
      >
        <CalendarIcon className="h-4 w-4" />
        Calendar View
      </Button>

      {/* Main Calendar Dialog */}
      <Dialog open={calendarOpen} onOpenChange={handleCalendarOpenChange}>
        <DialogContent className="fixed top-10 left-1/2 transform -translate-x-1/2 sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Bookings Calendar
            </DialogTitle>
          </DialogHeader>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Select a date</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedDate(
                            new Date(
                              selectedDate!.setMonth(
                                selectedDate!.getMonth() - 1
                              )
                            )
                          )
                        }
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDate(new Date())}
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedDate(
                            new Date(
                              selectedDate!.setMonth(
                                selectedDate!.getMonth() + 1
                              )
                            )
                          )
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    components={{
                      Day: ({ day }) => renderDay(day.date),
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">
                    Upcoming Bookings ({upcomingBookings.length})
                  </h3>

                  {upcomingBookings.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No upcoming bookings
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            const date = booking.scheduled_date
                              ? parseISO(booking.scheduled_date)
                              : parseISO(booking.created_at);
                            setSelectedDate(date);
                            setSelectedBookings([booking]);
                            setDayDialogOpen(true);
                          }}
                        >
                          <div className="flex justify-between mb-1">
                            <Badge
                              className={`${getStatusColor(
                                booking.status
                              )} border-0 text-xs`}
                            >
                              {booking.status}
                            </Badge>
                            <span className="font-semibold text-sm">
                              ₦{booking.total_amount?.toLocaleString() || "0"}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">
                            {booking.jobs?.title || "Untitled Job"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Day Details Dialog */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate &&
                `Bookings for ${format(selectedDate, "MMMM d, yyyy")}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <span className="font-bold">
                      ₦{booking.total_amount?.toLocaleString() || "0"}
                    </span>
                  </div>

                  <h4 className="font-semibold">
                    {booking.jobs?.title || "Untitled Job"}
                  </h4>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(
                        booking.scheduled_date
                          ? parseISO(booking.scheduled_date)
                          : parseISO(booking.created_at),
                        "MMM d, yyyy h:mm a"
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {booking.jobs?.location_city || "Location"}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {booking.workers?.profiles?.full_name || "Not assigned"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
