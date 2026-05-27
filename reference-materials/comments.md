# Notes on the interactive mockup

Some comments appear in more than one bucket where the change needs to land in multiple places.

---

## 1. Next steps for me

*(cross-surface / infra)*
- before publishing, put a rybbit/openreplay probe in
- host somewhere
- in the text for the coach we need to find a way to more clearly show that this is Delphi. can it actually be Delphi here already?

---

## 2. Changes to apply to the interactive mockup

### Clinician web
- the bar showing that the session is incomplete - the assessment is highlighted as incomplete and pending, but actually the note is the pending step. be consistent - either all pending are highlighted and marked pending, or just the NEXT step, not arbitrarily the assessment step.
- data side in assessment - sessions, shared data, messages - all aren’t interactable
- what does the “biopsycho… suggestions” blue button mean?
- consider moving the “suggested addition” - maybe to a bottom scorllable bar at the bottom showing all suggestions.
- no feedback when the assessment is saved, and no way to go back after completion (or move to next step)
- treatment plan builder - in the patient context, the data tabs aren’t interactable.
- maybe put the patient context consistently in one side, make it look the same. no need to duplicate.
- ADD prescription model, edit (from suggestion, in general) model.
- clicking the SK in the clinician web should lead to the profile, same as the seettings wheel
- upload session in the clincian web is broken: (1) from transcription leads to the note for the last session instead of to an upload screen where you can upload the transcript. (2) manual leads to the note for the last session and doesn’t open a new session. (3) the “from notes only” needs to lead to a note upload screen. the next step after that is to review the note in the template, then continue as usual.
- how does the clinician assign tags to patients? also filtering doesn’t work.
- journal entry is “flagged”, but clinician can’t see why!
- clicking the tend icon in the web should go to home.
- why do we have a non-functioning calendar icon in the clinician web? remove it.

### Clinician app (mobile)
- clinician mobile - activity counter should be synced with the web, but because we don’t show the actual acitivty there - when hovering above it or clicking it show a tooltip explaining activity can be seen in the web.

### Patient app
- Don’t like data sharing screen using regular emoji’s
- clicking the profile picture should lead to the “me” page.
- compliance doesn’t lead anywhere
- data sharing options don’t actually have an effect in the mockup (they should). if we disable sharing journal entries, a new journal entry should show “not shared”, and really shouldn’t show up in the web for the clinician.
- journal applet - remove entry, favorite entry
- plan is not viewable to the end, because the navbar hides some of the last card for a prescription. this is also true for exampole in the seetings app, where “privacy policy” isn’t shown. also happens in calendar. I guess it hppens all around - check where else and fix everywhere.
- remove the “notify me when ready” from the integrations.
- looks like conversations with the coach aren’t shared (other than the mock that is already there. I mean things that the user adds live when playing around in the mock)
- in the text for the coach we need to find a way to more clearly show that this is Delphi. can it actually be Delphi here already?
- the “incognito” writing is not clear. show an eye and “incognito off” - similar to how you show a crossed out eye and “incognito on” when it is toggled on.
- dysregulation flow - other than notifying the clinician, nothing is shown to the patient, which is the more important part…

### Cross-surface
- there needs to be a global back button that moves you one step back
- scrolling should be within the components, not in the overall platform
- back button should always lead back to the previous page.
- change the name to chen and shari.
- what is the actual logic for triggering the esclations/dysregulation/flag? both the coach and the journal can lead to either a flag or an esclation (either with or without a complete lock). we need a way to trigger any of these.

---

## 3. Changes to apply to the static mockup (pencil)

### Clinician web
- the bar showing that the session is incomplete - the assessment is highlighted as incomplete and pending, but actually the note is the pending step. be consistent - either all pending are highlighted and marked pending, or just the NEXT step, not arbitrarily the assessment step.
- consider moving the “suggested addition” - maybe to a bottom scorllable bar at the bottom showing all suggestions.
- maybe put the patient context consistently in one side, make it look the same. no need to duplicate.
- ADD prescription model, edit (from suggestion, in general) model.
- journal entry is “flagged”, but clinician can’t see why!
- why do we have a non-functioning calendar icon in the clinician web? remove it.

### Patient app
- Don’t like data sharing screen using regular emoji’s
- journal applet - remove entry, favorite entry
- plan is not viewable to the end, because the navbar hides some of the last card for a prescription. this is also true for exampole in the seetings app, where “privacy policy” isn’t shown. also happens in calendar. I guess it hppens all around - check where else and fix everywhere.
- remove the “notify me when ready” from the integrations.
- in the text for the coach we need to find a way to more clearly show that this is Delphi. can it actually be Delphi here already?
- the “incognito” writing is not clear. show an eye and “incognito off” - similar to how you show a crossed out eye and “incognito on” when it is toggled on.

### Cross-surface
- change the name to chen and shari.

---

## 4. Things to change in the poc-plan document

### Clinician web
- what does the “biopsycho… suggestions” blue button mean?
- consider moving the “suggested addition” - maybe to a bottom scorllable bar at the bottom showing all suggestions.
- maybe put the patient context consistently in one side, make it look the same. no need to duplicate.
- ADD prescription model, edit (from suggestion, in general) model.
- upload session in the clincian web is broken: (1) from transcription leads to the note for the last session instead of to an upload screen where you can upload the transcript. (2) manual leads to the note for the last session and doesn’t open a new session. (3) the “from notes only” needs to lead to a note upload screen. the next step after that is to review the note in the template, then continue as usual.
- how does the clinician assign tags to patients? also filtering doesn’t work.
- journal entry is “flagged”, but clinician can’t see why!

### Clinician app (mobile)
- clinician mobile - activity counter should be synced with the web, but because we don’t show the actual acitivty there - when hovering above it or clicking it show a tooltip explaining activity can be seen in the web.

### Patient app
- clicking the profile picture should lead to the “me” page.
- data sharing options don’t actually have an effect in the mockup (they should). if we disable sharing journal entries, a new journal entry should show “not shared”, and really shouldn’t show up in the web for the clinician.
- journal applet - remove entry, favorite entry
- dysregulation flow - other than notifying the clinician, nothing is shown to the patient, which is the more important part…

### Cross-surface
- there needs to be a global back button that moves you one step back
- back button should always lead back to the previous page.
- change the name to chen and shari.
- what is the actual logic for triggering the esclations/dysregulation/flag? both the coach and the journal can lead to either a flag or an esclation (either with or without a complete lock). we need a way to trigger any of these.
