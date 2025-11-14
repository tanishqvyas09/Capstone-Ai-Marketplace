# 🎨 Market Muse AI - Design System

## Overview
A premium, modern design system inspired by Supabase and Clerk, featuring a sophisticated gradient theme perfect for AI/ML products.

---

## 🎨 Color Palette

### Primary Gradient
```css
Linear Gradient: #FE7710 → #B47FFF → #8B5CF6
- Primary Orange: #FE7710
- Mid Purple: #B47FFF  
- Deep Purple: #8B5CF6
```

### Background
```css
- Base: #030216 (Deep Navy)
- Cards: rgba(15, 10, 30, 0.5)
- Overlays: rgba(15, 10, 30, 0.95)
```

### Text Colors
```css
- Primary: #F3F4F6 (Near White)
- Secondary: #E5E7EB (Light Gray)
- Muted: #9CA3AF (Medium Gray)
- Subtle: #6B7280 (Dark Gray)
```

### Status Colors
```css
- Success: #10B981 (Emerald Green)
- Success Background: rgba(16, 185, 129, 0.1)
- Success Border: rgba(16, 185, 129, 0.2)
```

---

## 📐 Spacing System

```css
- Extra Small: 0.375rem (6px)
- Small: 0.5rem (8px)
- Medium: 0.75rem (12px)
- Large: 1rem (16px)
- Extra Large: 1.5rem (24px)
- XXL: 2rem (32px)
```

---

## 🔤 Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif
```

### Font Sizes
```css
- XXS: 0.688rem (11px)
- XS: 0.75rem (12px)
- SM: 0.813rem (13px)
- Base: 0.875rem (14px)
- MD: 0.938rem (15px)
- LG: 1.125rem (18px)
- XL: 1.25rem (20px)
- XXL: 1.375rem (22px)
- 3XL: 1.875rem (30px)
- 4XL: 2rem (32px)
```

### Font Weights
```css
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
```

### Letter Spacing
```css
- Tight: -0.02em (for headings)
- Normal: -0.01em (for subheadings)
- Wide: 0.01em (for badges)
```

---

## 🎭 Component Styles

### Cards
```css
background: rgba(15, 10, 30, 0.5)
border: 1px solid rgba(254, 119, 16, 0.1)
border-radius: 12px
backdrop-filter: blur(20px) saturate(180%)
```

### Buttons
```css
Primary:
  background: linear-gradient(135deg, #FE7710 0%, #B47FFF 100%)
  border-radius: 8px
  box-shadow: 0 2px 8px rgba(254, 119, 16, 0.3)
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)

Hover:
  transform: translateY(-1px)
  box-shadow: 0 4px 16px rgba(254, 119, 16, 0.4)
```

### Borders
```css
Default: 1px solid rgba(254, 119, 16, 0.1)
Hover: 1px solid rgba(254, 119, 16, 0.3)
Accent: 1px solid rgba(254, 119, 16, 0.2)
```

### Border Radius
```css
- Small: 6px (badges)
- Medium: 8px (buttons)
- Large: 10px (inputs)
- XL: 12px (cards)
- XXL: 16px (modals)
- Round: 50% (avatars)
```

### Shadows
```css
- Small: 0 1px 3px rgba(0, 0, 0, 0.1)
- Medium: 0 4px 12px rgba(254, 119, 16, 0.3)
- Large: 0 8px 24px rgba(0, 0, 0, 0.4)
- XL: 0 20px 60px rgba(0, 0, 0, 0.5)
```

---

## ✨ Special Effects

### Glass Morphism
```css
backdrop-filter: blur(20px) saturate(180%)
background: rgba(15, 10, 30, 0.5)
border: 1px solid rgba(254, 119, 16, 0.1)
```

### Gradient Borders (Hover Effect)
```css
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(254, 119, 16, 0.5), 
    transparent
  );
}
```

### Shimmer Effect
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.card::after {
  background: linear-gradient(90deg, 
    transparent, 
    rgba(254, 119, 16, 0.05), 
    transparent
  );
}
```

---

## 🎯 Animation System

### Timing Functions
```css
- Ease: cubic-bezier(0.4, 0, 0.2, 1)
- Bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Durations
```css
- Fast: 0.15s
- Normal: 0.2s
- Slow: 0.3s
- Very Slow: 0.5s
```

### Keyframes
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

---

## 📱 Responsive Breakpoints

```css
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Wide: > 1600px
```

---

## 🎨 Usage Examples

### Agent Card
```jsx
<div style={{
  background: 'rgba(15, 10, 30, 0.5)',
  borderRadius: '12px',
  padding: '1.5rem',
  border: '1px solid rgba(254, 119, 16, 0.1)',
  backdropFilter: 'blur(20px) saturate(180%)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer'
}}>
  {/* Card Content */}
</div>
```

### Gradient Text
```jsx
<h1 style={{
  background: 'linear-gradient(135deg, #FE7710 0%, #B47FFF 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontSize: '1.875rem',
  fontWeight: '700',
  letterSpacing: '-0.02em'
}}>
  Market Muse AI
</h1>
```

### Status Badge
```jsx
<span style={{
  padding: '0.25rem 0.625rem',
  borderRadius: '6px',
  fontSize: '0.688rem',
  fontWeight: '600',
  background: 'rgba(16, 185, 129, 0.1)',
  color: '#10B981',
  border: '1px solid rgba(16, 185, 129, 0.2)'
}}>
  ● Active
</span>
```

---

## 🎯 Design Principles

1. **Subtlety First**: Use gradients sparingly, prefer subtle borders and backgrounds
2. **Glassmorphism**: Heavy use of backdrop-filter for modern, layered UI
3. **Smooth Transitions**: All interactive elements use 0.2s cubic-bezier easing
4. **Consistent Spacing**: Stick to the 4px/8px grid system
5. **Accessibility**: Maintain WCAG AA contrast ratios (4.5:1 for text)
6. **Performance**: Use transform for animations, avoid layout shifts

---

## 🚀 Implementation Notes

- Always use `backdrop-filter: blur(20px) saturate(180%)` for glass cards
- Gradient direction is always `135deg` for consistency
- Hover states use `translateY(-1px)` or `translateY(-2px)` for subtle lift
- Border colors opacity: 0.1 (default), 0.2 (hover), 0.3 (active)
- Letter spacing: Tighter for larger text, normal for body text

---

## 📦 Ready-to-Use Components

Copy these inline styles for new pages:

### Container
```javascript
container: {
  minHeight: '100vh',
  background: '#030216',
  position: 'relative',
  color: '#fff'
}
```

### Background Overlay
```javascript
backgroundOverlay: {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'radial-gradient(circle at 20% 20%, rgba(254, 119, 16, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
  pointerEvents: 'none',
  zIndex: 0
}
```

### Card
```javascript
card: {
  background: 'rgba(15, 10, 30, 0.5)',
  borderRadius: '12px',
  padding: '1.5rem',
  border: '1px solid rgba(254, 119, 16, 0.1)',
  backdropFilter: 'blur(20px) saturate(180%)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
}
```

### Primary Button
```javascript
button: {
  padding: '0.688rem 1.25rem',
  background: 'linear-gradient(135deg, #FE7710 0%, #B47FFF 100%)',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 2px 8px rgba(254, 119, 16, 0.3)',
  fontSize: '0.875rem'
}
```

---

**Last Updated**: November 14, 2025  
**Version**: 1.0.0  
**Designer**: AI Design System  
**Theme**: Supabase/Clerk Inspired - AI/ML Focus
