import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'DurationFormat'
})
export class DurationFormatPipe implements PipeTransform {
  transform(val) {

    if ( val < 1000 ) {
      return ' -- ';
    } else {
      // const milliseconds = val % 1000;
      val = val / 1000;
      // const seconds = val.toFixed(0) % 60;
      val = val / 60;
      const minutes = val.toFixed(0) % 60;
      val = val / 60;
      const hours = val.toFixed(0) % 24;
      val = val / 24
      const days = val.toFixed(0);
      const arr = [];
      if ( days > 0 ) {
        arr.push(days + ' Days');
      }
      if ( hours > 0 ) {
        arr.push(hours + ' Hours');
      }
      if ( minutes > 0 ) {
        arr.push(minutes + ' Minutes');
      }
      return arr.join(', ');
    }
  }
}
