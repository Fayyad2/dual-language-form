

# Dual-Language Payment Order System

## Overview

This project is a robust, production-grade, dual-language (English/Arabic) Payment Order (PO) management system for HR and Finance workflows. It is built with React, TypeScript, Vite, TailwindCSS, Supabase, and a modern component library. The system supports multi-role dashboards, PO creation, approval workflows, attachment management, and export/print features, all with bilingual support and a focus on extensibility, reliability, and user experience.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [File-by-File Explanations](#file-by-file-explanations)
3. [Data Model & Supabase Schema](#data-model--supabase-schema)
4. [Project Logic & Flow](#project-logic--flow)
5. [UI/UX & User Flows](#uiux--user-flows)
6. [Error Handling & Best Practices](#error-handling--best-practices)
7. [Usage Examples](#usage-examples)
8. [Configuration & Environment](#configuration--environment)
9. [Extending the System](#extending-the-system)

---

## Project Structure

```
dual-language-form/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── pages/
│   │   ├── Index.tsx
│   │   ├── POForm.tsx
│   │   ├── POView.tsx
│   │   ├── NotFound.tsx
│   │   ├── OptionsTab.tsx
│   │   └── api/po-approve.ts
│   ├── components/
│   │   ├── POForm/...
│   │   ├── POManagement/...
│   │   ├── Settings/CompanySettingsDialog.tsx
│   │   └── ui/...
│   ├── hooks/...
│   ├── integrations/supabase/client.ts
│   ├── lib/utils.ts
│   ├── types/po.ts
│   └── utils/...
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── ...
```

---

## File-by-File Explanations

### Top-Level & Configuration

- **package.json**: Lists all dependencies (React, Supabase, Radix UI, Tailwind, etc.), scripts for dev/build/lint, and project metadata. All dependencies are carefully chosen for stability and modern best practices.
- **vite.config.ts**: Vite configuration for React, path aliases, and dev server settings. Enables fast HMR, code splitting, and custom plugins.
- **tailwind.config.ts**: TailwindCSS theme, color palette, and plugin setup for custom design tokens and dark mode. Defines custom color tokens for corporate branding and form/table UI.
- **tsconfig.json / tsconfig.app.json**: TypeScript compiler options, path aliases, and project references. Ensures type safety and editor tooling.

### Entry Points

- **src/main.tsx**: Mounts the React app to the DOM, imports global CSS. This is the true entry point for the SPA.
- **src/App.tsx**: Root component. Sets up React Router, QueryClientProvider (TanStack Query for async state), and global UI providers (toasts, tooltips). Defines all main routes:
	- `/` → Dashboard (`Index.tsx`)
	- `/po-form` → PO creation/editing (`POForm.tsx`)
	- `/po-view` → PO details/print (`POView.tsx`)
	- `*` → NotFound
	- All routes are wrapped in providers for consistent state and UI.

### Pages

- **src/pages/Index.tsx**: Main dashboard. Handles account type selection (HR, Finance, Engineers, Project Management), loads POs from Supabase, filters/searches, displays PO cards, stats, and approval tables. Integrates with:
	- `POCard` (PO summary card): Shows PO number, status, tags, and actions (edit, view, delete).
	- `POFilters` (search, status, tag filters): Allows users to filter POs by multiple criteria.
	- `FinanceApprovalBar` (finance actions): For finance users to approve/decline/review POs, with transaction number input.
	- `CloseableApprovalsSection` (collapsible approvals table): Shows all POs and their approval status for each role.
	- `OptionsTab` (settings/options): For advanced configuration.
	- `exportPOsToExcel` (Excel export): Exports all visible POs to Excel for reporting.
	- **State**: Uses React state for filters, search, and PO data. Uses hooks for toast notifications and navigation.
	- **Data Loading**: Fetches all POs from Supabase on mount, maps Supabase columns to internal keys, and handles errors gracefully.

- **src/pages/POForm.tsx**: Full PO creation/editing form. Features:
	- Bilingual input (English/Arabic) for purpose, with auto-translate and suggestions.
	- Dynamic table for PO details (customizable fields, add/remove, reset to default).
	- Cost center and budget fields, with validation and calculation of left over.
	- Attachments upload (Supabase Storage), with preview and print support.
	- Approval signature section for each role, with digital signature and comments.
	- Print/export buttons for PO and attachments.
	- Settings dialog (company info, logo, locations), saved to localStorage.
	- Integrates with: `POFormHeader`, `POFormFooter`, `CustomizableTable`, `CostCenterTable`, `ApprovalSection`, `PrintButton`, `PrintAttachmentsButton`, and hooks for suggestions.
	- **State**: Uses React state for all form fields, attachments, and approval data. Handles both create and edit modes.
	- **Validation**: Ensures required fields are filled, attachments are valid, and all data is saved before navigation.

- **src/pages/POView.tsx**: Read-only PO details and attachments. Allows print, edit, and attachment preview. Handles all file types (image, PDF, other) and provides a clean, print-friendly layout.

- **src/pages/api/po-approve.ts**: API route for updating PO approval status and transaction number in Supabase. Handles both status updates and transaction number storage in the PO's meta field. Returns appropriate HTTP status codes for error handling.

### Components

- **POForm/**: All components for the PO form UI, including:
	- `POFormHeader.tsx` / `POFormFooter.tsx`: Company info, logo, and footer. Props allow dynamic company branding and PO number editing.
	- `CustomizableTable.tsx`: Editable table for PO fields (add/remove fields, reset to default). Supports custom field types and dynamic validation.
	- `CostCenterTable.tsx`: Table for cost center, budget, and consumption fields. Props allow two-way binding with parent form state.
	- `ApprovalSection.tsx`: Signature/comments for each approval role. Props allow updating signatures and comments for each role.
	- `PrintButton.tsx` / `PrintAttachmentsButton.tsx`: Print PO or attachments as PDF. Uses `react-to-print` and custom logic for combining files.
	- `WordTable.tsx`: Advanced, resizable, editable table (MS Word-like experience). Supports column/row insertion, resizing, cell selection, and keyboard shortcuts.
	- `TabulatorTable.tsx` / `DataGridTable.tsx`: Placeholder for future advanced tables (e.g., for more complex PO types).
	- `BillingualInput.tsx`: Dual-language input with auto-translate (MyMemory API). Props allow parent to control both English and Arabic values.

- **POManagement/**: Dashboard and approval components:
	- `POCard.tsx`: Card view for each PO (status, actions, tags). Props allow parent to handle edit/view/delete actions.
	- `ApprovalsTable.tsx`: Table showing approval status for each PO and approver. Props allow parent to handle approval actions for each role.
	- `FinanceApprovalBar.tsx`: Finance actions (approve, decline, review, transaction number input). Props allow parent to handle all finance actions and validation.
	- `POFilters.tsx`: Search, status, and tag filters. Props allow parent to control all filter state and update logic.
	- `CloseableApprovalsSection.tsx`: Collapsible section for approvals table. Props allow parent to control open/close state and search.

- **Settings/CompanySettingsDialog.tsx**: Dialog for editing company info, logo, and location options. Saves to localStorage. Props allow parent to control open/close state and handle settings changes.

- **ui/**: All UI primitives (Button, Card, Dialog, Input, Toast, Tabs, etc.) built on Radix UI and custom styles. Each file exports a single component, with props for full customization and accessibility.

### Hooks

- **use-toast.ts**: Toast notification system (global, Radix-based). Exports `useToast` hook and `toast` function for programmatic notifications. Handles queueing, dismissing, and updating toasts.
- **use-mobile.tsx**: Detects if the user is on a mobile device. Returns a boolean for responsive UI logic.
- **useBeneficiaryNameSuggestions.ts**: Fetches unique beneficiary names from Supabase/localStorage for autocomplete. Uses effect hooks to fetch and cache suggestions.
- **usePurposeArabicSuggestions.ts**: Fetches unique Arabic purposes from Supabase for autocomplete. Uses effect hooks to fetch and cache suggestions.

### Types

- **types/po.ts**: TypeScript interfaces for PO data, table fields, and status enums. Defines the full PO data model, including all fields, custom fields, tags, status, approvals, and meta.

### Utils

- **poSupabase.ts**: CRUD functions for POs in Supabase (add, update, delete, fetch all). Handles all API errors and returns typed data.
- **poUtils.ts**: Utility functions for PO numbering, company settings (get/save), and defaults. Handles localStorage persistence and merging with defaults.
- **excelExport.ts**: Exports PO data to Excel (xlsx) for reporting. Uses dynamic field mapping and supports both English and Arabic columns.
- **uploadAttachment.ts**: Uploads files to Supabase Storage and returns public URLs. Handles file path naming, upsert logic, and public URL retrieval.
- **translator.ts**: MyMemory API wrapper for free English/Arabic translation. Handles language detection, fallback logic, and error handling.
- **gemini.ts**: Google Gemini API utility for AI-powered Arabic purpose suggestions. Handles prompt construction, API calls, and JSON parsing.

### Integrations

- **integrations/supabase/client.ts**: Initializes Supabase client using environment variables. Handles session persistence and authentication.

---

## Data Model & Supabase Schema

### POData (src/types/po.ts)

```
export interface POData {
	id: string;
	poNumber: string;
	date: string;
	location: string;
	department: string;
	purposeEnglish: string;
	purposeArabic: string;
	beneficiaryName: string;
	amount: string;
	amountWords: string;
	paymentMethod: string;
	paymentType: string;
	timeToDeliver: string;
	costCenter: string;
	totalBudget: string;
	totalConsumed: string;
	appliedAmount: string;
	leftOver: string;
	customFields: { [key: string]: string };
	tags: string[];
	status: 'draft' | 'pending' | 'approved' | 'completed' | 'declined' | 'review';
	creator?: string;
	meta?: string;
	fayad_approval: boolean;
	ayed_approval: boolean;
	sultan_approval: boolean;
	ekhatib_approval: boolean;
	finance_approval: boolean;
	transaction_number?: string;
}
```

### Supabase Table: `pos`

- **Columns**:
	- `id` (string, PK)
	- `poNumber` (string)
	- `date` (string)
	- `location` (string)
	- `department` (string)
	- `purposeEnglish` (string)
	- `purposeArabic` (string)
	- `beneficiaryName` (string)
	- `amount` (string)
	- `status` (enum)
	- `tags` (array)
	- `customFields` (JSON)
	- `meta` (JSON)
	- `creator` (string)
	- Approval columns: `Fayad Approval`, `Ayed Approval`, `Sultan Approval`, `E.khatib Approval`, `Finance Approval` (boolean)
	- `transaction_number` (string)

### Supabase Storage: `attachments`

- All PO attachments are stored in a bucket named `attachments`, organized by PO number and file name. Public URLs are generated for each file.

### LocalStorage Usage

- **Company settings**: `companySettings` key stores company name, address, logo, and location options.
- **PO drafts**: `pos` key stores unsaved or draft POs for offline support.
- **User preferences**: `settings` key stores language, theme, and other UI preferences.

---

## Project Logic & Flow

### 1. Initialization

- **main.tsx** mounts the app and loads global styles.
- **App.tsx** sets up providers (React Query, Toast, Tooltip), and React Router routes.
- On first load, the user is prompted to select their account type (HR, Finance, Engineers, Project Management). This is stored in localStorage for persistence.

### 2. Dashboard (Index.tsx)

- Loads all POs from Supabase (`fetchAllPOsFromSupabase`).
- Filters and sorts POs by search, status, and tags. Filtering logic is fully reactive and supports multi-criteria.
- Displays PO stats (total, pending, approved, drafts) with color-coded indicators.
- Renders PO cards (`POCard`) and approval tables (`ApprovalsTable`, `CloseableApprovalsSection`).
- Finance users see only POs pending finance approval and can approve/decline/review with transaction number.
- Users can export all visible POs to Excel (`exportPOsToExcel`).
- All actions are accompanied by toast notifications for feedback.

### 3. PO Creation/Editing (POForm.tsx)

- User selects PO type (normal or extra-table). Dialog guides the user through the process.
- Form fields include bilingual purpose, cost center, budget, custom fields, and attachments. All fields are validated before save.
- Autocomplete for beneficiary name and Arabic purpose (hooks fetch suggestions from Supabase/localStorage).
- Attachments are uploaded to Supabase Storage (`uploadAttachment`). Upload progress and errors are handled gracefully.
- On save:
	- If draft, PO is saved locally and to Supabase with status 'draft'.
	- If published, status is 'pending' and PO is sent for approval.
- Approval section allows digital signatures/comments for each role. All changes are persisted.
- Company settings (logo, name, address, locations) are editable via dialog and saved to localStorage.
- Print PO or attachments as PDF using `PrintButton` and `PrintAttachmentsButton`. Print layouts are optimized for A4.

### 4. PO Viewing (POView.tsx)

- Read-only view of PO details, including all fields and attachments.
- Print and edit options available. Print opens a new window with a print-optimized layout.
- Attachments can be previewed (image, PDF, or download). All file types are supported.

### 5. Approval Workflow

- Each PO has boolean flags for each approver (HR, Engineers, Project Management, Finance). Approval status is shown in the dashboard and approval tables.
- Approvers can sign off via the dashboard or approval table. Only the correct user/role can approve their column.
- Finance can only approve POs that have all prior approvals. Logic is enforced in both UI and backend.
- Approval actions update Supabase via the `/api/po-approve` endpoint. All updates are atomic and error-checked.

### 6. Data Model

- **POData** (see `types/po.ts`):
	- id, poNumber, date, location, department, purposeEnglish, purposeArabic, beneficiaryName, amount, status, tags, customFields, approvals, meta, attachments, etc.
- All POs are stored in Supabase (table: `pos`), with meta/custom fields as JSON.
- Attachments are stored in Supabase Storage (bucket: `attachments`).

---

## UI/UX & User Flows

- **Account Type Selection**: On first visit, user selects their role (HR, Finance, Engineers, Project Management). This determines dashboard view and permissions.
- **Dashboard**: Shows all POs relevant to the user, with filters, search, and stats. Actions are contextual (e.g., only finance can approve finance POs).
- **PO Form**: Guided, step-by-step form for creating/editing POs. All fields are labeled in both English and Arabic. Attachments can be added, previewed, and printed.
- **Approval Table**: Shows all POs and their approval status for each role. Only the correct user can approve their column.
- **Settings Dialog**: Allows company branding, logo upload, and location management. All changes are persisted to localStorage.
- **Print/Export**: All print and export actions are optimized for A4 and Excel. Attachments can be combined into a single PDF for printing.
- **Accessibility**: All components are keyboard accessible and support screen readers. RTL/LTR switching is automatic based on language.

---

## Error Handling & Best Practices

- **API Errors**: All API calls (Supabase, Gemini, MyMemory) are wrapped in try/catch and show user-friendly error messages via toasts.
- **Form Validation**: All required fields are validated before save. Invalid fields are highlighted and error messages are shown.
- **Attachment Uploads**: Upload progress is tracked, and errors are handled gracefully. Users are notified if an upload fails.
- **LocalStorage Fallback**: If Supabase is unavailable, POs can be saved as drafts in localStorage and synced later.
- **Extensibility**: All components are modular, typed, and accept props for customization. Adding new fields, roles, or export formats is straightforward.
- **Security**: All sensitive actions (approval, deletion) require confirmation. Supabase rules should be configured to restrict access by role.
- **Performance**: Uses React Query for async state, code splitting, and optimized rendering for large PO lists.

---

## Usage Examples

### Creating a New PO

1. Go to the dashboard and click "New Payment Order".
2. Fill in all required fields (purpose, beneficiary, amount, etc.).
3. Add attachments if needed. Supported file types: PDF, PNG, JPG, etc.
4. Save as draft or publish for approval. Drafts are saved locally and can be edited later.

### Approving a PO

1. Log in as the appropriate approver (HR, Engineer, etc.).
2. Find the PO in the dashboard or approvals table.
3. Click the approve button for your role. Only your column is enabled.
4. Finance can enter a transaction number and approve/decline/review. All actions are logged and reflected in the UI.

### Exporting/Printing

- Use the "Export to Excel" button to download all visible POs. The export includes all key fields and is formatted for reporting.
- Use the "Print PO" or "Print Attachments Only" buttons for PDF output. Print layouts are optimized for A4 and include company branding.

---

## Configuration & Environment

- **Supabase**: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` in your environment variables. These are used in `integrations/supabase/client.ts`.
- **Google Gemini API**: Set your API key in `src/utils/gemini.ts` for AI suggestions. The key is required for the Gemini endpoint.
- **MyMemory API**: Used for translation, no API key required. All requests are free and anonymous.
- **LocalStorage**: Used for company settings, PO drafts, and user preferences. All keys are documented in `poUtils.ts`.

---

## Extending the System

- **Add new PO fields**: Update `types/po.ts` and `CustomizableTable.tsx`. All new fields will be automatically included in exports and forms.
- **Add new approval roles**: Update `types/po.ts`, `ApprovalsTable.tsx`, and approval logic. The system is designed to support arbitrary roles.
- **Add new export formats**: Extend `excelExport.ts` or add new utils. The export logic is modular and easy to extend.
- **Add new languages**: Extend `translator.ts` and UI components. All text is already structured for i18n.
- **Integrate with other backends**: Replace Supabase functions in `poSupabase.ts` with your own API calls.

---

## Credits

- Built with React, TypeScript, Vite, TailwindCSS, Supabase, Radix UI, and more.
- For questions or contributions, see the repository or contact the maintainer.
