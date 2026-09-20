import {inject, Injectable} from '@angular/core';
import {PynoDatepickerDateObject, PynoDatepickerDayOfWeek} from './pyno-datepicker.type';
import {PynoDateService} from 'pyno-date';
@Injectable({
  providedIn: 'root',
})
export class PynoDatepickerService {
  private firstDayOfWeek: PynoDatepickerDayOfWeek = 'sunday';
  date = inject(PynoDateService);
  gWeekDays: Record<PynoDatepickerDayOfWeek, string> = {
    sunday: 'Su',
    monday: 'Mo',
    tuesday: 'Te',
    wednesday: 'We',
    thursday: 'Th',
    friday: 'Fr',
    saturday: 'Sa',
  };
  jWeekDays: Record<PynoDatepickerDayOfWeek, string> = {
    sunday: 'ی',
    monday: 'د',
    tuesday: 'س',
    wednesday: 'چ',
    thursday: 'پ',
    friday: 'ج',
    saturday: 'ش',
  };
  gMonths: Record<number, string> = {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December',
  };
  jMonths: Record<number, string> = {
    1: 'فروردین',
    2: 'اردیبهشت',
    3: 'خرداد',
    4: 'تیر',
    5: 'مرداد',
    6: 'شهریور',
    7: 'مهر',
    8: 'آبان',
    9: 'آذر',
    10: 'دی',
    11: 'بهمن',
    12: 'اسفند',
  };
  setFirstDayOfWeek(day: PynoDatepickerDayOfWeek) {
    this.firstDayOfWeek = day;
  }
  calcWeekdays(cal: 'gregorian' | 'jalali') {
    const days: PynoDatepickerDayOfWeek[] = Object.keys(
      (cal === 'gregorian' ? this.gWeekDays: this.jWeekDays),
    ) as PynoDatepickerDayOfWeek[];
    while (days[0] !== this.firstDayOfWeek) {
      const first = days.shift()!;
      days.push(first);
    }
    return days;
  }
  getWeekdayName(item: PynoDatepickerDayOfWeek, cal: 'gregorian' | 'jalali') {
    if(cal === 'gregorian')
      return this.gWeekDays[item];
    return this.jWeekDays[item];
  }
  calcDays(
    date: PynoDatepickerDateObject,
    cal: 'gregorian' | 'jalali',
    weekdays: PynoDatepickerDayOfWeek[],
  ) {
    let firstDateTime = 0;
    if (cal === 'gregorian') {
      const firstDate = date.gYear + '-' + date.gMonth + '-01';
      firstDateTime = this.date.strToTime(firstDate)!;
    } else {
      const fdo = this.date.jalaliToGregorian(+date.jYear, +date.jMonth, 1);
      firstDateTime = this.date.strToTime(fdo.gYear + '-' + fdo.gMonth + '-' + fdo.gDay)!;
    }
    const firstDateWeekday = this.date.gDate('l', firstDateTime).toLowerCase();
    const numberOfPreDays = weekdays.findIndex((q: string) => q === firstDateWeekday);
    const startingTime = firstDateTime - numberOfPreDays * 86400;
    const output: PynoDatepickerDateObject[] = [];
    for (let i = 0; i < 42; i++) {
      const time = startingTime + i * 86400;
      output.push(this.getDateObject(time));
    }
    return output;
  }
  getDateObject(timestamp: number): PynoDatepickerDateObject {
    const g = this.date.gDate('Y_n_j_l', timestamp).split('_');
    const j = this.date.jDate('Y_n_j', timestamp).split('_');
    return {
      gYear: g[0],
      gMonth: g[1],
      gDay: g[2],
      gDate: this.date.gDate('Y-m-d', timestamp),
      jYear: j[0],
      jMonth: j[1],
      jDay: j[2],
      jDate: this.date.jDate('Y/m/d', timestamp),
      timestamp: timestamp,
      weekday: g[3].toLowerCase(),
    };
  }
  setWeekdayName(calendar: 'jalali' | 'gregorian', weekday: PynoDatepickerDayOfWeek, name: string){
    if(calendar === 'gregorian'){
      this.gWeekDays[weekday] = name;
    } else {
      this.jWeekDays[weekday] = name;
    }
  }
  setMonthName(calendar: 'jalali' | 'gregorain', month: number, name: string){
    if(calendar === 'gregorain'){
      if(month in this.gMonths){
        this.gMonths[month] = name;
      }
    } else {
      if (month in this.jMonths) {
        this.jMonths[month] = name;
      }
    }
  }
}
