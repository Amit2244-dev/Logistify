import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth-service';
import {
  EMAIL_TOKEN_MISSING,
  EMAIL_VERIFY_FAILED,
  EMAIL_VERIFY_SUCCESS,
} from '../../common/constants/message';
import { CommonModule } from '@angular/common';
import { Signup } from '../../components/signup/signup';
import { OrganizationsServices } from '../../services/organizations/organizations-services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface SuccessLogo {
  logo: string;
}

@Component({
  selector: 'app-email-verification-success',
  standalone: true,
  imports: [CommonModule, Signup, MatProgressSpinnerModule],
  templateUrl: './email-verification-success.html',
  styleUrls: ['./email-verification-success.css'],
})
export class EmailVerificationSuccess implements OnInit {
  sidebarTopBottom: SuccessLogo = {
    logo: 'assets/images/sidebar/logo.png',
  };

  message: string = '';
  messageClass: string = '';
  redirectPath: string = '/allEmails';
  currentPath: string = '';
  isSignupOpen: boolean = false;
  token: string = '';
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authServices: AuthService,
    private router: Router,
    private organizationSVC: OrganizationsServices
  ) { }

  ngOnInit(): void {
    this.currentPath = this.route.snapshot.routeConfig?.path ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (this.currentPath === 'verify-email') {
      this.redirectPath = '/allEmails';
    } else if (this.currentPath === 'invited-user') {
      this.isSignupOpen = true;
    }

    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      const token = params['token'];

      if (!token) {
        this.message = `${EMAIL_TOKEN_MISSING.icon} ${EMAIL_TOKEN_MISSING.message}`;
        this.messageClass = 'text-red-500';
        return;
      }

      let successMsg = EMAIL_VERIFY_SUCCESS;
      let failedMsg = EMAIL_VERIFY_FAILED;

      if (this.currentPath === 'verify-email') {
        this.loading = true
        this.authServices.verifyEmail({ token }).pipe(take(1)).subscribe({
          next: () => {
            this.message = `${successMsg.icon} ${successMsg.message}`;
            this.messageClass = 'text-green-500';
            this.loading = false
            setTimeout(() => {
              this.router.navigate([this.redirectPath]);
            }, 1000);

          },
          error: (error) => {
            const fallbackMessage = `${failedMsg.icon} ${failedMsg.message}`;
            this.message = error?.message ? error.message : fallbackMessage;
            this.messageClass = 'text-red-500';
            this.loading = false
          },
        });
      } else if (this.currentPath === 'invited_user') {
        this.loading = true
        this.organizationSVC.verifyInvitation({ token }).pipe(take(1)).subscribe({
          next: () => {
            this.message = `${successMsg.icon} Token is successfully varified`;
            this.messageClass = 'text-green-500';
            this.isSignupOpen = true;
            this.loading = false
          },
          error: (error) => {
            const fallbackMessage = `${failedMsg.icon} ${failedMsg.message}`;
            this.message = error?.message ? ` ${error.message}` : fallbackMessage;
            this.messageClass = 'text-red-500';
            this.isSignupOpen = false;
            this.loading = false
          },
        });
      } else {
        this.message = 'Invalid verification path';
        this.messageClass = 'text-red-500';
        return;
      }
    });
  }

  triggerLogin(): void {
    this.router.navigate([this.redirectPath]);
  }
}
