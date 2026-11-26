"use client";

import { useRouter } from "next/navigation";
import GetApiKeyModal from "../../../components/api-keys/GetApiKeyModal";

export default function GetApiKeyRoute() {
  const router = useRouter();

  return (
    <GetApiKeyModal
      onClose={() => router.push("/dashboard")}
    />
  );
}