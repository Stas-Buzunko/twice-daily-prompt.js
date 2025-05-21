// ==UserScript==
// @name         Twice-Daily Prompt Sender (Dry‐Run with “Daily” Tab Jump)
// @version      0.3
// @description  Every minute: if 9–10AM or 10–11PM, click your “Daily” chat and console.log the prompt.
// @match        https://www.typingmind.com/*
// @grant        none
// ==/UserScript==

;(function(){
  console.log("🔧 Twice-Daily Prompt Sender (Dry‐Run) initializing…");

  const WINDOWS = {
    morning: { start: 9,  end: 12, key: "tm_sent_morning" },
    evening: { start: 22, end: 23, key: "tm_sent_evening" }
  };
  const PROMPT = "what's the one thing you can do today to bring you closer to goals?";

  function todayStr() {
    return new Date().toISOString().slice(0,10);
  }

  function hasSent(win) {
    const v = localStorage.getItem(win.key);
    console.log(`  [${win.key}] stored=${v} today=${todayStr()}`);
    return v === todayStr();
  }
  function markSent(win) {
    localStorage.setItem(win.key, todayStr());
    console.log(`  → marked ${win.key} as sent for ${todayStr()}`);
  }

  // Try to click the “Daily” chat in the sidebar
  function navigateToDaily() {
    const sidebar = document.getElementById("sidebar-middle-part");
    if (!sidebar) {
      console.warn("❌ #sidebar-middle-part not found");
      return false;
    }
    const dailyTab = Array.from(
      sidebar.querySelectorAll("div.truncate")
    ).find(div => div.textContent.trim()==="Daily");

    if (!dailyTab) {
      console.warn("❌ “Daily” tab not found under #sidebar-middle-part");
      return false;
    }
    dailyTab.click();
    console.log("✅ Clicked “Daily” tab");
    return true;
  }

  // Main check/send routine (dry-run)
  function checkAndMaybeSend() {
    const now = new Date();
    const h = now.getHours();
    console.log(`\n⏱️ check at ${now.toLocaleTimeString()}`);

    for (let name of ["morning","evening"]) {
      const win = WINDOWS[name];
      if (h >= win.start && h < win.end) {
        console.log(`• In ${name} window (${win.start}–${win.end})`);
        if (!hasSent(win)) {
          console.log(`  → Not yet sent for ${name}. Attempting…`);
          if (navigateToDaily()) {
            console.log(`    📝 WOULD SEND PROMPT: "${PROMPT}"`);
            markSent(win);
          } else {
            console.log("    💡 Aborting send because “Daily” tab not found.");
          }
        } else {
          console.log(`  → Already sent your ${name} prompt today.`);
        }
      }
    }
  }

  // Kickoff: run immediately + every 60s
  checkAndMaybeSend();
  setInterval(checkAndMaybeSend, 60_000);
})();
