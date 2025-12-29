// /components/worker/WorkerSetupForm.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Progress } from "../ui/progress";
import {
  Upload,
  X,
  ChevronUp,
  ChevronDown,
  ShoppingCart,
  Home,
  Car,
  GraduationCap,
  Wrench,
  Users,
  Heart,
  Utensils,
  Camera,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const skillCategories = [
  {
    name: "Market Runs",
    icon: ShoppingCart,
    skills: ["Grocery Shopping", "Personal Shopping"],
  },
  {
    name: "Home Cleaning",
    icon: Home,
    skills: [
      "Home Cleaning",
      "Compound Sweeping",
      "Cobweb Removal",
      "Laundry",
      "Car Wash",
    ],
  },
  {
    name: "Errands & Deliveries",
    icon: Car,
    skills: ["Errands & Delivery", "Package Collection", "Moving Help"],
  },
  {
    name: "Tutorial Services",
    icon: GraduationCap,
    skills: ["Family Tutor"],
  },
  {
    name: "Home Chef",
    icon: Utensils,
    skills: ["Meal Prep", "Home Chef"],
  },
  {
    name: "Handyman Services",
    icon: Wrench,
    skills: ["Handyman Services", "Gardening"],
  },
  {
    name: "Event Support",
    icon: Users,
    skills: ["Event Helper"],
  },
  {
    name: "Elderly Care",
    icon: Heart,
    skills: ["Home Nurse", "Elderly Companion", "Pet Care"],
  },
];

const cities = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Kano",
  "Ibadan",
  "Benin City",
  "Uyo",
  "Calabar",
  "Enugu",
  "Aba",
  "Owerri",
  "Umuahia",
  "Warri",
  "Asaba",
  "Onitsha",
  "Abeokuta",
  "Ado-Ekiti",
  "Akure",
  "Osogbo",
  "Ilorin",
  "Jos",
  "Kaduna",
  "Zaria",
  "Maiduguri",
  "Yola",
  "Sokoto",
  "Katsina",
  "Birnin Kebbi",
  "Minna",
  "Lokoja",
];

const idTypes = [
  { value: "nin", label: "National Identification Number (NIN)" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "international_passport", label: "International Passport" },
  { value: "voters_card", label: "Voter's Card" },
];

interface WorkerSetupFormProps {
  userId: string;
  currentStep: number;
}

interface FormData {
  bio: string;
  skills: string[];
  hourly_rate_ngn: string;
  location_city: string;
  location_area: string;
  phone_number: string;
  id_type: string;
  id_number: string;
  id_document_url: string;
  profile_pictures_urls: string[];
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  tiktok_url: string;
  years_experience: string;
  certifications: string;
  available_days: string[];
  available_times: string;
  transportation: string;
  tools_equipment: string;
}

const defaultFormData: FormData = {
  bio: "",
  skills: [],
  hourly_rate_ngn: "",
  location_city: "",
  location_area: "",
  phone_number: "",
  id_type: "",
  id_number: "",
  id_document_url: "",
  profile_pictures_urls: [],
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  tiktok_url: "",
  years_experience: "",
  certifications: "",
  available_days: [],
  available_times: "",
  transportation: "",
  tools_equipment: "",
};

const availableDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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

export function WorkerSetupForm({ userId }: WorkerSetupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [profileImages, setProfileImages] = useState<File[]>([]);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);

  const totalSteps = 5;

  const canSubmit = agreeTerms && confirmAccuracy && !isLoading;
  const stepParam = searchParams.get("step");
  const currentStep = Math.min(totalSteps, Math.max(1, Number(stepParam ?? 1)));

  const goToStep = (step: number) => {
    const next = Math.min(totalSteps, Math.max(1, Math.floor(step)));
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(next));
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const [expandedCategories, setExpandedCategories] = useState<boolean[]>(() =>
    skillCategories.map(() => false)
  );

  const toggleCategory = (index: number) => {
    setExpandedCategories((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter((d) => d !== day)
        : [...prev.available_days, day],
    }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (profileImages.length + files.length > 3) {
      setError("Maximum 3 profile pictures allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setError("Image size should be less than 5MB");
        return false;
      }
      return true;
    });

    setProfileImages((prev) => [...prev, ...validFiles]);
    setError(null);
  };

  const removeProfileImage = (index: number) => {
    setProfileImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIdDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Only images and PDFs are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      setError("Document size should be less than 10MB");
      return;
    }

    setIdDocument(file);
    setError(null);
  };

  const uploadFile = async (
    file: File,
    bucket: string,
    path: string
  ): Promise<string> => {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${path}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return publicUrl;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.bio.trim()) {
          setError("Please provide a brief bio about yourself");
          return false;
        }
        if (formData.skills.length === 0) {
          setError("Please select at least one skill");
          return false;
        }
        break;
      case 2:
        if (!formData.phone_number.trim()) {
          setError("Phone number is required");
          return false;
        }
        if (!formData.id_type) {
          setError("Please select an ID type");
          return false;
        }
        if (!formData.id_number.trim()) {
          setError("ID number is required");
          return false;
        }
        if (!idDocument) {
          setError("Please upload your ID document");
          return false;
        }
        break;
      case 3:
        if (!formData.location_city) {
          setError("Please select your city");
          return false;
        }
        if (!formData.location_area.trim()) {
          setError("Please enter your area/neighborhood");
          return false;
        }
        break;
      case 4:
        if (!formData.years_experience) {
          setError("Please select years of experience");
          return false;
        }
        if (formData.available_days.length === 0) {
          setError("Please select at least one available day");
          return false;
        }
        if (!formData.available_times) {
          setError("Please select your available times");
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    goToStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      setUploadProgress(10);

      // Upload profile pictures
      const profilePictureUrls: string[] = [];
      for (let i = 0; i < profileImages.length; i++) {
        const url = await uploadFile(
          profileImages[i],
          "worker-profiles",
          `profile_${i}`
        );
        profilePictureUrls.push(url);
        setUploadProgress(10 + (i / profileImages.length) * 30);
      }
      setUploadProgress(40);

      // Upload ID document
      let idDocumentUrl = "";
      if (idDocument) {
        idDocumentUrl = await uploadFile(
          idDocument,
          "worker-documents",
          "id_document"
        );
      }
      setUploadProgress(70);

      // Save worker data
      const { error: workerError } = await supabase.from("workers").upsert({
        id: userId,
        bio: formData.bio,
        skills: formData.skills,
        hourly_rate_ngn: formData.hourly_rate_ngn
          ? Number(formData.hourly_rate_ngn)
          : null,
        location_city: formData.location_city,
        location_area: formData.location_area,
        phone_number: formData.phone_number,
        id_type: formData.id_type,
        id_number: formData.id_number,
        id_document_url: idDocumentUrl,
        profile_pictures_urls: profilePictureUrls,
        facebook_url: formData.facebook_url,
        twitter_url: formData.twitter_url,
        instagram_url: formData.instagram_url,
        tiktok_url: formData.tiktok_url,
        years_experience: formData.years_experience
          ? Number(formData.years_experience)
          : null,
        certifications: formData.certifications,
        available_days: formData.available_days,
        available_times: formData.available_times,
        transportation: formData.transportation,
        tools_equipment: formData.tools_equipment,
        verification_status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (workerError) throw workerError;
      setUploadProgress(90);

      // Update user type in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ user_type: "worker" })
        .eq("id", userId);

      if (profileError) throw profileError;
      setUploadProgress(100);

      router.push("/worker/dashboard");
    } catch (error: any) {
      console.error("Error setting up worker profile:", error);
      setError(
        error.message || "An error occurred while setting up your profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full max-w-4xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">
            Step {currentStep} of {totalSteps}
          </div>
          <div className="text-sm text-muted-foreground">
            {currentStep === 1 && "Personal Information"}
            {currentStep === 2 && "Verification"}
            {currentStep === 3 && "Location"}
            {currentStep === 4 && "Availability"}
            {currentStep === 5 && "Review & Submit"}
          </div>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={stepVariants}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="bio">About You</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell clients about your experience, qualifications, and what makes you great at what you do..."
                      rows={4}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      This helps clients understand your expertise and
                      personality
                    </p>
                  </div>

                  {/* Profile Pictures Upload */}
                  <div className="space-y-3">
                    <Label>Profile Pictures (Upload 1-3 clear photos)</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {profileImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg border overflow-hidden">
                            <Image
                              src={URL.createObjectURL(image)}
                              alt={`Profile ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProfileImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {profileImages.length < 3 && (
                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">
                            Add Photo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Clear face photos help build trust with clients
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label>Skills & Services *</Label>

                    <div className="space-y-2">
                      {skillCategories.map((category, catIndex) => {
                        const Icon = category.icon;
                        const isExpanded =
                          expandedCategories[catIndex] ?? false;
                        const selectedInCategory = category.skills.filter(
                          (skill) => formData.skills.includes(skill)
                        ).length;

                        return (
                          <div
                            key={category.name}
                            className="border rounded-lg overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => toggleCategory(catIndex)}
                              className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-left">
                                  <h4 className="font-semibold">
                                    {category.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {selectedInCategory} of{" "}
                                    {category.skills.length} selected
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                              </div>
                            </button>

                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t"
                              >
                                <div className="p-4">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-medium">
                                      Select skills:
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const allSelected =
                                          selectedInCategory ===
                                          category.skills.length;
                                        if (allSelected) {
                                          // Deselect all in this category
                                          setFormData((prev) => ({
                                            ...prev,
                                            skills: prev.skills.filter(
                                              (skill) =>
                                                !category.skills.includes(skill)
                                            ),
                                          }));
                                        } else {
                                          // Select all in this category
                                          setFormData((prev) => ({
                                            ...prev,
                                            skills: [
                                              ...new Set([
                                                ...prev.skills,
                                                ...category.skills,
                                              ]),
                                            ],
                                          }));
                                        }
                                      }}
                                    >
                                      {selectedInCategory ===
                                      category.skills.length
                                        ? "Deselect All"
                                        : "Select All"}
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {category.skills.map(
                                      (skill, skillIndex) => (
                                        <div
                                          key={skill}
                                          className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded"
                                        >
                                          <Checkbox
                                            id={`skill-${catIndex}-${skillIndex}`}
                                            checked={formData.skills.includes(
                                              skill
                                            )}
                                            onCheckedChange={() => {
                                              setFormData((prev) => ({
                                                ...prev,
                                                skills: prev.skills.includes(
                                                  skill
                                                )
                                                  ? prev.skills.filter(
                                                      (s) => s !== skill
                                                    )
                                                  : [...prev.skills, skill],
                                              }));
                                            }}
                                          />
                                          <Label
                                            htmlFor={`skill-${catIndex}-${skillIndex}`}
                                            className="font-normal cursor-pointer text-sm"
                                          >
                                            {skill}
                                          </Label>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">
                      Base Rate (₦) - Optional
                    </Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={formData.hourly_rate_ngn}
                      onChange={(e) =>
                        handleInputChange("hourly_rate_ngn", e.target.value)
                      }
                      placeholder="e.g., 2000"
                      min="0"
                      step="100"
                    />
                    <p className="text-sm text-muted-foreground">
                      You can set a base rate or negotiate per task
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Verification */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={stepVariants}
                  className="space-y-6"
                >
                  <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          Identity Verification
                        </h3>
                        <p className="text-sm text-blue-700 mt-1">
                          This information is required to verify your identity
                          and build trust with clients. All data is encrypted
                          and stored securely.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number *</Label>
                      <Input
                        id="phone_number"
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) =>
                          handleInputChange("phone_number", e.target.value)
                        }
                        placeholder="e.g., 08012345678"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="id_type">Government ID Type *</Label>
                      <Select
                        value={formData.id_type}
                        onValueChange={(value) =>
                          handleInputChange("id_type", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                        <SelectContent>
                          {idTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id_number">ID Number *</Label>
                    <Input
                      id="id_number"
                      value={formData.id_number}
                      onChange={(e) =>
                        handleInputChange("id_number", e.target.value)
                      }
                      placeholder="Enter your ID number"
                      required
                    />
                  </div>

                  {/* ID Document Upload */}
                  <div className="space-y-3">
                    <Label>Upload ID Document *</Label>
                    {idDocument ? (
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-green-600" />
                            <div>
                              <div className="font-medium">
                                {idDocument.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(idDocument.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIdDocument(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label className="block">
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:border-primary transition-colors">
                          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                          <div className="font-medium">
                            Upload your ID document
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Take a clear photo of your ID (NIN, Driver's
                            License, or Passport)
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Supports: JPG, PNG, PDF (Max 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleIdDocumentUpload}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>

                  {/* Social Media Links */}
                  <div className="space-y-4">
                    <Label>Social Media Links (Optional)</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="facebook_url" className="text-sm">
                          Facebook
                        </Label>
                        <Input
                          id="facebook_url"
                          type="url"
                          value={formData.facebook_url}
                          onChange={(e) =>
                            handleInputChange("facebook_url", e.target.value)
                          }
                          placeholder="https://facebook.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter_url" className="text-sm">
                          Twitter (X)
                        </Label>
                        <Input
                          id="twitter_url"
                          type="url"
                          value={formData.twitter_url}
                          onChange={(e) =>
                            handleInputChange("twitter_url", e.target.value)
                          }
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram_url" className="text-sm">
                          Instagram
                        </Label>
                        <Input
                          id="instagram_url"
                          type="url"
                          value={formData.instagram_url}
                          onChange={(e) =>
                            handleInputChange("instagram_url", e.target.value)
                          }
                          placeholder="https://instagram.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tiktok_url" className="text-sm">
                          TikTok
                        </Label>
                        <Input
                          id="tiktok_url"
                          type="url"
                          value={formData.tiktok_url}
                          onChange={(e) =>
                            handleInputChange("tiktok_url", e.target.value)
                          }
                          placeholder="https://tiktok.com/@username"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Social media helps clients learn more about you and builds
                      credibility
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Location */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={stepVariants}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <Label>Where are you located? *</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location_city">City *</Label>
                        <Select
                          value={formData.location_city}
                          onValueChange={(value) =>
                            handleInputChange("location_city", value)
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
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
                          Area/Neighborhood *
                        </Label>
                        <Input
                          id="location_area"
                          value={formData.location_area}
                          onChange={(e) =>
                            handleInputChange("location_area", e.target.value)
                          }
                          placeholder="e.g., Victoria Island, Ikeja, GRA"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Experience & Qualifications</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="years_experience">
                          Years of Experience
                        </Label>
                        <Select
                          value={formData.years_experience}
                          onValueChange={(value) =>
                            handleInputChange("years_experience", value)
                          }
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

                      <div className="space-y-2">
                        <Label htmlFor="transportation">
                          Transportation Method
                        </Label>
                        <Select
                          value={formData.transportation}
                          onValueChange={(value) =>
                            handleInputChange("transportation", value)
                          }
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

                    <div className="space-y-2">
                      <Label htmlFor="certifications">
                        Certifications & Training
                      </Label>
                      <Textarea
                        id="certifications"
                        value={formData.certifications}
                        onChange={(e) =>
                          handleInputChange("certifications", e.target.value)
                        }
                        placeholder="List any relevant certifications, training, or qualifications..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tools_equipment">Tools & Equipment</Label>
                      <Textarea
                        id="tools_equipment"
                        value={formData.tools_equipment}
                        onChange={(e) =>
                          handleInputChange("tools_equipment", e.target.value)
                        }
                        placeholder="Describe any tools, equipment, or materials you provide..."
                        rows={3}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Availability */}
              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={stepVariants}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <Label>Availability *</Label>

                    <div className="space-y-3">
                      <Label className="text-sm">Available Days *</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {availableDays.map((day) => (
                          <div
                            key={day}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`day-${day}`}
                              checked={formData.available_days.includes(day)}
                              onCheckedChange={() => handleDayToggle(day)}
                            />
                            <Label
                              htmlFor={`day-${day}`}
                              className="font-normal cursor-pointer text-sm"
                            >
                              {day}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="available_times">Preferred Times *</Label>
                      <Select
                        value={formData.available_times}
                        onValueChange={(value) =>
                          handleInputChange("available_times", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred time slots" />
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

                  {/* Hourly Rate Confirmation */}
                  <div className="rounded-lg bg-amber-50 p-4 border border-amber-100">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-amber-900">
                          Pricing Information
                        </h3>
                        <p className="text-sm text-amber-700 mt-1">
                          Your hourly rate is set to{" "}
                          <strong>₦{formData.hourly_rate_ngn || "0"}</strong>{" "}
                          per hour. You can adjust this later in your dashboard.
                        </p>
                        <div className="mt-3">
                          <Label htmlFor="rate_adjust" className="text-sm">
                            Want to adjust your rate?
                          </Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="rate_adjust"
                              type="number"
                              value={formData.hourly_rate_ngn}
                              onChange={(e) =>
                                handleInputChange(
                                  "hourly_rate_ngn",
                                  e.target.value
                                )
                              }
                              placeholder="Enter new rate"
                              className="flex-1"
                            />
                            <span className="self-center text-sm">₦/hour</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <motion.div
                  key="step-5"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={stepVariants}
                  className="space-y-6"
                >
                  <div className="rounded-lg bg-green-50 p-6 border border-green-100">
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-900">
                          Review Your Profile
                        </h3>
                        <p className="text-green-700">
                          Please review your information before submitting. This
                          will help clients find and trust you.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Summary sections */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Personal Information</h4>
                          <p className="text-sm">
                            {formData.bio.substring(0, 100)}...
                          </p>
                          <p className="text-sm">
                            <strong>Skills:</strong>{" "}
                            {formData.skills.slice(0, 3).join(", ")}...
                          </p>
                          <p className="text-sm">
                            <strong>Experience:</strong>{" "}
                            {formData.years_experience || "Not specified"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">
                            Location & Availability
                          </h4>
                          <p className="text-sm">
                            <strong>City:</strong> {formData.location_city}
                          </p>
                          <p className="text-sm">
                            <strong>Area:</strong> {formData.location_area}
                          </p>
                          <p className="text-sm">
                            <strong>Available Days:</strong>{" "}
                            {formData.available_days.slice(0, 3).join(", ")}
                          </p>
                          <p className="text-sm">
                            <strong>Hourly Rate:</strong> ₦
                            {formData.hourly_rate_ngn || "Negotiable"}
                          </p>
                        </div>
                      </div>

                      {/* Verification Status */}
                      <div className="rounded bg-blue-50 p-3 border border-blue-100">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">
                            Identity Verification
                          </span>
                          <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {formData.id_type ? "Document Uploaded" : "Pending"}
                          </span>
                        </div>
                      </div>

                      {/* Terms and Conditions */}
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="terms"
                            checked={agreeTerms}
                            onCheckedChange={(v) => setAgreeTerms(Boolean(v))}
                          />
                          <Label
                            htmlFor="terms"
                            className="font-normal text-sm"
                          >
                            I agree to the{" "}
                            <a
                              href="/terms"
                              className="text-primary hover:underline"
                            >
                              Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                              href="/privacy"
                              className="text-primary hover:underline"
                            >
                              Privacy Policy
                            </a>
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="accuracy"
                            checked={confirmAccuracy}
                            onCheckedChange={(v) =>
                              setConfirmAccuracy(Boolean(v))
                            }
                          />
                          <Label
                            htmlFor="accuracy"
                            className="font-normal text-sm"
                          >
                            I confirm that all information provided is accurate
                            and up-to-date
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {isLoading && (
                    <div className="space-y-2">
                      <Label>Uploading your information...</Label>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        {uploadProgress < 30 && "Uploading profile pictures..."}
                        {uploadProgress >= 30 &&
                          uploadProgress < 70 &&
                          "Verifying documents..."}
                        {uploadProgress >= 70 && "Finalizing your profile..."}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={nextStep}
                  disabled={isLoading}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!canSubmit || isLoading}
                  className="min-w-[120px] cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Setting Up...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips & Info */}
      <div className="mt-6 p-4 rounded-lg bg-slate-50 border">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-sm mb-1">
              Why We Need This Information
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>
                • Verification builds trust with clients and increases job
                opportunities
              </li>
              <li>• Complete profiles get 3x more job requests</li>
              <li>• Your data is encrypted and stored securely</li>
              <li>• You can update any information later in your dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
