"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { Loader2, BarChart3, Zap, DollarSign, Hash } from "lucide-react";
import { useUsageSummary, useUsageRecords } from "@/hooks/use-ai";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const OPERATION_LABELS: Record<string, string> = {
  generate: "Generate",
  suggest: "Suggest",
  improve: "Improve",
  extract: "Extract",
  translate: "Translate",
  compare: "Compare",
};

export function AiUsageDashboard() {
  const [from, setFrom] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [page, setPage] = useState(1);

  const { data: summary, isLoading: summaryLoading } = useUsageSummary({
    from,
    to,
  });
  const { data: records, isLoading: recordsLoading } = useUsageRecords({
    from,
    to,
    page,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      {/* Date filter */}
      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">From</Label>
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="w-[160px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="w-[160px]"
          />
        </div>
      </div>

      {/* Summary cards */}
      {summaryLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="size-3.5" /> Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary.totalRequests}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                  <Zap className="size-3.5" /> Total Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {summary.totalTokens.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  In: {summary.totalInputTokens.toLocaleString()} / Out:{" "}
                  {summary.totalOutputTokens.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="size-3.5" /> Total Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ${summary.totalCostUsd.toFixed(4)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                  <BarChart3 className="size-3.5" /> By Operation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {Object.entries(summary.byOperation).map(([op, data]) => (
                    <div
                      key={op}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{OPERATION_LABELS[op] || op}</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {data.requests}
                      </Badge>
                    </div>
                  ))}
                  {Object.keys(summary.byOperation).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No data yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {/* Records table */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Records</CardTitle>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : !records || records.data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No usage records for this period.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Input</TableHead>
                    <TableHead className="text-right">Output</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.data.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {OPERATION_LABELS[record.operation] ||
                            record.operation}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {record.model}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {Number(record.inputTokens).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {Number(record.outputTokens).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        ${Number(record.costUsd).toFixed(4)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(
                          new Date(record.createdAt),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {records.total > 20 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {records.page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={records.data.length < 20}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
