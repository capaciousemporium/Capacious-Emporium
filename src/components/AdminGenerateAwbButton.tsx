"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Loader2 } from "lucide-react";

export default function AdminGenerateAwbButton({
  orderId,
}: {
  orderId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/orders/${orderId}/generate-awb`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      alert("AWB generated successfully");
      router.refresh();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to generate AWB"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn btn-secondary"
      onClick={handleGenerate}
      disabled={loading}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Truck size={14} />
      )}

      {loading ? "Generating..." : "Generate AWB"}
    </button>
  );
}