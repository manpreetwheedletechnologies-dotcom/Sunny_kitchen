import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Order Homemade Food in Indore",
  description:
    "Contact Sunny's Kitchen, Vijay Nagar, Indore. Call +91 98939 55887, email us or send an enquiry to order fresh homemade sandwiches, pasta and tiffin meals.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
