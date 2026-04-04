# Événements

Impulses expose un système d’événements léger via `window.Impulse`. Vous pouvez vous abonner à des événements émis par vos composants ou en déclencher depuis le navigateur.

## Écouter un événement

```javascript
window.Impulse.on('user:logged-in', (payload) => {
  console.log('Utilisateur connecté :', payload);
});
```

## Retirer un écouteur

Pour retirer un écouteur, utilisez `off()` avec la même fonction de rappel :

```javascript
const handler = (data) => console.log(data);

window.Impulse.on('cart:updated', handler);
window.Impulse.off('cart:updated', handler);
```

## Émettre un événement

Utilisez `Impulse.emit(event, payload)` pour déclencher un événement côté client et, selon le contexte, le transmettre aussi au composant côté serveur.

```javascript
window.Impulse.emit('profile:update', { name: 'John' });
```

## Cas d’usage typiques

- synchroniser plusieurs composants d’une même page ;
- réagir à une mise à jour de panier, de profil ou de filtre ;
- déclencher un rafraîchissement partiel côté interface.

Le routeur intégré émet également des événements comme `impulse:page-loaded` et `impulse:page-navigated`, décrits dans [router.md](router.md).
