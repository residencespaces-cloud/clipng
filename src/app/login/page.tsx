import type { Metadata } from "next";
import { Login } from "@/app/features/auth/Login";

export const metadata: Metadata = {
  title: "Log In — ClipNG",
};

export default function LoginPage() {
  return <Login />;
}
