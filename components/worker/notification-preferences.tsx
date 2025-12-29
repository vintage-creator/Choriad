// components/worker/notification-preferences.tsx
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bell, Mail, Smartphone, Save, RefreshCw } from "lucide-react"

interface NotificationPreferencesProps {
  preferences: any
  workerId: string
}

interface Preferences {
    email_jobs: boolean
    email_bookings: boolean
    email_payments: boolean
    push_jobs: boolean
    push_bookings: boolean
    push_payments: boolean
    push_reviews: boolean
  }  

export function NotificationPreferences({ preferences: initialPreferences, workerId }: NotificationPreferencesProps) {
    const [preferences, setPreferences] = useState<Preferences>(initialPreferences)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setIsSaved(false)
  }

  const savePreferences = async () => {
    setIsLoading(true)
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          ...preferences,
          user_id: workerId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id"
        })

      if (error) throw error
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefaults = () => {
    setPreferences({
      ...preferences,
      email_jobs: true,
      email_bookings: true,
      email_payments: true,
      push_jobs: true,
      push_bookings: true,
      push_payments: true,
      push_reviews: true,
    })
    setIsSaved(false)
  }

  return (
    <div className="space-y-6">
      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-4 w-4 text-gray-500" />
              <h3 className="font-semibold">Email Notifications</h3>
            </div>
            <div className="space-y-4 pl-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-jobs" className="font-normal">
                    New job opportunities
                  </Label>
                  <p className="text-sm text-gray-500">
                    Get notified when new jobs are posted in your city
                  </p>
                </div>
                <Switch
                  id="email-jobs"
                  checked={preferences.email_jobs}
                  onCheckedChange={() => handleToggle("email_jobs")}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-bookings" className="font-normal">
                    Booking updates
                  </Label>
                  <p className="text-sm text-gray-500">
                    Booking confirmations, cancellations, and reminders
                  </p>
                </div>
                <Switch
                  id="email-bookings"
                  checked={preferences.email_bookings}
                  onCheckedChange={() => handleToggle("email_bookings")}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-payments" className="font-normal">
                    Payment notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Payment receipts and pending payments
                  </p>
                </div>
                <Switch
                  id="email-payments"
                  checked={preferences.email_payments}
                  onCheckedChange={() => handleToggle("email_payments")}
                />
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-4 w-4 text-gray-500" />
              <h3 className="font-semibold">Push Notifications</h3>
            </div>
            <div className="space-y-4 pl-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-jobs" className="font-normal">
                    Instant job alerts
                  </Label>
                  <p className="text-sm text-gray-500">
                    Get real-time alerts for urgent jobs
                  </p>
                </div>
                <Switch
                  id="push-jobs"
                  checked={preferences.push_jobs}
                  onCheckedChange={() => handleToggle("push_jobs")}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-bookings" className="font-normal">
                    Booking status changes
                  </Label>
                  <p className="text-sm text-gray-500">
                    When clients confirm or cancel bookings
                  </p>
                </div>
                <Switch
                  id="push-bookings"
                  checked={preferences.push_bookings}
                  onCheckedChange={() => handleToggle("push_bookings")}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-payments" className="font-normal">
                    Payment updates
                  </Label>
                  <p className="text-sm text-gray-500">
                    When payments are sent or received
                  </p>
                </div>
                <Switch
                  id="push-payments"
                  checked={preferences.push_payments}
                  onCheckedChange={() => handleToggle("push_payments")}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-reviews" className="font-normal">
                    New reviews
                  </Label>
                  <p className="text-sm text-gray-500">
                    When clients leave reviews on your profile
                  </p>
                </div>
                <Switch
                  id="push-reviews"
                  checked={preferences.push_reviews}
                  onCheckedChange={() => handleToggle("push_reviews")}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={savePreferences}
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : isSaved ? "Saved!" : "Save Preferences"}
            </Button>
            <Button
              variant="outline"
              onClick={resetToDefaults}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              Enable job alerts to be the first to apply for new opportunities
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              Booking notifications help you stay organized and avoid missed jobs
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              Payment alerts ensure you're notified when funds are available
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}