# Gestion des chemins traduits

Le provider de traduction permet de définir la langue active directement à partir du chemin de l’URL. Une page peut ainsi commencer par un code langue comme `/fr` ou `/en`. Le provider lit ce préfixe, met à jour la locale active, puis retire ce préfixe du chemin afin que le routeur continue de travailler sur des routes standard.

Par exemple, `/fr/contact` est traité comme `/contact` côté routage.

## Générer des liens multilingues

Utilisez le helper global `getCurrentPath()` pour construire des URLs tenant compte de la langue courante.

```php
<a href="{{ getCurrentPath('fr') }}">FR</a>
<a href="{{ getCurrentPath('en') }}">EN</a>
```

Un appel à `getCurrentPath()` sans argument retourne le chemin courant sans préfixe de langue.

## Configuration

Déclarez les langues supportées dans `impulse.php` :

```php
return [
    'locale' => 'fr',
    'supported' => ['fr', 'en', 'de'],
];
```

## Comportement attendu

| URL courante | Appel | Résultat |
|--------------|-------|----------|
| `/fr/accueil` | `getCurrentPath()` | `/accueil` |
| `/fr/accueil` | `getCurrentPath('en')` | `/en/accueil` |
| `/about` | `getCurrentPath('fr')` | `/fr/about` |
| `/` | `getCurrentPath('en')` | `/en` |

Cette approche permet d’obtenir des URLs propres, lisibles et adaptées au référencement, sans passer par des paramètres de requête.
