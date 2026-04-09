# Exemples pratiques

## 1) Bouton UI : fallback du composant UI vers le parent
```html
<div data-impulse-id="login-component_imbrication_1">
  <uibutton
    type="button"
    data-action-click="login"
    label="Connexion"
  />
</div>
```
Comportement : le client appellera `login` sur `UIButtonComponent`, puis sur le composant parent si l'action n'existe pas sur le composant UI.

## 2) Balise HTML standard dans un composant
```html
<p class="text-rose-700" data-action-click="logout">
  Déconnexion
</p>
```
Comportement : le client appellera `logout` dans le composant qui rend cette balise HTML.

## 3) Ciblage explicite avec `data-action-call`
```html
<uibutton
  type="button"
  data-action-click="save"
  data-action-call="RegisterComponent"
  label="Enregistrer"
/>
```
Comportement : le client appellera directement `save` sur `RegisterComponent`, sans utiliser le composant le plus proche.

## 4) Update partiel (`data-action-update`)
```html
<button data-action-click="saveProfile" data-action-update="profile@info">Sauver</button>
```
Côté serveur, renvoyer un fragment `data-update="profile@info"` dans le HTML renvoyé ; le client remplacera uniquement cette portion.

## 5) Utilisation avancée : préserver le focus
- Sur un champ `input`, le runtime enverra `activeElementId`/`activeElementSelector` et `selectionStart`/`selectionEnd` si le champ a le focus lors de l'envoi.
- Après la mise à jour, le moteur tentera de restaurer le focus et la position du caret.

## 6) Émettre un événement global
```js
import { emit } from './core/ajax';

await emit('story.select', { storyName: 'Alert' }, { components: ['u-i-alert-component_imbrication_1'] });
```
Le serveur peut répondre avec des `updates` pour un ou plusieurs composants.

---

Pour plus de détails, référez-vous à `actions.md`, `ajax.md` et `api.md`.
