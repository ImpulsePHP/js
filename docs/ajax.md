# Requêtes AJAX et format des réponses

Cette page décrit le format des requêtes envoyées par le moteur JS (via `updateComponent` ou `emit`) et la structure des réponses attendues côté client.

## Envoi — payload principal
La fonction `updateComponent` construit et envoie un objet JSON au serveur avec la structure suivante :

```json
{
  "id": "<component-id>",
  "action": "login",
  "states": {},
  "value": "",
  "update": "group@state",
  "_local_storage": {},
  "slot": ""
}
```

## Entêtes importants
- `Content-Type: application/json`
- `X-Impulse-Components` — header contenant la liste des composants actifs (utile au serveur pour dispatcher des événements et connaître le contexte)
- `Accept-Language` — si `document.documentElement.lang` est défini

## Réponses serveur
Le serveur peut renvoyer :
- `updates` : tableau d'objets `{ component, html, result }` ; chaque `html` peut être soit un fragment HTML soit un JSON encodant des fragments.
- `styles` : CSS dynamique à injecter (la fonction `injectStyles` s'occupe d'insérer/mettre à jour `style#impulse-dynamic-styles`).
- `localStorage` : paires clé/valeur pour synchroniser le localStorage du client.
- `events` : événements côté client à émettre via `Impulse.emit`.

### Réponse d'erreur (développement)
En mode dev (ou quand `DevError::respond` est utilisé), l'API peut renvoyer :
```json
{ "error": true, "message": "...", "code": "action_not_found" }
```
- `code` est important : le client s'appuie sur `code === 'action_not_found'` pour identifier une action absente sur le composant ciblé et, dans certains cas, retenter l'appel sur un composant parent. Pour d'autres codes, le client affichera `showImpulseError`.

## Comportement côté client
- Les `updates` sont parcourues et chaque fragment est passé à `applyUpdate(component, html, focusInfo)`.
- Si la réponse contient `error: true`, la promesse est rejetée avec un objet `{ message, error, data }` afin que le caller puisse inspecter `data.code` ou déclencher un fallback contrôlé.

---

Voir `api.md` pour l'utilisation programmative de `updateComponent` et `emit`.
