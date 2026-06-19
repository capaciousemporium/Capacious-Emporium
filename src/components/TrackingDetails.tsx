"use client";

import { useState } from "react";

export default function TrackingDetails({
  trackingNumber,
  shipment,
  activities,
}: any) {
  const [showTracking, setShowTracking] = useState(false);
console.log(shipment)

  return (
    <>
      <div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--on-surface-variant)",
          }}
        >
          Tracking Number
        </div>

        <button
          onClick={() => setShowTracking(!showTracking)}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            color: "#2563eb",
            cursor: "pointer",
            fontWeight: 700,
            textDecoration: "underline",
          }}
        >
          {trackingNumber}
        </button>
      </div>

      {showTracking && (
        <>
          {shipment && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                border: "1px solid var(--outline-variant)",
                borderRadius: "8px",
              }}
            >
              <div>
                <strong>Status:</strong> {shipment.current_status}
              </div>

              <div>
                <strong>Courier:</strong> {shipment.courier_name}
              </div>

              <div>
                <strong>Origin:</strong> {shipment.origin}
              </div>

              <div>
                <strong>Destination:</strong> {shipment.destination}
              </div>

              <div>
                <strong>Last Update:</strong>{" "}
                {shipment.updated_time_stamp}
              </div>

              <div>
                <strong>Expected Delivery:</strong>{" "}
                {shipment.edd}
              </div>
            </div>
          )}

         {activities?.length > 0 && (
  <div
    style={{
      marginTop: "1rem",
      border: "1px solid var(--outline-variant)",
      borderRadius: "8px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--outline-variant)",
        background: "var(--surface-container-low)",
        fontWeight: 700,
        fontSize: "14px",
      }}
    >
      Tracking History ({activities.length})
    </div>

    <div
      style={{
        maxHeight: "300px",
        overflowY: "auto",
        padding: "12px",
      }}
    >
      {activities.map((activity: any, index: number) => (
        <div
          key={index}
          style={{
            position: "relative",
            paddingLeft: "16px",
            marginBottom: "16px",
            borderLeft: "2px solid #2563eb",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: "13px",
              lineHeight: 1.4,
            }}
          >
            {activity.activity}
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginTop: "2px",
            }}
          >
            📍 {activity.location}
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "#999",
              marginTop: "2px",
            }}
          >
            {new Date(activity.date).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
        </>
      )}
    </>
  );
}