# South Side Tech - Styling Guide

This guide explains the CSS component classes defined in `app/globals.css` for maintaining consistent styling across the entire site.

## Overview

Instead of using inline Tailwind classes throughout components, we use semantic CSS classes defined in `globals.css`. This provides:
- ✅ Consistent styling across the site
- ✅ Easy dark mode support
- ✅ Easier maintenance and updates
- ✅ Reusable component patterns

## Card Components

### `service-card` - Service/Feature Cards (Light Background)
Use for feature cards, service offerings, and product showcases with light background.

```jsx
<div className="service-card">
  <div className="flex justify-center mb-6">
    <IconComponent />
  </div>
  <h3 className="text-lg font-bold text-primary mb-3">Title</h3>
  <p className="text-secondary">Description text</p>
</div>
```

**Features:**
- Light background in light mode, dark gray in dark mode
- Red top border accent
- Hover shadow effect
- Rounded corners with proper spacing

### `service-card-dark` - Service Cards (Dark Background)
Use for feature cards with dark background emphasis.

```jsx
<div className="service-card-dark">
  {/* Content */}
</div>
```

### `card-base` + `card-light` - Generic Light Cards
Combine for flexible light-colored cards.

```jsx
<div className="card-base card-light p-6">
  {/* Content */}
</div>
```

### `card-base` + `card-dark` - Generic Dark Cards
For dark-themed cards or emphasis.

```jsx
<div className="card-base card-dark p-6">
  {/* Content */}
</div>
```

### `card-accent` - Gradient Accent Cards
For highlighted content or callouts.

```jsx
<div className="card-accent p-6">
  {/* Content */}
</div>
```

### `dashboard-card` - Dashboard/Panel Cards
For admin dashboards and data display.

```jsx
<div className="dashboard-card">
  <h3 className="text-primary font-bold">Card Title</h3>
  <p className="text-secondary">Content</p>
</div>
```

## Text Classes

### Text Color Classes
Use these for consistent text colors that support dark mode:

```jsx
<h1 className="text-primary">Main heading (auto dark mode)</h1>
<p className="text-secondary">Secondary text</p>
<span className="text-muted">Muted/disabled text</span>
<small className="text-light">Light/de-emphasized text</small>
```

**Color Mappings:**
- `text-primary` → Black in light mode, White in dark mode
- `text-secondary` → Dark gray in light mode, Light gray in dark mode
- `text-muted` → Medium gray (consistent both modes)
- `text-light` → Light gray (consistent both modes)

## Section Backgrounds

### `section-light` - Light Background Sections
White background in light mode, dark gray in dark mode.

```jsx
<section className="section-light py-16 px-4">
  {/* Content */}
</section>
```

### `section-dark` - Dark Background Sections
Very light gray in light mode, almost black in dark mode.

```jsx
<section className="section-dark py-16 px-4">
  {/* Content */}
</section>
```

### `section-gradient` - Gradient Background
Subtle gradient that works in both light and dark modes.

```jsx
<section className="section-gradient py-16 px-4">
  {/* Content */}
</section>
```

### `section-accent` - Red/Brand Accent Section
Red-tinted gradient for highlighted sections (hero, CTA).

```jsx
<section className="section-accent py-16 px-4">
  {/* Content */}
</section>
```

## Badge & Pill Components

### `badge-light` - Light Badges
Neutral badges for labels and tags.

```jsx
<span className="badge-light">New Feature</span>
<span className="badge-light">Beta</span>
```

### `badge-accent` - Red Accent Badges
For important or highlighted badges.

```jsx
<span className="badge-accent">Hot Deal</span>
<span className="badge-accent">Recommended</span>
```

### `badge-success` - Green Success Badges
For positive/success states.

```jsx
<span className="badge-success">Active</span>
<span className="badge-success">Complete</span>
```

### Custom Badge
All badges use `badge-base` as foundation:

```jsx
<span className="badge-base bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
  Custom Badge
</span>
```

## Stats & Counters

### `stat-badge-light` - Stat Badge Container
For displaying statistics with large numbers.

```jsx
<div className="stat-badge-light">
  <span className="stat-badge-text">15+</span>
</div>
```

Used in "Why Choose Us" sections with animated counters:

```jsx
<div className="stat-badge-light mx-auto mb-4">
  <span className="stat-badge-text">
    <AnimatedCounter target={15} suffix="+" />
  </span>
</div>
```

## Form Inputs

### `input-light` - Light Input Fields
Standard light-themed input.

```jsx
<input
  type="text"
  className="input-base input-light"
  placeholder="Enter text..."
/>
```

### `input-dark` - Dark Input Fields
Dark-themed input for emphasis.

```jsx
<input
  type="text"
  className="input-base input-dark"
  placeholder="Enter text..."
/>
```

## Complete Example: Homepage Section

### Before (Inline Tailwind)
```jsx
<section className="bg-gradient-to-br from-red-50 to-red-100 py-16 px-4">
  <h2 className="text-3xl font-bold text-black mb-8">Title</h2>
  <div className="grid grid-cols-3 gap-6">
    <div className="bg-white rounded-xl p-6 hover:shadow-xl border-t-4 border-red-700">
      <h3 className="text-lg font-bold text-black mb-2">Service</h3>
      <p className="text-gray-700">Description</p>
    </div>
  </div>
  <div className="flex gap-3">
    <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full">Tag</span>
  </div>
</section>
```

### After (CSS Component Classes)
```jsx
<section className="section-accent py-16 px-4">
  <h2 className="text-3xl font-bold text-primary mb-8">Title</h2>
  <div className="grid grid-cols-3 gap-6">
    <div className="service-card">
      <h3 className="text-lg font-bold text-primary mb-2">Service</h3>
      <p className="text-secondary">Description</p>
    </div>
  </div>
  <div className="flex gap-3">
    <span className="badge-accent">Tag</span>
  </div>
</section>
```

## Best Practices

### ✅ DO:
1. Use semantic class names (`service-card`, `text-primary`, `section-accent`)
2. Combine base classes with modifiers (`card-base card-light`)
3. Use text classes consistently (`text-primary`, `text-secondary`, `text-muted`)
4. Leverage dark mode support automatically
5. Keep inline Tailwind for layout only (`flex`, `grid`, `gap`, `py`, `px`, etc.)

### ❌ DON'T:
1. Don't mix component classes with conflicting colors (`service-card` + `bg-blue-500`)
2. Don't hardcode colors when a text class exists (`text-black` → use `text-primary`)
3. Don't override component classes unless absolutely necessary
4. Don't create new colors instead of using existing ones
5. Don't forget dark mode when adding new styles
6. **Don't use white or off-white backgrounds** (`bg-white`, `bg-gray-50`, etc.) for pages or cards. Use dark cards (`bg-gray-800`, `card-dark`) or colored backgrounds instead for better visual hierarchy and consistency

## Dark Mode

All component classes automatically support dark mode via the `dark:` prefix.

### Automatic Dark Mode
When dark mode is enabled (body has `dark` class), all components automatically switch colors:

```
Light Mode    Dark Mode
─────────────────────────
White bg   →  Dark gray bg
Black text →  White text
Light gray →  Medium gray
```

### Force Dark Mode
To test dark mode in development:

```jsx
// In your layout or component
export default function Layout() {
  return (
    <html className="dark">
      {/* Content automatically uses dark mode */}
    </html>
  )
}
```

## Color Palette

### Primary Brand Colors
- **Red (Accent):** `#dc2626` light, `#ef4444` hover
- **Dark Gray (Cards):** `#1a202c` dark mode

### Text Colors
- **Primary Text:** `#000000` (light), `#ffffff` (dark)
- **Secondary Text:** `#374151` (light), `#d1d5db` (dark)
- **Muted Text:** `#4b5563` (consistent)

### Background Colors
- **Light Section:** `#ffffff` (light), `#1f2937` (dark)
- **Dark Section:** `#f3f4f6` (light), `#0f172a` (dark)

## Maintenance

When you need to update styling globally:

1. **Edit `app/globals.css`** to change component classes
2. **No component files need updates** (changes apply everywhere)
3. **Dark mode updates automatically** with `dark:` variants
4. **Deploy with confidence** knowing styling is consistent

Example: To change all service card border color:
```css
/* Before */
.service-card {
  border-t-4 border-red-700;
}

/* After */
.service-card {
  border-t-4 border-blue-600 dark:border-blue-400;
}
```

## Mobile Responsiveness

All components must be mobile-ready. See [MOBILE.md](MOBILE.md) for:
- Responsive breakpoints (mobile, tablet, desktop)
- Mobile-first design patterns
- Touch target requirements (≥44px)
- Testing checklist

**Always use responsive classes:**
```tsx
// DO: Scale by screen size
className="p-4 md:p-6 lg:p-8 text-sm md:text-base lg:text-lg"

// DON'T: Fixed sizes
className="p-8 text-lg"
```

## Files Modified

- `app/globals.css` - Component class definitions
- `app/page.tsx` - Updated to use component classes

## Next Steps

Apply these component classes to other pages:
- `/dashboard` pages
- `/contractor` pages
- `/admin` pages
- Any other components using inline Tailwind for styling

See the main page (`app/page.tsx`) for implementation examples.
