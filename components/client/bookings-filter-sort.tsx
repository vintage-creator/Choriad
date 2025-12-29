// components/client/bookings-filter-sort.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, X, SortAsc, SortDesc } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FilterSortState {
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

interface BookingsFilterSortProps {
  onApplyFilters: (filters: FilterSortState) => void;
  categories: string[];
  statusOptions: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BookingsFilterSort({
  onApplyFilters,
  categories,
  statusOptions,
  open: openProp,
  onOpenChange,
}: BookingsFilterSortProps) {
  // local fallback state for uncontrolled usage
  const [localOpen, setLocalOpen] = useState(false);

  // use controlled prop when provided, otherwise fallback to local state
  const open = typeof openProp === "boolean" ? openProp : localOpen;

  const handleOpenChange = (value: boolean) => {
    // notify parent if controlled
    if (typeof onOpenChange === "function") {
      onOpenChange(value);
    }
    // update local fallback only when uncontrolled
    if (openProp === undefined) {
      setLocalOpen(value);
    }
  };

  const [filters, setFilters] = useState<FilterSortState>({
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

  const handleApply = () => {
    onApplyFilters(filters);
    handleOpenChange(false);
  };

  const handleClear = () => {
    // explicit typing so TypeScript doesn't widen sortOrder to `string`
    const clearedFilters: FilterSortState = {
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
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    handleOpenChange(false);
  };

  // typed range param for react-day-picker
  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        from: range?.from,
        to: range?.to,
      },
    }));
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.status !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    if (filters.workerName) count++;
    return count;
  };

  return (
    <>
      {/* Filter Button with Badge */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="relative gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          >
            <Filter className="h-4 w-4" />
            Filter & Sort
            {activeFilterCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount()}
              </span>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent
  className="fixed top-10 left-1/2 transform -translate-x-1/2 sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Sort Bookings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                          {format(filters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to,
                    }}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label>Budget Range (₦)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Min Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, minAmount: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max Amount</Label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={filters.maxAmount}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Worker Search */}
            <div className="space-y-2">
              <Label>Worker Name</Label>
              <Input
                placeholder="Search by worker name..."
                value={filters.workerName}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, workerName: e.target.value }))
                }
              />
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="flex gap-3">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, sortBy: value }))
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
                    }))
                  }
                >
                  {filters.sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => {
                // clear and close via our handler
                handleClear();
              }}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
            <Button
              onClick={() => {
                handleApply();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
