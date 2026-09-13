(function () {
  'use strict';

  const ICONS = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i'
  };

  const COLORS = {
    success: '#1f7a3f',
    error: '#9d2338',
    warning: '#b45309',
    info: '#801c32'
  };

  let container = null;

  function ensureContainer() {
    if (container && document.body.contains(container)) return container;
    container = document.createElement('div');
    container.id = 'app-notifications';
    container.setAttribute('aria-live', 'polite');
    container.style.cssText = [
      'position:fixed',
      'top:16px',
      'left:16px',
      'z-index:20000',
      'display:flex',
      'flex-direction:column',
      'gap:10px',
      'max-width:min(420px, calc(100vw - 32px))',
      'pointer-events:none',
      'direction:rtl'
    ].join(';');
    document.body.appendChild(container);
    return container;
  }

  function show(type, message, duration) {
    const text = String(message || '').trim();
    if (!text) return;

    const root = ensureContainer();
    const toast = document.createElement('div');
    toast.className = `app-notification app-notification-${type}`;
    toast.style.cssText = [
      'pointer-events:auto',
      'display:flex',
      'align-items:flex-start',
      'gap:10px',
      'padding:12px 14px',
      'border-radius:10px',
      'background:#fff',
      'color:#1a1a1a',
      `border:1px solid ${COLORS[type] || COLORS.info}`,
      'box-shadow:0 8px 24px rgba(0,0,0,0.12)',
      'font-family:Cairo,Segoe UI,Tahoma,sans-serif',
      'font-size:14px',
      'line-height:1.5',
      'opacity:0',
      'transform:translateY(-8px)',
      'transition:opacity .2s ease, transform .2s ease'
    ].join(';');

    const icon = document.createElement('span');
    icon.textContent = ICONS[type] || ICONS.info;
    icon.style.cssText = [
      'flex:0 0 auto',
      'width:22px',
      'height:22px',
      'border-radius:50%',
      'display:inline-flex',
      'align-items:center',
      'justify-content:center',
      'font-weight:700',
      'font-size:12px',
      'color:#fff',
      `background:${COLORS[type] || COLORS.info}`
    ].join(';');

    const body = document.createElement('span');
    body.textContent = text;
    body.style.flex = '1';

    toast.appendChild(icon);
    toast.appendChild(body);
    root.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    const ttl = Number(duration) > 0 ? Number(duration) : (type === 'error' ? 6000 : 4000);
    window.setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      window.setTimeout(() => toast.remove(), 200);
    }, ttl);
  }

  const api = {
    success: (message, duration) => show('success', message, duration),
    error: (message, duration) => show('error', message, duration),
    warning: (message, duration) => show('warning', message, duration),
    info: (message, duration) => show('info', message, duration)
  };

  window.notifications = api;
})();
