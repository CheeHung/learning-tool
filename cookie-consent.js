(function () {
  const PUB = 'ca-pub-4966180722844808';
  const STORAGE_KEY = 'cc_consent_v2';

  // gtag dataLayer bridge — works before gtag.js loads
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }

  function saveConsent(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  function applyConsent(obj) {
    gtag('consent', 'update', {
      ad_storage:         obj.ads           ? 'granted' : 'denied',
      ad_user_data:       obj.ads           ? 'granted' : 'denied',
      ad_personalization: obj.personalized  ? 'granted' : 'denied',
      analytics_storage:  obj.analytics     ? 'granted' : 'denied',
    });
    if (obj.ads) loadAdScript();
  }

  function loadAdScript() {
    if (document.querySelector('script[data-cc-ads]')) return;
    const s = document.createElement('script');
    s.setAttribute('data-cc-ads', '1');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + PUB;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #cc-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.55);
      z-index: 10000; display: flex; align-items: flex-end; justify-content: center;
      opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
    }
    #cc-overlay.visible { opacity: 1; pointer-events: all; }

    #cc-banner {
      width: 100%; max-width: 680px; margin: 0 16px 24px;
      background: #111827; border: 1px solid #1f2d47;
      border-radius: 16px; padding: 28px 28px 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px; color: #9098b0;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6);
      transform: translateY(16px); transition: transform 0.3s ease;
    }
    #cc-overlay.visible #cc-banner { transform: translateY(0); }

    #cc-banner h3 {
      margin: 0 0 10px; font-size: 15px; font-weight: 700; color: #e8eaf6;
    }
    #cc-banner p { margin: 0 0 20px; line-height: 1.6; }
    #cc-banner a { color: #00e5a0; text-decoration: none; }
    #cc-banner a:hover { text-decoration: underline; }

    #cc-buttons {
      display: flex; gap: 10px; flex-wrap: wrap;
    }
    .cc-btn {
      flex: 1; min-width: 120px; padding: 10px 16px; border-radius: 8px;
      border: none; cursor: pointer; font-size: 13px; font-weight: 600;
      transition: opacity 0.15s, background 0.15s;
      text-align: center;
    }
    #cc-accept { background: #00e5a0; color: #0c0f1a; }
    #cc-accept:hover { opacity: 0.88; }
    #cc-reject { background: transparent; color: #7986a8; border: 1px solid #2a3a5e; }
    #cc-reject:hover { border-color: #7986a8; color: #c8d0e0; }
    #cc-manage-btn { background: transparent; color: #7986a8; border: 1px solid #2a3a5e; }
    #cc-manage-btn:hover { border-color: #7986a8; color: #c8d0e0; }

    /* Manage panel */
    #cc-manage-panel {
      margin-top: 20px; padding-top: 20px; border-top: 1px solid #1f2d47;
      display: none;
    }
    #cc-manage-panel.open { display: block; }
    .cc-toggle-row {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 16px; margin-bottom: 16px;
    }
    .cc-toggle-label { flex: 1; }
    .cc-toggle-label strong { display: block; color: #c8d0e0; font-size: 13px; margin-bottom: 3px; }
    .cc-toggle-label span { font-size: 12px; line-height: 1.5; }

    /* Toggle switch */
    .cc-switch { position: relative; width: 40px; height: 22px; flex-shrink: 0; margin-top: 1px; }
    .cc-switch input { opacity: 0; width: 0; height: 0; }
    .cc-slider {
      position: absolute; inset: 0; background: #2a3a5e;
      border-radius: 22px; cursor: pointer; transition: background 0.2s;
    }
    .cc-slider:before {
      content: ''; position: absolute;
      width: 16px; height: 16px; left: 3px; bottom: 3px;
      background: #fff; border-radius: 50%; transition: transform 0.2s;
    }
    .cc-switch input:checked + .cc-slider { background: #00e5a0; }
    .cc-switch input:checked + .cc-slider:before { transform: translateX(18px); }
    .cc-switch input:disabled + .cc-slider { opacity: 0.5; cursor: not-allowed; }

    #cc-save-prefs {
      width: 100%; padding: 10px; background: #1f2d47; color: #e8eaf6;
      border: 1px solid #2a3a5e; border-radius: 8px; cursor: pointer;
      font-size: 13px; font-weight: 600; margin-top: 4px;
      transition: background 0.15s;
    }
    #cc-save-prefs:hover { background: #2a3a5e; }

    /* Footer settings link */
    #cc-settings-link {
      font-size: 11px; color: #3a4060; cursor: pointer; text-decoration: none;
      display: inline-block; margin-top: 6px;
    }
    #cc-settings-link:hover { color: #7986a8; }

    @media (max-width: 500px) {
      #cc-banner { margin: 0 0 0; border-radius: 16px 16px 0 0; }
      .cc-btn { flex: 1 1 100%; }
    }
  `;
  document.head.appendChild(style);

  // ── Banner HTML ────────────────────────────────────────────────────────────
  function buildBanner(savedPrefs) {
    const adsOn  = savedPrefs ? savedPrefs.ads          : false;
    const persOn = savedPrefs ? savedPrefs.personalized : false;
    const anlOn  = savedPrefs ? savedPrefs.analytics    : false;

    const overlay = document.createElement('div');
    overlay.id = 'cc-overlay';
    overlay.innerHTML = `
      <div id="cc-banner" role="dialog" aria-modal="true" aria-label="Cookie consent">
        <h3>We value your privacy</h3>
        <p>
          We use cookies to serve ads and measure site performance. Visitors in the EEA, UK, and
          Switzerland can choose how their data is used.
          <a href="/privacy.html">Privacy Policy</a>
        </p>
        <div id="cc-buttons">
          <button class="cc-btn" id="cc-accept">Consent</button>
          <button class="cc-btn" id="cc-reject">Do not consent</button>
          <button class="cc-btn" id="cc-manage-btn">Manage options</button>
        </div>

        <div id="cc-manage-panel">
          <div class="cc-toggle-row">
            <div class="cc-toggle-label">
              <strong>Strictly necessary</strong>
              <span>Required for the site to function. Cannot be disabled.</span>
            </div>
            <label class="cc-switch">
              <input type="checkbox" checked disabled>
              <span class="cc-slider"></span>
            </label>
          </div>
          <div class="cc-toggle-row">
            <div class="cc-toggle-label">
              <strong>Advertising cookies</strong>
              <span>Used to serve relevant ads via Google AdSense.</span>
            </div>
            <label class="cc-switch">
              <input type="checkbox" id="cc-t-ads" ${adsOn ? 'checked' : ''}>
              <span class="cc-slider"></span>
            </label>
          </div>
          <div class="cc-toggle-row">
            <div class="cc-toggle-label">
              <strong>Personalised ads</strong>
              <span>Allows Google to personalise ads based on your interests.</span>
            </div>
            <label class="cc-switch">
              <input type="checkbox" id="cc-t-pers" ${persOn ? 'checked' : ''}>
              <span class="cc-slider"></span>
            </label>
          </div>
          <div class="cc-toggle-row">
            <div class="cc-toggle-label">
              <strong>Analytics</strong>
              <span>Helps us understand how visitors use the site.</span>
            </div>
            <label class="cc-switch">
              <input type="checkbox" id="cc-t-analytics" ${anlOn ? 'checked' : ''}>
              <span class="cc-slider"></span>
            </label>
          </div>
          <button id="cc-save-prefs">Save my preferences</button>
        </div>
      </div>
    `;
    return overlay;
  }

  function hideOverlay() {
    const o = document.getElementById('cc-overlay');
    if (!o) return;
    o.classList.remove('visible');
    setTimeout(() => o.remove(), 350);
  }

  function showBanner(savedPrefs) {
    const overlay = buildBanner(savedPrefs);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('visible')));

    document.getElementById('cc-accept').onclick = function () {
      const prefs = { ads: true, personalized: true, analytics: true };
      saveConsent(prefs);
      applyConsent(prefs);
      hideOverlay();
      addSettingsLink();
    };

    document.getElementById('cc-reject').onclick = function () {
      const prefs = { ads: false, personalized: false, analytics: false };
      saveConsent(prefs);
      applyConsent(prefs);
      hideOverlay();
      addSettingsLink();
    };

    document.getElementById('cc-manage-btn').onclick = function () {
      const panel = document.getElementById('cc-manage-panel');
      panel.classList.toggle('open');
      this.textContent = panel.classList.contains('open') ? 'Hide options' : 'Manage options';
    };

    document.getElementById('cc-save-prefs').onclick = function () {
      const prefs = {
        ads:         document.getElementById('cc-t-ads').checked,
        personalized:document.getElementById('cc-t-pers').checked,
        analytics:   document.getElementById('cc-t-analytics').checked,
      };
      saveConsent(prefs);
      applyConsent(prefs);
      hideOverlay();
      addSettingsLink();
    };
  }

  function addSettingsLink() {
    const footer = document.querySelector('footer');
    if (!footer || document.getElementById('cc-settings-link')) return;
    const wrap = document.createElement('div');
    wrap.style.marginTop = '6px';
    wrap.innerHTML = `<a id="cc-settings-link" role="button" tabindex="0">Cookie settings</a>`;
    footer.appendChild(wrap);
    document.getElementById('cc-settings-link').onclick = function () {
      localStorage.removeItem(STORAGE_KEY);
      showBanner(null);
    };
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  const saved = getConsent();
  if (saved) {
    applyConsent(saved);
    addSettingsLink();
  } else {
    window.addEventListener('load', function () {
      setTimeout(function () { showBanner(null); }, 800);
    });
  }

  // Expose for external reset if needed
  window.__resetCookieConsent = function () {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  };
})();
