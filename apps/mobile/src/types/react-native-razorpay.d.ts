declare module "react-native-razorpay" {
  type RazorpayOptions = {
    description?: string;
    subscription_id?: string;
    name?: string;
    theme?: {
      color?: string;
    };
  };

  type RazorpaySuccessResponse = {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  };

  const RazorpayCheckout: {
    open(
      options: RazorpayOptions
    ): Promise<RazorpaySuccessResponse>;
  };

  export default RazorpayCheckout;
}
