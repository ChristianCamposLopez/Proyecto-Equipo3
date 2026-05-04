// app/login/page.tsx
'use client';

import { Card } from "@/app/_components/ui/Card";
import { LoginForm } from "@/app/_components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111010] p-6">
      <LoginForm />
    </div>
  );
}
