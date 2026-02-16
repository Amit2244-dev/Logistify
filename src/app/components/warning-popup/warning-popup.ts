import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CONFIRM_ADD_EMAIL_ACCOUNT } from '../../common/constants/message';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { EmailAddress } from '../../models/email.model';
import { EMAIL_PROVIDERS } from '../../common/constants/constant';
import { FormsModule } from '@angular/forms';
import { f } from "../../../../node_modules/@angular/material/icon-module.d-COXCrhrh";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-warning-popup',
  standalone: true,
  imports: [MatSelectModule, CommonModule, FormsModule, MatIconModule],
  templateUrl: './warning-popup.html',
  styleUrls: ['./warning-popup.css']
})
export class WarningPopup {
  @Input() title: string = 'Warning';
  @Input() message: string = CONFIRM_ADD_EMAIL_ACCOUNT.message;
  @Input() displayDD: boolean = false;
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  selectedEmailType: string = 'outlook';
  filteredEmailAccounts: EmailAddress[] = EMAIL_PROVIDERS;

  onConfirm() {
    this.confirm.emit(this.selectedEmailType);
  }

  onCancel() {
    this.cancel.emit();
  }
}
