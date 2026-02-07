# CampusRide Design System - Quick Reference

## Colors

### Primary Palette
```
Sky Blue:   #0EA5E9  - Primary brand, CTAs
Teal:       #14B8A6  - Secondary, accents
Orange:     #F97316  - Admin highlights, urgency
```

### Neutrals
```
Slate 900:  #0F172A  - Headings, footer
Slate 700:  #334155  - Body text
Slate 500:  #64748B  - Secondary text
Slate 100:  #F1F5F9  - Light backgrounds
White:      #FFFFFF  - Cards, pure backgrounds
```

### Gradients
```css
Primary: linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)
Hero BG: linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)
```

---

## Typography

### Font Stack
```
Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

### Scale (Desktop / Mobile)
```
H1:    64px (4rem) / 40px (2.5rem)  | 900 weight
H2:    44px (2.75rem) / 32px (2rem) | 800 weight
H5:    24px (1.5rem) / 20px         | 400 weight
H6:    18px / 16px                  | 600 weight
Body:  16px / 16px                  | 400 weight
Small: 14px / 14px                  | 400 weight
```

### Line Heights
```
Headings: 1.2
Body:     1.6-1.8
```

---

## Spacing (8px Grid)

```
4px   - Micro
8px   - Tight
16px  - Standard
24px  - Medium
32px  - Large
48px  - XL
64px  - 2XL
96px  - 3XL
```

---

## Border Radius

```
Small:    8px   - Buttons, chips
Medium:   12px  - Small cards, icons
Large:    16px  - Feature boxes
XL:       18px  - Icon containers
2XL:      20px  - Major cards
3XL:      24px  - Hero elements
Circle:   50%   - Avatars, decorative
```

---

## Shadows

### Button Shadows
```css
Default: 0 8px 24px rgba(14, 165, 233, 0.35)
Hover:   0 12px 32px rgba(14, 165, 233, 0.45)
```

### Card Shadows
```css
Default: none
Hover:   0 20px 40px rgba(14, 165, 233, 0.2)  /* Adjust color per card */
```

### Elevation Scale
```css
Level 1: 0 2px 8px rgba(0, 0, 0, 0.08)
Level 2: 0 4px 16px rgba(0, 0, 0, 0.10)
Level 3: 0 8px 24px rgba(0, 0, 0, 0.12)
Level 4: 0 16px 48px rgba(0, 0, 0, 0.15)
```

---

## Components

### Primary Button
```jsx
<Button
  sx={{
    background: 'linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)',
    color: 'white',
    px: 4,
    py: 1.5,
    fontWeight: 600,
    boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)',
    '&:hover': {
      background: 'linear-gradient(135deg, #0284C7 0%, #0F766E 100%)',
      boxShadow: '0 12px 32px rgba(14, 165, 233, 0.45)',
      transform: 'translateY(-2px)',
    },
    transition: 'all 0.3s ease',
  }}
>
  Button Text
</Button>
```

### Secondary Button
```jsx
<Button
  sx={{
    borderColor: '#0EA5E9',
    color: '#0EA5E9',
    px: 4,
    py: 1.5,
    fontWeight: 600,
    borderWidth: 2,
    '&:hover': {
      borderColor: '#0284C7',
      bgcolor: 'rgba(14, 165, 233, 0.08)',
      borderWidth: 2,
    },
  }}
>
  Button Text
</Button>
```

### Feature Card
```jsx
<Card
  sx={{
    borderRadius: '20px',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#0EA5E9',
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(14, 165, 233, 0.2)',
    },
  }}
>
  {/* Content */}
</Card>
```

### Icon Box
```jsx
<Box
  sx={{
    width: 72,
    height: 72,
    borderRadius: '18px',
    background: 'linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <Icon sx={{ fontSize: 40, color: 'white' }} />
</Box>
```

### Chip/Badge
```jsx
<Chip
  label="Text"
  sx={{
    bgcolor: 'rgba(14, 165, 233, 0.1)',
    color: '#0EA5E9',
    fontWeight: 600,
    borderRadius: '8px',
  }}
/>
```

---

## Animations

### fadeInUp
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Usage */
animation: fadeInUp 0.8s ease-out;
/* With delay */
animation: fadeInUp 0.8s ease-out 0.2s backwards;
```

### float
```css
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Usage */
animation: float 6s ease-in-out infinite;
```

### Hover Transitions
```css
transition: all 0.3s ease;
```

---

## Responsive Breakpoints

```
xs: 0-599px      (Mobile)
sm: 600-959px    (Large phones, small tablets)
md: 960-1279px   (Tablets)
lg: 1280-1919px  (Laptops)
xl: 1920px+      (Large desktops)
```

### Usage in MUI
```jsx
sx={{
  fontSize: { xs: '2rem', md: '3rem' },
  padding: { xs: 2, sm: 4, md: 6 },
}}
```

---

## Grid System

### Container
```jsx
<Container maxWidth="lg">
  {/* Max width: 1280px */}
</Container>
```

### Grid Layout
```jsx
<Grid container spacing={4}>
  <Grid item xs={12} sm={6} md={4}>
    {/* 12 cols mobile, 6 tablet, 4 desktop */}
  </Grid>
</Grid>
```

---

## Icon Sizes

```
Small:   20px
Medium:  28px
Large:   40px
XL:      48px
Hero:    200-280px
```

---

## Accessibility

### Contrast Ratios
```
Minimum (WCAG AA):    4.5:1 for text
Enhanced (WCAG AAA):  7:1 for text
Large Text:           3:1 minimum
```

### Focus States
```css
outline: 2px solid #0EA5E9;
outline-offset: 2px;
```

---

## Common Patterns

### Section Wrapper
```jsx
<Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FFFFFF' }}>
  <Container maxWidth="lg">
    {/* Section content */}
  </Container>
</Box>
```

### Centered Section Header
```jsx
<Box textAlign="center" mb={8}>
  <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, color: '#0F172A' }}>
    Section Title
  </Typography>
  <Typography variant="h6" color="text.secondary">
    Section subtitle or description
  </Typography>
</Box>
```

### Gradient Text
```jsx
<Typography
  sx={{
    background: 'linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }}
>
  Gradient Text
</Typography>
```

---

## User Type Colors

```
Students: Blue   (#0EA5E9)
Drivers:  Teal   (#14B8A6)
Admins:   Orange (#F97316)
```

Use these colors for role-specific highlights, icons, and sections.

---

## Do's and Don'ts

### ✅ Do
- Use 8px spacing increments
- Apply hover effects to interactive elements
- Maintain consistent border radius
- Use gradient for primary brand elements
- Ensure 4.5:1 contrast minimum
- Test on mobile first
- Use semantic HTML

### ❌ Don't
- Mix spacing systems
- Use purple/indigo (per brand guidelines)
- Create new gradients without approval
- Use small font sizes (< 14px for body)
- Neglect hover states
- Forget focus indicators
- Stack too many animations

---

## Quick Copy-Paste Snippets

### Decorative Gradient Circle
```jsx
<Box
  sx={{
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)',
    animation: 'float 6s ease-in-out infinite',
  }}
/>
```

### Glassmorphism Effect
```jsx
<Box
  sx={{
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  }}
>
  {/* Content */}
</Box>
```

### Feature List Item
```jsx
<Box display="flex" alignItems="center" gap={1}>
  <CheckCircle sx={{ fontSize: 20, color: '#10B981' }} />
  <Typography variant="body2" color="text.secondary">
    Feature text
  </Typography>
</Box>
```

---

## File Locations

```
Main Component:  /frontend/src/pages/LandingPage/LandingPage.jsx
Global Styles:   /frontend/src/index.css
Theme Config:    Material-UI default theme (customizable in App.jsx)
```

---

## Resources

- [Material-UI Documentation](https://mui.com/)
- [Inter Font](https://fonts.google.com/specimen/Inter)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Responsive Design Checker](https://responsivedesignchecker.com/)

---

*Last Updated: 2026 - Landing Page Redesign*
