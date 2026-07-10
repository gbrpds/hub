import { createUploadUrl } from "@/app/upload-actions";

// Sobe um File direto para o Storage (mesmo fluxo de signed URL do FileUploader).
// Reutilizável fora do FileUploader (ex.: recorte de foto -> Blob -> upload).
export async function uploadFile(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<{ url: string; name: string }> {
  const target = await createUploadUrl(file.name, file.type);
  if (!target.ok) throw new Error(target.error);

  const form = new FormData();
  form.append("cacheControl", "3600");
  form.append("", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", target.uploadUrl);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ url: target.publicUrl, name: file.name });
      } else {
        reject(new Error(`Storage recusou o envio (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Falha de rede ao enviar."));
    xhr.send(form);
  });
}
