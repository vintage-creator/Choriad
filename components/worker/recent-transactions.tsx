// components/worker/recent-transactions.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, Calendar, ExternalLink, Download, Filter } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface Transaction {
  id: string;
  amount_ngn: number;
  created_at: string;
  status: string;
  job_title?: string | null;
  client_name?: string | null;
  // raw fallbacks (older shape)
  jobs?: any;
  profiles?: any;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + (t.amount_ngn || 0), 0);

  const resolveJobTitle = (t: Transaction) => {
    if (t.job_title) return t.job_title;
    // fallback: jobs could be an object or array
    if (t.jobs) {
      if (Array.isArray(t.jobs)) return t.jobs[0]?.title ?? "N/A";
      if (typeof t.jobs === "object") return t.jobs.title ?? "N/A";
    }
    return "N/A";
  };

  const resolveClientName = (t: Transaction) => {
    if (t.client_name) return t.client_name;
    if (t.profiles) {
      if (Array.isArray(t.profiles)) return t.profiles[0]?.full_name ?? "Client";
      if (typeof t.profiles === "object") return t.profiles.full_name ?? "Client";
    }
    return "Client";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <PiggyBank className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Job</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{resolveJobTitle(transaction)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-600">{resolveClientName(transaction)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{format(new Date(transaction.created_at), "MMM d, yyyy")}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            transaction.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-semibold text-green-700">
                          <PiggyBank className="h-4 w-4" />
                          ₦{transaction.amount_ngn.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="h-8">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total ({filteredTransactions.length} transactions)</p>
                  <p className="text-2xl font-bold">₦{totalAmount.toLocaleString()}</p>
                </div>
                <Button variant="outline">View All Transactions</Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
