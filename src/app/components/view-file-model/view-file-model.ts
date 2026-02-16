import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ViewFile } from '../../models/file.model';

@Component({
  selector: 'app-view-file-model',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './view-file-model.html',
  styleUrl: './view-file-model.css'
})
export class ViewFileModel {

  @Output() close = new EventEmitter<void>();
  @Input() initialData: Partial<ViewFile> = {};
  @Input() isloading: Boolean = false;
  @Output() save = new EventEmitter<string>();

  onClose() {
    this.close.emit();
  }

  onFileClick(fileName: string | undefined) {
    this.save.emit(fileName);
  }

}
