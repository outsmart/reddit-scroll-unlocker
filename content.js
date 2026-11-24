(() => {
  "use strict";

  const LOCK_CLASSES = ["rpl-scroll-lock", "scroll-is-blocked"];
  const OVERFLOW_PROPERTIES = ["overflow", "overflow-x", "overflow-y"];
  const UNLOCKED_ATTRIBUTE = "data-reddit-scroll-unlocker-active";
  const UPSELL_SELECTOR = "#desktop-dynamic-upsell-dialog";

  let scheduled = false;
  const observedElements = new WeakSet();

  function hasScrollLock(element) {
    return Boolean(
      element && LOCK_CLASSES.some((className) => element.classList.contains(className))
    );
  }

  // Only write to the DOM when something actually needs changing. Writing
  // unconditionally (e.g. `classList.remove` of an absent class still rewrites
  // the `class` attribute) generates a new mutation record, which re-triggers
  // the observer and can spin forever, freezing the tab.
  function removeScrollLocks(element) {
    if (!element) return;

    for (const className of LOCK_CLASSES) {
      if (element.classList.contains(className)) {
        element.classList.remove(className);
      }
    }

    // Some Reddit variants also apply the lock as inline styles.
    for (const property of OVERFLOW_PROPERTIES) {
      if (element.style.getPropertyValue(property)) {
        element.style.removeProperty(property);
      }
    }
  }

  function removeLoginWall() {
    document.querySelectorAll(UPSELL_SELECTOR).forEach((loginWall) => loginWall.remove());
  }

  // Watch for scroll-lock classes or inline styles on <html> and <body> only,
  // rather than every class/style change on Reddit's very busy DOM. Either may
  // not exist yet at document_start, so attach lazily.
  function watchRootAndBody() {
    for (const element of [document.documentElement, document.body]) {
      if (!element || observedElements.has(element)) continue;
      observedElements.add(element);
      observer.observe(element, { attributes: true, attributeFilter: ["class", "style"] });
    }
  }

  function unlockIfNeeded() {
    scheduled = false;

    const root = document.documentElement;
    if (!root) return;

    watchRootAndBody();

    const body = document.body;
    const loginWallExists = Boolean(document.querySelector(UPSELL_SELECTOR));
    const lockExists = hasScrollLock(root) || hasScrollLock(body);

    if (!loginWallExists && !lockExists && !root.hasAttribute(UNLOCKED_ATTRIBUTE)) {
      return;
    }

    if (!root.hasAttribute(UNLOCKED_ATTRIBUTE)) {
      root.setAttribute(UNLOCKED_ATTRIBUTE, "");
    }
    removeLoginWall();
    removeScrollLocks(root);
    removeScrollLocks(body);
  }

  // Batch checks into a macrotask. Using a microtask here would let a mutation
  // ping-pong (ours or Reddit's) run without ever yielding to the event loop,
  // which is what produces Chrome's "Page Unresponsive" dialog.
  function scheduleUnlockCheck() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(unlockIfNeeded, 0);
  }

  const observer = new MutationObserver(scheduleUnlockCheck);

  // Watch for the login wall / <html> / <body> being inserted anywhere.
  observer.observe(document, { childList: true, subtree: true });
  watchRootAndBody();

  scheduleUnlockCheck();
})();
