# Synchronisation du localStorage

Impulses peut garder le serveur et les autres onglets du navigateur synchronisés avec les changements effectués dans `localStorage`.

## Mise en place

La fonctionnalité est activée automatiquement lorsque vous chargez le script principal. Au chargement de la page, le contenu de `localStorage` est synchronisé avec le backend. Les modifications suivantes sont ensuite propagées en arrière-plan.

## API

### `forceSyncLocalStorage()`

Envoie immédiatement le contenu courant de `localStorage` au serveur et attend la réponse.

```javascript
import { forceSyncLocalStorage } from 'impulses';

await forceSyncLocalStorage();
```

## Événements

Un événement personnalisé `impulse-localstorage` est déclenché sur le document à chaque ajout, suppression ou modification d’une clé. Vous pouvez l’écouter pour réagir aux mises à jour provenant d’un autre onglet.

```javascript
document.addEventListener('impulse-localstorage', (event) => {
  console.log('Stockage modifié', event.detail.key, event.detail.value);
});
```
