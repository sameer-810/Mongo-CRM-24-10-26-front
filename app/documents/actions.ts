"use server";

import {
  uploadDocument,
  getDocumentsByLeadId,
  updateDocument,
  deleteDocument,
  getLeadIds,
  getDocumentPresignedUrl,
  registerDocumentFromS3,
  updateDocumentFromS3,
} from "@/lib/server-actions";
import { GetDocumentsByLeadIdResponseType } from "@/lib/types";

export async function uploadDocumentAction(formData: FormData) {
  return uploadDocument(formData);
}

export async function getDocumentPresignedUrlAction(
  fileName: string,
  contentType: string
) {
  return getDocumentPresignedUrl(fileName, contentType);
}

export async function registerDocumentFromS3Action(data: {
  s3Key: string;
  leadId: string;
  documentLabel?: string;
  expiryDate?: string;
}) {
  return registerDocumentFromS3(data);
}

export async function updateDocumentFromS3Action(
  id: string,
  data: { s3Key?: string; expiryDate?: string }
) {
  return updateDocumentFromS3(id, data);
}

export async function getDocumentsByLeadIdAction(leadId: string) {
  return getDocumentsByLeadId(
    leadId
  ) as Promise<GetDocumentsByLeadIdResponseType>;
}

export async function updateDocumentAction(id: string, formData: FormData) {
  return updateDocument(id, formData);
}

export async function deleteDocumentAction(id: string) {
  return deleteDocument(id);
}

export async function getLeadsAction(search?: string) {
  return getLeadIds(search);
}