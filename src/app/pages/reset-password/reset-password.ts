import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserServices } from '../../services/user/user-services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '../../models/user.model';
import { SnackbarService } from '../../common/utils/snackbar';
import { PASSWORD_UPDATE_ERROR, PASSWORD_UPDATE_SUCCESS } from '../../common/constants/message';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPassword implements OnInit {
  @Output() onClose = new EventEmitter<void>();
  @Output() onLoginTrigger = new EventEmitter<void>();
  @Input() title?: boolean;

  changePasswordForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private userServices: UserServices,
    private snackbarService: SnackbarService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.changePasswordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
      ]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.matchPasswords });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  get f() {
    return this.changePasswordForm.controls;
  }

  private matchPasswords(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  handleSubmit(event?: Event): void {
    event?.preventDefault();
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const passwordData = {
      password: this.f['password'].value,
      confirmPassword: this.f['confirmPassword'].value,
    } as User;

   this.userServices.changePassword(passwordData, this.token).subscribe({
  next: () => {
    const { message, status, icon } = PASSWORD_UPDATE_SUCCESS;
    this.isLoading = false;
    this.snackbarService.show(message, status, icon);
    this.onClose.emit();
    this.router.navigate(['/allEmails']);
  },
  error: (error) => {
    const { message, status, icon } = PASSWORD_UPDATE_ERROR;
    this.isLoading = false;
    this.snackbarService.show(error?.message || message, status, icon);
  }
});
  }
}
