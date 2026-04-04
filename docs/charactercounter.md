# Compteur de caractères

La fonctionnalité de compteur de caractères permet d’ajouter automatiquement un suivi en temps réel sur vos champs de saisie (`textarea`, `input text`, etc.). Elle gère deux modes d’affichage : le comptage progressif et le décompte.

## Fonctionnalités
- ✅ **Comptage en temps réel** - Mise à jour instantanée lors de la saisie
- ✅ **Deux modes d'affichage** - Comptage (`count`) ou décompte (`countdown`)
- ✅ **Indicateurs visuels** - Changement de couleur selon le seuil atteint
- ✅ **Support Unicode** - Comptage précis des caractères spéciaux et émojis
- ✅ **Auto-découverte** - Fonctionne automatiquement avec les nouveaux éléments DOM
- ✅ **Flexible** - Compatible avec textarea, input et autres champs

## Utilisation de base

#### 1. Côté PHP - Configuration du composant

``` php
<?php

class UITextareaComponent extends AbstractComponent
{
    public function template(): string
    {
        $characterCounterData = '';
        if ($this->maxLength > 0) {
            $characterCounterData = 'data-character-counter=\'' . json_encode([
                'maxLength' => $this->maxLength,
                'mode' => $this->countLength // 'count' ou 'countdown'
            ], JSON_THROW_ON_ERROR) . '\'';
        }

        return <<<HTML
            <div class="space-y-1">
                <label>Message</label>
                <div class="relative">
                    <textarea 
                        {$characterCounterData}
                        maxlength="{$this->maxLength}"
                    >{$this->value}</textarea>
                    
                    <!-- Élément d'affichage du compteur -->
                    <p class="mt-1 text-xs text-slate-500" data-character-display>
                        0/{$this->maxLength} caractères
                    </p>
                </div>
            </div>
        HTML;
    }
}
```

## Configuration

#### Attributs requis

| Attribut                 | Description                       |
|--------------------------|-----------------------------------|
| `data-character-counter` | Configuration JSON du compteur    |
| `data-character-display` | Élément qui affichera le compteur |

## Exemples d'utilisation

#### Exemple 1 : Comptage simple

``` html
<div>
    <textarea 
        data-character-counter='{"maxLength": 150, "mode": "count"}'
        placeholder="Tapez votre message...">
    </textarea>
    <p class="text-xs text-slate-500" data-character-display>
        0/150 caractères
    </p>
</div>
```

#### Exemple 2 : Mode décompte (comme Twitter)

``` html
<div>
    <textarea 
        data-character-counter='{"maxLength": 280, "mode": "countdown"}'
        placeholder="Quoi de neuf ?">
    </textarea>
    <p class="text-xs text-slate-500" data-character-display>
        280 caractères restants
    </p>
</div>
```

#### Exemple 3 : Avec cible personnalisée

``` html
<div>
    <input type="text" 
        data-character-counter='{"maxLength": 50, "mode": "count", "target": "#custom-counter"}'
        placeholder="Titre...">
</div>

<div class="mt-4">
    <span id="custom-counter" class="text-xs">0/50</span>
</div>

```

#### Exemple 4 : Input avec compteur

``` php
// Dans un composant Input
public function template(): string
{
    $counterConfig = json_encode([
        'maxLength' => $this->maxLength,
        'mode' => 'count'
    ]);

    return <<<HTML
        <div class="space-y-1">
            <label>{$this->label}</label>
            <div class="relative">
                <input 
                    type="text"
                    data-character-counter='{$counterConfig}'
                    maxlength="{$this->maxLength}"
                    value="{$this->value}">
                
                <small class="text-xs text-slate-500" data-character-display>
                    0/{$this->maxLength}
                </small>
            </div>
        </div>
    HTML;
}
```

## Indicateurs visuels

Le système applique automatiquement des classes CSS selon le niveau de remplissage :
- **`text-slate-500`** - État normal (< 90% de la limite)
- **`text-yellow-600`** - Avertissement (90-100% de la limite)
- **`text-red-600`** - Dépassement (> 100% de la limite)

#### Personnalisation des couleurs

``` css
/* Personnaliser les couleurs dans votre CSS */
[data-character-display].text-slate-500 { color: #64748b; }
[data-character-display].text-yellow-600 { color: #d97706; }
[data-character-display].text-red-600 { color: #dc2626; }
```

## Débogage

#### Messages de console

- **Warning** : `Counter display element not found for: [element]`
    - L'élément `[data-character-display]` n'a pas été trouvé
    - Vérifiez que l'élément est dans le même conteneur parent

- **Error** : `Invalid character counter configuration: [config]`
    - La configuration JSON est malformée
    - Vérifiez la syntaxe de l'attribut `data-character-counter`

#### Structure HTML attendue

``` html
<!-- ✅ Correct - Dans le même parent -->
<div>
    <textarea data-character-counter='{"maxLength": 100, "mode": "count"}'></textarea>
    <p data-character-display>0/100</p>
</div>

<!-- ❌ Incorrect - Éléments séparés -->
<div>
    <textarea data-character-counter='{"maxLength": 100, "mode": "count"}'></textarea>
</div>
<div>
    <p data-character-display>0/100</p>
</div>
```

## Bonnes pratiques
1. **Cohérence** : Utilisez le même mode (`count` ou `countdown`) dans toute votre application
2. **Accessibilité** : Ajoutez `aria-live="polite"` sur l'élément de comptage pour les lecteurs d'écran
3. **Performance** : Le système utilise déjà le debouncing pour les événements paste/cut
4. **UX** : Affichez toujours la limite initiale dans l'élément `[data-character-display]`
