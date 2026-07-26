import type { Metadata } from "next";
import { Login } from "@/app/features/auth/Login";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your KudiClip clipper or funder account.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return <Login />;
}
