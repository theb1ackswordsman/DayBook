# DESIGN.md: Peer-Support Journal Social App

> Source of truth for all UI work.
> If a /design-reference folder with screenshots exists, screenshots WIN over this
> file wherever they conflict. Report every place you matched a screenshot.
> Use a placeholder app name and logo. Never use any third-party brand name,
> logo, illustration, or copied asset.
# ADDENDUM (overrides earlier sections where they conflict)
Reference: screenshots in /design-reference (TalkLife feed + profile, dark mode).
Screenshots win over this file.

## Color (dark): neutral charcoal, NOT blue-tinted
Sample exact hex values from the /design-reference images with a script
(e.g. Python PIL pixel sampling). Starting values:
--bg #1B1B1D  --surface #2A2A2C  --surface-2 #38383B
--text #FFFFFF  --text-muted #A0A0A6  --primary #8949FF
Delete the old navy dark tokens. Light mode stays as-is until I send screenshots.

## Purple is an accent, not a wash
Use purple ONLY for: primary buttons, focus rings, links, toggle/slider on-state.
Active nav item = --surface-2 pill with white icon/text (no purple tint, no left bar).
Active tab = --surface-2 pill. Inactive tabs = muted text.

## Shape
Cards 24px radius. Buttons, nav items, tab bars, chips = full pill.
Avatars = rounded squares (~28% radius) with a 2-3px ring.

## Mood pills
Solid fill, bold 13-14px, one hue per mood (Happy amber, Calm violet, Sad blue,
Frustrated orange, Hopeful green, Grateful pink). Pick the text color per pill
so it passes 4.5:1; darken fills if needed. Used on entry cards and the composer.

## Layout (replaces the 3-column spec)
- Left sidebar 280px, no card, same bg as the page, 1px right divider.
  Top row: logo (left) + pill "+ Write" button (right).
  Nav: Home, Journal, Explore (Soon), Messages (Soon), Notifications (Soon), Profile.
  Divider, then: Safety Centre, I need help, About.
  Bottom: sun/moon segmented theme toggle, then user footer
  (avatar, name, small subtitle, dropdown arrow, logout icon button).
- NO global top bar. NO right rail. Center column max ~820px.
- Home: pill tab bar at top ([Recent | By mood] + search icon that expands
  into an input), then a compact "How are you feeling today?" bar that opens
  the composer modal, then entry cards.
- Entry card: avatar + bold name + muted relative time + "..." menu top-right,
  body text, mood pill bottom-left, lock icon + "Private" bottom-right
  (replaces comment/heart counts until the social phase).
- "I need help" opens a page/modal with real helplines. This replaces the
  right-rail crisis card. The link must stay visible in the sidebar at all times.
- Mobile: top bar (logo + Write button), bottom tab bar as agreed earlier.
## 1. Vibe
Calm, warm, safe, non-judgmental. A supportive community, not a high-energy
social network. Generous whitespace, rounded shapes, soft shadows.
Red is reserved for destructive and crisis-related actions only.

## 2. Color Tokens (define ONCE as CSS variables; no hardcoded hex elsewhere)

### Light
--primary:        #8949FF   /* main buttons, active nav, links, focus ring */
--primary-dark:   #6F32E0   /* hover/pressed, and text links on white */
--primary-soft:   #F1EAFF   /* selected states, chips, highlights */
--accent:         #F5A65B   /* warm orange: Hug reaction + tiny highlights only */
--bg:             #F6F8FA   /* app background */
--surface:        #FFFFFF   /* cards, modals */
--text:           #1F2933
--text-muted:     #6B7785   /* timestamps, secondary text */
--border:         #E4E8EC
--danger:         #D64545   /* report, delete, crisis banner only */
--private:        #2F6F8F   /* blue-slate: marks anything private / journal-only */
--private-soft:   #E6F1F6

### Dark
--primary:        #A47BFF
--primary-dark:   #8949FF
--primary-soft:   #2A2140
--accent:         #F5A65B
--bg:             #12181D
--surface:        #1B232A
--text:           #E8EDF1
--text-muted:     #9AA7B3
--border:         #2A343C
--danger:         #EF6B6B
--private:        #5BA3C4
--private-soft:   #1C2F3A

Rules:
- Text on --primary buttons is white (#FFF), 16px/600 minimum.
- Use --primary-dark (not --primary) for small purple text on white backgrounds.
- Never use --private for anything public. It must only appear in the Journal area.

## 3. Typography
Font: "Inter", fallback system-ui, -apple-system, sans-serif.
- H1 28px/700   H2 22px/600   H3 18px/600
- Body 16px/400, line-height 1.6
- Meta/timestamps 13px/400, --text-muted
- Post and journal text NEVER below 16px.
- Max line length for reading text ~70ch.

## 4. Spacing & Shape
- 8px scale: 4, 8, 16, 24, 32, 48
- Radius: card 16px, button 12px, input 12px, chip/avatar fully round (999px)
- Shadow: card 0 1px 3px rgba(16,24,40,.06); hover 0 4px 12px rgba(16,24,40,.08)
- Borders are 1px --border. No heavy outlines.
- Dark mode: prefer border over shadow for card separation.

## 5. Layout

### Desktop (>=1024px): 3 columns, centered, 24px gaps
- Left (240px, sticky): nav + primary CTA
  Nav items: Home, Explore, Journal (lock icon, --private accent),
  Messages, Notifications, Profile, Settings
  CTA: full-width "Share a thought" button (--primary)
- Center (max 640px): feed / page content
- Right (300px, sticky): "Trending topics" card,
  "Need support now?" card (crisis resources), community guidelines link

### Tablet (768-1023px)
Right rail hidden. Left nav collapses to icon-only (with tooltips + aria-labels).

### Mobile (<768px)
Single column, sticky top bar (logo + notifications).
Bottom tab bar: Feed, Explore, + (opens full-screen composer sheet), Journal, Profile.
Touch targets min 44x44px. Respect safe-area insets.

## 6. Core Components

### Post card
- Row 1: avatar + username (pseudonymous/anonymous supported) + relative time + "..." menu
- Optional mood chip (emoji + label)
- Body text (16px, preserves line breaks)
- Topic hashtags as chips (--primary-soft bg, --primary-dark text)
- Action row: Hug (heart icon, --accent when active), Comment, Save
- "..." menu: Report, Mute user, Block user (Delete/Edit on own posts)
- Content-warning posts: blurred body + "Show post" button; blur is NOT removable via CSS-only tricks
  (do not render the real text in the DOM preview beyond a safe snippet)
- Anonymous posts show a generic avatar and the label "Anonymous"

### Composer
- Textarea, min 3 rows, auto-grow, placeholder "How are you feeling today?"
- Mood selector (row of emoji, single select, optional)
- Topic picker (chips, max 3)
- Audience toggle: "Public" | "Only me (save to journal)"  <- default is the safer one the user last used; first-time default = "Only me"
- Toggles: "Content warning", "Post anonymously"
- Character counter appears at 80% of the limit (limit: 1000)
- Primary button: "Share" (disabled when empty)
- Mobile: opens as a full-screen sheet with a close button and unsaved-draft protection

### Reactions
- "Hug" is the main reaction (never "Like"). Optional second: "Me too".
- Hug: gentle scale pulse (1 -> 1.15 -> 1, 200ms) + color fill.
- Show counts in muted text; do not make counts visually prominent.

### Comments
- Threaded 1 level deep, same card language, smaller avatar (28px)
- Placeholder: "Write something kind..."

### Journal section (visually distinct from the public feed)
- --private accent, lock icon in the page header
- Persistent banner: "Only you can see this"
- Views: entry list, calendar (mood-colored dots), mood chart, streak (gentle, no shaming)
- "Share to feed" is an explicit per-entry button with a confirm dialog;
  it creates a COPY in the feed. Never shared by default.

### Crisis support
- Triggered when a post draft or search contains self-harm language.
- Soft banner: --primary-soft background, gentle copy, country-based helpline link.
- Never blocks posting, never shames, never auto-reports.
- A permanent "Need support now?" card lives in the right rail / Settings.

### Navigation states
- Active item: --primary-soft bg + --primary-dark text + 3px left indicator (desktop)
- Hover: --bg tint. Focus: 2px --primary ring, 2px offset.

### Feedback & states
- Loading: skeleton cards (no spinners for feeds)
- Empty: friendly illustration + one-line encouragement + single CTA
- Errors: gentle copy ("Something went wrong. Try again?") with a retry button
- Toasts: bottom-center on mobile, bottom-left on desktop, auto-dismiss 4s, with an Undo where possible

## 7. Motion
- 150-200ms ease-out for hover/focus/open transitions
- No bouncing, parallax, or attention-grabbing animation
- Respect prefers-reduced-motion: disable all non-essential motion

## 8. Accessibility (WCAG AA minimum)
- Text contrast >= 4.5:1 (large text >= 3:1), verified in BOTH themes
- Visible focus ring on every interactive element; full keyboard navigation
- aria-label on every icon-only button; alt text on meaningful images
- Never rely on color alone for mood or state (pair with icon/text)
- Modals trap focus and close on Escape; return focus to the trigger
- Semantic HTML (nav, main, aside, article for posts)

## 9. Tone of Copy
Warm, short, human, never clinical, never preachy.
- "How are you feeling today?" not "Create post"
- "Share a thought" not "Submit"
- "You're not alone" style encouragement is fine in empty states; avoid toxic positivity
- Errors never blame the user

## 10. Don'ts
- No follower counts front and center; no public like-count competition
- No streak-shaming, guilt notifications, or "you haven't posted" nags
- No ad-style clutter, popups, or dark patterns
- No red except danger/destructive actions
- No hardcoded colors, fonts, or spacing outside the token file
- No third-party logo, name, illustrations, or copied assets
- Never render private journal content in any shared/public component