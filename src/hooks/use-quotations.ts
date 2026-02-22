import { useQuery } from "@tanstack/react-query";
import {
  getQuotations,
  type GetQuotationsParams,
} from "@/lib/api/quotations";

export function useQuotations(params: GetQuotationsParams = {}) {
  return useQuery({
    queryKey: ["quotations", params],
    queryFn: () => getQuotations(params),
  });
}
