# Web Automation Setup Guide

- **Install vscode extensions**
  1. Open Extensions panel (Ctrl+Shift+X)
  2. Search for `@recommended`

### CONNECTING TO CLIENT'S REPOSITORY (Manual Step)

# 1. Make sure you are in folder with client's project

if not use command:

```Powershell
cd client-project-name
```

# 2. Add remote connection

Option A

# HTTPS (if you use login and password):

```PowerShell
git remote add origin https://gitlab.com/client/project-tests.git
```

Option B

# SSH (if configured):

```PowerShell
git remote add origin git@gitlab.com:client-x/project-tests.git
```

# 3. Push files to server:

git add .
git commit -m "Initial commit: Project setup based on Framework v1.0"
git push -u origin main

(Note: If the main branch is named master, use origin master)

### Modify the .env file

Uncomment lines in .env file and set BASE_URL and login users.

⚠️ Note: Single quotes (') are not allowed in .env files.
Use plain text values without quotes.

**Example:**
BASE_URL=https://your-org-name--sandbox.lightning.force.com/one/one.app

##Admin
USER_ADMIN3=adminLogin

##Editor
USER_EDITOR10=eidtorLogin

##Password the same for all users
PASS=editorPassword

### 👥 Multi-User Testing Strategy

This project uses **Playwright Fixtures** to handle authenticated sessions for different roles. Instead of logging in manually in every test, you can request a pre-authenticated `Page` object.

#### 🔑 Available Roles

All roles are defined in `fixtures/users.fixture.ts`. Currently available:

- `adminUser`
- `editorUser`

---

#### 1️⃣ Single User Test

To run a test as a specific user, include the role's fixture in your test arguments. Use the `Page` object to initialize your Page Object Model (POM) classes.

```typescript
import { test, expect } from './fixtures/users.fixture';
import { HomePage } from '../src/pages/homePage';

test('Editor checks dashboard visibility', async ({ editorUser }) => {
  const home = new HomePage(editorUser);


  // You can use POM methods or direct locators
  await expect(home.navbarBrand).toBeVisible();
  await expect(editorUser.locator('.user-profile')).toBeVisible();
});

#### 2️⃣ Multi-User Workflow (Cross-Role Testing)
You can request multiple fixtures in a single test to simulate interactions between different users. Playwright will handle separate browser contexts (separate windows) for each user.


import { test, expect } from './fixtures/users.fixture';
import { DocumentPage } from '../src/pages/documentPage';

test('Admin creates a record, Editor verifies it', async ({ adminUser, editorUser }) => {
  const adminDocPage = new DocumentPage(adminUser);
  const editorDocPage = new DocumentPage(editorUser);

  // 1. Admin Action
  await adminUser.goto('/ui/');
  await adminDocPage.createDocument('DOC-2026-X');

  // 2. Editor Action

  await expect(editorUser.locator('text=DOC-2026-X')).toBeVisible();
});
```

## 💡 Key Principles

Session Reuse: Authentication is performed once in the setup phase and saved to playwright/.auth/.

Isolated Contexts: Each user fixture provides a completely isolated environment. No "leaking" of sessions between Admin and Editor.

Flexible POM: We pass the User (Page object) to the POM constructor: new HomePage(editorUser). This allows any Page Object to work with any logged-in user dynamically.

## 🧠 Decision log

Purpose: Record key design decisions and conventions used in this project.

💡 **Use predefined helpers if possible** from `base.page.ts` instead of direct Playwright locators.  
Helps maintain consistent naming and easier locator updates.

**Example:**

```ts
// ✅ Correct usage
loginPage.button('Zapisz');

// ❌ Incorrect usage
page.getByRole('button', { name: 'Zapisz' });
```
