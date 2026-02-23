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
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useQuotation, useDeleteQuotation, useDuplicateQuotation, useChangeStatus } from "@/hooks/use-quotations";
import { exportQuotationPdf } from "@/lib/api/quotations";
import { QuotationStatus } from "@/types";
import { QuotationStatusBadge } from "@/components/quotations/quotation-status-badge";
import { AttachmentList } from "@/components/attachments/attachment-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

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

  const handleSend = () => {
    changeStatusMutation.mutate(
      { id, status: QuotationStatus.SENT },
      {
        onSuccess: () => toast.success("Quotation marked as sent"),
        onError: () => toast.error("Failed to update status"),
      }
    );
  };

  const handleExportPdf = async () => {
    try {
      const blob = await exportQuotationPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quotation-${quotation?.quotationNumber || id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export PDF");
    }
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
        <p className="text-muted-foreground">Quotation not found.</p>
        <Link href="/quotations" className="text-primary hover:underline mt-2 inline-block">
          Back to list
        </Link>
      </div>
    );
  }

  const isDraft = quotation.status === QuotationStatus.DRAFT;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/quotations"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="size-3" /> Back to list
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{quotation.title}</h1>
            <QuotationStatusBadge status={quotation.status} />
          </div>
          <p className="text-muted-foreground mt-1">
            {quotation.quotationNumber} &middot; Created{" "}
            {format(new Date(quotation.createdAt), "dd/MM/yyyy HH:mm")}
          </p>
        </div>
        <div className="flex gap-2">
          {isDraft && (
            <>
              <Button variant="outline" size="sm" onClick={handleSend}>
                <Send className="size-4 mr-1" /> Send
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/quotations/${id}/edit`}>
                  <Pencil className="size-4 mr-1" /> Edit
                </Link>
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <Download className="size-4 mr-1" /> PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
          >
            <Copy className="size-4 mr-1" /> Duplicate
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="size-4 mr-1" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete quotation?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this quotation. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Info */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{quotation.customerId}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Valid Until
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {quotation.validUntil
                ? format(new Date(quotation.validUntil), "dd/MM/yyyy")
                : "No expiry"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(quotation.total)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotation.items.map((item, i) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end border-t mt-2 pt-4 space-y-1">
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">
                Subtotal: {formatCurrency(quotation.subtotal)}
              </p>
              {quotation.discount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Discount: -{formatCurrency(quotation.discount)}
                </p>
              )}
              {quotation.tax > 0 && (
                <p className="text-sm text-muted-foreground">
                  Tax: {formatCurrency(quotation.tax)}
                </p>
              )}
              <p className="text-lg font-bold">
                Total: {formatCurrency(quotation.total)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {(quotation.notes || quotation.terms) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {quotation.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{quotation.notes}</p>
              </CardContent>
            </Card>
          )}
          {quotation.terms && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{quotation.terms}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Attachments */}
      <AttachmentList quotationId={id} />
    </div>
  );
}
