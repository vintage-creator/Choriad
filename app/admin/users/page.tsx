// app/admin/users/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Briefcase, Filter } from "lucide-react";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";

type SearchParams = {
  tab?: string;
  clients_q?: string;
  workers_q?: string;
  workers_status?: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_type !== "admin") {
    redirect("/client/dashboard");
  }

  // Extract search params (defaults)
  const tab = (searchParams?.tab as string) || "clients";
  const clients_q = (searchParams?.clients_q || "").trim();
  const workers_q = (searchParams?.workers_q || "").trim();
  const workers_status = (searchParams?.workers_status || "all").trim();

  // Fetch clients with optional search
  let clientsQuery = supabase
    .from("profiles")
    .select("*, jobs(count)")
    .eq("user_type", "client")
    .order("created_at", { ascending: false });

  if (clients_q) {
    const escaped = clients_q.replace(/%/g, "\\%").replace(/_/g, "\\_");

    clientsQuery = clientsQuery.or(
      `full_name.ilike.%${escaped}%,email.ilike.%${escaped}%`
    );
  }

  const { data: clients, error: clientsError } = await clientsQuery;

  if (clientsError) {
    console.error("Error fetching clients:", clientsError);
  }

  let workersQuery = supabase
    .from("workers")
    .select(`
      *,
      profiles!workers_id_fkey(
        full_name,
        email,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  if (workers_status && workers_status !== "all") {
    workersQuery = workersQuery.eq("verification_status", workers_status);
  }

  if (workers_q) {
    const escapedW = workers_q.replace(/%/g, "\\%").replace(/_/g, "\\_");
    workersQuery = workersQuery.or(
      `profiles.full_name.ilike.%${escapedW}%,profiles.email.ilike.%${escapedW}%`
    );
  }

  const { data: workers, error: workersError } = await workersQuery;

  if (workersError) {
    console.error("Error fetching workers:", workersError);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <AdminHeader profile={profile} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">View and manage all platform users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Clients</p>
                  <h3 className="text-2xl font-bold">{clients?.length || 0}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Workers</p>
                  <h3 className="text-2xl font-bold">{workers?.length || 0}</h3>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs (use tab query param to select active tab) */}
        <Tabs defaultValue={tab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:w-[400px]">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="workers">Workers</TabsTrigger>
          </TabsList>

          {/* Clients */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                  <CardTitle>All Clients</CardTitle>

                  {/* Search / Filter form for clients (GET) */}
                  <form
                    method="get"
                    className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto"
                  >
                    {/* keep tab param so the page stays on the clients tab */}
                    <input type="hidden" name="tab" value="clients" />

                    <Input
                      name="clients_q"
                      defaultValue={clients_q}
                      placeholder="Search clients..."
                      className="w-full sm:w-64"
                      type="search"
                      aria-label="Search clients"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Link
                      href="/admin/users?tab=clients"
                      className="inline-flex items-center justify-center px-3 py-2 border rounded-md text-sm"
                    >
                      Clear
                    </Link>
                  </form>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {clients && clients.length > 0 ? (
                    clients.map((client: any) => (
                      <div
                        key={client.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar>
                            <AvatarImage src={client.avatar_url} />
                            <AvatarFallback>{client.full_name?.[0] || "C"}</AvatarFallback>
                          </Avatar>
                          <div className="truncate">
                            <p className="font-medium truncate">{client.full_name}</p>
                            <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(client.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No clients found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workers */}
          <TabsContent value="workers">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                  <CardTitle>All Workers</CardTitle>

                  {/* Search + filter form for workers */}
                  <form
                    method="get"
                    className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto"
                  >
                    <input type="hidden" name="tab" value="workers" />

                    <Input
                      name="workers_q"
                      defaultValue={workers_q}
                      placeholder="Search workers..."
                      className="w-full sm:w-64"
                      type="search"
                      aria-label="Search workers"
                    />

                    <select
                      name="workers_status"
                      defaultValue={workers_status || "all"}
                      className="border rounded-md px-3 py-2 text-sm bg-white"
                      aria-label="Filter by verification status"
                    >
                      <option value="all">All statuses</option>
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Apply
                    </Button>

                    <Link
                      href="/admin/users?tab=workers"
                      className="inline-flex items-center justify-center px-3 py-2 border rounded-md text-sm"
                    >
                      Clear
                    </Link>
                  </form>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {workers && workers.length > 0 ? (
                    workers.map((worker: any) => {
                      const workerProfile = Array.isArray(worker.profiles)
                        ? worker.profiles[0]
                        : worker.profiles;

                      return (
                        <div
                          key={worker.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar>
                              <AvatarImage src={worker.profile_pictures_urls?.[0]} />
                              <AvatarFallback>{workerProfile?.full_name?.[0] || "W"}</AvatarFallback>
                            </Avatar>
                            <div className="truncate">
                              <p className="font-medium truncate">{workerProfile?.full_name || "Worker"}</p>
                              <p className="text-sm text-muted-foreground truncate">{workerProfile?.email}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <Badge
                              variant="outline"
                              className={
                                worker.verification_status === "verified"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-50 text-gray-700"
                              }
                            >
                              {worker.verification_status}
                            </Badge>
                            <p className="text-sm text-muted-foreground">{worker.completed_jobs || 0} jobs</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No workers found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
