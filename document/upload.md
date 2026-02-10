Mentor Upload
↓
S3 TEMP BUCKET (you already upload here)
↓
S3 Event
↓
SQS (video-processing-queue)
↓

ecr

ECS Worker (Docker + FFmpeg)
↓
S3 PROD BUCKET (HLS)
↓
Update LessonContent.video.url → HLS path

AKIARYUQPP4OPPNLWQPT

2cBPJEOezrMmGOEZU8P8VdE7WFwwVgFvHz7I7nOF

AKIARYUQPP4ODSPJ53H3
2pXUu4sZuGD+LUMjk4V+Y3GRqXiuN8sweSS1WGho

upload/courses/6988ac6cc0ab0cb3d06a5a51/lessons/6989a4d7188a1798dac622e8/lesson-contents/698abbbae61dfd92d8da9b16/video/source-v1.mp4

prod/public/courses/6988ac6cc0ab0cb3d06a5a51/lessons/6989a4d7188a1798dac622e8/lesson-contents/698abbbae61dfd92d8da9b16/hls/v1/master.m3u8














Assessment System — Bugs & Fixes
Fix quiz/assignment scoring, completion logic, and frontend players to work correctly in a real-world LMS.

User Review Required
IMPORTANT

Assignment completion behavior: Currently, assignments are marked isCompleted = true on submission (before grading). I'll keep this behavior since it's needed for lesson unlocking, but obtainedMarks stays 0 until an instructor grades it. The score-based progress will reflect this accurately.

WARNING

Quiz re-attempts: Currently quizzes allow unlimited re-answering. I'll enforce that once a quiz is completed (all questions answered), it cannot be retaken. The maxAttempts field exists in the schema but is never checked.


Proposed Changes
Backend — Assessment Service
[MODIFY] 
assessment.service.ts
Quiz 
submitQuestion
 fixes:

Check if quiz is already completed → return error
Enforce maxAttempts from quiz settings
Add getQuizAttempt service to return student's previous attempt data
Assignment 
submitAssignment
 fixes:

Check for existing submission → prevent duplicates
Return richer response (submission details, penalty info)
New service methods:

getQuizAttempt(userId, quizId) — returns student's attempt with responses/score
getAssignmentSubmission(userId, assignmentId) — returns student's submission
[MODIFY] 
student.route.ts
Add two new routes:

GET /quiz/:quizId/attempt — get student's quiz attempt
GET /assignment/:assignmentId/submission — get student's submission
[MODIFY] 
assessment.controller.ts
Add controller methods for the new routes above.

Frontend — Quiz Player
[MODIFY] 
QuizPlayer.tsx
Fetch previous attempt on mount → if completed, show results summary (score, pass/fail, per-question breakdown)
Show total marks and passing marks in header
After last question: show completion summary card with score breakdown
Prevent re-take if quiz is completed (show "Quiz Already Completed" with results)

Frontend — Assignment Player
[MODIFY] 
AssignmentPlayer.tsx
Show instructions list from content.assessment.data.instructions
Support all 4 submission types: file URL, text, link, code
Show submission details when already submitted (type, content, timestamp, late status, grade)
Show "Awaiting Grade" state between submission and grading
Fetch existing submission on mount and display
Frontend — Content Player Page
[MODIFY] 
page.tsx
Hide 
ManualCompleteButton
 for quiz and assignment content types (they auto-complete through their own flows)
Frontend — Assessment API
[MODIFY] 
assessment-api.ts
Add two new API methods:

getQuizAttempt(quizId) — fetch previous attempt
getAssignmentSubmission(assignmentId) — fetch previous submission
Verification Plan
Manual Verification
Submit a quiz → verify score updates correctly, completion blocks re-take
Submit an assignment → verify no duplicate submissions, penalty shown
Re-open a completed quiz → verify results summary shown
Re-open a submitted assignment → verify submission details shown
Check batch detail API → verify score and progress reflect real marks
Verify ManualCompleteButton hidden for quiz/assignment content