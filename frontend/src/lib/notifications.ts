// Desktop Notifications, Taskbar Badging, and Title Alert Utility for DayMark

type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

let titleBlinkInterval: NodeJS.Timeout | null = null;
let badgeBlinkInterval: NodeJS.Timeout | null = null;
let originalTitle = typeof document !== 'undefined' ? document.title : 'DayMark';
let isBlinkingTitle = false;
let isBlinkingBadge = false;

// 1. Notification Permission Checks
export const getNotificationPermission = (): NotificationPermissionState => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
};

// 2. Native Desktop Notification (Triggers Windows Toast & Taskbar Flash)
export const showDesktopNotification = (
  title: string,
  body: string,
  options?: { tag?: string; onClick?: () => void; requireInteraction?: boolean }
): Notification | null => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/logo.png',
      badge: '/icon-192x192.png',
      tag: options?.tag || 'daymark-timer-alert',
      requireInteraction: options?.requireInteraction ?? true, // Keeps alert visible in Windows notification center
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      stopAlertBlinks();
      if (options?.onClick) {
        options.onClick();
      }
    };

    return notification;
  } catch (e) {
    console.warn('Desktop notification error:', e);
    return null;
  }
};

// 3. W3C Badging API (Displays active badge directly on Windows Taskbar App Logo)
export const setTaskbarBadge = (count?: number): void => {
  if (typeof navigator === 'undefined') return;
  try {
    const nav = navigator as unknown as { setAppBadge?: (contents?: number) => Promise<void> };
    if (nav.setAppBadge) {
      if (count !== undefined && count > 0) {
        nav.setAppBadge(count).catch(() => null);
      } else {
        nav.setAppBadge().catch(() => null); // Sets a simple dot flag on taskbar
      }
    }
  } catch {
    // Ignore unsupported
  }
};

export const clearTaskbarBadge = (): void => {
  if (typeof navigator === 'undefined') return;
  try {
    const nav = navigator as unknown as { clearAppBadge?: () => Promise<void> };
    if (nav.clearAppBadge) {
      nav.clearAppBadge().catch(() => null);
    }
  } catch {
    // Ignore unsupported
  }
};

// 4. Taskbar Badge Pulsing / Blinking
export const startTaskbarBlink = (durationMs = 15000): void => {
  stopTaskbarBlink();
  if (typeof navigator === 'undefined') return;
  const nav = navigator as unknown as { setAppBadge?: (contents?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
  if (!nav.setAppBadge) return;

  isBlinkingBadge = true;
  let show = true;

  badgeBlinkInterval = setInterval(() => {
    if (show) {
      setTaskbarBadge();
    } else {
      clearTaskbarBadge();
    }
    show = !show;
  }, 800);

  if (durationMs > 0) {
    setTimeout(() => {
      stopTaskbarBlink();
    }, durationMs);
  }
};

export const stopTaskbarBlink = (): void => {
  if (badgeBlinkInterval) {
    clearInterval(badgeBlinkInterval);
    badgeBlinkInterval = null;
  }
  isBlinkingBadge = false;
};

// 4.1 Running Clock Red Dot Blinking Loop (Taskbar Dot + Red Glowing Favicon Dot)
let redDotCanvasUrl: string | null = null;
let baseCanvasUrl: string | null = null;
let runningRedDotInterval: NodeJS.Timeout | null = null;
let isRedDotBlinking = false;

const initRedDotIcons = (): Promise<void> => {
  if (typeof window === 'undefined' || redDotCanvasUrl) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve();
          return;
        }

        // Draw Base Icon
        ctx.drawImage(img, 0, 0, 64, 64);
        baseCanvasUrl = canvas.toDataURL('image/png');

        // Draw Glowing Radiant Red Dot in top-right corner
        // 1. Soft Outer Radiant Halo
        const halo = ctx.createRadialGradient(50, 14, 0, 50, 14, 13);
        halo.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
        halo.addColorStop(0.45, 'rgba(239, 68, 68, 0.5)');
        halo.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.beginPath();
        ctx.arc(50, 14, 13, 0, 2 * Math.PI);
        ctx.fillStyle = halo;
        ctx.fill();

        // 2. Solid Red Core Dot
        ctx.beginPath();
        ctx.arc(50, 14, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#EF4444';
        ctx.fill();

        // 3. Crisp Dark Outer Ring for high contrast
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#050811';
        ctx.stroke();

        // 4. Specular White Highlight
        ctx.beginPath();
        ctx.arc(48, 11, 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

        redDotCanvasUrl = canvas.toDataURL('image/png');
      } catch (err) {
        console.warn('Canvas icon generation notice:', err);
      }
      resolve();
    };
    img.onerror = () => resolve();
    img.src = '/logo.png';
  });
};

export const startRunningRedDotBlink = (enabled = true): void => {
  if (!enabled || typeof window === 'undefined') return;
  if (isRedDotBlinking) return;
  isRedDotBlinking = true;

  initRedDotIcons().then(() => {
    let show = true;
    const update = (state: boolean) => {
      const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || null;
      if (state) {
        setTaskbarBadge(); // Shows dot badge (NO numbers)
        if (link && redDotCanvasUrl) link.href = redDotCanvasUrl;
      } else {
        clearTaskbarBadge(); // Blinks dot off
        if (link && baseCanvasUrl) link.href = baseCanvasUrl;
      }
    };

    update(true);

    if (runningRedDotInterval) clearInterval(runningRedDotInterval);
    runningRedDotInterval = setInterval(() => {
      show = !show;
      update(show);
    }, 850);
  });
};

export const stopRunningRedDotBlink = (): void => {
  if (runningRedDotInterval) {
    clearInterval(runningRedDotInterval);
    runningRedDotInterval = null;
  }
  isRedDotBlinking = false;
  clearTaskbarBadge();
  const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || null;
  if (link) {
    link.href = '/logo.png';
  }
};

// 5. Dynamic Window Title Updates & Blinking Alerts
export const setWindowTitle = (title: string): void => {
  if (typeof document === 'undefined' || isBlinkingTitle) return;
  document.title = title;
};

export const restoreWindowTitle = (): void => {
  stopTitleBlink();
  if (typeof document !== 'undefined') {
    document.title = originalTitle;
  }
};

export const startTitleBlink = (alertTitle: string, secondaryTitle = 'DayMark — Focus Tracker'): void => {
  stopTitleBlink();
  if (typeof document === 'undefined') return;

  originalTitle = document.title || 'DayMark';
  isBlinkingTitle = true;
  let toggle = false;

  document.title = alertTitle;

  titleBlinkInterval = setInterval(() => {
    document.title = toggle ? alertTitle : secondaryTitle;
    toggle = !toggle;
  }, 1000);
};

export const stopTitleBlink = (): void => {
  if (titleBlinkInterval) {
    clearInterval(titleBlinkInterval);
    titleBlinkInterval = null;
  }
  isBlinkingTitle = false;
};

// 6. Stop all alert blinks (when user focuses window or interacts)
export const stopAlertBlinks = (): void => {
  stopTitleBlink();
  stopTaskbarBlink();
  restoreFavicon();
};

// 7. Dynamic Canvas Favicon (Live glowing indicator on browser tab / PWA icon)
let originalFaviconHref: string | null = null;

export const setFaviconLiveDot = (type: 'running' | 'alert' | 'idle'): void => {
  if (typeof document === 'undefined') return;

  const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || null;
  if (!link) return;

  if (!originalFaviconHref) {
    originalFaviconHref = link.href;
  }

  if (type === 'idle') {
    if (originalFaviconHref) link.href = originalFaviconHref;
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    ctx.drawImage(img, 0, 0, 32, 32);

    // Draw live status indicator badge circle
    ctx.beginPath();
    ctx.arc(24, 8, 6, 0, 2 * Math.PI);
    ctx.fillStyle = type === 'alert' ? '#EF4444' : '#10B981'; // Red on alert, Emerald on running
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#050811';
    ctx.stroke();

    link.href = canvas.toDataURL('image/png');
  };
  img.src = originalFaviconHref || '/logo.png';
};

export const restoreFavicon = (): void => {
  if (typeof document === 'undefined' || !originalFaviconHref) return;
  const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || null;
  if (link && originalFaviconHref) {
    link.href = originalFaviconHref;
  }
};
