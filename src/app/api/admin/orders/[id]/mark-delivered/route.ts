import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

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

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const normalizedStatus = String(order.status || "").toLowerCase();
    if (!["paid", "shipped"].includes(normalizedStatus)) {
      return NextResponse.json({ error: "Order cannot be marked as delivered from its current status." }, { status: 400 });
    }

    const deliveredOrder = await prisma.order.update({
      where: { id },
      data: { status: "delivered" },
    });

    const productList = order.items
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

if (order.user?.email) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: order.user.email,
    subject: `Your Order Has Been Delivered`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;">
        
        <h2>Hello ${order.user.name || "Customer"},</h2>

        <p>
          Your order has been successfully delivered.
        </p>

        <p>
          Thank you for shopping with us.
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
              ${order.id}
            </td>
          </tr>
        </table>

        <h3>Delivered Items</h3>

        <table
          style="
            width:100%;
            border-collapse:collapse;
            margin-top:10px;
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

        <br/>

        <p>
          We hope you enjoy your purchase. We'd love to hear your feedback.
        </p>

      </div>
    `,
  });
}

    // Check if this user was referred and award remaining 400 coins on first delivered order
    // (100 already awarded on registration, 400 more on first delivery)
    const referral = await prisma.referral.findFirst({
      where: {
        referredId: order.userId,
        status: "registered",
        rewardAwarded: false,
      },
    });

    if (referral) {
      await prisma.referral.update({
        where: { id: referral.id },
        data: { status: "completed", rewardAwarded: true },
      });

      // Award remaining 400 coins to the referrer
      await prisma.user.update({
        where: { id: referral.referrerId },
        data: { auraCoins: { increment: 400 } },
      });

      console.log("Referral reward completed on delivery:", {
        referralId: referral.id,
        referrerId: referral.referrerId,
        additionalCoins: 400,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order marked as delivered.",
      orderId: deliveredOrder.id,
      status: deliveredOrder.status,
    });
  } catch (error) {
    console.error("Mark as delivered error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark order as delivered." },
      { status: 500 }
    );
  }
}
