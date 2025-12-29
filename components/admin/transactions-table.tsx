// components/admin/transactions-table.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  jobTitle: string;
  amount: number;
  platformFee: number;
  workerPayout: number;
  workerName: string;
  clientName: string;
  status: string;
  completedAt: string;
  workerId: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 text-sm font-semibold">Job</th>
            <th className="text-left p-3 text-sm font-semibold">Worker</th>
            <th className="text-left p-3 text-sm font-semibold">Client</th>
            <th className="text-right p-3 text-sm font-semibold">Amount</th>
            <th className="text-right p-3 text-sm font-semibold">Platform Fee</th>
            <th className="text-right p-3 text-sm font-semibold">Worker Payout</th>
            <th className="text-center p-3 text-sm font-semibold">Status</th>
            <th className="text-right p-3 text-sm font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <div className="font-medium text-sm">{tx.jobTitle}</div>
                <div className="text-xs text-muted-foreground">
                  ID: {tx.id.slice(0, 8)}
                </div>
              </td>
              <td className="p-3 text-sm">{tx.workerName}</td>
              <td className="p-3 text-sm">{tx.clientName}</td>
              <td className="p-3 text-sm text-right font-semibold">
                ₦{tx.amount?.toLocaleString() || 0}
              </td>
              <td className="p-3 text-sm text-right text-green-600 font-semibold">
                ₦{tx.platformFee?.toLocaleString() || 0}
              </td>
              <td className="p-3 text-sm text-right">
                ₦{tx.workerPayout?.toLocaleString() || 0}
              </td>
              <td className="p-3 text-center">
                <Badge
                  className={
                    tx.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }
                >
                  {tx.status}
                </Badge>
              </td>
              <td className="p-3 text-sm text-right text-muted-foreground">
                {new Date(tx.completedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}