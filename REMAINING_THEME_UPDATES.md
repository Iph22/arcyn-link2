# Remaining iOS Theme Updates

## ✅ Completed Files
- ✅ app/globals.css
- ✅ tailwind.config.ts
- ✅ app/layout.tsx
- ✅ app/(dashboard)/layout.tsx
- ✅ app/page.tsx
- ✅ app/(auth)/signin/page.tsx
- ✅ app/(auth)/signup/page.tsx
- ✅ app/(dashboard)/dashboard/page.tsx
- ✅ app/(dashboard)/chat/page.tsx
- ✅ app/(dashboard)/leaderboard/page.tsx
- ✅ app/(dashboard)/ai-playground/page.tsx

## 🔄 Remaining Dashboard Pages

### 1. app/(dashboard)/calls/page.tsx
**Changes needed:**
- Line 90: `bg-arcyn-bg` → `bg-arcyn-bg`
- Line 119-122: `text-white` → `text-ios-gray-900`
- Line 156: `bg-arcyn-surface` + `border-gold-500/20` → `glass-card`
- Line 159: `text-gold-500` → `text-ios-blue`
- Line 160: `text-white` → `text-ios-gray-900`
- Line 165: `bg-arcyn-bg` → `bg-ios-gray-50`
- Line 168: `text-gray-400` → `text-ios-gray-500`
- Line 176: `bg-arcyn-bg` → `bg-ios-gray-50`
- Line 191: `text-white` → `text-ios-gray-900`
- Line 194: `text-gray-400` → `text-ios-gray-600`
- Line 203: `bg-gold-500/20 text-gold-400` → `bg-ios-blue/20 text-ios-blue`

### 2. app/(dashboard)/profile/page.tsx
**Changes needed:**
- Line 106: `bg-arcyn-surface` + `border-gold-500/20` → `glass-card`
- Line 111: `shadow-gold-glow` → `shadow-ios-lg`
- Line 115: `bg-gradient-to-r ${rank.color}` + `shadow-lg` → add `shadow-ios`
- Line 124: `text-white` → `text-ios-gray-900`
- Line 125-126: `text-gray-400/300` → `text-ios-gray-600/700`
- Line 132: `bg-gold-500/20` → `bg-ios-blue/10`
- Line 134: `text-gold-500` → `text-ios-blue`
- Line 157: `from-gold-500 to-gold-600` + `shadow-gold-glow` → `from-ios-yellow to-ios-orange` + `shadow-ios-lg`
- Line 158: `text-black` → `text-white`
- Line 159: `text-black` → `text-white`
- Line 179: `bg-arcyn-surface` + `border-gold-500/20` → `glass-card`
- Line 184: `text-white` → `text-white` (keep for gradient)
- Line 187-188: `text-white/gray-400` → `text-ios-gray-900/600`
- Line 192: `text-gold-500` → `text-ios-blue`
- Line 193: `text-gray-400` → `text-ios-gray-600`
- Line 203: `bg-arcyn-surface` + `border-gold-500/20` → `glass-card`
- Line 205: `text-white` → `text-ios-gray-900`
- Line 206: `text-gold-500` → `text-ios-blue`
- Line 215: `bg-arcyn-bg` + `border-gold-500/20` → `bg-white` + `border-arcyn-border`
- Line 218-219: `text-white/gray-400` → `text-ios-gray-900/600`
- Line 221-222: `text-gold-500` → `text-ios-blue`
- Line 257: `bg-arcyn-surface` + `border-gold-500/20` → `glass-card`
- Line 260: `text-white` → `text-white` (keep for gradient)
- Line 262-263: `text-white/gray-400` → `text-ios-gray-900/600`

### 3. app/(dashboard)/channels/page.tsx
**Pattern:** Similar to chat page
- Replace `bg-arcyn-surface` with `glass-card` or `bg-arcyn-surface`
- Replace `border-gold-500/20` with `border-arcyn-border`
- Replace `text-white` with `text-ios-gray-900`
- Replace `text-gray-400` with `text-ios-gray-600`
- Replace `text-gold-500` with `text-ios-blue`
- Replace `shadow-gold-glow` with `shadow-ios-lg`
- Replace `bg-gradient-to-r from-gold-500 to-gold-600` with `bg-ios-blue`

### 4. app/(dashboard)/research-library/page.tsx
**Pattern:** Similar to dashboard page
- Replace all dark theme classes with iOS light equivalents
- Use `glass-card` for main containers
- Use `text-ios-gray-900` for headings
- Use `text-ios-gray-600` for descriptions
- Use `text-ios-blue` for accents

### 5. app/(dashboard)/settings/page.tsx
**Pattern:** Form-heavy page
- Replace input backgrounds: `bg-arcyn-bg` → `bg-white`
- Replace borders: `border-gold-500/20` → `border-arcyn-border`
- Replace focus rings: `focus:border-gold-500` → `focus:border-ios-blue`
- Replace text colors: `text-white` → `text-ios-gray-900`
- Replace buttons: `bg-gradient-to-r from-gold-500 to-gold-600` → `bg-ios-blue`
- Add `shadow-ios-inner` to inputs

## 🎨 Component Files to Update

### Priority Components
1. **components/notifications/NotificationBell.tsx**
   - Update dropdown background and borders
   - Change text colors to iOS theme
   - Update notification badges

2. **components/search/GlobalSearch.tsx**
   - Update search input styling
   - Change dropdown results styling
   - Update hover states

3. **components/settings/*.tsx**
   - AvatarUpload.tsx
   - PasswordChange.tsx
   - DeleteAccount.tsx

4. **components/chat/*.tsx**
   - MessageBubble.tsx
   - ChatWindow.tsx
   - EmojiPicker.tsx
   - etc.

## 📝 Quick Reference: Class Replacements

### Backgrounds
- `bg-arcyn-bg` → stays (it's now #F5F5F7)
- `bg-arcyn-surface` → stays (it's now #FFFFFF)
- `bg-arcyn-bg` (for cards) → `glass-card` or `bg-white`

### Borders
- `border-gold-500/20` → `border-arcyn-border`
- `border-gold-500/40` → `border-ios-blue/30`

### Text Colors
- `text-white` → `text-ios-gray-900`
- `text-gray-400` → `text-ios-gray-600`
- `text-gray-300` → `text-ios-gray-700`
- `text-gold-500` → `text-ios-blue`

### Shadows
- `shadow-gold-glow` → `shadow-ios-lg`
- `shadow-gold-glow-lg` → `shadow-ios-xl`

### Buttons & Gradients
- `bg-gradient-to-r from-gold-500 to-gold-600` → `bg-ios-blue`
- `text-black` (on gold buttons) → `text-white`
- `hover:shadow-gold-glow` → `hover:bg-ios-blue/90`

### Inputs
- `bg-arcyn-bg border border-gold-500/20` → `bg-white border border-arcyn-border shadow-ios-inner`
- `focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20` → `focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20`
- `text-white placeholder-gray-500` → `text-ios-gray-900 placeholder-ios-gray-400`

### Animations
- `whileHover={{ scale: 1.05 }}` → `whileHover={{ scale: 1.02 }}`
- Keep animation timing the same

## 🚀 Implementation Strategy

For each remaining file:
1. Read the file
2. Find all instances of dark theme classes
3. Replace with iOS light theme equivalents using the reference above
4. Test the changes
5. Move to next file

## ✨ Testing Checklist

After all updates:
- [ ] All pages render correctly
- [ ] Forms are functional
- [ ] Buttons have proper hover states
- [ ] Text is readable (sufficient contrast)
- [ ] Shadows are subtle and appropriate
- [ ] Glassmorphism effects work
- [ ] Animations are smooth
- [ ] No dark theme remnants
