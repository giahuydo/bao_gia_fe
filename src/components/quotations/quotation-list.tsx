"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Plus, Loader2, FileText, X } from "lucide-react";
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

interface DebouncedFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  minTotal: string;
  maxTotal: string;
}

const EMPTY_DEBOUNCED_FILTERS: DebouncedFilters = {
  search: "",
  dateFrom: "",
  dateTo: "",
  minTotal: "",
  maxTotal: "",
};

export function QuotationList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<QuotationStatus | typeof ALL_STATUSES>(
    ALL_STATUSES
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [debouncedFilters, setDebouncedFilters] = useState<DebouncedFilters>(
    EMPTY_DEBOUNCED_FILTERS
  );

  // Unified debounce: fires 300ms after any text/number filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({ search, dateFrom, dateTo, minTotal, maxTotal });
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, dateFrom, dateTo, minTotal, maxTotal]);

  const { data, isLoading, isError } = useQuotations({
    page,
    limit,
    search: debouncedFilters.search || undefined,
    status: status === ALL_STATUSES ? undefined : status,
    dateFrom: debouncedFilters.dateFrom || undefined,
    dateTo: debouncedFilters.dateTo || undefined,
    minTotal: debouncedFilters.minTotal
      ? Number(debouncedFilters.minTotal)
      : undefined,
    maxTotal: debouncedFilters.maxTotal
      ? Number(debouncedFilters.maxTotal)
      : undefined,
  });

  const handleStatusChange = (value: string) => {
    setStatus(value as QuotationStatus | typeof ALL_STATUSES);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus(ALL_STATUSES);
    setDateFrom("");
    setDateTo("");
    setMinTotal("");
    setMaxTotal("");
    setDebouncedFilters(EMPTY_DEBOUNCED_FILTERS);
    setPage(1);
  };

  // Count active filters using debounced values for accuracy
  const activeFilterCount = [
    debouncedFilters.search,
    status !== ALL_STATUSES ? status : "",
    debouncedFilters.dateFrom,
    debouncedFilters.dateTo,
    debouncedFilters.minTotal,
    debouncedFilters.maxTotal,
  ].filter(Boolean).length;

  // Show clear button as soon as raw input changes (better UX)
  const hasActiveFilters =
    search !== "" ||
    status !== ALL_STATUSES ||
    dateFrom !== "" ||
    dateTo !== "" ||
    minTotal !== "" ||
    maxTotal !== "";

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
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status */}
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

        {/* Date range */}
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[160px]"
          title="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[160px]"
          title="To date"
        />

        {/* Price range */}
        <Input
          type="number"
          value={minTotal}
          onChange={(e) => setMinTotal(e.target.value)}
          className="w-[150px]"
          placeholder="Min total (VND)"
          min={0}
        />
        <Input
          type="number"
          value={maxTotal}
          onChange={(e) => setMaxTotal(e.target.value)}
          className="w-[150px]"
          placeholder="Max total (VND)"
          min={0}
        />

        {/* Active filter indicator + Clear button */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
                active
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4 mr-1" />
              Clear
            </Button>
          </div>
        )}
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
            {hasActiveFilters
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
                  <TableRow
                    key={quotation.id}
                    className="cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/quotations/${quotation.id}`)
                    }
                  >
                    <TableCell className="font-medium text-primary">
                      {quotation.quotationNumber}
                    </TableCell>
                    <TableCell>{quotation.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {quotation.customer?.name ?? quotation.customerId}
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <QuotationTableActions
                        quotationId={quotation.id}
                        quotationNumber={quotation.quotationNumber}
                      />
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
