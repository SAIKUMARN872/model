import RazorpayCheckout from "react-native-razorpay";

export type SubscriptionCheckoutOptions = {
  subscriptionId: string;
  planName: string;
  billing: "monthly" | "yearly";
  paymentMethod?: string;
};

export async function openSubscriptionCheckout({
  subscriptionId,
  planName,
  billing,
}: SubscriptionCheckoutOptions) {
  if (!subscriptionId) {
    throw new Error("A valid Razorpay subscription ID is required.");
  }

  const options = {
    description: `${planName} - ${billing} subscription`,
    subscription_id: subscriptionId,
    name: "ModelNow",
    theme: {
      color: "#315FEA",
    },
  };

  return RazorpayCheckout.open(options);
}
