"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, DollarSign, Clock, X } from "lucide-react";

interface JobSearchProps {
  defaultCity: string;
  cities: string[];
  workerSkills: string[];
  /** number of jobs returned by the parent query after applying filters (pass jobs.length) */
  matchedJobsCount?: number;
}

export function JobSearch({
  defaultCity,
  cities,
  workerSkills,
  matchedJobsCount,
}: JobSearchProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: defaultCity,
    searchQuery: "",
    minBudget: "",
    maxBudget: "",
    selectedSkills: [] as string[],
    sortBy: "newest",
  });

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setIsLoading(true);
    const params = new URLSearchParams();

    if (filters.city && filters.city !== defaultCity) {
      params.set("city", filters.city);
    }
    if (filters.searchQuery) {
      params.set("q", filters.searchQuery);
    }
    if (filters.minBudget) {
      params.set("min", filters.minBudget);
    }
    if (filters.maxBudget) {
      params.set("max", filters.maxBudget);
    }
    if (filters.selectedSkills.length > 0) {
      params.set("skills", filters.selectedSkills.join(","));
    }
    if (filters.sortBy !== "newest") {
      params.set("sort", filters.sortBy);
    }

    router.push(`/worker/jobs?${params.toString()}`);
    // keep simple loader UX
    setTimeout(() => setIsLoading(false), 500);
  };

  const clearFilters = () => {
    setFilters({
      city: defaultCity,
      searchQuery: "",
      minBudget: "",
      maxBudget: "",
      selectedSkills: [],
      sortBy: "newest",
    });
    router.push("/worker/jobs");
  };

  // Small helper: skills match fallback (only used when matchedJobsCount > 0)
  const skillsMatchPercent = Math.round(
    Math.min(100, (workerSkills.length / 10) * 100)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Job Title or Description</Label>
            <Input
              id="search"
              placeholder="Search jobs..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">
              <MapPin className="inline h-4 w-4 mr-2" />
              City
            </Label>
            <Select
              value={filters.city}
              onValueChange={(value) => handleFilterChange("city", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="minBudget">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Min Budget
              </Label>
              <Input
                id="minBudget"
                type="number"
                placeholder="₦0"
                value={filters.minBudget}
                onChange={(e) => handleFilterChange("minBudget", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxBudget">Max Budget</Label>
              <Input
                id="maxBudget"
                type="number"
                placeholder="₦∞"
                value={filters.maxBudget}
                onChange={(e) => handleFilterChange("maxBudget", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Filter by Your Skills</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {workerSkills.slice(0, 10).map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={filters.selectedSkills.includes(skill)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleFilterChange("selectedSkills", [
                          ...filters.selectedSkills,
                          skill,
                        ]);
                      } else {
                        handleFilterChange(
                          "selectedSkills",
                          filters.selectedSkills.filter((s) => s !== skill)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`skill-${skill}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortBy">
              <Filter className="inline h-4 w-4 mr-2" />
              Sort By
            </Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="budget_high">Budget (High to Low)</SelectItem>
                <SelectItem value="budget_low">Budget (Low to High)</SelectItem>
                <SelectItem value="urgency">Most Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSearch} className="flex-1" disabled={isLoading}>
              {isLoading ? "Searching..." : "Apply Filters"}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats (only show when there are matches) */}
      {typeof matchedJobsCount === "number" ? (
        matchedJobsCount > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Your Job Match Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Skills Match</span>
                <span className="font-semibold">{skillsMatchPercent}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">City Match</span>
                <span className="font-semibold">100%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Availability</span>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Matched Jobs</span>
                <span className="font-semibold">{matchedJobsCount}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">No Matching Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                We couldn't find any jobs that match your filters. Try clearing or broadening filters.
              </p>
              <div className="flex gap-2">
                <Button onClick={clearFilters} className="flex-1">
                  Clear Filters
                </Button>
                <Button variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Your Job Match Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Skills Match</span>
              <span className="font-semibold">{skillsMatchPercent}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">City Match</span>
              <span className="font-semibold">100%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Availability</span>
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
