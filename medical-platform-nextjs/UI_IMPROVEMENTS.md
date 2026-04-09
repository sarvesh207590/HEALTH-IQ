# UI Improvements Plan — HealthIQ Medical Platform

## What needs to change and why

---

### 1. globals.css — ADD animations & keyframes
- Add `slide-in-left`, `slide-in-right`, `scale-in`, `bounce-in` keyframes
- Add `stagger-children` utility for list animations
- Add `glow` pulse effect for active elements
- Add `gradient-border` animated border effect

### 2. dashboard/page.tsx — Redesign header + tabs
- Replace plain white header with dark navy gradient header
- Add animated logo with pulse ring
- Replace flat tab buttons with pill-style animated tabs with sliding indicator
- Add smooth tab transition animation when switching

### 3. DashboardTab.tsx — Animate stat cards + welcome banner
- Animate stat cards with staggered fade-up on mount
- Add counting animation to stat numbers
- Add gradient border glow to quick action cards on hover
- Animate recent activity items with slide-in

### 4. UploadTab.tsx — Enhance upload zone + results
- Add drag-and-drop with animated border pulse
- Add file type icon based on extension
- Add animated progress steps during analysis
- Animate analysis result sections with staggered reveal
- Add copy-to-clipboard button on analysis text

### 5. ChatTab.tsx — Improve message bubbles + consultation UI
- Use `.bubble-user`, `.bubble-ai`, `.bubble-system` CSS classes
- Add typing indicator animation (3 bouncing dots)
- Animate new messages sliding in from bottom
- Add animated progress bar for auto-consultation
- Improve consultation stage indicator with animated steps

### 6. QATab.tsx — Polish room list + chat
- Add animated room selection with slide highlight
- Improve AI thinking indicator with bouncing dots
- Add smooth message appear animation

### 7. ReportsTab.tsx — Card redesign
- Replace plain white cards with `.card` hover effect
- Add severity badge with color coding
- Add animated PDF download button

### 8. Register page — Match login page style
- Apply same glass morphism + gradient background as login
- Add animated background orbs
- Add left panel with feature highlights

---

## Files to edit (in order)

1. `app/globals.css` — add new keyframes/utilities
2. `app/dashboard/page.tsx` — header + tabs redesign
3. `components/dashboard/DashboardTab.tsx` — stat animations
4. `components/dashboard/UploadTab.tsx` — upload UX + results
5. `components/dashboard/ChatTab.tsx` — message bubbles
6. `components/dashboard/QATab.tsx` — room + chat polish
7. `components/dashboard/ReportsTab.tsx` — card redesign
8. `app/(auth)/register/page.tsx` — match login style
