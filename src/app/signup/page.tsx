import type { Metadata } from "next";
import { SignupPageClient } from "./SignupPageClient";

export const metadata: Metadata = {
  title: "Sign Up — KudiClip",
};

export default function SignupPage() {
  return <SignupPageClient />;
}
