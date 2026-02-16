import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ai-input-model',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './ai-input-model.html',
  styleUrl: './ai-input-model.scss'
})
export class AiInputModel {
  @Input() privData: string = '';
  @Output() onClose = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<string>();

  get plainTextData(): string {
    if (!this.privData) return '';
    return this.privData
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  handleClose(): void {
    this.onClose.emit();
  }

  onSubmit(): void {
    this.save.emit(this.privData);
    this.onClose.emit();
  }
}
