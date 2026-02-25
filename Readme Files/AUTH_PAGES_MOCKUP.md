# Authentication Pages Visual Mockup Guide

## Overview
Visual descriptions of the redesigned login and registration pages, showing exact layout, spacing, colors, and interactive states.

---

## LOGIN PAGE - Desktop (1920x1080)

### Full Page Layout
```
┌────────────────────────────────────────────────────────────┐
│                   • Gradient Background •                   │
│                  (Light Blue to White)                      │
│                                                             │
│    ◯ Floating                                               │
│   Circle                                                    │
│  (Top Right)                                                │
│                                                             │
│  ← [Back Button]                                            │
│                                                             │
│                  CampusRide                                 │
│                (Gradient Text)                              │
│                                                             │
│  ┌──────────────────────────────────────────────┐         │
│  │                                               │         │
│  │         ╔═══════════════╗                    │         │
│  │         ║   [🔐 Icon]   ║                    │         │
│  │         ╚═══════════════╝                    │         │
│  │        (Gradient Box)                         │         │
│  │                                               │         │
│  │         Welcome Back                          │         │
│  │   Sign in to access your campus              │         │
│  │        transportation                         │         │
│  │                                               │         │
│  │  ┌─────────────────────────────────────┐    │         │
│  │  │ Email Address                       │    │         │
│  │  └─────────────────────────────────────┘    │         │
│  │                                               │         │
│  │  ┌─────────────────────────────────────┐    │         │
│  │  │ Password                            │    │         │
│  │  └─────────────────────────────────────┘    │         │
│  │                                               │         │
│  │  ┌─────────────────────────────────────┐    │         │
│  │  │        Sign In                      │    │         │
│  │  │    (Gradient Button)                │    │         │
│  │  └─────────────────────────────────────┘    │         │
│  │                                               │         │
│  │  Don't have an account? Sign Up               │         │
│  │                         (Blue Link)           │         │
│  │                                               │         │
│  └──────────────────────────────────────────────┘         │
│                                                             │
│     By signing in, you agree to our Terms...               │
│                   (Small text)                             │
│                                                             │
│                                              ◯ Floating    │
│                                             Circle          │
│                                            (Bottom Left)    │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Detailed Component Breakdown

#### Back Button (Top Left)
```
┌──┐
│ ← │  Color: #0EA5E9
└──┘  Hover: Light blue background (8% opacity)
      Size: 48x48px (touch-friendly)
```

#### Brand Logo (Centered Above Card)
```
CampusRide
───────────
Font: Inter, 800 weight
Size: 34px (h4)
Color: Gradient (Blue → Teal)
Letter-spacing: -0.5px
```

#### Main Card
```
┌────────────────────────────────┐
│  Width: 444px (maxWidth="xs")  │
│  Border Radius: 20px            │
│  Shadow: Soft, large (60px)     │
│  Background: White + blur       │
│  Border: 1px white (80%)        │
│  Padding: 40px (desktop)        │
│  Animation: fadeInUp (0.6s)     │
└────────────────────────────────┘
```

#### Icon Box
```
╔═════════════╗
║             ║  Size: 72x72px
║   [Icon]    ║  Border Radius: 18px
║   36px      ║  Background: Gradient
║             ║  Shadow: Brand blue (30%)
╚═════════════╝  Icon: White, 36px
```

#### Title Section
```
      Welcome Back          ← h5, 700 weight, #0F172A
Sign in to access your      ← body2, #64748B
  campus transportation
```

#### Text Input Fields
```
┌────────────────────────────────┐
│ Email Address                  │  ← Label, 16px
│ user@example.com               │  ← Input text
└────────────────────────────────┘
│ Border Radius: 12px
│ Height: 56px
│ Border: 1px gray (default)
│ Border (hover): 1px #0EA5E9
│ Border (focus): 2px #0EA5E9
│ Label (focus): #0EA5E9
```

#### Submit Button
```
┌────────────────────────────────┐
│          Sign In               │
└────────────────────────────────┘
│ Height: 48px (py: 1.5)
│ Border Radius: 12px
│ Background: Gradient (Blue → Teal)
│ Shadow: Brand blue (35%)
│ Font: 600 weight, 16px
│ Text Transform: none
│
│ [HOVER STATE]
│ Background: Darker gradient
│ Shadow: Larger (45%)
│ Transform: translateY(-2px) ↑
│ Transition: 0.3s ease
```

#### Footer Link
```
Don't have an account? Sign Up
────────────────────   ───────
Gray (#64748B)        Blue (#0EA5E9)
                      600 weight
                      No underline default
                      Underline on hover
```

#### Legal Text
```
By signing in, you agree to our Terms...
─────────────────────────────────────────
Caption size, #64748B
Centered below card
```

---

## LOGIN PAGE - Mobile (375x667)

```
┌───────────────────────┐
│  • Gradient BG •      │
│                       │
│ ← [Back]              │
│                       │
│    CampusRide         │
│   (Gradient)          │
│                       │
│ ┌───────────────────┐ │
│ │                   │ │
│ │   ╔═════════╗     │ │
│ │   ║  [Icon] ║     │ │
│ │   ╚═════════╝     │ │
│ │                   │ │
│ │  Welcome Back     │ │
│ │ Sign in to...     │ │
│ │                   │ │
│ │ ┌───────────────┐ │ │
│ │ │ Email         │ │ │
│ │ └───────────────┘ │ │
│ │                   │ │
│ │ ┌───────────────┐ │ │
│ │ │ Password      │ │ │
│ │ └───────────────┘ │ │
│ │                   │ │
│ │ ┌───────────────┐ │ │
│ │ │   Sign In     │ │ │
│ │ └───────────────┘ │ │
│ │                   │ │
│ │ Don't have an     │ │
│ │ account? Sign Up  │ │
│ │                   │ │
│ └───────────────────┘ │
│                       │
│ By signing in...      │
│                       │
└───────────────────────┘
```

**Changes from Desktop**:
- Card width: Full width minus margins
- Padding: 24px (instead of 40px)
- Text sizes: Slightly reduced
- Decorative circles: Still present but partially off-screen
- All elements stack vertically

---

## REGISTRATION PAGE - Desktop (1920x1080)

### Full Page Layout
```
┌────────────────────────────────────────────────────────────┐
│                   • Gradient Background •                   │
│                  (Light Blue to White)                      │
│                                                             │
│  ← [Back Button]                                            │
│                                                             │
│                  CampusRide                                 │
│                (Gradient Text)                              │
│                                                             │
│  ┌──────────────────────────────────────────────┐         │
│  │                                               │         │
│  │         ╔═══════════════╗                    │         │
│  │         ║ [👤 Icon]     ║                    │         │
│  │         ╚═══════════════╝                    │         │
│  │                                               │         │
│  │     Create Your Account                       │         │
│  │ Join CampusRide for seamless campus          │         │
│  │        transportation                         │         │
│  │                                               │         │
│  │  ┌─────────────────────────────────────┐    │         │
│  │  │ Full Name                           │    │         │
│  │  └─────────────────────────────────────┘    │         │
│  │                                               │         │
│  │  ┌─────────────────────────────────────┐    │         │
│  │  │ Email Address                       │    │         │
│  │  └─────────────────────────────────────┘    │         │
│  │                                               │         │
│  │  ┌─────────────────────────────────────┐    │         │
│  │  │ Password                        [👁]│    │         │
│  │  └─────────────────────────────────────┘    │         │
│  │                                               │         │
│  │  ▓▓▓▓▓▓░░░░░░░░░ Strong                     │         │
│  │  ✓ At least 6 characters                    │         │
│  │  ✓ 8+ characters (recommended)              │         │
│  │  ✓ One uppercase letter                     │         │
│  │  ✓ One number                               │         │
│  │                                               │         │
│  │  ┌─────────────────────────────────────┐    │         │
│  │  │ Confirm Password                [👁]│    │         │
│  │  └─────────────────────────────────────┘    │         │
│  │  ✓ Passwords match                          │         │
│  │                                               │         │
│  │  ┌─────────────────────────────────────┐    │         │
│  │  │ Phone Number                        │    │         │
│  │  └─────────────────────────────────────┘    │         │
│  │                                               │         │
│  │  ┌─────────────────────────────────────┐    │         │
│  │  │ Role                            [▼] │    │         │
│  │  └─────────────────────────────────────┘    │         │
│  │                                               │         │
│  │  [If Student selected]                       │         │
│  │  ┌─────────────────────────────────────┐    │         │
│  │  │ Student ID                          │    │         │
│  │  │ e.g., FA23-BCS-123                  │    │         │
│  │  └─────────────────────────────────────┘    │         │
│  │                                               │         │
│  │  ┌─────────────────────────────────────┐    │         │
│  │  │      Create Account                 │    │         │
│  │  │     (Gradient Button)               │    │         │
│  │  └─────────────────────────────────────┘    │         │
│  │                                               │         │
│  │  Already have an account? Sign In             │         │
│  │                            (Blue Link)        │         │
│  │                                               │         │
│  └──────────────────────────────────────────────┘         │
│                                                             │
│     By creating an account, you agree to...                │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Unique Components (Not in Login)

#### Password Strength Indicator
```
Progress Bar:
▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ Strong
────────────────────────────
│ Full width
│ Height: 8px
│ Border Radius: 4px
│ Background: #E2E8F0 (light slate)
│ Bar Colors:
│   Weak:   #EF4444 (33% fill)
│   Medium: #F59E0B (66% fill)
│   Strong: #22C55E (100% fill)
```

#### Requirements Checklist
```
✓ At least 6 characters     ← Green check, green text
✓ 8+ characters             ← Green check, green text
○ One uppercase letter      ← Gray cancel, gray text
○ One number                ← Gray cancel, gray text
──────────────────────────
Icons: 16px
Text: Caption size
Met: #10B981 (green)
Not Met: #CBD5E1 (light slate)
Gap: 4px between items
```

#### Password Match Indicator
```
✓ Passwords match
──────────────────
Green check icon (16px)
Green text (#10B981)
Font weight: 500
Only shows when passwords match
```

#### Password Visibility Toggle
```
┌────────────────────────┐
│ Password          [👁] │ ← Eye icon, gray (#64748B)
└────────────────────────┘
                      │
                      └─ Toggles between 👁 and 👁‍🗨
                         Click to show/hide password
```

#### Role Dropdown
```
┌────────────────────────────┐
│ Role                   [▼] │
└────────────────────────────┘
Options:
  • Student   ← Default
  • Driver
  • Admin
```

#### Conditional Fields

**If Student Selected**:
```
┌────────────────────────────────┐
│ Student ID                     │
│ e.g., FA23-BCS-123             │
└────────────────────────────────┘
Format: FA/SP + 2 digits - BCS/BBA/BSE - 3 digits
```

**If Driver Selected**:
```
┌────────────────────────────────┐
│ License Number                 │
└────────────────────────────────┘
```

**If Admin Selected**:
```
┌────────────────────────────────┐
│ Admin Secret Code              │
│ (password field)               │
└────────────────────────────────┘
Enter the admin secret code to register
```

---

## REGISTRATION PAGE - Mobile (375x667)

```
┌───────────────────────┐
│  • Gradient BG •      │
│                       │
│ ← [Back]              │
│                       │
│   CampusRide          │
│                       │
│ ┌───────────────────┐ │
│ │   ╔═════════╗     │ │
│ │   ║  [👤]   ║     │ │
│ │   ╚═════════╝     │ │
│ │                   │ │
│ │ Create Your       │ │
│ │    Account        │ │
│ │ Join CampusRide...│ │
│ │                   │ │
│ │ ┌───────────────┐ │ │
│ │ │ Full Name     │ │ │
│ │ └───────────────┘ │ │
│ │                   │ │
│ │ ┌───────────────┐ │ │
│ │ │ Email         │ │ │
│ │ └───────────────┘ │ │
│ │                   │ │
│ │ ┌───────────────┐ │ │
│ │ │ Password  [👁]│ │ │
│ │ └───────────────┘ │ │
│ │                   │ │
│ │ ▓▓░░░░ Medium     │ │
│ │ ✓ At least 6...   │ │
│ │ ✓ 8+ chars...     │ │
│ │ ○ Uppercase       │ │
│ │ ○ Number          │ │
│ │                   │ │
│ │ [More fields...]  │ │
│ │                   │ │
│ │ ┌───────────────┐ │ │
│ │ │Create Account │ │ │
│ │ └───────────────┘ │ │
│ │                   │ │
│ │ Already have...   │ │
│ │    Sign In        │ │
│ │                   │ │
│ └───────────────────┘ │
│                       │
└───────────────────────┘
```

**Mobile Specifics**:
- Wider container (sm: 600px max)
- Scrollable content
- All fields stack vertically
- Password strength shows full width
- Conditional fields appear inline

---

## Interactive States

### Text Field States

#### Default State
```
┌────────────────────────────┐
│ Email Address              │
└────────────────────────────┘
Border: 1px solid #E0E0E0 (gray)
Background: White
```

#### Hover State
```
┌────────────────────────────┐
│ Email Address              │
└────────────────────────────┘
Border: 1px solid #0EA5E9 (brand blue)
Cursor: text
```

#### Focus State
```
┌────────────────────────────┐
│ Email Address              │
│ user@example.com           │ ← Cursor blinks here
└────────────────────────────┘
Border: 2px solid #0EA5E9 (thicker)
Label: #0EA5E9 (brand blue)
```

#### Error State
```
┌────────────────────────────┐
│ Email Address              │
│ invalid-email              │
└────────────────────────────┘
⚠ Please enter a valid email address
─────────────────────────────
Border: 2px solid #EF4444 (red)
Helper text: Red, below field
```

#### Filled Valid State
```
┌────────────────────────────┐
│ Email Address              │
│ user@example.com           │
└────────────────────────────┘
Border: 1px solid #E0E0E0
Content: Filled
```

### Button States

#### Default State
```
┌────────────────────────────┐
│        Sign In             │
└────────────────────────────┘
Background: Gradient (Blue → Teal)
Shadow: Medium (35% opacity)
Transform: translateY(0)
Cursor: pointer
```

#### Hover State
```
┌────────────────────────────┐
│        Sign In             │ ↑ Lifted 2px
└────────────────────────────┘
Background: Darker gradient
Shadow: Larger (45% opacity)
Transform: translateY(-2px)
Cursor: pointer
```

#### Active/Pressed State
```
┌────────────────────────────┐
│        Sign In             │ ↓ Pushed down
└────────────────────────────┘
Background: Even darker gradient
Shadow: Smaller
Transform: translateY(0)
```

#### Loading State
```
┌────────────────────────────┐
│          [⟳]               │ ← Spinning loader
└────────────────────────────┘
Background: Same gradient
Button: Disabled
Cursor: not-allowed
Spinner: White, 24px
```

#### Disabled State
```
┌────────────────────────────┐
│        Sign In             │
└────────────────────────────┘
Background: Gray gradient (#94A3B8)
Shadow: None
Cursor: not-allowed
Opacity: Full (not reduced)
```

### Link States

#### Default Link
```
Sign Up
───────
Color: #0EA5E9
Weight: 600
Decoration: none
```

#### Hover Link
```
Sign Up
───────  ← Underline appears
Color: #0EA5E9
Weight: 600
Decoration: underline
Cursor: pointer
```

### Dropdown States

#### Closed Dropdown
```
┌────────────────────────────┐
│ Role                   [▼] │
└────────────────────────────┘
```

#### Open Dropdown
```
┌────────────────────────────┐
│ Role                   [▲] │
└────────────────────────────┘
┌────────────────────────────┐
│ Student             [✓]    │ ← Selected
│ Driver                     │
│ Admin                      │
└────────────────────────────┘
```

### Password Visibility Toggle

#### Hidden Password
```
┌────────────────────────┐
│ Password          [👁] │
│ ••••••••••             │
└────────────────────────┘
```

#### Visible Password
```
┌────────────────────────┐
│ Password       [👁‍🗨]   │
│ MyPassword123          │
└────────────────────────┘
```

---

## Color Application Map

### Where Each Color Appears

#### Sky Blue (#0EA5E9)
- Back button icon
- Brand logo (gradient start)
- Input focus borders
- Input focus labels
- Primary links
- Button gradient (start)

#### Teal (#14B8A6)
- Brand logo (gradient end)
- Button gradient (end)

#### Success Green (#10B981)
- Password strength (strong)
- Password requirements met
- Password match indicator
- Success checkmarks

#### Slate Gray (#64748B)
- Body text
- Captions
- Helper text
- Password visibility icon
- Unmet requirements

#### Dark Slate (#0F172A)
- Page titles
- Section headings

#### Light Slate (#CBD5E1)
- Unmet requirement icons
- Input background (light)

#### Error Red (#EF4444)
- Password strength (weak)
- Error borders
- Error text

#### Warning Orange (#F59E0B)
- Password strength (medium)

---

## Spacing Measurements

### Vertical Spacing
```
Back button to logo: 16px
Logo to card: 24px
Icon to title: 16px
Title to subtitle: 4px
Subtitle to form: 32px
Between fields: 16px (margin normal)
Field to button: 24px (mt: 3)
Button to link: 16px (mt: 2)
Card to footer text: 24px
```

### Horizontal Spacing
```
Page margins: Auto (centered)
Card padding (mobile): 24px
Card padding (desktop): 40px
Input internal padding: ~16px
Button internal padding: 12px vertical, 16px horizontal
```

---

## Animation Timing

```
Card fade in: 0.6s ease-out
Decorative circles: 6s / 8s ease-in-out infinite
Button hover: 0.3s ease (all properties)
Input focus: 0.2s ease (default MUI)
Link hover: 0.2s ease
```

---

## Accessibility Features

### Focus Indicators
```
All interactive elements show visible focus:
- Inputs: 2px brand blue border
- Buttons: Outline (default browser)
- Links: Outline (default browser)
- IconButtons: Outline
```

### Screen Reader Text
```
- All inputs have visible labels
- IconButtons have aria-label
- Error alerts have role="alert"
- Password toggle: "toggle password visibility"
```

### Keyboard Navigation
```
Tab Order:
1. Back button
2. Email input
3. Password input
4. Submit button
5. Register link
(Registration adds more fields in logical order)
```

---

## Comparison with Landing Page

### Shared Elements
✓ Gradient background
✓ Decorative floating circles
✓ Gradient brand logo
✓ Gradient buttons with hover
✓ Brand blue links
✓ Rounded corners (12-20px)
✓ Card shadows
✓ fadeInUp animation
✓ Typography scale

### Unique to Auth Pages
- Back button
- Form inputs with focus states
- Password visibility toggles
- Password strength indicator
- Validation error states
- Legal disclaimer text
- Centered single-card layout

### Not Included
- Multi-column footer
- Navigation bar
- Feature cards
- Stats section
- Multiple CTAs

---

## Print/Screenshot Views

### Login Page - Key Moments

**Load Animation (0.3s)**:
```
Card: opacity 0 → 1
Card: translateY(30px) → 0
```

**Focus First Field**:
```
Email field: Border 1px → 2px brand blue
Label: Gray → brand blue
```

**Hover Submit Button**:
```
Button: Lifts 2px up
Shadow: Increases in size and opacity
Gradient: Darkens slightly
```

### Registration Page - Key Moments

**Typing Password**:
```
Strength bar: Fills progressively
Color: Red → Orange → Green
Requirements: Gray ○ → Green ✓
```

**Selecting Role**:
```
Dropdown opens
Conditional field appears below
Smooth height transition
```

**Passwords Match**:
```
Green checkmark appears
"Passwords match" text shows
Positive reinforcement
```

---

*This mockup guide provides detailed visual descriptions of the implemented authentication pages. For technical details, see AUTH_PAGES_REDESIGN.md*
