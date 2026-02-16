import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private snackBar = inject(MatSnackBar);

  show(message: string, type: 'success' | 'error' | 'warning', action: string = '✖'): void {
    const panelClassMap = {
      success: 'snackbar-success',
      error: 'snackbar-error',
      warning: 'snackbar-warning'
    };

    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: [panelClassMap[type]],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
