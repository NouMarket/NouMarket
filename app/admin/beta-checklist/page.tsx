import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Beta Checklist – Admin NouMarket",
  robots: { index: false, follow: false },
};

type CheckItem = string;
type Section = { title: string; emoji: string; items: CheckItem[] };

const SECTIONS: Section[] = [
  {
    title: "Authentification",
    emoji: "🔐",
    items: [
      "Inscription avec e-mail + mot de passe",
      "E-mail de confirmation reçu et lien fonctionnel",
      "Connexion avec identifiants valides",
      "Erreur affichée pour identifiants invalides",
      "Déconnexion depuis le menu utilisateur",
      "Demande de réinitialisation du mot de passe (e-mail reçu)",
      "Lien de réinitialisation → nouveau mot de passe → reconnexion",
      "Redirection vers /login si page protégée visitée sans session",
    ],
  },
  {
    title: "Créer une annonce",
    emoji: "📝",
    items: [
      "Formulaire de création accessible depuis /create",
      "Validation côté client : titre, description, prix, catégorie, localisation",
      "Sélection de catégorie et état de l'article fonctionnels",
      "Prix à 0 XPF accepté (gratuit / à discuter)",
      "Case «Prix négociable» fonctionnelle",
      "Soumission → statut «En attente» → bannière de confirmation affichée",
      "Slug généré correctement dans l'URL (/listings/mon-titre-abc123)",
      "Annonce visible uniquement par le vendeur avant approbation",
    ],
  },
  {
    title: "Modifier une annonce",
    emoji: "✏️",
    items: [
      "Bouton «Modifier» visible uniquement pour le vendeur",
      "Formulaire pré-rempli avec les données existantes",
      "Modification d'un champ → statut repasse à «En attente»",
      "Remplacement d'images : nouvelles images sauvegardées, anciennes supprimées",
      "Accès refusé si l'utilisateur n'est pas le vendeur",
    ],
  },
  {
    title: "Upload de photos",
    emoji: "📷",
    items: [
      "Téléversement d'une photo JPEG/PNG/WebP",
      "Prévisualisation immédiate après upload",
      "Limite de 5 photos respectée (bouton désactivé après 5)",
      "Suppression d'une photo depuis l'interface",
      "Refus des fichiers > 5 Mo avec message d'erreur",
      "Upload sur mobile (caméra + galerie)",
    ],
  },
  {
    title: "Recherche",
    emoji: "🔍",
    items: [
      "Recherche par mot-clé retourne des résultats pertinents",
      "Filtre par catégorie fonctionne",
      "Filtre par localisation fonctionne",
      "Filtre prix min / max fonctionne",
      "Filtre par état de l'article fonctionne",
      "Tri par prix croissant / décroissant",
      "Tri par date (plus récents en premier)",
      "Pagination : page 2 charge de nouvelles annonces",
      "URL contient les paramètres de filtre (partage possible)",
      "Résultat vide : message d'aide en français affiché",
    ],
  },
  {
    title: "Favoris",
    emoji: "❤️",
    items: [
      "Clic sur ♡ sur une annonce l'ajoute aux favoris",
      "Icône remplie après ajout, vide après suppression",
      "Page /favorites liste les annonces sauvegardées",
      "Suppression d'un favori depuis /favorites",
      "État vide : message et lien vers /search affichés",
      "Favoris nécessitent une connexion (redirection si non connecté)",
    ],
  },
  {
    title: "Messagerie",
    emoji: "💬",
    items: [
      "Bouton «Contacter» visible sur une annonce active",
      "Clic → création de conversation → redirection vers /messages/[id]",
      "Envoi d'un message : apparaît immédiatement",
      "Mise à jour en temps réel (Supabase Realtime) sans rechargement",
      "Vendeur ne peut pas se contacter lui-même",
      "Page /messages liste toutes les conversations",
      "Suppression de conversation (soft delete) depuis /messages",
      "État vide de /messages : message d'aide affiché",
      "Badge de message non lu visible dans la nav",
    ],
  },
  {
    title: "Signalements",
    emoji: "🚩",
    items: [
      "Bouton «Signaler» visible pour les non-vendeurs",
      "Sélection d'un motif et soumission du rapport",
      "Double signalement de la même annonce : message «déjà signalé»",
      "Vendeur ne peut pas signaler sa propre annonce",
      "Signalements visibles dans /admin/reports",
    ],
  },
  {
    title: "Approbation admin",
    emoji: "✅",
    items: [
      "Connexion avec un compte admin",
      "/admin/pending liste les annonces en attente",
      "Bouton «Approuver» → annonce passe à «Active» et apparaît dans la recherche",
      "Bouton «Rejeter» nécessite une raison → annonce passe à «Rejetée»",
      "Raison de rejet visible dans la bannière de statut pour le vendeur",
      "Compteur d'annonces en attente correct",
    ],
  },
  {
    title: "Actions vendeur",
    emoji: "🏷️",
    items: [
      "«Marquer comme vendu» → badge VENDU affiché, annonce retirée des résultats",
      "«Supprimer» → annonce archivée, disparaît de la recherche",
      "Annonce archivée toujours visible dans /profile du vendeur",
      "Seul le vendeur voit les boutons d'action",
    ],
  },
  {
    title: "Test mobile",
    emoji: "📱",
    items: [
      "Accueil : grille de catégories et annonces lisible sur 375px",
      "Navigation mobile (menu hamburger) ouvre et ferme correctement",
      "Formulaire de création utilisable sur mobile",
      "Upload photo depuis la caméra du téléphone",
      "Page de détail d'annonce : images et bouton contact accessibles",
      "Messagerie : clavier virtuel ne masque pas le champ de saisie",
    ],
  },
  {
    title: "SEO & bases techniques",
    emoji: "🔎",
    items: [
      "Balise <title> unique sur chaque page d'annonce",
      "Meta description présente sur les pages d'annonces",
      "JSON-LD Product visible dans le code source d'une annonce active",
      "JSON-LD BreadcrumbList présent sur les pages d'annonces",
      "Page /sellers/[id] indexable, Person JSON-LD présent",
      "robots.txt accessible sur /robots.txt",
      "sitemap.xml accessible sur /sitemap.xml et contient des URLs valides",
      "Pages privées (profil, messages, admin) : robots noindex",
      "OG image / Twitter Card présents sur une annonce avec photo",
    ],
  },
];

export default async function BetaChecklistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/beta-checklist");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) notFound();

  const totalItems = SECTIONS.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav current="/admin/beta-checklist" />

      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Beta Test Checklist</h1>
          <p className="mt-1 text-sm text-gray-500">
            {SECTIONS.length} sections · {totalItems} points à vérifier avant
            l&apos;ouverture aux bêta-testeurs. Cochez chaque point manuellement
            lors des tests.
          </p>
          <p className="mt-2 text-xs text-amber-600 font-medium">
            Guide complet : <code className="bg-amber-50 px-1 rounded">docs/BETA_QA_CHECKLIST.md</code>
          </p>
        </div>

        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="text-lg">{section.emoji}</span>
                <h2 className="font-semibold text-gray-900">{section.title}</h2>
                <span className="ml-auto text-xs text-gray-400">
                  {section.items.length} points
                </span>
              </div>
              <ul className="divide-y divide-gray-50">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-sky-500 accent-sky-500 cursor-pointer"
                      aria-label={item}
                    />
                    <span className="text-sm text-gray-700 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Page interne — non indexée. Réinitialisez les cases à chaque cycle de test.
        </p>
      </div>
    </div>
  );
}
