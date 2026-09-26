export const PAYSTACK_PUBLIC_KEY = "pk_test_placeholder"; // User should replace this in settings

export const initiatePaystackPayment = (email: string, amount: number, onSuccess: (ref: string) => void, onClose: () => void) => {
  // @ts-ignore
  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: amount * 100, // Paystack expects amount in kobo
    currency: "NGN",
    ref: 'PM-' + Math.floor((Math.random() * 1000000000) + 1),
    callback: function(response: any) {
      onSuccess(response.reference);
    },
    onClose: function() {
      onClose();
    }
  });
  handler.openIframe();
};
