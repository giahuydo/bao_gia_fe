import { api } from "@/lib/api";

export interface IAttachmentInfo {
  id: string;
  quotationId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  uploadedBy: string;
  createdAt: string;
}

export async function getAttachments(
  quotationId: string
): Promise<IAttachmentInfo[]> {
  const { data } = await api.get<IAttachmentInfo[]>(
    `/quotations/${quotationId}/attachments`
  );
  return data;
}

export async function uploadAttachment(
  quotationId: string,
  file: File
): Promise<IAttachmentInfo> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<IAttachmentInfo>(
    `/quotations/${quotationId}/attachments`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function downloadAttachment(id: string): Promise<Blob> {
  const { data } = await api.get(`/attachments/${id}/download`, {
    responseType: "blob",
  });
  return data;
}

export async function deleteAttachment(id: string): Promise<void> {
  await api.delete(`/attachments/${id}`);
}
