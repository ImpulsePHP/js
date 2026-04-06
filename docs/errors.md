# Gestion des erreurs et codes

Le moteur JS s'appuie sur des réponses JSON structurées pour différencier les erreurs fatales des cas où une tentative doit être réessayée sur un autre composant.

## Code important : `action_not_found`
- Signification : la méthode demandée n'existe pas sur le composant ciblé.
- Format côté serveur :
```json
{ "error": true, "message": "Erreur...", "code": "action_not_found" }
```
- Comportement client :
  - Ne pas afficher l'erreur globalement (`showImpulseError`) pour ce code.
  - Ne pas logguer en console (pour éviter le bruit lié aux tentatives de fallback).
  - Tenter la même action sur le prochain composant de la chaîne (parent -> child selon la configuration actuelle).

## Autres erreurs
- Toute autre réponse avec `error: true` sera affichée via `showImpulseError` et la promesse rejetée.
- Les erreurs serveur inattendues (stack traces, exceptions non gérées) peuvent apparaître en JSON via `DevError::respond` en mode dev — vérifier les logs et la console réseau.

---

Conseil : durant le développement, regardez l'onglet `Network` pour inspecter les requêtes vers `/impulse.php` et vérifier la présence du champ `code` pour déboguer le comportement de fallback.
