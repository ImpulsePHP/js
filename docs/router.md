# Router

Le routeur permet une navigation fluide sans rechargement complet de page. Lorsqu’un lien porte l’attribut `data-router`, Impulses intercepte le clic, récupère la page cible via `fetch`, remplace la zone de rendu et met à jour l’historique du navigateur.

```html
<a href="/about" data-router>À propos</a>
```

## Fonctionnement

1. les liens marqués avec `data-router` sont interceptés ;
2. la page est demandée en AJAX ;
3. l’élément `#app` de la réponse remplace l’élément courant dans le DOM ;
4. certaines balises persistantes comme `<meta>`, `<link>`, `<title>` et `<script>` sont conservées pour éviter les doublons ;
5. `history.pushState()` met à jour l’URL pour conserver le comportement des boutons précédent / suivant.

## Événements émis

- `impulse:page-loaded` : émis au chargement initial avec l’URL courante et le chemin de route ;
- `impulse:page-navigated` : émis après chaque navigation AJAX, avec notamment le temps de chargement et la taille de la réponse.

Exemple d’écoute :

```javascript
window.addEventListener('impulse:page-navigated', (event) => {
  const { url, loadTime } = event.detail;
  console.log('Navigation vers', url, 'en', loadTime, 'ms');
});
```
