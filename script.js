
// cookie helpers (simple, values used here are safe: number and #rrggbb)
function setCookie(name, value, days) {
  let expires = "";
  if (typeof days === "number") {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length);
    }
  }
  return null;
}

// clamp helper
function clampNumber(n, min, max) {
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

// Apply saved preferences (if any) to CSS variables and inputs
function applyPreferences() {
  const savedFontSize = getCookie("fontsize"); // expected as plain number (e.g. "18")
  const savedFontColor = getCookie("fontcolor"); // expected as hex string (e.g. "#ff0000")

  if (savedFontSize !== null) {
    const sizeNum = parseInt(savedFontSize, 10);
    const sizeClamped = clampNumber(sizeNum, 8, 72);
    document.documentElement.style.setProperty("--fontsize", sizeClamped + "px");
    const sizeInput = document.getElementById("fontsize");
    if (sizeInput) sizeInput.value = sizeClamped;
  } else {
    // ensure default CSS var is consistent with input default
    document.documentElement.style.setProperty("--fontsize", "16px");
  }

  if (savedFontColor !== null) {
    // Basic validation for #rrggbb (6 hex digits)
    if (/^#[0-9a-fA-F]{6}$/.test(savedFontColor)) {
      document.documentElement.style.setProperty("--fontcolor", savedFontColor);
      const colorInput = document.getElementById("fontcolor");
      if (colorInput) colorInput.value = savedFontColor;
    }
  } else {
    document.documentElement.style.setProperty("--fontcolor", "#000000");
  }
}

// Attach handlers after DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("preferences-form");
  const fontSizeInput = document.getElementById("fontsize");
  const fontColorInput = document.getElementById("fontcolor");

  // Apply any previously-saved preferences on load
  applyPreferences();

  // Form submit -> save cookies and apply
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Read & validate font size
      let fontSizeVal = parseInt(fontSizeInput.value, 10);
      if (Number.isNaN(fontSizeVal)) fontSizeVal = 16;
      fontSizeVal = clampNumber(fontSizeVal, 8, 72);

      // Read & validate color
      let fontColorVal = fontColorInput.value || "#000000";
      if (!/^#[0-9a-fA-F]{6}$/.test(fontColorVal)) {
        fontColorVal = "#000000";
      }

      // Save cookies (fontsize stored as number string, no "px")
      setCookie("fontsize", String(fontSizeVal), 30); // expires in 30 days
      setCookie("fontcolor", fontColorVal, 30);

      // Apply immediately
      applyPreferences();
    });
  }
});
