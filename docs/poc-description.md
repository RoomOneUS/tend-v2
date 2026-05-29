# MVP Description

## Target Audience

The MVP, same as the final product, is built for both clinicians and patients.

## Background: The Clinical Workflow

In the first couple of sessions, a "biopsychosocial assessment" is conducted to understand the patient. During this process, the clinician asks questions to build a comprehensive integrative understanding of the patient. These include neurological, physical, medical, developmental, psychological, familial, relational, Social, strengths and resiliency, deficits, lifestyle, sleep, and nutrition.

The data (it can be plain text, images, documents, audio, video) is collected and indexed, to later be used. All throughout the therapy such arbitrary context about the patient can be added, edited, or removed.

Once completed, the clinician writes an assessment, and from that creates the "whole life plan" - a comprehensive "treatment plan" that gives us the "what" of treatemnt - what are we trying to change or fix?

then the routine of threapy is that in each session, "Goals" are set. A goal is an actual actionable prescription

so a session generally is the raw data + the notes + data points (new).
ssessment, treatment plan, goals are seperate from the session, however each session has a reference to the assessment, treatment plan  and goals that were active at that point in time.


## Summary

### MVP Features

| feature | surface(s) | MVP Functionality | MVP caveats |
|---------|------------|-------------------|---------|
| User Authentication | clinician web, clinician mobile, patient mobile | Log in with credentials or with google/apple account. |  |
| Clinician Onboarding | Seperate website for the platform (TBD) | Sign up and setup clinician account. | |
| Add/Edit a Patient | Clinician web | Clinicians can add new patients to the platform and edit patient details (like emergency number, email address) | |
| tags and filters | clinician web, clinician mobile (read-only) | clinicians can tag patients and filter by tags. | |
| Activity Alerts and Notifications | Clinician web, Clinician mbile | show alerts for new activity, some also trigger a push notification (mobile only) | no web notifications in MVP|
| Add Sessions | Clinician mobile, Clinician web | Clinicians can add sessions they had with patients. Sessions bundle the raw data (transcription, recording), the session notes, and the data points, and reference what version of the assessment, treatment plan and goals were active at that point in time. | Only session transcriptions are uploaded to the session |
| Automatically convert transcription to session notes | clinician web | Uploaded transcriptions are converted into predefined note templates. | |
| Compliance mesasurment | Clinician web, clincian mobile, Patient mobile (toggleable by clinician) | Clinicians and optionally patients (togglebale by the clinician) are able to track compliance with the goals in a visual way akin to stock market charts (gamification) | Only the final score is shown in the MVP, not the way it was calculated. |
| Structured Goal building w/ suggestion engine | Clinician web | Clinicians can write the goals in a structured way, and get suggestions based on the notes, assessment, and all historic patient data that is in the system | MVP only support a closed-set of predefined "prescription types" (e.g. "Sleep Schedule", see below) |
| Structured "Whole Life Plan" (treatment plan) building w/ suggestion engine | Clinician web | Clinicians can create the comprehensive treatment plan - a collection of objectives per category. | | 
| BIOPsychoSocial Data Points | Clinician web | The platform keeps typed and timestamped containers of arbitrary data (plain text, documents, images, audio, video) representing the context on a patient (answers to biopsychosocial prompts). They are editable and removable, and automatically extracted from notes, or manually added. Used in the biopsychosocial data collection process. | MVP has only text containers |
| Direct Messaging | Clinician web, patient mobile |  | Clinicians can only send messages and see proper message history in the web app. Messaging is limited to simple text only. |
| Session Note Management | Clinician web | Clinician can view and edit session notes. Notes are automatically filled-in based on the session transcription (if available) | only a "default" template is supported.|
| Assessment Management w/ suggestion engine | Clinician web | Clinician can view and edit assessments, and get suggestions based on notes and patient's historic data. | |
| Data retention and versioning | Clinician web | Patient data shared with the clincian, Session Notes and Direct Messages are retained. Treatment Plans, Assessments, and Goals are retained and also versioned - with past versions accessible thorugh the web app | |
| Esclation Flows | Patient mobile, Clinician web, Clinician mobile | Patient mobile will esclate events in three tiers based on data that is collected: (1) "Hard escalations" - Emergency situations that also lock the patient out of the app until manually unlocked. (2) "Soft esclations" - things the clinician should be alerted of, but aren't necessarily urgent. (3) "User-only esclations" - for situations that require user action and clinician followup (optionally), but not clinician intervention (e.g. a dysregulation was detected) | |
| goal-aware patient support in stress-events | patient mobile | Detection is based on the data available to the app, including biofeedback (if wearable integration available). Suport is grounded in the clinician-prescribed goals or general definitions hard-coded in the app. | |
| Integrations | patient mobile | Integrate with external hardware (i.e. wearbales) and 3rd party applications/services | Only a closed set of applications/services/devices will be support for integration in the MVP - and those will be for biofeedback collection only (i.e. no journaling app or calendar integration in the MVP)|
|Patient "Daily Digest"/"Daily Chcklist" | patient mobile | A "daily checklist" based on clinician prescribed goals. Intended to boost compliance | |
| Applets | Patient Mobile | Applets are small apps that live within the application and are esentailly tools for patient use - designed to support the treatment, and help patients stay compliant with it. | |
| Journal Applet | Patient Mobile | A journaling applet that is aware of the goals. | |
| Calendar Applet | Patient Mobile | A calendar applet that is aware of the goals and so can display in a calendar view all the activities (sessions, check-ins, etc.) | |
| AI Coach | Patient Mobile | An AI assistent that is aware of the treatment plan, goals, and patient data, and so can provide true grounded support for the patient. | MVP implementation uses Delphi behind the scenes, this means privacy features won't necessarily apply to Delphi (they share all conversations with the clinician), and it might not be possible to scan this content for esclation triggers (TBD) |
| Granular Data Sharing Controls | Patient Mobile | the patient can choose which data points he is willing to share with the clinician. Everythign is opt-out. | If we use Delphi for the AI Coach, conversations are still shared with the clinician. |
| Dysregulation Support | Patient Mobile | upon detection of a dysregulation, theapplication will perform a user-only escalation flow and show either a notification, or an in-app modal with suggestions on how to handle the dysregulation, ideally based on the goals of the patient. |

### NOT IN MVP, BUT ON FUTURE ROADMAP:

| features | surfaces | target functionality |
| -------- | -------- | -------------------- |
| Uploading raw meeting recordings (audio/video) | clinician mobile, Clinician web | |
| Integrations | clinician mobile app | AI Scribe Integration for pulling notes, transcriptions|
| Integrations| clinician web | VC (Zoom, Google Meet) for automated session captures, EMR Integration |
| Web Notifications | Clinician web | Browser notifications for select alerts (similar to mobile push notifications through Clinician Mobile)|
| Import past sessions or historical data for new Patients | Clinician web | |
| Live in-session clinician aid)| clinician mobile | Suggest questions to ask to aid the clinician in performing the biopsychosocial assessment properly |
| Structure Arbitrary "Prescription Types" | | Clinicians will be able to define their own prescription types on-the-fly |
| EMR Data Export (via Integration and Manual) | Clinician web | |
| Integrations | Patient Mobile | Comprehensive 3rd Party application/service/device integrations to allow users to use the platform in combination with any app/service/device they already use, and to save us the cost of building them ourselves. |
| "Build Your Own Applet" | Patient Mobile, Clinician Web | the ability to build custom applets (for example, a finance tracker) |
| "Appluase" ("good-job" notifications) | Patient Mobile | The app will send encouraging notifications when a patient meets a goal. |
| Freeform text -> Goals Translation | Clinician Web | allow the clinician to write patient goals in natural language, and the app will generate the structured prescriptions, so clinicians don't need to fiddle with the prescription. |

### OUT OF SCOPE FOR PRODUCT:

| features | surfaces | target functionality |
| -------- | -------- | -------------------- |
| Session prep| clinician mobile, clinician web | help clinicians prepare for sessions |
| Session Scheduling and Billing | clinician mobile, clinician web, patient mobile | |

### CONSIDER:
- Moving the suggestion engines for later.
- Move EMR Integration to the MVP.

### TBD (not defined in this document)
- What exact integrations we need in the patient mobile for the MVP.
- Delphi integration.
- Implementation of the biopsychosocial engine.
- How to mesaure compliance, and the algorithm to calculate the final score.


# Appendix A: Feature Deep Dive

## General

### Navigation

Navigation consists of the back button, the home button, and the navigation bars. Each surface has a different impplementation of each. for example, the back button in the mobile app is part of the app, but in the web app it is part of the browser.

As a general rule, the back button behavior is to always go back to the previous screen.

the home button in the web browser is the platform's logo.

## Clinician Mobile App

### Onboarding (Login)
Clinicians are able to login to the mobile app with the credentials they signed-up with on the platform website, or with their google/apple account. A valid account is: (1) validated (correct credentials) (2) has completed the onboarding flow in the web app.

![Clinician Mobile — Login](./images/clinician-mobile-login.png)
![Clinician Mobile — Login (error)](./images/clinician-mobile-login-error.png)

### Home / Patient list
Opens to a global home screen showing all patients as a WhatsApp-style list (name + notification counter only).
Tap a patient to open their profile screen.
A settings icon in the header opens settings.

![Clinician Mobile — Patient List](./images/clinician-mobile-patient-list.png)

### Settings
Profile picture and basic information about the clinician.
A list of options. For the MVP: only **Integrations**.

![Clinician Mobile — Settings](./images/clinician-mobile-settings.png)

### Integrations
Shows every connected app/tool. For the MVP: **AI Scribe**, status = connected.
Tap AI Scribe to open a demo page that explicitly lists the data the integration will surface in the future: **transcription, notes, raw recording**.

![Clinician Mobile — Integrations](./images/clinician-mobile-integrations.png)
![Clinician Mobile — AI Scribe demo](./images/clinician-mobile-ai-scribe-demo.png)

### Patient profile

profile view has two main "sub-views": sessions, and alerts.

for the sessions view:
Single primary action: **upload a new session** via the integration.
Tap the integration to open a prompt to paste a transcription (MVP mock; in production the integration does the capture - app pulls from the scribe app).
Upload posts to the web app. Success/failure feedback is shown. Nothing else happens in the mobile app.
A **Recent sessions** list shows the sessions you've uploaded for this patient (read-only).

![Clinician Mobile — Patient Profile](./images/clinician-mobile-patient-profile.png)
![Clinician Mobile — Paste transcription](./images/clinician-mobile-paste-transcription.png)
![Clinician Mobile — Upload success](./images/clinician-mobile-upload-success.png)
![Clinician Mobile — Upload failure](./images/clinician-mobile-upload-failure.png)

for the alerts view:
The clinician can see alerts about the patient directly in the patient profile screen.
the only alerts shown in the MVP are for escalations - soft+hard+user-only (dysregulation, for example) - see definitions below, and if a new message is received. you can't enter the messaging interface, but you can see the activity just like in the activity feed on the web.

alerts are synced with the web, so if an alert was acknowledged (See note below about "alert acknowledgment") on the web or on mobile, it will also be marked acknowledged on the other device.

note that if there is a hard esclation flow in progress (meaning the patient app is locked) you will see it at the top of the view, no matter if you are in the alerts view or the sessions view.

![Clinician Mobile — Patient Profile (Alerts)](./images/clinician-mobile-patient-profile-alerts.png)
![Clinician Mobile — Patient Profile (App locked)](./images/clinician-mobile-patient-profile-app-locked.png)
![Clinician Mobile — Patient profile (locked + unlock)](./images/clinician-mobile-patient-profile-locked-unlock.png)

### Push notifications
Triggers for the MVP:

Everytime a new alert comes in, the clinician will receive a push notification. this means clinicians get a push for:
A DM from a patient.
An Esclations (soft+hard+user-only).

![Clinician Mobile — Urgent push (journal escalation)](./images/clinician-mobile-urgent-push-journal.png)


## Clinician Web App

### Recurring Components
#### Data Browser/Display Componenet

used in the patient profile (labeled "activity"), the goal builder and treatment plan builder (labeled "patient context"), and the assessment builder (labeled "data side").

this is browseable data surface showing 4 tabs: All / Sessions (default) / Shared data / Messages.

doubles as the notification history log (with an unread counter). Event types: sessions, messages, urgent notifications, data shared, Coach AI activity.
Filterable by event type.
Default sort: chronological.
Tap an event to open a detail view (session detail for sessions, messaging UI for messages, etc.).

"All" tab and "Shared Data" tab have a toggle for "list/timeline" view.

NOTE:
**Coach AI activity is rolled up, not per-message.** Surfacing every patient <> Coach AI message would flood the feed. Instead, an event is emitted when (a) the patient starts a **new conversation** with Coach AI, or (b) activity resumes in an **existing conversation** after a quiet gap (i.e. enough time has passed since the last message that it reads as a fresh interaction rather than a continuation). Tapping the event opens the conversation. (Incognito chats are excluded — see Coach AI.)

Shared data features any data the user shares from the app. That is all data available to the app (incuding coach ai activity) minus the data the user chose not to allow sharing. 
It also includes the "biopsychosocial data points" (they are marked with a "BPS" pill)

clicking on a bps data point will open a read view modal.
only approved data points are show in the read view modal.

![Clinician Web — Data point read view](./images/clinician-web-data-point-read-view.png)

### Login

Clinicians are able to login to the web app with the credentials they signed-up with on the platform website, or with their google/apple account. A valid account is: (1) validated (correct credentials) (2) has completed the onboarding flow in the website.

![Clinician Web — Login](./images/clinician-web-login.png)
![Clinician Web — Login (onboarding incomplete)](./images/clinician-web-login-onboarding-incomplete.png)

### Patient Onboarding Screen

Clinician enters:
Sex
Email, Phone
Preferred Communication Methods (multiselect from predefined set: SMS, Whatsapp, Phone, Email, in-app)
Emergency contact
Name (not optional), age (optional)
Tags

The flow is a 3-step wizard (Basic info → Past sessions → Confirmation), ending with a success state.

![Clinician Web — Add Patient (1/3 Basic info)](./images/clinician-web-add-patient-1-3-basic-info.png)
![Clinician Web — Add Patient (2/3 Past sessions)](./images/clinician-web-add-patient-2-3-past-sessions.png)
![Clinician Web — Add Patient (3/3 Confirmation)](./images/clinician-web-add-patient-3-3-confirmation.png)
![Clinician Web — Add Patient (success)](./images/clinician-web-add-patient-success.png)

### Patient selection (home)
List of patients with an event counter per row (unread messages, data-shared notifications, urgent flags, etc.).

there is a button to "add a patient" which leads to the patient onboarding screen.

If a patient has been added, but they have not yet signed up - they still show up in the list, but grayed out and with a "pending" tag. they are still clickable, but clicking only shows the patient edit modal.

Patients can be assigned custom tags.
Search and filter by tags, names, etc.
Tap a patient to open the profile page.
Settings entry point in the header.

![Clinician Web — Patient list](./images/clinician-web-patient-list.png)
![Clinician Web — Manage tags (modal)](./images/clinician-web-manage-tags-modal.png)

### Settings
Profile and basic info.
Options list. MVP: only **Integrations**.

![Clinician Web — Settings](./images/clinician-web-settings.png)

### Integrations
For the MVP: **Google Meet** and **Zoom**, both shown as connected.
Tap either to open a demo page describing the data the integration will surface: **raw recordings only**.

Also, EMR integration. Shown as connected (just so that we can show the full "export to EMR" menu), not really connected in the MVP.

![Clinician Web — Integrations](./images/clinician-web-integrations.png)
![Clinician Web — Integration demo](./images/clinician-web-integration-demo.png)

### Patient profile
Header: patient info (with an edit button - clicking leads to "patient editing" modal), **compliance score**. Tapping opens the compliance & progress view.

Quick Action buttons:
Create / modify treatment plan (the whole life plan, not the goals))
Create / modify goals
Upload new session
Send a message
add data point (opens the modal)

Page is split into two:

left side:

Show a tab selector with "assessment", "treatment plan", "goals".
for each tab, show the relevant data + an action button for opening the editor.

right side:

**Recent activity feed**: the Data Display Componenet.
doubles as the notification history log (with an unread counter).

![Clinician Web — Patient Profile (default / source view)](./images/clinician-web-patient-profile.png)
![Clinician Web — Patient Profile Activity (variations)](./images/clinician-web-patient-profile-activity-variations.png)


### Patient editing modal
edit all patient details, including the ability to toggle the patient's compliance score visibility (on/off). The toggle will be OFF by default. 

![Clinician Web — Patient editing modal](./images/clinician-web-patient-editing-modal.png)

### Messaging
Standard direct-message interface between clinician and patient.
MVP: text only, no rich content.

![Clinician Web — Messaging](./images/clinician-web-messaging.png)

### Session upload
Each option creates a **new session** and routes into the note editor (template auto-fills from any provided raw input).
**From recording** — MVP stub. Production: starting a Google Meet / Zoom call auto-pushes the recording.
**From transcription** — opens a paste/upload screen for the transcript → creates the session → note editor.
**Manually** — creates an empty session immediately → blank note editor.
(small) **From notes only** — opens a paste/upload screen for an existing note → creates the session with that note → note editor for review in the template.

**Session lifecycle (four stages)**
Every session moves through:
Raw data uploaded
Note
New Data points from session.

And the assessment, treatment plan, and goals that are currently active for the patient (most recent), are linked as a reference to the session.

Opening a session lands on the session summary screen. Incomplete stages are surfaced there; tapping one opens the relevant editor. Behavior is identical whether the raw upload came from mobile or web.

![Clinician Web — Session upload](./images/clinician-web-session-upload.png)
![Clinician Web — Upload session (From transcription)](./images/clinician-web-upload-session-from-transcription.png)
![Clinician Web — Upload session (From notes only)](./images/clinician-web-upload-session-from-notes-only.png)

### Note screen
Template selector at the top. Default template: `default`. (MVP: selectbox UI exists but only one template, no creation flow.)
Template renders a structured set of fields.

The page is a split view betwen the note (on the left) and the raw transcript of the session on the right.

`default` template fields: session date, session summary,  **Subjective**, **Objective**, Assessment and Plan (One Field)
Fields auto-fill from the raw transcription.
**Next** goes to the session summary, and directly opens the data points modal for adding new data points and approving extracted ones.

![Clinician Web — Note screen](./images/clinician-web-note-screen.png)

### Extracted Data Points Modal

This modal is opened directly from the note screen, and allows the clinician to approve auto-suggested data points extracted from the notes, and add new data points.

User can deny, approve, or edit each suggested data point. 

only data points that are a hit for the biopsychosocial framework are extracted and shown.

the extraction attempts to find the prompt, the answer, and a "reference date" timestamp (that is - the time that the answer refers to)
the date the data point was collected is also metadata set by the extractor.

the modal contains a button at the bottom for adding data points manually.
You can also access this modal from the session summary screen directly.

![Clinician Web — Extracted Data Points modal](./images/clinician-web-extracted-data-points-modal.png)

### Adding Data Points Modal

Clinician can add data points (biopsychosocial context about the patient). In the MVP these are limited to text.
You can access this modal directly through any session summary page, and 
This modal is also accessible directly from the patient profile (see details below for exact placement)
A data point consists of a prompt (the biopsychosocial question that was prompted to the patient), an answer, and a "reference date" timestamp - the time the answer refers to.

![Clinician Web — Add Data Point modal](./images/clinician-web-add-data-point-modal.png)

Editing a data point opens the same form pre-filled. The prompt, answer, and reference date are editable; the auto-captured "collected" metadata (date + source session) is shown read-only. Cancel/close returns to wherever the edit was launched from (the read view, or the extracted/review modal), without saving.

![Clinician Web — Edit Data Point modal](./images/clinician-web-edit-data-point-modal.png)


### Assessment screen
Purpose (see Assumptions): the clinician diagnoses, captures advanced notes (e.g. what to track / ask about next session), and receives suggestions based on Shari's biopsychosocial framework.

Two-pane layout: notes ("patient context" — read only) on one side, unstructured free-text box on the other.
Clinician can browse previous notes, plans, assessments, and shared data while writing. The interface for this is a tab strip at top — Sessions (default) / Shared data / Activity / Messages. It is read only.
This is the same data display component as the goal builder's "patient context" panel, and the activity panel in the patient profile.

The assessment is **cumulative**, not per-session (see Assumptions). The most recent version is therefore visible.

**Versioning.** Assessments are versioned — every time the clinician edits and saves, a new version is created. Assessments are **clinician-facing only**; the patient never sees them.
Opening the assessment from the patient profile always lands on the **current (latest) version**.
A version selector lets the clinician navigate back to any previous version (for audit, comparison, or recovering a deleted passage).
When viewing an older version, the screen is clearly marked (e.g. banner: "Viewing an older version from <date>. This is no longer the current assessment.") with a one-tap shortcut back to the current version.
Opening the assessment from a session (see the session summary) deep-links to the specific version that was active at that session — so the clinician sees what they knew at the time of that session, not what they know now.
The current assessment is a single living document, not a branching history; versions exist for traceability, not for parallel work.

**Save behavior.** After saving, the clinician is returned to wherever they entered the assessment from.

See open questions on assessment below.

![Clinician Web — Assessment (current version)](./images/clinician-web-assessment.png)
![Clinician Web — Assessment (older version, with banner)](./images/clinician-web-assessment-older-version.png)

### Goals screen + builder
The goals are a collection of **prescriptions**. The clinician builds them by choosing prescriptions from a **closed set of prescription types** and filling in their parameters.

Prescription types in the MVP:
Sleep schedule (target bedtime, minimum duration, fallback rule if can't fall asleep within X, etc.)
Medication
Journaling (e.g. "3 things you're grateful for daily")
Exercise (e.g. breathwork, somatic exercises)

Each prescription is made of:
The action to perform (shape depends on type — sleep schedule looks different from a journaling exercise).
**Trigger** — when the action should happen. Every prescription has one. Two kinds:
**Time-based:** daily, weekly, "every night at 22:00", "3× per week", etc.
**Situation-based:** fires in response to a condition, e.g. "when stress is high", "after a bad night's sleep", "if HR spikes above X".
Instructions, rules, limitations.
The rest (structure, primary CTA, collection, and compliance calculation algorithm) is determined by the prescription type, with no manual input from the clinician.

Page layout — two panes:
**Right: data side — "patient context"** — top part shows the treatment plan (the whole life plan), bottom part is the data browser component.
**Left: prescriptions side** — the goals being defined. Clinician adds prescriptions by picking a type and filling in parameters.

**Suggestion engine:** based on Shari's biopsychosocial framework, the right pane surfaces suggested prescriptions with the parameters pre-filled from the data on the left. The clinician can accept, edit, or dismiss.

**editing** is also possible by clicking the dedicated edit button on each prescription, or the "edit" button in the suggestion card.

![Clinician Web — Goals builder](./images/clinician-web-treatment-plan-builder.png)
![Clinician Web — Add prescription (pick type)](./images/clinician-web-add-prescription-pick-type.png)
![Clinician Web — Add prescription (Sleep selected)](./images/clinician-web-add-prescription-sleep-selected.png)
![Clinician Web — Edit prescription (Sleep)](./images/clinician-web-edit-prescription-sleep.png)


### Treatment Plan (Whole Life Plan) builder
The treatment plan is a collection of freetext objectives split into 14 predefined categories (see appendix below)

Page layout — two panes:
**Right: data side — "patient context"** — top part shows the most recent version of the assessment, bottom part has the same browseable data surface as on the assessment screen (Sessions (default) / Shared data / Activity / Messages). Here too it is read-only.
**Left: prescriptions side** — the treatment plan being defined. It is made of pages, you can flip horizontally between them - left and right (with a page indicator at bottom), each with 4 categories. each category is a free text box where the clinician can write the treatment plan objective for that category.

**suggestion engine** simillar to the goal builder.

![Clinician Web — Whole Life Plan builder](./images/clinician-web-whole-life-plan-builder.png)

### Compliance & progress view
Patient's compliance score over time.
MVP shows the final score only.

Clinician can toggle whether the patient sees their own compliance & progress (per-patient setting). Default: hidden.

(future: drill into the calculation when underlying data is shared — see Future / Post-MVP)

![Clinician Web — Compliance & progress](./images/clinician-web-compliance-and-progress.png)

### Session summary
Opens when you click a session.
Shows a stages card: green = complete, white = open, orange = next up (according to the flow: raw → note). Data points appears in the stages card too, but as a neutral (non-gating) chip — it's not a required stage, so it's never marked orange/next-up. The session counts as complete once raw + note are done; the stages card stays visible so the optional data points review is always reachable.

data points are always shown in sessions, but they aren’t a required stage. so they aren't highlighted even if there are pending data points for review. Only approved data points are listed in the session's data points card; pending ones are reviewed via the review modal.

Tapping an incomplete stage jumps into that editor (or for the data points, opens the data points approval modal).
Default view: notes + treatment plan + goals on the left, raw data (transcript + audio if available) + data points related to this session (approved or manually added, and show a pill here to go to the data points approval modal if there are pending data points. clicking it will open the modal where you can approve data points that were extracted from the notes this session. also show a button here to manually add data points - this will open the add data point modal, even though the approval modal also has the "add manually" button) + assessment on the right. The raw data isn't directly shown, but clicking on them opens/downloads.
Timeline strip at the bottom for jumping between sessions, plus **Next / Previous session** buttons. Pressing **Next** on the most recent session opens the upload screen.

![Clinician Web — Session summary (data points pending · approved + pending)](./images/clinician-web-session-summary-data-points-next-up.png)
![Clinician Web — Session summary (all stages complete · Export to EMR)](./images/clinician-web-session-summary-all-complete.png)

There is a button to export to EMR. it opens a menu with two options: 1. export plain text (for the clinician to copy and paste into an EMR) 2. send to EMR (via the integration, if it is connected.). buttons are shown but not clickable, as EMR integration is not implemented in the MVP.

## Patient Mobile App

### Onboarding (Register)
Patients can either register in the mobile app, or in the platform website (similar to how clinicians register).

Registeration flow consists of: (1) email, (2) password. 
Patient can login/register with google/apple that is linked to the email.

![Patient Mobile — Welcome](./images/patient-mobile-welcome.png)
![Patient Mobile — Register](./images/patient-mobile-register.png)

### Onboarding (Login)
Patient are able to login to the mobile app with their email and password, or with their google/apple account. A valid account is: (1) validated (correct credentials) (2) is assigned to a clinician, and the clinician has completed the patient onboarding.

If the patient signed up but their clinician hasn't yet completed onboarding for them, the app shows a waiting state instead of the main app.

![Patient Mobile — Login](./images/patient-mobile-login.png)
![Patient Mobile — Login (error)](./images/patient-mobile-login-error.png)
![Patient Mobile — Waiting for clinician](./images/patient-mobile-waiting-for-clinician.png)

### General
The app supports escalation and safety protocols. In certain situations, the app will become locked and the user will need to contact their clinician to unlock it. In this case the app will display a screen with a message explaining the situation.
Certain escalation and safety flows have a different lock screen. For example — the "self-harm" screen will display three numbers: the local helpline, the clinician, and a family member.

The app uses a bottom tab bar with five tabs: **Today** (default landing), **Plan** (goals), **Applets**, **Coach**, **Me**.

### Today (home)
The default entry point of the patient app. Answers two questions at a glance: *how am I doing?* and *what do I need to do today?*

The user is greeted with an appropriate time-of-day message. They can see their compliance score for the day (only if the clinician has enabled it).

Below, there is a todo-list of the things that the user needs to do **today**, based on the Goals.

![Patient Mobile — Today](./images/patient-mobile-today.png)

### Profile view
The user sees their profile picture, and is greeted with a welcoming message. The name of the clinician is also presented. There is a settings section with "integrations", "data sharing", and notifications settings. There's also a legal information section with "terms of service" and "privacy policy".

Before these two sections, the user is presented with the core information about him as a patient — current treatment plan (clickable, leads to the treatement plan view (whole life plan)), current compliance score (clickable, leads to the compliance and progress view - only if the clinician has enabled compliance score visibility for the patient), number of sessions (not clickable, just a number).

(future: patient-facing session history — see Future / Post-MVP)

![Patient Mobile — Profile](./images/patient-mobile-profile.png)

### Privacy Policy

Add this text. It highlights: (1) We are HIPAA compliant (2) Our staff is thoroughly vetted

"Protecting the confidentiality of your health information is central to how the platform is built and operated. We are committed to handling all personal and protected health information in a manner consistent with the standards established under the U.S. Health Insurance Portability and Accountability Act of 1996 (HIPAA), and we are actively working toward full HIPAA compliance across our systems, processes, and third-party integrations.

Access to patient data is strictly limited to authorized personnel on a need-to-know basis, but rest assured - every individual involved in the development, operation, or maintenance of the platform is required to complete a thorough vetting process, including successful completion of a Level 2 background screening. All such personnel are bound by confidentiality obligations and receive regular training and briefings that reinforce the critical importance of safeguarding patient information."

![Patient Mobile — Privacy Policy](./images/patient-mobile-privacy-policy.png)

### Treatment Plan (Whole life plan) view

A card for each category, populated with the relevant objective as defined by the clinician. scrollable to see all cards.

![Patient Mobile — Whole Life Plan view](./images/patient-mobile-whole-life-plan.png)

### Settings: Integrations
Many more integrations than the clinician sees: wearables, health trackers, calendars, journals, etc.

Interactive Mockup behavior:
Most integrations are **not actually connected**.
Those that support manual input (e.g. Apple Watch for bio-feedback) appear as connected and open a manual-entry UI.

Apple Watch data captured manually:
Sleep (bedtime, wake time, sleep latency, time in bed, awakenings, overall quality)
Heart rate
Blood pressure
Body temperature
Respiration
Activity (steps only for MVP)

Manually entered data **propagates** through the system. E.g. logging bedtime of 23:00 against a "be asleep by 22:00" prescription dings compliance.
This is the lever for triggering flows in the demo (dysregulation via repeated high HR readings, escalations, etc.).
**Calendar integrations:** **Google Calendar** and **Apple Calendar** appear as placeholder integrations. Tapping either opens a demo page describing the future behavior: the [calendar applet](#calendar-applet) will push the patient's scheduled prescription events to the integrated calendar. Not actually wired in the MVP.

![Patient Mobile — Integrations](./images/patient-mobile-integrations.png)
![Patient Mobile — Apple Watch manual entry](./images/patient-mobile-apple-watch-manual.png)
![Patient Mobile — Calendar integration demo](./images/patient-mobile-calendar-integration-demo.png)

### Applets
Entered from the main screen.
User picks an applet, or enters **build mode** to create their own (radical-customizability concept).

![Patient Mobile — Applets home](./images/patient-mobile-applets-home.png)

#### Build mode
MVP: "coming soon" state.
Shows the concept explanation + a free-text box where the patient describes an applet idea. Submissions come to us — lets us collect feedback while the feature is unbuilt.

![Patient Mobile — Build mode](./images/patient-mobile-build-mode.png)

#### Journal applet
List of entries sorted by date. Each entry: date, time, short summary.
Entry view: title field + plain-text body.
On entering the applet, the patient sees a reminder block for any journaling exercise prescribed but not yet completed today (e.g. "3 things you are grateful for"). Tap the block to open a new entry with the title pre-filled.
Patient writes a journal entry expressing suicidal ideation; the system detects it and the escalation flow fires.

actions the users can perform are: 
- add a new journal entry
- edit an existing journal entry
- delete an existing journal entry
- favorite a journel entry

there is a trash bin where deleted entries are stored for 7 days. user can restore them. there is also a "favorites" view.

![Patient Mobile — Journal list (tabs + favorites)](./images/patient-mobile-journal-list-tabs-favorites.png)
![Patient Mobile — Journal entry (inline edit)](./images/patient-mobile-journal-entry-inline-edit.png)
![Patient Mobile — Journal entry (flagged content)](./images/patient-mobile-journal-entry-flagged-content.png)
![Patient Mobile — Journal trash](./images/patient-mobile-journal-trash.png)

#### Calendar applet
Read-only for the MVP. (future: patient-side edit — see Future / Post-MVP)
Small scheduling view derived directly from the **current Goals**.

Two views: **daily** and **weekly**.

**Daily view** has two sub-views:
**Agenda** (default) — a chronological list of today's scheduled actions and reminders, each as a row with title, time, and any reminder/notification the patient will receive. Optimized for "what do I do next?" — quick to scan top to bottom.
**Schedule** — a time-grid (hour-by-hour vertical timeline) of the same actions laid out against the clock, so the patient can see gaps, overlaps, and how items sit relative to each other across the day.
The two sub-views are toggled via a small segmented control; both render the same underlying entries.

**Weekly view** — a grid of scheduled actions across the seven days of the week.

Each entry corresponds to a time-based trigger on a prescription (e.g. "Be asleep by 22:00", "Take medication 08:00", "Journal — gratitude") and shows any reminder/notification the patient will receive for it.

**Notifications are actually pushed** in the MVP — when an entry's reminder time arrives, the patient receives a real push notification on their device.

(future: push the schedule itself to the patient's integrated external calendar — Google Calendar / Apple Calendar — see Future / Post-MVP)

![Patient Mobile — Calendar applet (daily, agenda)](./images/patient-mobile-calendar-applet.png)
![Patient Mobile — Calendar applet (daily, calendar view)](./images/patient-mobile-calendar-applet-daily-calendar-view.png)
![Patient Mobile — Calendar applet (weekly)](./images/patient-mobile-calendar-applet-weekly.png)

### Coach AI
Opens an embedded Delphi site, wrapped with our own UI (that contains things like the "incognito chat" button).

MVP implements an **input proxy**:
On session start, send Delphi a digest of who the patient is, their assessment, treatment plan, and goals.

Every patient message is also reviewed automatically by the platform (not a human). Problematic statements trigger the escalation flow.

Patient can:
Ask questions grounded in their treatment plan or in their goals (instructions, rationale, how-to).
Ask general questions.
Choose **incognito chat** — that conversation is not shared, regardless of global sharing settings.

**Caveat:** because this is Delphi, the clinician can read everything (that's how Delphi works). The sharing flow is still implemented for demo completeness, but "don't share" is effectively meaningless in the MVP.

(future: extract data points from conversation into compliance inputs — see Future / Post-MVP)

![Patient Mobile — Coach AI](./images/patient-mobile-coach-ai.png)
![Patient Mobile — Coach AI (Shari overview)](./images/patient-mobile-coach-ai-shari-overview.png)
![Patient Mobile — Coach AI (voice off, typed)](./images/patient-mobile-coach-ai-voice-off-typed.png)
![Patient Mobile — Coach AI (sharing off, locked)](./images/patient-mobile-coach-ai-sharing-off-locked.png)

### Goal View
Read-only view of the goals the clinician defined. One scrollable list of **prescription cards**, grouped by type (sleep, medication, journaling, exercise).

**Versioning.** Goals are versioned — every time the clinician edits and saves, a new version is created.
Opening the goals from the app home always lands on the **current (latest) version**.
A version selector lets the patient navigate back to any previous version.
When viewing an older version, the screen is clearly marked (e.g. banner: "Viewing an older version from <date>. This is no longer active.") with a one-tap shortcut back to the current version.

Each card shows:
The action — what the patient is supposed to do, in plain language (e.g. "Be asleep by 22:00").
Instructions / rules / limitations from the clinician.
A primary call-to-action when the prescription has one — e.g. "Open journal" for journaling, "Log bedtime" for sleep, "Mark taken" for medication. The CTA is determined by the prescription type, not authored per-prescription by the clinician.

Tap a card to expand:
Full details + rationale.
The trigger is shown explicitly so the patient knows when the action applies — schedule for time-based triggers (e.g. "every night at 22:00"), condition for situation-based ones (e.g. "when stress is high").
(future: per-prescription history — data + compliance over time — see Future / Post-MVP)

(future: patient annotations / questions on a specific prescription that get surfaced to the clinician — see Future / Post-MVP)

![Patient Mobile — Goal View](./images/patient-mobile-treatment-plan.png)

### Data sharing
Settings page with a **master switch** for sharing.
List view of every data point and its individual share state (integration data types, Coach AI, per-applet settings, etc.).

![Patient Mobile — Data sharing](./images/patient-mobile-data-sharing.png)

### Compliance score & progress view
this view is gated by the clinician's visibility toggle.

Score over time (graph).
Tap a score / data point to open a details view: breakdown of how the score was calculated (something basic for the MVP).

(future: clinician can push insights and advice into this view — see Future / Post-MVP)

![Patient Mobile — Compliance & progress](./images/patient-mobile-compliance-and-progress.png)

## End-to-End Flows

### Escalation flows
user content is always scanned for safety concerns or at-risk language.
there are three types of escalations: hard, soft, and user-only.
A hard escalation locks the app for the user + a notification to the clinician. A soft escalation only sends a notification to the clinician and logs the event. a user-only esclation logs the event for the clinician, but most of the handling (the "esclation") is app <> patient (for example, dysregulation detection triggers a "user-only" esclation flow)

see appendix below for detailed logic of triggers in the MVP.

User posts a journal entry that indicates suicidal ideation → system detects it when the entry is saved → app locks up with a message → push notification to the clinician (to their mobile, of course it also shows up in the clinician web and app in the notifications center and activity log).

Clinician has a control to unlock the app for the user (important that it is also available on the mobile, so that it can be done in the moment).

User starts asking the Coach AI inappropriate questions → system detects it when the input is about to be sent (input proxy) → push notification to the clinician. Note: no app lockup in this case.

![Patient Mobile — App locked (safety)](./images/patient-mobile-app-locked-safety.png)

### Dysregulation flow (with treatment-plan reference)

A series of abnormal readings from the heart rate monitor (a predefined logic for what is abnormal and counts as dysregulation) → the app looks for a course of action in the goals. If one exists, the app will prompt the user to follow it (in app, or popup notification). If one does not exist, the app will send a generic help notification and push the user to contact their clinician, or talk with the Coach AI.

This is logged in the activity list.

![Patient Mobile — Dysregulation push (lock screen)](./images/patient-mobile-dysregulation-push-lock-screen.png)
![Patient Mobile — Dysregulation prompt (plan fallback)](./images/patient-mobile-dysregulation-prompt-plan-fallback.png)
![Patient Mobile — Dysregulation prompt (no fallback)](./images/patient-mobile-dysregulation-prompt-no-fallback.png)


### Onboarding Flow

Clinician sets up an account on the seperate website we will setup.
There he goes through a seperate onboarding flow
- Name, Email, Password, pfp, delphi link (optional)
Clinician can then install the mobile app and login with the credentials they created in the web-app.

For every patient, the clinician performs an onboarding process. A patient profile is linked to an email address.

The patient can create an account with that email address.
The patient can install the mobile app, and login.


> Open questions, assumptions, and post-MVP capabilities live in [poc-user-journey-open-items.md](./poc-user-journey-open-items.md).


## Appendix: escalation triggers in the MVP

**Scanned content:** (1) Journal entry **body** on save, and Coach AI **outgoing** patient message on send (before it reaches Delphi). (2) data ingested by the app (including wearbale biofeedback).

**Triggers:**

In the MVP: Keyword/phrase matching or basic logic on data

- **hard** - self-harm / suicidal intent: "kill myself", "suicid", "end it all / end my life", "don't want to be here", "take my own life"… → app locks (self-harm lock screen) + urgent push to clinician.
- **soft** - distress without explicit intent: "hopeless", "can't go on", "worthless", "burden", "hurt myself"…
- **user-only (dysregulation)** — biofeedback signals from Apple Watch readings (mock data manually entered in the integration page) (HR > 95 bpm, or respiration > 20 breaths/min).

## Note on "alert acknowledgment"

Alerts are acknowledged manually, by clicking on the alert in the web, or tapping it on mobile. this manual acknowelgement is put in place due to the importance of these alerts.


## Appendix: The Treatment Plan ("Whole Life Plan") Categories

Nutrition — food is medicine
Exercise — type and frequency
Music & Movement
Meditation & Mindfulness
self-regulation tools
Breathwork
Spirituality — how you inspire yourself
Finances
Work and Work Relationships — colleagues or schoolmates
Fun & Hobbies — what you do for enjoyment
Mentoring & Volunteering — giving back and inspiring others
Relationship with Self — positive and negative beliefs
Relationships with Others — communication, time spent, goals
Personality — strengths and deficits
