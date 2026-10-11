const resetTimers = new WeakMap<HTMLButtonElement, number>();

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const button = target.closest<HTMLButtonElement>(".copy-code-button");
  if (!button) return;

  const code = button.closest(".code-block")?.querySelector("pre > code");
  if (!code) {
    console.error("Could not find code block for copy button.");
    return;
  }

  try {
    await navigator.clipboard.writeText(code.textContent ?? "");
    button.dataset.copyState = "copied";
    button.title = "Copied!";
    button.setAttribute("aria-label", "Copied");
  } catch (error) {
    console.error("Could not copy code to the clipboard.", error);
    button.dataset.copyState = "failed";
    button.title = "Copy failed";
    button.setAttribute("aria-label", "Copy failed");
  }

  const previousTimer = resetTimers.get(button);
  if (previousTimer !== undefined) clearTimeout(previousTimer);
  resetTimers.set(button, window.setTimeout(() => {
    delete button.dataset.copyState;
    button.title = "Copy code";
    button.setAttribute("aria-label", "Copy code");
    resetTimers.delete(button);
  }, 1500));
});
