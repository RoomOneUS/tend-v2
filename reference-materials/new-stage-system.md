# New Stage System and Workflow Redesign

After talking to an industry expert, I have some modifications to make, grounded in the real process clinicians use with their patients.

In the first couple of sessions, a "biopsychosocial assessment" is conducted to understand the patient. During this process, the clinician asks questions to build a comprehensive integrative understanding of the patient. These include neurological, physical, medical, developmental, psychological, familial, relational, Social, strengths and resiliency, deficits, lifestyle, sleep, and nutrition.

The data (it can be plain text, images, documents, audio, video) is collected and indexed, to later be used. All throughout the therapy such arbitrary context about the patient can be added, edited, or removed.

This is mostly a data collection effort, so there is no need to conduct assessments or create treatment plans as long as the biopsychosocial hasn't been completed.

Once completed, the clinician writes an assessment, and from that creates the "whole life plan" - a comprehensive "treatment plan" that gives us the "what" of treatemnt - what are we trying to change or fix?
This treatmenent plan is made of predefined categories (see appendix below), but it is freetext for each of the categories (only the goals are structured)

then the routine of threapy is that in each session, "Goals" are set. A goal is an actual actionable prescription, and is therefore also structured (there are different prescription types - TBD). In general, think of it as the "how" - how are we going to make progress on the overall objectives? 

To summarize:
the biopsychosocial happens once, even though arbitrary patient data ("context") can still be changed.
the assessment might change throughout the therapy, but it is mostly unchanged (this is an assumption, not sure of this!). no need to change it every single session
the whole life plan (what we will call the "treatment plan") also rarely changes, but it may. so again - no need 
goals, however, are ever-changing - in each session (or once every couple of sessions), the clinician will determine a set of goals that they want to work on.


it is an open question whether all this data is usually kept in the EMR. If so, it makes sense we don't keep it in our app, but pull and push from and to the EMR.

the structure for the assessment itself is still unclear, we need to ask that question, but for now assume it is just one freetext field, unstructured.

Where the biospsychosocial suggestion engine will shine the brightest is in the assessment, whole-life-plan, and goal creation process.


## Appendix: The "Whole Life Plan" Categories

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
