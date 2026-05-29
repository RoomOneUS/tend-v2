/* Wire-up + demo controls */
(function () {
  function renderAll() {
    renderClinicianMobile();
    renderClinicianWeb();
    renderPatientMobile();
    if (window.lucide && lucide.createIcons) lucide.createIcons();
  }
  bus.on(renderAll);
  renderAll();

  // Demo scenarios via URL hash for screenshot verification — these all assume signed-in.
  const scenario = new URLSearchParams(location.search).get('scenario');
  if (scenario) { signInAll(); }
  if (scenario === 'patient-profile') { cwNav.screen = 'patient'; cmNav.screen = 'patient'; pmNav.tab = 'plan'; bus.emit(); }
  if (scenario === 'lock') { window.triggerJournalLockup(); cwNav.screen = 'patient'; cmNav.screen = 'patient'; bus.emit(); }
  if (scenario === 'builder') { cwNav.screen = 'goals'; pmNav.tab = 'plan'; cmNav.screen = 'patient'; bus.emit(); }
  if (scenario === 'assessment') { cwNav.screen = 'assessment'; pmNav.tab = 'applets'; pmNav.sub = 'journal-list'; cmNav.screen = 'integrations'; bus.emit(); }
  if (scenario === 'session') { cwNav.screen = 'session'; pmNav.tab = 'applets'; pmNav.sub = 'calendar'; cmNav.screen = 'aiScribe'; bus.emit(); }
  if (scenario === 'messaging') { cwNav.screen = 'messaging'; pmNav.tab = 'coach'; cmNav.screen = 'home'; bus.emit(); }
  if (scenario === 'coach') { pmNav.tab = 'coach'; pmNav.coachView = 'chat'; bus.emit(); }
  if (scenario === 'coach-overview') { pmNav.tab = 'coach'; pmNav.coachView = 'overview'; bus.emit(); }
  if (scenario === 'coach-typing') { pmNav.tab = 'coach'; pmNav.coachView = 'chat'; pmNav.coachDraft = 'Should I combine the 1:1 CBD-THC dose with the spine-breath protocol tonight, or stick with the breathwork plan if I can\'t sleep?'; bus.emit(); }

  // Demo bar buttons
  document.querySelectorAll('[data-demo]').forEach(b => b.onclick = () => {
    const k = b.dataset.demo;
    if (k === 'reset') { resetState(); notify('Demo state reset'); }
    if (k === 'sign-in-all') { signInAll(); notify('All surfaces signed in'); }
    if (k === 'sign-out-all') { signOutAll(); notify('All surfaces signed out'); }
    if (k === 'trigger-journal') triggerJournalLockup();
    if (k === 'trigger-journal-soft') {
      const body = "Some days I just feel hopeless about all of this. I can't go on like this much longer, but I'm trying to keep up with the plan.";
      const j = { id:uid('j'), date:'Today · '+ new Date().toTimeString().slice(0,5), title:'Hard day', body, summary: body.slice(0,80)+'…', flagged:true, safetyLevel:'flag', favorite:false };
      S.patientApp.journalEntries.unshift(j);
      triggerJournalSoftFlag(j, j.title);
      notify('Journal soft-flag fired · no lockup');
    }
    if (k === 'trigger-dysregulation') {
      const rxs = (S.goals.versions[S.goals.currentVersion] || {}).rxs || [];
      const rx = rxs.find(r => r.type === 'exercise' && /^Condition/i.test(r.trigger || ''));
      S.dysregulation = { at:'now', hr:104, rxId: rx ? rx.id : null, dismissed: false };
      const meta = rx ? `Sustained HR 104 across 4 readings · plan fallback prompted (${rx.title})` : 'Sustained HR 104 across 4 readings · no plan fallback · patient prompted for support';
      addActivity({ type:'urgent', t:'now', title:'Dysregulation detected', meta });
      notify('Dysregulation flow fired');
    }
    if (k === 'trigger-dysregulation-nofallback') {
      S.dysregulation = { at:'now', hr:104, rxId: null, dismissed: false };
      addActivity({ type:'urgent', t:'now', title:'Dysregulation detected', meta:'Sustained HR 104 across 4 readings · no plan fallback · patient prompted for support' });
      notify('Dysregulation (no-fallback) fired');
    }
    if (k === 'trigger-coach-flag') {
      const msg = 'I keep thinking about how easy it would be to just hurt myself when nothing helps';
      S.patientApp.coachMessages.push({ from:'sarah', text: msg });
      S.coachFlag = { text: msg, at:'now' };
      addActivity({ type:'urgent', t:'now', title:'Coach AI flagged Chen\'s message', meta:`"${msg.slice(0,90)}"` });
      pushToCm({ urgent:true, text:`Chen V — Coach AI flagged at-risk language. Tap to review.` });
      // coach safety reply
      setTimeout(() => {
        S.patientApp.coachMessages.push({ from:'coach', text:"I'm really glad you told me. I've let Shari Kaplan know. If you're in crisis right now, please call 988 or use the resources in the app." });
        bus.emit();
      }, 600);
      pmNav.tab = 'coach';
      bus.emit();
      notify('Coach AI flag fired · no lockup');
    }
    if (k === 'trigger-message') {
      S.messages.push({ id:uid('m'), from:'sarah', text:'Hey — quick check, is it ok to take the meds 30 minutes later than usual?', at:'now' });
      addActivity({ type:'message', t:'now', title:'Chen sent a message', meta:'"Hey — quick check, is it ok to take the meds 30 minutes later than usual?"' });
      pushToCm({ urgent:false, text:`New message from Chen V` });
      notify('Patient → Clinician message');
    }
  });
})();
