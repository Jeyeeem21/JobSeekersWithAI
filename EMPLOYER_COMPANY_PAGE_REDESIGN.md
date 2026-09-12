# Employer Company & Verification Page - Redesign Plan

## Current Issues
- Plain, boring layout with basic Panels
- No visual hierarchy
- Verification status not prominent
- Documents in collapsible details (hard to see)
- Contact info separated from company info

## Redesign Features

### 1. **Verification Hero Banner**
- Green gradient background (#10b981 → #059669)
- Large shield icon with white overlay
- "Verified Employer" heading (24px bold)
- Verification date and benefits description
- "View Full Profile" button (white with green text)
- Eye-catching, professional

### 2. **Unified Company Profile Card**
- Single white card with all company info
- Company name as heading (20px, bold)
- Industry • Business Type • Size (inline metadata)
- Edit button in header (right-aligned)
- **Two-column grid layout:**
  - Left: Company Details (Industry, Business Type, Size, Location)
  - Right: Contact Information (Contact, Email, Phone, Website)
- **Full-width sections:**
  - Company Description (paragraph format)
  - Business Address (highlighted box with light background)

### 3. **Verification Documents Section**
- Modern card layout with section header
- **Document cards** (not collapsible):
  - Green teal background icon (FileText)
  - Document name (15px, bold)
  - Type and upload date (12px, gray)
  - Status badge (right-aligned)
  - Hover effect (border color change to teal)
  - Better visual hierarchy

### 4. **Design Improvements**
- 12px border radius (modern rounded corners)
- Proper spacing and padding
- Color-coded sections
- Better typography hierarchy
- Professional gradient hero
- Clean grid layouts
- Hover interactions

## Implementation
Replace lines 248-308 in `src/pages/Employer.jsx` with the redesigned version.

The new design:
- ✅ More visual impact
- ✅ Better information hierarchy
- ✅ Professional appearance
- ✅ Prominent verification status
- ✅ Easier to scan and read
- ✅ Modern card-based layout
