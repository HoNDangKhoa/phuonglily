"use client";

import { useState } from "react";
import { ImageDropzone } from "@/components/admin/BrandAssetForm";
import { Label } from "@/components/ui/input";

/** Controlled image field with upload UI + hidden input for FormData submit */
export function ImageUploadField({
  name = "imageUrl",
  label = "Thêm ảnh",
  defaultValue = "",
  required,
}: {
  name?: string;
  label?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue);

  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={url} required={required} />
      <div className="mt-1">
        <ImageDropzone value={url} onChange={setUrl} />
      </div>
    </div>
  );
}
