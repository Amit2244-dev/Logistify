import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';

import { SnackbarService } from '../../common/utils/snackbar';
import { AuthService } from '../../services/auth/auth-service';
import { UserServices } from '../../services/user/user-services';
import { UserStoreService } from '../../core/userStore';
import { LOGIN_PROFILE_LOAD_FAILED, LOGIN_SUCCESS, OTP_OR_TOKEN_MISSING, OTP_RESEND_FAILED, OTP_RESENT_SUCCESS, OTP_VERIFICATION_FAILED, OTP_VERIFIED_SUCCESS, TEMP_TOKEN_NOT_FOUND } from '../../common/constants/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-two-factor-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './two-factor-auth.html',
  styleUrls: ['./two-factor-auth.css']
})
export class TwoFactorAuth implements OnInit, OnDestroy {
  otp = '';
  isOpen = true;
  isVerifying = false;
  isResendOtp = false;
  resendCountdown = 60;
  canResend = false;
  private countdownInterval?: number;

  @ViewChild('otpInput') otpInput!: ElementRef;

  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private authService: AuthService,
    private userService: UserServices,
    private userStore: UserStoreService
  ) { }

  ngOnInit(): void {
    this.startResendTimer();
    // optional: autofocus OTP input
    setTimeout(() => {
      this.otpInput?.nativeElement?.focus();
    }, 100);
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
  }

  close(): void {
    this.isOpen = false;
  }

  startResendTimer(): void {
    clearInterval(this.countdownInterval);
    this.canResend = false;
    this.resendCountdown = 60;

    this.countdownInterval = window.setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(this.countdownInterval);
        this.canResend = true;
      }
    }, 1000);
  }

  resendOtp(): void {
    const tempToken = this.userStore.getTempToken();
    if (!tempToken) {
      const { message, status } = TEMP_TOKEN_NOT_FOUND;
      this.snackbarService.show(message, status);
      return;
    }

    this.isResendOtp = true;

    this.authService.resendOtp({
      otp: '',
      tempToken: tempToken,
      access_token: '',
      refresh_token: '',
      rememberMe_token: ''
    }).pipe(finalize(() => this.isResendOtp = false))
      .subscribe({
        next: () => {
          const { message, status, icon } = OTP_RESENT_SUCCESS;
          this.snackbarService.show(message, status, icon);
          this.startResendTimer();
        },
        error: err => {
          const { message, status, icon } = OTP_RESEND_FAILED;
          this.snackbarService.show(err?.message || message, status, icon);
        }
      });
  }

  verifyOtp(): void {
    const tempToken = this.userStore.getTempToken();
    if (!this.otp || !tempToken) {
      const { message, status, icon } = OTP_OR_TOKEN_MISSING;
      this.snackbarService.show(message, status, icon);
      return;
    }

    this.isVerifying = true;

    this.authService.verifyTwoFactorOtp({
      otp: this.otp,
      tempToken: tempToken,
      access_token: '',
      refresh_token: '',
      rememberMe_token: ''
    }).pipe(finalize(() => this.isVerifying = false))
      .subscribe({
        next: () => {
          const { message, status, icon } = OTP_VERIFIED_SUCCESS;
          this.snackbarService.show(message, status, icon);

          this.userService.getUserDetail().subscribe({
            next: (profile) => {
              this.userStore.setUser(profile);
              this.userStore.clearTempToken();

              const { message, status, icon } = LOGIN_SUCCESS;
              this.snackbarService.show(message, status, icon);
              this.close();
              this.router.navigate(['/allEmails']);
            },
            error: (err) => {
              const { message, status } = LOGIN_PROFILE_LOAD_FAILED;
              this.snackbarService.show(err?.message || message, status);
            }
          });
        },
        error: (err) => {
          const { message, status, icon } = OTP_VERIFICATION_FAILED;
          this.snackbarService.show(err?.message || message, status, icon);
        }
      });
  }

}
