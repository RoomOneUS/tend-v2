/* Clinician Mobile surface */
(function () {
  const root = () => document.getElementById('cm-root');
  const nav = { screen: 'home', overlay: null, patientSub: 'sessions' }; // screens: home, settings, integrations, aiScribe, patient. patientSub: sessions | alerts
  window.cmNav = nav;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function pushBanners() {
    if (!S.cmPush.length) return '';
    return S.cmPush.map(p => `
      <div class="push-banner ${p.urgent ? 'urgent' : ''}" data-go-patient>
        <div class="pi">${p.urgent ? '<i data-lucide="triangle-alert"></i>' : '<i data-lucide="bell"></i>'}</div>
        <div class="pb">
          <div class="pt">Tend · ${p.urgent ? 'URGENT' : 'Notification'}</div>
          <div class="pm">${esc(p.text)}</div>
        </div>
        <div class="ptime">now</div>
      </div>
    `).join('');
  }

  function home() {
    const lockChip = S.patientApp.locked ? `<span class="chip red">URGENT</span>` : '';
    const count = S.cmPush.length + (S.patientApp.locked ? 1 : 0) || (S.activity.find(a => !a.read) ? 1 : 0);
    return `
      <div class="screen">
        <div class="appbar">
          <div>
            <h2>Patients</h2>
            <div class="small muted">1 patient</div>
          </div>
          <div class="row gap-2">
            <button class="iconbtn"><i data-lucide="bell"></i></button>
            <button class="iconbtn" data-cm-go="settings"><i data-lucide="settings"></i></button>
          </div>
        </div>
        ${pushBanners()}
        <div class="search"><span><i data-lucide="search"></i></span><input placeholder="Search by name or tag" /></div>
        <div class="list">
          <div class="row-item" data-cm-go="patient">
            <div class="avatar sarah">CV</div>
            <div class="body">
              <div class="title row gap-2">Chen V ${S.patientApp.locked ? lockChip : `<span class="chip amber">PTSD</span>`}</div>
              <div class="meta">${S.patientApp.locked ? 'Journal entry flagged · just now' : 'Shared 3 new data points · 14m'}</div>
            </div>
            ${count ? `<div class="badge-count">${count}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function settings() {
    return `
      <div class="screen">
        <div class="appbar">
          <button class="back" data-cm-back><i data-lucide="chevron-left"></i></button>
          <div class="center-title">Settings</div>
          <span style="width:28px"></span>
        </div>
        <div class="list">
          <div class="row-item">
            <div class="avatar rachel">${S.clinician.initials}</div>
            <div class="body">
              <div class="title">${esc(S.clinician.name)}</div>
              <div class="meta">${esc(S.clinician.role)}<br/>${esc(S.clinician.email)}</div>
            </div>
            <div><i data-lucide="chevron-right"></i></div>
          </div>
        </div>
        <div class="section-label">Preferences</div>
        <div class="list">
          <div class="row-item" data-cm-go="integrations">
            <div class="avatar sm" style="background:#1f2937;color:white"><i data-lucide="settings"></i></div>
            <div class="body">
              <div class="title">Integrations</div>
              <div class="meta">1 connected · AI Scribe</div>
            </div>
            <div><i data-lucide="chevron-right"></i></div>
          </div>
        </div>
        <div class="dim small" style="text-align:center;padding:16px">More settings coming after POC</div>
      </div>
    `;
  }

  function integrations() {
    return `
      <div class="screen">
        <div class="appbar">
          <button class="back" data-cm-back><i data-lucide="chevron-left"></i></button>
          <div class="center-title">Integrations</div>
          <span style="width:28px"></span>
        </div>
        <div style="padding:0 18px 8px" class="small muted">Connect tools to surface session data automatically.</div>
        <div class="section-label">Connected</div>
        <div class="list">
          <div class="row-item" data-cm-go="aiScribe">
            <div class="avatar sm" style="background:#0f172a;color:white"><i data-lucide="mic"></i></div>
            <div class="body">
              <div class="title row gap-2">AI Scribe <span class="chip green">Connected</span></div>
              <div class="meta">Captures transcript, notes, raw recording</div>
            </div>
            <div><i data-lucide="chevron-right"></i></div>
          </div>
        </div>
        <div class="section-label">Coming soon</div>
        <div class="list">
          <div class="row-item">
            <div class="avatar sm" style="background:#dbeafe;color:#1d4ed8"><i data-lucide="calendar"></i></div>
            <div class="body"><div class="title">Google Calendar</div></div>
          </div>
          <div class="row-item">
            <div class="avatar sm" style="background:#e0e7ff;color:#4338ca"><i data-lucide="video"></i></div>
            <div class="body"><div class="title">Zoom</div></div>
          </div>
        </div>
      </div>
    `;
  }

  function aiScribe() {
    return `
      <div class="screen">
        <div class="appbar">
          <button class="back" data-cm-back><i data-lucide="chevron-left"></i></button>
          <div class="center-title">AI Scribe</div>
          <span style="width:28px"></span>
        </div>
        <div style="text-align:center; padding:18px 14px 8px;">
          <div class="avatar lg" style="background:#0f766e;color:white;margin:0 auto"><i data-lucide="mic"></i></div>
          <div style="font-size:18px;font-weight:700;margin-top:10px">AI Scribe</div>
          <div style="margin-top:4px"><span class="chip green">Connected</span></div>
          <div class="small muted" style="margin-top:10px;line-height:1.5">Captures sessions live and sends them<br/>to Tend for analysis.</div>
        </div>
        <div class="section-label">Data this integration will surface</div>
        <div class="list">
          <div class="row-item"><div class="avatar sm" style="background:#ecfdf5;color:#047857"><i data-lucide="file-text"></i></div><div class="body"><div class="title">Transcription</div><div class="meta">Full session transcript with speaker labels</div></div></div>
          <div class="row-item"><div class="avatar sm" style="background:#ecfeff;color:#0e7490"><i data-lucide="notebook-pen"></i></div><div class="body"><div class="title">Notes</div><div class="meta">AI-drafted structured note fields</div></div></div>
          <div class="row-item"><div class="avatar sm" style="background:#fdf4ff;color:#a21caf"><i data-lucide="audio-lines"></i></div><div class="body"><div class="title">Raw recording</div><div class="meta">Stored securely · accessible for re-listening</div></div></div>
        </div>
      </div>
    `;
  }

  function patient() {
    const lockBanner = S.patientApp.locked ? `
      <div class="upload-card" style="border-color:#fecaca;background:#fff1f2">
        <div class="row gap-2" style="margin-bottom:6px"><div class="avatar sm" style="background:#dc2626;color:white"><i data-lucide="triangle-alert"></i></div>
          <div><div class="bold">URGENT — App locked</div><div class="small muted">${esc(S.patientApp.lockReason || 'Self-harm language detected · 2 min ago')}</div></div>
        </div>
        ${S.patientApp.lockQuote ? `<div style="padding:10px;background:white;border:1px solid #fecaca;border-radius:10px;font-size:12px;font-style:italic;line-height:1.5;margin-top:6px">"${esc(S.patientApp.lockQuote)}"</div>` : ''}
        <div class="small muted" style="margin-top:8px"><i data-lucide="book-open"></i> Journal entry · "Reflections"</div>
        <div class="row gap-2" style="margin-top:10px">
          <button class="btn block sm" data-cm-action="message"><i data-lucide="message-square"></i> Message Chen</button>
          <button class="btn block sm primary" data-cm-action="unlock"><i data-lucide="lock-open"></i> Unlock app</button>
        </div>
      </div>
    ` : '';

    const alerts = (S.activity || []).filter(a => a.type === 'urgent' || a.type === 'message');
    const unreadCount = alerts.filter(a => !a.read).length;
    const sub = nav.patientSub || 'sessions';

    const alertCard = a => {
      const isMsg = a.type === 'message';
      const isUrgent = !!a.urgent;
      const unread = !a.read;
      const iconName = isMsg ? 'message-circle' : (isUrgent ? 'shield-alert' : 'triangle-alert');
      const iconBg = isMsg ? 'background:#dbeae3;color:#0f766e'
                   : isUrgent ? 'background:#fee2e2;color:#b91c1c'
                              : 'background:#ffedd5;color:#c2410c';
      const borderColor = isUrgent && !isMsg ? '#fecaca' : '#eef2f1';
      return `
        <div class="cm-alert ${unread ? 'unread' : 'read'}" style="border-color:${borderColor}" ${unread ? `data-cm-alert-dismiss="${esc(a.id)}"` : ''}>
          <div class="avatar sm" style="${iconBg}"><i data-lucide="${iconName}"></i></div>
          <div class="body">
            <div class="cm-alert-head">
              <div class="title">${esc(a.title)}${unread ? '<span class="cm-alert-dot"></span>' : ''}</div>
              <div class="cm-alert-time">${esc(a.t)}</div>
            </div>
            ${a.meta ? `<div class="meta">${esc(a.meta)}</div>` : ''}
            ${unread ? `<div class="cm-alert-hint">Tap to dismiss</div>` : ''}
          </div>
        </div>
      `;
    };

    const sessionsView = `
      <div class="upload-card">
        <div class="head"><h4>Upload session</h4><span class="chip green">Connected</span></div>
        <p>Capture a session via your AI Scribe integration. The recording, transcription and notes will sync to the web app.</p>
        <div class="integration-row">
          <div class="ic"><i data-lucide="mic"></i></div>
          <div class="meta"><div class="t">AI Scribe</div><div class="s">Transcription · Notes · Raw recording</div></div>
          <div><i data-lucide="chevron-right"></i></div>
        </div>
        <button class="btn primary block" data-cm-action="start-upload"><i data-lucide="plus"></i> Start new session</button>
      </div>
      <div class="section-label">Recent sessions</div>
      <div class="list" style="padding-bottom:24px">
        ${S.sessions.slice().reverse().map(s => `
          <div class="row-item">
            <div class="avatar sm" style="background:#eef2ff;color:#4f46e5"><i data-lucide="file-text"></i></div>
            <div class="body"><div class="title">Session #${s.num} · ${esc(s.date)}</div><div class="meta">Uploaded Successfully</div></div>
            <div><i data-lucide="chevron-right"></i></div>
          </div>
        `).join('')}
      </div>
    `;

    const alertsView = `
      <div class="section-label">Recent alerts</div>
      <div class="cm-alert-list" style="padding-bottom:24px">
        ${alerts.length
          ? alerts.map(alertCard).join('')
          : `<div class="cm-empty">No alerts. Escalations and new messages will show up here.</div>`}
      </div>
    `;

    return `
      <div class="screen cm-patient-screen">
        <div class="appbar">
          <button class="back" data-cm-back><i data-lucide="chevron-left"></i></button>
          <div class="center-title">Patient</div>
          <button class="iconbtn"><i data-lucide="ellipsis"></i></button>
        </div>
        <div class="profile-hero">
          <div class="avatar lg sarah">CV</div>
          <div class="name">${esc(S.patient.name)}</div>
          <div class="sub">Patient · ${esc(S.patient.sinceLabelShort)}</div>
          <div class="tag-row">
            ${S.patient.tags.map(t => `<span class="chip ${t==='PTSD'?'amber':'blue'}">${esc(t)}</span>`).join('')}
          </div>
        </div>
        ${lockBanner}
        <div class="cm-subseg">
          <button class="${sub==='sessions'?'active':''}" data-cm-sub="sessions">Sessions</button>
          <button class="${sub==='alerts'?'active':''}" data-cm-sub="alerts">
            Alerts${unreadCount ? ` <span class="cm-subseg-badge">${unreadCount}</span>` : ''}
          </button>
        </div>
        ${sub === 'alerts' ? alertsView : sessionsView}
      </div>
    `;
  }

  // Overlays
  function pasteSheet() {
    return `
      <div class="sheet-backdrop" data-cm-overlay-close>
        <div class="sheet" onclick="event.stopPropagation()">
          <div class="grabber"></div>
          <h4>Paste transcription</h4>
          <p class="small">POC mock — in production the app pulls the recording automatically.</p>
          <textarea id="cm-transcript" placeholder="Therapist: How have you been sleeping this week?
Chen: It's been rough. I think I got to sleep around 1 most nights..."></textarea>
          <div class="small muted" style="margin-top:8px"><i data-lucide="file-text"></i> Session #13 · Chen V · today</div>
          <div class="actions">
            <button class="btn" data-cm-overlay-close>Cancel</button>
            <button class="btn primary" data-cm-action="upload-confirm"><i data-lucide="upload"></i> Upload session</button>
          </div>
        </div>
      </div>`;
  }
  function uploadOk() {
    return `
      <div class="status-overlay" data-cm-overlay-close>
        <div class="status-card" onclick="event.stopPropagation()">
          <div class="icon-circle ok"><i data-lucide="check"></i></div>
          <h4>Session uploaded</h4>
          <p>Pushed to the web app for processing. Notes will appear within a few minutes.</p>
          <div class="divider"></div>
          <div class="kv-row"><span class="muted">Session</span><span class="bold">#${S.sessions[S.sessions.length-1].num} · today 14:00</span></div>
          <div class="kv-row"><span class="muted">Source</span><span class="bold" style="color:var(--primary)"><i data-lucide="share-2"></i> AI Scribe (pasted)</span></div>
          <button class="btn primary block" style="margin-top:14px" data-cm-overlay-close>Done</button>
          <button class="btn block" style="margin-top:8px" data-cm-action="start-upload"><i data-lucide="plus"></i> Upload another</button>
        </div>
      </div>`;
  }
  function uploadFail() {
    return `
      <div class="status-overlay" data-cm-overlay-close>
        <div class="status-card" onclick="event.stopPropagation()">
          <div class="icon-circle bad"><i data-lucide="triangle-alert"></i></div>
          <h4>Upload failed</h4>
          <p>We couldn't reach the web app. Your transcript is saved locally — try again when you're back online.</p>
          <div style="padding:10px;background:#fff1f2;border:1px solid #fecaca;border-radius:10px;text-align:left">
            <div class="row between"><span class="bold small" style="color:#991b1b"><i data-lucide="wifi-off"></i> Network error</span><span class="small dim">NET_TIMEOUT</span></div>
            <div class="small" style="color:#7f1d1d;margin-top:4px">Request to api.tend.health timed out after 30s</div>
          </div>
          <button class="btn primary block" style="margin-top:12px" data-cm-action="upload-retry"><i data-lucide="refresh-cw"></i> Try again</button>
          <button class="btn block" style="margin-top:8px" data-cm-overlay-close>Save and exit</button>
        </div>
      </div>`;
  }

  // History stack — back button always returns to the previous screen.
  const history = [];
  let navigating = false;
  function snapshot() { return nav.screen; }
  function pushHistory() {
    const s = snapshot();
    if (history[history.length-1] === s) return;
    history.push(s);
  }
  function goBack() {
    if (history.length <= 1) return;
    history.pop();
    const prev = history[history.length-1];
    navigating = true;
    nav.screen = prev;
    nav.overlay = null;
    render();
    navigating = false;
  }
  window.cmGoBack = goBack;

  function loginScreen() {
    const err = S.auth.clinicianMobile === 'login-error';
    return `
      <div class="auth-screen">
        <div class="auth-body">
          <div class="auth-brand"><span class="logo">T</span><span>Tend</span></div>
          <div class="auth-title">${err?'Sign in':'Welcome back'}</div>
          <div class="auth-sub">${err?'Use the credentials you set up on the website.':'Sign in to your clinician account.'}</div>
          ${err?`
            <div class="auth-error">
              <i data-lucide="triangle-alert"></i>
              <div>
                <div class="bold">Incorrect email or password</div>
                <div class="small">Make sure your account onboarding on the website is complete.</div>
              </div>
            </div>`:''}
          <div class="auth-field">
            <label>Email</label>
            <div class="auth-input ${err?'err':''}"><i data-lucide="mail"></i><input type="email" placeholder="shari@tend.health" value="shari@tend.health" /></div>
          </div>
          <div class="auth-field">
            <label>Password</label>
            <div class="auth-input ${err?'err':''}"><i data-lucide="lock"></i><input type="password" value="••••••••••" /><i data-lucide="eye" class="trail"></i></div>
          </div>
          <div class="auth-row-end"><a class="auth-link" data-cm-action="auth-forgot">Forgot password?</a></div>
          <button class="auth-primary" data-cm-action="auth-login">Sign in</button>
          <div class="auth-divider"><span class="line"></span><span class="lbl">or continue with</span><span class="line"></span></div>
          <div class="auth-social">
            <button class="auth-secondary" data-cm-action="auth-social" data-provider="google"><i data-lucide="globe"></i> Google</button>
            <button class="auth-secondary" data-cm-action="auth-social" data-provider="apple"><i data-lucide="apple"></i> Apple</button>
          </div>
          <div class="auth-footer">New here? <a class="auth-link" data-cm-action="auth-website">Create an account on the website</a></div>
        </div>
      </div>`;
  }

  function render() {
    const r = root();
    if (!r) return;
    if (!navigating) pushHistory();
    let html = '';
    if (S.auth.clinicianMobile !== 'in') {
      html = loginScreen();
      r.innerHTML = html;
      bindCm(r);
      if (window.lucide) lucide.createIcons();
      return;
    }
    if (nav.screen === 'home') html = home();
    else if (nav.screen === 'settings') html = settings();
    else if (nav.screen === 'integrations') html = integrations();
    else if (nav.screen === 'aiScribe') html = aiScribe();
    else if (nav.screen === 'patient') html = patient();
    if (nav.overlay === 'paste') html += pasteSheet();
    if (nav.overlay === 'ok')    html += uploadOk();
    if (nav.overlay === 'fail')  html += uploadFail();
    r.innerHTML = html;
    bindCm(r);
    if (window.lucide) lucide.createIcons();
    const screen = r.querySelector('.cm-patient-screen');
    if (screen) {
      const update = () => screen.classList.toggle('cm-hero-collapsed', screen.scrollTop > 24);
      screen.addEventListener('scroll', update, { passive: true });
      update();
    }
  }

  function bindCm(r) {
    r.querySelectorAll('[data-cm-go]').forEach(b => b.onclick = () => { nav.screen = b.dataset.cmGo; nav.overlay = null; render(); });
    r.querySelectorAll('[data-cm-back]').forEach(b => b.onclick = () => goBack());
    r.querySelectorAll('[data-go-patient]').forEach(b => b.onclick = () => { nav.screen = 'patient'; nav.overlay = null; S.cmPush = []; bus.emit(); });
    r.querySelectorAll('[data-cm-overlay-close]').forEach(b => b.onclick = () => { nav.overlay = null; render(); });
    r.querySelectorAll('[data-cm-sub]').forEach(b => b.onclick = () => { nav.patientSub = b.dataset.cmSub; render(); });
    r.querySelectorAll('[data-cm-alert-dismiss]').forEach(b => b.onclick = () => {
      const a = S.activity.find(x => x.id === b.dataset.cmAlertDismiss);
      if (a) { a.read = true; bus.emit(); }
    });
    r.querySelectorAll('[data-cm-action]').forEach(b => b.onclick = () => {
      const a = b.dataset.cmAction;
      if (a === 'start-upload') { nav.overlay = 'paste'; render(); }
      if (a === 'upload-confirm') {
        const t = document.getElementById('cm-transcript');
        const text = (t?.value || '').trim();
        if (!text) { notify('Paste a transcription first'); return; }
        // 12% chance of failure for demo
        if (Math.random() < 0.10) { nav.overlay = 'fail'; render(); return; }
        // create new session
        const num = (S.sessions[S.sessions.length-1]?.num || 12) + 1;
        S.sessions.push({ id:'s'+num, num, date:'today', duration:'-', src:'AI Scribe (mobile)',
          stages:{raw:true, note:false, assessment:false, plan:false},
          note:{ presenting:text.split('\n').slice(0,3).join(' '), interventions:'', homework:'' }, planVersion: 'v'+S.txPlan.currentVersion, transcript:text });
        addActivity({ type:'session', t:'now', title:`Session #${num} uploaded`, meta:'From mobile · awaiting note' });
        notify(`Session #${num} pushed to web app`);
        nav.overlay = 'ok';
        render();
      }
      if (a === 'upload-retry') { nav.overlay = 'paste'; render(); }
      if (a === 'unlock') {
        S.patientApp.locked = false; S.patientApp.lockReason = null; S.patientApp.lockQuote = null;
        addActivity({ type:'system', t:'now', title:'App unlocked', meta:'Shari Kaplan cleared the safety lockup for Chen.' });
        notify('Patient app unlocked');
        bus.emit();
      }
      if (a === 'message') {
        window.cwNav.screen = 'messaging'; bus.emit();
        notify('Open Clinician Web to continue the chat');
      }
      if (a === 'auth-login') {
        const email = r.querySelector('.auth-input input[type="email"]')?.value || '';
        const pw = r.querySelectorAll('.auth-input input')[1]?.value || '';
        if (email === 'shari@tend.health' && pw && pw !== '') {
          S.auth.clinicianMobile = 'in';
          nav.screen = 'home';
          notify('Signed in to Tend');
          bus.emit();
        } else {
          S.auth.clinicianMobile = 'login-error';
          render();
        }
      }
      if (a === 'auth-forgot') notify('Password reset would be sent (POC stub)');
      if (a === 'auth-website') notify('In production this opens the Tend signup website');
      if (a === 'auth-social') {
        const prov = b.dataset.provider;
        notify(`${prov === 'apple' ? 'Apple' : 'Google'} sign-in would open here (POC stub)`);
        S.auth.clinicianMobile = 'in';
        nav.screen = 'home';
        bus.emit();
      }
    });
  }

  window.renderClinicianMobile = render;
})();
