"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminTrackingButton({
  orderId,
}: {
  orderId: string;
}) {
  const [trackingNo, setTrackingNo] = useState("");
  const router = useRouter();

  const saveTracking = async () => {
    const res = await fetch(
      `/api/admin/orders/${orderId}/tracking`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackingNumber: trackingNo,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Tracking Number Saved");
    router.refresh();
  };

  return (
    <div>
      <input
        value={trackingNo}
        onChange={(e) => setTrackingNo(e.target.value)}
        placeholder="Shiprocket Tracking Number"
      />
<div style={{ display: "grid", gap: "0.35rem"  }}><button onClick={saveTracking}  type="button"
        className="btn btn-secondary"
        
        style={{ fontSize: "0.75rem", padding: "0.45rem 0.7rem" }}>
        Save Tracking
      </button></div>
      
    </div>
  );
}