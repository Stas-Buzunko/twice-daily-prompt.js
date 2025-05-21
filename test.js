// ==UserScript==
// @name         Twice-Daily Prompt Sender (Debug Mode)
// @version      0.2
// @description  Automate & debug sending your daily goals prompt at 9–10 AM and 10–11 PM
// @match        https://www.typingmind.com/*
// @grant        none
// ==/UserScript==

;(function () {
  console.log('🔧 Twice-Daily Prompt Sender (Debug) initializing…')
  alert('Extension loaded: Twice-Daily Prompt Sender (Debug)')

  // 1) Define windows + storage keys + prompt text
  const WINDOWS = {
    morning: { start: 9, end: 12, key: 'tm_sent_morning' },
    evening: { start: 22, end: 23, key: 'tm_sent_evening' }
  }
  const PROMPT =
    "what's the one thing you can do today to bring you closer to goals?"

  function todayStr() {
    return new Date().toISOString().slice(0, 10)
  }

  // 2) Persistence checks
  function hasSent(win) {
    const val = localStorage.getItem(win.key)
    console.log(`Checking "${win.key}"`, { stored: val, today: todayStr() })
    return val === todayStr()
  }
  function markSent(win) {
    localStorage.setItem(win.key, todayStr())
    console.log(`Marked "${win.key}" as sent for ${todayStr()}`)
    alert(`Marked "${win.key}" as sent for ${todayStr()}`)
  }

  // 3) Fill & click Send
  function sendPrompt() {
    console.log('Attempting to send prompt…')
    alert('📨 sendPrompt() called')

    // 3a) Find the textarea
    let ta =
      document.querySelector('textarea') ||
      document.querySelector('[data-element-id="chat-input-textarea"]')
    if (!ta) {
      console.error('❌ No chat textarea found!')
      alert('❌ No chat textarea found!')
      return
    }
    console.log('Found textarea:', ta)
    alert('✅ Textarea found')

    // 3b) Fill & dispatch input event
    ta.focus()
    ta.value = PROMPT
    ta.dispatchEvent(new Event('input', { bubbles: true }))
    console.log('Filled textarea with prompt.')

    // 3c) Find and click Send button
    let sendBtn =
      document.querySelector('button[data-element-id="send-button"]') ||
      Array.from(document.querySelectorAll('button')).find(b =>
        /send/i.test(b.innerText)
      )

    if (!sendBtn) {
      console.error('❌ No Send button found!')
      alert('❌ No Send button found!')
      return
    }
    console.log('Found Send button:', sendBtn)
    alert('✅ Send button found; clicking…')

    sendBtn.click()
    console.log('Clicked Send button.')
    alert('✉️ Prompt sent!')
  }

  // 4) Scheduler
  function checkAndMaybeSend() {
    const now = new Date()
    const h = now.getHours()
    console.log(`Checking time: ${now.toLocaleTimeString()}`)

    for (let name of ['morning', 'evening']) {
      const win = WINDOWS[name]
      if (h >= win.start && h < win.end) {
        console.log(`We are in the "${name}" window (${win.start}–${win.end})`)
        if (!hasSent(win)) {
          console.log(`Not yet sent for "${name}" today—sending now.`)
          alert(`Time to send your ${name} prompt!`)
          sendPrompt()
          markSent(win)
        } else {
          console.log(`Already sent "${name}" prompt today.`)
        }
      }
    }
  }

  // Kick off: immediate + every minute
  checkAndMaybeSend()
  setInterval(checkAndMaybeSend, 60_000)
})()
