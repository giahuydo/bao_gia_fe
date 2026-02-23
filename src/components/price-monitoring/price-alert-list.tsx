"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bell, ArrowUp, ArrowDown, Check, Loader2 } from "lucide-react";
import { usePriceAlerts, useMarkAlertRead, useMarkAllAlertsRead } from "@/hooks/use-price-monitoring";
import {
  PriceAlertSeverity,
  PRICE_ALERT_SEVERITY_LABELS,
  type IPriceAlert,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ALL_SEVERITIES = "all";

const severityStyles: Record<PriceAlertSeverity, string> = {
  [PriceAlertSeverity.INFO]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  [PriceAlertSeverity.WARNING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  [PriceAlertSeverity.CRITICAL]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

interface AlertSeverityBadgeProps {
  severity: PriceAlertSeverity;
}

function AlertSeverityBadge({ severity }: AlertSeverityBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-0", severityStyles[severity])}>
      {PRICE_ALERT_SEVERITY_LABELS[severity]}
    </Badge>
  );
}

export function PriceAlertList() {
  const [severity, setSeverity] = useState<string>(ALL_SEVERITIES);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = usePriceAlerts({
    page,
    limit,
    severity: severity === ALL_SEVERITIES ? undefined : severity,
    unreadOnly: unreadOnly || undefined,
  });

  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();

  const handleSeverityChange = (value: string) => {
    setSeverity(value);
    setPage(1);
  };

  const handleMarkRead = (alert: IPriceAlert) => {
    if (!alert.isRead) {
      markRead.mutate(alert.id);
    }
  };

  const unreadCount = data?.data.filter((a) => !a.isRead).length ?? 0;

  return (
    <div className="space-y-4">
      {/* Filters + Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select value={severity} onValueChange={handleSeverityChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SEVERITIES}>All Severities</SelectItem>
              <SelectItem value={PriceAlertSeverity.INFO}>
                {PRICE_ALERT_SEVERITY_LABELS[PriceAlertSeverity.INFO]}
              </SelectItem>
              <SelectItem value={PriceAlertSeverity.WARNING}>
                {PRICE_ALERT_SEVERITY_LABELS[PriceAlertSeverity.WARNING]}
              </SelectItem>
              <SelectItem value={PriceAlertSeverity.CRITICAL}>
                {PRICE_ALERT_SEVERITY_LABELS[PriceAlertSeverity.CRITICAL]}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={unreadOnly ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setUnreadOnly((v) => !v);
              setPage(1);
            }}
          >
            Unread only
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={markAllRead.isPending || unreadCount === 0}
          onClick={() => markAllRead.mutate()}
        >
          {markAllRead.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Check className="mr-2 size-4" />
          )}
          Mark All Read
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p>Failed to load alerts. Please try again.</p>
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bell className="size-10 mb-3" />
          <p className="text-lg font-medium">No alerts found</p>
          <p className="text-sm">
            {severity !== ALL_SEVERITIES || unreadOnly
              ? "Try adjusting your filters."
              : "No price alerts have been generated yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Previous</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((alert: IPriceAlert) => (
                  <TableRow
                    key={alert.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      !alert.isRead && "bg-blue-50/50 dark:bg-blue-950/20 font-medium"
                    )}
                    onClick={() => handleMarkRead(alert)}
                  >
                    <TableCell>
                      <AlertSeverityBadge severity={alert.severity} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {alert.productName ?? alert.productId}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatPrice(alert.previousPrice)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatPrice(alert.currentPrice)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      <span
                        className={cn(
                          "flex items-center justify-end gap-1",
                          alert.priceChangePercent > 0
                            ? "text-red-600"
                            : "text-green-600"
                        )}
                      >
                        {alert.priceChangePercent > 0 ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )}
                        {Math.abs(alert.priceChangePercent).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                      {alert.message}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(alert.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      {!alert.isRead && (
                        <span className="inline-block size-2 rounded-full bg-blue-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(data.page - 1) * data.limit + 1} to{" "}
              {Math.min(data.page * data.limit, data.total)} of {data.total} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
