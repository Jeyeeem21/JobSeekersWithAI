# Phase 5: Resident Module - Quick Reference

## Testing the Resident Module

### 1. Start the Application
```bash
npm run dev
```
Then navigate to: `http://localhost:5173/#/resident/dashboard`

### 2. Main Navigation
Click items in the left sidebar to access:
- **Dashboard** - Overview with top job match, priority skill gap, recommended training
- **Career Profile** - Personal info, skills, experience (2 tabs)
- **Employment** - Job recommendations and applications (2 tabs)
- **Skills Development** - Skill gaps, training programs (3 tabs)
- **Entrepreneurship** - Business recommendations and registration (3 tabs)
- **Progress** - Career progress and timeline (2 tabs)
- **Settings** - Account settings

### 3. Key Interactions to Test

#### Employment Flow:
1. Go to **Employment** → **Recommended Jobs**
2. Click "Why This Matches" on IT Support Technician (92% match)
3. Click "View Job" to see full details
4. Click "Apply Now" → Confirm application
5. Go to **My Applications** tab → View APP-001

#### Skills Development Flow:
1. Go to **Skills Development** → **Skill Gaps**
2. Click "View Details" on Network Configuration
3. See related training programs
4. Go to **Recommended Training** tab
5. Click "Why Recommended" on Network Administration Training
6. Click "View Training" → "Register" → Confirm
7. Go to **My Training** tab → See new registration

#### Entrepreneurship Flow:
1. Go to **Entrepreneurship** → **Business Recommendations**
2. Click "View Details" on Computer Repair Service
3. See existing strengths and development areas
4. Go to **Business Registration** tab
5. View BR-2026-00124 status and timeline

### 4. Data Consistency Check

Verify Juan Dela Cruz (R-001) data appears consistently:

**In LGU Module:**
- Navigate to `#/lgu/people` → Residents tab
- Find R-001 (Juan Dela Cruz) with 92% profile completion
- Check skills: Computer Diagnostics, Customer Service
- Check training: Network Configuration Lab (92% complete)
- Check business: BR-2026-00124 (Under Review)

**In Employer Module:**
- Navigate to `#/employer/applicants`
- Find APP-001 from Juan Dela Cruz for IT Support Technician
- Match score should be 92%

**In Training Module:**
- Navigate to `#/training/participants`
- Find Juan Dela Cruz in Network Configuration Lab
- Progress should be 92%

**In Resident Module:**
- Navigate to `#/resident/dashboard`
- All the above data should match

### 5. Notification Test
1. Click the bell icon in the header
2. Should see 5 notifications
3. Filter by type: application, job_match, training, business
4. Click a notification → navigate to relevant section
5. Mark as read → unread count updates

### 6. State Persistence Test
1. Apply to a job
2. Refresh the page (F5)
3. Go to **My Applications** → Application should still be there
4. Check browser localStorage: Key `entritifai-resident-phase5-v1`

## Important Demo User

**Name:** Juan Dela Cruz  
**ID:** R-001  
**Profile Completion:** 92%  
**Location:** Poblacion, San Jose, Occidental Mindoro  
**Education:** BS Information Technology  
**Skills:** Computer Diagnostics, Customer Service  
**Current Training:** Network Configuration Lab (92% complete)  
**Current Application:** IT Support Technician at Mindoro Digital Services (92% match)  
**Business Application:** JD Computer Repair Services (Under Review)

## Data Files

All Resident data is in:
- `src/data/residentData.js` - demoResident, skillGaps, recommendedJobs, applications, myTraining, entrepreneurshipRecommendations, businessApplication, progressTimeline

Cross-reference with:
- `src/data/lguData.js` - residents, businesses, trainingPrograms
- `src/data/employerData.js` - candidateMatches, applications
- `src/data/trainingData.js` - participants

## Modal Functions

All modals are accessible through buttons in the UI:
- `viewMatchExplanation(job)` - Why job matches
- `viewJobDetails(job)` - Full job posting
- `applyToJob(job)` - Apply with confirmation
- `viewApplication(app)` - Application status
- `viewSkillGap(gap)` - Skill gap details
- `viewTrainingExplanation(training)` - Why training recommended
- `viewTrainingDetails(training)` - Full training info
- `registerTraining(training)` - Register with confirmation
- `viewMyTraining(training)` - Training progress
- `viewBusinessRecommendation(business)` - Business opportunity
- `viewBusinessApplication()` - Business registration status

## Component Dependencies

Resident.jsx imports:
- `ui.jsx` - PageTitle, StatCard, Panel, Alert, Button, Badge, ProgressBar, Field, Modal, ConfirmationDialog
- `lgu/Workspace.jsx` - Metrics, Facts, Status
- `lgu/lgu.css` - Styling
- `data/residentData.js` - All resident data
- `data/lguFormat.js` - money() formatter

## localStorage State Structure

```javascript
{
  applications: [
    { id, jobId, jobTitle, company, matchScore, status, appliedDate, lastUpdate, notes, coverLetter }
  ],
  myTraining: [
    { id, trainingId, programId, title, provider, status, progress, enrollmentDate, expectedCompletion, schedule, skillsDeveloped, attendance, assessmentScore }
  ],
  businessApplication: {
    id, applicant, businessName, businessType, activity, location, submitted, status, documents, notes, timeline
  }
}
```

## Build Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Phase Completion Status

- ✅ Phase 1: Initial setup and base components
- ✅ Phase 2: LGU Module
- ✅ Phase 3: Employer Module
- ✅ Phase 4: Training Agency Module
- ✅ **Phase 5: Resident Module** ← YOU ARE HERE

All phases complete! 🎉
