import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, MapPin, RefreshCw, CreditCard } from "lucide-react";
import PayOnlineButton from "@/components/PayOnlineButton";
import OrderActions from "@/components/OrderActions";
import NeedHelpSection from "@/components/NeedHelpSection";
import { formatCurrency, normalizeCurrency } from "@/lib/currency";
import { getTrackingDetails } from "@/lib/shiprocket";
import TrackingDetails from "@/components/TrackingDetails";
export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const session = await getSession();
  if (!session) return redirect(`/${locale}/auth/login`);

  const order = await prisma.order.findFirst({
    where: { id, userId: session.userId },
    include: { items: { include: { product: true } } }
  });
console.log(order);

  if (!order) return notFound();
let trackingData = null;

if (order.trackingNumber) {
  try {
    trackingData = await getTrackingDetails(
      order.trackingNumber
    );
  } catch (error) {
    console.error("Tracking Error", error);
  }
}
const shipment =
  trackingData?.tracking_data?.shipment_track?.[0];

const activities =
  trackingData?.tracking_data?.shipment_track_activities || [];

const isShipped = !!order.trackingNumber;

const isPickedUp = activities.some(
  (a: any) =>
    a["sr-status-label"] === "PICKED UP" ||
    a.activity?.toLowerCase().includes("picked up")
);

const isInTransit = activities.some(
  (a: any) =>
    a["sr-status-label"] === "IN TRANSIT" ||
    a.activity?.toLowerCase().includes("transit")
);

const isDelivered =
  shipment?.current_status?.toLowerCase().includes("delivered") ||
  activities.some(
    (a: any) =>
      a["sr-status-label"] === "DELIVERED"
  );



  const normalizedStatus = order.status.toLowerCase();
  const canPayOnline = ["pending", "failed", "cancelled"].includes(normalizedStatus);
  const isCodOrder = order.paymentGateway === "cod";
  const orderCurrency = normalizeCurrency(order.currency);

  const processingDone = !["pending", "failed", "cancelled"].includes(normalizedStatus);
  const shippedDone = ["shipped", "delivered"].includes(normalizedStatus);
  const deliveredDone = normalizedStatus === "delivered";

  const canCancel = ["pending"].includes(normalizedStatus);
  const canReturn = ["delivered"].includes(normalizedStatus);
  const canRefund = ["paid", "shipped"].includes(normalizedStatus);

  // const steps = [
  //   { label: "Order Placed", time: order.createdAt, done: true, icon: <Clock size={16} /> },
  //   { label: "Processing Order", time: processingDone ? order.updatedAt : null, done: processingDone, icon: <RefreshCw size={16} /> },
  //   { label: "Order Shipped", time: shippedDone ? order.updatedAt : null, done: shippedDone, icon: <Truck size={16} /> },
  //   { label: "Order Delivered", time: deliveredDone ? order.updatedAt : null, done: deliveredDone, icon: <CheckCircle size={16} /> }
  // ];

const steps = [
  {
    label: "Order Placed",
    done: true,
    icon: <Clock size={16} />,
    date: order.createdAt,
  },
  {
    label: "Shipped",
    done: isShipped,
    icon: <Package size={16} />,
    date: isShipped ? order.updatedAt : null,
  },
  {
    label: "Picked Up",
    done: isPickedUp,
    icon: <Truck size={16} />,
    date: null,
  },
  {
    label: "In Transit",
    done: isInTransit,
    icon: <Truck size={16} />,
    date: null,
  },
  {
    label: "Delivered",
    done: isDelivered,
    icon: <CheckCircle size={16} />,
    date: null,
  },
];

  return (
    <div className="container section">
      <nav style={{ marginBottom: '2rem', fontSize: '0.8125rem' }}>
        <Link href={`/${locale}/orders`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <Package size={14} /> Back to My Orders
        </Link>
      </nav>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Order Details</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9375rem' }}>Order ID: <span style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{order.id.substring(0, 8).toUpperCase()}</span></p>
          {["failed", "cancelled"].includes(normalizedStatus) && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--error)', marginTop: '0.5rem', fontWeight: 600 }}>
              This order is currently {order.status}. Please contact support or retry payment.
            </p>
          )}
        </div>
        <div className="badge badge-info" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>{order.status.toUpperCase()}</div>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>
        {/* Tracking Timeline */}
        <div className="admin-card animate-in">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '2.5rem' }}>Order Progress</h2>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
             <div style={{ position: 'absolute', left: '16px', top: '10px', bottom: '10px', width: '2px', background: 'var(--outline-variant)', zIndex: 0 }}></div>
             
             {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '2rem', position: 'relative', zIndex: 1 }}>
                   <div style={{ 
                      width: '34px', height: '34px', borderRadius: '50%', 
                      background: step.done ? 'var(--primary)' : 'var(--surface-container-high)',
                      color: step.done ? 'white' : 'var(--on-surface-variant)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: step.done ? 'var(--shadow-md)' : 'none'
                   }}>
                      {step.icon}
                   </div>
                   <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: step.done ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>{step.label}</h3>
                     {step.date && (
  <p
    style={{
      fontSize: "0.75rem",
      color: "var(--on-surface-variant)",
      marginTop: "0.25rem",
    }}
  >
    {step.date.toLocaleDateString()} —{" "}
    {step.date.toLocaleTimeString()}
  </p>
)}
{step.label === "Picked Up" && isPickedUp && (
  <p
    style={{
      fontSize: "12px",
      color: "#16a34a",
      marginTop: "4px",
    }}
  >
    Shipment picked up by courier
  </p>
)}

{step.label === "In Transit" && isInTransit && (
  <p
    style={{
      fontSize: "12px",
      color: "#2563eb",
      marginTop: "4px",
    }}
  >
    {shipment?.current_status}
  </p>
)}

{step.label === "Delivered" && isDelivered && (
  <p
    style={{
      fontSize: "12px",
      color: "#16a34a",
      marginTop: "4px",
    }}
  >
    Shipment delivered successfully
  </p>
)}
                      {!step.done && <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.25rem' }}>Update pending...</p>}
                   </div>
                </div>
             ))}
          </div>

          {/* Order Actions based on stage */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--outline-variant)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Order Actions</h3>
            <OrderActions
              orderId={order.id}
              locale={locale}
              canCancel={canCancel}
              canRefund={canRefund}
              canReturn={canReturn}
            />
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-card animate-in" style={{ animationDelay: '0.1s' }}>
             <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} /> Shipping Address
             </h3>
             <p style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}>{order.shippingAddress || "Address information unavailable"}</p>
          </div>
{order.trackingNumber && (
  <div
    className="admin-card animate-in"
    style={{ animationDelay: "0.15s" }}
  >
    <h3
      style={{
        fontSize: "0.875rem",
        textTransform: "uppercase",
        marginBottom: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <Truck size={16} />
      Shipment Tracking
    </h3>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div>
    
<TrackingDetails
  trackingNumber={order.trackingNumber}
  shipment={shipment}
  activities={
    trackingData?.tracking_data?.shipment_track_activities || []
  }
/>

        {/* <div
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            wordBreak: "break-all",
          }}
        >
          <a
  href={`https://www.shiprocket.in/shipment-tracking/${order.trackingNumber}`}
  target="_blank"
  rel="noopener noreferrer"
  style={{
    fontWeight: 700,
    fontSize: "1rem",
    color: "#2563eb",
    textDecoration: "underline",
    wordBreak: "break-all",
  }}
>
  {order.trackingNumber}
</a>
        </div> */}
      </div>

    </div>
  </div>
)}
          <div className="admin-card animate-in" style={{ animationDelay: '0.2s' }}>
             <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Order Details</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {order.items.map(item => (
                   <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--on-surface-variant)' }}>{item.product.name} (x{item.quantity})</span>
                      <span style={{ fontWeight: 700 }}>{formatCurrency(item.price * item.quantity, orderCurrency, locale)}</span>
                   </div>
                ))}
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                   <span style={{ color: 'var(--on-surface-variant)' }}>Subtotal</span>
                   <span>{formatCurrency(order.subtotal, orderCurrency, locale)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--on-surface-variant)' }}>
                      Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                    </span>
                    <span style={{ color: '#166534', fontWeight: 700 }}>-{formatCurrency(order.discountAmount, orderCurrency, locale)}</span>
                  </div>
                )}
                <div style={{ marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                   <span>{canPayOnline ? "Total Due" : "Total Paid"}</span>
                   <span>{formatCurrency(order.total, orderCurrency, locale)}</span>
                </div>

                <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                  Payment method: <strong style={{ color: 'var(--on-surface)' }}>{order.paymentGateway.toUpperCase()}</strong>
                </div>

                {canPayOnline && (
                  <div style={{ marginTop: '0.75rem', padding: '0.85rem', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface-container-low)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CreditCard size={14} /> {isCodOrder ? "COD selected. Switch to online payment anytime." : "Payment is pending. Complete payment online now."}
                    </p>
                    <PayOnlineButton orderId={order.id} locale={locale} />
                  </div>
                )}
             </div>
          </div>

          {/* Need Help Section */}
          <NeedHelpSection
            orderId={order.id}
            locale={locale}
            receiptHref={`/${locale}/orders/${order.id}/receipt`}
          />
        </div>
      </div>
    </div>
  );
}
