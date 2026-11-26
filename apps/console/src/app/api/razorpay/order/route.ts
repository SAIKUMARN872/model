import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay server credentials are not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const amountUSD = Number(body.amountUSD);

    if (
      !Number.isFinite(amountUSD) ||
      amountUSD < 1 ||
      amountUSD > 10000
    ) {
      return NextResponse.json(
        { error: "Invalid purchase amount." },
        { status: 400 }
      );
    }

    const exchangeResponse = await fetch(
      "https://open.er-api.com/v6/latest/USD",
      { cache: "no-store" }
    );

    if (!exchangeResponse.ok) {
      throw new Error("Unable to retrieve the live USD-INR exchange rate.");
    }

    const exchangeData = await exchangeResponse.json();
    const rate = Number(exchangeData?.rates?.INR);

    if (exchangeData?.result !== "success" || !Number.isFinite(rate) || rate <= 0) {
      throw new Error("The USD-INR exchange rate is unavailable.");
    }

    const taxUSD = amountUSD * 0.18;
    const totalINR = (amountUSD + taxUSD) * rate;
    const amountPaise = Math.round(totalINR * 100);

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `mn_${Date.now()}`,
      notes: {
        productType: "credits",
        amountUSD: amountUSD.toFixed(2),
        taxUSD: taxUSD.toFixed(2),
        exchangeRate: rate.toString(),
        customerEmail: String(body.customer?.email || ""),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      amountUSD,
      taxUSD,
      exchangeRate: rate,
      totalINR: (amountPaise / 100).toFixed(2),
    });
  } catch (error) {
    console.error("Razorpay order error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}
