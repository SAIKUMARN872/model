import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const paymentId = String(body.razorpay_payment_id || "");
    const orderId = String(body.razorpay_order_id || "");
    const signature = String(body.razorpay_signature || "");

    if (!paymentId || !orderId || !signature) {
      return NextResponse.json(
        { error: "Missing payment verification details." },
        { status: 400 }
      );
    }

    const expectedSignature = createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expected = Buffer.from(expectedSignature, "hex");
    const received = Buffer.from(signature, "hex");

    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      return NextResponse.json(
        { success: false, error: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      paymentId,
      orderId,
      message: "Payment signature verified.",
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);

    return NextResponse.json(
      { success: false, error: "Payment verification failed." },
      { status: 500 }
    );
  }
}
