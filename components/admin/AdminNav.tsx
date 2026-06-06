import Link from "next/link";
import { LayoutDashboard, Flag, HardDrive, ClipboardList } from "lucide-react";

const NAV = [
  { href: "/admin/pending",        label: "Annonces",       icon: LayoutDashboard },
  { href: "/admin/reports",        label: "Signalements",   icon: Flag           },
  { href: "/admin/storage",        label: "Storage",        icon: HardDrive      },
  { href: "/admin/beta-checklist", label: "Beta checklist", icon: ClipboardList  },
];

export default function AdminNav({ current }: { current: string }) {
  return (
    <div className="bg-gray-900 text-white px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center gap-1 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-3">
          Admin
        </span>
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              current === href
                ? "bg-white/15 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
