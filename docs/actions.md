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

### Résolution de l'action
- Par défaut, une balise HTML standard rendue dans un composant appelle l'action sur le composant le plus proche.
- Pour un composant UI imbriqué comme `uibutton`, après propagation automatique des attributs, l'action est d'abord appelée sur `UIButtonComponent`, puis sur les composants parents jusqu'à trouver une méthode `#[Action]`.
- `data-action-call` reste prioritaire et force l'appel sur un composant précis.

Exemple :
```html
<uibutton
  type="button"
  label="Enregistrer"
  data-action-click="save"
/>
```

Dans cet exemple, l'action `save` sera appelée sur `UIButtonComponent`, puis sur les composants parents si elle n'existe pas sur ce composant UI.

### `data-action-call`
- Usage : `data-action-call="MyComponent"`.
- Objectif : forcer l'appel d'une action sur un autre composant précis, au lieu d'utiliser le composant le plus proche.
- Valeurs recommandées :
  - nom court de classe : `LoginComponent`
  - préfixe de composant : `login-component`

Exemple :
```html
<uibutton
  type="button"
  label="Enregistrer"
  data-action-click="save"
  data-action-call="RegisterComponent"
/>
```

Dans cet exemple, l'action `save` sera appelée directement sur `RegisterComponent`.

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
- Balise HTML standard dans un composant :
```html
<p class="text-rose-700" data-action-click="logout">
  Déconnexion
</p>
```
Le moteur appellera `logout` dans le composant qui rend cette balise.
- Wrapper avec propagation :
```html
<span data-action-click="login">
  <uibutton label="Connexion" />
</span>
```
Le moteur transférera `data-action-click` vers le bouton rendu par `uibutton`.

---

Pour les exemples pratiques d'utilisation, voir `examples.md`.
