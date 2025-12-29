// /app/worker/setup/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerSetupForm } from "@/components/worker/worker-setup-form";
import { SetupHeader } from "./SetupHeader";
import { Footer } from "@/components/landing/footer";

export default async function WorkerSetupPage({
  searchParams,
}: {
  searchParams: { step?: string } | Promise<{ step?: string }>;
}) {
  const sp = await searchParams;
  const currentStep = Math.min(5, Math.max(1, Number(sp?.step ?? 1)));

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Check if user already has a worker profile
  const { data: workerProfile } = await supabase
    .from("workers")
    .select("*")
    .eq("id", user.id)
    .single();

  if (workerProfile) {
    redirect("/worker/dashboard");
  }

  return (
    <>
      <SetupHeader />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Complete Your Worker Profile
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Set up your profile to start earning. Complete all sections to get
              verified and receive job requests.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left sidebar with steps */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-xl border bg-white p-6">
                  <h3 className="font-semibold mb-4">Setup Process</h3>
                  <div className="space-y-4">
                    {[
                      {
                        number: 1,
                        title: "Personal Info",
                        desc: "Bio, photos & skills",
                      },
                      {
                        number: 2,
                        title: "Verification",
                        desc: "ID, phone & social media",
                      },
                      {
                        number: 3,
                        title: "Location",
                        desc: "City, area & experience",
                      },
                      {
                        number: 4,
                        title: "Availability",
                        desc: "Schedule & rates",
                      },
                      { number: 5, title: "Review", desc: "Confirm & submit" },
                    ].map((step) => {
                      const isActive = step.number === currentStep;
                      const isCompleted = step.number < currentStep;

                      return (
                        <div
                          key={step.number}
                          className="flex items-start gap-3"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isActive || isCompleted
                                ? "bg-primary text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {step.number}
                          </div>
                          <div>
                            <div
                              className={`font-medium ${
                                isActive || isCompleted
                                  ? "text-foreground"
                                  : "text-slate-400"
                              }`}
                            >
                              {step.title}
                            </div>
                            <div className="text-sm text-slate-500">
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tips Card */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
                  <h3 className="font-semibold text-emerald-900 mb-2">
                    Pro Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-emerald-800">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">✓</span>
                      <span>Use clear, well-lit profile photos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">✓</span>
                      <span>Be specific about your skills and experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">✓</span>
                      <span>Complete verification for trust badges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">✓</span>
                      <span>Set realistic availability to avoid conflicts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Main form */}
            <div className="lg:col-span-2">
              <WorkerSetupForm userId={user.id} currentStep={currentStep} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
