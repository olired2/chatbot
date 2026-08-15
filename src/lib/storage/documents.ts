import { readFile, unlink } from 'fs/promises';
import { join } from 'path';

/**
 * Punto único de decisión entre Vercel Blob y disco local.
 * Vercel tiene filesystem de solo lectura/efímero en producción, así que
 * sin BLOB_READ_WRITE_TOKEN el almacenamiento local solo es confiable en
 * desarrollo o en un servidor propio con disco persistente.
 */
export const useBlobStorage = () => !!process.env.BLOB_READ_WRITE_TOKEN;

function isLocalPath(path: string): boolean {
  return path.startsWith('/uploads/');
}

function localFilePath(path: string): string {
  return join(process.cwd(), 'public', path);
}

export async function saveDocument(
  classId: string,
  fileName: string,
  buffer: Buffer
): Promise<string> {
  const uniqueName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  if (useBlobStorage()) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`uploads/${classId}/${uniqueName}`, buffer, {
      access: 'public',
      contentType: 'application/pdf',
    });
    return blob.url;
  }

  const { mkdir, writeFile } = await import('fs/promises');
  const uploadDir = join(process.cwd(), 'public', 'uploads', classId);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, uniqueName), buffer);
  return `/uploads/${classId}/${uniqueName}`;
}

export async function readDocument(path: string): Promise<Buffer> {
  if (isLocalPath(path)) {
    return readFile(localFilePath(path));
  }

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Error descargando documento: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function deleteDocument(path: string): Promise<void> {
  if (isLocalPath(path)) {
    await unlink(localFilePath(path));
    return;
  }

  const { del } = await import('@vercel/blob');
  await del(path);
}
