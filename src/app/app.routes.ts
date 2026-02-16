import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { EmailListPages } from './pages/email-list-pages/email-list-pages';
import { Settings } from './pages/settings/settings';
import { AuthGuard } from './core/auth-gaurd';
import { ResetPassword } from './pages/reset-password/reset-password';
import { EmailVerificationSuccess } from './pages/email-verification-success/email-verification-success';
import { CustomersPage } from './pages/customers-page/customers-page';
import { FileListPages } from './pages/file-list-pages/file-list-pages';
import { AccountSummaryPage } from './pages/account-overview-page/account-summary-page';
import { OrganizationsListPages } from './pages/organizations-list-pages/organizations-list-pages';
import { FilePromptResponse } from './pages/file-prompt-response/file-prompt-response';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        component: Dashboard
      },
      {
        path: 'allEmails',
        component: EmailListPages,
        canActivate: [AuthGuard]  // Protected route
      },
      {
        path: 'customers',
        component: CustomersPage,
        canActivate: [AuthGuard]  // Protected route
      },
      {
        path: 'files',
        component: FileListPages,
        canActivate: [AuthGuard]  // Protected route
      },
      {
        path: 'knowledgeBase',
        component: FilePromptResponse,
        canActivate: [AuthGuard]  // Protected route
      },
      {
        path: 'accountOverview',
        component: AccountSummaryPage,
        canActivate: [AuthGuard]  // Protected route
      },
      {
        path: 'organizations',
        component: OrganizationsListPages,
        canActivate: [AuthGuard]  // Protected route
      },
      {
        path: 'settings',
        component: Settings,
        canActivate: [AuthGuard]  // Protected route
      }
    ]
  },
  {
    path: 'reset-password',
    component: ResetPassword
  },
  {
    path: 'verify-email',
    component: EmailVerificationSuccess
  },
  {
    path: 'invited_user',
    component: EmailVerificationSuccess
  }
];
