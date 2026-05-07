(function () {
  'use strict';

  var fab = document.getElementById('chatFab');
  var panel = document.getElementById('chatPanel');
  var closeBtn = document.getElementById('chatCloseBtn');
  var messagesEl = document.getElementById('chatMessages');
  var inputEl = document.getElementById('chatInput');
  var sendBtn = document.getElementById('chatSendBtn');
  var badge = document.getElementById('chatBadge');

  if (!fab || !panel) return;

  var history = [];
  var isOpen = false;
  var isLoading = false;
  var hasUnread = false;

  /* ── toggle panel ── */
  function openPanel() {
    isOpen = true;
    panel.classList.add('is-open');
    fab.classList.add('is-open');
    hideBadge();
    setTimeout(function () { inputEl && inputEl.focus(); }, 250);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('is-open');
    fab.classList.remove('is-open');
  }

  function showBadge() {
    if (!isOpen && badge) {
      badge.classList.add('visible');
      hasUnread = true;
    }
  }

  function hideBadge() {
    if (badge) badge.classList.remove('visible');
    hasUnread = false;
  }

  fab.addEventListener('click', function () {
    isOpen ? closePanel() : openPanel();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closePanel);
  }

  /* ── render message ── */
  function appendMessage(role, text) {
    var isUser = role === 'user';
    var msgEl = document.createElement('div');
    msgEl.className = 'chat-msg ' + (isUser ? 'user' : 'bot');

    var iconEl = document.createElement('div');
    iconEl.className = 'chat-msg-icon';
    iconEl.innerHTML = isUser
      ? '<i class="fas fa-user"></i>'
      : '<i class="fas fa-yarn"></i>';

    var bubbleEl = document.createElement('div');
    bubbleEl.className = 'chat-bubble';
    bubbleEl.textContent = text;

    msgEl.appendChild(iconEl);
    msgEl.appendChild(bubbleEl);
    messagesEl.appendChild(msgEl);
    scrollBottom();
    return msgEl;
  }

  /* ── typing indicator ── */
  var typingEl = null;

  function showTyping() {
    typingEl = document.createElement('div');
    typingEl.className = 'chat-msg bot';
    typingEl.innerHTML =
      '<div class="chat-msg-icon"><i class="fas fa-yarn"></i></div>' +
      '<div class="chat-typing"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(typingEl);
    scrollBottom();
  }

  function hideTyping() {
    if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  /* ── scroll helpers ── */
  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* ── send message ── */
  function sendMessage() {
    if (isLoading) return;
    var text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    setLoading(true);

    appendMessage('user', text);
    history.push({ role: 'user', content: text });

    showTyping();

    var csrf = window.__csrfToken || '';

    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf,
      },
      body: JSON.stringify({
        message: text,
        history: history.slice(0, -1), // send history without the latest user msg
      }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        hideTyping();
        setLoading(false);

        if (data.error) {
          appendMessage('bot', data.error);
          history.pop();
          return;
        }

        var reply = data.reply || '...';
        appendMessage('bot', reply);
        history.push({ role: 'assistant', content: reply });

        if (history.length > 20) {
          history = history.slice(-20);
        }

        if (!isOpen) showBadge();
      })
      .catch(function () {
        hideTyping();
        setLoading(false);
        appendMessage('bot', 'حدث خطأ في الاتصال، يرجى المحاولة مجدداً.');
        history.pop();
      });
  }

  function setLoading(val) {
    isLoading = val;
    sendBtn.disabled = val;
    inputEl.disabled = val;
  }

  /* ── input events ── */
  sendBtn.addEventListener('click', sendMessage);

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  inputEl.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 90) + 'px';
  });
})();
