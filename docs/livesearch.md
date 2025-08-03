# Documentation LiveSearch - ImpulseJS
## 🎯 **Vue d'ensemble**
LiveSearch est un module de recherche en temps réel intégré à ImpulseJS qui permet aux développeurs PHP d'ajouter une fonctionnalité de recherche instantanée dans n'importe quelle liste UI **sans écrire une seule ligne de JavaScript**.
Le système s'initialise automatiquement via les attributs `data-*` et fonctionne avec tous types de contenus : select, listes, tableaux, cartes, etc.
## ⚡ **Fonctionnalités**
- ✅ **Auto-initialisation** - Aucun JavaScript requis
- ✅ **Recherche instantanée** - Résultats en temps réel
- ✅ **Multi-modes** - Contains, startsWith, fuzzy, par mots
- ✅ **Flexible** - Fonctionne avec n'importe quel HTML
- ✅ **Personnalisable** - Configuration via attributs data-*
- ✅ **Accessible** - Support clavier (Escape pour vider)
- ✅ **Performant** - Optimisé pour de grandes listes

## 🚀 **Installation**
LiveSearch est automatiquement inclus dans ImpulseJS. Il suffit d'importer le bundle :
``` html
<script src="/path/to/impulse.js"></script>
```
## 📋 **Configuration de base**
### **Structure HTML minimale**
``` html
<div data-live-search>
    <!-- Input de recherche -->
    <input type="text" placeholder="Rechercher..." data-search-input>
    
    <!-- Conteneur des éléments à filtrer -->
    <ul data-search-container>
        <li data-search-text="Option 1">Option 1</li>
        <li data-search-text="Option 2">Option 2</li>
        <li data-search-text="Option 3">Option 3</li>
    </ul>
</div>
```
### **Attributs obligatoires**

| Attribut | Élément | Description |
| --- | --- | --- |
| `data-live-search` | Conteneur principal | Active le système de recherche |
| `data-search-input` | Input | Champ de saisie de recherche |
| `data-search-text` | Éléments à filtrer | Texte utilisé pour la recherche |
## ⚙️ **Configuration avancée**
### **Attributs de configuration**

| Attribut | Valeur par défaut | Description |
| --- | --- | --- |
| `data-search-container` | Container principal | Conteneur spécifique des éléments |
| `data-search-items` | `"li, [data-searchable], .searchable-item"` | Sélecteur des éléments à filtrer |
| `data-search-fields` | `"textContent,data-search-text,data-label"` | Champs de recherche (séparés par virgules) |
| `data-search-mode` | `"contains"` | Mode de recherche : `contains`, `startsWith`, `fuzzy` |
| `data-search-case-sensitive` | `"false"` | Recherche sensible à la casse |
| `data-search-exact-match` | `"false"` | Correspondance exacte uniquement |
| `data-search-word-match` | `"false"` | Recherche par mots séparés |
| `data-search-min-length` | `"0"` | Nombre minimum de caractères |
| `data-search-hidden-class` | `"hidden"` | Classe CSS pour cacher les éléments |
| `data-search-no-results-message` | `"Aucun résultat trouvé"` | Message si aucun résultat |
## 💡 **Exemples d'utilisation**
### **1. Select personnalisé avec recherche**
``` php
<?php
// Dans votre composant PHP
private function renderDropdown(): string
{
    return <<<HTML
    <div class="relative" 
         data-live-search
         data-search-items="li"
         data-search-fields="data-search-text,span"
         data-search-no-results-message="Aucune option trouvée">
        
        <!-- Input de recherche -->
        <div class="p-2 border-b">
            <input type="text" 
                   placeholder="Rechercher une option..."
                   data-search-input
                   class="w-full px-2 py-1 border rounded">
        </div>
        
        <!-- Liste des options -->
        <ul class="max-h-48 overflow-y-auto">
            <li data-search-text="France" data-value="FR" class="px-3 py-2 hover:bg-gray-100">
                <span>🇫🇷 France</span>
            </li>
            <li data-search-text="Allemagne" data-value="DE" class="px-3 py-2 hover:bg-gray-100">
                <span>🇩🇪 Allemagne</span>
            </li>
            <li data-search-text="Espagne" data-value="ES" class="px-3 py-2 hover:bg-gray-100">
                <span>🇪🇸 Espagne</span>
            </li>
        </ul>
    </div>
    HTML;
}
?>
```
### **2. Liste de produits avec recherche fuzzy**
``` html
<div class="products-container" 
     data-live-search
     data-search-mode="fuzzy"
     data-search-fields="data-search-text,data-tags"
     data-search-min-length="2">
    
    <input type="search" 
           placeholder="Rechercher un produit..." 
           data-search-input
           class="w-full mb-4 px-3 py-2 border rounded">
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="product-card border rounded p-4"
             data-search-text="iPhone 15 Pro Max"
             data-tags="apple,smartphone,téléphone">
            <h3>iPhone 15 Pro Max</h3>
            <p>Smartphone Apple dernière génération</p>
        </div>
        
        <div class="product-card border rounded p-4"
             data-search-text="Samsung Galaxy S24"
             data-tags="samsung,android,téléphone">
            <h3>Samsung Galaxy S24</h3>
            <p>Flagship Android de Samsung</p>
        </div>
        
        <div class="product-card border rounded p-4"
             data-search-text="MacBook Pro M3"
             data-tags="apple,laptop,ordinateur">
            <h3>MacBook Pro M3</h3>
            <p>Ordinateur portable professionnel</p>
        </div>
    </div>
</div>
```
### **3. Tableau avec recherche par colonnes**
``` html
<div class="table-container" 
     data-live-search
     data-search-items="tbody tr"
     data-search-fields="data-search-text"
     data-search-word-match="true">
    
    <input type="text" 
           placeholder="Rechercher dans le tableau..."
           data-search-input
           class="mb-3 px-3 py-2 border rounded w-full">
    
    <table class="w-full border-collapse border">
        <thead>
            <tr class="bg-gray-100">
                <th class="border p-2">Nom</th>
                <th class="border p-2">Email</th>
                <th class="border p-2">Ville</th>
            </tr>
        </thead>
        <tbody>
            <tr data-search-text="Jean Dupont jean.dupont@email.com Paris">
                <td class="border p-2">Jean Dupont</td>
                <td class="border p-2">jean.dupont@email.com</td>
                <td class="border p-2">Paris</td>
            </tr>
            <tr data-search-text="Marie Martin marie.martin@email.com Lyon">
                <td class="border p-2">Marie Martin</td>
                <td class="border p-2">marie.martin@email.com</td>
                <td class="border p-2">Lyon</td>
            </tr>
            <tr data-search-text="Pierre Moreau pierre.moreau@email.com Marseille">
                <td class="border p-2">Pierre Moreau</td>
                <td class="border p-2">pierre.moreau@email.com</td>
                <td class="border p-2">Marseille</td>
            </tr>
        </tbody>
    </table>
</div>
```
### **4. Menu de navigation avec recherche**
``` html
<nav class="sidebar" 
     data-live-search
     data-search-items=".nav-item"
     data-search-fields="data-search-text,a"
     data-search-mode="startsWith">
    
    <input type="text" 
           placeholder="Rechercher une page..."
           data-search-input
           class="w-full mb-4 px-3 py-2 border rounded">
    
    <ul class="nav-menu">
        <li class="nav-item" data-search-text="Dashboard Tableau de bord">
            <a href="/dashboard">📊 Dashboard</a>
        </li>
        <li class="nav-item" data-search-text="Clients Utilisateurs">
            <a href="/clients">👥 Clients</a>
        </li>
        <li class="nav-item" data-search-text="Produits Catalogue">
            <a href="/products">📦 Produits</a>
        </li>
        <li class="nav-item" data-search-text="Commandes Ventes">
            <a href="/orders">🛒 Commandes</a>
        </li>
        <li class="nav-item" data-search-text="Paramètres Configuration">
            <a href="/settings">⚙️ Paramètres</a>
        </li>
    </ul>
</nav>
```
### **5. Composant Impulse avec recherche**
``` php
<?php
// UISelectComponent.php avec LiveSearch intégré

private function renderDropdown(): string
{
    if (!$this->isOpen) {
        return '';
    }

    $searchInput = $this->renderSearchInput();
    $options = $this->renderOptions();

    return <<<HTML
    <div class="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg"
         data-live-search
         data-search-container
         data-search-items="li"
         data-search-fields="data-search-text,span"
         data-search-no-results-message="Aucune option trouvée"
         data-search-hidden-class="hidden"
         data-close-outside="self"
         data-close-outside-action="toggleDropdown">
        
        {$searchInput}
        <div class="max-h-48 overflow-y-auto">
            {$options}
        </div>
    </div>
    HTML;
}

private function renderSearchInput(): string
{
    if (!$this->searchable) {
        return '';
    }

    return <<<HTML
        <div class="p-2 border-b border-slate-200">
            <input type="text"
                   placeholder="{$this->searchPlaceholder}"
                   class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1"
                   data-search-input
                   autocomplete="off">
        </div>
    HTML;
}

private function renderOptions(): string
{
    $options = [];
    
    foreach ($this->options as $option) {
        $optionValue = is_array($option) ? ($option['value'] ?? '') : $option;
        $optionLabel = is_array($option) ? ($option['label'] ?? $optionValue) : $option;
        
        $options[] = <<<HTML
            <li class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50" 
                data-action-click="selectOption('{$optionValue}')"
                data-search-text="{$optionLabel}">
                <span class="text-sm">{$optionLabel}</span>
            </li>
        HTML;
    }

    return '<ul>' . implode('', $options) . '</ul>';
}
?>
```
## 🔧 **Modes de recherche**
### **Contains (par défaut)**
``` html
<div data-live-search data-search-mode="contains">
    <!-- Recherche : "app" trouve "Apple", "Application", "Happy" -->
</div>
```
### **StartsWith**
``` html
<div data-live-search data-search-mode="startsWith">
    <!-- Recherche : "app" trouve "Apple", "Application" mais pas "Happy" -->
</div>
```
### **Fuzzy**
``` html
<div data-live-search data-search-mode="fuzzy">
    <!-- Recherche : "apl" trouve "Apple" (lettres dans l'ordre) -->
</div>
```
### **Recherche par mots**
``` html
<div data-live-search data-search-word-match="true">
    <!-- Recherche : "jean paris" trouve "Jean Dupont - Paris" -->
</div>
```
## 🎨 **Personnalisation CSS**
### **Classes par défaut**
``` css
/* Élément caché */
.hidden {
    display: none;
}

/* Message "aucun résultat" */
[data-no-results] {
    padding: 12px;
    text-align: center;
    color: #64748b;
    font-size: 14px;
}
```
### **Personnalisation avec classe custom**
``` html
<div data-live-search data-search-hidden-class="fade-out">
    <!-- Utilise la classe 'fade-out' au lieu de 'hidden' -->
</div>
```

``` css
.fade-out {
    opacity: 0;
    transform: scale(0.95);
    transition: all 0.2s ease;
    pointer-events: none;
}
```
## 📱 **Support multi-champs**
``` html
<div data-live-search data-search-fields="data-title,data-description,data-tags,.subtitle">
    <input data-search-input>
    
    <div data-title="iPhone 15" 
         data-description="Smartphone Apple" 
         data-tags="apple,phone,mobile"
         class="product">
        <h3>iPhone 15</h3>
        <p class="subtitle">Le nouveau flagship d'Apple</p>
    </div>
</div>
```
La recherche se fera sur :
1. `data-title` → "iPhone 15"
2. `data-description` → "Smartphone Apple"
3. `data-tags` → "apple,phone,mobile"
4. `.subtitle` → "Le nouveau flagship d'Apple"

## 🎭 **Événements JavaScript (optionnel)**
Si vous voulez réagir aux événements de recherche :
``` javascript
document.addEventListener('live-search', (event) => {
    const { query, visibleItems, totalItems } = event.detail;
    
    console.log(`Recherche: "${query}"`);
    console.log(`${visibleItems.length}/${totalItems} résultats`);
    
    // Exemple : masquer/afficher un compteur
    document.getElementById('results-count').textContent = 
        `${visibleItems.length} résultat(s)`;
});
```
## 🚨 **Gestion d'erreurs**
### **Éléments manquants**
Si `data-search-input` n'est pas trouvé, un warning s'affiche dans la console :
``` 
LiveSearch: data-search-input not found in container
```
### **Sélecteurs invalides**
Le système utilise des sélecteurs par défaut si les attributs sont manquants :
- `data-search-items` → `"li, [data-searchable], .searchable-item"`
- `data-search-fields` → `"textContent,data-search-text,data-label"`

## ⚡ **Performance**
### **Optimisations intégrées**
- ✅ **Extraction unique** du texte de recherche au démarrage
- ✅ **Pas de regex** complexes, utilisation de `includes()`
- ✅ **Réduction du DOM** manipulation via `display` ou classes CSS
- ✅ **Debouncing** automatique sur les événements input

### **Conseils pour de grandes listes (1000+ éléments)**
``` html
<!-- Utilisez un délai minimum pour éviter les recherches trop fréquentes -->
<div data-live-search 
     data-search-min-length="2"
     data-search-mode="startsWith">
    <!-- Le mode startsWith est plus rapide que contains -->
</div>
```
## 🔄 **Intégration avec les composants Impulse**
LiveSearch se met automatiquement à jour lors des mises à jour de composants Impulse. Aucune action requise.
``` php
<?php
// Après un updateComponent(), LiveSearch se réinitialise automatiquement
$this->emit('component-updated');
?>
```
## 🆘 **Dépannage**
### **La recherche ne fonctionne pas**
1. ✅ Vérifiez que `data-live-search` est sur le conteneur principal
2. ✅ Vérifiez que `data-search-input` est sur l'input
3. ✅ Vérifiez que les éléments ont `data-search-text` ou du contenu textuel

### **Certains éléments ne sont pas trouvés**
1. ✅ Vérifiez le sélecteur `data-search-items`
2. ✅ Vérifiez les champs `data-search-fields`
3. ✅ Testez avec `data-search-mode="contains"` (par défaut)

### **Le message "aucun résultat" ne s'affiche pas**
1. ✅ L'élément sera créé automatiquement
2. ✅ Personnalisez avec `data-search-no-results-message`

## 🏆 **Bonnes pratiques**
### **✅ DO**
- Utilisez `data-search-text` pour un contrôle précis du texte de recherche
- Définissez `data-search-min-length="2"` pour de grandes listes
- Utilisez `data-search-mode="startsWith"` pour des performances optimales
- Testez avec différents modes selon vos besoins

### **❌ DON'T**
- N'oubliez pas `data-live-search` sur le conteneur principal
- Ne mélangez pas plusieurs modes de recherche sur le même conteneur
- N'utilisez pas de sélecteurs CSS complexes dans `data-search-items`

## 📝 **Résumé**
LiveSearch permet d'ajouter une recherche temps réel puissante avec une configuration 100% HTML via les attributs `data-*`. Le développeur PHP n'a besoin d'écrire aucun JavaScript, le système s'initialise automatiquement et s'intègre parfaitement avec l'écosystème Impulse.
**Attributs minimaux requis :**
- `data-live-search` (conteneur)
- `data-search-input` (input)
- `data-search-text` (éléments) ou contenu textuel

**Le reste est automatique !** 🚀
