/* Clinician Web surface */
(function () {
  const root = () => document.getElementById('cw-root');
  const nav = {
    screen: 'patients', // patients, settings, integrations, integrationDemo, patient, messaging, upload, note, assessment, goals, compliance, session
    sub: null,
    sessionId: 's12',
    assessmentVersion: null,
    sharedView: 'source', // source | timeline
    activityFilter: 'all',     // all | sessions | shared | messages | coach
    assessDataTab: 'all',
    txDataTab: 'all',
    wlpDataTab: 'all',
    profileTab: 'assessment', // assessment | wlp | goals — left pane of patient profile
    wlpDraft: null,
    allSubView: 'list',        // list | timeline
    sharedSubView: 'source',   // source | timeline
    rxModal: null,
    dpModal: null, // {kind:'extract'|'add', sessionId?}
    exportMenuOpen: false,
  };
  window.cwNav = nav;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Data Browser tabs per spec: All / Sessions / Shared data / Messages. Coach AI is NOT a tab —
  // coach activity is rolled up as an event inside the All feed.
  const DATA_TABS = [['all','All'],['sessions','Sessions'],['shared','Data shared'],['messages','Messages']];

  function dataSubToggle(tab, scope) {
    if (tab === 'all') {
      const v = nav.allSubView;
      return `<div class="sub-seg">
        <button class="${v==='list'?'active':''}" data-cw-subview="${scope}|all|list">List</button>
        <button class="${v==='timeline'?'active':''}" data-cw-subview="${scope}|all|timeline">Timeline</button>
      </div>`;
    }
    if (tab === 'shared') {
      const v = nav.sharedSubView;
      return `<div class="sub-seg">
        <button class="${v==='source'?'active':''}" data-cw-subview="${scope}|shared|source">By source</button>
        <button class="${v==='timeline'?'active':''}" data-cw-subview="${scope}|shared|timeline">Timeline</button>
      </div>`;
    }
    return '';
  }

  function renderTimeline(items, limit) {
    const arr = limit ? items.slice(0, limit) : items;
    return `<div class="timeline">
      ${arr.map(t => `
        <div class="tl-item ${t.flagged?'flagged':''}">
          <div class="date">${esc(t.date)}</div>
          <div class="bold small" style="margin-top:2px">${t.bps?'<span class="bps-pill">BPS</span> ':''}${esc(t.label)} ${t.flagged?'<span class="chip red">FLAGGED</span>':''}${t.status?`<span class="chip ${t.status==='approved'?'green':'amber'}">${t.status==='approved'?'Approved':'Pending'}</span>`:''}</div>
          <div class="tiny muted">${esc(t.meta||'')}</div>
        </div>`).join('')}
    </div>`;
  }

  function txAssessmentBanner() {
    const a = S.assessment.versions[S.assessment.currentVersion];
    return `
      <div class="card tx-assess-banner" style="margin-bottom:12px;padding:12px 14px">
        <div class="row between" style="margin-bottom:6px">
          <div class="row gap-2" style="align-items:center">
            <div class="bold small"><i data-lucide="clipboard-list"></i> Cumulative assessment</div>
            <span class="chip gray">v${S.assessment.currentVersion} · current</span>
            <span class="dim tiny">· last edited ${esc(a.date)}</span>
          </div>
          <button class="btn sm" data-cw-go="assessment"><i data-lucide="external-link"></i> Open assessment</button>
        </div>
        <div class="small" style="line-height:1.5;color:#0f172a">${esc(a.body).slice(0, 220)}…</div>
      </div>`;
  }

  function renderDataPane(tab) {
    if (tab === 'all') {
      if (nav.allSubView === 'timeline') return renderTimeline(S.sharedData.timeline);
      return S.activity.map(a => `
        <div class="event-row ${a.type==='urgent'?'urgent':''}" data-cw-evt="${a.id}">
          <div class="ev-ic"${a.type==='coach'?' style="background:#EDE9FE;color:#6D28D9"':''}>${a.type==='urgent'?'<i data-lucide="triangle-alert"></i>':a.type==='shared'?'<i data-lucide="share-2"></i>':a.type==='message'?'<i data-lucide="message-square"></i>':a.type==='session'?'<i data-lucide="file-text"></i>':a.type==='coach'?'<i data-lucide="sparkles"></i>':'•'}</div>
          <div class="body"><div class="t">${esc(a.title)} ${!a.read?'<span class="chip red">NEW</span>':''}</div><div class="m">${esc(a.meta||'')}</div></div>
          <div class="time">${esc(a.t)}</div>
        </div>
      `).join('') || '<div class="dim small" style="padding:10px">No activity.</div>';
    }
    if (tab === 'sessions') {
      return S.sessions.slice().reverse().map(s => `
        <div class="event-row" data-cw-action="open-session" data-id="${s.id}" style="cursor:pointer">
          <div class="ev-ic"><i data-lucide="file-text"></i></div>
          <div class="body"><div class="t">Session #${s.num} · ${esc(s.date)}</div><div class="m">"${esc((s.note?.summary||s.note?.assessmentPlan||'').slice(0,90))}..."</div></div>
          <div class="dim tiny">${esc(s.duration)}</div>
        </div>`).join('');
    }
    if (tab === 'shared') {
      const dps = (S.dataPoints || []).filter(d => d.status === 'approved');
      if (nav.sharedSubView === 'timeline') {
        const dpItems = dps.map(d => ({ date:`Collected ${d.collectedAt}`, label:`Data point · ${d.referenceDate}`, meta:d.answer, bps:true }));
        return renderTimeline(dpItems.concat(S.sharedData.timeline));
      }
      const dpGroup = dps.length ? `
        <div class="shared-source">
          <div class="src-h"><div class="name"><span class="bps-pill">BPS</span> Data points</div><div class="count">${dps.length} shared</div></div>
          ${dps.map(d => `
            <div class="shared-row" data-cw-action="dp-open" data-id="${d.id}" style="cursor:pointer"><div class="ev-ic" style="background:#f1f5f9">·</div>
              <div class="body">${esc(d.prompt)}</div>
              <div class="val"><i data-lucide="chevron-right" style="width:14px;height:14px;color:#94a3b8"></i></div>
            </div>`).join('')}
        </div>` : '';
      return dpGroup + S.sharedData.bySource.map(s => `
        <div class="shared-source">
          <div class="src-h"><div class="name"><span>${s.icon}</span> ${esc(s.name)}</div><div class="count">${esc(s.updated)}</div></div>
          ${s.items.map(it => `
            <div class="shared-row"><div class="ev-ic" style="background:#f1f5f9">·</div>
              <div class="body">${esc(it.label)} ${it.tag==='flagged'?'<span class="chip red">FLAGGED</span>':''}</div>
              <div class="val">${esc(it.value)}</div>
            </div>`).join('')}
        </div>`).join('');
    }
    if (tab === 'messages') {
      return `<div class="col gap-2">
        ${S.messages.slice().reverse().map(m => `
          <div class="event-row" style="cursor:pointer" data-cw-action="open-messages">
            <div class="ev-ic">${m.from==='rachel'?'<i data-lucide="user"></i>':'<i data-lucide="message-square"></i>'}</div>
            <div class="body"><div class="t">${m.from==='rachel'?esc(S.clinician.name.split(' ')[0]):esc(S.patient.name)}</div><div class="m">"${esc(m.text.slice(0,110))}${m.text.length>110?'…':''}"</div></div>
            <div class="dim tiny">${esc(m.at)}</div>
          </div>`).join('')}
      </div>`;
    }
    return '';
  }

  function topbar(crumbs=[]) {
    const unread = S.activity.filter(a => !a.read).length + S.cmPush.length;
    return `
      <div class="web-topbar">
        <div class="left">
          <div class="brand brand-home" data-cw-go="patients" title="Home"><span class="logo">T</span><span>Tend</span></div>
          <div class="crumbs">
            ${crumbs.map((c,i) => i < crumbs.length-1
              ? `<a data-cw-crumb="${esc(c.go||'')}">${esc(c.label)}</a><span class="sep"><i data-lucide="chevron-right"></i></span>`
              : `<span>${esc(c.label)}</span>`).join('')}
          </div>
        </div>
        <div class="row gap-2">
          <div class="search-pill"><span><i data-lucide="search"></i></span><input placeholder="Search patients, sessions, tags..." /></div>
          <button class="bell-btn"><i data-lucide="bell"></i>${unread?'<span class="bdot"></span>':''}</button>
          <div class="avatar sm rachel" data-cw-go="settings" style="cursor:pointer" title="Settings">${S.clinician.initials}</div>
        </div>
      </div>`;
  }

  function shell(crumbs, body) {
    return `${topbar(crumbs)}
      <div class="web-shell">
        <nav class="web-sidebar">
          <button class="nav-btn ${nav.screen==='patients'||nav.screen==='patient'||nav.screen.startsWith('session')||nav.screen==='upload'||nav.screen==='note'||nav.screen==='assessment'||nav.screen==='goals'||nav.screen==='wholeLifePlan'||nav.screen==='compliance'?'active':''}" data-cw-go="patients" title="Patients"><i data-lucide="users"></i></button>
          <button class="nav-btn ${nav.screen==='messaging'?'active':''}" data-cw-go="messaging" title="Messages"><i data-lucide="message-square"></i></button>
          <div style="flex:1"></div>
          <button class="nav-btn ${nav.screen.startsWith('settings')||nav.screen.startsWith('integration')?'active':''}" data-cw-go="settings" title="Settings"><i data-lucide="settings"></i></button>
        </nav>
        <div class="web-main"><div class="web-page">${body}</div></div>
      </div>`;
  }

  /* ---------- Patients list ---------- */
  function patientsWithTag(label) {
    // POC: single patient — extend if more are seeded.
    return S.patient.tags.includes(label) ? 1 : 0;
  }
  function pruneOrphanTags() {
    S.tagLibrary = (S.tagLibrary || [])
      .map(t => ({ ...t, patients: patientsWithTag(t.label) }))
      .filter(t => t.patients > 0);
  }
  function tagColor(label) {
    const t = (S.tagLibrary || []).find(x => x.label === label);
    return t?.color || 'gray';
  }
  function renderTagChip(label, opts={}) {
    const { small=false, removable=false } = opts;
    return `<span class="chip ${tagColor(label)} ${small?'sm':''}">${esc(label)}${removable?`<button class="chip-x" data-cw-action="tag-remove" data-tag="${esc(label)}"><i data-lucide="x"></i></button>`:''}</span>`;
  }
  function patientsList() {
    const alerts = (S.patientApp.locked ? 1 : 0) + S.activity.filter(a => !a.read && a.type==='urgent').length;
    const last = S.activity[0];
    const selected = nav.tagFilter || [];
    const matches = selected.length === 0 || selected.every(t => S.patient.tags.includes(t));
    const filterLabel = selected.length === 0 ? 'All' : selected.join(' + ');
    const pending = S.pendingPatients || [];
    const total = 1 + pending.length;
    const subLine = pending.length ? `${total} patients · ${pending.length} pending` : '1 test patient · POC';
    return shell([{label:'Patients'}], `
      <div class="page-head">
        <div><h1>Patients</h1><div class="sub">${esc(subLine)}</div></div>
        <div class="row gap-2" style="position:relative">
          <button class="btn primary sm" data-cw-action="add-patient"><i data-lucide="plus"></i> Add patient</button>
          <button class="search-pill" data-cw-action="toggle-tag-filter"><span>Tags:</span><span class="chip ${selected.length?'green':''}">${esc(filterLabel)}</span><i data-lucide="chevron-down"></i></button>
          <button class="btn sm"><i data-lucide="funnel"></i> Filter</button>
          ${nav.tagFilterOpen ? tagFilterMenu() : ''}
        </div>
      </div>
      <div class="table">
        <div class="thead"><div>Patient</div><div>Tags</div><div>Compliance</div><div>Last activity</div><div style="text-align:right">Alerts</div></div>
        ${matches ? `
        <div class="trow" data-cw-go="patient">
          <div class="row gap-3"><div class="avatar sarah">CV</div><div><div class="bold">${esc(S.patient.name)}</div><div class="dim tiny">${S.patient.age} y/o</div></div></div>
          <div class="row" style="gap:4px;flex-wrap:wrap">
            ${S.patient.tags.map(t => renderTagChip(t, { small:true })).join('')}
            <button class="chip-add" data-cw-action="open-tag-modal" data-stopnav="1" title="Manage tags"><i data-lucide="plus"></i></button>
          </div>
          <div class="row gap-2"><div style="width:80px"><div class="progress-bar"><div class="fill" style="width:${S.compliance.value}%"></div></div></div><div class="bold small">${S.compliance.value}%</div></div>
          <div><div class="small">${esc(last?.title || '')}</div><div class="dim tiny">${esc(last?.t || '')}</div></div>
          <div style="text-align:right">${alerts?`<span class="badge-count">${alerts}</span>`:'<span class="dim tiny">—</span>'}</div>
        </div>` : `<div class="trow-empty"><div class="muted small" style="padding:18px;text-align:center">No patients match <b>${esc(filterLabel)}</b>. <button class="btn sm" data-cw-action="clear-tag-filter" style="margin-left:8px">Clear filter</button></div></div>`}
        ${pending.map(p => `
          <div class="trow pending" data-cw-action="edit-pending" data-id="${esc(p.id)}">
            <div class="row gap-3"><div class="avatar pending-av">${esc(p.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><div class="bold dim">${esc(p.name)}</div><div class="dim tiny">${esc(p.email)}</div></div></div>
            <div class="row" style="gap:4px"><span class="chip pending-chip">Pending</span></div>
            <div class="dim small">—</div>
            <div><div class="small dim">Invited · waiting for signup</div><div class="dim tiny">${esc(p.invitedAt)}</div></div>
            <div style="text-align:right"><span class="dim tiny">—</span></div>
          </div>`).join('')}
      </div>
      ${tagModal()}
    `);
  }

  /* ---------- Add Patient wizard ---------- */
  function ensureAddFlow() {
    if (!S.addPatientFlow) S.addPatientFlow = { step:1, name:'', sex:'', email:'', phone:'', age:'', emergency:'', comm:['SMS','WhatsApp','Email'], tags:['anxiety','new intake','telehealth'] };
    return S.addPatientFlow;
  }
  const COMM_METHODS = ['SMS','WhatsApp','Phone','Email','In-app'];
  function stepperHtml(active) {
    const steps = [['Basic info',1],['Past sessions',2],['Confirmation',3]];
    return `<div class="stepper">${steps.map(([l,n],i)=>`
      <div class="step-pill ${active===n?'active':(active>n?'done':'pending')}">
        <span class="step-dot">${active>n?'<i data-lucide="check"></i>':n}</span>
        <span class="step-label">${l}</span>
      </div>${i<2?'<div class="step-sep"></div>':''}`).join('')}</div>`;
  }
  function addPatientScreen() {
    const f = ensureAddFlow();
    let body;
    if (f.step === 1) {
      body = `
        <div class="ap-card">
          <div class="ap-sec">
            <div class="ap-sec-h"><div class="bold">Basic information</div><div class="dim tiny">How this patient will appear across Tend.</div></div>
            <div class="ap-row">
              ${apField('Full name', f.name, 'First Last', true, 'ap-name')}
              ${apSelect('Sex', f.sex, ['Female','Male','Other','Prefer not to say'], false, 'ap-sex')}
            </div>
            <div class="ap-row">
              ${apField('Email', f.email, 'patient@email.com', true, 'ap-email')}
              ${apField('Phone', f.phone, '+1 555 0188', false, 'ap-phone')}
            </div>
            <div class="ap-row">
              ${apField('Age', f.age, 'e.g. 32', false, 'ap-age')}
              ${apField('Emergency contact', f.emergency, 'Name · phone', false, 'ap-emergency')}
            </div>
            <div class="ap-comm">
              <div class="ap-field-l"><span>Preferred communication methods</span><span class="dim tiny">select all that apply</span></div>
              <div class="comm-chips">
                ${COMM_METHODS.map(m=>`<button class="comm-chip ${f.comm.includes(m)?'on':''}" data-cw-action="ap-toggle-comm" data-comm="${esc(m)}">${f.comm.includes(m)?'<i data-lucide="check"></i>':''}${esc(m)}</button>`).join('')}
              </div>
            </div>
          </div>
          <div class="ap-sec ap-sec-divider">
            <div class="ap-sec-h"><div class="bold">Tags</div><div class="dim tiny">Group and filter patients by what matters to you.</div></div>
            <div class="row" style="gap:6px;flex-wrap:wrap;align-items:center">
              ${f.tags.map(t => renderTagChip(t, { small:true, removable:true })).join('')}
              <button class="chip dash" data-cw-action="ap-open-tag-modal"><i data-lucide="plus"></i> ${f.tags.length ? 'Manage tags' : 'Add tag'}</button>
            </div>
          </div>
        </div>`;
    } else if (f.step === 2) {
      body = `
        <div class="ap-card">
          <div class="ap-coming-soon">
            <div class="cs-ic"><i data-lucide="history"></i></div>
            <span class="chip amber">Coming soon</span>
            <div class="cs-h">Import past sessions</div>
            <div class="cs-sub">Bring prior notes, transcripts, or summaries to seed this patient's history. Not available in the POC — we'll add this in a later release.</div>
          </div>
        </div>`;
    } else {
      body = `
        <div class="ap-card">
          <div class="ap-review">
            <div class="bold" style="font-size:15px">Review and confirm</div>
            <div class="dim tiny">This is what we'll send to your patient. You can edit afterwards from the patient profile.</div>
            <div class="ap-review-id">
              <div class="avatar md sarah">${esc((f.name||'· ·').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase())}</div>
              <div><div class="bold" style="font-size:16px">${esc(f.name||'—')}</div><div class="dim small">${esc(f.email||'—')}</div></div>
            </div>
            <div class="ap-review-rows">
              <div class="rr"><span class="lbl">Sex</span><span class="val">${esc(f.sex||'—')}</span></div>
              <div class="rr"><span class="lbl">Phone</span><span class="val">${esc(f.phone||'—')}</span></div>
              <div class="rr"><span class="lbl">Age</span><span class="val">${esc(f.age||'—')}</span></div>
              <div class="rr"><span class="lbl">Emergency contact</span><span class="val">${esc(f.emergency||'—')}</span></div>
              <div class="rr"><span class="lbl">Preferred communication</span><span class="val">${(f.comm&&f.comm.length)?f.comm.map(m=>`<span class="chip sm gray">${esc(m)}</span>`).join(' '):'<span class="dim">—</span>'}</span></div>
              <div class="rr"><span class="lbl">Tags</span><span class="val">${f.tags.map(t=>`<span class="chip sm gray">${esc(t)}</span>`).join(' ')||'<span class="dim">—</span>'}</span></div>
              <div class="rr"><span class="lbl">Past sessions</span><span class="val dim">None — to be added later</span></div>
            </div>
            <div class="ap-invite-box">
              <div class="ic"><i data-lucide="send"></i></div>
              <div>
                <div class="bold small">Invite goes to ${esc(f.email||'—')}</div>
                <div class="dim small" style="line-height:1.4;margin-top:2px">${esc((f.name||'They').split(' ')[0])} will receive a link to create their account and sign in. They'll show as 'pending' in your list until they do.</div>
              </div>
            </div>
          </div>
        </div>`;
    }
    const side = f.step === 1
      ? sideTipHtml('email-link')
      : f.step === 3
        ? sideHappensHtml() + sideTipHtml('email-link')
        : '';
    const footer = f.step === 3
      ? `<button class="btn" data-cw-action="ap-back">Back</button><button class="btn primary" data-cw-action="ap-create"><i data-lucide="send"></i> Create patient & send invite</button>`
      : f.step === 2
        ? `<button class="btn" data-cw-action="ap-back">Back</button><button class="btn primary" data-cw-action="ap-next">Continue <i data-lucide="arrow-right"></i></button>`
        : `<button class="btn" data-cw-action="ap-cancel">Cancel</button><button class="btn primary" data-cw-action="ap-next">Continue <i data-lucide="arrow-right"></i></button>`;
    return shell([{label:'Patients', go:'patients'},{label:'Add patient'}], `
      <a class="ap-back-link" data-cw-go="patients"><i data-lucide="arrow-left"></i> Back to patients</a>
      <div class="page-head"><div><h1>Add a patient</h1><div class="sub">Set up a profile so this patient can sign in and connect to you.</div></div></div>
      ${stepperHtml(f.step)}
      <div class="ap-cols ${side?'':'ap-cols-single'}">
        <div class="ap-main">${body}</div>
        ${side?`<div class="ap-side">${side}</div>`:''}
      </div>
      <div class="ap-bar">${footer}</div>
      ${tagModal()}
    `);
  }
  function apField(label, value, placeholder, required, id) {
    return `
      <div class="ap-field">
        <div class="ap-field-l"><span>${esc(label)}</span><span class="dim tiny">${required?'required':'optional'}</span></div>
        <div class="ap-input"><input id="${id}" placeholder="${esc(placeholder)}" value="${esc(value||'')}" /></div>
      </div>`;
  }
  function apSelect(label, value, options, required, id) {
    return `
      <div class="ap-field">
        <div class="ap-field-l"><span>${esc(label)}</span><span class="dim tiny">${required?'required':'optional'}</span></div>
        <div class="ap-input ap-select">
          <select id="${id}"><option value="" ${!value?'selected':''}>Select…</option>${options.map(o=>`<option value="${esc(o)}" ${value===o?'selected':''}>${esc(o)}</option>`).join('')}</select>
          <i data-lucide="chevron-down"></i>
        </div>
      </div>`;
  }
  function sideTipHtml(kind) {
    return `
      <div class="ap-tip">
        <div class="ic"><i data-lucide="lightbulb"></i></div>
        <div><div class="bold small">Email is the link</div><div class="dim small" style="line-height:1.4;margin-top:2px">The patient signs up with this exact email — it links their account to this profile.</div></div>
      </div>`;
  }
  function sideHappensHtml() {
    return `
      <div class="ap-happens">
        <div class="row gap-2" style="align-items:center;margin-bottom:10px"><div class="ic"><i data-lucide="send"></i></div><div class="bold">What happens next</div></div>
        <div class="ap-bullets">
          <div><span class="n">1</span><span>An invite goes to this email.</span></div>
          <div><span class="n">2</span><span>Patient signs up in the app.</span></div>
          <div><span class="n">3</span><span>They land in their Today screen.</span></div>
        </div>
      </div>`;
  }
  function addPatientSuccess() {
    const f = S.addPatientFlow || { name:'—', email:'—' };
    return shell([{label:'Patients', go:'patients'},{label:'Add patient'}], `
      <div class="ap-success">
        <div class="ap-success-ring"><i data-lucide="check"></i></div>
        <div class="ap-success-h">Patient created</div>
        <div class="ap-success-sub">We sent an invite to ${esc(f.email)}. ${esc((f.name||'').split(' ')[0]||'Your new patient')} will appear in your patient list once they create their account.</div>
        <span class="chip amber"><i data-lucide="clock-3"></i> Awaiting patient signup</span>
        <div class="ap-success-actions">
          <button class="btn primary block" data-cw-action="ap-success-back">Back to patient list</button>
          <button class="btn block" data-cw-action="ap-success-another"><i data-lucide="plus"></i> Add another patient</button>
        </div>
      </div>
    `);
  }
  function readApInputs() {
    const f = ensureAddFlow();
    const g = id => document.getElementById(id);
    if (g('ap-name')) f.name = g('ap-name').value;
    if (g('ap-sex')) f.sex = g('ap-sex').value;
    if (g('ap-email')) f.email = g('ap-email').value;
    if (g('ap-phone')) f.phone = g('ap-phone').value;
    if (g('ap-age')) f.age = g('ap-age').value;
    if (g('ap-emergency')) f.emergency = g('ap-emergency').value;
  }

  /* ---------- Patient edit modal ---------- */
  function editPatientModalHtml() {
    const target = S.editPatientModal;
    if (!target) return '';
    const isPending = String(target).startsWith('pp');
    const p = isPending
      ? (S.pendingPatients.find(x => x.id === target) || {})
      : { id:'sarah', name:S.patient.name, email:'chen.v@email.com', age:S.patient.age, emergency:'Mira V. · +1 555 0143', sex:S.patient.sex, phone:S.patient.phone, comm:S.patient.comm };
    const initials = (p.name || '· ·').split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase();
    const pComm = p.comm || [];
    const visOn = S.compliance.visibleToPatient;
    return `
      <div class="ep-backdrop" data-cw-action="ep-close-bg">
        <div class="ep-modal" onclick="event.stopPropagation()">
          <div class="ep-head">
            <div class="row gap-3" style="align-items:center">
              <div class="avatar md sarah">${esc(initials)}</div>
              <div><div class="bold" style="font-size:16px">Edit patient</div><div class="dim small">Update ${esc(p.name||'this patient')}'s basic details.</div></div>
            </div>
            <button class="ep-close" data-cw-action="ep-close"><i data-lucide="x"></i></button>
          </div>
          <div class="ep-body">
            <div class="ep-row">
              ${editField('Full name', p.name||'', 'ep-name')}
              ${editSelect('Sex', p.sex||'', ['Female','Male','Other','Prefer not to say'], 'ep-sex')}
            </div>
            <div class="ep-row">
              ${editField('Email', p.email||'', 'ep-email')}
              ${editField('Phone', p.phone||'', 'ep-phone')}
            </div>
            <div class="ep-row">
              ${editField('Age', p.age||'', 'ep-age')}
              ${editField('Emergency contact', p.emergency||'', 'ep-emergency')}
            </div>
            <div class="ap-comm">
              <div class="ap-field-l"><span>Preferred communication methods</span></div>
              <div class="comm-chips">
                ${COMM_METHODS.map(m=>`<button class="comm-chip ${pComm.includes(m)?'on':''}" data-cw-action="ep-toggle-comm" data-comm="${esc(m)}">${pComm.includes(m)?'<i data-lucide="check"></i>':''}${esc(m)}</button>`).join('')}
              </div>
            </div>
            <div class="ep-note">
              <i data-lucide="info"></i>
              <div><div class="bold small">Changing email re-issues the invite</div><div class="small">If the patient hasn't signed up yet, the old link will stop working.</div></div>
            </div>
            <div class="ep-toggle-row">
              <div class="body">
                <div class="bold small">Show compliance &amp; progress to patient</div>
                <div class="dim small" style="line-height:1.4;margin-top:2px">When on, the patient sees their score on Today, in their profile, and can open the progress view.</div>
              </div>
              <div class="switch ${visOn?'on':''}" data-cw-action="toggle-compliance-vis"></div>
            </div>
          </div>
          <div class="ep-foot">
            <button class="btn ghost danger" data-cw-action="ep-remove"><i data-lucide="trash-2"></i> Remove patient</button>
            <div class="row gap-2">
              <button class="btn" data-cw-action="ep-close">Cancel</button>
              <button class="btn primary" data-cw-action="ep-save" data-target="${esc(target)}">Save changes</button>
            </div>
          </div>
        </div>
      </div>`;
  }
  function editField(label, value, id) {
    return `
      <div class="ap-field">
        <div class="ap-field-l"><span>${esc(label)}</span></div>
        <div class="ap-input"><input id="${id}" value="${esc(value||'')}" /></div>
      </div>`;
  }
  function editSelect(label, value, options, id) {
    return `
      <div class="ap-field">
        <div class="ap-field-l"><span>${esc(label)}</span></div>
        <div class="ap-input ap-select">
          <select id="${id}"><option value="" ${!value?'selected':''}>Select…</option>${options.map(o=>`<option value="${esc(o)}" ${value===o?'selected':''}>${esc(o)}</option>`).join('')}</select>
          <i data-lucide="chevron-down"></i>
        </div>
      </div>`;
  }
  function tagFilterMenu() {
    const selected = nav.tagFilter || [];
    const library = S.tagLibrary || [];
    return `
      <div class="tag-menu" onclick="event.stopPropagation()">
        <div class="tag-menu-hd">Filter by tag</div>
        <div class="tag-menu-list">
          ${library.map(t => `
            <button class="tag-menu-row ${selected.includes(t.label)?'on':''}" data-cw-action="toggle-tag" data-tag="${esc(t.label)}">
              <span class="row gap-2 align-center">${renderTagChip(t.label, { small:true })}<span class="dim tiny">· ${t.patients}</span></span>
              ${selected.includes(t.label)?'<i data-lucide="check"></i>':''}
            </button>`).join('')}
        </div>
        ${selected.length?`<div class="tag-menu-ftr"><button class="btn sm" data-cw-action="clear-tag-filter">Clear</button></div>`:''}
      </div>
    `;
  }
  function tagModalTags() {
    if (nav.tagModal?.target === 'addPatient') return (S.addPatientFlow && S.addPatientFlow.tags) || [];
    return S.patient.tags;
  }
  function tagModalSubtitle() {
    if (nav.tagModal?.target === 'addPatient') {
      const f = S.addPatientFlow || {};
      const head = f.name || 'New patient';
      return `${esc(head)}${f.email ? ' · ' + esc(f.email) : ''}`;
    }
    return `${esc(S.patient.name)} · ${S.patient.age} y/o · ${esc(S.patient.pronouns)}`;
  }
  function tagSuggHtml() {
    const m = nav.tagModal || {};
    const raw = (m.q || '').trim();
    const q = raw.toLowerCase();
    const library = S.tagLibrary || [];
    const applied = tagModalTags();
    const matches = library.filter(t =>
      !applied.includes(t.label) &&
      (q === '' || t.label.toLowerCase().includes(q))
    );
    const exact = library.find(t => t.label.toLowerCase() === q);
    const alreadyApplied = q && applied.some(t => t.toLowerCase() === q);
    const canCreate = q && !exact && !alreadyApplied;
    const emptyHint = alreadyApplied
      ? `<div class="dim tiny" style="padding:8px"><b>"${esc(raw)}"</b> is already applied to this patient.</div>`
      : (q === '' ? '<div class="dim tiny" style="padding:8px">All library tags are already applied. Type to create a new one.</div>'
                  : '<div class="dim tiny" style="padding:8px">No matching tags. Type to create a new one.</div>');
    return `
      <div class="rx-modal-sec-lbl row between">
        <span>SUGGESTIONS</span>
        <span style="font-weight:500;text-transform:none;letter-spacing:0">${matches.length} match${matches.length===1?'':'es'}</span>
      </div>
      <div class="tag-sugg">
        ${matches.length===0 && !canCreate ? emptyHint : ''}
        ${matches.slice(0,5).map((t,i) => `
          <button class="tag-sugg-row ${i===0?'hl':''}" data-cw-action="tag-add" data-tag="${esc(t.label)}">
            <span class="row gap-2 align-center"><i data-lucide="tag"></i><span class="bold small">${esc(t.label)}</span><span class="dim tiny">· ${t.patients} patient${t.patients===1?'':'s'}</span></span>
            ${i===0 ? '<span class="kbd">↵ Add</span>' : '<i data-lucide="plus"></i>'}
          </button>`).join('')}
        ${canCreate ? `
          <button class="tag-sugg-row create" data-cw-action="tag-create" data-tag="${esc(q)}">
            <span class="row gap-2 align-center"><i data-lucide="plus"></i><span class="bold small">Create new tag</span><span class="bold small" style="color:#0F172A">"${esc(q)}"</span></span>
            <i data-lucide="arrow-up-right"></i>
          </button>` : ''}
      </div>`;
  }
  function tagModal() {
    const m = nav.tagModal;
    if (!m) return '';
    return `
      <div class="rx-modal-overlay" data-cw-action="tag-cancel">
        <div class="rx-modal" onclick="event.stopPropagation()">
          <div class="rx-modal-hdr">
            <div>
              <div class="rx-modal-title">Manage tags</div>
              <div class="rx-modal-sub">${tagModalSubtitle()}</div>
            </div>
            <button class="rx-modal-close" data-cw-action="tag-cancel"><i data-lucide="x"></i></button>
          </div>
          <div class="rx-modal-body">
            <div class="rx-modal-sec-lbl">APPLIED</div>
            <div class="row" style="gap:4px;flex-wrap:wrap">
              ${(() => { const ts = tagModalTags(); return ts.length===0 ? '<span class="dim tiny">No tags yet — add one below.</span>' : ts.map(t => renderTagChip(t, { removable:true })).join(''); })()}
            </div>
            <div class="rx-modal-sec-lbl">ADD A TAG</div>
            <div class="rx-field">
              <div class="tag-search">
                <i data-lucide="search"></i>
                <input id="cw-tag-input" type="text" autofocus value="${esc(m.q||'')}" placeholder="Search or create a tag..." />
              </div>
            </div>
            <div id="cw-tag-sugg-wrap">${tagSuggHtml()}</div>
          </div>
          <div class="rx-modal-ftr">
            <div class="dim tiny">Tip: tags help filter and group patients later</div>
            <div class="row gap-2">
              <button class="btn sm" data-cw-action="tag-cancel">Cancel</button>
              <button class="btn sm primary" data-cw-action="tag-done"><i data-lucide="check"></i> Done</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Settings (Profile + Integrations) ---------- */
  function settings() {
    return shell([{label:'Settings'}], `
      <div class="row gap-3" style="align-items:flex-start">
        <div class="card" style="width:220px;flex-shrink:0">
          <div class="kicker" style="margin-bottom:8px">Settings</div>
          <div class="col gap-2">
            <button class="btn sm ${nav.sub!=='integrations'?'primary':''}" data-cw-sub="profile"><i data-lucide="user"></i> Profile</button>
            <button class="btn sm ${nav.sub==='integrations'?'primary':''}" data-cw-go="integrations"><i data-lucide="share-2"></i> Integrations</button>
            <button class="btn sm ghost" style="justify-content:flex-start"><i data-lucide="bell"></i> Notifications</button>
            <button class="btn sm ghost" style="justify-content:flex-start"><i data-lucide="shield"></i> Security</button>
            <button class="btn sm ghost" style="justify-content:flex-start"><i data-lucide="users"></i> Team</button>
          </div>
        </div>
        <div style="flex:1">
          <h2 style="margin:0 0 12px">Profile</h2>
          <div class="card" style="margin-bottom:12px">
            <div class="row gap-3"><div class="avatar md rachel">${S.clinician.initials}</div>
              <div><div class="bold">${esc(S.clinician.name)}</div><div class="small muted">${esc(S.clinician.role)}</div><div class="small muted">${esc(S.clinician.email)}</div></div></div>
            <button class="btn sm" style="margin-top:10px"><i data-lucide="camera"></i> Change photo</button>
          </div>
          <div class="card">
            <div class="bold" style="margin-bottom:12px">Account details</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="field"><label>Full name</label><input value="${esc(S.clinician.name)}" /></div>
              <div class="field"><label>Email</label><input value="${esc(S.clinician.email)}" /></div>
            </div>
            <div class="row gap-2" style="justify-content:flex-end"><button class="btn sm">Cancel</button><button class="btn sm primary">Save changes</button></div>
          </div>
        </div>
      </div>
    `);
  }

  function integrations() {
    if (nav.sub === 'meet' || nav.sub === 'zoom') return integrationDemo(nav.sub);
    return shell([{label:'Settings',go:'settings'},{label:'Integrations'}], `
      <h2 style="margin:0 0 6px">Integrations</h2>
      <div class="small muted" style="margin-bottom:14px">Connect your call tools to automatically pull in session recordings.</div>
      <div class="kicker">Connected</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px">
        ${[['meet','Google Meet','<i data-lucide="video"></i>','Raw recordings · auto-imported','Sessions started in Google Meet automatically push the recording to Tend.'],
            ['zoom','Zoom','<i data-lucide="video"></i>','Raw recordings · auto-imported','Recordings from Zoom calls are queued for processing as soon as the session ends.'],
            ['emr','EMR','<i data-lucide="file-heart"></i>','Chart notes & assessments sync','Finalized notes and assessments are pushed to the patient\'s chart. Demographics and visit metadata pull in automatically.']].map(([k,n,ic,sub,d]) => `
          <div class="card" ${k==='emr'?'':`data-cw-sub="${k}" style="cursor:pointer"`}>
            <div class="row between">
              <div class="row gap-2"><div class="avatar sm" style="background:#f1f5f9">${ic}</div><div><div class="bold">${n}</div><div class="tiny muted">${sub}</div></div></div>
              <span class="chip green">Connected</span>
            </div>
            <div class="small muted" style="margin-top:8px">${d}</div>
          </div>`).join('')}
      </div>
      <div class="kicker">Available</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${[['otter','Otter.ai','<i data-lucide="audio-lines"></i>','Transcript provider'],['gcal','Google Calendar','<i data-lucide="calendar"></i>','Auto-create session slots']].map(([k,n,ic,sub])=>`
          <div class="card row between"><div class="row gap-2"><div class="avatar sm" style="background:#f1f5f9">${ic}</div><div><div class="bold">${n}</div><div class="tiny muted">${sub}</div></div></div><button class="btn sm">Connect</button></div>`).join('')}
      </div>
    `);
  }

  function integrationDemo(k) {
    const name = k==='meet' ? 'Google Meet' : 'Zoom';
    return shell([{label:'Settings',go:'settings'},{label:'Integrations',go:'integrations'},{label:name}], `
      <div class="row gap-3" style="align-items:flex-start">
        <div class="card" style="flex:1.4">
          <div class="row between"><div class="row gap-2"><div class="avatar sm" style="background:#f1f5f9">${k==='meet'?'<i data-lucide="video"></i>':'<i data-lucide="video"></i>'}</div><div><div class="bold">${name} <span class="chip green">Connected</span></div><div class="tiny muted">by ${k==='meet'?'Google':'Zoom'} · v2.1</div></div></div></div>
          <div class="bold" style="margin-top:14px">What this integration gives you</div>
          <div class="small muted" style="margin-top:4px">In production, starting a ${name} call with a patient automatically routes the recording to Tend's processing pipeline. The clinician doesn't need to upload anything manually.</div>
          <div class="integration-row" style="margin-top:14px">
            <div class="ic"><i data-lucide="audio-lines"></i></div><div class="meta"><div class="t">Raw recording</div><div class="s">Encrypted audio file, stored in Tend</div></div>
          </div>
        </div>
        <div class="card" style="flex:1;background:var(--amber-bg);border-color:#fde68a">
          <div class="row gap-2"><div class="avatar sm" style="background:#f59e0b;color:white"><i data-lucide="flask-conical"></i></div><div class="bold">In the POC</div></div>
          <div class="small" style="margin-top:8px;line-height:1.5">This integration is shown as connected for demo purposes. The actual recording capture is not wired — to push a session into the system, use "Upload session" on the patient profile and paste a transcription.</div>
          <button class="btn sm primary" style="margin-top:12px" data-cw-go="upload"><i data-lucide="upload"></i> Go to session upload</button>
        </div>
      </div>
    `);
  }

  /* ---------- Patient profile ---------- */
  function patientProfile() {
    const filter = nav.activityFilter;
    const lockCard = S.patientApp.locked ? `
      <div class="card" style="background:#fff1f2;border-color:#fecaca;margin-bottom:12px">
        <div class="row gap-3">
          <div class="avatar sm" style="background:var(--danger);color:white"><i data-lucide="triangle-alert"></i></div>
          <div style="flex:1"><div class="bold" style="color:#991b1b">URGENT — App locked</div><div class="small" style="color:#991b1b">${esc(S.patientApp.lockReason)}</div></div>
        </div>
        ${S.patientApp.lockQuote ? `<div style="padding:10px;background:white;border:1px solid #fecaca;border-radius:10px;margin-top:10px;font-style:italic;font-size:13px;line-height:1.5">"${esc(S.patientApp.lockQuote)}"</div>`:''}
        <div class="small muted" style="margin-top:8px"><i data-lucide="book-open"></i> Journal entry · "Reflections"</div>
        <div class="row gap-2" style="margin-top:10px"><button class="btn sm" data-cw-action="message-patient"><i data-lucide="message-square"></i> Message Chen</button><button class="btn sm primary" data-cw-action="unlock-patient"><i data-lucide="lock-open"></i> Unlock app</button></div>
      </div>` : '';

    return shell([{label:'Patients', go:'patients'},{label:esc(S.patient.name)}], `
      <div class="patient-header">
        <div class="avatar lg sarah">${S.patient.initials}</div>
        <div class="info">
          <h2>${esc(S.patient.name)} <button class="edit-btn" data-cw-action="edit-patient" title="Edit patient"><i data-lucide="pencil"></i></button> ${S.patient.tags.map(t=>renderTagChip(t)).join(' ')} <button class="chip-add" data-cw-action="open-tag-modal" title="Manage tags"><i data-lucide="plus"></i> Tag</button></h2>
          <div class="meta">${S.patient.age} y/o · ${esc(S.patient.sinceLabel)} · ${S.sessions.length} sessions</div>
        </div>
        <div class="right">
          <div class="label">Compliance <i data-lucide="trending-up"></i></div>
          <div class="val" data-cw-go="compliance">${S.compliance.value}<span style="font-size:14px">%</span></div>
          <div class="tiny dim">${esc(S.compliance.deltaLabel)}</div>
        </div>
      </div>
      <div class="web-actions">
        <button class="btn" data-cw-go="wholeLifePlan"><i data-lucide="clipboard-list"></i> Treatment plan</button>
        <button class="btn primary" data-cw-go="goals"><i data-lucide="pencil"></i> Edit goals</button>
        <button class="btn" data-cw-go="upload"><i data-lucide="upload"></i> Upload session</button>
        <button class="btn" data-cw-go="messaging"><i data-lucide="message-square"></i> Send message</button>
        <button class="btn" data-cw-action="open-dp-add"><i data-lucide="plus"></i> Add data point</button>
      </div>
      ${lockCard}
      <div class="split">
        <div class="panel">
          ${profileLeftPane()}
        </div>
        <div class="card scroll-card">
          <div class="scroll-card-head">
            <div class="panel-head">
              <h3>Activity ${S.activity.filter(a=>!a.read).length?`<span class="chip red" style="margin-left:6px">${S.activity.filter(a=>!a.read).length} unread</span>`:''}</h3>
              <div class="tabs-strip">
                ${DATA_TABS.map(([k,l])=>
                  `<button class="${filter===k?'active':''}" data-cw-filter="${k}">${l}</button>`).join('')}
              </div>
              ${dataSubToggle(filter, 'profile')}
            </div>
          </div>
          <div class="scroll-card-body">${renderDataPane(filter)}</div>
        </div>
      </div>
      ${tagModal()}
      ${dpModal()}
    `);
  }

  function profileAssessmentCard() {
    const v = S.assessment.currentVersion;
    const a = S.assessment.versions[v];
    return `
      <div class="panel-head">
        <div>
          <h3 style="margin:0">Assessment</h3>
          <div class="small muted" style="margin-top:2px">v${v} · cumulative · last edited ${esc(a.date)}</div>
        </div>
        <button class="btn primary sm" data-cw-go="assessment"><i data-lucide="clipboard-list"></i> Open assessment</button>
      </div>
      <div class="small" style="margin-top:14px;line-height:1.6">${esc(a.body)}</div>
    `;
  }
  // Patient-profile left pane: tab selector (Assessment / Treatment plan / Goals) over the active card.
  function profileLeftPane() {
    const tabs = [['assessment','Assessment'],['wlp','Treatment plan'],['goals','Goals']];
    const seg = `<div class="sub-seg" style="margin-bottom:14px">
      ${tabs.map(([k,l])=>`<button class="${nav.profileTab===k?'active':''}" data-cw-ptab="${k}">${l}</button>`).join('')}
    </div>`;
    let body = '';
    if (nav.profileTab === 'wlp') body = profileWlpCard();
    else if (nav.profileTab === 'goals') body = profileGoalsCard();
    else body = profileAssessmentCard();
    return seg + body;
  }
  function profileWlpCard() {
    const v = S.wholeLifePlan.currentVersion;
    const ver = S.wholeLifePlan.versions[v];
    const cats = S.wholeLifePlan.categories;
    return `
      <div class="panel-head">
        <div><h3 style="margin:0">Treatment plan</h3><div class="small muted" style="margin-top:2px">${cats.length} life categories · v${v} · last edited ${esc(ver.date)}</div></div>
        <button class="btn primary sm" data-cw-go="wholeLifePlan"><i data-lucide="clipboard-list"></i> Open builder</button>
      </div>
      ${cats.map(c => { const o = ver.objectives[c]; return `
        <div style="margin-top:12px">
          <div class="kicker" style="color:#0F766E;letter-spacing:0.5px">${esc(c).toUpperCase()}</div>
          <div class="small" style="margin-top:4px;line-height:1.55;${o?'':'color:#94a3b8;font-style:italic'}">${o?esc(o):'No objective set yet.'}</div>
        </div>`; }).join('')}
    `;
  }
  function profileGoalsCard() {
    const rxs = (S.goals.versions[S.goals.currentVersion]||{}).rxs || [];
    return `
      <div class="panel-head">
        <div><h3 style="margin:0">Goals</h3><div class="small muted" style="margin-top:2px">${rxs.length} prescriptions · v${S.goals.currentVersion}</div></div>
        <button class="btn primary sm" data-cw-go="goals"><i data-lucide="pencil"></i> Edit goals</button>
      </div>
      ${rxs.map(r => `
        <div class="rx-card" style="margin-top:10px">
          <div class="head"><div class="type">${esc(r.type)}</div></div>
          <div class="title">${esc(r.title)}</div>
          <div class="meta">${esc(r.trigger)}</div>
        </div>`).join('')}
    `;
  }
  function sharedBySource() {
    return S.sharedData.bySource.map(s => `
      <div class="shared-source">
        <div class="src-h"><div class="name"><span>${s.icon}</span> ${esc(s.name)}</div><div class="count">${esc(s.updated)}</div></div>
        ${s.items.map(it => `
          <div class="shared-row"><div class="ev-ic" style="background:#f1f5f9">·</div>
            <div class="body">${esc(it.label)} ${it.tag==='flagged'?'<span class="chip red">FLAGGED</span>':''}</div>
            <div class="val">${esc(it.value)}</div>
          </div>`).join('')}
      </div>`).join('');
  }
  function sharedTimeline() {
    return `
      <div class="search" style="margin:0 0 8px"><span><i data-lucide="search"></i></span><input placeholder="Search, filter" /></div>
      <div class="timeline">
        ${S.sharedData.timeline.map(t => `
          <div class="tl-item ${t.flagged?'flagged':''}">
            <div class="date">${esc(t.date)}</div>
            <div class="bold small" style="margin-top:2px">${esc(t.label)} ${t.flagged?'<span class="chip red">FLAGGED</span>':''}</div>
            <div class="tiny muted">${esc(t.meta)}</div>
          </div>`).join('')}
      </div>
      <div class="dim small" style="text-align:center;margin-top:10px">Load earlier <i data-lucide="chevron-down"></i></div>
    `;
  }

  /* ---------- Messaging ---------- */
  function messaging() {
    return shell([{label:'Messages'}], `
      <div class="messages-shell">
        <div class="msg-list">
          <div class="kicker" style="padding:10px 14px">Conversations</div>
          <div class="search" style="margin:0 10px 6px"><span><i data-lucide="search"></i></span><input placeholder="Search..." /></div>
          <div class="conv active">
            <div class="avatar sm sarah">CV</div>
            <div class="body"><div class="t">${esc(S.patient.name)} <span class="dim tiny">3h</span></div><div class="p">${esc(S.messages[S.messages.length-1]?.text || '')}</div></div>
          </div>
        </div>
        <div class="msg-pane">
          <div class="msg-header">
            <div class="row gap-2"><div class="avatar sm sarah">CV</div><div><div class="bold small">${esc(S.patient.name)}</div><div class="tiny muted">${S.patient.tags.join(' · ')} · Patient since Nov 2025</div></div></div>
            <button class="btn sm" data-cw-go="patient">View profile</button>
          </div>
          <div class="msg-thread" id="cw-msg-thread">
            <div class="day">Today · 15:42</div>
            ${S.messages.map(m => `<div class="bubble ${m.from==='rachel'?'out':'in'}">${esc(m.text)}</div>`).join('')}
          </div>
          <div class="msg-input"><input id="cw-msg-input" placeholder="Type a message..." /><button class="btn primary sm" data-cw-action="msg-send"><i data-lucide="upload"></i></button></div>
        </div>
      </div>
    `);
  }

  /* ---------- Session upload ---------- */
  function upload() {
    return shell([{label:'Patients',go:'patients'},{label:esc(S.patient.name),go:'patient'},{label:'New session'}], `
      <div class="card" style="text-align:center;padding:18px;max-width:880px;margin:0 auto">
        <h2 style="margin:0">Add a new session</h2>
        <div class="small muted">${esc(S.patient.name)} · Session #${(S.sessions[S.sessions.length-1]?.num || 12) + 1} · Wed, May 27</div>
        <div class="upload-tiles">
          <div class="upload-tile" data-cw-action="upload-recording">
            <div class="ic"><i data-lucide="video"></i></div><h4>From recording</h4>
            <div class="sub">Start a call in Meet or Zoom — recordings push automatically.</div>
            <span class="chip amber" style="align-self:flex-start">POC stub</span>
          </div>
          <div class="upload-tile featured" data-cw-action="upload-transcription">
            <div class="ic"><i data-lucide="file-text"></i></div><h4>From transcription</h4>
            <div class="sub">Paste the transcript. Tend will draft notes and assessment.</div>
            <div class="cta"><i data-lucide="arrow-right"></i> Continue</div>
          </div>
          <div class="upload-tile" data-cw-action="upload-manual">
            <div class="ic"><i data-lucide="pencil"></i></div><h4>Manually</h4><div class="sub">Skip the recording — write the note and goals directly.</div>
          </div>
        </div>
        <button class="btn sm" style="margin-top:14px" data-cw-action="upload-notes"><i data-lucide="share-2"></i> From notes only</button>
      </div>
      ${uploadModal()}
    `);
  }

  function uploadModal() {
    const m = nav.uploadModal;
    if (!m) return '';
    const isTranscript = m.kind === 'transcript';
    const num = (S.sessions[S.sessions.length-1]?.num || 12) + 1;
    const title = isTranscript ? 'Paste transcription' : 'Paste existing note';
    const sub = isTranscript
      ? 'Tend will auto-draft the note from the transcript.'
      : "You'll review it in the template on the next step. No raw transcript.";
    const lbl = isTranscript ? 'TRANSCRIPT' : 'NOTE';
    const placeholder = isTranscript
      ? 'Paste the session transcript here...'
      : "Paste your session note here. You'll review it in the template on the next step.";
    const submitAction = isTranscript ? 'submit-transcript' : 'submit-notes';
    const submitLabel = isTranscript ? 'Create session' : 'Review in template';
    return `
      <div class="rx-modal-overlay" data-cw-action="upload-cancel">
        <div class="rx-modal" onclick="event.stopPropagation()">
          <div class="rx-modal-hdr">
            <div>
              <div class="rx-modal-title">${title}</div>
              <div class="rx-modal-sub">${sub}</div>
            </div>
            <button class="rx-modal-close" data-cw-action="upload-cancel"><i data-lucide="x"></i></button>
          </div>
          <div class="rx-modal-body">
            <div class="small muted">${esc(S.patient.name)} · Session #${num} · Wed, May 27${isTranscript?'':' · No raw transcript'}</div>
            <div class="rx-modal-sec-lbl">${lbl}</div>
            <div class="rx-field">
              <textarea id="cw-upload-input" rows="10" placeholder="${placeholder}"></textarea>
            </div>
            <div class="row gap-2" style="color:#94a3b8;font-size:10px;align-items:center"><i data-lucide="upload" style="width:12px;height:12px"></i> Or drag and drop a .txt / .docx file</div>
          </div>
          <div class="rx-modal-ftr">
            <div></div>
            <div class="row gap-2">
              <button class="btn sm" data-cw-action="upload-cancel">Cancel</button>
              <button class="btn sm dark" data-cw-action="${submitAction}">${submitLabel} <i data-lucide="arrow-right"></i></button>
            </div>
          </div>
        </div>
      </div>`;
  }

  function createSession({ transcript=null, note=null, src='Manual entry' } = {}) {
    const num = (S.sessions[S.sessions.length-1]?.num || 12) + 1;
    const id = 's' + num;
    const noteFields = note
      ? { summary:'', subjective:'', objective:'', assessmentPlan: note.split('\n').slice(0,3).join(' ') }
      : { summary:'', subjective:'', objective:'', assessmentPlan:'' };
    S.sessions.push({
      id, num, date:'today', duration:'-', src,
      stages:{ raw: !!transcript, note: !!note, dataPoints:false },
      note: noteFields,
      planVersion: 'v' + S.goals.currentVersion,
      assessmentVersion: S.assessment.currentVersion,
      wholeLifePlanVersion: S.wholeLifePlan.currentVersion,
      transcript: transcript || undefined,
    });
    addActivity({ type:'session', t:'now', title:`Session #${num} created`, meta:`${src} · awaiting ${note?'data points':'note'}` });
    return id;
  }

  /* ---------- Note editor ---------- */
  function noteEditor() {
    const s = S.sessions.find(x => x.id === nav.sessionId) || S.sessions[S.sessions.length-1];
    const tx = s.transcript;
    const transcriptBody = Array.isArray(tx)
      ? tx.map(t => `
          <div class="transcript-turn">
            <div class="who ${t.who === S.clinician.name.split(' ')[0] || t.who === 'Shari' ? 'clin' : 'pat'}">${esc(t.who)}</div>
            <div class="line">${esc(t.text)}</div>
          </div>`).join('')
      : (typeof tx === 'string' && tx.trim()
          ? `<div class="transcript-raw">${esc(tx)}</div>`
          : `<div class="transcript-empty"><i data-lucide="file-x"></i> No transcript was uploaded for this session.</div>`);
    return shell([{label:esc(S.patient.name),go:'patient'},{label:`Session #${s.num} · Note`}], `
      <div class="row between" style="margin-bottom:12px;flex:0 0 auto">
        <div class="row gap-2"><div class="bold small">Template:</div>
          <select class="btn sm" style="width:auto"><option>default <i data-lucide="chevron-down"></i></option></select>
        </div>
        <div class="row gap-2">
          <button class="btn" data-cw-action="note-save"><i data-lucide="check"></i> Save</button>
          <button class="btn primary" data-cw-action="note-next">Save and Continue: Data points <i data-lucide="arrow-right"></i></button>
        </div>
      </div>
      <div class="split">
        <div class="card">
          <div class="field"><label>Session date</label><input value="May 23, 2026 · 14:00" /></div>
          <div class="field"><label>Session summary <span class="chip purple"><i data-lucide="sparkles"></i> AI drafted</span></label>
            <textarea id="cw-note-summary" style="min-height:72px">${esc(s.note.summary || '')}</textarea></div>
          <div class="field"><label>Subjective <span class="chip purple"><i data-lucide="sparkles"></i> AI drafted</span></label>
            <textarea id="cw-note-subjective">${esc(s.note.subjective || '')}</textarea></div>
          <div class="field"><label>Objective <span class="chip purple"><i data-lucide="sparkles"></i> AI drafted</span></label>
            <textarea id="cw-note-objective">${esc(s.note.objective || '')}</textarea></div>
          <div class="field"><label>Assessment and Plan <span class="chip purple"><i data-lucide="sparkles"></i> AI drafted</span></label>
            <textarea id="cw-note-assessment-plan" style="min-height:150px">${esc(s.note.assessmentPlan || '')}</textarea></div>
        </div>
        <div class="card scroll-card">
          <div class="scroll-card-head">
            <div class="panel-head"><h3><i data-lucide="file-text"></i> Raw transcript</h3>
              <span class="tiny" style="color:var(--ink-3)">${esc(s.src)} · ${esc(s.date.trim())} · ${esc(s.duration)}</span>
            </div>
          </div>
          <div class="scroll-card-body">${transcriptBody}</div>
        </div>
      </div>
    `);
  }

  /* ---------- Assessment ---------- */
  function assessment() {
    const v = nav.assessmentVersion || S.assessment.currentVersion;
    const isCurrent = v === S.assessment.currentVersion;
    const a = S.assessment.versions[v];
    return shell([{label:esc(S.patient.name),go:'patient'},{label:`Assessment · v${v} ${isCurrent?'· cumulative':''}`}], `
      ${!isCurrent ? `
      <div class="banner amber" style="margin-bottom:10px">
        <div><span class="bold">Viewing an older version from ${esc(a.date)}.</span> This is no longer the current assessment. Chen's plan & sessions reference the live version.</div>
        <div class="actions"><button class="btn sm primary" data-cw-action="assess-current">Return to current (v${S.assessment.currentVersion}) <i data-lucide="arrow-right"></i></button></div>
      </div>` : ''}
      ${isCurrent ? `
      <div class="row between" style="margin-bottom:10px;flex:0 0 auto">
        <div></div>
        <div class="row gap-2">
          <button class="btn sm" data-cw-action="assess-discard">Discard changes</button>
          <button class="btn primary sm" data-cw-action="assess-save"><i data-lucide="check"></i> Save v${v+1}</button>
        </div>
      </div>` : ''}
      <div class="assess-split">
        <div class="card assess-pane">
          <div class="panel-head">
            <div>
              <h4>Cumulative assessment ${!isCurrent?'<span class="chip gray"><i data-lucide="lock"></i> Read-only</span>':''}</h4>
              <div class="assess-sub">${isCurrent ? 'Free-text diagnostic write-up. Edits create a new version.' : `Snapshot at session #${esc((S.sessions.find(x=>x.id===a.sessionId)?.num)||'')} · authored by ${esc(a.authoredBy)}`}</div>
            </div>
            ${!isCurrent ? '<button class="btn sm"><i data-lucide="git-compare"></i> Compare with current</button>' : ''}
          </div>
          <div class="assess-section">
            ${isCurrent ? `<textarea id="cw-a-body" style="width:100%;padding:12px 14px;border:1px solid var(--line-2);border-radius:10px;font-family:inherit;font-size:13px;line-height:1.6;min-height:340px;outline:none">${esc(a.body)}</textarea>`
              : `<div class="body" style="line-height:1.6">${esc(a.body)}</div>`}
          </div>
        </div>
        <div class="card ${isCurrent?'scroll-card':''}">
          ${isCurrent ? `
            <div class="scroll-card-head">
              <div class="panel-head"><h3>Data side</h3>
                <div class="search-pill" style="min-width:140px"><input placeholder="e.g. 'sleep'" /></div>
              </div>
              <div class="tabs-row">
                <div class="tabs-strip">
                  ${DATA_TABS.map(([k,l])=>
                    `<button class="${nav.assessDataTab===k?'active':''}" data-cw-assess-tab="${k}">${l}</button>`).join('')}
                </div>
                ${dataSubToggle(nav.assessDataTab, 'assess')}
              </div>
            </div>
            <div class="scroll-card-body">
              ${renderDataPane(nav.assessDataTab)}
              <div class="card" style="background:var(--purple-soft);border-color:#ddd6fe;margin-top:12px;padding:10px 12px">
                <div class="bold small" style="color:var(--purple)"><i data-lucide="sparkles"></i> Suggested addition</div>
                <div class="tiny" style="color:var(--purple);margin-top:4px;line-height:1.5">Pattern: phone-related avoidance pre-bed correlates with attachment-related work stressors. Consider naming this loop explicitly in the write-up.</div>
              </div>
            </div>
          ` : `
            <div class="panel-head"><h3>Version history</h3></div>
            ${versionList(v)}
          `}
        </div>
      </div>
      ${dpModal()}
    `);
  }
  function assessDataPane() {
    const t = nav.assessDataTab;
    if (t === 'timeline') {
      return `<div class="timeline">
        ${S.sharedData.timeline.slice(0,4).map(t => `
          <div class="tl-item ${t.flagged?'flagged':''}">
            <div class="date">${esc(t.date)}</div>
            <div class="bold small">${esc(t.label)}</div>
            <div class="tiny muted">${esc(t.meta)}</div>
          </div>`).join('')}
      </div>`;
    }
    if (t === 'sessions') {
      return S.sessions.slice().reverse().map(s => `
        <div class="event-row" data-cw-action="open-session" data-id="${s.id}" style="cursor:pointer">
          <div class="ev-ic"><i data-lucide="file-text"></i></div>
          <div class="body"><div class="t">Session #${s.num} · ${esc(s.date)}</div><div class="m">"${esc((s.note?.summary||s.note?.assessmentPlan||'').slice(0,90))}..."</div></div>
          <div class="dim tiny">${esc(s.duration)}</div>
        </div>`).join('');
    }
    if (t === 'shared') {
      return S.sharedData.bySource.map(s => `
        <div class="shared-source">
          <div class="src-h"><div class="name"><span>${s.icon}</span> ${esc(s.name)}</div><div class="count">${esc(s.updated)}</div></div>
          ${s.items.map(it => `
            <div class="shared-row"><div class="ev-ic" style="background:#f1f5f9">·</div>
              <div class="body">${esc(it.label)} ${it.tag==='flagged'?'<span class="chip red">FLAGGED</span>':''}</div>
              <div class="val">${esc(it.value)}</div>
            </div>`).join('')}
        </div>`).join('');
    }
    if (t === 'messages') {
      return `<div class="col gap-2">
        ${S.messages.slice().reverse().map(m => `
          <div class="event-row" style="cursor:pointer" data-cw-action="open-messages">
            <div class="ev-ic">${m.from==='rachel'?'<i data-lucide="user"></i>':'<i data-lucide="message-square"></i>'}</div>
            <div class="body"><div class="t">${m.from==='rachel'?esc(S.clinician.name.split(' ')[0]):esc(S.patient.name)}</div><div class="m">"${esc(m.text.slice(0,110))}${m.text.length>110?'…':''}"</div></div>
            <div class="dim tiny">${esc(m.at)}</div>
          </div>`).join('')}
      </div>`;
    }
    return '';
  }

  function versionList(v) {
    const items = Object.keys(S.assessment.versions).map(n=>parseInt(n)).sort((a,b)=>b-a);
    return `
      <div class="bold small" style="margin-bottom:6px">${items.length} versions over ${S.sessions.length} sessions</div>
      ${items.map(n => {
        const a = S.assessment.versions[n];
        const isCur = n === S.assessment.currentVersion;
        return `<div class="event-row" style="border:1px solid ${n===v?'#fcd34d':'transparent'};background:${n===v?'var(--warning-soft)':''}" data-cw-action="assess-pick" data-v="${n}">
          <div class="ev-ic" style="background:${isCur?'var(--primary-tint)':'#f1f5f9'};color:${isCur?'var(--primary)':'#475569'}">v${n}</div>
          <div class="body"><div class="t">${isCur?'<span class="chip green">Current</span>':''} ${esc(a.date)} edit</div><div class="m tiny">${esc(a.date)} · session #${esc((S.sessions.find(x=>x.id===a.sessionId)?.num)||'')}</div></div>
          ${n===v?'<span class="chip amber">VIEWING</span>':''}
        </div>`;
      }).join('')}
    `;
  }

  /* ---------- Goals builder ---------- */
  function goals() {
    const draft = S.goals.draft || cloneVersion(S.goals.currentVersion);
    S.goals.draft = draft;
    const newV = S.goals.currentVersion + 1;
    return shell([{label:esc(S.patient.name),go:'patient'},{label:`Goals`, },{label:`DRAFT v${newV}`}], `
      <div class="tx-builder-layout">
        <div class="row between" style="margin-bottom:10px;flex:0 0 auto">
          <div></div>
          <div class="row gap-2"><button class="btn sm" data-cw-action="tx-discard">Discard changes</button><button class="btn primary sm" data-cw-action="tx-publish"><i data-lucide="check"></i> Publish v${newV}</button></div>
        </div>
        <div class="tx-split">
          <div class="card scroll-card">
            <div class="scroll-card-head">
              <div class="row between">
                <div><h3 style="margin:0">Prescriptions</h3><div class="small muted">${draft.rxs.length} prescriptions · 1 new suggestion</div></div>
                <button class="btn sm primary" data-cw-action="tx-add"><i data-lucide="plus"></i> Add prescription</button>
              </div>
            </div>
            <div class="scroll-card-body">
              ${suggestedRxCard()}
              ${draft.rxs.map(r => `
                <div class="rx-card">
                  <div class="head"><div class="type">${esc(r.type)}</div><button class="btn sm ghost" data-cw-action="tx-edit" data-id="${r.id}"><i data-lucide="pencil"></i></button></div>
                  <div class="title">${esc(r.title)}</div>
                  <div class="meta">Trigger<br/>${esc(r.trigger)}</div>
                </div>`).join('')}
            </div>
          </div>
          <div class="card scroll-card">
            <div class="scroll-card-head">
              ${txAssessmentBanner()}
              <h3 style="margin:0">Patient context</h3>
              <div class="small muted" style="margin:4px 0 10px">Browse assessment, sessions, and shared data while you build the goals.</div>
              <div class="search-pill" style="margin-bottom:10px;width:100%"><span><i data-lucide="search"></i></span><input placeholder='e.g. "sleep", "panic"' /></div>
              <div class="tabs-row">
                <div class="tabs-strip">
                  ${DATA_TABS.map(([k,l])=>
                    `<button class="${nav.txDataTab===k?'active':''}" data-cw-tx-tab="${k}">${l}</button>`).join('')}
                </div>
                ${dataSubToggle(nav.txDataTab, 'tx')}
              </div>
            </div>
            <div class="scroll-card-body">${renderDataPane(nav.txDataTab)}</div>
          </div>
        </div>
      </div>
      ${rxModal()}
      ${dpModal()}
    `);
  }
  /* ---------- Whole Life Plan (treatment plan) builder ---------- */
  function cloneWlp(v) {
    const src = S.wholeLifePlan.versions[v] || { objectives: {} };
    return { objectives: { ...src.objectives } };
  }
  function wholeLifePlan() {
    const fresh = !nav.wlpDraft;
    const draft = nav.wlpDraft || cloneWlp(S.wholeLifePlan.currentVersion);
    nav.wlpDraft = draft;
    if (fresh) nav.wlpPage = 0;
    const newV = S.wholeLifePlan.currentVersion + 1;
    const cats = S.wholeLifePlan.categories;
    const PER_PAGE = 4;
    const pageCount = Math.ceil(cats.length / PER_PAGE);
    const page = Math.min(nav.wlpPage || 0, pageCount - 1);
    const pageCats = cats.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
    return shell([{label:esc(S.patient.name),go:'patient'},{label:`Treatment plan`},{label:`DRAFT v${newV}`}], `
      <div class="tx-builder-layout">
        <div class="row between" style="margin-bottom:10px;flex:0 0 auto">
          <div></div>
          <div class="row gap-2"><button class="btn sm" data-cw-action="wlp-discard">Discard changes</button><button class="btn primary sm" data-cw-action="wlp-publish"><i data-lucide="check"></i> Publish v${newV}</button></div>
        </div>
        <div class="tx-split">
          <div class="card scroll-card">
            <div class="scroll-card-head">
              <div class="row between">
                <div><h3 style="margin:0">Treatment plan</h3><div class="small muted">${cats.length} life categories · ${pageCount} pages</div></div>
                <span class="chip gray">Page ${page+1} of ${pageCount}</span>
              </div>
            </div>
            <div class="scroll-card-body">
              ${page === 0 ? `
              <div class="card" style="background:var(--purple-soft);border-color:#ddd6fe;margin-bottom:12px;padding:12px 14px">
                <div class="bold small" style="color:var(--purple)"><i data-lucide="sparkles"></i> Suggested objective · Nutrition</div>
                <div class="tiny" style="color:var(--purple);margin-top:4px;line-height:1.5">Move the caffeine cutoff earlier to 14:00 — sleep-onset latency averages 90 min on days with caffeine after 16:00.</div>
              </div>` : ''}
              ${pageCats.map((c) => { const i = cats.indexOf(c); return `
                <div class="rx-card" style="margin-bottom:10px">
                  <div class="head"><div class="type">${esc(c)}</div></div>
                  <textarea id="cw-wlp-${i}" class="wlp-cat" rows="2" placeholder="Objective for ${esc(c)}…" style="width:100%;margin-top:8px;padding:10px 12px;border:1px solid var(--line-2);border-radius:10px;font-family:inherit;font-size:13px;line-height:1.5;outline:none">${esc(draft.objectives[c]||'')}</textarea>
                </div>`; }).join('')}
              <div class="wlp-pager">
                <button class="btn sm" ${page>0?`data-cw-action="wlp-page" data-page="${page-1}"`:'disabled'}><i data-lucide="chevron-left"></i> Prev</button>
                <div class="wlp-dots">${Array.from({length:pageCount},(_,p)=>`<span class="dot ${p===page?'on':''}"></span>`).join('')}</div>
                <button class="btn sm dark" ${page<pageCount-1?`data-cw-action="wlp-page" data-page="${page+1}"`:'disabled'}>Next <i data-lucide="chevron-right"></i></button>
              </div>
            </div>
          </div>
          <div class="card scroll-card">
            <div class="scroll-card-head">
              ${txAssessmentBanner()}
              <h3 style="margin:0">Patient context</h3>
              <div class="small muted" style="margin:4px 0 10px">Browse the assessment, sessions, and shared data while you write the treatment plan.</div>
              <div class="search-pill" style="margin-bottom:10px;width:100%"><span><i data-lucide="search"></i></span><input placeholder='e.g. "sleep", "panic"' /></div>
              <div class="tabs-row">
                <div class="tabs-strip">
                  ${DATA_TABS.map(([k,l])=>`<button class="${nav.wlpDataTab===k?'active':''}" data-cw-wlp-tab="${k}">${l}</button>`).join('')}
                </div>
                ${dataSubToggle(nav.wlpDataTab, 'wlp')}
              </div>
            </div>
            <div class="scroll-card-body">${renderDataPane(nav.wlpDataTab)}</div>
          </div>
        </div>
      </div>
      ${dpModal()}
    `);
  }
  function typeLabel(t) {
    return ({sleep:'Sleep schedule', medication:'Medication', journaling:'Journaling', exercise:'Exercise'})[t] || t || '';
  }
  // Per-type ACTION fields for the prescription modal (matches the structured Pencil mockups).
  function rxField(label, id, value, ph) {
    return `<div class="rx-field"><label>${label}</label><input id="${id}" type="text" value="${esc(value||'')}" placeholder="${ph}" /></div>`;
  }
  function rxActionFields(t, rx) {
    const p = rx.params || {};
    if (t === 'sleep') return rxField('Bedtime target','cw-rx-bedtime',p.bedtime,'e.g. 22:00')
      + `<div class="rx-field-row">${rxField('Minimum duration','cw-rx-minDur',p.minDur,'e.g. 7 h')}${rxField('Wake target','cw-rx-wake',p.wake,'e.g. 06:30')}</div>`;
    if (t === 'medication') return `<div class="rx-field-row">${rxField('Medication','cw-rx-med',p.med,'e.g. Sertraline')}${rxField('Dose','cw-rx-dose',p.dose,'e.g. 50mg')}</div>`;
    if (t === 'journaling') return rxField('Prompt / exercise','cw-rx-prompt',p.prompt,"e.g. 3 things you're grateful for");
    if (t === 'exercise') return `<div class="rx-field-row">${rxField('Exercise','cw-rx-exercise',p.exercise,'e.g. 4-7-8 Breathwork')}${rxField('Repetitions / duration','cw-rx-reps',p.reps,'e.g. 4 cycles')}</div>`;
    return '';
  }
  function rxComposeTitle(rx) {
    const p = rx.params || {};
    if (rx.type === 'sleep')      return p.bedtime ? `Be asleep by ${p.bedtime}` : (rx.title || 'Sleep schedule');
    if (rx.type === 'medication') return (p.med || p.dose) ? `Take ${[p.med,p.dose].filter(Boolean).join(' ')}` : (rx.title || 'Medication');
    if (rx.type === 'journaling') return p.prompt || rx.title || 'Journaling';
    if (rx.type === 'exercise')   return p.exercise ? `${p.exercise}${p.reps?` (${p.reps})`:''}` : (rx.title || 'Exercise');
    return rx.title || '(untitled)';
  }
  function rxModal() {
    const m = nav.rxModal;
    if (!m) return '';
    const isEdit = m.mode === 'edit';
    const rx = m.rx;
    const t = rx.type;
    const types = [['sleep','Sleep','moon'],['medication','Medication','pill'],['journaling','Journaling','book-open'],['exercise','Exercise','activity']];
    const titlePh = t==='sleep'?'e.g. Be asleep by 22:00':t==='medication'?'e.g. Take Sertraline 50mg':t==='journaling'?'e.g. 3 things you\'re grateful for':t==='exercise'?'e.g. 4-7-8 Breathwork':'Pick a type above first';
    const triggerPh = rx.triggerKind==='situation'?'e.g. when stress is high (HR > 95 sustained)':'e.g. Daily 08:00';
    return `
      <div class="rx-modal-overlay" data-cw-action="rx-cancel">
        <div class="rx-modal" onclick="event.stopPropagation()">
          <div class="rx-modal-hdr">
            <div>
              <div class="rx-modal-title">${isEdit?'Edit · '+esc(typeLabel(rx.type)):'Add prescription'+(t?' · '+esc(typeLabel(t)):'')}</div>
              <div class="rx-modal-sub">${isEdit?'Adjust the action, trigger, or rules.':(t?'Fill in the parameters, then add to plan.':'Choose a type to begin.')}</div>
            </div>
            <button class="rx-modal-close" data-cw-action="rx-cancel"><i data-lucide="x"></i></button>
          </div>
          <div class="rx-modal-body">
            <div class="rx-modal-sec-lbl">TYPE</div>
            <div class="rx-type-row">
              ${types.map(([k,l,ic]) => `
                <button class="rx-chip ${t===k?'active':''}" ${isEdit?'disabled':`data-cw-action="rx-pick-type" data-type="${k}"`}>
                  <i data-lucide="${ic}"></i><span>${l}</span>
                </button>`).join('')}
            </div>
            ${!t ? `
              <div class="rx-empty-hint">
                <i data-lucide="arrow-up"></i>
                <div class="rx-empty-title">Pick a type to continue</div>
                <div class="rx-empty-sub">The action, trigger, and rules fields adapt to the type you choose.</div>
              </div>
            ` : `
              <div class="rx-modal-sec-lbl">ACTION</div>
              ${rxActionFields(t, rx)}
              <div class="rx-modal-sec-lbl">TRIGGER</div>
              <div class="rx-segmented">
                <button class="${rx.triggerKind!=='situation'?'active':''}" data-cw-action="rx-trig-kind" data-kind="time">Time-based</button>
                <button class="${rx.triggerKind==='situation'?'active':''}" data-cw-action="rx-trig-kind" data-kind="situation">Situation-based</button>
              </div>
              <div class="rx-field">
                <label>${rx.triggerKind==='situation'?'Condition':'Cadence'}</label>
                <input id="cw-rx-trigger" type="text" value="${esc(rx.triggerDetail||'')}" placeholder="${triggerPh}" />
              </div>
              <div class="rx-modal-sec-lbl">INSTRUCTIONS / RULES</div>
              <div class="rx-field">
                <label>Notes for the patient</label>
                <textarea id="cw-rx-rules" rows="3" placeholder="Optional rules, fallbacks, limits…">${esc(rx.rules||'')}</textarea>
              </div>
            `}
          </div>
          <div class="rx-modal-ftr">
            <div>${isEdit?`<button class="btn sm danger" data-cw-action="rx-remove"><i data-lucide="trash-2"></i> Remove</button>`:''}</div>
            <div class="row gap-2">
              <button class="btn sm" data-cw-action="rx-cancel">Cancel</button>
              <button class="btn sm primary" ${t?'':'disabled'} data-cw-action="rx-save"><i data-lucide="check"></i> ${isEdit?'Save changes':'Add to plan'}</button>
            </div>
          </div>
        </div>
      </div>`;
  }
  function readRxInputs() {
    if (!nav.rxModal) return;
    const rx = nav.rxModal.rx;
    const g = id => document.getElementById(id);
    const tr = g('cw-rx-trigger'); if (tr) rx.triggerDetail = tr.value;
    const ru = g('cw-rx-rules');   if (ru) rx.rules = ru.value;
    rx.params = rx.params || {};
    const map = { 'cw-rx-bedtime':'bedtime','cw-rx-minDur':'minDur','cw-rx-wake':'wake','cw-rx-med':'med','cw-rx-dose':'dose','cw-rx-prompt':'prompt','cw-rx-exercise':'exercise','cw-rx-reps':'reps' };
    Object.entries(map).forEach(([id,key]) => { const el = g(id); if (el) rx.params[key] = el.value; });
  }
  function txDataPane() {
    const t = nav.txDataTab;
    const assessmentCard = `
      <div class="card" style="padding:10px 12px;margin-bottom:8px;background:#fafaf7">
        <div class="bold small"><i data-lucide="clipboard-list"></i> Cumulative assessment <span class="chip gray">v${S.assessment.currentVersion} · current</span> <span class="dim tiny">· ${Object.keys(S.assessment.versions).length} versions <i data-lucide="chevron-down"></i></span></div>
        <div class="kicker" style="margin-top:8px">Working diagnosis (biopsychosocial)</div>
        <div class="small" style="margin-top:4px;line-height:1.5">Chen presents with sleep-onset insomnia and trauma-linked hyperarousal, exacerbated by elevated work-related stress. Sertraline 50mg titrated up two weeks ago; reports modest mood improvement, GI side-effects subsiding. Continues to avoid evening wind-down rituals.</div>
        <div class="kicker" style="margin-top:8px">Areas to track this cycle</div>
        <ul style="margin:4px 0 0 18px;font-size:12px;line-height:1.6">
          <li>Bedtime regularity — currently variable, target consolidation around 22:00</li>
          <li>Daytime HR variability under stress — explore breathwork response window</li>
          <li>Self-compassion narrative — gratitude practice as a daily anchor</li>
        </ul>
      </div>`;
    if (t === 'sessions') {
      return assessmentCard + S.sessions.slice().reverse().slice(0,4).map(s => `
        <div class="event-row" data-cw-action="open-session" data-id="${s.id}" style="cursor:pointer">
          <div class="ev-ic"><i data-lucide="file-text"></i></div>
          <div class="body"><div class="t">Session #${s.num} · ${esc(s.date)}</div><div class="m">"${esc((s.note?.summary||s.note?.assessmentPlan||'').slice(0,80))}..."</div></div>
          <div><i data-lucide="chevron-right"></i></div>
        </div>`).join('');
    }
    if (t === 'shared') {
      return S.sharedData.bySource.map(s => `
        <div class="shared-source">
          <div class="src-h"><div class="name"><span>${s.icon}</span> ${esc(s.name)}</div><div class="count">${esc(s.updated)}</div></div>
          ${s.items.map(it => `
            <div class="shared-row"><div class="ev-ic" style="background:#f1f5f9">·</div>
              <div class="body">${esc(it.label)} ${it.tag==='flagged'?'<span class="chip red">FLAGGED</span>':''}</div>
              <div class="val">${esc(it.value)}</div>
            </div>`).join('')}
        </div>`).join('');
    }
    if (t === 'activity') {
      return S.activity.map(a => `
        <div class="event-row">
          <div class="ev-ic"${a.type==='coach'?' style="background:#EDE9FE;color:#6D28D9"':''}><i data-lucide="${a.type==='urgent'?'alert-triangle':a.type==='message'?'message-square':a.type==='session'?'file-text':a.type==='coach'?'sparkles':'share-2'}"></i></div>
          <div class="body"><div class="t">${esc(a.title)}</div><div class="m tiny">${esc(a.meta||'')}</div></div>
          <div class="dim tiny">${esc(a.t)}</div>
        </div>`).join('') || '<div class="dim small" style="padding:10px">No activity.</div>';
    }
    if (t === 'messages') {
      return `<div class="col gap-2">
        ${S.messages.slice().reverse().map(m => `
          <div class="event-row" style="cursor:pointer" data-cw-action="open-messages">
            <div class="ev-ic">${m.from==='rachel'?'<i data-lucide="user"></i>':'<i data-lucide="message-square"></i>'}</div>
            <div class="body"><div class="t">${m.from==='rachel'?esc(S.clinician.name.split(' ')[0]):esc(S.patient.name)}</div><div class="m">"${esc(m.text.slice(0,110))}${m.text.length>110?'…':''}"</div></div>
            <div class="dim tiny">${esc(m.at)}</div>
          </div>`).join('')}
      </div>`;
    }
    return '';
  }
  function cloneVersion(v) {
    return { rxs: S.goals.versions[v].rxs.map(r => ({...r, params: r.params ? {...r.params} : {}})) };
  }
  function suggestedRxCard() {
    if (S.goals.draft?.rejectedSuggestion) return '';
    return `
      <div class="rx-card suggested">
        <div class="head"><div class="type"><i data-lucide="sparkles"></i> Suggested prescription</div><div class="tiny" style="color:var(--purple)">Based on biopsychosocial framework</div></div>
        <div class="title">Evening wind-down — no screens after 21:30</div>
        <div class="meta">Chen's sleep onset latency averages 90 minutes on nights when phone use is past 22:00 (12 of last 14 nights). A pre-sleep boundary may compound the existing 22:00 bedtime target.</div>
        <div class="row gap-2" style="margin-top:8px"><button class="btn sm primary" data-cw-action="tx-accept-sug"><i data-lucide="check"></i> Accept</button><button class="btn sm" data-cw-action="tx-edit-sug">Edit parameters</button><button class="btn sm" data-cw-action="tx-dismiss-sug">Dismiss</button></div>
      </div>`;
  }

  /* ---------- Compliance ---------- */
  function compliance() {
    const max = Math.max(...S.compliance.sparkline);
    return shell([{label:esc(S.patient.name),go:'patient'},{label:'Compliance & progress'}], `
      <h2 style="margin:0 0 4px">Compliance & progress</h2>
      <div class="small muted" style="margin-bottom:14px">How Chen is tracking against her goals</div>
      <div class="card cw-vis-toggle" style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        <div class="avatar sm" style="background:var(--primary-tint);color:var(--primary)"><i data-lucide="${S.compliance.visibleToPatient?'eye':'eye-off'}"></i></div>
        <div style="flex:1">
          <div class="bold small">Show compliance & progress to patient</div>
          <div class="dim small" style="line-height:1.4;margin-top:2px">When on, ${esc(S.patient.name.split(' ')[0])} sees this score on their Today screen and profile, and can open their own progress view. Off by default.</div>
        </div>
        <div class="switch ${S.compliance.visibleToPatient?'on':''}" data-cw-action="toggle-compliance-vis"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div class="card"><div class="kicker">Avg compliance · 30d</div><div class="big" style="font-size:34px">79<span class="small muted">%</span></div><div class="small" style="color:var(--primary)">▲ +6 vs prior 30d</div></div>
        <div class="card"><div class="kicker">Sessions</div><div class="big" style="font-size:34px">${S.sessions.length}</div><div class="small muted">Bi-weekly cadence</div></div>
      </div>
      <div class="card">
        <div class="panel-head"><h3>Compliance score over time</h3><div class="tabs-strip"><button>7d</button><button class="active">30d</button><button>All time</button></div></div>
        <div style="display:flex;gap:6px;align-items:flex-end;height:200px;margin-top:10px">
          ${S.compliance.sparkline.concat(S.compliance.sparkline).map(v => `<div style="flex:1;background:var(--primary-tint);border-radius:6px 6px 0 0;height:${(v/max)*100}%;border-top:3px solid var(--primary)"></div>`).join('')}
        </div>
        <div class="row between" style="margin-top:6px"><span class="dim tiny">Apr 1</span><span class="dim tiny">Apr 15</span><span class="dim tiny">May 1</span><span class="dim tiny">May 15</span><span class="dim tiny">May 27</span></div>
      </div>
    `);
  }

  /* ---------- Data point modals ---------- */
  function sessionDataPoints(id) { return (S.dataPoints || []).filter(d => d.sessionId === id); }

  function dpReviewCard(d, approved) {
    return `
      <div class="dp-review-card ${approved?'approved':''}">
        <div class="dp-card-head">
          <div class="row gap-2" style="align-items:center"><span class="bps-pill">BPS</span><span class="dp-refdate"><i data-lucide="calendar"></i> ${esc(d.referenceDate)}</span></div>
          <span class="dp-collected">Collected ${esc(d.collectedAt)}</span>
        </div>
        <div class="dp-prompt"><i data-lucide="message-circle"></i> ${esc(d.prompt)}</div>
        <div class="dp-answer">${esc(d.answer)}</div>
        <div class="dp-actions ${approved?'approved':''}">
          ${approved ? `
            <span class="chip green"><i data-lucide="check"></i> Approved</span>
            <div class="row gap-2">
              <button class="btn sm" data-cw-action="dp-edit" data-id="${d.id}"><i data-lucide="pencil"></i> Edit</button>
              <button class="btn sm" data-cw-action="dp-undo" data-id="${d.id}"><i data-lucide="rotate-ccw"></i> Undo</button>
            </div>
          ` : `
            <button class="btn sm" data-cw-action="dp-edit" data-id="${d.id}"><i data-lucide="pencil"></i> Edit</button>
            <button class="btn sm danger" data-cw-action="dp-dismiss" data-id="${d.id}"><i data-lucide="x"></i> Deny</button>
            <button class="btn sm primary" data-cw-action="dp-approve" data-id="${d.id}"><i data-lucide="check"></i> Approve</button>
          `}
        </div>
      </div>`;
  }

  function dpModal() {
    const m = nav.dpModal;
    if (!m) return '';
    const s = S.sessions.find(x => x.id === (m.sessionId || nav.sessionId)) || S.sessions[S.sessions.length-1];
    if (m.kind === 'read') {
      const d = (S.dataPoints||[]).find(x => x.id === m.id);
      if (!d) return '';
      const sNum = d.sessionId ? (S.sessions.find(x => x.id === d.sessionId)?.num) : null;
      const approved = d.status === 'approved';
      return `
      <div class="rx-modal-overlay" data-cw-action="dp-cancel">
        <div class="rx-modal" onclick="event.stopPropagation()" style="max-width:480px">
          <div class="rx-modal-hdr">
            <div><div class="rx-modal-title">Data point</div></div>
            <button class="rx-modal-close" data-cw-action="dp-cancel"><i data-lucide="x"></i></button>
          </div>
          <div class="rx-modal-body">
            <div class="dp-read">
              <div class="dp-read-meta">
                <div class="row gap-2" style="align-items:center"><span class="bps-pill">BPS</span><span class="dp-refdate"><i data-lucide="calendar"></i> ${esc(d.referenceDate)}</span></div>
                <span class="chip ${approved?'green':'amber'}">${approved?'Approved':'Pending'}</span>
              </div>
              <div class="dp-read-block"><div class="dp-read-lbl">PROMPT</div><div class="dp-read-prompt">${esc(d.prompt)}</div></div>
              <div class="dp-read-block"><div class="dp-read-lbl">ANSWER</div><div class="dp-read-answer">${esc(d.answer)}</div></div>
              <div class="dp-collected-box">Collected automatically · ${esc(d.collectedAt)}${sNum?` · from Session #${sNum}`:''}</div>
            </div>
          </div>
          <div class="rx-modal-ftr"><div></div><div class="row gap-2"><button class="btn sm" data-cw-action="dp-cancel">Close</button><button class="btn sm primary" data-cw-action="dp-edit" data-id="${d.id}"><i data-lucide="pencil"></i> Edit</button></div></div>
        </div>
      </div>`;
    }
    if (m.kind === 'add' || m.kind === 'edit') {
      const editing = m.kind === 'edit';
      const d = editing ? (S.dataPoints||[]).find(x => x.id === m.id) : null;
      const sNum = d && d.sessionId ? (S.sessions.find(x => x.id === d.sessionId)?.num) : null;
      const va = (s) => editing ? ` value="${esc(s)}"` : '';
      const cancelAction = editing ? 'dp-edit-cancel' : 'dp-cancel';
      return `
      <div class="rx-modal-overlay" data-cw-action="${cancelAction}">
        <div class="rx-modal" onclick="event.stopPropagation()" style="max-width:480px">
          <div class="rx-modal-hdr">
            <div><div class="rx-modal-title">${editing?'Edit data point':'Add data point'}</div><div class="rx-modal-sub">${editing?'Edit this biopsychosocial point. Text only in the POC.':'A biopsychosocial question and Chen\'s answer. Text only in the POC.'}</div></div>
            <button class="rx-modal-close" data-cw-action="${cancelAction}"><i data-lucide="x"></i></button>
          </div>
          <div class="rx-modal-body">
            <div class="rx-field"><label>Prompt</label><input id="cw-dp-prompt" type="text" placeholder="e.g. How has your sleep been over the past two weeks?"${va(d?.prompt)} /></div>
            <div class="rx-field"><label>Answer</label><textarea id="cw-dp-answer" rows="3" placeholder="Chen's answer to this question…">${editing?esc(d?.answer):''}</textarea></div>
            <div class="rx-field"><label>Reference date</label><input id="cw-dp-refdate" type="text" placeholder="e.g. 2014, or “June 2019”"${va(d?.referenceDate)} /></div>
            <div class="dp-help">The date or period this answer is about (e.g. a childhood event). When it was captured is recorded automatically.</div>
            ${editing ? `<div class="dp-collected-box">Collected automatically · ${esc(d?.collectedAt)}${sNum?` · from Session #${sNum}`:''}</div>` : ''}
          </div>
          <div class="rx-modal-ftr"><div></div><div class="row gap-2"><button class="btn sm" data-cw-action="${cancelAction}">Cancel</button>${editing
            ? `<button class="btn sm primary" data-cw-action="dp-save-edit" data-id="${m.id}"><i data-lucide="check"></i> Save changes</button>`
            : `<button class="btn sm primary" data-cw-action="dp-save"><i data-lucide="check"></i> Add data point</button>`}</div></div>
        </div>
      </div>`;
    }
    const dps = sessionDataPoints(s.id);
    const pending = dps.filter(d => d.status === 'pending');
    const approved = dps.filter(d => d.status === 'approved');
    return `
      <div class="rx-modal-overlay" data-cw-action="dp-cancel">
        <div class="rx-modal" onclick="event.stopPropagation()" style="max-width:600px">
          <div class="rx-modal-hdr">
            <div><div class="rx-modal-title">Review data points · Session #${s.num}</div><div class="rx-modal-sub">Approve, edit, or deny the biopsychosocial points captured this session.</div></div>
            <button class="rx-modal-close" data-cw-action="dp-cancel"><i data-lucide="x"></i></button>
          </div>
          <div class="rx-modal-body">
            <div class="dp-help-banner"><span class="dp-help-q">?</span><div><div class="dp-help-title">Don't see a data point?</div><div class="dp-help-text">Tend only extracts answers that clearly match a biopsychosocial prompt — if something wasn't a clear hit, it won't appear here. You can always add it manually.</div></div></div>
            ${pending.length ? `<div class="rx-modal-sec-lbl">PENDING REVIEW (${pending.length})</div>
            ${pending.map(d => dpReviewCard(d, false)).join('')}` : '<div class="small muted" style="padding:6px 0 10px">No pending data points — all points have been reviewed.</div>'}
            ${approved.length ? `<div class="rx-modal-sec-lbl" style="margin-top:14px">APPROVED (${approved.length})</div>
            ${approved.map(d => dpReviewCard(d, true)).join('')}` : ''}
          </div>
          <div class="rx-modal-ftr">
            <button class="btn sm" data-cw-action="dp-add-from-extract"><i data-lucide="plus"></i> Add manually</button>
            <div class="row gap-2"><button class="btn sm" data-cw-action="dp-cancel">Close</button>${pending.length?`<button class="btn sm primary" data-cw-action="dp-done"><i data-lucide="check"></i> Approve all pending</button>`:''}</div>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Session summary ---------- */
  function session() {
    const s = S.sessions.find(x => x.id === nav.sessionId) || S.sessions[S.sessions.length-1];
    const stages = s.stages;
    const allDone = stages.raw && stages.note; // data points are not a required stage
    const stageOrder = ['raw','note'];
    const nextUpStage = stageOrder.find(k => !stages[k]);
    const idx = S.sessions.findIndex(x => x.id === s.id);
    const prev = idx > 0 ? S.sessions[idx-1] : null;
    const next = idx < S.sessions.length - 1 ? S.sessions[idx+1] : null;
    const dps = sessionDataPoints(s.id);
    const pendingDp = dps.filter(d => d.status === 'pending');
    const approvedDp = dps.filter(d => d.status === 'approved');
    const wlpV = s.wholeLifePlanVersion || S.wholeLifePlan.currentVersion;
    const goalsV = parseInt(String(s.planVersion||('v'+S.goals.currentVersion)).replace('v',''));
    const goalRxs = (S.goals.versions[goalsV] || {}).rxs || [];
    const aV = s.assessmentVersion || S.assessment.currentVersion;
    const aBody = S.assessment.versions[aV];
    const aCur = aV === S.assessment.currentVersion;
    return shell([{label:esc(S.patient.name),go:'patient'},{label:`Session #${s.num}`}], `
      <div class="session-layout">
        <div class="session-main">
      <div class="card" style="margin-bottom:12px">
        <div class="row between">
          <div><h2 style="margin:0">Session #${s.num} ${allDone?'<span class="chip green"><i data-lucide="check"></i> Complete</span>':'<span class="chip amber">In progress</span>'}</h2>
            <div class="small muted" style="margin-top:4px">${esc(s.date)}, 14:00 · ${esc(s.duration)} · Imported from ${esc(s.src)}</div></div>
          <div class="row gap-2" style="align-items:flex-start">
            ${allDone ? `
              <div style="position:relative">
                <button class="btn sm" data-cw-action="toggle-export-menu"><i data-lucide="download"></i> Export to EMR <i data-lucide="chevron-down"></i></button>
                ${nav.exportMenuOpen ? `
                  <div class="card" style="position:absolute;top:calc(100% + 6px);right:0;width:300px;padding:8px;z-index:30;box-shadow:0 8px 24px rgba(15,23,42,0.15)">
                    <div style="display:flex;gap:12px;align-items:center;padding:12px;border-radius:10px;opacity:.45;cursor:not-allowed">
                      <div class="avatar sm" style="background:#f1f5f9;color:#475569"><i data-lucide="clipboard"></i></div>
                      <div><div class="bold small">Export plain text</div><div class="tiny muted">Copy/paste into any EMR</div></div>
                    </div>
                    <div style="height:1px;background:#eef2f1;margin:2px 0"></div>
                    <div style="display:flex;gap:12px;align-items:center;padding:12px;border-radius:10px;opacity:.45;cursor:not-allowed">
                      <div class="avatar sm" style="background:#dbeae3;color:#0f766e"><i data-lucide="file-heart"></i></div>
                      <div><div class="row gap-2" style="align-items:center"><span class="bold small">Send to EMR</span><span class="chip" style="background:#e0e7ff;color:#3730a3;font-size:9px">EPIC</span></div><div class="tiny muted">Push directly via the connected EMR integration</div></div>
                    </div>
                    <div style="background:#fef3c7;color:#92400e;font-size:10px;font-weight:600;padding:8px 10px;border-radius:8px;margin-top:6px">COMMING SOON</div>
                  </div>` : ''}
              </div>` : ''}
            ${(() => {
                const chip = (k, label) => {
                  const state = stages[k] ? 'complete' : (k === nextUpStage ? 'current' : 'open');
                  const ico = state === 'complete' ? 'check' : (state === 'current' ? 'circle-dashed' : 'circle');
                  const interactive = k === 'note' ? `data-cw-action="open-stage" data-st="note"` : '';
                  return `<div class="stage-chip ${state}" ${interactive}><i data-lucide="${ico}"></i> ${label}</div>`;
                };
                return `<div class="stages-card" style="width:auto;display:flex;gap:6px">
                  ${chip('raw','Raw data')}
                  ${chip('note','Note')}
                  <div class="stage-chip neutral" data-cw-action="open-dp-extract" title="Data points are optional — review anytime"><i data-lucide="list-checks"></i> Data points</div>
                </div>`;
              })()}
          </div>
        </div>
      </div>
      <div class="session-split">
        <div>
          ${stages.note ? `
          <div class="card" style="margin-bottom:12px">
            <div class="panel-head"><h3><i data-lucide="notebook-pen"></i> Note <span class="chip green"><i data-lucide="check"></i> Complete</span></h3><button class="btn sm" data-cw-go="note">Open editor</button></div>
            <div class="kicker">Subjective</div><div class="small" style="margin:4px 0 8px;line-height:1.5">${esc(s.note.subjective || '—')}</div>
            <div class="kicker">Assessment and Plan</div><div class="small" style="line-height:1.5">${esc(s.note.assessmentPlan || '—')}</div>
          </div>
          ` : (nextUpStage === 'note' ? `
          <div class="card" style="margin-bottom:12px;background:var(--warning-soft);border-color:#fcd34d">
            <div class="row gap-2"><div class="bold"><i data-lucide="circle-dashed"></i> Note pending</div></div>
            <div class="small" style="margin:6px 0 10px;line-height:1.5">Draft the session note from the transcript — Tend will pre-fill fields you can review and edit.</div>
            <button class="btn sm" style="background:#d97706;color:white;border-color:#d97706" data-cw-go="note">Open editor <i data-lucide="arrow-right"></i></button>
          </div>
          ` : `
          <div class="card" style="margin-bottom:12px">
            <div class="row gap-2 muted"><div class="bold small"><i data-lucide="circle"></i> Note</div></div>
            <div class="small muted" style="margin-top:6px;line-height:1.5">Not yet drafted.</div>
          </div>
          `)}
          <div class="card" style="margin-bottom:12px">
            <div class="panel-head"><h3><i data-lucide="clipboard-list"></i> Treatment plan · v${wlpV} <span class="chip gray">reference</span></h3><button class="btn sm" data-cw-go="wholeLifePlan">Open</button></div>
            ${(() => {
              const ver = S.wholeLifePlan.versions[wlpV] || {};
              const objs = ver.objectives || {};
              const cats = S.wholeLifePlan.categories.filter(c => objs[c]).slice(0,3);
              if (!cats.length) return '<div class="small muted" style="line-height:1.5">No objectives set for this version.</div>';
              return cats.map(c => `<div style="margin-top:10px"><div class="kicker" style="color:#0F766E;letter-spacing:0.5px">${esc(c).toUpperCase()}</div><div class="small" style="margin-top:2px;line-height:1.5">${esc(objs[c])}</div></div>`).join('')
                + `<div class="dim tiny" style="margin-top:10px">${esc(ver.authoredBy||'Shari Kaplan')} · v${wlpV} · ${esc(ver.date||'')}</div>`;
            })()}
          </div>
          <div class="card">
            <div class="panel-head"><h3><i data-lucide="target"></i> Goals · ${esc(s.planVersion)} <span class="chip gray">reference</span></h3><button class="btn sm" data-cw-go="goals">Open</button></div>
            ${goalRxs.slice(0,3).map(r => `
              <div class="row between" style="padding:6px 0;border-bottom:1px solid var(--line-2)"><div class="small">${esc(r.title)}</div><div class="dim tiny">${esc(r.trigger)}</div></div>`).join('')}
          </div>
        </div>
        <div>
          ${stages.raw ? `
          <div class="card" style="margin-bottom:12px">
            <h3 style="margin:0 0 10px"><i data-lucide="zap"></i> Raw data</h3>
            <div class="integration-row"><div class="ic"><i data-lucide="audio-lines"></i></div><div class="meta"><div class="t">session-${s.num}-raw.m4a</div><div class="s">47:02 · 28.4 MB · AAC 128 kbps</div></div><button class="btn sm"><i data-lucide="download"></i> Download</button></div>
            <div class="small muted" style="margin-top:8px;text-decoration:underline;cursor:pointer"><i data-lucide="file-text"></i> View transcript</div>
          </div>
          ` : (nextUpStage === 'raw' ? `
          <div class="card" style="margin-bottom:12px;background:var(--warning-soft);border-color:#fcd34d">
            <div class="row gap-2"><div class="bold"><i data-lucide="circle-dashed"></i> Raw data pending</div></div>
            <div class="small" style="margin:6px 0 10px;line-height:1.5">Upload the session recording or paste a transcript to start this session.</div>
            <button class="btn sm" style="background:#d97706;color:white;border-color:#d97706" data-cw-go="upload">Upload raw data <i data-lucide="arrow-right"></i></button>
          </div>
          ` : `
          <div class="card" style="margin-bottom:12px">
            <div class="row gap-2 muted"><div class="bold small"><i data-lucide="circle"></i> Raw data</div></div>
            <div class="small muted" style="margin-top:6px;line-height:1.5">Not yet uploaded.</div>
          </div>
          `)}
          ${!stages.note ? `
          <div class="card" style="margin-bottom:12px">
            <div class="row gap-2 muted"><div class="bold small"><i data-lucide="circle"></i> Data points</div></div>
            <div class="small muted" style="margin-top:6px;line-height:1.5">Available once the note is complete.</div>
          </div>
          ` : `
          <div class="card" style="margin-bottom:12px">
            <div class="panel-head"><h3><i data-lucide="list-checks"></i> Data points <span class="chip gray">${approvedDp.length} approved</span>${pendingDp.length?` <span class="chip amber">${pendingDp.length} pending approval</span>`:''}</h3><button class="btn sm" data-cw-action="open-dp-add"><i data-lucide="plus"></i> Add</button></div>
            <div class="small muted" style="line-height:1.5;margin-bottom:8px">Approved biopsychosocial points for this session. Reviewing is optional — open review to approve, edit, or add your own.</div>
            ${approvedDp.length ? approvedDp.map(d => `<div class="row between" data-cw-action="dp-open" data-id="${d.id}" style="padding:8px 0;border-bottom:1px solid var(--line-2);align-items:center;cursor:pointer"><div class="small" style="flex:1;padding-right:10px">${esc(d.prompt)}</div><i data-lucide="chevron-right" style="width:15px;height:15px;color:#94a3b8"></i></div>`).join('') : '<div class="small muted">No approved data points yet.</div>'}
            <div class="row gap-2" style="margin-top:10px"><button class="btn sm primary" data-cw-action="open-dp-extract">Review data points <i data-lucide="arrow-right"></i></button><button class="btn sm" data-cw-action="open-dp-add"><i data-lucide="plus"></i> Add manually</button></div>
          </div>
          `}
          <div class="card">
            <div class="panel-head"><h3><i data-lucide="clipboard-list"></i> Assessment <span class="chip ${aCur?'green':'gray'}">v${aV}${aCur?'':' · at this session'}</span></h3><button class="btn sm" data-cw-action="open-session-assess">Open</button></div>
            <div class="small" style="line-height:1.5">${esc((aBody?.body||'')).slice(0,180)}…</div>
            <div class="dim tiny" style="margin-top:6px">${esc(aBody?.authoredBy||'Shari Kaplan')} · ${esc(aBody?.date||'')}</div>
          </div>
        </div>
      </div>
        </div>
        <div class="session-timeline">
          <button class="btn sm" ${prev?`data-cw-action="open-session" data-id="${prev.id}"`:'disabled'}><i data-lucide="chevron-left"></i> ${prev?`#${prev.num} · ${esc(prev.date)}`:'Previous'}</button>
          <div class="session-timeline-strip">${S.sessions.map(x => `<span class="dot ${x.id===s.id?'on':''}" title="#${x.num} · ${esc(x.date)}"></span>`).join('')}</div>
          <button class="btn sm dark" ${next?`data-cw-action="open-session" data-id="${next.id}"`:'data-cw-go="upload"'}>${next?`#${next.num} · ${esc(next.date)}`:'Start #'+((S.sessions[S.sessions.length-1]?.num || 12)+1)} <i data-lucide="chevron-right"></i></button>
        </div>
      </div>
      ${dpModal()}
    `);
  }
  /* ---------- Browser-chrome history ---------- */
  const histStack = [];
  let histIdx = -1;
  let navigating = false; // true while back/forward/reload is restoring

  function currentUrl() {
    const sess = () => {
      const s = S.sessions.find(x => x.id === nav.sessionId);
      return s ? s.num : '12';
    };
    switch (nav.screen) {
      case 'patients':     return 'tend.health/patients';
      case 'patient':      return 'tend.health/patients/chen-v' + (nav.sharedView === 'timeline' ? '?view=timeline' : '');
      case 'session':      return `tend.health/patients/chen-v/sessions/${sess()}`;
      case 'note':         return `tend.health/patients/chen-v/sessions/${sess()}/note`;
      case 'assessment':   return `tend.health/patients/chen-v/assessment` + (nav.assessmentVersion ? `/v${nav.assessmentVersion}` : '');
      case 'goals':       return `tend.health/patients/chen-v/goals`;
      case 'wholeLifePlan': return `tend.health/patients/chen-v/treatment-plan`;
      case 'compliance':   return `tend.health/patients/chen-v/compliance`;
      case 'upload':       return `tend.health/patients/chen-v/upload`;
      case 'messaging':    return `tend.health/patients/chen-v/messages`;
      case 'settings':     return 'tend.health/settings';
      case 'integrations': return 'tend.health/settings/integrations';
      default:             return 'tend.health/patients';
    }
  }

  function snapshot() {
    return {
      url: currentUrl(),
      screen: nav.screen,
      sessionId: nav.sessionId,
      sharedView: nav.sharedView,
      assessmentVersion: nav.assessmentVersion,
      assessmentOrigin: nav.assessmentOrigin,
    };
  }
  function restore(snap) {
    nav.screen = snap.screen;
    nav.sessionId = snap.sessionId;
    nav.sharedView = snap.sharedView;
    nav.assessmentVersion = snap.assessmentVersion;
    nav.assessmentOrigin = snap.assessmentOrigin;
  }
  function pushHistory() {
    const snap = snapshot();
    const top = histStack[histIdx];
    if (top && top.url === snap.url) return;
    histStack.length = histIdx + 1;
    histStack.push(snap);
    histIdx = histStack.length - 1;
  }
  function updateChrome() {
    const urlEl = document.getElementById('cw-url');
    if (urlEl) urlEl.textContent = currentUrl();
    const back = document.getElementById('cw-back');
    const fwd  = document.getElementById('cw-forward');
    if (back) back.disabled = histIdx <= 0;
    if (fwd)  fwd.disabled  = histIdx >= histStack.length - 1;
  }
  function goBack() {
    if (histIdx <= 0) return;
    histIdx--;
    navigating = true;
    restore(histStack[histIdx]);
    render();
    navigating = false;
  }
  function goForward() {
    if (histIdx >= histStack.length - 1) return;
    histIdx++;
    navigating = true;
    restore(histStack[histIdx]);
    render();
    navigating = false;
  }
  function reload() {
    navigating = true; // don't push duplicate
    render();
    navigating = false;
  }
  function wireChrome() {
    const back = document.getElementById('cw-back');
    const fwd  = document.getElementById('cw-forward');
    const rel  = document.getElementById('cw-reload');
    if (back && !back.__wired) { back.__wired = 1; back.onclick = goBack; }
    if (fwd  && !fwd.__wired)  { fwd.__wired  = 1; fwd.onclick  = goForward; }
    if (rel  && !rel.__wired)  { rel.__wired  = 1; rel.onclick  = reload; }
  }

  function loginScreen() {
    if (S.auth.clinicianWeb === 'login-onboarding') return loginOnboardingScreen();
    const err = S.auth.clinicianWeb === 'login-error';
    return `
      <div class="web-auth">
        <div class="web-auth-card">
          <div class="auth-brand"><span class="logo">T</span><span>Tend</span></div>
          <div class="auth-title">${err?'Sign in':'Welcome back'}</div>
          <div class="auth-sub">Sign in to your clinician account.</div>
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
            <div class="auth-input ${err?'err':''}"><i data-lucide="mail"></i><input type="email" value="shari@tend.health" id="cw-auth-email" /></div>
          </div>
          <div class="auth-field">
            <label>Password</label>
            <div class="auth-input ${err?'err':''}"><i data-lucide="lock"></i><input type="password" value="••••••••••" id="cw-auth-pw" /><i data-lucide="eye" class="trail"></i></div>
          </div>
          <div class="auth-row-end"><a class="auth-link">Forgot password?</a></div>
          <button class="auth-primary" data-cw-action="auth-login">Sign in</button>
          <div class="auth-divider"><span class="line"></span><span class="lbl">or continue with</span><span class="line"></span></div>
          <div class="auth-social">
            <button class="auth-secondary" data-cw-action="auth-social" data-provider="google"><i data-lucide="globe"></i> Google</button>
            <button class="auth-secondary" data-cw-action="auth-social" data-provider="apple"><i data-lucide="apple"></i> Apple</button>
          </div>
          <div class="auth-footer">New here? <a class="auth-link">Create an account on the website</a></div>
        </div>
      </div>`;
  }

  function loginOnboardingScreen() {
    return `
      <div class="web-auth">
        <div class="web-auth-card">
          <div class="auth-brand"><span class="logo">T</span><span>Tend</span></div>
          <div class="auth-title">Finish your setup</div>
          <div class="auth-sub">Your account exists, but your onboarding isn't complete yet.</div>
          <div class="auth-warn">
            <div class="ic"><i data-lucide="clock-3"></i></div>
            <div><div class="bold small">Onboarding incomplete</div><div class="small" style="line-height:1.4;margin-top:2px">You signed up but didn't finish setting up your clinic profile. We can't sign you in until that's done.</div></div>
          </div>
          <div class="auth-acct">
            <div class="ic"><i data-lucide="mail"></i></div>
            <div><div class="lbl">Signed in as</div><div class="val">shari+incomplete@tend.health</div></div>
          </div>
          <button class="auth-primary" data-cw-action="auth-continue-website"><i data-lucide="external-link"></i> Continue on the website</button>
          <div class="auth-footer">Not you? <a class="auth-link" data-cw-action="auth-switch">Sign in with a different account</a></div>
        </div>
      </div>`;
  }

  /* ---------- Render ---------- */
  function render() {
    const r = root();
    if (!r) return;
    if (S.auth.clinicianWeb !== 'in') {
      r.innerHTML = loginScreen();
      bind(r);
      if (window.lucide) lucide.createIcons();
      return;
    }
    if (!navigating) pushHistory();
    wireChrome();
    updateChrome();
    let html = '';
    if (nav.screen === 'patients')      html = patientsList();
    else if (nav.screen === 'settings') html = settings();
    else if (nav.screen === 'integrations') html = integrations();
    else if (nav.screen === 'patient')  html = patientProfile();
    else if (nav.screen === 'messaging') html = messaging();
    else if (nav.screen === 'upload')   html = upload();
    else if (nav.screen === 'note')     html = noteEditor();
    else if (nav.screen === 'assessment') html = assessment();
    else if (nav.screen === 'goals')   html = goals();
    else if (nav.screen === 'wholeLifePlan') html = wholeLifePlan();
    else if (nav.screen === 'compliance') html = compliance();
    else if (nav.screen === 'session')  html = session();
    else if (nav.screen === 'addPatient') html = addPatientScreen();
    else if (nav.screen === 'addPatientSuccess') html = addPatientSuccess();
    else html = patientsList();
    if (S.editPatientModal) html += editPatientModalHtml();
    r.innerHTML = html;
    bind(r);
    if (window.lucide) lucide.createIcons();
  }

  function commitApTag() {
    const f = ensureAddFlow();
    const inp = document.getElementById('ap-tag-input');
    if (!inp) return;
    const val = (inp.value || '').trim();
    if (val && !f.tags.includes(val)) f.tags.push(val);
    f.addingTag = false;
    render();
  }

  function bind(r) {
    const apTagInput = document.getElementById('ap-tag-input');
    if (apTagInput) {
      apTagInput.onkeydown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); commitApTag(); }
        else if (e.key === 'Escape') { e.preventDefault(); const f = ensureAddFlow(); f.addingTag = false; render(); }
      };
      apTagInput.onblur = () => commitApTag();
    }
    const tagInput = document.getElementById('cw-tag-input');
    if (tagInput && nav.tagModal) {
      tagInput.oninput = () => {
        nav.tagModal.q = tagInput.value;
        const wrap = document.getElementById('cw-tag-sugg-wrap');
        if (wrap) {
          wrap.innerHTML = tagSuggHtml();
          if (window.lucide) lucide.createIcons();
          wrap.querySelectorAll('[data-cw-action]').forEach(b => b.onclick = (e) => {
            const a = b.dataset.cwAction;
            if (a === 'tag-add' || a === 'tag-create') {
              const addToTarget = (label) => {
                if (nav.tagModal?.target === 'addPatient') {
                  const f = ensureAddFlow();
                  if (!f.tags.includes(label)) f.tags.push(label);
                } else {
                  if (!S.patient.tags.includes(label)) S.patient.tags.push(label);
                }
              };
              if (a === 'tag-add') {
                addToTarget(b.dataset.tag);
              } else {
                const raw = (b.dataset.tag || '').trim();
                const label = raw.charAt(0).toUpperCase() + raw.slice(1);
                if (!S.tagLibrary.find(x => x.label.toLowerCase() === label.toLowerCase())) S.tagLibrary.push({ label, color:'gray', patients:1 });
                addToTarget(label);
              }
              nav.tagModal.q = '';
              render();
              setTimeout(() => document.getElementById('cw-tag-input')?.focus(), 0);
            }
          });
        }
      };
      tagInput.onkeydown = (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          const first = r.querySelector('#cw-tag-sugg-wrap .tag-sugg-row');
          if (first) first.click();
        } else if (ev.key === 'Escape') {
          ev.preventDefault();
          nav.tagModal = null; render();
        }
      };
    }
    r.querySelectorAll('[data-cw-go]').forEach(b => b.onclick = (e) => {
      if (e.target.closest('[data-stopnav="1"], [data-cw-action]')) return;
      e.stopPropagation();
      if (b.dataset.cwGo === 'assessment') nav.assessmentOrigin = nav.screen;
      nav.screen = b.dataset.cwGo; nav.sub = null; nav.assessmentVersion = null; nav.exportMenuOpen = false;
      // mark unread for activity if opening patient — emit so mobile stays in sync
      if (nav.screen === 'patient') { S.activity.forEach(a => a.read = true); bus.emit(); }
      else { render(); }
    });
    r.querySelectorAll('[data-cw-crumb]').forEach(b => b.onclick = () => { if (b.dataset.cwCrumb) { nav.screen = b.dataset.cwCrumb; nav.sub=null; render(); } });
    r.querySelectorAll('[data-cw-sub]').forEach(b => b.onclick = () => { nav.sub = b.dataset.cwSub; render(); });
    r.querySelectorAll('[data-cw-shared]').forEach(b => b.onclick = () => { nav.sharedView = b.dataset.cwShared; render(); });
    r.querySelectorAll('[data-cw-filter]').forEach(b => b.onclick = () => { nav.activityFilter = b.dataset.cwFilter; render(); });
    r.querySelectorAll('[data-cw-subview]').forEach(b => b.onclick = () => {
      const [, tab, val] = b.dataset.cwSubview.split('|');
      if (tab === 'all') nav.allSubView = val;
      else if (tab === 'shared') nav.sharedSubView = val;
      render();
    });
    r.querySelectorAll('[data-cw-assess-tab]').forEach(b => b.onclick = () => { nav.assessDataTab = b.dataset.cwAssessTab; render(); });
    r.querySelectorAll('[data-cw-tx-tab]').forEach(b => b.onclick = () => { nav.txDataTab = b.dataset.cwTxTab; render(); });
    r.querySelectorAll('[data-cw-wlp-tab]').forEach(b => b.onclick = () => { nav.wlpDataTab = b.dataset.cwWlpTab; render(); });
    r.querySelectorAll('[data-cw-ptab]').forEach(b => b.onclick = () => { nav.profileTab = b.dataset.cwPtab; render(); });
    r.querySelectorAll('[data-cw-evt]').forEach(b => b.onclick = () => {
      const id = b.dataset.cwEvt;
      const a = S.activity.find(x => x.id === id); if (!a) return;
      a.read = true;
      if (a.type === 'session') { nav.screen = 'session'; nav.sessionId = S.sessions[S.sessions.length-1].id; }
      else if (a.type === 'message') { nav.screen = 'messaging'; }
      else if (a.type === 'shared') { nav.screen = 'patient'; nav.sharedView = 'timeline'; }
      else if (a.type === 'urgent') { /* stay */ }
      bus.emit();
    });
    r.querySelectorAll('[data-cw-action]').forEach(b => b.onclick = (e) => {
      const a = b.dataset.cwAction;
      if (a === 'auth-login') {
        const email = document.getElementById('cw-auth-email')?.value || '';
        const pw    = document.getElementById('cw-auth-pw')?.value || '';
        if (email.includes('incomplete') && pw) {
          S.auth.clinicianWeb = 'login-onboarding'; render();
        } else if (email === 'shari@tend.health' && pw) {
          S.auth.clinicianWeb = 'in'; notify('Signed in'); bus.emit();
        } else {
          S.auth.clinicianWeb = 'login-error'; render();
        }
        return;
      }
      if (a === 'auth-social') {
        const prov = b.dataset.provider;
        notify(`${prov === 'apple' ? 'Apple' : 'Google'} sign-in would open here (POC stub)`);
        S.auth.clinicianWeb = 'in'; bus.emit();
        return;
      }
      if (a === 'auth-continue-website') { notify('In production this opens the Tend onboarding website'); return; }
      if (a === 'auth-switch') { S.auth.clinicianWeb = 'login'; render(); return; }
      if (a === 'add-patient') { S.addPatientFlow = null; nav.screen = 'addPatient'; render(); return; }
      if (a === 'ap-next') {
        readApInputs();
        const f = ensureAddFlow();
        if (f.step === 1) {
          if (!f.name || !f.email) { notify('Name and email are required'); return; }
        }
        if (f.step < 3) { f.step += 1; render(); }
        return;
      }
      if (a === 'ap-back') { const f = ensureAddFlow(); if (f.step > 1) { f.step -= 1; render(); } else { nav.screen = 'patients'; render(); } return; }
      if (a === 'ap-cancel') { S.addPatientFlow = null; nav.screen = 'patients'; render(); return; }
      if (a === 'ap-toggle-comm') {
        readApInputs();
        const f = ensureAddFlow();
        const m = b.dataset.comm;
        if (!Array.isArray(f.comm)) f.comm = [];
        f.comm = f.comm.includes(m) ? f.comm.filter(x => x !== m) : [...f.comm, m];
        render();
        return;
      }
      if (a === 'ap-tag-remove') { const f = ensureAddFlow(); f.tags = f.tags.filter(t => t !== b.dataset.tag); render(); return; }
      if (a === 'ap-tag-start') {
        readApInputs();
        const f = ensureAddFlow();
        f.addingTag = true;
        render();
        setTimeout(() => { const i = document.getElementById('ap-tag-input'); if (i) i.focus(); }, 0);
        return;
      }
      if (a === 'ap-tag-commit') {
        readApInputs();
        const f = ensureAddFlow();
        const val = (document.getElementById('ap-tag-input')?.value || '').trim();
        if (val && !f.tags.includes(val)) f.tags.push(val);
        f.addingTag = false;
        render();
        return;
      }
      if (a === 'ap-create') {
        const f = ensureAddFlow();
        S.pendingPatients.push({ id:'pp'+Math.random().toString(36).slice(2,7), name:f.name||'New Patient', sex:f.sex||null, email:f.email||'unknown@email.com', phone:f.phone||null, age:f.age||null, emergency:f.emergency||null, comm:(f.comm||[]).slice(), tags:f.tags.slice(), invitedAt:'just now' });
        notify('Patient created · invite sent');
        nav.screen = 'addPatientSuccess';
        render();
        return;
      }
      if (a === 'ap-success-back') { S.addPatientFlow = null; nav.screen = 'patients'; render(); return; }
      if (a === 'ap-success-another') { S.addPatientFlow = null; nav.screen = 'addPatient'; render(); return; }
      if (a === 'edit-patient') { S.editPatientModal = 'sarah'; render(); return; }
      if (a === 'edit-pending') { S.editPatientModal = b.dataset.id; render(); return; }
      if (a === 'ep-close' || a === 'ep-close-bg') { S.editPatientModal = null; render(); return; }
      if (a === 'toggle-compliance-vis') {
        S.compliance.visibleToPatient = !S.compliance.visibleToPatient;
        notify(S.compliance.visibleToPatient ? 'Compliance now visible to patient' : 'Compliance hidden from patient');
        render();
        return;
      }
      if (a === 'ep-toggle-comm') {
        const t = S.editPatientModal;
        const obj = String(t).startsWith('pp') ? S.pendingPatients.find(x => x.id === t) : S.patient;
        if (obj) {
          if (!Array.isArray(obj.comm)) obj.comm = [];
          const m = b.dataset.comm;
          obj.comm = obj.comm.includes(m) ? obj.comm.filter(x => x !== m) : [...obj.comm, m];
        }
        render();
        return;
      }
      if (a === 'ep-save') {
        const target = b.dataset.target;
        const g = id => document.getElementById(id)?.value || '';
        if (String(target).startsWith('pp')) {
          const p = S.pendingPatients.find(x => x.id === target);
          if (p) { p.name = g('ep-name'); p.sex = g('ep-sex'); p.email = g('ep-email'); p.phone = g('ep-phone'); p.age = g('ep-age'); p.emergency = g('ep-emergency'); }
        } else {
          S.patient.name = g('ep-name') || S.patient.name;
          S.patient.sex = g('ep-sex') || S.patient.sex;
          S.patient.phone = g('ep-phone') || S.patient.phone;
          S.patient.age = parseInt(g('ep-age'),10) || S.patient.age;
        }
        notify('Patient updated');
        S.editPatientModal = null; render(); return;
      }
      if (a === 'ep-remove') {
        const target = S.editPatientModal;
        if (String(target).startsWith('pp')) {
          S.pendingPatients = S.pendingPatients.filter(x => x.id !== target);
          notify('Pending patient removed');
        } else {
          notify('POC: removing the seeded patient is disabled');
        }
        S.editPatientModal = null; render(); return;
      }
      if (a === 'toggle-export-menu') { nav.exportMenuOpen = !nav.exportMenuOpen; render(); return; }
      if (a === 'unlock-patient') {
        S.patientApp.locked = false; S.patientApp.lockReason = null; S.patientApp.lockQuote = null;
        addActivity({ type:'system', t:'now', title:'App unlocked', meta:`Shari Kaplan cleared the safety lockup.` });
        notify('Patient app unlocked'); bus.emit();
      }
      if (a === 'message-patient') { nav.screen = 'messaging'; render(); }
      if (a === 'msg-send') {
        const inp = document.getElementById('cw-msg-input');
        const t = (inp?.value||'').trim(); if (!t) return;
        S.messages.push({ id:uid('m'), from:'rachel', text:t, at:'Today · now' });
        notify('Message sent to Chen'); inp.value=''; bus.emit();
      }
      if (a === 'open-tag-modal') {
        e.stopPropagation();
        nav.tagModal = { q:'' };
        render();
        setTimeout(() => document.getElementById('cw-tag-input')?.focus(), 0);
      }
      if (a === 'tag-cancel') { nav.tagModal = null; render(); }
      if (a === 'tag-done')   { nav.tagModal = null; notify('Tags saved'); render(); }
      if (a === 'tag-add') {
        const t = b.dataset.tag;
        if (nav.tagModal?.target === 'addPatient') {
          const f = ensureAddFlow();
          if (!f.tags.includes(t)) f.tags.push(t);
        } else {
          if (!S.patient.tags.includes(t)) S.patient.tags.push(t);
          pruneOrphanTags();
        }
        nav.tagModal.q = '';
        render();
        setTimeout(() => document.getElementById('cw-tag-input')?.focus(), 0);
      }
      if (a === 'tag-create') {
        const raw = (b.dataset.tag || '').trim();
        if (!raw) return;
        const label = raw.charAt(0).toUpperCase() + raw.slice(1);
        if (!S.tagLibrary.find(x => x.label.toLowerCase() === label.toLowerCase())) {
          S.tagLibrary.push({ label, color:'gray', patients:0 });
        }
        if (nav.tagModal?.target === 'addPatient') {
          const f = ensureAddFlow();
          if (!f.tags.includes(label)) f.tags.push(label);
        } else {
          if (!S.patient.tags.includes(label)) S.patient.tags.push(label);
          pruneOrphanTags();
        }
        nav.tagModal.q = '';
        notify(`Tag "${label}" created`);
        render();
        setTimeout(() => document.getElementById('cw-tag-input')?.focus(), 0);
      }
      if (a === 'tag-remove') {
        const t = b.dataset.tag;
        const targetingAddPatient = nav.tagModal?.target === 'addPatient' || (nav.screen === 'addPatient' && !nav.tagModal);
        if (targetingAddPatient) {
          const f = ensureAddFlow();
          f.tags = f.tags.filter(x => x !== t);
        } else {
          S.patient.tags = S.patient.tags.filter(x => x !== t);
          pruneOrphanTags();
          if (nav.tagFilter) nav.tagFilter = nav.tagFilter.filter(x => S.tagLibrary.some(y => y.label === x));
        }
        render();
      }
      if (a === 'ap-open-tag-modal') {
        readApInputs();
        nav.tagModal = { q:'', target:'addPatient' };
        render();
        setTimeout(() => document.getElementById('cw-tag-input')?.focus(), 0);
        return;
      }
      if (a === 'toggle-tag-filter') { nav.tagFilterOpen = !nav.tagFilterOpen; render(); }
      if (a === 'toggle-tag') {
        const t = b.dataset.tag;
        nav.tagFilter = nav.tagFilter || [];
        nav.tagFilter = nav.tagFilter.includes(t)
          ? nav.tagFilter.filter(x => x !== t)
          : [...nav.tagFilter, t];
        render();
      }
      if (a === 'clear-tag-filter') { nav.tagFilter = []; nav.tagFilterOpen = false; render(); }
      if (a === 'upload-recording') notify('POC stub — Meet/Zoom auto-import not wired');
      if (a === 'upload-transcription') { nav.uploadModal = { kind:'transcript' }; render(); }
      if (a === 'upload-manual') {
        nav.sessionId = createSession({ src:'Manual entry' });
        notify('New session created · blank note');
        nav.screen = 'note'; render();
      }
      if (a === 'upload-notes')  { nav.uploadModal = { kind:'notes' }; render(); }
      if (a === 'upload-cancel') { nav.uploadModal = null; render(); }
      if (a === 'submit-transcript') {
        const t = (document.getElementById('cw-upload-input')?.value || '').trim();
        if (!t) { notify('Paste a transcript first'); return; }
        nav.sessionId = createSession({ transcript:t, src:'Pasted transcript' });
        notify(`Session created · note auto-drafted`);
        nav.uploadModal = null; nav.screen = 'note'; render();
      }
      if (a === 'submit-notes') {
        const t = (document.getElementById('cw-upload-input')?.value || '').trim();
        if (!t) { notify('Paste a note first'); return; }
        nav.sessionId = createSession({ note:t, src:'Notes only' });
        notify(`Session created · review note in template`);
        nav.uploadModal = null; nav.screen = 'note'; render();
      }
      if (a === 'note-save' || a === 'note-next') {
        const s = S.sessions.find(x => x.id === nav.sessionId);
        if (s) {
          const read = id => document.getElementById(id)?.value ?? '';
          s.note.summary       = read('cw-note-summary');
          s.note.subjective    = read('cw-note-subjective');
          s.note.objective     = read('cw-note-objective');
          s.note.assessmentPlan= read('cw-note-assessment-plan');
          s.stages.note = true;
        }
        if (a === 'note-save') {
          notify('Note saved');
          nav.screen = 'session';
          render();
        } else {
          notify('Note saved · review data points');
          nav.screen = 'session';
          nav.dpModal = { kind:'extract', sessionId: nav.sessionId };
          render();
        }
      }
      if (a === 'assess-save') {
        const newV = S.assessment.currentVersion + 1;
        const cur = S.assessment.versions[S.assessment.currentVersion];
        S.assessment.versions[newV] = { date:'Today', sessionId:nav.sessionId, authoredBy:S.clinician.name,
          body: (document.getElementById('cw-a-body')?.value ?? cur.body) };
        S.assessment.currentVersion = newV;
        const s = S.sessions.find(x => x.id === nav.sessionId);
        if (s) { s.assessmentVersion = newV; }
        notify('Assessment v'+newV+' saved');
        nav.screen = nav.assessmentOrigin === 'patient' ? 'patient' : 'session';
        render();
      }
      if (a === 'assess-pick') { nav.assessmentVersion = parseInt(b.dataset.v,10); render(); }
      if (a === 'assess-current') { nav.assessmentVersion = null; render(); }
      if (a === 'assess-discard') {
        nav.screen = nav.assessmentOrigin === 'patient' ? 'patient' : 'session';
        notify('Changes discarded');
        render();
      }
      if (a === 'tx-accept-sug') {
        S.goals.draft.rxs.push({ id:uid('rx'), type:'exercise', title:'Evening wind-down — no screens after 21:30', trigger:'Time · Nightly 21:30', rules:'Phone face-down. Low-stim activity until lights out.' });
        S.goals.draft.rejectedSuggestion = true;
        notify('Suggestion added to draft'); bus.emit();
      }
      if (a === 'tx-dismiss-sug') { S.goals.draft.rejectedSuggestion = true; bus.emit(); }
      if (a === 'tx-edit-sug') {
        nav.rxModal = { mode:'add', fromSuggestion:true, rx:{ type:'exercise', title:'Evening wind-down — no screens after 21:30', triggerKind:'time', triggerDetail:'Nightly 21:30', rules:'Phone face-down. Low-stim activity until lights out.', params:{ exercise:'Evening wind-down — no screens after 21:30' } } };
        render();
      }
      if (a === 'tx-add') {
        nav.rxModal = { mode:'add', rx:{ type:null, title:'', triggerKind:'time', triggerDetail:'', rules:'', params:{} } };
        render();
      }
      if (a === 'tx-edit') {
        const rx = S.goals.draft.rxs.find(x => x.id === b.dataset.id);
        if (rx) {
          const isSituation = /condition|situation|when |if /i.test(rx.trigger||'');
          const detail = (rx.trigger||'').replace(/^(Time|Condition|Situation)\s*·\s*/i, '');
          nav.rxModal = { mode:'edit', rx:{ id:rx.id, type:rx.type, title:rx.title||'', triggerKind:isSituation?'situation':'time', triggerDetail:detail, rules:rx.rules||'', cta:rx.cta, params: rx.params ? {...rx.params} : {} } };
          render();
        }
      }
      if (a === 'rx-cancel') { nav.rxModal = null; render(); }
      if (a === 'rx-pick-type') {
        readRxInputs();
        nav.rxModal.rx.type = b.dataset.type;
        render();
      }
      if (a === 'rx-trig-kind') {
        readRxInputs();
        nav.rxModal.rx.triggerKind = b.dataset.kind;
        render();
      }
      if (a === 'rx-save') {
        readRxInputs();
        const rx = nav.rxModal.rx;
        if (!rx.type) return;
        const trigStr = (rx.triggerKind==='situation'?'Condition · ':'Time · ') + (rx.triggerDetail||'');
        const title = rxComposeTitle(rx);
        if (nav.rxModal.mode === 'add') {
          S.goals.draft.rxs.push({ id:uid('rx'), type:rx.type, title, trigger:trigStr, rules:rx.rules, params:rx.params });
          if (nav.rxModal.fromSuggestion) S.goals.draft.rejectedSuggestion = true;
          notify('Prescription added to draft');
        } else {
          const ex = S.goals.draft.rxs.find(x => x.id === rx.id);
          if (ex) { ex.title = title; ex.trigger = trigStr; ex.rules = rx.rules; ex.params = rx.params; }
          notify('Prescription updated');
        }
        nav.rxModal = null;
        render();
      }
      if (a === 'rx-remove') {
        const id = nav.rxModal?.rx?.id;
        if (id) {
          S.goals.draft.rxs = S.goals.draft.rxs.filter(x => x.id !== id);
          notify('Prescription removed');
        }
        nav.rxModal = null;
        render();
      }
      if (a === 'wlp-discard') { nav.wlpDraft = null; nav.screen = 'patient'; render(); }
      if (a === 'wlp-page') {
        S.wholeLifePlan.categories.forEach((c,i) => { const el = document.getElementById('cw-wlp-'+i); if (el && nav.wlpDraft) nav.wlpDraft.objectives[c] = el.value; });
        nav.wlpPage = parseInt(b.dataset.page,10);
        render();
      }
      if (a === 'wlp-publish') {
        const newV = S.wholeLifePlan.currentVersion + 1;
        const obj = {};
        S.wholeLifePlan.categories.forEach((c,i) => { const el = document.getElementById('cw-wlp-'+i); obj[c] = el ? el.value : (nav.wlpDraft?.objectives[c]||''); });
        S.wholeLifePlan.versions[newV] = { date:'Today', authoredBy:S.clinician.name, objectives: obj };
        S.wholeLifePlan.currentVersion = newV;
        nav.wlpDraft = null;
        addActivity({ type:'system', t:'now', title:`Treatment plan published · v${newV}`, meta:'Chen will see the updated treatment plan on next launch.' });
        notify('Treatment plan v'+newV+' published');
        nav.screen = 'patient'; render();
      }
      if (a === 'tx-discard') { S.goals.draft = null; nav.screen = 'patient'; render(); }
      if (a === 'tx-publish') {
        const newV = S.goals.currentVersion + 1;
        S.goals.versions[newV] = S.goals.draft;
        S.goals.currentVersion = newV;
        S.goals.draft = null;
        const s = S.sessions.find(x => x.id === nav.sessionId) || S.sessions[S.sessions.length-1];
        if (s) { s.planVersion = 'v'+newV; }
        addActivity({ type:'system', t:'now', title:`Goals published · v${newV}`, meta:'Chen will see the updated goals on next launch.' });
        notify('Goals v'+newV+' published');
        nav.screen = 'patient'; render();
      }
      if (a === 'open-session-assess') {
        const s = S.sessions.find(x => x.id === nav.sessionId);
        nav.assessmentOrigin = 'session';
        nav.assessmentVersion = (s && s.assessmentVersion && s.assessmentVersion !== S.assessment.currentVersion) ? s.assessmentVersion : null;
        nav.screen = 'assessment'; render();
      }
      if (a === 'open-stage') {
        const st = b.dataset.st;
        if (st==='note') nav.screen='note';
        render();
      }
      if (a === 'open-dp-extract') { nav.dpModal = { kind:'extract', sessionId: nav.sessionId }; render(); }
      if (a === 'open-dp-add') { nav.dpModal = { kind:'add', sessionId: nav.sessionId }; render(); }
      if (a === 'dp-add-from-extract') { nav.dpModal = { kind:'add', sessionId: nav.dpModal?.sessionId ?? nav.sessionId }; render(); }
      if (a === 'dp-cancel') { nav.dpModal = null; render(); }
      if (a === 'dp-open') { nav.dpModal = { kind:'read', id: b.dataset.id }; render(); }
      if (a === 'dp-edit-cancel') {
        const rt = nav.dpModal?.returnTo;
        const id = nav.dpModal?.id;
        nav.dpModal = rt === 'read'
          ? { kind:'read', id }
          : (nav.dpModal && nav.dpModal.sessionId ? { kind:'extract', sessionId: nav.dpModal.sessionId } : null);
        render();
      }
      if (a === 'dp-edit') {
        const dp = (S.dataPoints||[]).find(x => x.id === b.dataset.id);
        nav.dpModal = { kind:'edit', id: b.dataset.id, sessionId: nav.dpModal?.sessionId ?? dp?.sessionId ?? nav.sessionId, returnTo: nav.dpModal?.kind || 'extract' };
        render();
      }
      if (a === 'dp-approve') {
        const d = (S.dataPoints||[]).find(x => x.id === b.dataset.id);
        if (d) d.status = 'approved';
        notify('Data point approved'); render();
      }
      if (a === 'dp-undo') {
        const d = (S.dataPoints||[]).find(x => x.id === b.dataset.id);
        if (d) d.status = 'pending';
        notify('Moved back to pending'); render();
      }
      if (a === 'dp-dismiss') {
        S.dataPoints = (S.dataPoints||[]).filter(x => x.id !== b.dataset.id);
        notify('Data point denied'); render();
      }
      if (a === 'dp-save') {
        const prompt = (document.getElementById('cw-dp-prompt')?.value || '').trim();
        const answer = (document.getElementById('cw-dp-answer')?.value || '').trim();
        const referenceDate = (document.getElementById('cw-dp-refdate')?.value || '').trim();
        if (prompt || answer) {
          S.dataPoints.push({ id:uid('dp'), sessionId: nav.dpModal?.sessionId || null, prompt: prompt||'Untitled prompt', answer, referenceDate: referenceDate||'—', collectedAt:'Today', source:'manual', status:'approved' });
          notify('Data point added');
        }
        nav.dpModal = nav.dpModal && nav.dpModal.sessionId ? { kind:'extract', sessionId: nav.dpModal.sessionId } : null;
        render();
      }
      if (a === 'dp-save-edit') {
        const d = (S.dataPoints||[]).find(x => x.id === b.dataset.id);
        if (d) {
          const prompt = (document.getElementById('cw-dp-prompt')?.value || '').trim();
          const answer = (document.getElementById('cw-dp-answer')?.value || '').trim();
          const referenceDate = (document.getElementById('cw-dp-refdate')?.value || '').trim();
          if (prompt) d.prompt = prompt;
          d.answer = answer;
          if (referenceDate) d.referenceDate = referenceDate;
          notify('Data point updated');
        }
        const rt = nav.dpModal?.returnTo;
        nav.dpModal = rt === 'read'
          ? { kind:'read', id: b.dataset.id }
          : (nav.dpModal && nav.dpModal.sessionId ? { kind:'extract', sessionId: nav.dpModal.sessionId } : null);
        render();
      }
      if (a === 'dp-done') {
        const sid = nav.dpModal?.sessionId;
        (S.dataPoints||[]).filter(x => x.sessionId === sid && x.status === 'pending').forEach(x => x.status = 'approved');
        const sess = S.sessions.find(x => x.id === sid);
        addActivity({ type:'shared', t:'now', title:`Data points approved · Session #${sess?sess.num:''}`, meta:'Saved to Chen\'s biopsychosocial record.' });
        notify('All pending data points approved');
        nav.dpModal = null; render();
      }
      if (a === 'open-session') { nav.sessionId = b.dataset.id; nav.screen='session'; render(); }
      if (a === 'open-messages') { nav.screen = 'messaging'; render(); }
    });
  }

  window.renderClinicianWeb = render;
})();
