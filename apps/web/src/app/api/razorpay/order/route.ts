
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";

const planPrices = {
  plus: {
    monthly: 69900,
    yearly: 699900,
  },
  pro: {
    monthly: 149900,
    yearly: 1499900,
  },
  business: {
    monthly: 499900,
    yearly: 4999900,
  },
} as const;

type PlanId = keyof typeof planPrices;
type BillingCycle = "monthly" | "yearly";

type BillingDetails = {
  fullName: string;
  email: string;
  country: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay server configuration is missing." },
        { status: 500 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request data." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;
    const { planId, billing, billingDetails } = data;

    if (
      typeof planId !== "string" ||
      !Object.prototype.hasOwnProperty.call(planPrices, planId)
    ) {
      return NextResponse.json(
        { error: "Please select a valid plan." },
        { status: 400 }
      );
    }

    if (billing !== "monthly" && billing !== "yearly") {
      return NextResponse.json(
        { error: "Please select monthly or yearly billing." },
        { status: 400 }
      );
    }

    if (
      !billingDetails ||
      typeof billingDetails !== "object" ||
      Array.isArray(billingDetails)
    ) {
      return NextResponse.json(
        { error: "Please provide your billing details." },
        { status: 400 }
      );
    }

    const input = billingDetails as Record<string, unknown>;

    const requiredFields = [
      "fullName",
      "email",
      "country",
      "address",
      "city",
      "state",
      "postalCode",
    ] as const;

    const fieldLabels: Record<
      (typeof requiredFields)[number],
      string
    > = {
      fullName: "full name",
      email: "email address",
      country: "country",
      address: "street address",
      city: "city",
      state: "state",
      postalCode: "PIN or postal code",
    };

    for (const field of requiredFields) {
      if (!isNonEmptyString(input[field])) {
        return NextResponse.json(
          { error: `Please provide your ${fieldLabels[field]}.` },
          { status: 400 }
        );
      }
    }

    const customer: BillingDetails = {
      fullName: (input.fullName as string).trim(),
      email: (input.email as string).trim(),
      country: (input.country as string).trim(),
      address: (input.address as string).trim(),
      city: (input.city as string).trim(),
      state: (input.state as string).trim(),
      postalCode: (input.postalCode as string).trim(),
    };

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // The server determines the amount.
    const selectedPlan = planId as PlanId;
    const selectedBilling = billing as BillingCycle;
    const amount = planPrices[selectedPlan][selectedBilling];

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `mn_${selectedPlan}_${Date.now()}`,
      notes: {
        planId: selectedPlan,
        billing: selectedBilling,
        customerName: customer.fullName,
        customerEmail: customer.email,
        country: customer.country,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        postalCode: customer.postalCode,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);

    return NextResponse.json(
      {
        error: "Could not create the payment order. Please try again.",
      },
      { status: 500 }
    );
  }
}
