"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  MapPin,
  Phone,
  PiggyBank,
  Shield,
  Clock,
  Car,
  Briefcase,
  Award,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { Worker, Profile } from "@/lib/types";
import toast from "react-hot-toast";

const skillOptions = [
  "Grocery Shopping",
  "Home Cleaning",
  "Errands & Delivery",
  "Package Collection",
  "Meal Prep",
  "Handyman Services",
  "Laundry",
  "Pet Care",
  "Gardening",
  "Moving Help",
];

const cities = [
  "Lagos","Abuja","Port Harcourt","Kano","Ibadan","Benin City","Uyo","Calabar","Enugu","Aba","Owerri","Umuahia","Warri","Asaba","Onitsha","Abeokuta","Ado-Ekiti","Akure","Osogbo","Ilorin","Jos","Kaduna","Zaria","Maiduguri","Yola","Sokoto","Katsina","Birnin Kebbi","Minna","Lokoja"
];

const availabilityOptions = [
  { value: "available", label: "Available", color: "bg-green-500" },
  { value: "busy", label: "Busy", color: "bg-yellow-500" },
  { value: "offline", label: "Offline", color: "bg-gray-500" },
];

const idTypes = [
  { value: "nin", label: "National Identification Number (NIN)" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "international_passport", label: "International Passport" },
  { value: "voters_card", label: "Voter's Card" },
];

const transportationOptions = [
  "Personal Vehicle",
  "Public Transportation",
  "Bicycle",
  "Motorcycle",
  "Walking Distance Only",
];

const availableTimes = [
  "Morning (6AM - 12PM)",
  "Afternoon (12PM - 6PM)",
  "Evening (6PM - 10PM)",
  "Night (10PM - 6AM)",
  "24/7 Available",
  "Weekends Only",
  "Weekdays Only",
];

const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
];

interface WorkerProfileFormProps {
  worker: Worker;
  profile: Profile;
}

export function WorkerProfileForm({ worker, profile }: WorkerProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(worker.skills || []);
  const [availableDays, setAvailableDays] = useState<string[]>(worker.available_days || []);
  const [uploading, setUploading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const initials = (profile?.full_name
    ? profile.full_name.split(" ").map((s) => s[0]).slice(0, 2).join("")
    : "W"
  ).toUpperCase();

  useEffect(() => {
    const fields = [
      worker?.bio,
      (worker?.skills?.length || 0) > 0,
      worker?.hourly_rate_ngn,
      worker?.location_city,
      worker?.location_area,
      worker?.phone_number,
      profile?.avatar_url ||
        ((worker as any)?.profile_pictures_urls?.length || 0) > 0,
      worker?.years_experience,
      (worker?.available_days?.length || availableDays.length) > 0,
      worker?.available_times,
    ];
    const completedFields = fields.filter(Boolean).length;
    setProfileCompletion(Math.round((completedFields / fields.length) * 100));
  }, [worker, profile, availableDays]);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const toPublicUrl = (candidate: string | null | undefined) => {
      if (!candidate) return null;
      if (candidate.startsWith("http")) return candidate;
      const path = candidate.replace(/^\/+/, "");
      return supabase.storage.from("worker-profiles").getPublicUrl(path).data?.publicUrl ?? null;
    };

    const fetchAvatar = async () => {
      setAvatarLoadError(false);
      setResolvedAvatarUrl(null);

      try {
        const maybePics = (worker as any)?.profile_pictures_urls;
        if (Array.isArray(maybePics) && maybePics.length > 0) {
          const url = toPublicUrl(maybePics[0]);
          if (url && !cancelled) return setResolvedAvatarUrl(url);
        }

        if (worker?.id) {
          const { data } = await supabase.from("workers").select("profile_pictures_urls").eq("id", worker.id).single();
          const pics = (data as any)?.profile_pictures_urls;
          if (Array.isArray(pics) && pics.length > 0) {
            const url = toPublicUrl(pics[0]);
            if (url && !cancelled) return setResolvedAvatarUrl(url);
          }
        }

        const url = toPublicUrl(profile?.avatar_url);
        if (url && !cancelled) setResolvedAvatarUrl(url);
      } catch {
        if (!cancelled) setAvatarLoadError(true);
      }
    };

    fetchAvatar();
    return () => { cancelled = true; };
  }, [worker?.id, (worker as any)?.profile_pictures_urls, profile?.avatar_url]);

  const handleSkillToggle = (skill: string) =>
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);

  const handleDayToggle = (day: string) =>
    setAvailableDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please upload an image file");
    if (file.size > 5 * 1024 * 1024) return setError("Image size should be less than 5MB");

    setUploading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `profile_${Date.now()}.${fileExt}`;
      const filePath = `${worker.id}/${fileName}`;
      const { error: uploadError, data: uploadData } = await supabase.storage.from("worker-profiles").upload(filePath, file, { cacheControl: "3600", upsert: true });
      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage.from("worker-profiles").getPublicUrl(uploadData.path || filePath).data?.publicUrl;
      if (!publicUrl) throw new Error("Could not get public URL for uploaded image");

      const { data: existing } = await supabase.from("workers").select("profile_pictures_urls").eq("id", worker.id).single();
      const oldPics = (existing as any)?.profile_pictures_urls ?? [];
      const newPics = [publicUrl, ...oldPics].slice(0, 3);

      await supabase.from("workers").update({ profile_pictures_urls: newPics }).eq("id", worker.id);

      setResolvedAvatarUrl(publicUrl);
      setSuccess("Profile picture updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to upload image");
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
  
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
  
    try {
      const updatePayload: Partial<Worker> = {};
  
      /**
       * Generic helper:
       * - skips null / undefined / empty string
       * - skips unchanged values
       */
      function setIfChanged<K extends keyof Worker>(
        key: K,
        value: Worker[K] | null | undefined
      ) {
        if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          value !== worker[key]
        ) {
          updatePayload[key] = value;
        }
      }
  
      /* ----------------------------- */
      /* Strings (simple text fields)  */
      /* ----------------------------- */
  
      setIfChanged("bio", formData.get("bio") as string | null);
      setIfChanged("location_city", formData.get("location_city") as string | null);
      setIfChanged("location_area", formData.get("location_area") as string | null);
      setIfChanged("phone_number", formData.get("phone_number") as string | null);
      setIfChanged("years_experience", formData.get("years_experience") as string | null);
      setIfChanged("certifications", formData.get("certifications") as string | null);
      setIfChanged("available_times", formData.get("available_times") as string | null);
      setIfChanged("transportation", formData.get("transportation") as string | null);
      setIfChanged("tools_equipment", formData.get("tools_equipment") as string | null);
      setIfChanged("facebook_url", formData.get("facebook_url") as string | null);
      setIfChanged("twitter_url", formData.get("twitter_url") as string | null);
      setIfChanged("instagram_url", formData.get("instagram_url") as string | null);
      setIfChanged("linkedin_url", formData.get("linkedin_url") as string | null);
  
      /* ----------------------------- */
      /* Enum: availability_status     */
      /* ----------------------------- */
  
      const availabilityStatusRaw = formData.get("availability_status") as string | null;
      const availabilityStatuses = ["available", "busy", "offline"] as const;
  
      if (
        availabilityStatusRaw &&
        availabilityStatuses.includes(
          availabilityStatusRaw as (typeof availabilityStatuses)[number]
        ) &&
        availabilityStatusRaw !== worker.availability_status
      ) {
        updatePayload.availability_status =
          availabilityStatusRaw as Worker["availability_status"];
      }
  
      /* ----------------------------- */
      /* Number fields                 */
      /* ----------------------------- */
  
      const hourlyRateRaw = formData.get("hourly_rate");
      if (hourlyRateRaw !== null) {
        const hourlyRate = Number(hourlyRateRaw);
        if (!isNaN(hourlyRate) && hourlyRate !== worker.hourly_rate_ngn) {
          updatePayload.hourly_rate_ngn = hourlyRate;
        }
      }
  
      /* ----------------------------- */
      /* Array fields                  */
      /* ----------------------------- */
  
      if (
        selectedSkills.length > 0 &&
        JSON.stringify(selectedSkills) !== JSON.stringify(worker.skills)
      ) {
        updatePayload.skills = selectedSkills;
      }
  
      if (
        availableDays.length > 0 &&
        JSON.stringify(availableDays) !== JSON.stringify(worker.available_days)
      ) {
        updatePayload.available_days = availableDays;
      }
  
      /* ----------------------------- */
      /* Nothing changed → exit early  */
      /* ----------------------------- */
  
      if (Object.keys(updatePayload).length === 0) {
        toast("No changes detected");
        setIsLoading(false);
        return;
      }
  
      /* ----------------------------- */
      /* Supabase update               */
      /* ----------------------------- */
  
      const { error } = await supabase
        .from("workers")
        .update(updatePayload)
        .eq("id", worker.id);
  
      if (error) throw error;
  
      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };  
  

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* Profile Completion Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Profile Completion</h3>
              <p className="text-sm text-muted-foreground">
                Complete your profile to get more job opportunities
              </p>
            </div>
            <span className="text-2xl font-bold text-primary">
              {profileCompletion}%
            </span>
          </div>
          <Progress value={profileCompletion} className="h-2" />
          {profileCompletion < 100 && (
            <p className="text-sm text-muted-foreground mt-2">
              Add your{" "}
              {profileCompletion < 50
                ? "basic information"
                : "remaining details"}{" "}
              to complete your profile
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList
              className="
              flex
              w-full
              overflow-x-auto
              whitespace-nowrap
              rounded-lg
              border
              p-1
              md:grid md:grid-cols-4
            "
            >
              <TabsTrigger
                value="personal"
                className="min-w-[120px] md:min-w-0"
              >
                Personal
              </TabsTrigger>

              <TabsTrigger
                value="services"
                className="min-w-[120px] md:min-w-0"
              >
                Services
              </TabsTrigger>

              <TabsTrigger
                value="availability"
                className="min-w-[120px] md:min-w-0"
              >
                Availability
              </TabsTrigger>

              <TabsTrigger
                value="verification"
                className="min-w-[120px] md:min-w-0"
              >
                Verification
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="personal" className="space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                      {resolvedAvatarUrl && !avatarLoadError ? (
                        <AvatarImage
                          src={resolvedAvatarUrl}
                          alt={profile?.full_name || "Worker"}
                          onError={() => setAvatarLoadError(true)}
                        />
                      ) : (
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-emerald-600 text-white">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <label className="absolute bottom-2 right-2 cursor-pointer">
                      <div className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                        <Camera className="h-4 w-4" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
                    <p className="text-muted-foreground">
                      Worker ID: {worker.id?.substring(0, 8)}
                    </p>
                    <div className="mt-2">
                      {worker.verification_status === "verified" ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified Worker
                        </Badge>
                      ) : worker.verification_status === "pending" ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Verification Pending
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">
                      <Phone className="inline h-4 w-4 mr-2" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      defaultValue={worker.phone_number || ""}
                      placeholder="08012345678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_experience">
                      <Briefcase className="inline h-4 w-4 mr-2" />
                      Years of Experience
                    </Label>
                    <Select
                      name="years_experience"
                      defaultValue={worker.years_experience || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Less than 1 year",
                          "1-3 years",
                          "3-5 years",
                          "5-10 years",
                          "10+ years",
                        ].map((exp) => (
                          <SelectItem key={exp} value={exp}>
                            {exp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About You</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={worker.bio || ""}
                    placeholder="Tell clients about your experience, qualifications, and what makes you great at what you do..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">
                    <Award className="inline h-4 w-4 mr-2" />
                    Certifications & Training
                  </Label>
                  <Textarea
                    id="certifications"
                    name="certifications"
                    defaultValue={worker.certifications || ""}
                    placeholder="List any relevant certifications, training, or qualifications..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tools_equipment">
                    <Briefcase className="inline h-4 w-4 mr-2" />
                    Tools & Equipment
                  </Label>
                  <Textarea
                    id="tools_equipment"
                    name="tools_equipment"
                    defaultValue={worker.tools_equipment || ""}
                    placeholder="Describe any tools, equipment, or materials you provide..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <div className="space-y-4">
                  <Label>Skills & Services (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {skillOptions.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                        />
                        <Label
                          htmlFor={skill}
                          className="font-normal cursor-pointer"
                        >
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">
                      <PiggyBank className="inline h-4 w-4 mr-2" />
                      Hourly Rate (₦)
                    </Label>
                    <Input
                      id="hourly_rate"
                      name="hourly_rate"
                      type="number"
                      defaultValue={worker.hourly_rate_ngn || ""}
                      placeholder="e.g., 2000"
                      min="0"
                      step="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transportation">
                      <Car className="inline h-4 w-4 mr-2" />
                      Transportation
                    </Label>
                    <Select
                      name="transportation"
                      defaultValue={worker.transportation || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How do you travel?" />
                      </SelectTrigger>
                      <SelectContent>
                        {transportationOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="availability" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availability_status">
                      <Clock className="inline h-4 w-4 mr-2" />
                      Availability Status
                    </Label>
                    <Select
                      name="availability_status"
                      defaultValue={worker.availability_status || "available"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${option.color}`}
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="available_times">
                      <Clock className="inline h-4 w-4 mr-2" />
                      Preferred Times
                    </Label>
                    <Select
                      name="available_times"
                      defaultValue={worker.available_times || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred times" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available Days</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {DAYS.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day}`}
                          checked={availableDays.includes(day)}
                          onCheckedChange={() => handleDayToggle(day)}
                        />
                        <Label
                          htmlFor={`day-${day}`}
                          className="font-normal cursor-pointer"
                        >
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location_city">
                      <MapPin className="inline h-4 w-4 mr-2" />
                      City
                    </Label>
                    <Select
                      name="location_city"
                      defaultValue={worker.location_city || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
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

                  <div className="space-y-2">
                    <Label htmlFor="location_area">
                      <MapPin className="inline h-4 w-4 mr-2" />
                      Area/Neighborhood
                    </Label>
                    <Input
                      id="location_area"
                      name="location_area"
                      defaultValue={worker.location_area || ""}
                      placeholder="e.g., Victoria Island"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="verification" className="space-y-6">
                {worker.verification_status === "verified" ? (
                  <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-900">
                          Verified Worker
                        </h3>
                        <p className="text-sm text-green-700">
                          Your identity has been verified. Clients can see your
                          verified badge.
                        </p>
                        <div className="mt-2 text-sm">
                          <p>
                            <strong>ID Type:</strong> {worker.id_type}
                          </p>
                          <p>
                            <strong>ID Number:</strong> ••••••••
                            {worker.id_number?.slice(-4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-yellow-900">
                          Verification Pending
                        </h3>
                        <p className="text-sm text-yellow-700">
                          Your verification is under review. This usually takes
                          1-2 business days.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Label>Social Media Links (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        <Label htmlFor="facebook_url" className="text-sm">
                          Facebook
                        </Label>
                      </div>
                      <Input
                        id="facebook_url"
                        name="facebook_url"
                        defaultValue={worker.facebook_url || ""}
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Twitter className="h-4 w-4 text-sky-500" />
                        <Label htmlFor="twitter_url" className="text-sm">
                          Twitter/X
                        </Label>
                      </div>
                      <Input
                        id="twitter_url"
                        name="twitter_url"
                        defaultValue={worker.twitter_url || ""}
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-pink-600" />
                        <Label htmlFor="instagram_url" className="text-sm">
                          Instagram
                        </Label>
                      </div>
                      <Input
                        id="instagram_url"
                        name="instagram_url"
                        defaultValue={worker.instagram_url || ""}
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-blue-700" />
                        <Label htmlFor="linkedin_url" className="text-sm">
                          LinkedIn
                        </Label>
                      </div>
                      <Input
                        id="linkedin_url"
                        name="linkedin_url"
                        defaultValue={worker.linkedin_url || ""}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <p className="text-sm">{success}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isLoading || uploading}
                  className="flex-1"
                >
                  {isLoading ? "Saving..." : "Save All Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
