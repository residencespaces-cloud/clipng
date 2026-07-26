import type { Metadata } from "next";
import { SignupPageClient } from "./SignupPageClient";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a free KudiClip account. Join as a clipper to earn Naira per 1,000 views, or as a funder to launch campaigns.",
  alternates: {
    canonical: "/signup",
  },
  openGraph: {
    title: "Sign Up — KudiClip",
    description:
      "Create a free KudiClip account. Join as a clipper to earn Naira per 1,000 views, or as a funder to launch campaigns.",
    url: "https://kudiclip.com/signup",
  },
};

export default function SignupPage() {
  return <SignupPageClient />;
}
