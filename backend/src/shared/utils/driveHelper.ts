export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  // Match standard /d/FILE_ID/view or id=FILE_ID
  const match = url.match(/(?:id=|\/d\/)([\w-]{25,})/);
  return match ? match[1] : null;
}

export async function downloadDriveFile(fileId: string): Promise<Buffer> {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file from Google Drive: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
