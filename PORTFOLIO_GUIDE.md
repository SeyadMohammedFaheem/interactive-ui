# 🚀 Portfolio Showcase & Integration Guide

Here is how to easily show all 14 SwiftUI-inspired interactive motion projects on your portfolio (Framer, Webflow, React, Next.js, Notion, or custom sites).

---

## 🌟 3 Easy Ways to Showcase Your Projects

### 1. Live Full Interactive Showcase Site (Recommended)
Deploy this repository to **Vercel**, **Netlify**, or **GitHub Pages**.
- **Commands**: 
  - Vercel: `npx vercel`
  - Netlify: `npx netlify deploy`
- Visitors can view all **14 components** in a responsive 600px showcase grid with interactive previews, filter by category (*Navigation*, *Inputs*, *Feedback*), and switch to focused single-component views.

---

### 2. Direct Iframe Embed (For Framer, Webflow, Wix, Squarespace & Notion)
You can embed any individual component directly into Framer, Webflow, or custom portfolio cards with zero margins or headers.

Append `?embed=<component_id>` to your deployed URL.

```html
<!-- Example: Expandable FAB Arc Menu Embed -->
<iframe 
  src="https://your-portfolio-domain.com/?embed=expandableFab" 
  width="100%" 
  height="600px" 
  style="border:none; border-radius: 24px; overflow: hidden;"
  allow="autoplay" 
  loading="lazy">
</iframe>
```

#### Available Component Embed IDs:
| Component Name | Embed URL ID | Category |
| :--- | :--- | :--- |
| **Time Ruler Picker** | `timeRuler` | Inputs |
| **Hold to Record Pill** | `holdToRecord` | Inputs |
| **Before / After Image Slider** | `beforeAfter` | Animation |
| **Traffic Analytics Bar Chart** | `trafficChart` | Inputs |
| **Crypto Token Swap** | `cryptoSwap` | Inputs |
| **Digital Signature Pad** | `signaturePad` | Inputs |
| **Mini Music Player** | `musicPlayer` | Feedback |
| **Interactive Stock Chart** | `stockChart` | Inputs |
| **Card Spread Fan** | `spreadCards` | Animation |
| **Slide to Confirm Slider** | `slideToConfirm` | Inputs |
| **PIN Verification Squircles** | `otpInput` | Inputs |
| **File Drop & Upload Morph** | `fileDrop` | Inputs |
| **Interactive Like Counter** | `likeCounter` | Feedback |
| **Stacked Notification Toasts** | `stackedToasts` | Feedback |
| **3D Card Swap Fan** | `cardSwap` | Animation |
| **Expandable FAB Arc Menu** | `expandableFab` | Navigation |
| **Chromatic Thinking Morph** | `chromaticThinking` | Feedback |
| **Fluid Number Counter** | `numberStepper` | Inputs |
| **Glossy Pagination Stepper** | `stepper` | Inputs |
| **Set Status Morph** | `setStatus` | Inputs |
| **Animated Tag Selector** | `tagGrid` | Inputs |
| **Carousel Orbit Slider** | `carouselSlider` | Navigation |
| **Comment Thread Morph** | `commentThread` | Feedback |
| **Voice Chat Morph** | `voiceChat` | Feedback |
| **License Key Morph** | `licenseKey` | Inputs |
| **Ruler Picker Morph** | `rulerPicker` | Inputs |
| **New Project Morph** | `newProject` | Feedback |
| **Privacy Toggle Morph** | `privacyToggle` | Inputs |
| **View on Map Morph** | `viewOnMap` | Navigation |

---

### 3. Copy-to-Clipboard Embed Modal (Built Directly Into App)
On your live site:
1. Click the **"Embed"** button on any component card.
2. A modal will pop up with:
   - **One-click Copy Iframe HTML** (for Webflow / Framer / HTML)
   - **Direct Embed URL**
   - **React Component Code Import Snippet**

---

## 🎨 Portfolio Presentation Tips
- **Highlight Physics & Frame Rate**: Mention *"60fps GSAP spring physics & Apple SwiftUI-inspired morphing design system"*.
- **Code Reference**: Mention *"Includes dual implementation in React + GSAP and native SwiftUI view code."*
