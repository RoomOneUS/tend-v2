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
      // Sessions lifecycle: stages.raw, stages.note, stages.dataPoints (assessment/goals/wholeLifePlan are referenced, not staged)
      sessions: [
        { id:'s9',  num:9,  date:'May 2 ',  duration:'47 min', src:'Google Meet', stages:{raw:true,note:true,dataPoints:true},
          note:{ summary:'Sertraline started; trauma flashbacks surfacing after a stressful meeting. Established biweekly cadence and grounding work.', subjective:'', objective:'', assessmentPlan:'Started Sertraline 50mg; trauma flashbacks after Tuesday meeting. Discussed grounding; scheduled biweekly cadence. Plan: daily gratitude journal; breathwork as needed.' },
          planVersion:'v2', assessmentVersion: 6, wholeLifePlanVersion: 2 },
        { id:'s10', num:10, date:'May 9 ',  duration:'53 min', src:'Google Meet', stages:{raw:true,note:true,dataPoints:true},
          note:{ summary:'Medication side-effects easing and mood lifting slightly. Reinforced sleep hygiene and HRV tracking.', subjective:'', objective:'', assessmentPlan:'Sertraline GI side-effects easing; mood lifting slightly. Reinforced sleep hygiene; tracked HRV pattern. Plan: continue gratitude; track bedtime regularity.' },
          planVersion:'v3', assessmentVersion: 7, wholeLifePlanVersion: 3 },
        { id:'s11', num:11, date:'May 16', duration:'48 min', src:'Google Meet', stages:{raw:true,note:true,dataPoints:true},
          note:{ summary:'Deadline week pushed bedtimes back to 1am with anxious mornings. Introduced box breathing and a phone-use boundary.', subjective:'', objective:'', assessmentPlan:'Work deadline week — back to 1am bedtimes, anxious mornings. Box breathing introduced; phone-use boundary planned. Plan: box breathing on stress; gratitude continues.' },
          planVersion:'v3', assessmentVersion: 7, wholeLifePlanVersion: 3 },
        { id:'s12', num:12, date:'May 23', duration:'47 min', src:'Google Meet', stages:{raw:true,note:true,dataPoints:false},
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
          planVersion:'v4', assessmentVersion: 8, wholeLifePlanVersion: 3 },
      ],
      // Goals versions
      goals: {
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
            { id:uid('rx'), type:'medication', title:'Take Sertraline 50mg', trigger:'Time · Daily 08:00', rules:'Take with food.', cta:'Mark taken', params:{ med:'Sertraline', dose:'50mg' } },
            { id:uid('rx'), type:'sleep',      title:'Be asleep by 22:00',      trigger:'Time · Nightly', rules:'If you can\'t sleep within 20 min, get up and do a quiet activity until drowsy.', cta:'Log bedtime', params:{ bedtime:'22:00', minDur:'7 h', wake:'06:30' } },
            { id:uid('rx'), type:'journaling', title:'3 things you\'re grateful for', trigger:'Time · Daily', rules:'Before 21:00 ideally.', cta:'Open journal', params:{ prompt:'3 things you\'re grateful for' } },
            { id:uid('rx'), type:'exercise',   title:'4-7-8 Breathwork (4 cycles)', trigger:'Condition · when stress is high (HR > 95 sustained)', rules:'Inhale 4 sec · hold 7 sec · exhale 8 sec. Repeat 4 times.', cta:'Start exercise', params:{ exercise:'4-7-8 Breathwork', reps:'4 cycles' } },
          ]},
        },
      },
      // Versioned assessment — a single unstructured free-text diagnostic write-up per version (no biological/psychological/social split).
      assessment: {
        currentVersion: 8,
        versions: {
          6:  { date:'May 2',  sessionId:'s9',  authoredBy:'Shari Kaplan', body:'Sertraline 25mg started; sleep latency 60–90 min and resting HR 78 (baseline ~72). Hyperarousal remains the dominant pattern, with trauma-linked avoidance showing up as evening digital-numbing (long phone-scrolling sessions); the gratitude journal is early-stage and the patient is skeptical but compliant. Job stress is acute ahead of next week\'s sprint review; her roommate Mia is supportive, with no new social stressors flagged this period.' },
          7: { date:'May 9', sessionId:'s10', authoredBy:'Shari Kaplan', body:'Sertraline titrated up two weeks ago, with GI side-effects subsiding and sleep latency averaging about 50 minutes. Avoidance is softer mid-cycle but returns under deadline pressure, and the gratitude practice is approaching habit threshold (~80% adherence). Roommate dynamics are stable; work pressure is recurring on its usual cycle.' },
          8: { date:'May 23', sessionId:'s12', authoredBy:'Shari Kaplan', body:'Sertraline 50mg was titrated up two weeks ago, with modest mood improvement as the GI side-effects subside; sleep latency now averages about 45 minutes, with onset drifting between 23:30 and 01:30, and HR variability suggests an elevated baseline arousal under work stress. Trauma-linked hyperarousal continues to drive avoidance of evening transitions, and compulsive phone-scrolling as self-soothing maintains the sleep-anxiety loop — though the daily gratitude practice is becoming a genuine anchor (87% adherence). Work pressure is peaking on its usual quarterly cycle, a pattern that matches prior sleep-deterioration episodes; her roommate Mia is supportive but unaware of treatment, and a recent shift in close-friend dynamics may be re-activating attachment-related vigilance.' },
        },
      },
      // Whole Life Plan (the "treatment plan") — free-text objectives across 14 categories, versioned.
      wholeLifePlan: {
        currentVersion: 3,
        categories: ['Nutrition','Exercise','Music & Movement','Meditation & Mindfulness','Self-regulation tools','Breathwork','Spirituality','Finances','Work & Work Relationships','Fun & Hobbies','Mentoring & Volunteering','Relationship with Self','Relationships with Others','Personality'],
        versions: {
          2: { date:'May 9', authoredBy:'Shari Kaplan', objectives: {
            'Nutrition':'Protein + greens at breakfast. Begin pulling caffeine earlier in the day.',
            'Exercise':'Re-establish a short morning walk most days.',
            'Meditation & Mindfulness':'Reintroduce a brief daily body scan.',
            'Breathwork':'4-7-8 breathing when stress spikes.',
            'Work & Work Relationships':'Notice the deadline-week sleep slide; name it with Shari.',
            'Relationship with Self':'Soften the all-or-nothing self-talk on missed days.',
          }},
          3: { date:'May 23', authoredBy:'Shari Kaplan', objectives: {
            'Nutrition':'Anti-inflammatory focus: protein and greens at breakfast; caffeine cutoff at 14:00 to protect sleep onset.',
            'Exercise':'20-minute morning walk 4×/week; add light resistance work twice weekly as energy returns.',
            'Music & Movement':'Evening wind-down playlist; five minutes of free movement or stretching before bed.',
            'Meditation & Mindfulness':'Daily 5-minute body scan; notice the urge to phone-scroll in the evening without acting on it.',
            'Self-regulation tools':'Name the feeling, ground with 5-4-3-2-1, then choose one small next step.',
            'Breathwork':'4-7-8 breathing on rising stress and as part of the bedtime routine.',
            'Spirituality':'Reconnect with what feels meaningful — gratitude reflection and weekend time in nature.',
            'Finances':'Reduce money rumination: one 15-minute weekly review, then close the laptop.',
            'Work & Work Relationships':'Protect a 19:00 hard stop on deadline weeks; one honest check-in with the manager about load.',
            'Fun & Hobbies':'Reclaim one phone-free hobby block each week (sketching) for its own sake.',
            'Mentoring & Volunteering':'Explore a low-commitment way to support fellow veterans once things stabilize.',
            'Relationship with Self':'Soften self-talk on missed days; treat the plan as practice, not a test.',
            'Relationships with Others':'Let Mia in a little more — share one real thing each week.',
            'Personality':'Lean on conscientiousness as a strength; watch the perfectionism that fuels avoidance.',
          }},
        },
      },
      // Data points — biopsychosocial Q&A captured about the patient. Each is a clinician prompt + the patient's answer.
      // referenceDate = the date/period the answer is *about* (e.g. a childhood event). collectedAt = when it was recorded (auto-captured).
      // Extracted from notes or added manually. Not a required session stage — clinicians can approve/edit/deny anytime.
      dataPoints: [
        { id:uid('dp'), sessionId:'s12', prompt:'How has your sleep been over the past two weeks?', answer:'Falling asleep past 1:00 most nights; onset drifting to 23:30–01:30.', referenceDate:'Past 2 weeks', collectedAt:'May 23', source:'extracted', status:'pending' },
        { id:uid('dp'), sessionId:'s12', prompt:'When did the sleep difficulties first begin?', answer:'Traces back to a 2014 deployment; symptoms worsened after discharge.', referenceDate:'2014', collectedAt:'May 23', source:'extracted', status:'pending' },
        { id:uid('dp'), sessionId:'s12', prompt:'How would you describe your mood, and any thoughts of harming yourself?', answer:'Mood "flat, not dark." Denies suicidal ideation.', referenceDate:'This week', collectedAt:'May 23', source:'extracted', status:'approved' },
        { id:uid('dp'), sessionId:'s12', prompt:'Tell me about a relationship that feels supportive.', answer:'Living with Mia since 2022 — describes her as a steadying presence.', referenceDate:'Since 2022', collectedAt:'May 9', source:'manual', status:'approved' },
        { id:uid('dp'), sessionId:'s11', prompt:'What\'s driving the late bedtimes right now?', answer:'Quarterly deadline crunch at work.', referenceDate:'This month', collectedAt:'May 16', source:'extracted', status:'approved' },
        { id:uid('dp'), sessionId:'s11', prompt:'What coping skill did we introduce for acute stress?', answer:'Box breathing for acute stress moments.', referenceDate:'May 16', collectedAt:'May 16', source:'manual', status:'approved' },
        { id:uid('dp'), sessionId:null, prompt:'Who is in your support network?', answer:'Roommate Mia is supportive but unaware of treatment.', referenceDate:'Since 2022', collectedAt:'May 9', source:'manual', status:'approved' },
      ],
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
