/* Shared store + tiny event bus. Each surface reads from `S` and re-renders on `bus.emit('changed')`. */
(function () {
  const listeners = new Set();
  window.bus = {
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    emit() { listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); },
  };

  function uid(p='id') { return p + '_' + Math.random().toString(36).slice(2, 9); }

  function defaultState() {
    return {
      now: '2026-05-27 09:41',
      clinician: { id:'rachel', name:'Shari B Kaplan, LCSW', initials:'SK', email:'shari@tendclinic.com', role:'Clinical social worker · LCSW', license:'LCSW-32018', tz:'Europe/Tel Aviv (GMT+3)' },
      patient:   { id:'sarah',  name:'Chen V', initials:'CV', tags:['PTSD','Sleep','Veteran (IDF)'], age:34, pronouns:'he/him', sex:'Male', phone:'+1 555 0188', comm:['SMS','WhatsApp','Email'], sinceLabel:'Patient since Nov 2025', sinceLabelShort:'6 months' },
      tagLibrary: [
        { label:'PTSD',          color:'amber', patients:1 },
        { label:'Sleep',         color:'blue',  patients:1 },
        { label:'Veteran (IDF)', color:'green', patients:1 },
      ],
      compliance: { value: 82, deltaLabel: '+6 last 7 days', sparkline: [62,65,68,66,71,74,72,75,78,76,80,82], visibleToPatient: false },
      // Sessions lifecycle: stages.raw, stages.note, stages.assessment, stages.plan
      sessions: [
        { id:'s9',  num:9,  date:'May 2 ',  duration:'47 min', src:'Google Meet', stages:{raw:true,note:true,assessment:true,plan:true},
          note:{ summary:'Sertraline started; trauma flashbacks surfacing after a stressful meeting. Established biweekly cadence and grounding work.', subjective:'', objective:'', assessmentPlan:'Started Sertraline 50mg; trauma flashbacks after Tuesday meeting. Discussed grounding; scheduled biweekly cadence. Plan: daily gratitude journal; breathwork as needed.' },
          planVersion:'v2', assessmentVersion: 6 },
        { id:'s10', num:10, date:'May 9 ',  duration:'53 min', src:'Google Meet', stages:{raw:true,note:true,assessment:true,plan:true},
          note:{ summary:'Medication side-effects easing and mood lifting slightly. Reinforced sleep hygiene and HRV tracking.', subjective:'', objective:'', assessmentPlan:'Sertraline GI side-effects easing; mood lifting slightly. Reinforced sleep hygiene; tracked HRV pattern. Plan: continue gratitude; track bedtime regularity.' },
          planVersion:'v3', assessmentVersion: 7 },
        { id:'s11', num:11, date:'May 16', duration:'48 min', src:'Google Meet', stages:{raw:true,note:true,assessment:true,plan:true},
          note:{ summary:'Deadline week pushed bedtimes back to 1am with anxious mornings. Introduced box breathing and a phone-use boundary.', subjective:'', objective:'', assessmentPlan:'Work deadline week — back to 1am bedtimes, anxious mornings. Box breathing introduced; phone-use boundary planned. Plan: box breathing on stress; gratitude continues.' },
          planVersion:'v3', assessmentVersion: 7 },
        { id:'s12', num:12, date:'May 23', duration:'47 min', src:'Google Meet', stages:{raw:true,note:true,assessment:false,plan:false},
          note:{ summary:'Sleep deterioration during a work-deadline week, with anxious mornings and phone-related avoidance of evening wind-down. Mood flat but stable; no new safety concerns. Reinforced a 21:30 wind-down rule and on-demand breathwork.', subjective:'Reports a hard week — work deadline crunch, falling asleep past 1am most nights. Says "I feel wired but exhausted." Gratitude practice has helped on mornings she keeps it; skipped it twice when she was running late. No suicidal ideation; mood described as "flat, not dark."', objective:'Arrived 4 min late, slightly winded. Affect constricted, attention intact. Speech rate elevated early in session, normalized by minute 15. Notable phone-checking behavior (3×) when discussing roommate dynamics. No psychomotor agitation. Engaged with breathwork demo without resistance.', assessmentPlan:'Trauma-linked hyperarousal continues to drive avoidance of evening transitions, maintaining a sleep-anxiety loop; gratitude practice is becoming a stabilizing anchor (87% adherence). No acute safety concerns this session. Plan: reinforce 21:30 no-screen wind-down rule, continue daily gratitude journal, use 4-7-8 breathwork when stress crosses threshold, and re-evaluate sleep timing in 2 weeks.' },
          transcript:[
            { who:'Shari', text:'How have things been since we last met?' },
            { who:'Chen',  text:"Honestly, rough. The deadline at work hit and I've been falling asleep past 1am most nights. I feel wired but exhausted." },
            { who:'Shari', text:'Are you still keeping up the gratitude journal in the mornings?' },
            { who:'Chen',  text:'Mostly. I skipped it twice when I was running out the door, but the days I do it feel different.' },
            { who:'Shari', text:'Any darker thoughts this week, or mostly the flat, drained feeling?' },
            { who:'Chen',  text:"Flat, not dark. I'm not in a scary place, just running on empty." },
            { who:'Shari', text:"Let's try a 21:30 wind-down rule — no screens after that — and lean on the 4-7-8 breathwork when the stress spikes." },
            { who:'Chen',  text:'I can try that. The phone is definitely the thing keeping me up.' },
          ],
          planVersion:'v4', assessmentVersion: 8 },
      ],
      // Treatment plan versions
      txPlan: {
        currentVersion: 4, draft: null, versions: {
          1: { rxs: [
            { id:uid('rx'), type:'medication', title:'Take Sertraline 25mg', trigger:'Time · Daily 08:00', rules:'Take with food.' },
          ]},
          2: { rxs: [
            { id:uid('rx'), type:'medication', title:'Take Sertraline 50mg', trigger:'Time · Daily 08:00', rules:'Take with food.' },
            { id:uid('rx'), type:'journaling', title:'3 things you\'re grateful for', trigger:'Time · Daily', rules:'Before 21:00 ideally.' },
          ]},
          3: { rxs: [
            { id:uid('rx'), type:'medication', title:'Take Sertraline 50mg', trigger:'Time · Daily 08:00', rules:'Take with food.' },
            { id:uid('rx'), type:'sleep',      title:'Be asleep by 22:00',      trigger:'Time · Nightly', rules:'If you can\'t sleep within 20 min, get up and do a quiet activity until drowsy.' },
            { id:uid('rx'), type:'journaling', title:'3 things you\'re grateful for', trigger:'Time · Daily', rules:'Before 21:00 ideally.' },
            { id:uid('rx'), type:'exercise',   title:'Box breathing', trigger:'Condition · on stress', rules:'4-4-4-4 sec, 4 cycles.' },
          ]},
          4: { rxs: [
            { id:uid('rx'), type:'medication', title:'Take Sertraline 50mg', trigger:'Time · Daily 08:00', rules:'Take with food.', cta:'Mark taken' },
            { id:uid('rx'), type:'sleep',      title:'Be asleep by 22:00',      trigger:'Time · Nightly', rules:'If you can\'t sleep within 20 min, get up and do a quiet activity until drowsy.', cta:'Log bedtime' },
            { id:uid('rx'), type:'journaling', title:'3 things you\'re grateful for', trigger:'Time · Daily', rules:'Before 21:00 ideally.', cta:'Open journal' },
            { id:uid('rx'), type:'exercise',   title:'4-7-8 Breathwork (4 cycles)', trigger:'Condition · when stress is high (HR > 95 sustained)', rules:'Inhale 4 sec · hold 7 sec · exhale 8 sec. Repeat 4 times.', cta:'Start exercise' },
          ]},
        },
      },
      // Versioned assessment
      assessment: {
        currentVersion: 8,
        versions: {
          6:  { date:'May 2',  sessionId:'s9',  authoredBy:'Shari Kaplan', body:{
            biological:'Sertraline 25mg started. Sleep latency 60-90 min. Resting HR 78 (baseline ~72).',
            psychological:'Hyperarousal pattern still dominant; trauma-linked avoidance manifesting as digital-numbing (long phone scrolling sessions evenings). Gratitude journal early-stage — patient skeptical but compliant.',
            social:'Job stress acute — sprint review next week. Roommate (Mia) noted as supportive. No new social stressors flagged this period.',
          }},
          7: { date:'May 9', sessionId:'s10', authoredBy:'Shari Kaplan', body:{
            biological:'Sertraline titrated up 2 weeks ago. GI side-effects subsiding. Sleep latency averaging ~50 min.',
            psychological:'Avoidance softer mid-cycle, returns under deadline. Gratitude practice approaching habit threshold (~80% adherence).',
            social:'Roommate dynamics stable. Work pressure recurring.',
          }},
          8: { date:'May 23', sessionId:'s12', authoredBy:'Shari Kaplan', body:{
            biological:'Sertraline 50mg titrated up 2 weeks ago, with modest mood improvement and GI side-effects subsiding. Sleep latency averaging 45 min, with onset between 23:30-01:30. HR variability suggests elevated baseline arousal under work stress.',
            psychological:'Trauma-linked hyperarousal continues to drive avoidance of evening transitions. Compulsive phone scrolling as self-soothing maintains the sleep-anxiety loop. Gratitude practice is becoming a real anchor (87% adherence).',
            social:'Work pressure peaking on a quarterly cycle — pattern matches prior sleep deterioration episodes. Single roommate (Mia) supportive but not aware of treatment. Recent shift in close-friend dynamics may be re-activating attachment-related vigilance.',
          }},
        },
      },
      // Activity feed (clinician web). Newest first.
      activity: [
        { id:uid('act'), type:'shared', t:'-3h', title:'Shared 3 new data points', meta:'Sleep duration · HR variability · Activity steps', read:true },
        { id:uid('act'), type:'coach', t:'-4h', title:'Coach AI · conversation resumed', meta:'Reopened sleep-onset thread after a quiet day · 6 new messages', read:true },
        { id:uid('act'), type:'message', t:'-5h', title:'Chen sent a message', meta:'"Quick question about the new sleep prescription — am I supposed to skip my evening tea?"', read:true },
        { id:uid('act'), type:'coach', t:'-2d', title:'Coach AI · new conversation', meta:'"What should I do if I can\'t fall asleep?" · 9 messages', read:true },
        { id:uid('act'), type:'session', t:'-2d', title:'Session #12 uploaded', meta:'Notes complete · Assessment pending', read:true },
      ],
      // Shared data sources
      sharedData: {
        bySource: [
          { id:'apple',   name:'Apple Watch (manual)', icon:'⌚', updated:'1h ago', items:[
            { label:'Sleep · last night', value:'6h 12m' },
            { label:'Resting HR',         value:'74 bpm' },
            { label:'Steps · today',      value:'4,212' },
          ]},
          { id:'coach', name:'Coach AI (Delphi)', icon:'✨', updated:'2 sessions this week', items:[
            { label:'"What should I do if I can\'t fall asleep?"', value:'2d' },
          ]},
          { id:'journal', name:'Journal applet', icon:'📓', updated:'17 entries', items:[
            { label:'Gratitude — today', value:'Today', tag:'flagged' },
            { label:'Gratitude — yesterday', value:'Yesterday' },
          ]},
        ],
        timeline: [
          { date:'Today · 14:22', src:'journal', label:'Journal entry · gratitude', meta:'Pattern detected in entry body. Safety review triggered.', flagged:true },
          { date:'Today · 08:14', src:'apple', label:'Sleep · last night', meta:'Bedtime 00:48 · latency 42m · 2 awakenings · quality 3/5' },
          { date:'Today · 03:02', src:'apple', label:'Resting HR', meta:'74 bpm' },
          { date:'Yesterday · 21:48', src:'coach', label:'Coach AI conversation', meta:'"What should I do if I can\'t fall asleep tonight?" · 9 messages' },
          { date:'Yesterday · 20:55', src:'journal', label:'Gratitude journal entry', meta:'3 things' },
          { date:'Yesterday · 09:18', src:'apple', label:'Activity · daily steps', meta:'7,418' },
          { date:'May 26 · 07:00', src:'apple', label:'HR variability · daily summary', meta:'38 ms' },
        ],
      },
      // Messages between Shari & Chen
      messages: [
        { id:uid('m'), from:'sarah',  text:'Quick question about the new sleep prescription — am I supposed to skip my evening tea? I usually have one around 20:30 and now I\'m wondering if it\'s part of the problem.', at:'Today · 15:42' },
        { id:uid('m'), from:'rachel', text:'Good catch. Caffeine after 4pm can absolutely push your sleep onset back. Try switching to a caffeine-free herbal blend for a week and let me know what changes.', at:'Today · 15:46' },
        { id:uid('m'), from:'sarah',  text:'Ok will do — chamomile or rooibos OK?', at:'Today · 15:50' },
      ],
      // Patient mobile state
      patientApp: {
        locked: false, lockReason: null, lockQuote: null,
        tasks: [
          { id:'t1', kind:'medication', title:'Morning medication', meta:'08:00 · Sertraline 50mg', cta:'Mark taken', done:true, doneLabel:'Done' },
          { id:'t2', kind:'journaling', title:'Gratitude journal', meta:'3 things you\'re grateful for · before 21:00', cta:'Open' },
          { id:'t3', kind:'exercise',   title:'4-7-8 Breathwork', meta:'4 cycles · when stress is high', cta:'On-demand', dim:true },
          { id:'t4', kind:'sleep',      title:'Be asleep by 22:00', meta:'Sleep schedule · log bedtime in the morning' },
        ],
        journalEntries: [
          { id:'j1', date:'Mon 21:08', title:'Gratitude — 3 things', body:'Coffee with Mia. Finished the proposal. The smell of rain in the afternoon.', summary:'Coffee with Mia. Finished the proposal. The smell of rain in the afternoon.', favorite:true, shared:true },
          { id:'j2', date:'Sun 23:42', title:'Hard day', body:'Couldn\'t shake the chest tightness. Tried the breathwork. Didn\'t really help today...', summary:'Couldn\'t shake the chest tightness. Tried the breathwork. Didn\'t really help today...', favorite:false, shared:true },
          { id:'j3', date:'Fri 20:55', title:'Gratitude — 3 things', body:'The new headphones. A clean inbox. Sleeping past 7am for once.', summary:'The new headphones. A clean inbox. Sleeping past 7am for once.', favorite:true, shared:true },
        ],
        journalTrash: [
          { id:'jt1', date:'Today · 11:02', title:'Stray thought', body:'Wrote this by accident from the wrong prompt — meant to put it in the work app.', summary:'Wrote this by accident from the wrong prompt — meant to put it in the work app.', favorite:false, daysLeft:7 },
          { id:'jt2', date:'Sat · 22:14', title:'Gratitude — 3 things', body:'The cold side of the pillow. A walk without my phone. Mia laughing at the dumb joke.', summary:'The cold side of the pillow. A walk without my phone. Mia laughing at the dumb joke.', favorite:false, daysLeft:4 },
          { id:'jt3', date:'Apr 14 · 19:30', title:'Frustrated', body:'Phone died mid-entry and I lost the whole thing. Trying again tomorrow.', summary:'Phone died mid-entry and I lost the whole thing. Trying again tomorrow.', favorite:false, daysLeft:1 },
        ],
        coachMessages: [
          { from:'coach', text:'Hi Chen — what\'s on your mind tonight?' },
        ],
        incognito: false,
        dataSharing: { master:true, items:[
          { id:'aw', label:'Apple Watch data',  icon:'watch', on:true },
          { id:'jn', label:'Journal entries',   icon:'book-open', on:true },
          { id:'co', label:'Coach AI conversations', icon:'sparkles', sub:'POC: Delphi-hosted — clinician can read regardless', on:true },
          { id:'cl', label:'Calendar applet activity', icon:'calendar', on:false },
          { id:'mo', label:'Mood check-ins',   icon:'smile', on:true },
        ]},
        appleWatch: { sleep:{bedtime:'23:14',wake:'06:52',latency:'42 min',awakenings:'2',quality:4}, hr:'74 bpm', bp:'118 / 76', temp:'36.7 °C', resp:'16 / min', steps:'4,212' },
        plan: { viewVersion: 'current' },
      },
      // Clinician mobile state
      clinicianMobile: { uploadedFlash:null },
      // Push notifications for clinician mobile (banner stack)
      cmPush: [],
      // App-wide notifications
      notifCount: 1,
      // Dysregulation flag
      dysregulation: null,
      // Coach flag
      coachFlag: null,
      // Auth gates per surface — all start signed out for the demo.
      // clinicianMobile / clinicianWeb: 'login' | 'login-error' | 'in'
      // patient: 'welcome' | 'register' | 'register-error' | 'login' | 'login-error' | 'waiting' | 'in'
      auth: { clinicianMobile:'login', clinicianWeb:'login', patient:'welcome' },
      // Invited-but-not-signed-up patients
      pendingPatients: [
        { id:'pp1', name:'Aria R', email:'aria.r@email.com', age:null, emergency:null, tags:[], invitedAt:'2 hours ago' },
      ],
      // Add-patient wizard (clinician web). null when closed; otherwise { step, name, email, age, emergency, tags }
      addPatientFlow: null,
      // Patient edit modal — set to patientId ('sarah') or pending id ('pp1') when open
      editPatientModal: null,
      // Navigation per surface (managed in each surface file)
    };
  }

  window.S = defaultState();
  window.resetState = () => { window.S = defaultState(); window.bus.emit(); };
  // Sign every surface in as the demo personas (Shari + Chen).
  window.signInAll = () => {
    S.auth.clinicianMobile = 'in';
    S.auth.clinicianWeb = 'in';
    S.auth.patient = 'in';
    bus.emit();
  };
  window.signOutAll = () => {
    S.auth.clinicianMobile = 'login';
    S.auth.clinicianWeb = 'login';
    S.auth.patient = 'welcome';
    if (window.cmNav) { cmNav.screen = 'home'; cmNav.overlay = null; }
    if (window.cwNav) { cwNav.screen = 'patients'; }
    if (window.pmNav) { pmNav.tab = 'today'; pmNav.sub = null; pmNav.modal = null; }
    bus.emit();
  };
  window.uid = uid;

  // Cross-surface helpers
  window.notify = function (msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.getElementById('toast-host').appendChild(t);
    setTimeout(() => t.remove(), 2400);
  };

  window.pushToCm = function (push) {
    push.id = push.id || uid('push');
    S.cmPush.unshift(push);
    bus.emit();
    setTimeout(() => {
      const i = S.cmPush.findIndex(p => p.id === push.id);
      if (i >= 0) { S.cmPush.splice(i,1); bus.emit(); }
    }, 6500);
  };

  // Sharing gate: returns true if the given data kind (journal | coach | watch | calendar | mood)
  // should propagate to the clinician based on patient's data-sharing settings.
  // Master switch overrides per-item toggles.
  window.isShared = function (kind) {
    const ds = S.patientApp && S.patientApp.dataSharing;
    if (!ds) return true;
    if (!ds.master) return false;
    const map = { journal:'jn', coach:'co', watch:'aw', calendar:'cl', mood:'mo' };
    const id = map[kind];
    if (!id) return true;
    const item = ds.items.find(x => x.id === id);
    return !!(item && item.on);
  };

  window.addActivity = function (act) {
    act.id = uid('act');
    act.read = false;
    S.activity.unshift(act);
    S.notifCount += 1;
    bus.emit();
  };
})();
