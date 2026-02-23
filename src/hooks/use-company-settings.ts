import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompanySettings,
  updateCompanySettings,
  type UpdateCompanySettingsDto,
} from "@/lib/api/company-settings";

export function useCompanySettings() {
  return useQuery({
    queryKey: ["company-settings"],
    queryFn: getCompanySettings,
  });
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCompanySettingsDto) => updateCompanySettings(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
    },
  });
}
