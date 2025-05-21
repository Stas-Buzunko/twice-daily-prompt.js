// ==UserScript==
// @name         Twice-Daily Prompt Sender
// @version      0.1
// @description  Automate sending your daily goals prompt at 9–10 AM and 10–11 PM
// @match        https://www.typingmind.com/*
// @grant        none
// ==/UserScript==

;(function () {
  // 1) Define morning/evening windows + storage keys
  const WINDOWS = {
    morning: { start: 9, end: 10, key: 'tm_sent_morning' },
    evening: { start: 22, end: 23, key: 'tm_sent_evening' }
  }
  const PROMPT =
    "what's the one thing you can do today to bring you closer to goals?"

  function todayStr() {
    return new Date().toISOString().slice(0, 10)
  }

  // 2) Have we already sent for this window today?
  function hasSent(win) {
    return localStorage.getItem(win.key) === todayStr()
  }
  function markSent(win) {
    localStorage.setItem(win.key, todayStr())
  }

  // 3) Try to send the prompt into the currently open chat
  function sendPrompt() {
    // 3a) Find the chat input box (most likely a <textarea>)
    let ta =
      document.querySelector('textarea') ||
      document.querySelector('[data-element-id="chat-input-textarea"]')
    if (!ta) return console.warn('No chat textarea found!')

    // 3b) Fill & dispatch an input event
    ta.focus()
    ta.value = PROMPT
    ta.dispatchEvent(new Event('input', { bubbles: true }))

    // 3c) Find and click the Send button
    let sendBtn =
      document.querySelector('button[data-element-id="send-button"]') ||
      Array.from(document.querySelectorAll('button')).find(b =>
        /send/i.test(b.innerText)
      )
    if (!sendBtn) return console.warn('No Send button found!')
    sendBtn.click()
  }

  // 4) Every minute, check time + send if needed
  function checkAndMaybeSend() {
    const h = new Date().getHours()
    for (let winName of ['morning', 'evening']) {
      const win = WINDOWS[winName]
      if (h >= win.start && h < win.end && !hasSent(win)) {
        console.log(`Auto-sending ${winName} prompt…`)
        sendPrompt()
        markSent(win)
      }
    }
  }

  // Kick off
  setInterval(checkAndMaybeSend, 60 * 1000)
  // Also run immediately on load
  checkAndMaybeSend()
})()
