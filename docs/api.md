# API publique — fonctions utilitaires

Ce fichier liste les fonctions exportées et utilisables par d'autres modules front ou par les développeurs.

## `updateComponent(componentId, action, value?, focusInfo?)`
- Usage :
```js
import { updateComponent } from './core/ajax';

await updateComponent('login-component_imbrication_1', 'login');
```
- Paramètres :
  - `componentId` : identifiant du composant (`data-impulse-id`).
  - `action` : nom de la méthode (ou notation d'appel) à appeler côté serveur.
  - `value` (optionnel) : valeur transmise à l'action si nécessaire.
  - `focusInfo` (optionnel) : objet contenant `activeElementId`, `activeElementSelector`, `selectionStart`, `selectionEnd`, `selectedIndex`, `update`.
- Retour : Promise qui résout quand l'application du update est terminée ou qui rejette en cas d'erreur.

## `emit(event, payload?, options?)`
- Usage : émettre un événement "global" vers le serveur (p.ex. pour dispatcher un événement à plusieurs composants).
```js
import { emit } from './core/ajax';

await emit('user.updated', { id: 12 });
```
- `options` peut contenir `components` (liste) ou `extra` (objets supplémentaires ajoutés au payload).

## `refreshImpulseComponentList()`
- Met à jour `window.__impulseComponents` en scannant le DOM pour tous les `data-impulse-id`.
- Appelé automatiquement par `applyUpdate` après remplacement d'un composant.

## Remarques
- Ces fonctions s'appuient sur les hooks internes (applyUpdate, injectStyles, collectStates) et sur `bindImpulseEvents()` pour rebinder les éléments après une mise à jour.

---

Voir aussi `actions.md` pour les directives `data-action-*` et `ajax.md` pour le format des requêtes/réponses.
