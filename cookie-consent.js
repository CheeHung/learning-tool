(function () {
  const STORAGE_KEY = 'cookie_consent';

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #cc-banner {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: #0d1b2a;
      border-top: 1px solid #2a3a5e;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #9098b0;
      transform: translateY(100%);
      transition: transform 0.35s ease;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.4);
    }
    #cc-banner.visible { transform: translateY(0); }
    #cc-banner p { margin: 0; line-height: 1.6; flex: 1; min-width: 220px; }
    #cc-banner a { color: #00e5a0; text-decoration: none; }
    #cc-banner a:hover { text-decoration: underline; }
    #cc-buttons { display: flex; gap: 10px; flex-shrink: 0; }
    #cc-accept {
      padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer;
      background: #00e5a0; color: #0c0f1a; font-size: 13px; font-weight: 700;
      transition: opacity 0.15s;
    }
    #cc-accept:hover { opacity: 0.85; }
    #cc-decline {
      padding: 8px 20px; border-radius: 6px; border: 1px solid #2a3a5e; cursor: pointer;
      background: transparent; color: #7986a8; font-size: 13px; font-weight: 600;
      transition: border-color 0.15s, color 0.15s;
    }
    #cc-decline:hover { border-color: #7986a8; color: #c8d0e0; }
    #cc-settings-link {
      font-size: 11px; color: #3a4060; text-decoration: none;
      cursor: pointer; display: inline-block; margin-top: 4px;
    }
    #cc-settings-link:hover { color: #7986a8; }
  `;
  document.head.appendChild(style);

  function getConsent() {
    return localStorage.getItem(STORAGE_KEY); // 'accepted' | 'declined' | null
  }

  function setConsent(value) {
    localStorage.setItem(STORAGE_KEY, value);
  }

  function loadAdScripts() {
    // Called when user accepts cookies.
    // Replace the data-ad-client value with your real AdSense publisher ID
    // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
    if (document.querySelector('script[data-cc-ads]')) return; // already loaded
    const s = document.createElement('script');
    s.setAttribute('data-cc-ads', '1');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX';
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }

  function hideBanner() {
    const b = document.getElementById('cc-banner');
    if (b) {
      b.classList.remove('visible');
      setTimeout(() => b.remove(), 400);
    }
  }

  function showBanner() {
    const banner = document.createElement('div');
    banner.id = 'cc-banner';
    banner.innerHTML = `
      <p>
        We use cookies to serve ads and understand how visitors use this site.
        By clicking <strong>"Accept All"</strong> you consent to our use of cookies as described in our
        <a href="/privacy.html">Privacy Policy</a>.
      </p>
      <div id="cc-buttons">
        <button id="cc-decline">Decline</button>
        <button id="cc-accept">Accept All</button>
      </div>
    `;
    document.body.appendChild(banner);

    // Animate in after a short delay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => banner.classList.add('visible'));
    });

    document.getElementById('cc-accept').onclick = function () {
      setConsent('accepted');
      hideBanner();
      loadAdScripts();
      addSettingsLink();
    };

    document.getElementById('cc-decline').onclick = function () {
      setConsent('declined');
      hideBanner();
      addSettingsLink();
    };
  }

  function addSettingsLink() {
    // Add a small "Cookie settings" link to the footer so users can change their mind
    const footer = document.querySelector('footer');
    if (!footer || document.getElementById('cc-settings-link')) return;
    const link = document.createElement('div');
    link.style.marginTop = '6px';
    link.innerHTML = `<a id="cc-settings-link" onclick="window.__resetCookieConsent()">Cookie settings</a>`;
    footer.appendChild(link);
  }

  // Expose reset function so settings link works
  window.__resetCookieConsent = function () {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  };

  // On page load
  const consent = getConsent();
  if (consent === 'accepted') {
    loadAdScripts();
    addSettingsLink();
  } else if (consent === 'declined') {
    addSettingsLink();
  } else {
    // No prior choice — show banner after slight delay so page renders first
    window.addEventListener('load', function () {
      setTimeout(showBanner, 800);
    });
  }
})();
