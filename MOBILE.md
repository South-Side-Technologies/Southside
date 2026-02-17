# Mobile Responsiveness Guide

Mobile-first approach for Southside Tech. Ensure all pages are optimized for screens 320px and above.

## Breakpoints
- **Mobile**: 0px - 639px (default)
- **Tablet**: 640px - 1023px (`md:`)
- **Desktop**: 1024px+ (`lg:`)

## Responsive Classes to Always Use

### Padding & Margins
```tsx
// DO: Scale padding by screen size
className="p-4 md:p-6 lg:p-8"

// DON'T: Fixed large padding
className="p-8"
```

### Typography
```tsx
// DO: Scale text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>

// DON'T: Large heading on mobile
<h1 className="text-4xl">Title</h1>
```

### Grid/Layout
```tsx
// DO: 1 column on mobile, scale up
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// DON'T: Multi-column on mobile
className="grid grid-cols-3 gap-6"
```

### Sidebar Navigation
```tsx
// DO: Hide sidebar on mobile, show on desktop
className="hidden lg:block"

// DON'T: Always visible (blocks content)
className="w-64 block"
```

### Buttons & CTAs
```tsx
// DO: Full width on mobile
className="w-full md:w-auto"

// DON'T: Fixed width
className="w-56"
```

## Common Issues & Fixes

### 1. Fixed Padding Too Large
**Issue**: `p-8` (2rem = 32px) on mobile makes content cramped
**Fix**: Use `p-4 md:p-6 lg:p-8`

### 2. Large Text on Mobile
**Issue**: `text-4xl` (2.25rem) too large on small screens
**Fix**: Use `text-2xl md:text-3xl lg:text-4xl`

### 3. Hardcoded Fixed Widths
**Issue**: `w-64`, `max-w-2xl` don't account for mobile
**Fix**: Use `mx-auto px-4` with max-width utilities

### 4. Overflow & Wrapping
**Issue**: Text/buttons overflow on narrow screens
**Fix**: Add `flex-col` for mobile, `flex-row` for desktop

### 5. Sidebar Hiding
**Issue**: Desktop sidebars push content off mobile
**Fix**: Always use `hidden lg:block` for sidebars

## Recommended Mobile Patterns

### Full-Width Container
```tsx
<div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
  {/* Content automatically responsive */}
</div>
```

### Responsive Header
```tsx
<header className="px-4 md:px-6 py-4 md:py-6">
  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
    {/* Content */}
  </div>
</header>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Items automatically scale */}
</div>
```

### Touch-Friendly Buttons
```tsx
<button className="px-4 py-2 md:px-6 md:py-3 min-h-[44px] md:min-h-[48px]">
  {/* Minimum touch target: 44x44px on mobile */}
</button>
```

## Mobile Testing Checklist

- [ ] Test on 320px width (iPhone SE)
- [ ] Test on 375px width (iPhone)
- [ ] Test on 768px width (iPad)
- [ ] Verify touch targets are ≥44x44px
- [ ] Check text is readable without zoom
- [ ] Ensure buttons/links are easily tappable
- [ ] No horizontal scrolling
- [ ] Images are responsive (max-w-full)
- [ ] Forms are touch-friendly (large inputs)
- [ ] Navigation is accessible on mobile

## Pages Requiring Mobile Updates

### High Priority (Critical Issues)
- [ ] `/contractor/page.tsx` - Large padding/text on mobile
- [ ] `/admin/*` - Tables need horizontal scroll on mobile
- [ ] Dashboard pages - Sidebar layout issues

### Medium Priority
- [ ] Home page - Verify all sections responsive
- [ ] Forms - Ensure mobile-friendly input sizes
- [ ] Modals - Check positioning on small screens

### Low Priority
- [ ] Performance optimization
- [ ] Touch gesture improvements
- [ ] Animation adjustments for mobile

## Implementation Notes

1. **Mobile First**: Style for mobile first, then enhance with `md:` and `lg:` classes
2. **Test Regularly**: Check responsive design before committing
3. **Use DevTools**: Chrome DevTools device emulation or actual devices
4. **Avoid Fixed Widths**: Use percentages and max-width instead
5. **Touch-Friendly**: Ensure 44px minimum touch targets

## References

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/mobile/)

Last Updated: 2026-02-17
