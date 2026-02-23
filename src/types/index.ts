// Re-export from shared types (single source of truth)
export {
  QuotationStatus,
  HistoryAction,
  type IQuotationItem,
  type IQuotation,
  type IQuotationHistory,
  type IAttachment,
} from "@shared/types/quotation";

export {
  type PaginatedResponse,
  type ApiResponse,
  SortOrder,
  type PaginationQuery,
} from "@shared/types/common";

export { type ICustomer } from "@shared/types/customer";
export { type IProduct } from "@shared/types/product";

export {
  UserRole,
  type IUser,
  type ILoginRequest,
  type ILoginResponse,
} from "@shared/types/user";

export {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_OPTIONS,
} from "@shared/constants/quotation-status";

export {
  PriceMonitoringJobStatus,
  PriceMonitoringTriggerType,
  PriceAlertSeverity,
  type IPriceMonitoringJob,
  type IPriceRecord,
  type IPriceAlert,
  type TriggerMonitoringRequest,
  type PriceMonitoringCallbackPayload,
} from "@shared/types/price-monitoring";

export {
  PRICE_CHANGE_THRESHOLDS,
  PRICE_MONITORING_JOB_STATUS_LABELS,
  PRICE_ALERT_SEVERITY_LABELS,
} from "@shared/constants/price-monitoring";
