(function () {
  window.addEventListener("load", () => {
    const scriptEl = document.getElementById("Nexora-widget");

    // ── Required IDs 
    const siteId    = scriptEl?.getAttribute("data-site-id") || "";
    const uniqueId  = scriptEl?.getAttribute("data-unique-id") || "";

    // ── Button customization 
    const buttonLabel        = scriptEl?.getAttribute("data-button-label")        || "Ask AI 💬";
    const buttonColor        = scriptEl?.getAttribute("data-button-color")        || "#CB1141";
    const buttonTextColor    = scriptEl?.getAttribute("data-button-text-color")   || "#ffffff";
    const buttonPosition     = scriptEl?.getAttribute("data-button-position")     || "right"; // "right" | "left"
    const buttonBorderRadius = scriptEl?.getAttribute("data-button-border-radius")|| "14";

    // ── Chat window customization 
    const windowWidth    = scriptEl?.getAttribute("data-window-width")    || "400";
    const windowHeight   = scriptEl?.getAttribute("data-window-height")   || "500";
    const welcomeMessage = scriptEl?.getAttribute("data-welcome-message") || "Hello! How can I assist you today?";
    const headerTitle    = scriptEl?.getAttribute("data-header-title")    || "Nexora AI";
    const primaryColor   = scriptEl?.getAttribute("data-primary-color")   || "#CB1141";
    const theme          = scriptEl?.getAttribute("data-theme")            || "light"; // "light" | "dark"

    const isDark   = theme === "dark";
    const chatBg   = isDark ? "#1a1a2e" : "#ffffff";
    const textColor = isDark ? "#e2e8f0" : "#1a202c";
    const subText  = isDark ? "#94a3b8" : "#6b7280";
    const inputBg  = isDark ? "#0f3460" : "#f1f5f9";
    const borderClr = isDark ? "#2d3748" : "#e5e7eb";

    // ── Session ID ──
    let sessionId = localStorage.getItem("Nexora_session_id");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);
      localStorage.setItem("Nexora_session_id", sessionId);
    }

    // ── Inject Google Font (Inter) ────
    const fontLink = document.createElement("link");
    fontLink.rel  = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(fontLink);

    // ── Global styles (animations) ────
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      @keyframes sbSlideIn {
        from { opacity: 0; transform: translateY(16px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes sbPulse {
        0%, 100% { transform: scale(1); }
        50%       { transform: scale(1.08); }
      }
      #Nexora-chat-window { animation: sbSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      #Nexora-float-btn:hover { filter: brightness(1.12); transform: scale(1.04) !important; }
      #Nexora-float-btn { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important; }
    `;
    document.head.appendChild(styleEl);

    // ── Floating Chat Button 
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

    // ── Chat Window ─
    const chatWindow = document.createElement("div");
    chatWindow.id = "Nexora-chat-window";
    Object.assign(chatWindow.style, {
      position:     "fixed",
      bottom:       "80px",
      [buttonPosition]: "20px",
      width:        `${windowWidth}px`,
      height:       `${windowHeight}px`,
      background:   chatBg,
      borderRadius: "18px",
      boxShadow:    "0 24px 64px rgba(0,0,0,0.22)",
      display:      "none",
      flexDirection:"column",
      overflow:     "hidden",
      zIndex:       "2147483641",
      fontFamily:   "'Inter', sans-serif",
      border:       `1px solid ${borderClr}`,
    });

    // Header
    const header = document.createElement("div");
    Object.assign(header.style, {
      background: `linear-gradient(135deg, ${primaryColor}ee, ${primaryColor})`,
      padding:    "14px 16px",
      display:    "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: "0",
    });

    const headerLeft = document.createElement("div");
    Object.assign(headerLeft.style, { display: "flex", alignItems: "center", gap: "10px" });

    const botAvatar = document.createElement("div");
    botAvatar.innerHTML = "🤖";
    Object.assign(botAvatar.style, {
      width: "36px", height: "36px", borderRadius: "50%",
      background: "rgba(255,255,255,0.2)", display: "flex",
      alignItems: "center", justifyContent: "center", fontSize: "18px",
    });

    const headerInfo = document.createElement("div");
    const botName = document.createElement("p");
    botName.textContent = headerTitle;
    Object.assign(botName.style, { margin: "0", color: "#fff", fontWeight: "700", fontSize: "15px" });
    const botStatus = document.createElement("p");
    botStatus.textContent = "● Online";
    Object.assign(botStatus.style, { margin: "0", color: "rgba(255,255,255,0.7)", fontSize: "11px" });
    headerInfo.appendChild(botName);
    headerInfo.appendChild(botStatus);
    headerLeft.appendChild(botAvatar);
    headerLeft.appendChild(headerInfo);

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "✕";
    Object.assign(closeBtn.style, {
      background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
      borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer",
      fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center",
    });
    closeBtn.onclick = () => { chatWindow.style.display = "none"; button.innerHTML = buttonLabel; };

    header.appendChild(headerLeft);
    header.appendChild(closeBtn);
    chatWindow.appendChild(header);

    // Messages area
    const messagesArea = document.createElement("div");
    Object.assign(messagesArea.style, {
      flex: "1", overflowY: "auto", padding: "14px", display: "flex",
      flexDirection: "column", gap: "10px",
    });
    chatWindow.appendChild(messagesArea);

    // Append welcome message
    function appendMessage(content, role) {
      const wrapper = document.createElement("div");
      Object.assign(wrapper.style, {
        display: "flex",
        justifyContent: role === "user" ? "flex-end" : "flex-start",
      });
      const bubble = document.createElement("div");
      bubble.innerHTML = content;
      Object.assign(bubble.style, {
        maxWidth: "82%",
        padding: "9px 14px",
        borderRadius: role === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
        background: role === "user" ? `${primaryColor}cc` : (isDark ? "#2d3748" : "#f1f5f9"),
        color: role === "user" ? "#fff" : textColor,
        fontSize: "13px",
        lineHeight: "1.55",
        wordBreak: "break-word",
      });
      wrapper.appendChild(bubble);
      messagesArea.appendChild(wrapper);
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }
    appendMessage(`<p style="margin:0">${welcomeMessage}</p>`, "assistant");

    // Typing indicator
    function showTyping() {
      const wrapper = document.createElement("div");
      wrapper.id = "Nexora-typing";
      Object.assign(wrapper.style, { display: "flex", justifyContent: "flex-start" });
      const bubble = document.createElement("div");
      bubble.innerHTML = `
        <div style="display:flex;gap:5px;align-items:center;padding:4px 0">
          <span style="width:8px;height:8px;border-radius:50%;background:${primaryColor};animation:sbPulse 0.9s infinite"></span>
          <span style="width:8px;height:8px;border-radius:50%;background:${primaryColor};animation:sbPulse 0.9s 0.2s infinite"></span>
          <span style="width:8px;height:8px;border-radius:50%;background:${primaryColor};animation:sbPulse 0.9s 0.4s infinite"></span>
        </div>`;
      Object.assign(bubble.style, {
        padding: "10px 14px",
        borderRadius: "16px 16px 16px 2px",
        background: isDark ? "#2d3748" : "#f1f5f9",
      });
      wrapper.appendChild(bubble);
      messagesArea.appendChild(wrapper);
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }
    function hideTyping() {
      const t = document.getElementById("Nexora-typing");
      if (t) t.remove();
    }

    // Input bar
    const inputBar = document.createElement("div");
    Object.assign(inputBar.style, {
      display: "flex", gap: "8px", alignItems: "center",
      padding: "10px 12px",
      borderTop: `1px solid ${borderClr}`,
      background: inputBg,
      flexShrink: "0",
    });

    const inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.placeholder = "Ask me anything...";
    Object.assign(inputEl.style, {
      flex: "1", border: `1px solid ${borderClr}`, borderRadius: "22px",
      padding: "9px 14px", fontSize: "13px", background: chatBg,
      color: textColor, outline: "none", fontFamily: "'Inter', sans-serif",
    });

    const sendBtn = document.createElement("button");
    sendBtn.innerHTML = "➤";
    Object.assign(sendBtn.style, {
      background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}aa)`,
      border: "none", borderRadius: "50%", width: "38px", height: "38px",
      color: "#fff", fontSize: "16px", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: "0",
    });

    async function sendMessage() {
      const text = inputEl.value.trim();
      if (!text || !siteId || !uniqueId) return;
      inputEl.value = "";
      appendMessage(text, "user");
      showTyping();
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, siteId, uniqueId, sessionId }),
        });
        hideTyping();
        if (res.ok) {
          const data = await res.json();
          appendMessage(data.reply || data.message || "...", "assistant");
        } else {
          appendMessage("Oops! Something went wrong.", "assistant");
        }
      } catch {
        hideTyping();
        appendMessage("Oops! Something went wrong.", "assistant");
      }
    }

    sendBtn.onclick = sendMessage;
    inputEl.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });

    inputBar.appendChild(inputEl);
    inputBar.appendChild(sendBtn);
    chatWindow.appendChild(inputBar);

    // Powered by footer
    const footer = document.createElement("div");
    footer.innerHTML = `Powered by <span style="color:${primaryColor};font-weight:700">Nexora AI</span>`;
    Object.assign(footer.style, {
      textAlign: "center", padding: "6px", fontSize: "10px",
      color: subText, background: inputBg, flexShrink: "0",
    });
    chatWindow.appendChild(footer);

    document.body.appendChild(chatWindow);

    // Toggle open/close
    button.addEventListener("click", () => {
      const isVisible = chatWindow.style.display !== "none";
      if (isVisible) {
        chatWindow.style.display = "none";
        button.innerHTML = buttonLabel;
      } else {
        chatWindow.style.display = "flex";
        button.innerHTML = "✕ Close";
        inputEl.focus();
      }
    });
  });
})();