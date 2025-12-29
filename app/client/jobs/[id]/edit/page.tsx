"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/client/dashboard-header";
import { Footer } from "@/components/landing/footer";

type JobShape = {
  id: string;
  title?: string;
  description?: string;
  category?: string | null;
  urgency?: string | null;
  budget_min_ngn?: number | null;
  budget_max_ngn?: number | null;
  location_city?: string | null;
  location_area?: string | null;
  location_address?: string | null;
};

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const supabase = createBrowserClient();

  // profile
  const [profile, setProfile] = useState<any>(null);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [budgetMin, setBudgetMin] = useState<number | "">("");
  const [budgetMax, setBudgetMax] = useState<number | "">("");
  const [locationCity, setLocationCity] = useState("");
  const [locationArea, setLocationArea] = useState("");
  const [locationAddress, setLocationAddress] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setFetching(true);

      // auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData?.user_type !== "client") {
        router.push("/worker/dashboard");
        return;
      }

      if (!mounted) return;
      setProfile(profileData);

      // fetch job
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (!mounted) return;

      if (error || !data) {
        setErrorMessage("Failed to load job.");
        setFetching(false);
        return;
      }

      const job = data as JobShape;

      setTitle(job.title ?? "");
      setDescription(job.description ?? "");
      setCategory(job.category ?? "");
      setUrgency(job.urgency ?? "");
      setBudgetMin(
        typeof job.budget_min_ngn === "number" ? job.budget_min_ngn : ""
      );
      setBudgetMax(
        typeof job.budget_max_ngn === "number" ? job.budget_max_ngn : ""
      );
      setLocationCity(job.location_city ?? "");
      setLocationArea(job.location_area ?? "");
      setLocationAddress(job.location_address ?? "");

      setFetching(false);
    }

    if (id) init();

    return () => {
      mounted = false;
    };
  }, [id, router, supabase]);

  const validate = () => {
    if (!title.trim()) {
      setErrorMessage("Please enter a title.");
      return false;
    }
    if (!description.trim()) {
      setErrorMessage("Please enter a description.");
      return false;
    }
    if (
      budgetMin !== "" &&
      budgetMax !== "" &&
      Number(budgetMin) > Number(budgetMax)
    ) {
      setErrorMessage("Minimum budget cannot exceed maximum budget.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validate()) return;

    setLoading(true);

    const updates: Partial<JobShape> = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || null,
      urgency: urgency.trim() || null,
      budget_min_ngn: budgetMin === "" ? null : Number(budgetMin),
      budget_max_ngn: budgetMax === "" ? null : Number(budgetMax),
      location_city: locationCity.trim() || null,
      location_area: locationArea.trim() || null,
      location_address: locationAddress.trim() || null,
    };

    const { error } = await supabase.from("jobs").update(updates).eq("id", id);

    if (error) {
      setErrorMessage("Failed to update job.");
      setLoading(false);
      return;
    }

    setSuccessMessage("Job updated successfully.");
    setTimeout(() => router.push("/client/jobs"), 800);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {profile && <DashboardHeader profile={profile} />}

      <main className="flex-1 flex justify-center items-start py-12">
        <div className="w-full max-w-4xl px-4">
          <h1 className="text-3xl font-extrabold mb-2">Edit Job</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Update the details of your job.
          </p>

          <div className="relative bg-white border rounded-2xl shadow-sm p-6">
            {fetching ? (
              <div className="space-y-6">
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-32 bg-slate-100 rounded-lg animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="text-sm text-red-600">{errorMessage}</div>
                )}
                {successMessage && (
                  <div className="text-sm text-green-600">{successMessage}</div>
                )}

                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Fix leaking kitchen tap"
                    className="mt-2 block w-full rounded-lg border border-border/50 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the task in detail, include access instructions, tools provided, and expected outcome."
                    className="mt-2 block w-full rounded-lg border border-border/50 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-y"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Compact two-column grid for category/urgency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-muted-foreground"
                    >
                      Category
                    </label>
                    <input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Plumbing, Cleaning"
                      className="mt-2 block w-full rounded-lg border border-border/50 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="urgency"
                      className="block text-sm font-medium text-muted-foreground"
                    >
                      Urgency
                    </label>
                    <input
                      id="urgency"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      placeholder="e.g., asap, within 2 days"
                      className="mt-2 block w-full rounded-lg border border-border/50 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="budgetMin"
                      className="block text-sm font-medium text-muted-foreground"
                    >
                      Minimum budget (₦)
                    </label>
                    <input
                      id="budgetMin"
                      name="budgetMin"
                      type="number"
                      value={budgetMin === "" ? "" : budgetMin}
                      onChange={(e) =>
                        setBudgetMin(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="e.g., 2000"
                      className="mt-2 block w-full rounded-lg border border-border/50 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                      disabled={loading}
                      min={0}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="budgetMax"
                      className="block text-sm font-medium text-muted-foreground"
                    >
                      Maximum budget (₦)
                    </label>
                    <input
                      id="budgetMax"
                      name="budgetMax"
                      type="number"
                      value={budgetMax === "" ? "" : budgetMax}
                      onChange={(e) =>
                        setBudgetMax(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="e.g., 5000"
                      className="mt-2 block w-full rounded-lg border border-border/50 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                      disabled={loading}
                      min={0}
                    />
                  </div>
                </div>

                {/* Location fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-muted-foreground"
                    >
                      City
                    </label>
                    <input
                      id="city"
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      placeholder="e.g., Lagos"
                      className="mt-2 block w-full rounded-lg border border-border/50 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="area"
                      className="block text-sm font-medium text-muted-foreground"
                    >
                      Area / Neighbourhood
                    </label>
                    <input
                      id="area"
                      value={locationArea}
                      onChange={(e) => setLocationArea(e.target.value)}
                      placeholder="e.g., Lekki Phase 1"
                      className="mt-2 block w-full rounded-lg border border-border/50 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-muted-foreground"
                    >
                      Address (optional){" "}
                      <span className="text-xs text-muted-foreground italic">
                        {title.trim().length === 0
                          ? "Title required"
                          : `max ${title.trim().length} characters`}
                      </span>
                    </label>

                    <input
                      id="address"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      placeholder="Street, building, entry instructions..."
                      className="mt-2 block w-full rounded-lg border border-border/50 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Buttons + helper */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      className="px-5 py-2 cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Job"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-4 py-2 text-sm rounded-lg border border-border/50 bg-white hover:bg-gray-50 cursor-pointer"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
