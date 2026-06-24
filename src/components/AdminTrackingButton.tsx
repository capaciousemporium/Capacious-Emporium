"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminTrackingButton({
  orderId,
}: {
  orderId: string;
}) {
  const router = useRouter();

  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("Shiprocket");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [loading, setLoading] = useState(false);

  const saveTracking = async () => {
    if (!trackingNumber.trim()) {
      alert("Tracking Number Required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/orders/${orderId}/tracking`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trackingNumber,
            courierName,
            expectedDelivery,
            trackingUrl: `https://www.shiprocket.in/shipment-tracking/${trackingNumber}`,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed");
      }

      alert("Shipment Details Saved");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gap: "0.4rem",
      }}
    >
      <input
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        placeholder="AWB / Tracking Number"
      />

      <input
        value={courierName}
        onChange={(e) => setCourierName(e.target.value)}
        placeholder="Courier Name"
      />

      <input
        type="date"
        value={expectedDelivery}
        onChange={(e) => setExpectedDelivery(e.target.value)}
      />

      <button
        type="button"
        onClick={saveTracking}
        disabled={loading}
        className="btn btn-secondary"
        style={{
          fontSize: "0.75rem",
          padding: "0.45rem 0.7rem",
        }}
      >
        {loading ? "Saving..." : "Save Shipment"}
      </button>
    </div>
  );
}