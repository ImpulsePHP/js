# Exemples pratiques

## 1) Login : action sur le composant parent
```html
<div data-impulse-id="login-component_imbrication_1">
  <uibutton
    type="button"
    data-action-click="login"
    label="Connexion"
  />
</div>
```
Comportement : le client cherchera `login` sur les composants parent (outer) avant le composant enfant. Si la méthode existe sur le composant `login-component`, elle sera appelée directement.

## 2) Update partiel (
`data-action-update`)
```html
<button data-action-click="saveProfile" data-action-update="profile@info">Sauver</button>
```
Côté serveur, renvoyer un fragment `data-update="profile@info"` dans le HTML renvoyé ; le client remplacera uniquement cette portion.

## 3) Utilisation avancée : préserver le focus
- Sur un champ `input`, le runtime enverra `activeElementId`/`activeElementSelector` et `selectionStart`/`selectionEnd` si le champ a le focus lors de l'envoi.
- Après la mise à jour, le moteur tentera de restaurer le focus et la position du caret.

## 4) Émettre un événement global
```js
import { emit } from './core/ajax';

await emit('story.select', { storyName: 'Alert' }, { components: ['u-i-alert-component_imbrication_1'] });
```
Le serveur peut répondre avec des `updates` pour un ou plusieurs composants.

---

Pour plus de détails, référez-vous à `actions.md`, `ajax.md` et `api.md`.
