# Chrome Web Store — Privacy Practices & Justifications

Paste these into the **Privacy practices** tab of the item in the Developer Dashboard.

## 1. Single Purpose Description

> Thirsty displays an on-screen estimate of the water, energy, and CO₂ footprint of
> the current AI conversation on claude.ai. It reads the visible chat text locally to
> approximate token counts and renders a small meter. No data leaves the browser.

## 2. Permission Justifications

### Host access — `https://claude.ai/*`
> **Justification:** The extension's only job is to show the footprint meter on
> claude.ai. It needs to run a content script there to read the visible conversation
> text (to estimate tokens) and to inject the meter card below the reply. It requests
> no other host and no additional APIs.

_(Thirsty declares no `permissions` array — no tabs, storage, clipboard, scripting,
or background permissions. Only the claude.ai content-script host match.)_

## 3. Data Usage (Checkboxes)

**Do NOT check any data-collection boxes.** Thirsty does not collect or transmit any
user data — all processing is local and ephemeral (nothing is stored or sent).

## 4. Certifications

Check all three:
- [x] I do not sell or transfer user data to third parties (outside approved use cases).
- [x] I do not use or transfer user data for purposes unrelated to the single purpose.
- [x] I do not use or transfer user data to determine creditworthiness / lending.

## 5. Privacy Policy URL

Use the repo's raw URL after pushing, e.g.:
`https://github.com/<you>/thirsty/blob/main/surfaces/browser-extension/PRIVACY_POLICY.md`
