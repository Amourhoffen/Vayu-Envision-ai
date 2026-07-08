# 🎨 ENVISION AI Design System

Version: 1.0

---

# Design Philosophy

ENVISION AI should feel like a modern consumer application rather than a government portal or admin dashboard.

The experience should combine:

* Instagram's clean social feed
* Google Maps' navigation and interaction
* Apple Weather's elegant cards
* Notion's readability
* Airbnb's spacing and typography

Every interaction should feel fast, polished, and intuitive.

---

# Design Principles

The UI must always be:

* Clean
* Minimal
* Elegant
* Premium
* Friendly
* Fast
* Accessible
* Mobile-first

Avoid clutter. Every element should have a clear purpose.

---

# Mobile-First Approach

Design for mobile first, then progressively enhance for tablets and desktops.

Primary target screen width:

360px–430px

Desktop should use adaptive layouts instead of simply stretching mobile components.

---

# Visual Style

Style Direction:

Modern Eco-Tech

Keywords:

* Nature
* Intelligence
* Simplicity
* Trust
* Community
* Real-time
* Premium

---

# Color Palette

## Primary

Emerald Green

Used for:

* Primary buttons
* Active navigation
* Success states
* Verified reports

---

## Secondary

Sky Blue

Used for:

* Live AQI
* Weather
* Maps
* Information

---

## Accent

Amber

Used for:

* Warnings
* Pending reports
* Alerts

---

## Danger

Crimson Red

Used for:

* Hazardous AQI
* Fire
* Emergency alerts

---

## Neutral Colors

Background (Light)

Pure white with soft gray tint.

Background (Dark)

Near-black instead of absolute black.

Cards

Slightly elevated.

Borders

Very subtle.

Never use heavy borders.

---

# AQI Color Scale

Excellent

Green

Good

Light Green

Moderate

Yellow

Poor

Orange

Very Poor

Red

Hazardous

Dark Purple

This color system should remain consistent across the entire application.

---

# Typography

Primary Font

Inter

Fallback:

System UI

Headings

Bold

Large

Readable

Body

Regular weight

Comfortable spacing

Avoid decorative fonts.

---

# Corner Radius

Cards

16px

Buttons

14px

Inputs

14px

Images

18px

Floating buttons

Circular

---

# Shadows

Very soft.

Avoid heavy shadows.

Cards should appear elevated without looking artificial.

---

# Glassmorphism

Use only for:

* Floating action button
* Navigation bar
* Map controls
* Bottom sheet

Never overuse blur effects.

---

# Animations

Animations must be smooth.

Use Framer Motion.

Duration:

200–350ms

Supported animations:

Fade

Slide

Scale

Shared element transitions

Page transitions

Skeleton loading

Avoid flashy effects.

---

# Loading Experience

Never show blank screens.

Always use:

* Skeleton cards
* Animated placeholders
* Progressive image loading
* Lazy loading

---

# Icons

Use Lucide Icons.

Consistent stroke width.

Rounded style preferred.

---

# Bottom Navigation (Mobile)

Five tabs only.

Home

Map

Report

Alerts

Profile

Center Report button should be visually highlighted.

Navigation should remain fixed.

---

# Desktop Layout

Left Sidebar

Center Content

Optional Right Sidebar

No top-heavy dashboards.

---

# Home Feed

Inspired by Instagram.

Each post contains:

* User avatar
* Username
* Verification badge (if applicable)
* Timestamp
* Location
* Image or video
* AI pollution summary
* AQI badge
* Tags
* Like
* Comment
* Share
* Save

Cards should feel spacious and modern.

---

# Floating Action Button

Visible on all major screens.

Primary action:

Report Pollution

Long press options:

* Camera
* Gallery
* Video
* Anonymous Report

---

# Report Flow

Step 1

Capture image

↓

Step 2

Location

↓

Step 3

AI detects pollution

↓

Step 4

Preview

↓

Step 5

Submit

↓

Step 6

Tracking page

Users should always see progress indicators.

---

# Interactive Map

Map occupies nearly the full screen.

Floating controls:

* Current location
* Layer selector
* Search
* AQI legend
* Zoom
* Report button

Bottom sheet shows nearby reports.

---

# AQI Cards

Large rounded cards.

Display:

AQI

Air Quality Status

Health Advice

Temperature

Humidity

Wind

Last Updated

---

# Alert Cards

Use clear color coding.

Each alert contains:

* Severity
* Distance
* Estimated impact
* Suggested action
* Time detected

---

# Notification Center

Grouped by category.

Examples:

Environmental

Community

Events

Government

Personal

Unread indicators should be subtle.

---

# Event Cards

Cover image

Date

Location

Organizer

Participants

Join button

Map preview

---

# Knowledge Hub

Netflix-style horizontal content sections.

Examples:

Latest Videos

Government Resources

Climate News

Recycling Tips

Featured Playlists

Users should never feel like they're reading a document.

---

# User Profile

Sections:

Profile

Achievements

Eco Points

Posts

Saved Reports

Badges

Followers

Following

Contribution Statistics

---

# Leaderboard

Modern ranking cards.

Top three users receive premium visual treatment.

Display:

Avatar

Points

Level

Contribution count

City

---

# Municipality Dashboard

Professional but modern.

Features:

Live map

Pending reports

Resolved reports

Charts

AI confidence

Assignment queue

Dark mode supported.

---

# Empty States

Every empty screen should include:

Illustration

Helpful message

Suggested action

Never show plain text like:

"No Data"

---

# Error States

Friendly messages.

Example:

"We couldn't load the latest AQI data. Pull down to try again."

Avoid technical error codes in the UI.

---

# Search Experience

Instant search.

Suggestions while typing.

Recent searches.

Trending locations.

Trending hashtags.

---

# Microinteractions

Buttons slightly scale on tap.

Cards elevate on hover (desktop).

Like animation.

Bookmark animation.

Map pin bounce.

Report success animation.

Achievement unlock animation.

---

# Accessibility

Minimum touch target:

48 × 48 px

Color contrast must meet WCAG AA.

Support screen readers.

Visible keyboard focus.

Reduced motion mode.

---

# Responsive Breakpoints

Mobile

Tablet

Laptop

Desktop

Ultra-wide

Layouts should adapt rather than simply resize.

---

# Image Handling

Progressive loading.

Blur placeholders.

Automatic compression.

Lazy loading.

Support HEIC, JPG, PNG, WebP, and MP4 for uploads where supported.

---

# Theme Support

Light Theme

Dark Theme

Automatic system detection.

User can switch manually.

Remember preference across sessions.

---

# Performance Guidelines

Avoid layout shifts.

Optimize Largest Contentful Paint.

Minimize JavaScript bundle size.

Virtualize long lists.

Cache API responses intelligently.

---

# Mandatory UI Rules for AI Code Editor

Do NOT generate:

* Bootstrap layouts
* Admin dashboard templates
* Large blocks of text
* Flat, boring cards
* Excessive borders
* Inconsistent spacing
* Random color usage
* Placeholder stock illustrations
* Fake analytics
* Dummy environmental data

Instead, generate a polished, premium, production-ready interface with reusable components, consistent spacing, smooth animations, and a cohesive visual identity that feels like a top-tier consumer application.
