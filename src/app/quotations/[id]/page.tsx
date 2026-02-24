"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Pencil,
  Copy,
  Trash2,
  Send,
  Loader2,
  Calendar,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  useQuotation,
  useDeleteQuotation,
  useDuplicateQuotation,
  useChangeStatus,
} from "@/hooks/use-quotations";
import { QuotationStatus, HistoryAction } from "@/types";
import type { IQuotation, IQuotationHistory } from "@/types";
import { QuotationStatusBadge } from "@/components/quotations/quotation-status-badge";
import { QuotationPdfPreview } from "@/components/quotations/quotation-pdf-preview";
import { AttachmentList } from "@/components/attachments/attachment-list";
import { FileUpload } from "@/components/attachments/file-upload";
import { VersionList } from "@/components/versions/version-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const HISTORY_ACTION_LABELS: Record<string, string> = {
  [HistoryAction.CREATED]: "Created",
  [HistoryAction.UPDATED]: "Updated",
  [HistoryAction.STATUS_CHANGED]: "Status changed",
  [HistoryAction.DUPLICATED]: "Duplicated",
  [HistoryAction.PDF_EXPORTED]: "PDF exported",
  [HistoryAction.AI_EXTRACTED]: "AI extracted",
  [HistoryAction.AI_TRANSLATED]: "AI translated",
  [HistoryAction.NORMALIZED]: "Normalized",
  [HistoryAction.EMAIL_SENT]: "Email sent",
  [HistoryAction.INGESTION_FAILED]: "Ingestion failed",
  [HistoryAction.VERSION_CREATED]: "Version created",
  [HistoryAction.REVIEW_REQUESTED]: "Review requested",
  [HistoryAction.REVIEW_APPROVED]: "Review approved",
  [HistoryAction.REVIEW_REJECTED]: "Review rejected",
  [HistoryAction.COMPARISON_RUN]: "Comparison run",
};

function getHistoryIcon(action: HistoryAction) {
  switch (action) {
    case HistoryAction.CREATED:
      return <FileText className="size-4 text-green-600" />;
    case HistoryAction.STATUS_CHANGED:
      return <CheckCircle2 className="size-4 text-blue-600" />;
    case HistoryAction.UPDATED:
      return <Pencil className="size-4 text-orange-500" />;
    case HistoryAction.DUPLICATED:
      return <Copy className="size-4 text-violet-500" />;
    case HistoryAction.PDF_EXPORTED:
    case HistoryAction.EMAIL_SENT:
      return <Send className="size-4 text-indigo-500" />;
    case HistoryAction.INGESTION_FAILED:
    case HistoryAction.REVIEW_REJECTED:
      return <XCircle className="size-4 text-red-500" />;
    default:
      return <Clock className="size-4 text-muted-foreground" />;
  }
}

export default function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: quotation, isLoading, isError } = useQuotation(id);
  const deleteMutation = useDeleteQuotation();
  const duplicateMutation = useDuplicateQuotation();
  const changeStatusMutation = useChangeStatus();

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Quotation deleted");
        router.push("/quotations");
      },
      onError: () => toast.error("Failed to delete"),
    });
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate(id, {
      onSuccess: (newQuotation) => {
        toast.success("Quotation duplicated");
        router.push(`/quotations/${newQuotation.id}`);
      },
      onError: () => toast.error("Failed to duplicate"),
    });
  };

  const handleStatusChange = (status: QuotationStatus) => {
    changeStatusMutation.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Quotation marked as ${status}`),
        onError: () => toast.error("Failed to update status"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !quotation) {
    return (
      <div className="container mx-auto py-16 text-center">
        <FileText className="size-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium">Quotation not found</p>
        <p className="text-muted-foreground mt-1 mb-4">
          The quotation may have been deleted or you don&apos;t have access.
        </p>
        <Button variant="outline" asChild>
          <Link href="/quotations">
            <ArrowLeft className="size-4 mr-1" /> Back to list
          </Link>
        </Button>
      </div>
    );
  }

  const isDraft = quotation.status === QuotationStatus.DRAFT;
  const isSent = quotation.status === QuotationStatus.SENT;
  const customer = quotation.customer;
  const subtotal = Number(quotation.subtotal);
  const discountPct = Number(quotation.discount);
  const taxPct = Number(quotation.tax);
  const discountAmount = subtotal * discountPct / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * taxPct / 100;

  const history = (quotation as IQuotation & { history?: IQuotationHistory[] }).history;

  return (
    <div className="container mx-auto max-w-5xl py-6 px-4 space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <Link
          href="/quotations"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="size-3" /> Quotations
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold truncate">{quotation.title}</h1>
              <QuotationStatusBadge status={quotation.status} />
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Hash className="size-3.5" />
                {quotation.quotationNumber}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {format(new Date(quotation.createdAt), "MMM dd, yyyy")}
              </span>
              {quotation.validUntil && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  Valid until{" "}
                  {format(new Date(quotation.validUntil), "MMM dd, yyyy")}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isDraft && (
              <Button size="sm" onClick={() => handleStatusChange(QuotationStatus.SENT)}>
                <Send className="size-4 mr-1.5" /> Mark as Sent
              </Button>
            )}
            {isSent && (
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-700 border-green-300 hover:bg-green-50"
                  onClick={() => handleStatusChange(QuotationStatus.ACCEPTED)}
                >
                  <CheckCircle2 className="size-4 mr-1" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-700 border-red-300 hover:bg-red-50"
                  onClick={() => handleStatusChange(QuotationStatus.REJECTED)}
                >
                  <XCircle className="size-4 mr-1" /> Reject
                </Button>
              </div>
            )}

            <QuotationPdfPreview
              quotationId={id}
              quotationNumber={quotation.quotationNumber}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isDraft && (
                  <DropdownMenuItem asChild>
                    <Link href={`/quotations/${id}/edit`}>
                      <Pencil className="size-4" /> Edit
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDuplicate}
                  disabled={duplicateMutation.isPending}
                >
                  <Copy className="size-4" />
                  {duplicateMutation.isPending ? "Duplicating..." : "Duplicate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() =>
                    document.getElementById("delete-trigger")?.click()
                  }
                >
                  <Trash2 className="size-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button id="delete-trigger" className="hidden" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete quotation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove{" "}
                    <strong>{quotation.quotationNumber}</strong>. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <User className="size-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="font-semibold truncate">
                  {customer?.name ?? "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2.5">
                <Calendar className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Valid Until</p>
                <p className="font-semibold">
                  {quotation.validUntil
                    ? format(new Date(quotation.validUntil), "MMM dd, yyyy")
                    : "No expiry"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2.5">
                <FileText className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="font-semibold">
                  {quotation.items.length} line item
                  {quotation.items.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(quotation.total)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Line Items</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="attachments">
            Attachments
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] pl-6">#</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-[80px]">Unit</TableHead>
                    <TableHead className="w-[80px] text-right">Qty</TableHead>
                    <TableHead className="w-[150px] text-right">
                      Unit Price
                    </TableHead>
                    <TableHead className="w-[150px] text-right pr-6">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotation.items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No line items
                      </TableCell>
                    </TableRow>
                  ) : (
                    quotation.items.map((item, i) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground pl-6">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium pr-6">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Totals */}
              <div className="border-t px-6 py-4">
                <div className="flex justify-end">
                  <div className="w-[320px] space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discountPct > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Discount ({discountPct}%)
                        </span>
                        <span className="text-red-600">
                          -{formatCurrency(discountAmount)}
                        </span>
                      </div>
                    )}
                    {taxPct > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Tax ({taxPct}%)
                        </span>
                        <span>{formatCurrency(taxAmount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatCurrency(quotation.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Terms */}
          {(quotation.notes || quotation.terms) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {quotation.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {quotation.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
              {quotation.terms && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Terms & Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {quotation.terms}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Customer Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="size-4" /> Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer ? (
                  <>
                    <div>
                      <p className="font-semibold text-base">{customer.name}</p>
                      {customer.contactPerson && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                          <User className="size-3.5" />
                          {customer.contactPerson}
                        </p>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      {customer.email && (
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="size-3.5" />
                          <a
                            href={`mailto:${customer.email}`}
                            className="hover:text-foreground hover:underline"
                          >
                            {customer.email}
                          </a>
                        </p>
                      )}
                      {customer.phone && (
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="size-3.5" /> {customer.phone}
                        </p>
                      )}
                      {customer.address && (
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="size-3.5" /> {customer.address}
                        </p>
                      )}
                      {customer.taxCode && (
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Hash className="size-3.5" /> Tax: {customer.taxCode}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No customer linked
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quotation Meta */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="size-4" /> Quotation Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Number</dt>
                    <dd className="font-medium">
                      {quotation.quotationNumber}
                    </dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <QuotationStatusBadge status={quotation.status} />
                    </dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd>
                      {format(
                        new Date(quotation.createdAt),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Last Updated</dt>
                    <dd>
                      {format(
                        new Date(quotation.updatedAt),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Valid Until</dt>
                    <dd>
                      {quotation.validUntil
                        ? format(
                            new Date(quotation.validUntil),
                            "MMM dd, yyyy"
                          )
                        : "No expiry"}
                    </dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Version</dt>
                    <dd>
                      <Badge variant="secondary">v{quotation.version}</Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Versions */}
          <VersionList quotationId={id} />
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments" className="space-y-4">
          {isDraft && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Upload Attachment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload quotationId={id} />
              </CardContent>
            </Card>
          )}
          <AttachmentList quotationId={id} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history && history.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-4">
                    {history.map((entry: IQuotationHistory) => (
                      <div key={entry.id} className="flex gap-3 relative">
                        <div className="flex-shrink-0 mt-0.5 rounded-full bg-background border p-1.5 z-10">
                          {getHistoryIcon(entry.action)}
                        </div>
                        <div className="flex-1 min-w-0 pb-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-sm font-medium">
                              {HISTORY_ACTION_LABELS[entry.action] ??
                                entry.action}
                            </p>
                            <time className="text-xs text-muted-foreground shrink-0">
                              {format(
                                new Date(entry.createdAt),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </time>
                          </div>
                          {entry.note && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {entry.note}
                            </p>
                          )}
                          {entry.changes &&
                            Object.keys(entry.changes).length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {Object.entries(entry.changes).map(
                                  ([key, val]) => (
                                    <Badge
                                      key={key}
                                      variant="secondary"
                                      className="text-xs font-normal"
                                    >
                                      {key}: {String(val)}
                                    </Badge>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No activity recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
