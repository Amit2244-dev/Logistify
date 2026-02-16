import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { changePassword } from '../../models/user.model';
import { UserServices } from '../../services/user/user-services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackbarService } from '../../common/utils/snackbar';
import { AuthService } from '../../services/auth/auth-service';
import { PASSWORD_UPDATE_ERROR, PASSWORD_UPDATE_SUCCESS } from '../../common/constants/message';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.html',
  styleUrls: ['./update-password.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class UpdatePassword {
  passwordForm: FormGroup;
  formSubmitted = false;
  hideOldPassword = true;
  showOldEyeIcon = false;
  isLoading = false;

  hideNewPassword = true;
  showNewEyeIcon = false;

  hideConfirmPassword = true;
  showConfirmEyeIcon = false;

  constructor(
    private fb: FormBuilder,
    public userServices: UserServices,
    public authService: AuthService,
    private snackbarService: SnackbarService

  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, {
      validator: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.passwordForm.valid) {
      const updatedData: changePassword = {
        oldPassword: this.passwordForm.get('oldPassword')?.value || '',
        newPassword: this.passwordForm.get('newPassword')?.value || '',
        confirmPassword: this.passwordForm.get('confirmPassword')?.value || '',
      };
      this.isLoading = true;
      this.userServices.updatePassword(updatedData).subscribe({
        next: () => {
          const { message, status, icon } = PASSWORD_UPDATE_SUCCESS;
          this.snackbarService.show(message, status, icon);
          this.authService.logout();
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          const { message, status, icon } = PASSWORD_UPDATE_ERROR;
          this.snackbarService.show(err?.message || message, status, icon);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
  onInputChange(field: string): void {
    const value = this.passwordForm.get(field)?.value;

    switch (field) {
      case 'oldPassword':
        this.showOldEyeIcon = !!value;
        break;
      case 'newPassword':
        this.showNewEyeIcon = !!value;
        break;
      case 'confirmPassword':
        this.showConfirmEyeIcon = !!value;
        break;
    }
  }

  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'oldPassword':
        this.hideOldPassword = !this.hideOldPassword;
        break;
      case 'newPassword':
        this.hideNewPassword = !this.hideNewPassword;
        break;
      case 'confirmPassword':
        this.hideConfirmPassword = !this.hideConfirmPassword;
        break;
    }
  }
}
