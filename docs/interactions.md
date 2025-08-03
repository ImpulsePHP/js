# Frontend Interactions Without JavaScript

This page lists the `data-*` attributes supported by Impulses to handle simple interactions without writing JavaScript.
Whenever a selector targets an id with the `#` syntax, elements having
`data-impulse-id` with the same value are also matched. This lets you
reference Impulse components without adding extra `id` attributes.

## data-toggle="#id"

Shows or hides the targeted element.

```html
<button data-toggle="#menu1">Open menu</button>
<div id="menu1" style="display: none">Menu content</div>
```

You can add `data-toggle-group="name"` to close other elements in the same group before opening the requested one.

```html
<button data-toggle="#faq1" data-toggle-group="faq">Question 1</button>
<button data-toggle="#faq2" data-toggle-group="faq">Question 2</button>

<div id="faq1" style="display: none">Answer 1</div>
<div id="faq2" style="display: none">Answer 2</div>
```

## data-show="#id"

Forces the targeted element to be displayed.

```html
<button data-show="#modal">Show</button>
<div id="modal" style="display: none">A modal</div>
```

## data-hide="#id"

Hides the targeted element.

```html
<button data-hide="#modal">Close</button>
```

## data-close

`data-close="parent"` hides the parent element.
`data-close="#id"` hides the element that matches the selector.

```html
<div class="box">
  <button data-close="parent">Close this box</button>
</div>
<button data-close="#notification">X</button>
```

## data-if and data-unless

Conditionally shows or hides an element based on the state of another.

```html
<input type="checkbox" id="showMore" />
<div data-if="#showMore:checked">Text when checked</div>
<div data-unless="#showMore:checked">Text when unchecked</div>
```

## data-toggle-class="class" + data-target="#id"

Adds or removes a CSS class on the target.

```html
<button data-toggle-class="active" data-target="#box1">Toggle active</button>
<div id="box1">Content</div>
```

## data-scrollto="#id"

Scrolls the page to the targeted element.

```html
<button data-scrollto="#contact">Go to bottom</button>
```

## data-close-outside

Automatically closes the element when clicking outside of it.

### Syntax

- `data-close-outside="self"` – close the element when clicking outside of itself
- `data-close-outside=".selector"` – close when clicking outside the given selector
- `data-close-outside-ignore=".selector"` – ignore clicks on elements matching the selector

### NEW: Component Actions

- `data-close-outside-action="methodName"` – call a component method when closing
- `data-close-outside-action="methodName('param')"` – call a component method with parameters
- `data-close-outside-emit="eventName"` – emit a global event when closing (legacy)
- `data-close-outside-emit="methodName()"` – call a component method when closing (legacy)

### Examples

#### Basic usage
```html
<div class="dropdown" data-close-outside="self">
  <button>Dropdown trigger</button>
  <div class="menu">Menu items...</div>
</div>
```

#### With ignore selector
```html
<div class="dropdown" data-close-outside="self" data-close-outside-ignore="button">
  <button>Click me (won't close dropdown)</button>
  <div class="menu">Menu items...</div>
</div>
```

#### With component action (NEW)
```html
<div class="select-dropdown" 
     data-close-outside="self" 
     data-close-outside-action="closeDropdown">
  <!-- When clicking outside, calls component.closeDropdown() -->
</div>
```

#### With component action and parameters (NEW)
```html
<div class="modal" 
     data-close-outside="self" 
     data-close-outside-action="close('cancelled')">
  <!-- When clicking outside, calls component.close('cancelled') -->
</div>
```

#### Multiple attributes combined (NEW)
```html
<div class="advanced-dropdown" 
     data-close-outside="self"
     data-close-outside-ignore="#trigger-button"
     data-close-outside-action="handleOutsideClick">
  <!-- Complex dropdown with trigger ignore and component method call -->
</div>
```

### Behavior

When clicking outside occurs:
1. **Element is hidden** using `style.display = 'none'`
2. **Component action is called** if `data-close-outside-action` is specified
3. **Event is emitted** if `data-close-outside-emit` is specified (legacy)

The component action automatically finds the parent component with `data-impulse-id` and calls the specified method using the Impulse component system.

### Typical use cases

- **Dropdowns** – close a drop-down menu when clicking elsewhere
- **Modals** – close a modal when clicking on the overlay
- **Tooltips** – hide a tooltip when clicking elsewhere
- **Popups** – close a popup when clicking outside
- **Component interactions** – trigger component methods on outside clicks (NEW)

---

These interactions only manipulate `style.display` or CSS classes with no extra script. They work with any PHP rendering engine supported by ImpulsePHP.
