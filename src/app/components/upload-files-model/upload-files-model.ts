import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface UploadedFile {
  [x: string]: any;
  name: string;
  type: string;
  size: number;
  file: File;
  fileName?: string;
  createdAt?: string;
  emailAccount?: string;
  aiGeneratedResponse?: string

}

@Component( {
  selector: 'app-upload-files-model',
  templateUrl: './upload-files-model.html',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  styleUrls: ['./upload-files-model.css']
} )
export class UploadFilesModel {
  @Output() filesUploaded = new EventEmitter<UploadedFile[]>();
  @Output() onClose = new EventEmitter<boolean>();
  @Input() isloading: Boolean = false;

  files: UploadedFile[] = [];
  isDragging = false;
  errorMessage = '';

  private allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];

  onDragOver( event: DragEvent ) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave( event: DragEvent ) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop( event: DragEvent ) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const droppedFiles = event.dataTransfer?.files;
    if ( droppedFiles ) {
      this.processFiles( droppedFiles );
    }
  }

  onFileSelected( event: Event ) {
    const input = event.target as HTMLInputElement;
    if ( input.files ) {
      this.processFiles( input.files );
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById( 'fileInput' ) as HTMLInputElement;
    fileInput.click();
  }

  private processFiles( fileList: FileList ) {
    this.errorMessage = '';
    const newFiles: UploadedFile[] = [];
    Array.from( fileList ).forEach( file => {
      if ( this.allowedFileTypes.includes( file.type ) ) {
        newFiles.push( {
          name: file.name,
          type: file.type,
          size: file.size,
          file: file
        } );
      } else {
        this.errorMessage = `File "${ file.name }" is not allowed. Only PDF, Word, Excel, TXT, and CSV files are permitted.`;
      }
    } );

    if ( newFiles.length > 0 ) {
      this.files = [...this.files, ...newFiles];
    }
  }

  onSubmit() {
    this.filesUploaded.emit( this.files );
  }

  removeFiles( index: number ) {
    this.files = this.files.filter( ( _, i ) => i !== index );
  }

  formatFileSize( bytes: number ): string {
    if ( bytes === 0 ) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor( Math.log( bytes ) / Math.log( k ) );
    return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( 2 ) ) + ' ' + sizes[i];
  }

  close(): void {
    this.onClose.emit();
  }
}
