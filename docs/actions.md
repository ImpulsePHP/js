# Actions et directives `data-action-*`

Ce document décrit les directives `data-action-*` supportées par le moteur JS et le comportement associé.

## Directives prises en charge
- `data-action-click` — déclenche sur `click`.
- `data-action-input` — déclenche sur `input`.
- `data-action-change` — déclenche sur `change`.
- `data-action-blur` — déclenche sur `blur`.
- `data-action-keydown` — déclenche sur `keydown` (la touche peut être passée comme argument).
- `data-action-submit` — placé sur un `form`, déclenche sur `submit`.
- `data-action-emit` — émet un événement via `Impulse.emit`.

Chaque attribut peut contenir :
- un nom de méthode simple : `login`
- une notation d'appel : `updateName("John")`

### `data-action-update`
- Usage : `data-action-update="group@state"`.
- Objectif : indiquer au client que la réponse serveur contiendra un fragment ciblé `data-update="group@state"` et qu'il faut seulement remplacer ce fragment.

Comment ça marche :
- Lorsque présent, `data-action-update` ajoute une option `update` dans `focusInfo` envoyé au serveur via `updateComponent`.
- Si le serveur renvoie une réponse indiquant un fragment correspondant, `applyUpdate` remplacera uniquement ce fragment au lieu de remplacer l'intégralité du composant.

### Propagation automatique des `data-action-*`
- Au démarrage (fonction `bindImpulseEvents()`), le moteur exécute `propagateAllActionAttributes()`.
- Si un élément est un wrapper (ex. `span`, `div`) contenant `data-action-*`, la librairie :
  1. Cherche un descendant "actionnable" (button, a, input[type=button|submit|image], éléments avec `[role="button"]` ou `[tabindex]`).
  2. Si trouvé, transfère (MOVE par défaut) l'attribut `data-action-*` vers cet élément pour que le binding se fasse sur ce dernier.
  3. Si aucun descendant natif trouvé, la propagation cible la première racine de composant enfant (`[data-impulse-id]`).

Note : la stratégie par défaut est MOVE (l'attribut est retiré du wrapper). Si vous préférez COPY, je peux modifier la logique.

### Exemples
- Bouton simple :
```html
<button data-action-click="logout">Se déconnecter</button>
```
- Wrapper avec propagation :
```html
<span data-action-click="login">
  <uibutton label="Connexion" />
</span>
```
Le moteur transférera `data-action-click` vers le bouton rendu par `uibutton`.

---

Pour les exemples pratiques d'utilisation, voir `examples.md`.
