import { AfterViewInit, Component } from '@angular/core';
import { Sidebar } from './sidebar/sidebar';
// import { Footer } from './footer/footer';
// import { Header } from './header/header';
import { Router, RouterOutlet } from '@angular/router';
import { SessionService } from '../services/session/session-services';
import { EmailServices } from '../services/email/email-services';
import { UserServices } from '../services/user/user-services';
import { AuthService } from '../services/auth/auth-service';
import { UserStoreService } from '../core/userStore';
import { Subscription } from 'rxjs';
import { UpdateUser } from '../models/user.model';
import { EmailQueryParams } from '../models/email.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [Sidebar, RouterOutlet, MatProgressSpinnerModule, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  user: UpdateUser | null = null;
  private userSubscription: Subscription | undefined;
  isLoadingUser = true;
  timmer = 2000;
  filters: EmailQueryParams = {
    page: 1, limit: 10, search: '', sortOrder: '', sortBy: '', startDate: '', endDate: '',
    emailAccount: '', emailStatus: '',
    searchKeys: {},
  };

  constructor(
    public sessionService: SessionService,
    private router: Router,
    private emailSvc: EmailServices,
    private userServices: UserServices,
    private authService: AuthService,
    private userStore: UserStoreService,
  ) {
    this.checkUserIsLogined();
  }

  checkUserIsLogined() {
    this.isLoadingUser = true;
    this.userSubscription = this.userStore.user$.subscribe(user => {
      this.user = user;
      if (!user) {
        const accessToken = this.sessionService.getAccessToken();
        const refreshToken = this.sessionService.getRefreshToken();
        if (accessToken && accessToken !== "false") {
          this.isLoadingUser = false;
          this.userServices.getUserDetail().subscribe({
            next: user => {
              this.userStore.setUser(user);
              this.isLoadingUser = false;
              this.fetchEmailAccounts();
            },
            error: err => {
              console.error('User fetch failed with access token:', err);
              this.isLoadingUser = false;
            }
          });
        } else if (refreshToken && refreshToken !== "false") {
          this.authService.refreshToken().subscribe({
            next: () => {
              this.userServices.getUserDetail().subscribe({
                next: user => {
                  this.userStore.setUser(user);
                  this.isLoadingUser = false;
                  this.fetchEmailAccounts();
                },
                error: err => {
                  console.error('User fetch failed after token refresh:', err);
                  this.authService.logout();
                  this.userStore.clearUser();
                  this.isLoadingUser = false;
                }
              });
            },
            error: err => {
              console.error('Token refresh failed:', err);
              this.authService.logout();
              this.userStore.clearUser();
              this.isLoadingUser = false;
            }
          });
        } else {
          this.isLoadingUser = false;
        }
      } else {
        this.isLoadingUser = false;
      }
    });
  }

  fetchEmailAccounts(): void {
    this.emailSvc.getAllEmailAccounts(this.filters).subscribe({
      next: ({ data = [] }) => {
        const seen = new Set();
        const uniqueEmails = data
          .filter(e => e.email && !seen.has(e.email) && seen.add(e.email))
          .map(e => ({
            value: e.email,
            viewValue: e.email,
            provider: e.provider,
            expiresAt: e.expiresAt,
            isConnected: e.isConnected,
            customEmailReplyPrompt: e.customEmailReplyPrompt
          }));

        this.userStore.setEmailAccounts(uniqueEmails);
      },
      error: (err) => {
        console.error('User fetch failed after token refresh:', err);
        this.userStore.clearEmailAccounts();
      }
    });
  }
}
