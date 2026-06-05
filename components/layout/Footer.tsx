import Link from "next/link";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { CATEGORIES } from "@/data/categories";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-white text-lg">{SITE_NAME}</span>
            </div>
            <p className="text-sm leading-relaxed">{SITE_DESCRIPTION}</p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Catégories</h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {cat.labelFr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Navigation</h3>
            <ul className="space-y-2">
              {[
                { href: "/create", label: "Déposer une annonce" },
                { href: "/favorites", label: "Mes favoris" },
                { href: "/profile", label: "Mon compte" },
                { href: "/login", label: "Connexion" },
                { href: "/register", label: "Inscription" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Informations</h3>
            <ul className="space-y-2">
              {[
                { href: "#", label: "À propos" },
                { href: "#", label: "Conditions d'utilisation" },
                { href: "#", label: "Politique de confidentialité" },
                { href: "#", label: "Aide & Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {year} {SITE_NAME} – Tous droits réservés. Nouvelle-Calédonie 🇳🇨</p>
          <p>Fait avec ❤️ pour la Nouvelle-Calédonie</p>
        </div>
      </div>
    </footer>
  );
}
