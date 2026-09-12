# EntritifAI - Quick Reference Guide

## ✅ Project Status

| Phase | Status | Progress |
|-------|--------|----------|
| **Phase 1: Foundation** | ✅ Complete | 100% |
| **Phase 2: Resident Journey** | ✅ Complete | 100% (All 11 pages) |
| **Phase 3: Other Roles** | ⏸️ Pending | 0% |

**Current Build**: ✅ Successful (69.74 kB CSS, 353.86 kB JS)

---

## 🎯 Project Purpose
AI-Powered Employment, Skills Development, and Entrepreneurship Platform for LGUs

## 👥 User Roles (4 Total)

| Role | Access | Payment |
|------|--------|---------|
| **Resident / Job Seeker** | FREE | None |
| **Employer / Business** | FREE Registration | Job Posting Fee |
| **Private Training Agency** | FREE Registration | Training Listing Fee |
| **LGU Administrator / Staff** | FREE | None (No subscription!) |

## 🚀 Quick Start

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

Access: `http://localhost:5173`

## 📁 Key Files

```
src/
├── App.jsx                    # Main router
├── components/
│   ├── Layout.jsx            # Sidebar, Header, AppShell
│   └── ui.jsx                # All reusable components
└── pages/
    ├── RoleSwitcher.jsx      # Landing page
    ├── Resident.jsx          # Resident portal
    ├── Employer.jsx          # Employer portal
    ├── Training.jsx          # Training agency portal
    └── LGU.jsx               # LGU administrator portal
```

## 🎨 Design System

### Colors
```css
Background:  #fafbfc
Cards:       #ffffff
Primary:     #0a7e72 (teal/green)
Text:        #111827
Secondary:   #6b7280
Border:      #e5e7eb
```

### Typography
```
Page Title:    28px / 700
Section:       18px / 600
Metric:        24px / 600
Body:          14px / 400
Label:         12-13px / 500
```

### Spacing
Base: **8px** (use multiples: 8, 16, 24, 32)

### Border Radius
Cards/Panels: **10-12px**

## 📱 Responsive Breakpoints

- Desktop: >1200px
- Tablet: 740-1200px
- Mobile: <740px

## 🧩 Available Components

### Layout
- `AppShell` - Main application wrapper
- `Sidebar` - Navigation sidebar
- `Header` - Top navigation bar

### UI Components
- `Button` - primary, secondary, danger variants
- `Badge` - Status indicators
- `PageTitle` - Page headers with actions
- `StatCard` - Metric cards
- `Panel` - Content containers
- `Alert` - Info/success/warning/error messages
- `Modal` - Dialog boxes
- `ConfirmationDialog` - Confirm actions
- `Notification` - Toast messages
- `Field` - Form inputs
- `SearchField` - Search with icon
- `Filter` - Dropdown filters
- `DataTable` - Data tables
- `EmptyState` - No data placeholders
- `ProgressBar` - Progress indicators
- `RecommendationCard` - Job/training recommendations
- `Tabs` - Tab navigation

### Usage Example
```jsx
import { Button, PageTitle, StatCard } from '../components/ui'

<PageTitle 
  eyebrow="DASHBOARD"
  title="Welcome"
  description="Your overview"
>
  <Button>Add New</Button>
</PageTitle>

<StatCard
  icon={<Icon size={18} />}
  label="Total Users"
  value="1,247"
  detail="Active this month"
/>
```

## 🔄 Navigation Structure

### Resident (11 pages) - ✅ ALL COMPLETE
1. ✅ Dashboard - AI insights, stats, suggested actions
2. ✅ Career Profile - Complete profile with all sections
3. ✅ Career Assessment - 8-step assessment form
4. ✅ Recommended Jobs - AI-matched jobs with apply flow
5. ✅ Skills & Training - Skill gaps + training recommendations
6. ✅ My Training - Enrolled programs with progress
7. ✅ Applications - Job applications tracking
8. ✅ Entrepreneurship - Business recommendations
9. ✅ Business Registration - 5-step registration wizard
10. ✅ Progress - Timeline and reassessment visualization
11. ✅ Notifications - Notification center with filters

### Employer (8 pages)
Dashboard → Profile → Vacancies → Matches → Applicants → Interviews → Analytics → Notifications

### Training Agency (7 pages)
Dashboard → Profile → Programs → Participants → Completion → Analytics → Notifications

### LGU (20 pages)
Dashboard → Residents → Employers → Agencies → Verification → Vacancies → Training → Skills → Employment → Entrepreneurship → Business Permits → Job Transactions → Training Transactions → Sponsorships → Analytics → Insights → Reports → Notifications → Users → Settings

## 💰 Business Model

### Revenue Sources
1. **Job Posting Fees** (Employers)
2. **Training Listing Fees** (Training Agencies)
3. **Sponsorships** (Optional partnerships)

### Important Rules
- Payment allows listing **publication**
- Payment does **NOT** affect:
  - Match scores
  - Recommendation rankings
  - AI results

## 🤖 AI Role

**AI Provides:**
- Job matching
- Candidate matching
- Skill gap identification
- Training recommendations
- Entrepreneurship suggestions
- Prescriptive insights

**AI Does NOT:**
- Make hiring decisions
- Approve permits
- Make administrative decisions

## 📊 Mock Data Examples

### Resident Dashboard
- Profile: 85% complete
- Job matches: 12
- Training: 8 programs
- Applications: 3 active

### Employer Dashboard
- Vacancies: 5 active
- Matches: 34 candidates
- Applications: 28 pending
- Hires: 4 this month

### Training Dashboard
- Programs: 6 active
- Participants: 147
- Completions: 89
- Slots: 58 available

### LGU Dashboard
- Residents: 1,247
- Employers: 89
- Agencies: 12
- Vacancies: 156
- Placement rate: 67%

## ⚠️ What's NOT in Phase 1

- Backend/API
- Database
- Real authentication
- AI model integration
- Payment gateway
- Government system integration
- TESDA integration
- Detailed workflows (future phases)

## 🛠️ Common Tasks

### Add a new page
1. Add route to navigation in `Layout.jsx`
2. Create placeholder in role dashboard file
3. Test navigation

### Create a new component
1. Add to `components/ui.jsx`
2. Export from file
3. Import where needed

### Update styling
1. Edit `index.css` for global styles
2. Use Tailwind classes for component-specific

### Change role navigation
1. Edit `navigationConfig` in `Layout.jsx`
2. Add corresponding page in role dashboard

## 🐛 Troubleshooting

### Build fails
```bash
npm install          # Reinstall dependencies
npm run build        # Try build again
```

### Route not working
- Check hash format: `/#/rolename/pagename`
- Verify navigation config in `Layout.jsx`
- Ensure page case in route handler

### Component not found
- Check import path
- Verify export in `ui.jsx`
- Check spelling

## 📝 Key Concepts

### Entrepreneurship
- Part of Resident journey (not separate role)
- Residents can become entrepreneurs
- Entrepreneurs may register as Employers later

### LGU Administrator
- Main platform administrator
- No separate Platform Admin role
- No LGU subscription/license fees

### Verification
- Employers need LGU verification
- Training agencies need LGU verification
- Business permits reviewed by LGU

### TESDA
- Not a user role
- May appear as external reference
- No direct integration

## ✅ Phase 1 Checklist

- [x] 4 user roles implemented
- [x] 46 total pages (dashboard + navigation)
- [x] 20+ reusable UI components
- [x] Responsive design (mobile, tablet, desktop)
- [x] Role switcher landing page
- [x] Minimalist design system
- [x] Mock data demonstrations
- [x] No console errors
- [x] Build successful
- [x] Ready for presentation

## 🎯 Next Phase Suggestions

**Phase 2**: Detailed workflows
- Career assessment module
- Job application flow
- Employer job posting
- Training program creation
- Verification workflow

**Phase 3**: Analytics & reporting
- Workforce analytics dashboards
- Prescriptive insights engine
- Report generation

**Phase 4**: Advanced features
- Mock payment flows
- Business registration
- Interview scheduling
- Certificate generation

---

## 📞 Quick Commands Reference

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build production
npm run preview            # Preview build
npm run lint               # Check code

# Navigation
http://localhost:5173/     # Role switcher
/#/resident/dashboard      # Resident
/#/employer/dashboard      # Employer
/#/training/dashboard      # Training
/#/lgu/dashboard           # LGU
```

---

**Version**: Phase 1.0
**Status**: ✅ Complete and ready for demo
