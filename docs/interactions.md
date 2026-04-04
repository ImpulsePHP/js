# Interactions sans JavaScript

Cette page recense les attributs `data-*` pris en charge par Impulses pour gérer des interactions simples sans écrire de JavaScript applicatif.

Lorsqu’un sélecteur cible un identifiant avec la syntaxe `#id`, les éléments possédant le même `data-impulse-id` peuvent également être retrouvés. Cela permet de cibler des composants Impulse sans ajouter d’attribut `id` supplémentaire.

## `data-toggle="#id"`

Affiche ou masque l’élément ciblé.

```html
<button data-toggle="#menu1">Ouvrir le menu</button>
<div id="menu1" style="display: none">Contenu du menu</div>
```

Vous pouvez ajouter `data-toggle-group="nom"` pour fermer les autres éléments du même groupe avant d’ouvrir l’élément ciblé.

```html
<button data-toggle="#faq1" data-toggle-group="faq">Question 1</button>
<button data-toggle="#faq2" data-toggle-group="faq">Question 2</button>

<div id="faq1" style="display: none">Réponse 1</div>
<div id="faq2" style="display: none">Réponse 2</div>
```

## `data-show="#id"`

Force l’affichage de l’élément ciblé.

```html
<button data-show="#modal">Afficher</button>
<div id="modal" style="display: none">Une modale</div>
```

## `data-hide="#id"`

Masque l’élément ciblé.

```html
<button data-hide="#modal">Fermer</button>
```

## `data-close`

- `data-close="parent"` masque le parent direct ;
- `data-close="#id"` masque l’élément correspondant au sélecteur.

```html
<div class="box">
  <button data-close="parent">Fermer ce bloc</button>
</div>

<button data-close="#notification">X</button>
```

## `data-if` et `data-unless`

Affiche ou masque un élément selon l’état d’un autre élément.

```html
<input type="checkbox" id="showMore" />
<div data-if="#showMore:checked">Texte affiché si coché</div>
<div data-unless="#showMore:checked">Texte affiché si décoché</div>
```

## `data-toggle-class="class"` avec `data-target="#id"`

Ajoute ou retire une classe CSS sur la cible.

```html
<button data-toggle-class="active" data-target="#box1">Activer / désactiver</button>
<div id="box1">Contenu</div>
```

## `data-scrollto="#id"`

Fait défiler la page jusqu’à l’élément ciblé.

```html
<button data-scrollto="#contact">Aller au formulaire</button>
```

## `data-close-outside`

Ferme automatiquement un élément lorsqu’un clic est détecté à l’extérieur.

### Syntaxe

- `data-close-outside="self"` : ferme l’élément lui-même ;
- `data-close-outside=".selector"` : ferme l’élément quand un clic a lieu hors du sélecteur donné ;
- `data-close-outside-ignore=".selector"` : ignore les clics sur certains éléments.

### Actions de composant

- `data-close-outside-action="methodName"` : appelle une méthode du composant à la fermeture ;
- `data-close-outside-action="methodName('param')"` : appelle une méthode avec paramètres ;
- `data-close-outside-emit="eventName"` : émet un événement global lors de la fermeture ;
- `data-close-outside-emit="methodName()"` : syntaxe héritée pour appeler une méthode.

### Exemples

#### Cas simple

```html
<div class="dropdown" data-close-outside="self">
  <button>Déclencheur</button>
  <div class="menu">Éléments du menu</div>
</div>
```

#### Avec sélecteur ignoré

```html
<div class="dropdown" data-close-outside="self" data-close-outside-ignore="button">
  <button>Ce bouton ne fermera pas le menu</button>
  <div class="menu">Éléments du menu</div>
</div>
```

#### Avec action de composant

```html
<div class="select-dropdown"
     data-close-outside="self"
     data-close-outside-action="closeDropdown">
</div>
```

#### Avec action et paramètre

```html
<div class="modal"
     data-close-outside="self"
     data-close-outside-action="close('cancelled')">
</div>
```

### Comportement

Lors d’un clic extérieur :

1. l’élément est masqué via `style.display = 'none'` ;
2. une action de composant est appelée si `data-close-outside-action` est présente ;
3. un événement peut être émis si `data-close-outside-emit` est défini.

Le moteur retrouve automatiquement le composant parent à partir de `data-impulse-id` pour appeler la méthode concernée.

## Cas d’usage typiques

- menus déroulants ;
- modales ;
- tooltips ;
- popups ;
- interactions déclenchées par le composant lors d’un clic extérieur.

Ces interactions manipulent uniquement l’affichage ou les classes CSS. Elles fonctionnent avec tout rendu HTML compatible ImpulsePHP.
