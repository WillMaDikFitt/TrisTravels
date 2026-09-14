/** Public contact + social links used across the site. */
export const site = {
  /** Public contact email (Contact dock / mailto). */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "trissimai03@gmail.com",
  /** Bookings inbox — staff notifications go here when Resend is configured. */
  bookingsEmail:
    process.env.NEXT_PUBLIC_BOOKINGS_EMAIL?.trim() || "tristravelbookings@gmail.com",
  phoneDisplay: "+91 70052 41197",
  whatsappE164: "917005241197",
  whatsappUrl: "https://wa.me/917005241197",
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/trisexperiences",
  facebookUrl:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://www.facebook.com/trismeghalaya",
  website: "https://www.trismeghalaya.com",
  /** Razorpay payment link for Craft My Journey deposits (set in env). */
  craftPaymentLink: process.env.NEXT_PUBLIC_CRAFT_RAZORPAY_LINK ?? "",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
} as const;
