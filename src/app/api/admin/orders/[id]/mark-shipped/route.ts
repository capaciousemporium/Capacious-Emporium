import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import nodemailer from "nodemailer";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
    const { id } = await params;
const order = await prisma.order.findUnique({
  where: { id },
  include: {
    user: {
      select: {
        name: true,
        email: true,
      },
    },
  },
});

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const normalizedStatus = String(order.status || "").toLowerCase();
    if (!["paid", "pending"].includes(normalizedStatus)) {
      return NextResponse.json({ error: "Order cannot be marked as shipped from its current status." }, { status: 400 });
    }

  const shippedOrder = await prisma.order.update({
  where: { id },
  data: {
    status: "shipped",
  },
  include: {
  user: {
    select: {
      name: true,
      email: true,
    },
  },
  items: {
    include: {
      product: {
        select: {
          name: true,
        },
      },
    },
  },
},
});


const productList = shippedOrder.items
  .map(
    (item) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">
          ${item.product?.name || "Product"}
        </td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">
          ${item.quantity}
        </td>
      </tr>
    `
  )
  .join("");

if (shippedOrder.user?.email) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: shippedOrder.user.email,
    subject: `Your Order Has Been Shipped`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;">

  <h2>Hello ${shippedOrder.user.name || "Customer"},</h2>

  <p>
    Your order has been shipped successfully.
  </p>

  <table
    style="
      width:100%;
      border-collapse:collapse;
      margin-top:15px;
      margin-bottom:20px;
    "
  >
    <tr>
      <td style="padding:8px;border:1px solid #ddd;">
        <strong>Order ID</strong>
      </td>
      <td style="padding:8px;border:1px solid #ddd;">
        ${shippedOrder.id}
      </td>
    </tr>

    <tr>
      <td style="padding:8px;border:1px solid #ddd;">
        <strong>Tracking Number</strong>
      </td>
      <td style="padding:8px;border:1px solid #ddd;">
        ${shippedOrder.trackingNumber || "-"}
      </td>
    </tr>

    <tr>
      <td style="padding:8px;border:1px solid #ddd;">
        <strong>Courier</strong>
      </td>
      <td style="padding:8px;border:1px solid #ddd;">
        ${shippedOrder.courierName || "Shiprocket"}
      </td>
    </tr>

    <tr>
      <td style="padding:8px;border:1px solid #ddd;">
        <strong>Expected Delivery</strong>
      </td>
      <td style="padding:8px;border:1px solid #ddd;">
        ${
          shippedOrder.expectedDelivery
            ? new Date(
                shippedOrder.expectedDelivery
              ).toLocaleDateString("en-IN")
            : "-"
        }
      </td>
    </tr>
  </table>

  <h3>Items Shipped</h3>

  <table
    style="
      width:100%;
      border-collapse:collapse;
      margin-top:10px;
      margin-bottom:20px;
    "
  >
    <thead>
      <tr>
        <th
          style="
            border:1px solid #ddd;
            padding:8px;
            text-align:left;
          "
        >
          Product
        </th>

        <th
          style="
            border:1px solid #ddd;
            padding:8px;
          "
        >
          Qty
        </th>
      </tr>
    </thead>

    <tbody>
      ${productList}
    </tbody>
  </table>

  ${
    shippedOrder.trackingUrl
      ? `
      <div style="text-align:center;margin:25px 0;">
        <a
          href="${shippedOrder.trackingUrl}"
          style="
            background:#2874f0;
            color:#ffffff;
            text-decoration:none;
            padding:12px 24px;
            border-radius:6px;
            display:inline-block;
            font-weight:bold;
          "
        >
          Track Shipment
        </a>
      </div>
    `
      : ""
  }

  <p>
    Your package is on its way and will be delivered soon.
  </p>

  <p>
    Thank you for shopping with us.
  </p>

</div>
`,
  });
}

    return NextResponse.json({
      success: true,
      message: "Order marked as shipped.",
      orderId: shippedOrder.id,
      status: shippedOrder.status,
    });
  } catch (error) {
    console.error("Mark as shipped error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark order as shipped." },
      { status: 500 }
    );
  }
}
