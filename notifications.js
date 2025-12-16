// نظام الإشعارات
class NotificationSystem {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // انتظار تحميل DOM قبل إنشاء الحاوية
    if (document.body) {
      this.createContainer();
    } else {
      // إذا لم يكن body جاهزاً، انتظر DOMContentLoaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.createContainer());
      } else {
        // إذا كان DOM محملاً بالفعل
        this.createContainer();
      }
    }
  }

  createContainer() {
    // التحقق من عدم وجود الحاوية مسبقاً
    if (document.getElementById('notificationContainer')) {
      this.container = document.getElementById('notificationContainer');
      return;
    }
    
    // إنشاء حاوية الإشعارات
    this.container = document.createElement('div');
    this.container.id = 'notificationContainer';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    
    if (document.body) {
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      background: ${this.getBackgroundColor(type)};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      min-width: 300px;
      max-width: 500px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      font-family: 'Cairo', sans-serif;
      font-weight: 600;
      font-size: 14px;
      line-height: 1.5;
      border-right: 4px solid ${this.getBorderColor(type)};
    `;

    const icon = this.getIcon(type);
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 20px;">${icon}</span>
        <span style="flex: 1;">${this.escapeHtml(message)}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
        ">×</button>
      </div>
    `;

    this.container.appendChild(notification);

    // إزالة تلقائية بعد المدة المحددة
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.style.animation = 'slideOut 0.3s ease-out';
          setTimeout(() => notification.remove(), 300);
        }
      }, duration);
    }

    return notification;
  }

  success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 7000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 6000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  }

  getBackgroundColor(type) {
    const colors = {
      success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    };
    return colors[type] || colors.info;
  }

  getBorderColor(type) {
    const colors = {
      success: '#22c55e',
      error: '#dc2626',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    return colors[type] || colors.info;
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// إضافة CSS للرسوم المتحركة
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// إنشاء مثيل عام - فقط إذا لم يكن موجوداً مسبقاً
if (typeof window.notificationSystem === 'undefined') {
  window.notificationSystem = new NotificationSystem();
}

// إنشاء متغير notifications فقط إذا لم يكن موجوداً
if (typeof notifications === 'undefined') {
  var notifications = window.notificationSystem;
}

