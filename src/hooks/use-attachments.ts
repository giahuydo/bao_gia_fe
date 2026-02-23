import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAttachments,
  uploadAttachment,
  deleteAttachment,
} from "@/lib/api/attachments";

export function useAttachments(quotationId: string) {
  return useQuery({
    queryKey: ["attachments", quotationId],
    queryFn: () => getAttachments(quotationId),
    enabled: !!quotationId,
  });
}

export function useUploadAttachment(quotationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(quotationId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attachments", quotationId],
      });
    },
  });
}

export function useDeleteAttachment(quotationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attachments", quotationId],
      });
    },
  });
}
