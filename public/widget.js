(function () {
  window.addEventListener("load", () => {
    const scriptEl = document.getElementById("Nexora-widget");

    //  Required IDs
    const siteId   = scriptEl?.getAttribute("data-site-id")   || "";
    const uniqueId = scriptEl?.getAttribute("data-unique-id") || "";

    // Nexora server base URL — MUST be absolute so the iframe src resolves correctly
    // on any third-party site. Override with data-server-url on the script tag.
    const serverUrl = (scriptEl?.getAttribute("data-server-url") || "http://localhost:3000").replace(/\/$/, "");

    // ── Button customization ───────────────────────────────────────────────────
    const buttonLabel        = scriptEl?.getAttribute("data-button-label")         || "Ask AI 💬";
    const buttonColor        = scriptEl?.getAttribute("data-button-color")         || "#CB1141";
    const buttonTextColor    = scriptEl?.getAttribute("data-button-text-color")    || "#ffffff";
    const buttonPosition     = scriptEl?.getAttribute("data-button-position")      || "right"; // "right" | "left"
    const buttonBorderRadius = scriptEl?.getAttribute("data-button-border-radius") || "14";

    // ── Chat window customization ──────────────────────────────────────────────
    const windowWidth    = scriptEl?.getAttribute("data-window-width")    || "400";
    const windowHeight   = scriptEl?.getAttribute("data-window-height")   || "500";
    const welcomeMessage = scriptEl?.getAttribute("data-welcome-message") || "Hello! How can I assist you today?";
    const headerTitle    = scriptEl?.getAttribute("data-header-title")    || "Nexora AI";
    const primaryColor   = scriptEl?.getAttribute("data-primary-color")   || "#CB1141";
    const theme          = scriptEl?.getAttribute("data-theme")            || "light"; // "light" | "dark"

    const isDark  = theme === "dark";
    const borderClr = isDark ? "#2d3748" : "#e5e7eb";

    // ── Session ID ─────────────────────────────────────────────────────────────
    let sessionId = localStorage.getItem("Nexora_session_id");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);
      localStorage.setItem("Nexora_session_id", sessionId);
    }

    // ── Inject Google Font (Inter) ─────────────────────────────────────────────
    const fontLink = document.createElement("link");
    fontLink.rel  = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(fontLink);

    // ── Global styles (button animations) ─────────────────────────────────────
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      @keyframes sbSlideIn {
        from { opacity: 0; transform: translateY(16px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      #Nexora-chat-window { animation: sbSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      #Nexora-float-btn:hover { filter: brightness(1.12); transform: scale(1.04) !important; }
      #Nexora-float-btn { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important; }
    `;
    document.head.appendChild(styleEl);

    // ── Floating Chat Button (unchanged) ──────────────────────────────────────
    const button = document.createElement("div");
    button.id = "Nexora-float-btn";
    button.innerHTML = buttonLabel;
    Object.assign(button.style, {
      position:        "fixed",
      bottom:          "20px",
      [buttonPosition]: "20px",
      padding:         "10px 20px",
      backgroundColor: buttonColor,
      color:           buttonTextColor,
      borderRadius:    `${buttonBorderRadius}px`,
      fontSize:        "14px",
      fontWeight:      "600",
      fontFamily:      "'Inter', sans-serif",
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      cursor:          "pointer",
      zIndex:          "2147483640",
      boxShadow:       `0 6px 24px ${buttonColor}55`,
      userSelect:      "none",
      whiteSpace:      "nowrap",
    });
    document.body.appendChild(button);

    // ── Chat Window — now an iframe ────────────────────────────────────────────
    // Build the /embed URL with all customization params so the Nexora app
    // renders the correct theme, colors, title, etc. inside the iframe.
    const params = new URLSearchParams({
      siteId,
      id:             uniqueId,
      sessionId,
      welcomeMessage,
      headerTitle,
      primaryColor,
      buttonColor,
      buttonTextColor,
      theme,
    });

    const iframe = document.createElement("iframe");
    iframe.id  = "Nexora-chat-window";
    iframe.src = `${serverUrl}/embed?${params.toString()}`;
    iframe.title       = `${headerTitle} Chat`;
    iframe.allow       = "microphone";      // future voice input support
    iframe.loading     = "lazy";
    Object.assign(iframe.style, {
      position:     "fixed",
      bottom:       "80px",
      [buttonPosition]: "20px",
      width:        `${windowWidth}px`,
      height:       `${windowHeight}px`,
      border:       `1px solid ${borderClr}`,
      borderRadius: "18px",
      boxShadow:    "0 24px 64px rgba(0,0,0,0.22)",
      display:      "none",
      overflow:     "hidden",
      zIndex:       "2147483641",
      background:   "transparent",
    });
    document.body.appendChild(iframe);

    // ── Toggle open / close ────────────────────────────────────────────────────
    button.addEventListener("click", () => {
      const isVisible = iframe.style.display !== "none";
      if (isVisible) {
        iframe.style.display = "none";
        button.innerHTML = buttonLabel;
      } else {
        iframe.style.display = "block";
        button.innerHTML = "✕ Close";
      }
    });
  });
})();