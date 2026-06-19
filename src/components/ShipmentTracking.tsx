"use client";

import { useEffect, useState } from "react";

export default function ShipmentTracking({
  orderId,
}: {
  orderId: string;
}) {
  const [tracking, setTracking] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}/tracking`)
      .then((res) => res.json())
      .then((data) => {
        setTracking(data);
      });
  }, [orderId]);

  if (!tracking) {
    return <p>Loading tracking...</p>;
  }

  const shipment =
    tracking?.tracking_data?.shipment_track?.[0];

  return (
    <div>
      <h4>Current Status</h4>

      <p>
        {shipment?.current_status || "Not Available"}
      </p>

      <p>
        {shipment?.current_status_date || ""}
      </p>
    </div>
  );
}