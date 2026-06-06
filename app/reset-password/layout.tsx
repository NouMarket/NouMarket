import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réinitialisation du mot de passe",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
