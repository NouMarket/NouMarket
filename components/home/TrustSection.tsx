import { ShieldCheck, MessageCircle, Star, Lock } from "lucide-react";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Annonces vérifiées",
    desc: "Notre équipe modère chaque annonce avant publication pour garantir leur fiabilité.",
  },
  {
    icon: MessageCircle,
    title: "Messagerie sécurisée",
    desc: "Communiquez directement avec les vendeurs sans partager vos coordonnées personnelles.",
  },
  {
    icon: Star,
    title: "Avis et notations",
    desc: "Consultez les avis des autres acheteurs pour choisir en toute confiance.",
  },
  {
    icon: Lock,
    title: "Données protégées",
    desc: "Vos informations personnelles sont sécurisées et ne sont jamais revendues.",
  },
];

export default function TrustSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900">Faites confiance à NouMarket</h2>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">
          Nous mettons tout en œuvre pour que chaque transaction se passe dans les meilleures
          conditions, en toute sécurité.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TRUST_POINTS.map((point) => (
          <div
            key={point.title}
            className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
              <point.icon className="h-6 w-6 text-sky-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{point.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{point.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
