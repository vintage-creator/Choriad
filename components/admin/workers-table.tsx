// components/admin/workers-table.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Shield, Star } from "lucide-react";
import Link from "next/link";

interface Worker {
  id: string;
  rating: number;
  total_reviews: number;
  completed_jobs: number;
  verification_status: string;
  profile_pictures_urls?: string[];
  profiles: {
    full_name: string;
    email: string;
    created_at: string;
  };
}

interface WorkersTableProps {
  workers: Worker[];
}

export function WorkersTable({ workers }: WorkersTableProps) {
  if (workers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No workers registered yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 text-sm font-semibold">Worker</th>
            <th className="text-left p-3 text-sm font-semibold">Email</th>
            <th className="text-center p-3 text-sm font-semibold">Rating</th>
            <th className="text-center p-3 text-sm font-semibold">Jobs</th>
            <th className="text-center p-3 text-sm font-semibold">Status</th>
            <th className="text-left p-3 text-sm font-semibold">Joined</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => {
            const profile = Array.isArray(worker.profiles)
              ? worker.profiles[0]
              : worker.profiles;

            return (
              <tr key={worker.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={worker.profile_pictures_urls?.[0]} />
                      <AvatarFallback>
                        {profile?.full_name?.[0] || "W"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {profile?.full_name || "Worker"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {worker.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm">{profile?.email || "N/A"}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-sm">
                      {worker.rating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({worker.total_reviews || 0})
                    </span>
                  </div>
                </td>
                <td className="p-3 text-center font-semibold text-sm">
                  {worker.completed_jobs || 0}
                </td>
                <td className="p-3 text-center">
                  <Badge
                    variant="outline"
                    className={
                      worker.verification_status === "verified"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : worker.verification_status === "pending"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }
                  >
                    {worker.verification_status === "verified" && (
                      <Shield className="h-3 w-3 mr-1" />
                    )}
                    {worker.verification_status}
                  </Badge>
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {new Date(profile?.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <div className="flex gap-2 justify-end">
                    {worker.verification_status === "pending" && (
                      <Button size="sm" asChild>
                        <Link href={`/admin/verifications/${worker.id}`}>
                          Verify
                        </Link>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}