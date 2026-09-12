# EntritifAI — Phase 1 frontend prototype

React, Tailwind CSS, and Lucide React. This prototype covers demo role selection and the Platform Administrator's license-only workspace for one LGU and one annual subscription.

## Run

```sh
npm install
npm run dev
```

Choose **Continue as Platform Admin**. The LGU Admin, Resident, and Employer entries show next-phase placeholders only.

## Demo behavior

- Dashboard, LGU License, searchable/filterable License History, and editable Account.
- Activation, renewal, and deactivation use local forms and confirmation dialogs.
- License changes update the dashboard and create history records. Superseded active records are marked Completed.
- The reference date is January 1, 2027, with 365 inclusive days initially remaining. Annual expiry is calculated from the selected start date. Past terms show Expired; future renewal terms are recorded Active for this prototype.
- Paid and Unpaid are manually recorded sample statuses, with no payment processing.
- All edits are in memory and reset on a full page refresh. Exiting and reentering the demo retains edits until refresh.
- No backend, authentication, AI services, database, or workforce operations are implemented.

## Structure

- `src/components/ui.jsx`: shared buttons, fields, dialogs, badges, tables, search/filter controls, empty/loading states, and notifications.
- `src/components/Layout.jsx`: shared brand, sidebar, and header.
- `src/pages/Access.jsx`: demo access and future-phase placeholders.
- `src/pages/Admin.jsx`: the four Platform Admin pages and license form.
- `src/data/demo.js`: mock records and date/status helpers.
- `src/App.jsx`: in-memory demo state and hash navigation.
- `src/index.css`: shared styles, responsive layouts, and compact typography.

## Verify

```sh
npm run build
npm run lint
npx playwright test
```

Browser tests use installed Google Chrome and cover desktop/mobile navigation, all role placeholders, account editing, history filters, license actions, date validation, reset behavior, and horizontal overflow. Screenshots are written to ignored `test-results/`.

Phase 2 is intentionally not implemented.
