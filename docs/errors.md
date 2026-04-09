# Gestion des erreurs et codes

Le moteur JS s'appuie sur des réponses JSON structurées pour différencier les erreurs fatales des erreurs métier ou de ciblage.

## Code important : `action_not_found`
- Signification : la méthode demandée n'existe pas sur le composant ciblé.
- Format côté serveur :
```json
{ "error": true, "message": "Erreur...", "code": "action_not_found" }
```
- Comportement client :
  - Ne pas afficher l'erreur globalement (`showImpulseError`) pour ce code.
  - Ne pas logguer en console pour éviter le bruit sur les erreurs déjà gérées.
  - Si l'action vient d'un wrapper de composant UI propagé, tenter le composant parent suivant.
  - Sinon, rejeter la promesse pour laisser le code appelant décider quoi faire.

## Autres erreurs
- Toute autre réponse avec `error: true` sera affichée via `showImpulseError` et la promesse rejetée.
- Les erreurs serveur inattendues (stack traces, exceptions non gérées) peuvent apparaître en JSON via `DevError::respond` en mode dev — vérifier les logs et la console réseau.

---

Conseil : durant le développement, regardez l'onglet `Network` pour inspecter les requêtes vers `/impulse.php` et vérifier la présence du champ `code` pour déboguer le ciblage et le fallback d'action.
