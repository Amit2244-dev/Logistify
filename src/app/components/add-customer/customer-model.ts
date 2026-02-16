import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AddCustomerPayload, Contact, Customer } from '../../models/customer.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-customer-model',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './customer-model.html',
  styleUrls: ['./customer-model.css'],
})
export class CustomerModel implements OnInit {
  @Input() initialData: Partial<Customer> = {};
  @Input() header: string = 'Add';
  @Input() errorMsg: Array<string> = [];
  @Input() isLoading: boolean = false
  @Output() save = new EventEmitter<AddCustomerPayload>();
  @Output() close = new EventEmitter<void>();

  companyForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.companyForm = this.fb.group({
      companyName: ['', Validators.required],
      companyAddress: ['', Validators.required],
      contacts: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.companyForm.patchValue({
      companyName: this.initialData.companyName,
      companyAddress: this.initialData.companyAddress,
    });
    this.initialData.contacts?.forEach((c) => this.addContact(c));
    if (this.header === 'Add') this.addContact(); // Default one
  }

  get companyName(): FormControl {
    return this.companyForm.get('companyName') as FormControl;
  }

  get companyAddress(): FormControl {
    return this.companyForm.get('companyAddress') as FormControl;
  }

  get contacts(): FormArray {
    return this.companyForm.get('contacts') as FormArray;
  }

  addContact(contacts?: Contact) {
    const group = this.fb.group({
      fullName: [contacts?.fullName || '', Validators.required],
      phoneNumber: [
        contacts?.phoneNumber || '',
        [
          Validators.required,
          Validators.pattern(/^\+?[1-9]\d{9,14}$/)
        ]
      ],
      email: [contacts?.email || '', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      sendNotification: [contacts?.sendNotification || false],
    });
    this.contacts.push(group);
  }

  removeContact(index: number) {
    this.contacts.removeAt(index);
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.companyForm.value);
  }
}
