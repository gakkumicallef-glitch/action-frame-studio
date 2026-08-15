/** Client-side image compression: shrinks images below a target size. */
export async function compressImage(file: File, targetBytes = 500 * 1024): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  let maxEdge = 2200;
  let quality = 0.82;

  for (let attempt = 0; attempt < 7; attempt++) {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) return file;
    if (blob.size <= targetBytes || attempt === 6) {
      return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
        type: "image/jpeg",
      });
    }
    quality -= 0.1;
    if (quality < 0.45) {
      quality = 0.7;
      maxEdge = Math.round(maxEdge * 0.75);
    }
  }
  return file;
}