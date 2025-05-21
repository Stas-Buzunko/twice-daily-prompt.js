// ==UserScript==
// @name         Twice-Daily Prompt Sender (Auto Send)
// @version      0.9
// @description  At 9–12 AM & 10–11 PM: open “Daily” chat, type & send your prompt with tiny delays.
// @match        https://www.typingmind.com/*
// @grant        none
// ==/UserScript==

;(function () {
  console.log('🔧 Twice-Daily Prompt Sender initializing…')

  const WINDOWS = {
    morning: { start: 9, end: 12, key: 'tm_sent_morning' },
    evening: { start: 22, end: 23, key: 'tm_sent_evening' }
  }
  const PROMPT =
    "what's the one thing you can do today to bring you closer to goals?"

  function todayStr() {
    return new Date().toISOString().slice(0, 10)
  }

  function hasSent(win) {
    const v = localStorage.getItem(win.key)
    console.log(`  [${win.key}] stored=${v} today=${todayStr()}`)
    return v === todayStr()
  }

  function markSent(win) {
    localStorage.setItem(win.key, todayStr())
    console.log(`  → marked ${win.key} as sent for ${todayStr()}`)
  }

  function delay(ms) {
    return new Promise(res => setTimeout(res, ms))
  }

  // Click the “Daily” chat in the sidebar
  function navigateToDaily() {
    const sidebar = document.querySelector(
      '[data-element-id="sidebar-middle-part"]'
    )
    if (!sidebar) {
      console.warn('❌ sidebar-middle-part not found')
      return false
    }
    const dailyTab = Array.from(sidebar.querySelectorAll('div.truncate')).find(
      div => div.textContent.trim() === 'Daily'
    )
    if (!dailyTab) {
      console.warn('❌ “Daily” tab not found')
      return false
    }
    dailyTab.click()
    console.log('✅ Clicked “Daily” tab')
    return true
  }

  // Calls React’s internal change handler by using the native property setter.
  function setNativeValue(el, value) {
    const proto = Object.getPrototypeOf(el)
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
    setter.call(el, value)
  }

  // Simulate typing into a React‐controlled textarea
  async function typeReactText(el, text, delayMs = 75) {
    for (let ch of text) {
      const newVal = el.value + ch
      setNativeValue(el, newVal)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      await delay(delayMs)
    }
  }

  async function sendPromptSequence(win) {
    await delay(200) // wait for chat pane
    const ta = document.getElementById('chat-input-textbox')
    if (!ta) return console.error('❌ textarea not found')

    ta.focus()
    await delay(100)

    console.log('✍️ Typing prompt…')
    await typeReactText(ta, PROMPT, 50)

    await delay(100)
    const sendBtn = document.querySelector(
      'button[data-element-id="send-button"]'
    )
    if (!sendBtn) return console.error('❌ send button not found')

    console.log('✅ Clicking Send…')
    sendBtn.click()

    await delay(100)
    console.log('✉️ Prompt sent.')
    markSent(win)
  }

  // Main check routine
  async function checkAndMaybeSend() {
    const now = new Date()
    const h = now.getHours()
    console.log(`\n⏱️ check at ${now.toLocaleTimeString()}`)

    for (let name of ['morning', 'evening']) {
      const win = WINDOWS[name]
      if (h >= win.start && h < win.end) {
        console.log(`• In ${name} window (${win.start}–${win.end})`)
        if (!hasSent(win)) {
          console.log(`  → Not yet sent for ${name}.`)

          await delay(3000)
          if (navigateToDaily()) {
            sendPromptSequence(win).catch(err =>
              console.error('Error in send sequence:', err)
            )
          } else {
            console.log('    💡 Aborting: “Daily” tab not found.')
          }
        } else {
          console.log(`  → Already sent your ${name} prompt today.`)
        }
      }
    }
  }

  // Kick-off: run immediately + every minute
  checkAndMaybeSend()
  setInterval(checkAndMaybeSend, 60_000)
})()
