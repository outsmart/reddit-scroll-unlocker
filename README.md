# Reddit Scroll Unlocker

A small, auditable Chrome extension that hides Reddit's delayed desktop login wall and restores scrolling on `www.reddit.com`.

## Install in Chrome

1. Unzip `reddit-scroll-unlocker.zip` if you downloaded the ZIP version.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** in the upper-right corner.
4. Click **Load unpacked**.
5. Select the `reddit-scroll-unlocker` folder (the folder containing `manifest.json`).
6. Reload any Reddit tabs that were already open.

## What it changes

- Hides the automatically triggered `#desktop-dynamic-upsell-dialog` element.
- Removes Reddit's `rpl-scroll-lock` and `scroll-is-blocked` classes from the page root/body.
- Watches for Reddit adding the dialog or lock classes again and removes them.
- Restores normal page overflow only after a matching scroll lock is detected.

The extension has no background process, analytics, network requests, storage access, or access to sites other than `https://www.reddit.com/*`.

## Disable or remove

Open `chrome://extensions`, find **Reddit Scroll Unlocker**, and use its toggle or click **Remove**. Reload Reddit afterward to restore its normal behavior.

## If Reddit changes the page again

Reddit may rename the dialog or scroll-lock classes. The selectors are grouped near the top of `content.js`, and the matching CSS rule is at the top of `styles.css` so they are easy to update.
