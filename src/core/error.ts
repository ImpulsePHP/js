const ERROR_DISPLAY_DURATION = 6000; // 6 seconds

export function showImpulseError(message: string) {
  let container = document.getElementById("impulse-error-container") as HTMLDivElement | null;
  if (!container) {
    container = document.createElement("div");
    container.id = "impulse-error-container";
    container.style.position = "fixed";
    container.style.top = "1rem";
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
    container.style.zIndex = "9999";
    container.style.pointerEvents = "none";
    container.style.width = "425px";

    document.body.appendChild(container);
  }

  const alreadyDisplayed = Array.from(container.children).some((child) =>
    child.textContent?.replace(/\s+/g, ' ').includes(message)
  );

  if (alreadyDisplayed) {
    return;
  }

  const banner = document.createElement("div");
  banner.style.background = "#e11d48";
  banner.style.color = "#fff";
  banner.style.padding = "12px";
  banner.style.fontFamily = "sans-serif";
  banner.style.borderRadius = "6px";
  banner.style.boxShadow = "0 2px 12px #0003";
  banner.style.opacity = "1";
  banner.style.minWidth = "280px";
  banner.style.pointerEvents = "auto";
  banner.style.transition = "opacity 0.4s, transform 0.4s";
  banner.style.marginTop = "6px";
  banner.style.marginBottom = "0";
  banner.style.display = "flex";
  banner.style.alignItems = "center";
  banner.style.fontSize = "0.9rem";

    banner.innerHTML = `
    <span style="vertical-align:middle;">${message}</span>
    <button style="margin-left:24px;background:transparent;border:none;color:#fff;font-size:22px;cursor:pointer;vertical-align:middle;" aria-label="Close">&times;</button>
  `;

  const closeBtn = banner.querySelector("button")!;
  closeBtn.addEventListener("click", () => removeBanner(banner));

  container.appendChild(banner);

  // Automatic removal
  setTimeout(() => removeBanner(banner), ERROR_DISPLAY_DURATION);
}

function removeBanner(banner: HTMLElement) {
  banner.style.opacity = "0";
  banner.style.transform = "translateY(-60px)";
  setTimeout(() => banner.remove(), 400);
}
