/* Patient Mobile surface */
(function () {
  const root = () => document.getElementById('pm-root');
  const nav = { tab:'today', sub:null, modal:null, calendarMode:'daily', calendarSub:'agenda', journalSel:null, journalTab:'all', journalEditId:null, journalPrefillFromPlan:false, coachView:'chat', voiceOn:true, coachDraft:'' };
  window.pmNav = nav;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function tabbar() {
    const tabs = [
      ['today','Today','<i data-lucide="house"></i>'], ['plan','Plan','<i data-lucide="clipboard-list"></i>'], ['applets','Applets','<i data-lucide="layout-grid"></i>'], ['coach','Coach','<i data-lucide="sparkles"></i>'], ['me','Me','<i data-lucide="user"></i>']
    ];
    return `<div class="tabbar">${tabs.map(([k,l,i]) => `
      <button class="tab ${nav.tab===k?'active':''}" data-pm-tab="${k}">
        <span class="ic">${i}</span><span>${l.toUpperCase()}</span>
      </button>`).join('')}</div>`;
  }

  /* ---------- Today ---------- */
  function today() {
    if (nav.sub === 'progress') return progress();
    return `
      <div class="screen">
        <div class="today-greeting">
          <div class="hi">Good morning,</div>
          <div class="name row between">Chen <span class="avatar md s-pink" data-pm-tab="me" style="cursor:pointer" title="Profile">C</span></div>
        </div>
        ${S.compliance.visibleToPatient ? `
        <div class="compliance-card" data-pm-sub="progress">
          <div class="label">Today's compliance</div>
          <div class="row">
            <div class="score">${S.compliance.value}<span style="font-size:18px;opacity:.8">/100</span></div>
            <div class="delta"><i data-lucide="trending-up"></i> +6 this wk</div>
          </div>
          <div style="margin-top:10px"><div class="progress-bar" style="background:rgba(255,255,255,.2)"><div class="fill" style="background:white;width:${S.compliance.value}%"></div></div></div>
        </div>` : ''}
        <div class="row between" style="padding:0 18px"><div class="bold">Today</div><div class="small dim">Wed, May 27</div></div>
        <div style="margin-top:8px">
          ${S.patientApp.tasks.map(t => `
            <div class="today-task ${t.done?'done':''}" data-pm-task="${t.id}">
              <div class="check">${t.done?'<i data-lucide="check"></i>':''}</div>
              <div class="body">
                <div class="t">${esc(t.title)}</div>
                <div class="m">${esc(t.meta)}</div>
              </div>
              <div class="status">${t.done? (t.doneLabel||'Done') : (t.dim?'On-demand':t.cta || '')}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ${tabbar()}
    `;
  }

  /* ---------- Plan ---------- */
  function plan() {
    const ver = nav.planVersion ?? S.goals.currentVersion;
    const cur = ver === S.goals.currentVersion;
    const v = S.goals.versions[ver];
    const groups = { medication:[], sleep:[], journaling:[], exercise:[] };
    v.rxs.forEach(r => (groups[r.type] = groups[r.type] || []).push(r));
    const order = [['medication','Medication','<i data-lucide="pill"></i>'],['sleep','Sleep','<i data-lucide="moon"></i>'],['journaling','Journaling','<i data-lucide="book-open"></i>'],['exercise','Exercise','<i data-lucide="wind"></i>']];
    return `
      <div class="screen">
        <div class="appbar"><h2>Goals</h2><div class="chip green" data-pm-modal="versions">v${ver} · ${cur?'current':'older'} <i data-lucide="chevron-down"></i></div></div>
        ${!cur ? `<div class="banner amber" style="margin:6px 16px">Viewing v${ver}. No longer active. <button class="btn sm primary" data-pm-action="plan-latest">Return to current</button></div>` : ''}
        ${order.map(([k,label,ic]) => groups[k]?.length ? `
          <div class="rx-group-h"><div class="l">${ic} ${label}</div><div class="c">${groups[k].length}</div></div>
          ${groups[k].map(r => `
            <div class="rx-mobile-card">
              <div class="meta"><i data-lucide="clock"></i> ${esc(r.trigger)}</div>
              <div class="ti">${esc(r.title)}</div>
              ${r.rules?`<div class="rules">${esc(r.rules)}</div>`:''}
              ${r.cta ? `<button class="cta ${k==='medication' && isMedTaken()?'done':''}" data-pm-rx="${r.id}" data-pm-rxtype="${k}">${k==='medication' && isMedTaken()?'<i data-lucide="check"></i> Taken':'<i data-lucide="check"></i> '+esc(r.cta)}</button>` : ''}
            </div>
          `).join('')}
        ` : '').join('')}
      </div>
      ${tabbar()}
      ${nav.modal === 'versions' ? versionsSheet('plan') : ''}
    `;
  }
  function isMedTaken() { return S.patientApp.tasks.find(t => t.kind==='medication')?.done; }

  function versionsSheet(kind) {
    const cur = S.goals.currentVersion;
    const items = Object.keys(S.goals.versions).map(n => parseInt(n)).sort((a,b)=>b-a);
    return `
      <div class="sheet-backdrop" data-pm-modal-close>
        <div class="sheet" onclick="event.stopPropagation()">
          <div class="grabber"></div>
          <h4>Plan history</h4>
          <p class="small">Tap a version to view. Current is what's active.</p>
          ${items.map(n => `
            <div class="row-item" data-pm-action="plan-version" data-v="${n}">
              <div class="avatar sm" style="background:${n===cur?'var(--primary-tint)':'#f1f5f9'};color:${n===cur?'var(--primary)':'#475569'}">v${n}</div>
              <div class="body"><div class="title">Version ${n} ${n===cur?'<span class="chip green">LIVE</span>':''}</div><div class="meta">${n===cur?'Active now':'Older'}</div></div>
              <div><i data-lucide="chevron-right"></i></div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /* ---------- Applets ---------- */
  function applets() {
    if (nav.sub === 'build') return appletsBuild();
    if (nav.sub === 'journal-list') return journalList();
    if (nav.sub === 'journal-new')  return journalNew();
    if (nav.sub === 'journal-view') return journalView();
    if (nav.sub === 'calendar')     return calendar();

    return `
      <div class="screen">
        <div class="appbar"><h2>Applets</h2><button class="iconbtn"><i data-lucide="search"></i></button></div>
        <div class="small dim" style="padding:0 18px 6px">Tools that work with your goals.</div>
        <div class="applet-grid">
          <div class="applet-tile journal" data-pm-sub="journal-list">
            <div class="ic"><i data-lucide="book-open"></i></div><h4>Journal</h4><div class="sub">${S.patientApp.journalEntries.length} entries · 1 due today</div>
          </div>
          <div class="applet-tile calendar" data-pm-sub="calendar">
            <div class="ic"><i data-lucide="calendar"></i></div><h4>Calendar</h4><div class="sub">4 events today</div>
          </div>
          <div class="applet-tile mood">
            <div class="ic"><i data-lucide="smile"></i></div><h4>Mood check-in</h4><div class="sub">Last logged 2h ago</div>
          </div>
          <div class="applet-tile breath">
            <div class="ic"><i data-lucide="wind"></i></div><h4>Breathwork</h4><div class="sub">4-7-8 · 3 min</div>
          </div>
          <div class="applet-tile feature" data-pm-sub="build">
            <div class="ic"><i data-lucide="wand"></i></div><h4>Build your own applet</h4><div class="sub">Describe it in plain language — coming soon</div>
          </div>
        </div>
      </div>
      ${tabbar()}
    `;
  }
  function appletsBuild() {
    return `
      <div class="screen">
        <div class="appbar"><button class="back" data-pm-back><i data-lucide="chevron-left"></i></button><div class="center-title">Build mode</div><span style="width:28px"></span></div>
        <div style="text-align:center;padding:14px">
          <div class="avatar lg" style="background:var(--purple-soft);color:var(--purple);margin:0 auto"><i data-lucide="wand"></i></div>
          <div style="font-size:18px;font-weight:700;margin-top:8px">Make your own applet</div>
          <div><span class="chip purple">Coming soon</span></div>
          <p class="small muted" style="margin-top:8px;line-height:1.5">Describe what you want — a habit tracker, a mood log, a study timer — and Tend will build it for you and wire it into your goals.</p>
        </div>
        <div style="padding:0 16px">
          <div class="kicker">Tell us your idea</div>
          <textarea id="pm-applet-idea" style="width:100%;min-height:120px;padding:10px;border:1px solid var(--line);border-radius:10px;font-family:inherit;font-size:13px;outline:none" placeholder="I'd love an applet that pings me at random times during the day and asks me to rate my anxiety from 1-10..."></textarea>
          <button class="btn block" style="margin-top:10px;background:var(--purple);color:white;border-color:var(--purple)" data-pm-action="submit-applet"><i data-lucide="upload"></i> Submit idea</button>
        </div>
      </div>
      ${tabbar()}
    `;
  }
  function journalList() {
    const due = S.patientApp.tasks.find(t => t.kind==='journaling' && !t.done);
    const tab = nav.journalTab || 'all';
    const tabs = `
      <div class="journal-tabs">
        ${['all','favorites','trash'].map(k => `
          <button class="${tab===k?'active':''}" data-pm-jtab="${k}">
            ${k==='favorites'?'<i data-lucide="star"></i>':''}
            ${k==='trash'?'<i data-lucide="trash-2"></i>':''}
            ${k.charAt(0).toUpperCase()+k.slice(1)}
          </button>`).join('')}
      </div>`;
    const headerBtn = tab==='trash'
      ? '<span style="width:32px"></span>'
      : '<button class="iconbtn" data-pm-newjournal="blank">+</button>';
    if (tab === 'trash') {
      const trash = S.patientApp.journalTrash || [];
      return `
        <div class="screen">
          <div class="appbar"><button class="back" data-pm-back><i data-lucide="chevron-left"></i></button><div class="center-title">Journal</div>${headerBtn}</div>
          ${tabs}
          <div class="journal-hint"><i data-lucide="info"></i> Entries are kept for 7 days then permanently removed</div>
          ${trash.length === 0
            ? `<div class="journal-empty">Trash is empty</div>`
            : trash.map(j => `
              <div class="trash-entry">
                <div class="row between"><div class="title">${esc(j.title)}</div><div class="meta">${esc(j.date)}</div></div>
                <div class="sum">${esc(j.summary)}</div>
                <div class="trash-foot">
                  <div class="countdown ${j.daysLeft<=1?'urgent':''}"><i data-lucide="timer"></i> Auto-deletes in ${j.daysLeft} day${j.daysLeft===1?'':'s'}</div>
                  <div class="acts">
                    <button class="btn xs ghost" data-pm-action="trash-purge" data-id="${j.id}"><i data-lucide="x"></i> Delete</button>
                    <button class="btn xs dark" data-pm-action="trash-restore" data-id="${j.id}"><i data-lucide="rotate-ccw"></i> Restore</button>
                  </div>
                </div>
              </div>`).join('')}
        </div>
        ${tabbar()}
      `;
    }
    let entries = S.patientApp.journalEntries;
    if (tab === 'favorites') entries = entries.filter(j => j.favorite);
    const favHint = tab === 'favorites'
      ? `<div class="journal-hint amber"><i data-lucide="star"></i> ${entries.length} favorited ${entries.length===1?'entry':'entries'} · tap the star on any entry to favorite it</div>`
      : '';
    return `
      <div class="screen">
        <div class="appbar"><button class="back" data-pm-back><i data-lucide="chevron-left"></i></button><div class="center-title">Journal</div>${headerBtn}</div>
        ${tabs}
        ${favHint}
        ${due && tab==='all' ? `
          <div class="due-banner">
            <div class="l"><div class="t">Due today</div><div>3 things you're grateful for</div></div>
            <button data-pm-newjournal="prefill">Open</button>
          </div>` : ''}
        <div class="section-label">Entries</div>
        ${entries.length === 0
          ? `<div class="journal-empty">${tab==='favorites'?'No favorites yet':'No entries yet'}</div>`
          : entries.map(j => `
            <div class="journal-entry" data-pm-journal="${j.id}">
              <div style="flex:1">
                <div class="row between">
                  <div class="title">
                    <button class="star-btn ${j.favorite?'on':''}" data-pm-fav="${j.id}"><i data-lucide="star"></i></button>
                    ${esc(j.title)} ${j.flagged?'<span class="chip red">FLAGGED</span>':''} ${j.shared===false?'<span class="chip gray">NOT SHARED</span>':''}
                  </div>
                  <div class="meta">${esc(j.date)}</div>
                </div>
                <div class="sum">${esc(j.summary)}</div>
              </div>
            </div>`).join('')}
      </div>
      ${tabbar()}
    `;
  }
  function journalNew() {
    const editing = nav.journalEditId ? S.patientApp.journalEntries.find(x => x.id === nav.journalEditId) : null;
    const pre = !editing && nav.journalPrefillFromPlan && S.patientApp.tasks.find(t => t.kind==='journaling' && !t.done);
    const titleVal = editing ? editing.title : (pre ? 'Gratitude — 3 things' : '');
    const bodyVal = editing ? editing.body : '';
    const willShare = editing ? (editing.shared !== false) : isShared('journal');
    const shareChip = willShare
      ? '<i data-lucide="share-2"></i> Shared with Shari Kaplan'
      : '<i data-lucide="eye-off"></i> Not shared with clinician';
    return `
      <div class="screen">
        <div class="appbar"><button class="back" data-pm-action="cancel-edit"><i data-lucide="chevron-left"></i></button><div class="center-title">${editing?'Edit entry':'New entry'}</div><button class="btn sm primary" data-pm-action="save-journal">Save</button></div>
        ${pre ? `<div class="banner purple" style="margin:6px 16px"><i data-lucide="sparkles"></i> Pre-filled from your goals: "3 things you're grateful for"</div>` : ''}
        <div style="padding:12px 18px">
          <input id="pm-journal-title" placeholder="Title" style="width:100%;border:0;outline:none;font-size:22px;font-weight:700;background:transparent" value="${esc(titleVal)}" />
          <div class="small muted" style="margin-top:4px"><i data-lucide="calendar"></i> ${editing?esc(editing.date):'Wed, May 27 · 20:42'} · ${shareChip}</div>
          <textarea id="pm-journal-body" style="width:100%;border:0;outline:none;background:transparent;min-height:280px;margin-top:14px;font-family:inherit;font-size:14px;line-height:1.6" placeholder="Write...">${esc(bodyVal)}</textarea>
        </div>
      </div>
      ${tabbar()}
    `;
  }
  function journalView() {
    const j = S.patientApp.journalEntries.find(x => x.id === nav.journalSel);
    if (!j) { nav.sub = 'journal-list'; return journalList(); }
    return `
      <div class="screen">
        <div class="appbar">
          <button class="back" data-pm-action="back-from-entry" data-id="${j.id}"><i data-lucide="chevron-left"></i></button>
          <div class="center-title">Entry</div>
          <button class="star-btn lg ${j.favorite?'on':''}" data-pm-fav="${j.id}"><i data-lucide="star"></i></button>
        </div>
        <div style="padding:12px 18px;padding-bottom:96px">
          <div class="entry-title-row">
            <input class="entry-title-input" data-pm-input="entry-title" data-id="${j.id}" value="${esc(j.title)}" />
          </div>
          <div class="small muted" style="margin-top:4px"><i data-lucide="calendar"></i> ${esc(j.date)} · ${j.shared===false?'<i data-lucide="eye-off"></i> Not shared with clinician':'<i data-lucide="share-2"></i> Shared with Shari'}</div>
          ${j.safetyLevel === 'flag' ? `<div class="entry-flag-banner"><i data-lucide="triangle-alert"></i> Flagged for safety review · Shari was notified</div>` : ''}
          <textarea class="entry-body-input" data-pm-input="entry-body" data-id="${j.id}">${esc(j.body)}</textarea>
        </div>
        <div class="entry-actbar end">
          <button class="btn danger" data-pm-action="soft-delete" data-id="${j.id}"><i data-lucide="trash-2"></i> Delete entry</button>
        </div>
      </div>
      ${tabbar()}
    `;
  }

  /* ---------- Calendar ---------- */
  function calendar() {
    const head = `
      <div class="appbar"><button class="back" data-pm-back><i data-lucide="chevron-left"></i></button><div class="center-title">Calendar</div><div class="chip green">${nav.calendarMode==='weekly'?'This week':'Today'}</div></div>
      <div class="cal-toggle">
        <button class="${nav.calendarMode==='daily'?'active':''}" data-pm-calmode="daily">Daily</button>
        <button class="${nav.calendarMode==='weekly'?'active':''}" data-pm-calmode="weekly">Weekly</button>
      </div>`;
    if (nav.calendarMode === 'daily') {
      const sub = `
        <div class="cal-sub-toggle">
          <button class="${nav.calendarSub==='agenda'?'active':''}" data-pm-calsub="agenda"><i data-lucide="list"></i> Agenda</button>
          <button class="${nav.calendarSub==='schedule'?'active':''}" data-pm-calsub="schedule"><i data-lucide="calendar"></i> Calendar</button>
        </div>
        <div class="row between" style="padding:0 18px"><div class="bold">Wed, May 27</div><div class="dim"><i data-lucide="chevron-left"></i>  <i data-lucide="chevron-right"></i></div></div>`;
      if (nav.calendarSub === 'agenda') {
        const items = [
          { time:'08:00', sub:'5 min', title:'Take Sertraline 50mg', meta:'Reminder 07:50' },
          { time:'20:30', sub:'0 min', title:'Gratitude journal — 3 things', meta:'Reminder 20:30' },
          { time:'21:30', sub:'5 min', title:'Wind-down · no screens', meta:'Reminder 21:25' },
          { time:'22:00', sub:'-',     title:'Be asleep', meta:'Bedtime target · log in morning' },
        ];
        return `
          <div class="screen">${head}${sub}
          ${items.map(i => `
            <div class="agenda-item"><div class="l">
              <div><div class="ts">${esc(i.time)}</div><div class="ti">${esc(i.sub)}</div></div>
              <div class="body" style="flex:1;margin-left:10px"><div class="t">${esc(i.title)}</div><div class="m"><i data-lucide="alarm-clock"></i> ${esc(i.meta)}</div></div>
            </div></div>`).join('')}
          </div>${tabbar()}`;
      } else {
        return `
          <div class="screen">${head}${sub}
          <div class="row between" style="padding:0 18px;color:var(--danger);font-size:11px"><div>● Now · 09:41</div><div></div></div>
          <div class="schedule-grid">
            ${[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map(h => `
              <div class="schedule-hour"><span class="lbl">${String(h).padStart(2,'0')}:00</span></div>
            `).join('')}
            <div class="schedule-event med" style="top:38px;height:24px">Sertraline 50mg<br/><span style="font-weight:400">Medication · taken</span></div>
            <div class="schedule-event" style="top:494px;height:32px">Gratitude journal<br/><span style="font-weight:400">Journaling · due in 10h 49m</span></div>
            <div class="schedule-event alt" style="top:530px;height:28px">Wind-down · no screens<br/><span style="font-weight:400">Exercise · 30 min</span></div>
            <div class="schedule-event warn" style="top:560px;height:24px">Be asleep<br/><span style="font-weight:400">Sleep · target bedtime</span></div>
          </div>
          </div>${tabbar()}`;
      }
    } else {
      const days = [
        { d:'Mon', date:'May 25', count:'4 / 4 done', items:[
          {t:'08:00',n:'Sertraline 50mg',done:true},{t:'20:30',n:'Gratitude journal',done:true},{t:'21:30',n:'Wind-down · no screens',done:true},{t:'22:00',n:'Be asleep',done:true}]},
        { d:'Tue', date:'May 26', count:'3 / 4 done', items:[
          {t:'08:00',n:'Sertraline 50mg',done:true},{t:'20:30',n:'Gratitude journal',done:true},{t:'21:30',n:'Wind-down · skipped (work call)',skipped:true},{t:'22:00',n:'Be asleep',done:true}]},
        { d:'Wed', date:'May 27 · today', count:'2 / 4 active', items:[
          {t:'08:00',n:'Sertraline 50mg',done:true},{t:'20:30',n:'Gratitude journal · due 21:00'},{t:'21:30',n:'Wind-down · upcoming'},{t:'22:00',n:'Be asleep · upcoming'}]},
        { d:'Thu', date:'May 28', count:'Scheduled', items:[
          {t:'08:00',n:'Sertraline 50mg'},{t:'20:30',n:'Gratitude journal'},{t:'21:30',n:'Wind-down · no screens'},{t:'22:00',n:'Be asleep'}]},
      ];
      return `
        <div class="screen">${head}
          <div class="row between" style="padding:0 18px;margin-top:6px"><div class="bold">May 25 — May 31</div><div class="dim"><i data-lucide="chevron-left"></i>  <i data-lucide="chevron-right"></i></div></div>
          ${days.map(d => `
            <div class="week-day">
              <div class="dh"><div><div class="d">${esc(d.d)}</div><div class="c">${esc(d.date)}</div></div><div class="c">${esc(d.count)}</div></div>
              ${d.items.map(i => `<div class="ev ${i.done?'done':''} ${i.skipped?'skipped':''}"><div class="t">${esc(i.t)}</div><div class="nm">${esc(i.n)}</div><div class="ch">${i.done?'<i data-lucide="check"></i>':i.skipped?'<i data-lucide="x"></i>':'<i data-lucide="circle"></i>'}</div></div>`).join('')}
            </div>`).join('')}
        </div>${tabbar()}`;
    }
  }

  /* ---------- Coach AI (Delphi-skinned) ---------- */
  function coach() {
    if (nav.coachView === 'overview') return coachOverview();
    return coachChat();
  }

  function coachHeader() {
    const voiceIcon = nav.voiceOn ? 'volume-2' : 'volume-x';
    const voiceCls = nav.voiceOn ? '' : 'off';
    // Effective incognito = explicit user choice OR sharing disabled at source
    // (master switch off, or Coach AI sharing toggle off). When forced by settings,
    // the chip is locked — patient must change it in Data sharing.
    const forced = !isShared('coach');
    const incognitoOn = S.patientApp.incognito || forced;
    return `
      <div class="dl-header">
        <div class="dl-topbar">
          <button class="dl-incognito ${incognitoOn?'on':''} ${forced?'locked':''}" data-pm-action="toggle-incognito" ${forced?'title="Sharing is off in Data sharing settings"':''}>
            <i data-lucide="${incognitoOn?'eye-off':'eye'}"></i> ${incognitoOn?'Incognito on':'Incognito off'}${forced?' <i data-lucide="lock" style="width:12px;height:12px;margin-left:2px"></i>':''}
          </button>
        </div>
        <button class="dl-avatar" data-pm-action="coach-open-overview" aria-label="Open Shari overview">
          <img src="reference-materials/shari-portrait.png" alt="Shari B. Kaplan, LCSW" />
        </button>
        <div class="dl-namerow">
          <button class="dl-name" data-pm-action="coach-open-overview">Shari B. Kaplan, LCSW</button>
          <span class="dl-divider"></span>
          <button class="dl-voice ${voiceCls}" data-pm-action="coach-toggle-voice" aria-label="Toggle voice reading">
            <i data-lucide="${voiceIcon}"></i>
          </button>
        </div>
        <div class="dl-powered"><span>powered by</span> <strong>Delphi</strong></div>
      </div>
    `;
  }

  function coachChat() {
    const messages = S.patientApp.coachMessages.map(m => m.from === 'coach'
      ? `<div class="dl-msg-ai">${esc(m.text)}${m.ref?`<div class="dl-ref"><i data-lucide="clipboard-list"></i> From your goals: ${esc(m.ref)} <i data-lucide="arrow-up-right"></i></div>`:''}</div>`
      : `<div class="dl-msg-user-row"><div class="dl-msg-user">${esc(m.text)}</div></div>`
    ).join('');
    const hasText = (nav.coachDraft || '').trim().length > 0;
    return `
      <div class="screen dl-coach-screen">
        ${coachHeader()}
        <div class="dl-thread">
          <div class="dl-ctx-banner">
            <i data-lucide="shield-check"></i>
            <span>Your Coach knows your treatment plan, goals, and recent data.</span>
          </div>
          ${messages}
        </div>
        <div class="dl-input ${hasText?'expanded':''}">
          ${hasText ? coachInputExpanded() : coachInputPill()}
        </div>
      </div>
      ${tabbar()}
    `;
  }

  function coachInputPill() {
    return `
      <div class="dl-pill">
        <button class="dl-attach" aria-label="Attach"><i data-lucide="paperclip"></i></button>
        <input id="pm-coach-input" placeholder="What helps me sleep?" value="${esc(nav.coachDraft||'')}" />
        <span class="dl-tab-chip">TAB</span>
        <button class="dl-mic" aria-label="Voice input"><i data-lucide="mic"></i></button>
      </div>
      <button class="dl-call" data-pm-action="coach-call" aria-label="Voice call"><i data-lucide="phone"></i></button>
    `;
  }

  function coachInputExpanded() {
    return `
      <div class="dl-pill-expanded">
        <textarea id="pm-coach-input" rows="1" placeholder="What helps me sleep?">${esc(nav.coachDraft||'')}</textarea>
        <div class="dl-pill-actions">
          <button class="dl-attach" aria-label="Attach"><i data-lucide="paperclip"></i></button>
          <button class="dl-send" data-pm-action="coach-send" aria-label="Send"><i data-lucide="arrow-up"></i></button>
        </div>
      </div>
    `;
  }
  function autosizeCoachInput(el) {
    if (!el || el.tagName !== 'TEXTAREA') return;
    el.style.height = 'auto';
    const max = 140;
    el.style.height = Math.min(el.scrollHeight, max) + 'px';
  }

  function coachOverview() {
    const suggestions = [
      'How do I get myself to fall asleep or back to sleep if I wake up with anxiety?',
      'How do I find time for breath work, meditation, and food prepping?',
      'How do I release anger and resentment so I can manage my thoughts?',
      'How do I regulate my body so I can regulate my emotions?',
      'How do I decrease or manage my anxiety?',
    ];
    return `
      <div class="screen dl-coach-screen dl-overview-screen">
        <div class="dl-overview">
          <div class="dl-overview-top">
            <div class="dl-overview-avatar">
              <img src="reference-materials/shari-portrait.png" alt="Shari B. Kaplan, LCSW" />
            </div>
            <button class="dl-share">Share</button>
          </div>
          <h1 class="dl-overview-name">Shari B. Kaplan, LCSW</h1>
          <div class="dl-overview-badges">
            <span class="dl-badge"><i data-lucide="badge-check" style="color:#2563EB"></i> Integrative Mental Health</span>
            <span class="dl-badge-dot"></span>
            <span class="dl-badge"><i data-lucide="sparkles" style="color:#7C3AED"></i> 7.4K Mind</span>
          </div>
          <p class="dl-overview-bio">Shari B. Kaplan, LCSW, is a leading expert in integrative mental health and the founder of Cannectd Wellness and Can't Tell Foundation. With decades of experience in trauma treatment, Shari combines evidence-based practices with nutrition, herbal plant medicine and holistic approaches to support clients on their healing journeys.</p>
          <div class="dl-ask-card">
            <div class="dl-ask-head"><i data-lucide="messages-square"></i> Ask me about</div>
            ${suggestions.map(s => `<button class="dl-ask-chip" data-pm-action="coach-use-suggestion" data-q="${esc(s)}">${esc(s)}</button>`).join('')}
          </div>
        </div>
        <button class="dl-view-chat" data-pm-action="coach-view-chat">View chat <i data-lucide="chevron-up"></i></button>
      </div>
      ${tabbar()}
    `;
  }

  /* ---------- Me ---------- */
  function wholeLifePlanView() {
    const v = S.wholeLifePlan.currentVersion;
    const ver = S.wholeLifePlan.versions[v];
    const cats = S.wholeLifePlan.categories;
    const icons = {'Nutrition':'apple','Exercise':'dumbbell','Music & Movement':'music','Meditation & Mindfulness':'brain','Self-regulation tools':'anchor','Breathwork':'wind','Spirituality':'sparkles','Finances':'wallet','Work & Work Relationships':'briefcase','Fun & Hobbies':'palette','Mentoring & Volunteering':'heart-handshake','Relationship with Self':'smile','Relationships with Others':'users','Personality':'user'};
    return `
      <div class="screen">
        <div class="appbar"><button class="back" data-pm-back><i data-lucide="chevron-left"></i></button><div class="center-title">Treatment plan</div><span class="chip green">v${v} · current</span></div>
        <div style="padding:4px 16px 90px;display:flex;flex-direction:column;gap:12px">
          ${cats.map(c => { const o = ver.objectives[c]; return `
            <div class="card" style="display:flex;flex-direction:column;gap:8px">
              <div class="row gap-2" style="align-items:center"><i data-lucide="${icons[c]||'circle'}" style="color:var(--primary);width:16px;height:16px"></i><div class="bold" style="font-size:15px">${esc(c)}</div></div>
              <div class="small" style="line-height:1.5;${o?'color:#475569':'color:#94a3b8;font-style:italic'}">${o?esc(o):'No objective set for this category yet.'}</div>
            </div>`; }).join('')}
        </div>
      </div>
      ${tabbar()}
    `;
  }
  function me() {
    if (nav.sub === 'whole-life-plan') return wholeLifePlanView();
    if (nav.sub === 'integrations') return mIntegrations();
    if (nav.sub === 'apple-watch')  return appleWatch();
    if (nav.sub === 'calendar-int') return calendarInt();
    if (nav.sub === 'data-sharing') return dataSharing();
    if (nav.sub === 'progress')     return progress();
    if (nav.sub === 'privacy')      return privacyPolicy();

    return `
      <div class="screen">
        <div class="appbar"><h2 class="center-title" style="margin:0 auto">Me</h2><button class="iconbtn"><i data-lucide="settings"></i></button></div>
        <div style="text-align:center;padding:6px 14px 14px">
          <div class="avatar lg s-pink" style="margin:0 auto">C</div>
          <div class="small muted" style="margin-top:8px">Good morning,</div>
          <div style="font-size:22px;font-weight:700">Chen</div>
          <div style="margin-top:6px"><span class="chip green"><i data-lucide="sparkles"></i> Shari B Kaplan, LCSW · your clinician</span></div>
        </div>
        <div class="list" style="margin:0 16px 8px">
          <div class="row-item" data-pm-sub="whole-life-plan"><div class="avatar sm" style="background:var(--primary-tint);color:var(--primary)"><i data-lucide="clipboard-list"></i></div><div class="body"><div class="title">Treatment plan</div><div class="meta">Your Whole Life Plan · 14 categories</div></div><div><i data-lucide="chevron-right"></i></div></div>
        </div>
        <div style="margin:0 16px;display:grid;grid-template-columns:${S.compliance.visibleToPatient?'1fr 1fr':'1fr'};gap:8px">
          ${S.compliance.visibleToPatient ? `<div class="card" data-pm-sub="progress" style="cursor:pointer;text-align:center"><div class="big" style="color:var(--primary)">${S.compliance.value}%</div><div class="tiny muted">Avg compliance</div></div>` : ''}
          <div class="card" style="text-align:center"><div class="big">${S.sessions.length}</div><div class="tiny muted">Sessions</div></div>
        </div>
        <div class="section-label">Settings</div>
        <div class="list">
          <div class="row-item" data-pm-sub="integrations"><div class="avatar sm" style="background:var(--primary-tint);color:var(--primary)"><i data-lucide="settings"></i></div><div class="body"><div class="title">Integrations</div></div><div><i data-lucide="chevron-right"></i></div></div>
          <div class="row-item" data-pm-sub="data-sharing"><div class="avatar sm" style="background:#dbeafe;color:#1d4ed8"><i data-lucide="share-2"></i></div><div class="body"><div class="title">Data sharing</div></div><div><i data-lucide="chevron-right"></i></div></div>
          <div class="row-item"><div class="avatar sm" style="background:#fef3c7;color:#92400e"><i data-lucide="bell"></i></div><div class="body"><div class="title">Notifications</div></div><div><i data-lucide="chevron-right"></i></div></div>
        </div>
        <div class="section-label">Legal</div>
        <div class="list" style="padding-bottom:24px">
          <div class="row-item"><div class="avatar sm" style="background:#f1f5f9"><i data-lucide="file-text"></i></div><div class="body"><div class="title">Terms of service</div></div><div><i data-lucide="chevron-right"></i></div></div>
          <div class="row-item" data-pm-sub="privacy"><div class="avatar sm" style="background:#f1f5f9"><i data-lucide="shield"></i></div><div class="body"><div class="title">Privacy policy</div></div><div><i data-lucide="chevron-right"></i></div></div>
        </div>
      </div>
      ${tabbar()}
    `;
  }
  function privacyPolicy() {
    return `
      <div class="screen">
        <div class="appbar"><button class="back" data-pm-back><i data-lucide="chevron-left"></i></button><div class="center-title">Privacy policy</div><span style="width:28px"></span></div>
        <div style="padding:4px 16px 90px">
          <div class="card" style="display:flex;flex-direction:column;gap:12px">
            <div class="row gap-2" style="align-items:center">
              <div class="avatar sm" style="background:var(--primary-tint);color:var(--primary)"><i data-lucide="shield-check"></i></div>
              <div class="bold" style="font-size:15px">Your privacy &amp; confidentiality</div>
            </div>
            <p style="margin:0;font-size:13px;line-height:1.55;color:#334155">Protecting the confidentiality of your health information is central to how the platform is built and operated. We are committed to handling all personal and protected health information in a manner consistent with the standards established under the U.S. Health Insurance Portability and Accountability Act of 1996 (HIPAA), and we are actively working toward full HIPAA compliance across our systems, processes, and third-party integrations.</p>
            <p style="margin:0;font-size:13px;line-height:1.55;color:#334155">Access to patient data is strictly limited to authorized personnel on a need-to-know basis, but rest assured &mdash; every individual involved in the development, operation, or maintenance of the platform is required to complete a thorough vetting process, including successful completion of a Level 2 background screening. All such personnel are bound by confidentiality obligations and receive regular training and briefings that reinforce the critical importance of safeguarding patient information.</p>
          </div>
        </div>
      </div>
      ${tabbar()}
    `;
  }
  function mIntegrations() {
    return `
      <div class="screen">
        <div class="appbar"><button class="back" data-pm-back><i data-lucide="chevron-left"></i></button><div class="center-title">Integrations</div><span style="width:28px"></span></div>
        <div class="section-label">Connected (1)</div>
        <div class="list">
          <div class="row-item" data-pm-sub="apple-watch"><div class="avatar sm" style="background:#0f172a;color:white"><i data-lucide="watch"></i></div><div class="body"><div class="title row gap-2">Apple Watch <span class="chip gray">Manual</span></div><div class="meta">Sleep · HR · BP · Activity</div></div><div><i data-lucide="chevron-right"></i></div></div>
        </div>
        <div class="section-label">Coming soon</div>
        <div class="list">
          <div class="row-item" data-pm-sub="calendar-int"><div class="avatar sm" style="background:#dbeafe;color:#1d4ed8"><i data-lucide="calendar"></i></div><div class="body"><div class="title">Google Calendar</div><div class="meta">Push prescription events</div></div><div><i data-lucide="chevron-right"></i></div></div>
          <div class="row-item" data-pm-sub="calendar-int"><div class="avatar sm" style="background:#fef3c7;color:#92400e"><i data-lucide="calendar"></i></div><div class="body"><div class="title">Apple Calendar</div><div class="meta">Push prescription events</div></div><div><i data-lucide="chevron-right"></i></div></div>
        </div>
      </div>
      ${tabbar()}
    `;
  }
  function appleWatch() {
    const w = S.patientApp.appleWatch;
    return `
      <div class="screen">
        <div class="appbar"><button class="back" data-pm-back><i data-lucide="chevron-left"></i></button><div class="center-title">Apple Watch</div><button class="btn sm primary" data-pm-action="save-watch">Save</button></div>
        <div class="small muted" style="padding:0 18px 8px">Log today's readings manually until the watch is connected.</div>
        <div class="card" style="margin:0 16px 10px">
          <div class="bold row gap-2" style="margin-bottom:8px"><i data-lucide="moon"></i> Sleep · last night</div>
          ${[
            ['Bedtime',w.sleep.bedtime,'aw-bedtime'],['Wake time',w.sleep.wake,'aw-wake'],
            ['Sleep latency',w.sleep.latency,'aw-latency'],['Awakenings',w.sleep.awakenings,'aw-awake']
          ].map(([k,v,id]) => `<div class="kv-row"><span class="muted">${k}</span><input id="${id}" value="${esc(v)}" style="border:0;text-align:right;font-weight:600;outline:none;background:transparent;font-family:inherit;font-size:12px" /></div>`).join('')}
          <div class="kv-row"><span class="muted">Overall quality</span><span>${'▮'.repeat(w.sleep.quality)}${'▯'.repeat(5-w.sleep.quality)}</span></div>
        </div>
        <div class="card" style="margin:0 16px 10px">
          <div class="bold row gap-2" style="margin-bottom:8px"><i data-lucide="heart-pulse"></i> Vitals</div>
          ${[
            ['Heart rate',w.hr,'aw-hr'],['Blood pressure',w.bp,'aw-bp'],['Body temperature',w.temp,'aw-temp'],['Respiration',w.resp,'aw-resp']
          ].map(([k,v,id])=>`<div class="kv-row"><span class="muted">${k}</span><input id="${id}" value="${esc(v)}" style="border:0;text-align:right;font-weight:600;outline:none;background:transparent;font-family:inherit;font-size:12px" /></div>`).join('')}
        </div>
        <div class="card" style="margin:0 16px 10px">
          <div class="bold row gap-2" style="margin-bottom:8px"><i data-lucide="footprints"></i> Activity</div>
          <div class="kv-row"><span class="muted">Steps today</span><input id="aw-steps" value="${esc(w.steps)}" style="border:0;text-align:right;font-weight:600;outline:none;background:transparent;font-family:inherit;font-size:12px" /></div>
        </div>
        <div class="banner amber" style="margin:0 16px 14px"><i data-lucide="info"></i> This data propagates to your goals compliance score.</div>
      </div>${tabbar()}
    `;
  }
  function calendarInt() {
    return `
      <div class="screen">
        <div class="appbar"><button class="back" data-pm-back><i data-lucide="chevron-left"></i></button><div class="center-title">Google Calendar</div><span style="width:28px"></span></div>
        <div style="text-align:center;padding:14px">
          <div class="avatar lg" style="background:#dbeafe;color:#1d4ed8;margin:0 auto"><i data-lucide="calendar"></i></div>
          <div style="font-size:18px;font-weight:700;margin-top:8px">Google Calendar</div>
          <div><span class="chip amber">Coming soon</span></div>
          <p class="small muted" style="margin-top:8px;line-height:1.5">In a future release, the Calendar applet will push your scheduled prescription events directly to Google Calendar.</p>
        </div>
        <div class="section-label">What you'll get</div>
        <div class="list" style="padding:0 16px">
          <div class="row-item"><div class="avatar sm" style="background:#f1f5f9"><i data-lucide="alarm-clock"></i></div><div class="body"><div class="title">Auto-synced reminders</div><div class="meta">Bedtime, medication, journaling — all in one place.</div></div></div>
          <div class="row-item"><div class="avatar sm" style="background:#f1f5f9"><i data-lucide="refresh-cw"></i></div><div class="body"><div class="title">Updates when goals change</div><div class="meta">When your clinician updates your goals, your calendar updates automatically.</div></div></div>
        </div>
      </div>${tabbar()}
    `;
  }
  function dataSharing() {
    return `
      <div class="screen">
        <div class="appbar"><button class="back" data-pm-back><i data-lucide="chevron-left"></i></button><div class="center-title">Data sharing</div><span style="width:28px"></span></div>
        <div class="toggle-row master">
          <div class="ic"><i data-lucide="share-2"></i></div>
          <div class="body"><div class="t">Share with my clinician</div><div class="m">Master switch</div></div>
          <div class="switch ${S.patientApp.dataSharing.master?'on':''}" data-pm-toggle="master"></div>
        </div>
        <div class="section-label">Per-data state</div>
        ${S.patientApp.dataSharing.items.map(i => `
          <div class="toggle-row">
            <div class="ic"><i data-lucide="${i.icon}"></i></div>
            <div class="body"><div class="t">${esc(i.label)}</div>${i.sub?`<div class="m">${esc(i.sub)}</div>`:''}</div>
            <div class="switch ${i.on?'on':''}" data-pm-toggle="${i.id}"></div>
          </div>`).join('')}
        <div class="banner amber" style="margin:14px 16px"><i data-lucide="info"></i> Safety signals (e.g. suicidal ideation in journal) are always reviewed regardless of sharing settings.</div>
      </div>${tabbar()}
    `;
  }
  function progress() {
    if (!S.compliance.visibleToPatient) { nav.sub = null; return nav.tab === 'me' ? me() : today(); }
    return `
      <div class="screen">
        <div class="appbar"><button class="back" data-pm-back><i data-lucide="chevron-left"></i></button><div class="center-title">Progress</div><span style="width:28px"></span></div>
        <div style="background:linear-gradient(135deg,#0f766e,#14b8a6);color:white;margin:6px 16px 14px;padding:18px;border-radius:18px">
          <div class="small" style="opacity:.9">Current compliance</div>
          <div style="font-size:38px;font-weight:800;margin-top:2px">${S.compliance.value}<span style="font-size:16px;opacity:.85">% · last 7 days</span></div>
          <div style="display:flex;gap:6px;margin-top:14px;align-items:flex-end;height:80px">
            ${S.compliance.sparkline.slice(-7).map((v,i,arr) => `<div style="flex:1;background:rgba(255,255,255,${i===arr.length-1?'1':'.45'});border-radius:4px 4px 0 0;height:${v}%"></div>`).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:10px;opacity:.85">
            <span>Th</span><span>Fr</span><span>Sa</span><span>Su</span><span>Mo</span><span>Tu</span><span>Today</span>
          </div>
        </div>
        <div class="card" style="margin:0 16px">
          <div class="bold"><i data-lucide="info"></i> How this score is calculated</div>
          <div class="small muted" style="margin-top:6px;line-height:1.5">A weekly rolling average across all prescriptions in your goals. The detailed breakdown is coming after the POC.</div>
        </div>
      </div>${tabbar()}
    `;
  }

  /* ---------- Lock screen ---------- */
  function lockScreen() {
    return `
      <div class="screen" style="padding-top:0">
        <div class="lock-screen">
          <div class="ic"><i data-lucide="heart-handshake"></i></div>
          <h2>We've reached out to Shari Kaplan</h2>
          <p>Something you wrote suggests you may be having a really hard time right now. Your clinician has been notified and will reach out shortly. The app is paused until they unlock it.</p>
          <div class="resources">
            <div class="label">If you need to talk to someone right now</div>
            <button class="resource-btn"><span><i data-lucide="phone"></i> Call 988 — Suicide & Crisis Lifeline</span><span><i data-lucide="chevron-right"></i></span></button>
            <button class="resource-btn alt"><span><i data-lucide="message-square"></i> Text HOME to 741741</span><span><i data-lucide="chevron-right"></i></span></button>
          </div>
          <div class="small">Locked by your clinician's safety system</div>
        </div>
      </div>
    `;
  }

  // Find a situation-based exercise prescription that fits a dysregulation signal.
  // Matches when the rx is condition-based AND its trigger text references the signal
  // (or the generic "stress" tag). Returns null when the goals have no relevant fallback.
  function findFallbackRx(signal) {
    const rxs = (S.goals.versions[S.goals.currentVersion] || {}).rxs || [];
    const aliases = {
      hr: ['hr', 'heart', 'stress'],
      respiration: ['breath', 'respiration', 'panic'],
    }[signal] || [signal];
    const re = new RegExp(aliases.join('|'), 'i');
    return rxs.find(rx => rx.type === 'exercise' && /^Condition/i.test(rx.trigger || '') && re.test(rx.trigger || '')) || null;
  }

  function dysregulationSheet() {
    const d = S.dysregulation;
    if (!d || d.dismissed) return '';
    const rx = d.rxId ? (S.goals.versions[S.goals.currentVersion]?.rxs || []).find(r => r.id === d.rxId) : null;
    const signalReading = d.signalLabel || `HR ${d.hr} bpm`;
    const signalNoun = d.signal === 'respiration' ? 'breathing has been elevated' : 'heart rate has been elevated';
    const intro = `Your ${signalNoun} across your last few readings (${signalReading} sustained).`;
    const body = rx
      ? `${intro} Your goals include a fallback for moments like this.`
      : `${intro} Your goals don't have a specific fallback for this — here are two ways to get support right now.`;
    const content = rx
      ? `
        <div class="dr-rx-card">
          <div class="dr-rx-head">
            <div class="dr-rx-icon"><i data-lucide="wind"></i></div>
            <div class="dr-rx-titles">
              <div class="dr-rx-title">${esc(rx.title)}</div>
              <div class="dr-rx-sub">From your goals</div>
            </div>
          </div>
          <div class="dr-rx-rules">${esc(rx.rules || '')}</div>
        </div>
        <button class="dr-primary" data-pm-action="dysreg-start"><i data-lucide="play"></i> Start ${esc(rx.title.split('(')[0].trim())}</button>
      `
      : `
        <div class="dr-opts">
          <button class="dr-opt" data-pm-action="dysreg-coach">
            <div class="dr-opt-ico purple"><i data-lucide="sparkles"></i></div>
            <div class="dr-opt-col">
              <div class="dr-opt-title">Talk to Coach AI</div>
              <div class="dr-opt-sub">Ask anything · grounded in your goals</div>
            </div>
            <i data-lucide="chevron-right" class="dr-opt-chev"></i>
          </button>
          <button class="dr-opt" data-pm-action="dysreg-message">
            <div class="dr-opt-ico teal"><i data-lucide="message-circle"></i></div>
            <div class="dr-opt-col">
              <div class="dr-opt-title">Message Shari</div>
              <div class="dr-opt-sub">Send your clinician a direct message</div>
            </div>
            <i data-lucide="chevron-right" class="dr-opt-chev"></i>
          </button>
        </div>
      `;
    return `
      <div class="sheet-backdrop" data-pm-action="dysreg-dismiss-bg">
        <div class="sheet dr-sheet" onclick="event.stopPropagation()">
          <div class="grabber"></div>
          <div class="dr-icon-wrap"><i data-lucide="heart-pulse"></i></div>
          <h4 class="dr-title">Your body's signaling stress</h4>
          <p class="dr-body">${esc(body)}</p>
          ${content}
          <button class="dr-secondary" data-pm-action="dysreg-dismiss">Not now</button>
        </div>
      </div>
    `;
  }

  // History stack — back button always returns to the previous screen.
  const history = [];
  let navigating = false;
  function snapshot() {
    return JSON.stringify({ tab: nav.tab, sub: nav.sub, journalSel: nav.journalSel, journalEditId: nav.journalEditId });
  }
  function pushHistory() {
    const s = snapshot();
    if (history[history.length-1] === s) return;
    history.push(s);
  }
  function goBack() {
    if (history.length <= 1) return;
    history.pop();
    const prev = JSON.parse(history[history.length-1]);
    navigating = true;
    nav.tab = prev.tab;
    nav.sub = prev.sub;
    nav.journalSel = prev.journalSel;
    nav.journalEditId = prev.journalEditId;
    nav.modal = null;
    render();
    navigating = false;
  }
  window.pmGoBack = goBack;

  function authWelcome() {
    return `
      <div class="auth-screen welcome">
        <div class="auth-body auth-body-center">
          <div class="auth-hero-logo"><i data-lucide="sparkles"></i></div>
          <div class="auth-title centered">Welcome to Tend</div>
          <div class="auth-sub centered">Your space to track your care, message your clinician, and stay on plan.</div>
        </div>
        <div class="auth-bottom">
          <button class="auth-primary" data-pm-action="auth-go-register">Create account</button>
          <button class="auth-secondary" data-pm-action="auth-go-login">I already have an account</button>
          <div class="auth-terms">By continuing you agree to our <a class="auth-link">Terms & Privacy.</a></div>
        </div>
      </div>`;
  }
  function authForm(mode) {
    const err = mode.endsWith('-error');
    const isReg = mode.startsWith('register');
    return `
      <div class="auth-screen">
        <div class="auth-body">
          <div class="auth-brand"><span class="logo">T</span><span>Tend</span></div>
          <div class="auth-title">${isReg?'Create your account':(err?'Sign in':'Welcome back')}</div>
          <div class="auth-sub">${isReg?'Your clinician invited you to Tend.':'Sign in to continue your care.'}</div>
          ${err?`
            <div class="auth-error">
              <i data-lucide="triangle-alert"></i>
              <div>
                <div class="bold">Incorrect email or password</div>
                <div class="small">Double-check and try again.</div>
              </div>
            </div>`:''}
          <div class="auth-field">
            <label>Email</label>
            <div class="auth-input ${err?'err':''}"><i data-lucide="mail"></i><input type="email" placeholder="you@email.com" value="chen.v@email.com" id="pm-auth-email" /></div>
          </div>
          <div class="auth-field">
            <label>Password</label>
            <div class="auth-input ${err?'err':''}"><i data-lucide="lock"></i><input type="password" value="••••••••••" id="pm-auth-pw" /><i data-lucide="eye" class="trail"></i></div>
          </div>
          ${isReg?'':'<div class="auth-row-end"><a class="auth-link">Forgot password?</a></div>'}
          <button class="auth-primary" data-pm-action="${isReg?'auth-register-submit':'auth-login-submit'}">${isReg?'Create account':'Sign in'}</button>
          <div class="auth-divider"><span class="line"></span><span class="lbl">or continue with</span><span class="line"></span></div>
          <div class="auth-social">
            <button class="auth-secondary" data-pm-action="auth-social" data-provider="google"><i data-lucide="globe"></i> Google</button>
            <button class="auth-secondary" data-pm-action="auth-social" data-provider="apple"><i data-lucide="apple"></i> Apple</button>
          </div>
          <div class="auth-footer">${isReg
            ? 'Already have an account? <a class="auth-link" data-pm-action="auth-go-login">Sign in</a>'
            : 'New here? <a class="auth-link" data-pm-action="auth-go-register">Create an account</a>'}</div>
        </div>
      </div>`;
  }
  function authWaiting() {
    return `
      <div class="auth-screen">
        <div class="auth-top">
          <div class="auth-brand"><span class="logo">T</span><span>Tend</span></div>
          <button class="auth-link" data-pm-action="auth-signout">Sign out</button>
        </div>
        <div class="auth-body auth-body-center" style="padding-top:0">
          <div class="auth-wait-ring"><div class="auth-wait-core"><i data-lucide="hourglass"></i></div></div>
          <div class="auth-title centered">You're almost in.</div>
          <div class="auth-sub centered">Your account is ready, but your clinician hasn't finished setting up your profile yet.</div>
          <div class="auth-card auth-email-card">
            <div class="ic"><i data-lucide="mail"></i></div>
            <div><div class="lbl">Signed in as</div><div class="val">chen.v@email.com</div></div>
          </div>
          <div class="auth-steps">
            <div class="auth-step done"><div class="dot"><i data-lucide="check"></i></div><div>You created your account</div></div>
            <div class="auth-step"><div class="dot"></div><div>Your clinician completes your onboarding</div></div>
            <div class="auth-step"><div class="dot"></div><div>We let you in — automatically</div></div>
          </div>
        </div>
        <div class="auth-bottom">
          <button class="auth-primary" data-pm-action="auth-check-again"><i data-lucide="refresh-cw"></i> Check again</button>
          <div class="auth-terms">We'll also notify you the moment you're set up.</div>
        </div>
      </div>`;
  }

  /* ---------- Render ---------- */
  function render() {
    const r = root();
    if (!r) return;
    if (S.auth.patient !== 'in') {
      let html;
      if (S.auth.patient === 'welcome') html = authWelcome();
      else if (S.auth.patient === 'register') html = authForm('register');
      else if (S.auth.patient === 'register-error') html = authForm('register-error');
      else if (S.auth.patient === 'login') html = authForm('login');
      else if (S.auth.patient === 'login-error') html = authForm('login-error');
      else if (S.auth.patient === 'waiting') html = authWaiting();
      r.innerHTML = html;
      bind(r);
      if (window.lucide) lucide.createIcons();
      return;
    }
    if (S.patientApp.locked) { r.innerHTML = lockScreen(); if (window.lucide) lucide.createIcons(); return; }
    if (!navigating) pushHistory();
    let html = '';
    if (nav.tab === 'today')   html = today();
    if (nav.tab === 'plan')    html = plan();
    if (nav.tab === 'applets') html = applets();
    if (nav.tab === 'coach')   html = coach();
    if (nav.tab === 'me')      html = me();
    html += dysregulationSheet();
    r.innerHTML = html;
    bind(r);
    if (window.lucide) lucide.createIcons();
  }

  function bind(r) {
    r.querySelectorAll('[data-pm-back]').forEach(b => b.onclick = () => goBack());
    r.querySelectorAll('[data-pm-tab]').forEach(b => b.onclick = () => { nav.tab = b.dataset.pmTab; nav.sub = null; nav.modal = null; render(); });
    r.querySelectorAll('[data-pm-sub]').forEach(b => b.onclick = () => { nav.sub = b.dataset.pmSub || null; render(); });
    r.querySelectorAll('[data-pm-modal]').forEach(b => b.onclick = () => { nav.modal = b.dataset.pmModal; render(); });
    r.querySelectorAll('[data-pm-modal-close]').forEach(b => b.onclick = () => { nav.modal = null; render(); });
    r.querySelectorAll('[data-pm-calmode]').forEach(b => b.onclick = () => { nav.calendarMode = b.dataset.pmCalmode; render(); });
    r.querySelectorAll('[data-pm-calsub]').forEach(b => b.onclick = () => { nav.calendarSub = b.dataset.pmCalsub; render(); });
    r.querySelectorAll('[data-pm-journal]').forEach(b => b.onclick = () => { nav.journalSel = b.dataset.pmJournal; nav.sub = 'journal-view'; render(); });
    r.querySelectorAll('[data-pm-jtab]').forEach(b => b.onclick = (e) => { e.stopPropagation(); nav.journalTab = b.dataset.pmJtab; render(); });
    r.querySelectorAll('[data-pm-newjournal]').forEach(b => b.onclick = () => {
      nav.journalPrefillFromPlan = b.dataset.pmNewjournal === 'prefill';
      nav.journalEditId = null;
      nav.sub = 'journal-new';
      render();
    });
    r.querySelectorAll('[data-pm-fav]').forEach(b => b.onclick = (e) => {
      e.stopPropagation();
      const j = S.patientApp.journalEntries.find(x => x.id === b.dataset.pmFav);
      if (!j) return;
      j.favorite = !j.favorite;
      bus.emit();
    });
    r.querySelectorAll('[data-pm-input]').forEach(el => {
      const kind = el.dataset.pmInput;
      const id = el.dataset.id;
      el.onblur = () => {
        const j = S.patientApp.journalEntries.find(x => x.id === id);
        if (!j) return;
        if (kind === 'entry-title') j.title = (el.value || '').trim() || 'Untitled';
        if (kind === 'entry-body') {
          j.body = el.value;
          j.summary = j.body.slice(0, 80) + (j.body.length>80?'…':'');
        }
        notify('Saved');
      };
      if (kind === 'entry-body') {
        const resize = () => { el.style.height = 'auto'; el.style.height = Math.max(180, el.scrollHeight) + 'px'; };
        el.oninput = resize;
        setTimeout(resize, 0);
      }
    });
    r.querySelectorAll('[data-pm-task]').forEach(b => b.onclick = () => {
      const id = b.dataset.pmTask;
      const t = S.patientApp.tasks.find(x => x.id === id);
      if (!t) return;
      if (t.kind === 'journaling') { nav.tab = 'applets'; nav.journalPrefillFromPlan = true; nav.sub = 'journal-new'; render(); return; }
      if (t.dim) return;
      t.done = !t.done;
      addActivity({ type:'shared', t:'now', title:`Chen completed: ${t.title}`, meta:t.meta });
      notify(`Marked: ${t.title}`);
      bus.emit();
    });
    r.querySelectorAll('[data-pm-rx]').forEach(b => b.onclick = () => {
      const k = b.dataset.pmRxtype;
      if (k === 'journaling') { nav.tab = 'applets'; nav.journalPrefillFromPlan = true; nav.sub = 'journal-new'; render(); return; }
      if (k === 'medication') {
        const t = S.patientApp.tasks.find(x => x.kind==='medication'); if (t) t.done = true;
        addActivity({ type:'shared', t:'now', title:'Chen marked medication taken', meta:'Sertraline 50mg' });
        notify('Marked taken'); bus.emit();
      }
      if (k === 'sleep') { notify('Bedtime logger opens in production'); }
      if (k === 'exercise') { notify('Starting 4-7-8 breathwork…'); }
    });
    r.querySelectorAll('[data-pm-toggle]').forEach(b => b.onclick = () => {
      const id = b.dataset.pmToggle;
      if (id === 'master') S.patientApp.dataSharing.master = !S.patientApp.dataSharing.master;
      else {
        const it = S.patientApp.dataSharing.items.find(x => x.id === id);
        if (it) it.on = !it.on;
      }
      bus.emit();
    });
    const coachInp = r.querySelector('#pm-coach-input');
    if (coachInp) {
      autosizeCoachInput(coachInp);
      coachInp.oninput = () => {
        const prev = (nav.coachDraft || '').length > 0;
        const now = (coachInp.value || '').length > 0;
        nav.coachDraft = coachInp.value;
        if (prev !== now) {
          const caret = coachInp.selectionStart;
          render();
          setTimeout(() => {
            const i = document.getElementById('pm-coach-input');
            if (i) { i.focus(); try { i.setSelectionRange(caret, caret); } catch(e){} autosizeCoachInput(i); }
          }, 0);
        } else {
          autosizeCoachInput(coachInp);
        }
      };
      coachInp.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          coachInp.dispatchEvent(new Event('input'));
          nav.coachDraft = coachInp.value;
          if ((coachInp.value || '').trim()) {
            const fakeBtn = { dataset: { pmAction:'coach-send' } };
            r.querySelector('[data-pm-action="coach-send"]')?.click();
          }
        }
      };
    }
    r.querySelectorAll('[data-pm-action]').forEach(b => b.onclick = () => {
      const a = b.dataset.pmAction;
      if (a === 'auth-social')       { const prov = b.dataset.provider; notify(`${prov === 'apple' ? 'Apple' : 'Google'} sign-in would open here (POC stub)`); S.auth.patient = 'in'; nav.tab = 'today'; bus.emit(); return; }
      if (a === 'auth-go-register')  { S.auth.patient = 'register'; bus.emit(); return; }
      if (a === 'auth-go-login')     { S.auth.patient = 'login'; bus.emit(); return; }
      if (a === 'auth-signout')      { S.auth.patient = 'welcome'; bus.emit(); return; }
      if (a === 'auth-check-again')  {
        // In the demo, "check again" finds Chen's profile linked and signs them in.
        S.auth.patient = 'in'; nav.tab = 'today'; notify('You\'re in — welcome to Tend'); bus.emit(); return;
      }
      if (a === 'auth-register-submit') {
        const email = document.getElementById('pm-auth-email')?.value || '';
        const pw    = document.getElementById('pm-auth-pw')?.value || '';
        if (!email || !pw) { S.auth.patient = 'register-error'; bus.emit(); return; }
        // For the demo: chen.v@email.com is the patient Shari invited (pending). Anyone else lands in waiting.
        if (email === 'chen.v@email.com') {
          S.auth.patient = 'in'; nav.tab = 'today'; notify('Welcome to Tend'); bus.emit();
        } else {
          S.auth.patient = 'waiting'; bus.emit();
        }
        return;
      }
      if (a === 'auth-login-submit') {
        const email = document.getElementById('pm-auth-email')?.value || '';
        const pw    = document.getElementById('pm-auth-pw')?.value || '';
        if (email === 'chen.v@email.com' && pw) {
          S.auth.patient = 'in'; nav.tab = 'today'; notify('Welcome back'); bus.emit();
        } else {
          S.auth.patient = 'login-error'; bus.emit();
        }
        return;
      }
      if (a === 'submit-applet') {
        const v = (document.getElementById('pm-applet-idea')?.value || '').trim();
        if (!v) { notify('Describe your idea first'); return; }
        notify('Thanks! Your idea was submitted.');
        nav.sub = null; render();
      }
      if (a === 'save-journal') {
        const titleRaw = (document.getElementById('pm-journal-title')?.value || '').trim();
        const body  = (document.getElementById('pm-journal-body')?.value || '').trim();
        if (!titleRaw && !body) { notify('Add a title or write something'); return; }
        const title = titleRaw || 'Untitled';
        const HARD = /(kill myself|suicid|end (it all|my life)|wasn'?t here anymore|don'?t want to be here|take my own life|not going to do anything)/i;
        const SOFT = /(self.?harm|hurt myself|hopeless|can'?t go on|can'?t take it|give up|worthless|better off without me|burden)/i;
        const hard = HARD.test(body);
        const soft = !hard && SOFT.test(body);
        const safetyLevel = hard ? 'lock' : (soft ? 'flag' : null);
        const summary = body.slice(0, 80) + (body.length>80?'…':'');
        if (nav.journalEditId) {
          const existing = S.patientApp.journalEntries.find(x => x.id === nav.journalEditId);
          if (existing) { existing.title = title; existing.body = body; existing.summary = summary; existing.flagged = !!safetyLevel; existing.safetyLevel = safetyLevel; }
          nav.journalEditId = null;
          if (hard) { triggerJournalLockup(body); }
          else if (soft) { triggerJournalSoftFlag(existing, title); notify('Saved · clinician notified'); nav.sub = 'journal-view'; render(); }
          else { notify('Saved'); nav.sub = 'journal-view'; render(); }
        } else {
          const shared = isShared('journal');
          const j = { id:uid('j'), date:'Today · '+ new Date().toTimeString().slice(0,5), title, body, summary, flagged: !!safetyLevel, safetyLevel, favorite:false, shared };
          S.patientApp.journalEntries.unshift(j);
          const t = S.patientApp.tasks.find(x => x.kind==='journaling'); if (t) { t.done = true; t.doneLabel = 'Done'; }
          if (hard) { triggerJournalLockup(j.body); }
          else if (soft) {
            // Safety signals always reach the clinician regardless of sharing settings.
            triggerJournalSoftFlag(j, title);
            notify('Saved · clinician notified');
            nav.journalPrefillFromPlan = false;
            nav.sub = 'journal-list'; render();
          } else {
            if (shared) {
              addActivity({ type:'shared', t:'now', title:'Chen shared a journal entry', meta:title });
              const jSrc = S.sharedData.bySource.find(s => s.id==='journal');
              if (jSrc) {
                jSrc.items.unshift({ label: title, value: 'Today' });
                jSrc.items = jSrc.items.slice(0, 4);
              }
              S.sharedData.timeline.unshift({ date:'Today · '+ new Date().toTimeString().slice(0,5), src:'journal', label:'Journal entry', meta: title });
              notify('Saved · shared with Shari');
            } else {
              notify('Saved · kept private');
            }
            nav.journalPrefillFromPlan = false;
            nav.sub = 'journal-list'; render();
          }
        }
      }
      if (a === 'cancel-edit') {
        nav.journalEditId = null;
        nav.journalPrefillFromPlan = false;
        goBack();
      }
      if (a === 'back-from-entry') {
        const id = b.dataset.id;
        const titleEl = document.querySelector('[data-pm-input="entry-title"]');
        const bodyEl = document.querySelector('[data-pm-input="entry-body"]');
        const titleVal = (titleEl?.value || '').trim();
        const bodyVal = (bodyEl?.value || '').trim();
        const j = S.patientApp.journalEntries.find(x => x.id === id);
        if (j) {
          if (!titleVal && !bodyVal) {
            S.patientApp.journalEntries = S.patientApp.journalEntries.filter(x => x.id !== id);
            notify('Empty entry discarded');
          } else {
            j.title = titleVal || 'Untitled';
            j.body = bodyVal;
            j.summary = bodyVal.slice(0, 80) + (bodyVal.length>80?'…':'');
          }
        }
        nav.journalSel = null;
        goBack();
      }
      if (a === 'soft-delete') {
        const id = b.dataset.id;
        const idx = S.patientApp.journalEntries.findIndex(x => x.id === id);
        if (idx >= 0) {
          const j = S.patientApp.journalEntries.splice(idx, 1)[0];
          j.daysLeft = 7;
          (S.patientApp.journalTrash = S.patientApp.journalTrash || []).unshift(j);
          notify('Moved to trash · kept for 7 days');
          nav.sub = 'journal-list'; nav.journalSel = null; render();
        }
      }
      if (a === 'trash-restore') {
        const id = b.dataset.id;
        const trash = S.patientApp.journalTrash || [];
        const idx = trash.findIndex(x => x.id === id);
        if (idx >= 0) {
          const j = trash.splice(idx, 1)[0];
          delete j.daysLeft;
          S.patientApp.journalEntries.unshift(j);
          notify('Restored');
          bus.emit();
        }
      }
      if (a === 'trash-purge') {
        const id = b.dataset.id;
        const trash = S.patientApp.journalTrash || [];
        const idx = trash.findIndex(x => x.id === id);
        if (idx >= 0) { trash.splice(idx, 1); notify('Permanently deleted'); bus.emit(); }
      }
      if (a === 'save-watch') {
        const w = S.patientApp.appleWatch;
        w.sleep.bedtime = document.getElementById('aw-bedtime').value;
        w.sleep.wake = document.getElementById('aw-wake').value;
        w.sleep.latency = document.getElementById('aw-latency').value;
        w.sleep.awakenings = document.getElementById('aw-awake').value;
        w.hr = document.getElementById('aw-hr').value;
        w.bp = document.getElementById('aw-bp').value;
        w.temp = document.getElementById('aw-temp').value;
        w.resp = document.getElementById('aw-resp').value;
        w.steps = document.getElementById('aw-steps').value;
        // Propagate to clinician only when Apple Watch sharing is on.
        // Safety/dysregulation signals below still fire regardless.
        if (isShared('watch')) {
          const apple = S.sharedData.bySource.find(s => s.id==='apple');
          apple.items = [
            { label:'Sleep · last night', value:'—' },
            { label:'Resting HR', value:w.hr },
            { label:'Steps · today', value:w.steps },
          ];
          addActivity({ type:'shared', t:'now', title:'Shared Apple Watch readings', meta:`HR ${w.hr} · Steps ${w.steps} · Bedtime ${w.sleep.bedtime}` });
        }
        // check dysregulation: HR > 95 (parse)
        const hr = parseInt(w.hr,10) || 0;
        const resp = parseInt(w.resp, 10) || 0;
        if (hr > 95) {
          const rx = findFallbackRx('hr');
          S.dysregulation = { at:'now', hr, signal:'hr', signalLabel:`HR ${hr} bpm`, rxId: rx ? rx.id : null, dismissed: false };
          const meta = rx ? `Sustained HR ${hr} · plan fallback prompted (${rx.title})` : `Sustained HR ${hr} · no plan fallback · prompted for support`;
          addActivity({ type:'urgent', t:'now', title:'Dysregulation detected', meta });
          notify('Dysregulation triggered');
        } else if (resp > 20) {
          const rx = findFallbackRx('respiration');
          S.dysregulation = { at:'now', hr:resp, signal:'respiration', signalLabel:`respiration ${resp} breaths/min`, rxId: rx ? rx.id : null, dismissed: false };
          const meta = rx ? `Sustained respiration ${resp}/min · plan fallback prompted (${rx.title})` : `Sustained respiration ${resp}/min · no plan fallback · prompted for support`;
          addActivity({ type:'urgent', t:'now', title:'Dysregulation detected', meta });
          notify('Dysregulation triggered');
        } else notify('Saved');
        nav.sub = 'integrations'; render();
      }
      if (a === 'toggle-incognito') {
        if (!isShared('coach')) {
          const ds = S.patientApp.dataSharing;
          notify(ds.master ? 'Coach sharing is off — change in Data sharing' : 'Sharing is off — turn on the master switch in Data sharing');
          return;
        }
        S.patientApp.incognito = !S.patientApp.incognito;
        render();
      }
      if (a === 'coach-open-overview') { nav.coachView = 'overview'; render(); }
      if (a === 'coach-view-chat')     { nav.coachView = 'chat'; render(); }
      if (a === 'coach-toggle-voice')  { nav.voiceOn = !nav.voiceOn; render(); }
      if (a === 'coach-call')          { notify('Voice call would start (POC stub)'); }
      if (a === 'coach-use-suggestion'){ nav.coachDraft = b.dataset.q || ''; nav.coachView = 'chat'; render(); setTimeout(() => { const i = document.getElementById('pm-coach-input'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 0); }
      if (a === 'coach-send') {
        const inp = document.getElementById('pm-coach-input');
        const text = (inp?.value || '').trim(); if (!text) return;
        nav.coachDraft = '';
        const sharedCoach = !S.patientApp.incognito && isShared('coach');
        S.patientApp.coachMessages.push({ from:'sarah', text, shared: sharedCoach });
        // detect "inappropriate" <i data-lucide="arrow-right"></i> coach flag escalation (no lockup)
        const bad = /(hurt myself|kill|end it|suicid|harm)/i.test(text);
        if (bad) {
          // Safety signals always reach the clinician regardless of sharing settings.
          S.coachFlag = { text, at:'now' };
          addActivity({ type:'urgent', t:'now', title:'Coach AI flagged Chen\'s message', meta:`"${text.slice(0,90)}"` });
          pushToCm({ urgent:true, text:`Chen V — Coach AI flagged at-risk language. Tap to review.` });
          notify('Clinician notified');
        } else if (sharedCoach) {
          const coachSrc = S.sharedData.bySource.find(s => s.id==='coach');
          if (coachSrc) {
            coachSrc.items.unshift({ label: `"${text.slice(0,60)}${text.length>60?'…':''}"`, value: 'now' });
            coachSrc.items = coachSrc.items.slice(0, 4);
          }
          S.sharedData.timeline.unshift({ date:'Today · '+ new Date().toTimeString().slice(0,5), src:'coach', label:'Coach AI message', meta:`"${text.slice(0,90)}${text.length>90?'…':''}"` });
          const QUIET_MS = 60 * 1000;
          const now = Date.now();
          const last = S.activity[0];
          const snippet = `"${text.slice(0,80)}${text.length>80?'…':''}"`;
          if (last && last.type === 'coach' && last._convoAt && (now - last._convoAt) < QUIET_MS) {
            last._convoCount = (last._convoCount || 1) + 1;
            last._convoAt = now;
            last.t = 'now';
            last.read = false;
            last.meta = `${last._convoFirst} · ${last._convoCount} messages`;
            bus.emit();
          } else {
            const hadPrior = S.activity.some(a => a.type === 'coach');
            addActivity({ type:'coach', t:'now', title: hadPrior ? 'Coach AI · conversation resumed' : 'Coach AI · new conversation', meta: `${snippet} · 1 message`, _convoAt: now, _convoCount: 1, _convoFirst: snippet });
          }
        }
        setTimeout(() => {
          const replies = [
            { text:"That's frustrating. Your goals from Shari Kaplan include a fallback for nights like this: if you can't sleep within 20 minutes, get up and do a quiet activity until you're drowsy.", ref:'Sleep prescription' },
            { text:"I hear you. From your goals: 4-7-8 breathwork is your on-demand stress regulator. Want to try a quick round?", ref:'Exercise prescription' },
            { text:"Got it. I'm not a clinician but I can help you think through what your goals suggest.", ref:null },
          ];
          const reply = bad ? { text:"I'm really glad you told me. I've let Shari Kaplan know. If you're in crisis right now, please call 988 or use the resources in the app.", ref:null } : replies[Math.floor(Math.random()*replies.length)];
          S.patientApp.coachMessages.push({ from:'coach', ...reply });
          bus.emit();
        }, 700);
        inp.value = '';
        bus.emit();
      }
      if (a === 'plan-version') { nav.planVersion = parseInt(b.dataset.v,10); nav.modal = null; render(); }
      if (a === 'plan-latest')  { nav.planVersion = S.goals.currentVersion; render(); }
      if (a === 'dysreg-dismiss' || a === 'dysreg-dismiss-bg') {
        if (S.dysregulation) S.dysregulation.dismissed = true;
        render();
      }
      if (a === 'dysreg-start') {
        if (S.dysregulation) S.dysregulation.dismissed = true;
        nav.tab = 'plan';
        notify('Following your goals');
        render();
      }
      if (a === 'dysreg-coach') {
        if (S.dysregulation) S.dysregulation.dismissed = true;
        nav.tab = 'coach';
        nav.coachView = 'chat';
        render();
      }
      if (a === 'dysreg-message') {
        if (S.dysregulation) S.dysregulation.dismissed = true;
        notify('Opening message to Shari…');
        render();
      }
    });
  }

  window.triggerJournalSoftFlag = function (entry, title) {
    const snippet = (entry?.body || '').slice(0, 120);
    addActivity({ type:'urgent', t:'now', title:'Journal entry flagged for review', meta:`"${snippet}${(entry?.body || '').length>120?'…':''}"`, urgent:true });
    pushToCm({ urgent:false, text:`Chen V — journal entry flagged for review (no lockup). Tap to read.` });
    bus.emit();
  };

  window.triggerJournalLockup = function (quote) {
    S.patientApp.locked = true;
    S.patientApp.lockReason = 'Self-harm language detected · just now';
    S.patientApp.lockQuote = quote || '…how much easier it would be if I just wasn\'t here anymore. I\'m not going to do anything, but the thought won\'t stop coming back.';
    addActivity({ type:'urgent', t:'now', title:'Urgent · Journal entry flagged', meta:'Safety pattern detected in today\'s gratitude journal entry. Review immediately.', urgent:true });
    pushToCm({ urgent:true, text:'Chen V — journal entry flagged for self-harm language. Tap to open.' });
    notify('Patient app locked · clinician alerted');
    bus.emit();
  };

  window.renderPatientMobile = render;
})();
