# Visual Testing Guide - Tabs Consistency

## Quick Start
```bash
npm run dev
```
Open: `http://localhost:5173`

## Testing Tabs Across All Modules

### 1. LGU Module (Reference Implementation)
Navigate to: `#/lgu/people`

**Expected:**
```
┌────────────────────────────────────────────────────────┐
│ LGU WORKFORCE DASHBOARD                                 │
│ People & Organizations                                  │
│ Understand resident progress...                         │
└────────────────────────────────────────────────────────┘
┌──────────┬──────────┬───────────────┬─────────────────┐
│[Residents]│Employers │Training Agenc.│Verification Req.│
└──────────┴──────────┴───────────────┴─────────────────┘
```

**What to Check:**
- ✅ Horizontal tabs below page title
- ✅ Active tab has blue underline
- ✅ Inactive tabs are gray
- ✅ Click switches content immediately
- ✅ Clean, professional appearance

### 2. Resident Module (Now Updated)

#### Test Page 1: Career Profile
Navigate to: `#/resident/profile`

**Expected:**
```
┌────────────────────────────────────────────────────────┐
│ RESIDENT PORTAL                                         │
│ Career Profile                                          │
│ Your professional information and qualifications        │
└────────────────────────────────────────────────────────┘
┌────────────────────┬──────────────────────────────────┐
│[Profile Summary]   │ Skills & Qualifications          │
└────────────────────┴──────────────────────────────────┘
```

**What to Check:**
- ✅ Same tab style as LGU
- ✅ 2 tabs visible
- ✅ "Profile Summary" active by default
- ✅ Click "Skills & Qualifications" → content changes

#### Test Page 2: Employment
Navigate to: `#/resident/employment`

**Expected:**
```
┌────────────────────────────────────────────────────────┐
│ RESIDENT PORTAL                                         │
│ Employment                                              │
│ Job recommendations, applications, and interviews       │
└────────────────────────────────────────────────────────┘
┌─────────────────────┬─────────────────────────────────┐
│[Recommended Jobs]   │ My Applications                 │
└─────────────────────┴─────────────────────────────────┘
```

**What to Check:**
- ✅ Same tab style as LGU
- ✅ 2 tabs visible
- ✅ "Recommended Jobs" active by default
- ✅ Shows 3 job cards with match scores

#### Test Page 3: Skills Development
Navigate to: `#/resident/training`

**Expected:**
```
┌────────────────────────────────────────────────────────┐
│ RESIDENT PORTAL                                         │
│ Skills Development                                      │
│ Skill gaps, training recommendations, and progress      │
└────────────────────────────────────────────────────────┘
┌────────────┬─────────────────────┬──────────────────┐
│[Skill Gaps]│Recommended Training │ My Training      │
└────────────┴─────────────────────┴──────────────────┘
```

**What to Check:**
- ✅ Same tab style as LGU
- ✅ 3 tabs visible
- ✅ "Skill Gaps" active by default
- ✅ All 3 tabs switch correctly

#### Test Page 4: Entrepreneurship
Navigate to: `#/resident/entrepreneurship`

**Expected:**
```
┌────────────────────────────────────────────────────────┐
│ RESIDENT PORTAL                                         │
│ Entrepreneurship                                        │
│ Business recommendations and registration               │
└────────────────────────────────────────────────────────┘
┌────────────────────┬──────────────────┬──────────────┐
│[Business Recommend.]│Business Preparat.│Business Reg. │
└────────────────────┴──────────────────┴──────────────┘
```

**What to Check:**
- ✅ Same tab style as LGU
- ✅ 3 tabs visible
- ✅ "Business Recommendations" active by default
- ✅ Shows computer repair business card

#### Test Page 5: Progress
Navigate to: `#/resident/progress`

**Expected:**
```
┌────────────────────────────────────────────────────────┐
│ RESIDENT PORTAL                                         │
│ Progress                                                │
│ Track your career journey and achievements              │
└────────────────────────────────────────────────────────┘
┌───────────────────┬──────────────────────────────────┐
│[Career Progress]  │ Timeline                         │
└───────────────────┴──────────────────────────────────┘
```

**What to Check:**
- ✅ Same tab style as LGU
- ✅ 2 tabs visible
- ✅ "Career Progress" active by default
- ✅ Shows progress metrics

### 3. Compare Side-by-Side

Open two browser windows:
- Window 1: `#/lgu/people`
- Window 2: `#/resident/profile`

**Visual Consistency Check:**
```
LGU:      ┌──────────┐  Employer    Training Agenc.
Resident: ┌──────────┐  Skills & Qualifications
          │  SAME    │
          │  STYLE   │
          └──────────┘
```

**Should Match:**
- ✅ Tab height
- ✅ Tab padding
- ✅ Active tab blue underline
- ✅ Inactive tab gray color
- ✅ Hover effects
- ✅ Font size and weight
- ✅ Spacing between tabs

## Cross-Browser Testing

Test in multiple browsers:
- [ ] Chrome
- [ ] Edge
- [ ] Firefox

## Responsive Testing

Test at different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768px width)
- [ ] Mobile (375px width)

**Note:** Tabs may wrap or scroll on smaller screens

## Functional Testing

### Tab Navigation
- [ ] Click each tab → content updates
- [ ] Active tab has visual indicator
- [ ] URL updates with ?tab=TabName
- [ ] Refresh page → selected tab persists

### Deep Links
Test these URLs directly:
- [ ] `#/resident/profile?tab=Skills%20%26%20Qualifications`
- [ ] `#/resident/employment?tab=My%20Applications`
- [ ] `#/resident/training?tab=My%20Training`
- [ ] `#/resident/entrepreneurship?tab=Business%20Registration`
- [ ] `#/resident/progress?tab=Timeline`

### Browser Navigation
- [ ] Forward/back buttons work
- [ ] Tab state is preserved
- [ ] No tab "flashing" on navigation

## Accessibility Testing

### Keyboard Navigation
- [ ] Press Tab key → focus moves to tabs
- [ ] Arrow keys → navigate between tabs
- [ ] Enter/Space → activate tab
- [ ] Tab ring visible on focus

### Screen Reader
- [ ] Tabs announced as "tab" role
- [ ] Active tab announced
- [ ] Tab count announced (e.g., "1 of 3")

## Visual Regression Checklist

Compare Resident tabs with:

### LGU Module
- [ ] `#/lgu/people` (4 tabs)
- [ ] `#/lgu/opportunities` (3 tabs)
- [ ] `#/lgu/employment` (3 tabs)
- [ ] `#/lgu/entrepreneurship` (2 tabs)
- [ ] `#/lgu/analytics` (6 tabs)

### Employer Module
- [ ] Check if Employer uses tabs
- [ ] Style should match

### Training Module
- [ ] Check if Training uses tabs
- [ ] Style should match

## Issues to Watch For

### ❌ Common Problems
1. **Dropdown still showing** - Old code not removed
2. **Tabs not horizontal** - CSS issue
3. **Active tab not highlighted** - State not passing correctly
4. **Content not switching** - onChange not working
5. **Tabs look different from LGU** - Wrong component or styling

### ✅ Expected Behavior
1. Horizontal tabs below page title
2. Active tab has blue underline
3. Click switches content instantly
4. URL updates with tab parameter
5. Style matches LGU exactly

## Success Criteria

All checks must pass:
- [x] Build successful (no errors)
- [ ] All 5 tabbed pages render correctly
- [ ] Tabs match LGU visual style
- [ ] Tab switching works on all pages
- [ ] Deep links work
- [ ] Browser back/forward works
- [ ] Keyboard navigation works
- [ ] Responsive on all screen sizes

## Quick Visual Test Script

```bash
# 1. Start server
npm run dev

# 2. Open browser to http://localhost:5173

# 3. Test sequence (copy-paste into browser):
#/lgu/people                                    # Reference
#/resident/profile                              # Test 1
#/resident/employment                           # Test 2
#/resident/training                             # Test 3
#/resident/entrepreneurship                     # Test 4
#/resident/progress                             # Test 5

# 4. For each page, verify:
# - Tabs are horizontal
# - Active tab is highlighted
# - Click switches content
# - Style matches LGU
```

## Screenshots Comparison

Take screenshots of:
1. LGU People page (tabs)
2. Resident Career Profile (tabs)
3. Side-by-side comparison

Should be visually identical styling.

---

**Testing Status:** Ready for visual verification  
**Expected Duration:** 10-15 minutes for full test  
**Priority:** High (UI consistency critical)
