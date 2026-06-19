import { prisma } from "@/lib/prisma";

export async function getShiprocketToken() {
  const response = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();

  console.log("SHIPROCKET LOGIN STATUS =", response.status);
  console.log("SHIPROCKET LOGIN RESPONSE =", data);

  if (!response.ok) {
    throw new Error(
      data?.message || "Shiprocket login failed"
    );
  }

  return data.token;
}

export async function getTrackingDetails(awb: string) {
  console.log("TRACKING AWB =", awb);

//   const token = await getShiprocketToken() ;
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vYXBpdjIuc2hpcHJvY2tldC5jby92MS9hdXRoL2xvZ2luL2dvb2dsZS9jYWxsYmFjayIsImlhdCI6MTc4MTgxNTgzOSwiZXhwIjoxNzgyNjc5ODM5LCJuYmYiOjE3ODE4MTU4MzksImp0aSI6IkpnbHNrVlI1OFp3NFVwVUYiLCJzdWIiOjEwNDUxNTI3LCJwcnYiOiIwNWJiNjYwZjY3Y2FjNzQ1ZjdiM2RhMWVlZjE5NzE5NWEyMTFlNmQ5IiwiY2lkIjoxMDE3Mzg3OX0.Azzes72PTLI-ZKVV70wl6DOorWJp-7CB3i3D4CpFQis' ;

  console.log("TOKEN =", token);

  const response = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  console.log("TRACK STATUS =", response.status);
  console.log("TRACK RESPONSE =", data);

  return data;
}