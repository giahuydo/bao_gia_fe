import { Badge } from "@/components/ui/badge";
import { QuotationStatus, QUOTATION_STATUS_LABELS } from "@/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<QuotationStatus, string> = {
  [QuotationStatus.DRAFT]:
    "bg-secondary text-secondary-foreground",
  [QuotationStatus.SENT]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  [QuotationStatus.ACCEPTED]:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  [QuotationStatus.REJECTED]:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  [QuotationStatus.EXPIRED]:
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <Badge variant="outline" className={cn("border-0", statusStyles[status])}>
      {QUOTATION_STATUS_LABELS[status]}
    </Badge>
  );
}
