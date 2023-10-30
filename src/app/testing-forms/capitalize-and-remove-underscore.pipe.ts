import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeAndRemoveUnderscore',
})
export class CapitalizeAndRemoveUnderscorePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return value;
    }

    const words = value.split('_');
    const capitalizedWords = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return capitalizedWords.join(' ');
  }
}
