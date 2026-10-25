import { useState } from "react";

export function useVision() {
  const [image, setImage] = useState<File | null>(null);

  const uploadImage = (file: File) => {
    setImage(file);
  };

  return {
    image,
    uploadImage,
  };
}