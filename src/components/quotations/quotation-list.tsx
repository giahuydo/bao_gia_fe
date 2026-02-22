"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Plus, Loader2, FileText } from "lucide-react";
import { useQuotations } from "@/hooks/use-quotations";
import {
  QuotationStatus,
  QUOTATION_STATUS_OPTIONS,
  type IQuotation,
} from "@/types";
import { Input } from "@/components/ui/input";
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
import { QuotationStatusBadge } from "./quotation-status-badge";
import { QuotationTableActions } from "./quotation-table-actions";

const ALL_STATUSES = "all";

export function QuotationList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<QuotationStatus | typeof ALL_STATUSES>(
    ALL_STATUSES
  );
  const [page, setPage] = useState(1);
  const limit = 20;

  // Debounce search input
  const debounceTimer = useMemo(() => {
    let timer: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setDebouncedSearch(value);
        setPage(1);
      }, 300);
    };
  }, []);

  const { data, isLoading, isError } = useQuotations({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: status === ALL_STATUSES ? undefined : status,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debounceTimer(value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as QuotationStatus | typeof ALL_STATUSES);
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quotations</h1>
        <Button asChild>
          <Link href="/quotations/new">
            <Plus className="size-4" />
            Create New
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or number..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>All Statuses</SelectItem>
            {QUOTATION_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p>Failed to load quotations. Please try again.</p>
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FileText className="size-10 mb-3" />
          <p className="text-lg font-medium">No quotations found</p>
          <p className="text-sm">
            {debouncedSearch || status !== ALL_STATUSES
              ? "Try adjusting your search or filters."
              : "Create your first quotation to get started."}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((quotation: IQuotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">
                      {quotation.quotationNumber}
                    </TableCell>
                    <TableCell>{quotation.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {quotation.customerId}
                    </TableCell>
                    <TableCell>
                      <QuotationStatusBadge status={quotation.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(quotation.total)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(quotation.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <QuotationTableActions quotationId={quotation.id} />
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
              {Math.min(data.page * data.limit, data.total)} of {data.total}{" "}
              results
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
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
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
