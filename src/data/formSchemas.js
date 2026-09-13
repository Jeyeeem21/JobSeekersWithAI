export const jobFields = [
  { key: 'title', label: 'Job Title' }, { key: 'category', label: 'Job Category' },
  { key: 'description', label: 'Job Description', type: 'textarea', wide: true },
  { key: 'employmentType', label: 'Employment Type', options: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
  { key: 'experienceLevel', label: 'Experience Level', options: ['Entry Level', 'Mid Level', 'Senior Level'] },
  { key: 'openings', label: 'Number of Openings', type: 'number', min: 1, integer: true },
  { key: 'deadline', label: 'Application Deadline', type: 'date' },
  { key: 'salary.min', label: 'Minimum Salary (PHP)', type: 'number', min: 0 }, { key: 'salary.max', label: 'Maximum Salary (PHP)', type: 'number', min: 0 },
  { key: 'location', label: 'Location' }, { key: 'requiredSkills', label: 'Required Skills', type: 'list', hint: 'Separate skills with commas.' },
]
jobFields.push({ key: 'preferredSkills', label: 'Preferred Skills', type: 'list', required: false }, { key: 'requiredSkillLevel', label: 'Required Proficiency', options: ['Beginner', 'Intermediate', 'Advanced'] }, { key: 'acceptedEducation', label: 'Accepted Education', type: 'list', required: false }, { key: 'minimumExperienceMonths', label: 'Relevant Experience (Months)', type: 'number', min: 0, integer: true, required: false }, { key: 'requiredCertifications', label: 'Required Certifications', type: 'list', required: false }, { key: 'preferredCertifications', label: 'Preferred Certifications', type: 'list', required: false })
export const programFields = [
  { key: 'name', label: 'Program Name' }, { key: 'duration', label: 'Duration' },
  { key: 'description', label: 'Description', type: 'textarea', wide: true },
  { key: 'capacity', label: 'Capacity', type: 'number', min: 1, integer: true }, { key: 'fee', label: 'Training Fee (PHP)', type: 'number', min: 0 },
  { key: 'schedule', label: 'Start Date', type: 'date' }, { key: 'timeSlot', label: 'Time Slot' },
  { key: 'location', label: 'Location' }, { key: 'skillIds', label: 'Skills Developed', type: 'list', hint: 'Use skill names, separated by commas.' },
  { key: 'instructor', label: 'Instructor', required: false }, { key: 'targetAudience', label: 'Target Audience', required: false },
]
programFields.push({ key: 'developedLevel', label: 'Completion Proficiency', options: ['Intermediate', 'Advanced'] }, { key: 'prerequisiteSkills', label: 'Prerequisite Skills', type: 'list', required: false })
export const organizationFields = [
  { key: 'name', label: 'Organization Name' }, { key: 'contact', label: 'Contact Person' },
  { key: 'description', label: 'Description', type: 'textarea', wide: true },
  { key: 'industry', label: 'Industry', required: false }, { key: 'businessType', label: 'Business Type', required: false },
  { key: 'location', label: 'Location' }, { key: 'phone', label: 'Contact Phone' },
  { key: 'email', label: 'Contact Email', type: 'email' }, { key: 'website', label: 'Website', required: false },
]
export const interviewFields = [
  { key: 'date', label: 'Interview Date', type: 'date' }, { key: 'time', label: 'Interview Time', type: 'time' },
  { key: 'type', label: 'Interview Type', options: ['In-person', 'Virtual', 'Phone'] }, { key: 'location', label: 'Location / Meeting Details' },
  { key: 'notes', label: 'Optional Note', type: 'textarea', required: false, wide: true },
]
