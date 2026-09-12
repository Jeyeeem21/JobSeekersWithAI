import { test, expect } from '@playwright/test'
import { skills, programs, periods, placementRate, snapshot, organizations } from '../src/data/lguData.js'

async function visit(page, module, tab) {
  await page.goto(`/#/lgu/${module}${tab ? `?tab=${encodeURIComponent(tab)}` : ''}`)
  await expect(page.locator('.lgu-workspace')).toBeVisible()
}
async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
}
async function navigate(page, name) {
  const menu = page.getByRole('button', { name: 'Open navigation', exact: true })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name, exact: true }).click()
}
test('connected dataset invariants', () => {
  expect(placementRate(snapshot.hired)).toBe('25.4%')
  for (const p of Object.values(periods)) {
    expect(p.trend.reduce((n, row) => n + row[1], 0)).toBe(p.hired)
    expect(p.applications).toBeGreaterThanOrEqual(p.shortlisted)
    expect(p.shortlisted).toBeGreaterThanOrEqual(p.interviews)
    expect(p.interviews).toBeGreaterThanOrEqual(p.hired)
  }
  for (const skill of skills) expect(programs.filter(p => p.skillIds.includes(skill.id)).reduce((n, p) => n + p.slots, 0)).toBe(skill.slots)
  for (const p of programs) expect(p.slots + p.registrations).toBe(p.capacity)
  expect(programs.reduce((n, p) => n + p.completed, 0)).toBe(snapshot.trainingCompleted)
  expect(organizations.filter(o => ['Pending Review', 'Under Review', 'Needs Additional Documents'].includes(o.status))).toHaveLength(8)
})

test('ten grouped modules, all tabs, responsive layouts, and history', async ({ page }, testInfo) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  await visit(page, 'dashboard')
  await expect(page.getByRole('heading', { name: 'LGU Workforce Dashboard' })).toBeVisible()
  await expect(page.getByText('25.4%', { exact: true })).toBeVisible()
  await page.screenshot({ path: `test-results/phase2-dashboard-${testInfo.project.name}.png`, fullPage: true })
  await noOverflow(page)
  expect(await page.locator('.sidebar nav .nav-link').count()).toBe(10)
  const modules = [
    ['People & Organizations', ['Residents', 'Employers', 'Training Agencies', 'Verification Requests']],
    ['Opportunities', ['Job Vacancies', 'Training Opportunities', 'Skills & Skill Gaps']],
    ['Employment', ['Applications & Placements', 'Hiring Outcomes', 'Employment Placement Rate']],
    ['Entrepreneurship', ['Entrepreneurship Pathways', 'Business Registration / Permits']],
    ['Transactions & Partnerships', ['Job Posting Transactions', 'Training Listing Transactions', 'Sponsorships']],
    ['Analytics', ['Workforce Overview', 'Employment Analytics', 'Skills & Skill Gap Analytics', 'Training Analytics', 'Entrepreneurship Analytics', 'Prescriptive Insights']],
    ['Reports', []], ['User Management', []], ['Settings', []],
  ]
  for (const [name, tabs] of modules) {
    await navigate(page, name)
    await expect(page.getByRole('heading', { level: 1, name, exact: true })).toBeVisible()
    for (const tab of tabs) {
      await page.getByRole('tab', { name: tab, exact: true }).click()
      await expect(page.getByRole('tab', { name: tab, exact: true })).toHaveAttribute('aria-selected', 'true')
      await expect(page.locator('.lgu-content')).not.toBeEmpty()
      await noOverflow(page)
    }
    await noOverflow(page)
  }
  await page.goBack()
  await expect(page.getByRole('heading', { level: 1, name: 'User Management' })).toBeVisible()
  expect(errors).toEqual([])
})

test('search, combined filters, empty state, profile and progress', async ({ page }) => {
  await visit(page, 'people')
  await page.getByRole('textbox', { name: 'Search residents...' }).fill('Maria')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.getByRole('button', { name: 'View Profile', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('BS Business Administration')
  await expect(dialog).toContainText('Entrepreneurship Activity')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await page.getByRole('combobox', { name: 'Pathway', exact: true }).selectOption('Entrepreneurship')
  await expect(page.getByText('No items found', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await page.getByRole('combobox', { name: 'Profile Completion' }).selectOption('Below 50%')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.getByRole('button', { name: 'View Progress' }).click()
  await expect(dialog).toContainText('48%')
  await noOverflow(page)
})

test('verification confirmation, document preview, review persistence and connected metrics', async ({ page }) => {
  await visit(page, 'people', 'Verification Requests')
  const row = page.locator('tbody tr').filter({ hasText: 'ABC Solutions Inc.' })
  await row.getByRole('button', { name: 'Review', exact: true }).click()
  await page.getByRole('dialog').getByText('Business Registration.pdf', { exact: false }).first().click()
  await expect(page.getByText('DEMONSTRATION DOCUMENT', { exact: true })).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'Approve', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading', { name: 'Approve Employer Verification?' })).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.getByRole('dialog').getByRole('textbox', { name: /Review Notes/ }).fill('Documents checked and complete.')
  await page.getByRole('dialog').getByRole('button', { name: 'Approve', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Approve', exact: true }).click()
  await expect(row).toContainText('Verified')
  await page.reload()
  await expect(row).toContainText('Verified')
  await navigate(page, 'Dashboard')
  await expect(page.locator('.stat-card').filter({ hasText: 'Verified Employers' })).toContainText('74')
  await expect(page.locator('.stat-card').filter({ hasText: 'Pending Verifications' })).toContainText('7')
  await navigate(page, 'User Management')
  await expect(page.locator('tbody tr').filter({ hasText: 'ABC Solutions Inc.' })).toContainText('Verified')
})

test('request documents, reject agency, and review business requirements', async ({ page }, testInfo) => {
  await visit(page, 'people', 'Verification Requests')
  await page.locator('tbody tr').filter({ hasText: 'Mindoro Technical Training Center' }).getByRole('button', { name: 'Review', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Reject', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('Add review notes')
  await page.getByRole('dialog').getByRole('textbox', { name: /Review Notes/ }).fill('Please provide a complete agency profile.')
  await page.getByRole('button', { name: 'Request Additional Documents', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Request Additional Documents', exact: true }).click()
  await expect(page.locator('tbody tr').filter({ hasText: 'Mindoro Technical Training Center' })).toContainText('Needs Additional Documents')
  await page.locator('tbody tr').filter({ hasText: 'Southern Skills Center' }).getByRole('button', { name: 'Review', exact: true }).click()
  await page.getByRole('textbox', { name: /Review Notes/ }).fill('Duplicate organization submission.')
  await page.getByRole('button', { name: 'Reject', exact: true }).click()
  await page.getByRole('button', { name: 'Reject Request', exact: true }).click()
  await expect(page.locator('tbody tr').filter({ hasText: 'Southern Skills Center' })).toContainText('Rejected')
  await visit(page, 'entrepreneurship', 'Business Registration / Permits')
  const business = page.locator('tbody tr').filter({ hasText: 'BR-2026-00124' })
  await business.getByRole('button', { name: 'Review Application' }).click()
  await expect(page.getByRole('dialog')).toContainText('Business Activity')
  await page.screenshot({ path: `test-results/phase2-review-${testInfo.project.name}.png`, fullPage: true })
  await noOverflow(page)
  await page.getByRole('textbox', { name: /LGU Notes/ }).fill('Please update the location sketch.')
  await page.getByRole('button', { name: 'Request Additional Requirements', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Request Additional Requirements', exact: true }).click()
  await expect(business).toContainText('Needs Requirements')
  await business.getByRole('button', { name: 'Review Application' }).click()
  await page.getByRole('button', { name: 'Approve', exact: true }).click()
  await page.getByRole('button', { name: 'Approve', exact: true }).click()
  await expect(business).toContainText('Approved')
  await page.getByRole('tab', { name: 'Entrepreneurship Pathways' }).click()
  await expect(page.locator('tbody tr').filter({ hasText: 'Juan Dela Cruz' })).toContainText('Approved')
})

test('supporting data, opportunity drill downs, and reporting period', async ({ page }, testInfo) => {
  await visit(page, 'analytics', 'Prescriptive Insights')
  await page.screenshot({ path: `test-results/phase2-insights-${testInfo.project.name}.png`, fullPage: true })
  await page.getByRole('button', { name: 'View Supporting Data', exact: true }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('120')
  await expect(dialog).toContainText('40')
  await expect(dialog).toContainText('75')
  await expect(dialog).toContainText('80')
  await dialog.getByRole('button', { name: 'View Training', exact: true }).first().click()
  await expect(dialog).toHaveCount(1)
  await expect(dialog).toContainText('Total Batch Capacity')
  await page.keyboard.press('Escape')
  await visit(page, 'opportunities', 'Skills & Skill Gaps')
  await page.getByRole('combobox', { name: 'Priority', exact: true }).selectOption('High')
  await expect(page.locator('tbody tr')).toHaveCount(3)
  await page.getByRole('combobox', { name: 'Training Availability' }).selectOption('Enough Capacity')
  await expect(page.getByText('No items found', { exact: true })).toBeVisible()
  await navigate(page, 'Dashboard')
  await page.getByRole('combobox', { name: 'Reporting Period' }).selectOption('This Month')
  await expect(page.locator('.stat-card').filter({ hasText: 'Employment Placements' })).toContainText('42')
  await expect(page.getByText('5.0%', { exact: true })).toBeVisible()
  await navigate(page, 'Employment')
  await page.getByRole('tab', { name: 'Employment Placement Rate', exact: true }).click()
  await expect(page.locator('.lgu-rate')).toContainText('5.0%')
  await expect(page.locator('.lgu-rate')).toContainText('42 hires ÷ 842')
})

test('notifications mark read, keyboard dismissal, and grouped navigation', async ({ page }) => {
  await visit(page, 'dashboard')
  await page.getByRole('button', { name: /Notifications/ }).click()
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await page.getByRole('button', { name: 'Mark as Read', exact: true }).first().click()
  await expect(page.getByRole('button', { name: 'Unread (3)', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: /Notifications/ }).click()
  await page.getByRole('link').filter({ hasText: 'Employer verification request' }).click()
  await expect(page.getByRole('tab', { name: 'Verification Requests' })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('button', { name: /Notifications/ }).click()
  await page.getByRole('button', { name: 'Mark All as Read' }).click()
  await page.getByRole('button', { name: 'Unread (0)', exact: true }).click()
  await expect(page.getByText('No notifications', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.reload()
  await expect(page.locator('.notification-badge')).toHaveCount(0)
})

test('account activation and settings persist; mock reports export', async ({ page }) => {
  await visit(page, 'user-management')
  const row = page.locator('tbody tr').filter({ hasText: 'Juan Dela Cruz' })
  await row.getByRole('button', { name: 'Activate / Deactivate' }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(row.getByText('Active', { exact: true })).toBeVisible()
  await row.getByRole('button', { name: 'Activate / Deactivate' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Deactivate User', exact: true }).click()
  await navigate(page, 'People & Organizations')
  await expect(page.locator('tbody tr').filter({ hasText: 'Juan Dela Cruz' })).toContainText('Inactive')
  await navigate(page, 'User Management')
  await row.getByRole('button', { name: 'Activate / Deactivate' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Activate User', exact: true }).click()
  await navigate(page, 'Settings')
  await page.getByRole('textbox', { name: 'LGU Name', exact: true }).fill('San Jose LGU Workforce Office')
  await page.getByRole('combobox', { name: 'Table Density' }).selectOption('Compact')
  await page.getByRole('button', { name: 'Save Settings' }).click()
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'LGU Name', exact: true })).toHaveValue('San Jose LGU Workforce Office')
  await expect(page.locator('.lgu-workspace')).toHaveClass(/lgu-compact/)
  await navigate(page, 'Reports')
  await page.getByRole('button', { name: 'Generate Mock Report' }).first().click()
  await expect(page.getByRole('dialog')).toContainText('1,248')
  await page.keyboard.press('Escape')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export', exact: true }).first().click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain('mock.csv')
})

test('transaction, sponsorship, vacancy and agency detail actions', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  for (const [module, tab, action, expected] of [
    ['opportunities', 'Job Vacancies', 'View Vacancy', 'Job Description'],
    ['opportunities', 'Job Vacancies', 'View Applicants Summary', 'Aggregate applicant count'],
    ['opportunities', 'Training Opportunities', 'View Training', 'Total Batch Capacity'],
    ['people', 'Employers', 'View Company', 'Contact Person'],
    ['people', 'Employers', 'View Vacancies', 'Organization vacancies'],
    ['people', 'Training Agencies', 'View Agency', 'Contact Person'],
    ['people', 'Training Agencies', 'View Programs', 'Agency programs'],
    ['partnerships', 'Job Posting Transactions', 'View Transaction', 'Payment Status'],
    ['partnerships', 'Training Listing Transactions', 'View Transaction', 'Payment Status'],
    ['partnerships', 'Sponsorships', 'View Sponsorship', 'Residents Supported'],
    ['employment', 'Applications & Placements', 'View Placement', 'Match Score'],
    ['entrepreneurship', 'Entrepreneurship Pathways', 'View Pathway', 'Recommended Business'],
  ]) {
    await visit(page, module, tab)
    await page.getByRole('button', { name: action, exact: true }).first().click()
    await expect(page.getByRole('dialog')).toContainText(expected)
    await noOverflow(page)
    await page.keyboard.press('Escape')
  }
  expect(errors).toEqual([])
})

test('existing role shells and switcher remain available', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('.role-option')).toHaveCount(4)
  for (const role of ['Resident / Job Seeker', 'Employer / Business', 'Private Training Agency', 'LGU Administrator / Staff']) {
    await page.getByRole('button').filter({ has: page.getByRole('heading', { name: role, exact: true }) }).click()
    await expect(page.locator('main h1')).toBeVisible()
    if (await page.getByRole('button', { name: 'Open navigation' }).isVisible()) await page.getByRole('button', { name: 'Open navigation' }).click()
    await page.getByRole('button', { name: 'Switch Role', exact: true }).click()
    await expect(page.locator('.role-option')).toHaveCount(4)
  }
  expect(errors).toEqual([])
})
