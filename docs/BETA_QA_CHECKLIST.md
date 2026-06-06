# NouMarket – Beta QA Checklist

Guide de test manuel pour la beta fermée. Exécuter avant chaque cycle de déploiement.

**Environnement testé :** `_______________`  
**Date :** `_______________`  
**Testeur :** `_______________`

---

## 1. Inscription

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 1.1 | Aller sur `/register` | Page visible, formulaire avec nom, e-mail, mot de passe, confirmation | |
| 1.2 | Soumettre avec des champs vides | Message d'erreur en français | |
| 1.3 | Saisir un mot de passe < 8 caractères | Erreur « Le mot de passe doit faire au moins 8 caractères » | |
| 1.4 | Saisir deux mots de passe différents | Erreur « Les mots de passe ne correspondent pas » | |
| 1.5 | Inscription valide | Redirection vers `/register?confirm=1` ou `/` selon la config Supabase | |
| 1.6 | Réinscription avec le même e-mail | Erreur « Cette adresse e-mail est déjà utilisée » | |

---

## 2. Confirmation d'e-mail

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 2.1 | Ouvrir l'e-mail de confirmation Supabase | Lien de confirmation présent | |
| 2.2 | Cliquer sur le lien | Redirection vers le site, session active | |
| 2.3 | Cliquer sur un lien expiré | Message d'erreur approprié | |

---

## 3. Connexion

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 3.1 | Aller sur `/login` | Page visible avec champs e-mail et mot de passe | |
| 3.2 | Se connecter avec des identifiants valides | Redirection vers `/` ou le paramètre `next` | |
| 3.3 | Se connecter avec un mauvais mot de passe | Erreur « E-mail ou mot de passe incorrect » | |
| 3.4 | Se déconnecter | Redirection vers `/login`, session effacée | |
| 3.5 | Visiter `/profile` sans être connecté | Redirection vers `/login?next=/profile` | |

---

## 4. Réinitialisation du mot de passe

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 4.1 | Aller sur `/forgot-password` | Formulaire avec champ e-mail | |
| 4.2 | Saisir un e-mail valide et soumettre | Redirection vers `/forgot-password?sent=1`, e-mail reçu | |
| 4.3 | Cliquer sur le lien de réinitialisation | Redirection vers `/reset-password` avec session active | |
| 4.4 | Saisir un nouveau mot de passe valide | Succès, déconnexion automatique, redirection vers `/login?reset=1` | |
| 4.5 | Se connecter avec le nouveau mot de passe | Connexion réussie | |
| 4.6 | Demander > 3 réinitialisations en 1 heure | Message « Trop de tentatives. Réessayez dans une heure. » | |

---

## 5. Créer une annonce

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 5.1 | Aller sur `/create` sans être connecté | Redirection vers `/login` | |
| 5.2 | Aller sur `/create` connecté | Formulaire complet visible | |
| 5.3 | Soumettre sans remplir les champs | Erreurs de validation en français | |
| 5.4 | Remplir tous les champs et soumettre | Redirection vers `/listings/[slug]?submitted=1`, bannière verte | |
| 5.5 | Vérifier l'URL | Slug lisible généré depuis le titre + 6 caractères | |
| 5.6 | Annonce visible par le vendeur avant approbation | ✓ (avec bannière « En cours de modération ») | |
| 5.7 | Annonce invisible dans la recherche avant approbation | ✓ | |
| 5.8 | Créer > 5 annonces en 1 heure | Message de rate limit en français | |

---

## 6. Upload d'images

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 6.1 | Téléverser une image JPEG | Prévisualisation immédiate | |
| 6.2 | Téléverser une image PNG | Prévisualisation immédiate | |
| 6.3 | Téléverser un fichier non-image | Erreur de type de fichier | |
| 6.4 | Téléverser un fichier > 5 Mo | Erreur de taille | |
| 6.5 | Téléverser 5 images | Bouton désactivé après la 5ème | |
| 6.6 | Supprimer une image téléversée | Image retirée de la prévisualisation | |

---

## 7. Approbation admin

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 7.1 | Se connecter avec le compte admin | Navigation sans erreur | |
| 7.2 | Aller sur `/admin/pending` | Annonce créée à l'étape 5 visible | |
| 7.3 | Cliquer sur « Approuver » | Annonce disparaît de la liste, statut → Active | |
| 7.4 | Vérifier dans la recherche | Annonce apparaît dans les résultats | |
| 7.5 | Créer une 2ème annonce, cliquer « Rejeter » | Boîte de raison obligatoire | |
| 7.6 | Saisir une raison et confirmer | Annonce rejetée | |
| 7.7 | Se connecter avec le compte vendeur | Bannière « Votre annonce a été rejetée » visible | |

---

## 8. Recherche

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 8.1 | Chercher un mot-clé de l'annonce approuvée | Annonce apparaît dans les résultats | |
| 8.2 | Filtrer par catégorie | Seules les annonces de cette catégorie affichées | |
| 8.3 | Filtrer par localisation | Filtre fonctionnel | |
| 8.4 | Filtrer par prix min / max | Fourchette de prix respectée | |
| 8.5 | Trier par prix croissant | Annonce la moins chère en premier | |
| 8.6 | Recherche sans résultat | Message d'aide en français affiché, aucune erreur | |
| 8.7 | Vérifier l'URL avec filtres | Paramètres visibles (partage possible) | |
| 8.8 | Si > 24 annonces : naviguer à la page 2 | Annonces différentes de la page 1 | |

---

## 9. Mettre en favori

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 9.1 | Cliquer sur ♡ sans être connecté | Redirection vers `/login` | |
| 9.2 | Cliquer sur ♡ connecté (compte acheteur) | Icône remplie, confirmation visuelle | |
| 9.3 | Aller sur `/favorites` | Annonce présente dans la liste | |
| 9.4 | Cliquer sur ♡ pour retirer le favori | Icône vide, annonce retirée de `/favorites` | |
| 9.5 | Vider tous les favoris | État vide avec message et bouton « Explorer les annonces » | |

---

## 10. Contacter un vendeur

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 10.1 | Visiter l'annonce approuvée (compte acheteur) | Bouton « Contacter » visible | |
| 10.2 | Cliquer sur « Contacter » | Conversation créée, redirection vers `/messages/[id]` | |
| 10.3 | Envoyer un message | Message affiché immédiatement | |
| 10.4 | Ouvrir l'onglet vendeur en parallèle | Message reçu en temps réel (Realtime) | |
| 10.5 | Vendeur répond | Réponse apparaît chez l'acheteur sans rechargement | |
| 10.6 | Aller sur `/messages` | Conversation listée avec dernier message | |
| 10.7 | Supprimer la conversation | Conversation disparaît pour l'utilisateur | |
| 10.8 | Envoyer > 20 messages en 60 secondes | Message de rate limit | |
| 10.9 | Cliquer « Contacter » en étant le vendeur | Erreur « Vous ne pouvez pas vous envoyer un message » | |

---

## 11. Signaler une annonce

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 11.1 | Visiter une annonce (compte acheteur) | Lien « Signaler » visible en bas de page | |
| 11.2 | Ouvrir le modal de signalement | Options de motif affichées | |
| 11.3 | Sélectionner un motif et soumettre | Confirmation de signalement | |
| 11.4 | Signaler la même annonce à nouveau | Message « Vous avez déjà signalé cette annonce » | |
| 11.5 | En tant qu'admin, aller sur `/admin/reports` | Signalement visible | |
| 11.6 | Essayer de signaler sa propre annonce | Erreur « Vous ne pouvez pas signaler votre propre annonce » | |

---

## 12. Actions vendeur

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 12.1 | Visiter l'annonce approuvée (compte vendeur) | Panneau d'actions vendeur visible | |
| 12.2 | Cliquer « Marquer comme vendu » | Badge VENDU affiché, annonce retirée de la recherche | |
| 12.3 | Cliquer « Modifier l'annonce » | Formulaire pré-rempli | |
| 12.4 | Modifier un champ et sauvegarder | Annonce repasse à « En attente » de modération | |
| 12.5 | Cliquer « Supprimer l'annonce » et confirmer | Annonce archivée, disparaît de la recherche | |
| 12.6 | Vérifier dans `/profile` | Annonce archivée visible avec badge correspondant | |

---

## 13. Modifier le profil

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 13.1 | Aller sur `/profile/edit` | Formulaire pré-rempli avec données actuelles | |
| 13.2 | Modifier le nom | Nouveau nom visible sur `/profile` | |
| 13.3 | Modifier la bio | Bio mise à jour | |
| 13.4 | Modifier la localisation | Localisation mise à jour | |
| 13.5 | Téléverser un avatar | Photo de profil affichée sur `/profile` | |
| 13.6 | Sauvegarder | Bannière « Profil mis à jour avec succès » | |

---

## 14. Page vendeur public

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 14.1 | Cliquer sur le nom du vendeur dans une annonce | Redirection vers `/sellers/[userId]` | |
| 14.2 | Vérifier les données affichées | Nom, bio, trust level, localisation, statistiques | |
| 14.3 | Statistiques | Nombre d'annonces actives et de ventes correct | |
| 14.4 | Visiter `/sellers/uuid-invalide` | Page 404 | |
| 14.5 | Vérifier le code source | JSON-LD Person présent | |

---

## 15. SEO & technique

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 15.1 | Inspecter le code source d'une annonce | `<title>` unique, meta description, OG tags présents | |
| 15.2 | Vérifier JSON-LD Product | `type: Product`, prix correct, image valide | |
| 15.3 | Vérifier JSON-LD BreadcrumbList | Chemin Accueil → Catégorie → Annonce | |
| 15.4 | Visiter `/robots.txt` | Fichier valide, pages admin exclues | |
| 15.5 | Visiter `/sitemap.xml` | URLs valides, annonces actives présentes | |
| 15.6 | Google Rich Results Test | URL d'annonce → Product schema valide | |

---

## 16. Tests mobile (375 px)

| # | Étape | Résultat attendu | ✓/✗ |
|---|-------|-----------------|-----|
| 16.1 | Menu hamburger | S'ouvre et se ferme, liens de navigation fonctionnels | |
| 16.2 | Page d'accueil | Grille de catégories et annonces lisible | |
| 16.3 | Formulaire de création | Champs utilisables sans zoom | |
| 16.4 | Upload photo depuis caméra | Fonctionne sur iOS et Android | |
| 16.5 | Messagerie | Clavier ne masque pas le champ de saisie | |
| 16.6 | Page d'annonce | Prix et bouton « Contacter » visibles sans scroll horizontal | |

---

## Notes de test

```
Bugs détectés :
-
-
-

Suggestions :
-
-

Validé par :                          Date :
```

---

*Checklist interactive disponible dans l'interface admin : `/admin/beta-checklist`*  
*Seed de données de test : `scripts/seed-beta.sql`*
