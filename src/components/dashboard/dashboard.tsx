"use client";

import { format } from "date-fns";
import { FileText, DollarSign, Users, Package, Loader2 } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { QuotationStatus, QUOTATION_STATUS_LABELS } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuotationStatusBadge } from "@/components/quotations/quotation-status-badge";
import type { IDashboardStats } from "@shared/types/dashboard";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

const STATUS_ORDER: QuotationStatus[] = [
  QuotationStatus.DRAFT,
  QuotationStatus.SENT,
  QuotationStatus.ACCEPTED,
  QuotationStatus.REJECTED,
  QuotationStatus.EXPIRED,
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardContent({ stats }: { stats: IDashboardStats }) {
  return (
    <div className="space-y-6">
      {/* Row 1 - Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Quotations"
          value={stats.totalQuotations}
          icon={<FileText className="size-4" />}
        />
        <StatCard
          title="Accepted Revenue"
          value={formatCurrency(stats.acceptedRevenue)}
          icon={<DollarSign className="size-4" />}
          description="From accepted quotations"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<Users className="size-4" />}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package className="size-4" />}
        />
      </div>

      {/* Row 2 - Status breakdown + Monthly trend */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quotations by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalQuotations === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No quotations yet.
              </p>
            ) : (
              <div className="space-y-3">
                {STATUS_ORDER.map((status) => {
                  const count = stats.statusBreakdown[status] ?? 0;
                  const pct =
                    stats.totalQuotations > 0
                      ? Math.round((count / stats.totalQuotations) * 100)
                      : 0;
                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <QuotationStatusBadge status={status} />
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground w-8 text-right">
                          {pct}%
                        </span>
                        <span className="font-medium w-6 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.monthlyTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No data available.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.monthlyTrend.slice(-6).map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3 - Recent quotations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Quotations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stats.recentQuotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <FileText className="size-8 mb-2" />
              <p className="text-sm font-medium">No quotations yet</p>
              <p className="text-xs">
                Create your first quotation to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentQuotations.slice(0, 5).map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">
                      {q.quotationNumber}
                    </TableCell>
                    <TableCell>{q.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {q.customerName}
                    </TableCell>
                    <TableCell>
                      <QuotationStatusBadge status={q.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(q.total)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(q.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function Dashboard() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <p className="text-sm">
          Failed to load dashboard data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <DashboardContent stats={data} />
    </div>
  );
}
