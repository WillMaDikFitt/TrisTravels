/** Public contact + social links used across the site. */
export const site = {
  email: "hello@trismeghalaya.com",
  phoneDisplay: "+91 70052 41197",
  whatsappE164: "917005241197",
  whatsappUrl: "https://wa.me/917005241197",
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/trismeghalaya/",
  facebookUrl:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://www.facebook.com/trismeghalaya",
  website: "https://www.trismeghalaya.com",
  /** Razorpay payment link for Craft My Journey deposits (set in env). */
  craftPaymentLink: process.env.NEXT_PUBLIC_CRAFT_RAZORPAY_LINK ?? "",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
} as const;
