(() => {
  "use strict";

  const LOCK_CLASSES = ["rpl-scroll-lock", "scroll-is-blocked"];
  const UNLOCKED_ATTRIBUTE = "data-reddit-scroll-unlocker-active";
  const UPSELL_SELECTOR = "#desktop-dynamic-upsell-dialog";

  let scheduled = false;

  function hasScrollLock(element) {
    return Boolean(
      element && LOCK_CLASSES.some((className) => element.classList.contains(className))
    );
  }

  function removeScrollLocks(element) {
    if (!element) return;

    for (const className of LOCK_CLASSES) {
      element.classList.remove(className);
    }

    // Some Reddit variants also apply the lock as inline styles.
    element.style.removeProperty("overflow");
    element.style.removeProperty("overflow-x");
    element.style.removeProperty("overflow-y");
  }

  function removeLoginWall() {
    const loginWalls = document.querySelectorAll(UPSELL_SELECTOR);
    loginWalls.forEach((loginWall) => loginWall.remove());
    return loginWalls.length > 0;
  }

  function unlockIfNeeded() {
    scheduled = false;

    const root = document.documentElement;
    if (!root) return;

    const body = document.body;
    const loginWallExists = Boolean(document.querySelector(UPSELL_SELECTOR));
    const lockExists = hasScrollLock(root) || hasScrollLock(body);

    if (!loginWallExists && !lockExists && !root.hasAttribute(UNLOCKED_ATTRIBUTE)) {
      return;
    }

    root.setAttribute(UNLOCKED_ATTRIBUTE, "");
    removeLoginWall();
    removeScrollLocks(root);
    removeScrollLocks(body);
  }

  function scheduleUnlockCheck() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(unlockIfNeeded);
  }

  const observer = new MutationObserver(scheduleUnlockCheck);

  // `documentElement` can briefly be absent at document_start, so observe the
  // document itself until Reddit has built the page.
  observer.observe(document.documentElement || document, {
    attributes: true,
    attributeFilter: ["class", "style"],
    childList: true,
    subtree: true
  });

  scheduleUnlockCheck();
})();
