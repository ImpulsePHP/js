# Impulses JS

`impulsephp/js` est le moteur JavaScript officiel d’ImpulsePHP. Il apporte le comportement dynamique côté navigateur aux composants rendus par le serveur, sans imposer de framework front-end externe.

## Ce que fait le package

- intercepte les actions déclarées avec `data-action-*` ;
- déclenche des mises à jour partielles en AJAX ;
- expose une API d’événements globale via `window.Impulse` ;
- synchronise le `localStorage` avec le backend ;
- fournit des briques prêtes à l’emploi pour les interactions, la recherche instantanée et les toasts ;
- gère une navigation client compatible avec les pages ImpulsePHP.

## Prérequis

- Node.js et npm ;
- une application ImpulsePHP capable de servir le bundle généré.

## Installation

Depuis le dossier `js/` :

```bash
npm install
```

## Build et développement

```bash
npm run build
```

Pour un développement en surveillance continue :

```bash
npm run watch
```

## Exemple d’intégration

Incluez le bundle généré dans votre layout principal :

```html
<script src="/assets/impulses/dist/impulse.js" type="module"></script>
```

Une fois chargé, le script initialise automatiquement le moteur, branche les événements, active la synchronisation du `localStorage` et expose `window.Impulse`.

Exemple d’usage côté navigateur :

```javascript
window.Impulse.on('cart.updated', (payload) => {
  console.log('Panier mis à jour', payload);
});

window.Impulse.emit('cart.updated', { count: 3 });
```

## API JavaScript

L’objet global `window.Impulse` expose notamment :

- `emit(event, payload, options?)`
- `updateComponent(...)`
- `on(event, callback)`
- `off(event, callback)`

## Synchronisation du localStorage

Le moteur déclenche un événement `impulse-localstorage` à chaque modification observée du `localStorage`, y compris lorsqu’elle provient d’un autre onglet.

```javascript
window.addEventListener('impulse-localstorage', (event) => {
  const { key, value } = event.detail;
  console.log('Changement localStorage :', key, value);
});
```

## Documentation complémentaire

Des guides détaillés sont disponibles dans `docs/` :

- `docs/router.md`
- `docs/events.md`
- `docs/localStorage.md`
- `docs/interactions.md`
- `docs/translation.md`
- `docs/livesearch.md`
- `docs/charactercounter.md`

## DevTools expérimentaux

Un serveur léger de développement est fourni dans `devtools/server.js`.

```bash
node devtools/server.js
```

Chargez ensuite le bundle de DevTools après le bundle principal :

```html
<script src="/assets/impulses/dist/impulse.js" type="module"></script>
<script src="/assets/impulses/dist/impulse.devtools.js" type="module"></script>
```

L’interface est prévue pour être consultée sur `http://localhost:1337`.

## Tests

```bash
npm test
```

## Licence

MIT
