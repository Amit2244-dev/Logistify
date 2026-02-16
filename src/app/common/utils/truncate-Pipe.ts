import { Pipe, PipeTransform } from '@angular/core';
import { TextLimit } from '../enums/enums';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe {
  transform(value: string, limit: number = TextLimit.Default): string {
    if (!value) return '';
    return value.length > limit ? value.slice(0, limit) + '...' : value;
  }
}
