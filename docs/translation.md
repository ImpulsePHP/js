# Translation Provider

The translation provider allows setting the active language directly from the URL path. Each page may start with a language code such as `/fr` or `/en`. The provider reads this prefix and updates `app()->setLocale()` accordingly. When no valid prefix is found, the default locale is used.

The prefix is removed from the request path so the router still sees standard routes. For example `/fr/contact` is processed as `/contact`.

## Changing the language in links

Use the global `getCurrentPath()` helper to generate language-aware URLs.

```php
<a href="{{ getCurrentPath('fr') }}">FR</a>
<a href="{{ getCurrentPath('en') }}">EN</a>
```

Calling `getCurrentPath()` without a parameter returns the current path without the language prefix.

## Configuration

Add the supported languages in `impulse.php`:

```php
return [
    'locale' => 'fr',
    'supported' => ['fr', 'en', 'de'],
];
```

## Expected behaviour

| Current URL | Call | Result |
|-------------|------|--------|
| `/fr/accueil` | `getCurrentPath()` | `/accueil` |
| `/fr/accueil` | `getCurrentPath('en')` | `/en/accueil` |
| `/about` | `getCurrentPath('fr')` | `/fr/about` |
| `/` | `getCurrentPath('en')` | `/en` |

This mechanism provides clean, SEO-friendly URLs without relying on query parameters.
