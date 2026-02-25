# Authentication Pages - Quick Reference Guide

## Brand Colors (Same as Landing Page)

```
Primary Blue:   #0EA5E9
Teal:          #14B8A6
Slate 900:     #0F172A  (Headings)
Slate 700:     #334155  (Not used, but available)
Slate 600:     #64748B  (Body text, captions)
Success Green: #10B981  (Password indicators)
Light Slate:   #CBD5E1  (Unmet requirements)
Gray Disabled: #94A3B8  (Disabled button)
```

### Gradients
```css
Primary Button: linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)
Page Background: linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)
Hover Button: linear-gradient(135deg, #0284C7 0%, #0F766E 100%)
```

---

## Common Component Styles

### Text Field (Copy-Paste Ready)
```jsx
<TextField
  sx={{
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&:hover fieldset': {
        borderColor: '#0EA5E9',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#0EA5E9',
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#0EA5E9',
    },
  }}
/>
```

### Gradient Button (Copy-Paste Ready)
```jsx
<Button
  sx={{
    py: 1.5,
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)',
    boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)',
    textTransform: 'none',
    '&:hover': {
      background: 'linear-gradient(135deg, #0284C7 0%, #0F766E 100%)',
      boxShadow: '0 12px 32px rgba(14, 165, 233, 0.45)',
      transform: 'translateY(-2px)',
    },
    '&:disabled': {
      background: 'linear-gradient(135deg, #94A3B8 0%, #94A3B8 100%)',
      color: 'white',
    },
    transition: 'all 0.3s ease',
  }}
>
  Button Text
</Button>
```

### Brand Logo (Copy-Paste Ready)
```jsx
<Typography
  variant="h4"
  sx={{
    fontWeight: 800,
    background: 'linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  }}
>
  CampusRide
</Typography>
```

### Icon Box (Copy-Paste Ready)
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
    mb: 2,
    boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
  }}
>
  <YourIcon sx={{ fontSize: 36, color: 'white' }} />
</Box>
```

### Card Container (Copy-Paste Ready)
```jsx
<Card
  sx={{
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    animation: 'fadeInUp 0.6s ease-out',
  }}
>
  <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
    {/* Content */}
  </CardContent>
</Card>
```

### Decorative Circle (Copy-Paste Ready)
```jsx
<Box
  sx={{
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
    animation: 'float 6s ease-in-out infinite',
  }}
/>
```

### Brand Link (Copy-Paste Ready)
```jsx
<Link
  href="/path"
  sx={{
    color: '#0EA5E9',
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  }}
>
  Link Text
</Link>
```

### Back Button (Copy-Paste Ready)
```jsx
<IconButton
  onClick={() => navigate('/')}
  sx={{
    color: '#0EA5E9',
    '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.08)' },
  }}
>
  <ArrowBack />
</IconButton>
```

---

## Layout Wrappers

### Page Container
```jsx
<Box
  sx={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)',
    py: 4,  // Add py: 4 for pages with lots of content
  }}
>
  {/* Decorative circles */}
  {/* Container */}
</Box>
```

### Content Container
```jsx
<Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
  {/* Use "xs" for login, "sm" for registration */}
</Container>
```

---

## Typography Scale

```jsx
// Page Title
<Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A' }}>

// Subtitle
<Typography variant="body2" sx={{ color: '#64748B' }}>

// Body Text
<Typography variant="body2" sx={{ color: '#64748B' }}>

// Caption/Small Text
<Typography variant="caption" sx={{ color: '#64748B' }}>

// Link in Text
Don't have an account?{' '}
<Link sx={{ color: '#0EA5E9', fontWeight: 600 }}>Sign Up</Link>
```

---

## Spacing Values

```
Icon box margin-bottom: 2 units (16px)
Section margin-bottom: 3 units (24px)
Section margin-bottom (large): 4 units (32px)
Button vertical padding: 1.5 units (12px)
Card padding mobile: 3 units (24px)
Card padding desktop: 5 units (40px)
```

---

## Border Radius Values

```
Text Fields: 12px
Buttons: 12px
Alert: 12px
Card: 20px
Icon Box: 18px
Circles: 50% (full round)
Progress Bar: 4px
```

---

## Shadow Values

```css
Card: 0 20px 60px rgba(0, 0, 0, 0.08)
Icon Box: 0 8px 24px rgba(14, 165, 233, 0.3)
Button Default: 0 8px 24px rgba(14, 165, 233, 0.35)
Button Hover: 0 12px 32px rgba(14, 165, 233, 0.45)
```

---

## Password Strength Colors

```
Weak:   #EF4444 (Red)
Medium: #F59E0B (Orange)
Strong: #22C55E (Green)
```

### Password Indicator Icons
```
Met: CheckCircleIcon - #10B981 (Green)
Not Met: CancelIcon - #CBD5E1 (Light Slate)
Match: CheckCircleIcon - #10B981 (Green)
```

---

## Animations (CSS)

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
/* Usage: animation: 'fadeInUp 0.6s ease-out' */
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
/* Usage: animation: 'float 6s ease-in-out infinite' */
```

---

## Icon Sizes

```
Small Icons (checkmarks): 16px
Medium Icons (visibility toggle): 24px (default)
Large Icons (main icon in box): 36px
```

---

## Responsive Breakpoints

```jsx
// Card padding
p: { xs: 3, sm: 5 }

// Container max width
maxWidth="xs"  // Login (444px)
maxWidth="sm"  // Register (600px)
```

---

## Form Validation States

### Error State
```jsx
error={touched.fieldName && !!fieldErrors.fieldName}
helperText={touched.fieldName && fieldErrors.fieldName}
```

### Success Indicator
```jsx
{condition && (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 500 }}>
      Success message
    </Typography>
  </Box>
)}
```

---

## Loading States

### Button with Spinner
```jsx
<Button disabled={loading}>
  {loading ? (
    <CircularProgress size={24} sx={{ color: 'white' }} />
  ) : (
    'Button Text'
  )}
</Button>
```

---

## Alert Styling

```jsx
<Alert
  severity="error"
  sx={{
    mb: 3,
    borderRadius: '12px',
  }}
  role="alert"
  aria-live="assertive"
>
  {error}
</Alert>
```

---

## Password Field Pattern

```jsx
<TextField
  type={showPassword ? "text" : "password"}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={() => setShowPassword(!showPassword)}
          sx={{ color: '#64748B' }}
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      </InputAdornment>
    ),
  }}
  sx={{/* TextField styling here */}}
/>
```

---

## Select/Dropdown Pattern

```jsx
<FormControl
  fullWidth
  margin="normal"
  sx={{
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&:hover fieldset': { borderColor: '#0EA5E9' },
      '&.Mui-focused fieldset': {
        borderColor: '#0EA5E9',
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#0EA5E9' },
  }}
>
  <InputLabel>Label</InputLabel>
  <Select value={value} onChange={handleChange} label="Label">
    <MenuItem value="option1">Option 1</MenuItem>
  </Select>
</FormControl>
```

---

## Conditional Rendering Pattern

```jsx
{formData.role === 'student' && (
  <TextField
    {/* field props */}
    sx={{/* TextField styling */}}
  />
)}
```

---

## Common Patterns

### Two-Color Text
```jsx
<Typography variant="body2" sx={{ color: '#64748B' }}>
  Normal text{' '}
  <Link sx={{ color: '#0EA5E9', fontWeight: 600 }}>
    Highlighted link
  </Link>
</Typography>
```

### Centered Section
```jsx
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mb: 4,
  }}
>
  {/* Icon box */}
  {/* Title */}
  {/* Subtitle */}
</Box>
```

---

## File Locations

```
LoginPage:     /frontend/src/pages/LoginPage/LoginPage.jsx
RegisterPage:  /frontend/src/pages/RegisterPage/RegisterPage.jsx
```

---

## Imports Needed

```jsx
import {
  Box, Container, Card, CardContent, Typography, TextField,
  Button, Link, Alert, CircularProgress, IconButton,
  FormControl, InputLabel, Select, MenuItem,
  LinearProgress, InputAdornment
} from '@mui/material';

import {
  ArrowBack, Login, PersonAdd,
  Visibility, VisibilityOff,
  CheckCircle, Cancel
} from '@mui/icons-material';
```

---

## Quick Checks

### Does my component match the brand?
- [ ] Uses brand gradient for buttons
- [ ] Text fields have 12px border radius
- [ ] Focus states use #0EA5E9
- [ ] Card has 20px border radius
- [ ] Page has gradient background
- [ ] Icons use brand colors
- [ ] Links are #0EA5E9 with 600 weight
- [ ] Shadows use brand blue tint

### Accessibility checklist
- [ ] All inputs have labels
- [ ] Error alerts have role="alert"
- [ ] IconButtons have aria-label
- [ ] Color contrast is sufficient
- [ ] Tab order is logical
- [ ] Focus states are visible

---

## Common Mistakes to Avoid

❌ **Don't**:
- Use default MUI primary color
- Forget border radius on inputs
- Use different gradient values
- Skip hover effects on buttons
- Use different font weights
- Forget responsive padding

✅ **Do**:
- Use brand gradient for all CTAs
- Apply 12px border radius consistently
- Include hover effects with lift
- Match font weights to landing page
- Test on mobile devices
- Maintain 8px spacing grid

---

## Quick Color Reference

```
Focus/Hover:   #0EA5E9
Success:       #10B981
Weak:          #EF4444
Medium:        #F59E0B
Text:          #64748B
Headings:      #0F172A
Disabled:      #94A3B8
Light Border:  #CBD5E1
```

---

*Last Updated: 2026 - Auth Pages Redesign*
