import {
  AfterViewInit,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import {PynoDateService} from 'pyno-date';
import {PynoDatepickerService} from './pyno-datepicker.service';
import {PynoDatepickerDateObject, PynoDatepickerDayOfWeek} from './pyno-datepicker.type';

@Component({
  imports: [],
  selector: 'pyno-datepicker',
  styles: ``,
  templateUrl: './pyno-datepicker.html',
  styleUrl: './pyno-datepicker.css',
})
export class PynoDatepicker implements AfterViewInit {
  triggerFor = input<HTMLElement>();
  inline = input<boolean>(false);
  initValue = input<string | null | undefined>();
  secondCalendar = input<boolean>(false);
  today!: WritableSignal<PynoDatepickerDateObject>;
  selectedDate = signal<PynoDatepickerDateObject | null>(null);
  selectedMonth = signal('01');
  selectedYear = signal('0001');
  isOpen = signal(false);
  calendar = input<'gregorian' | 'jalali'>('gregorian');
  format = input('Y-m-d H:i:s');
  weekdays = signal<PynoDatepickerDayOfWeek[]>([]);
  monthDays = signal<PynoDatepickerDateObject[]>([]);
  outputAs = input<'object' | 'string'>('object');
  onInit = output<PynoDatepickerDateObject | string | null>();
  onSelect = output<PynoDatepickerDateObject | string>();
  todayBtnText = input<string>('Today');
  mode = signal<'days' | 'months' | 'years'>('days');
  yearPage = signal(0);
  month = computed(() => {
    const cal = this.calendar();
    const month = this.selectedMonth();
    if (cal === 'gregorian' && (+month) in this.datepickerService.gMonths) {
      return this.datepickerService.gMonths[+month];
    }
    if ((+month) in this.datepickerService.jMonths) return this.datepickerService.jMonths[+month];
    return '';
  });
  isCurrentMonth = computed(() => {
    const year = this.selectedYear();
    const month = this.selectedMonth();
    const cal = this.calendar();
    console.log('sdsdsdsdsdsd');
    if (cal === 'gregorian') {
      const [cy, cm] = this.dateService.gDate('Y_m').split('_');
      return +cm === +month && +cy === +year;
    } else {
      const [cy, cm] = this.dateService.jDate('Y_m').split('_');
      return +cm === +month && +cy === +year;
    }
  });
  datepickerService = inject(PynoDatepickerService);
  dateService = inject(PynoDateService);
  disableToday = input<boolean>(false);
  ngOnInit() {
    if (this.inline()) this.init();
    this.onInit.emit(this.output());
  }
  init() {
    this.handleInitValue();
    this.weekdays.set(this.datepickerService.calcWeekdays(this.calendar()));
    this.today = signal(
      this.datepickerService.getDateObject(
        this.dateService.strToTime(this.dateService.gDate('Y-m-d'))!,
      ),
    );
    const fromObj = this.selectedDate() ?? this.today();
    const cal = this.calendar();
    this.selectedMonth.set(cal === 'gregorian' ? fromObj.gMonth : fromObj.jMonth);
    this.selectedYear.set(cal === 'gregorian' ? fromObj.gYear : fromObj.jYear);
    this.monthDays.set(this.datepickerService.calcDays(fromObj, this.calendar(), this.weekdays()));
    console.log(this.monthDays());
  }

  private handleInitValue() {
    const initVal = this.initValue();
    const cal = this.calendar();
    if (initVal) {
      const converted = this.dateService.convert(
        initVal,
        this.format(),
        cal === 'jalali' ? 'Y-m-d' : 'Y/m/d',
        cal,
        'gregorian',
      );
      if (converted) {
        this.selectedDate.set(
          this.datepickerService.getDateObject(this.dateService.strToTime(converted)!),
        );
      }
    }
  }
  ngAfterViewInit() {
    const tf = this.triggerFor();
    if (!tf) return;
    tf.addEventListener('click', () => this.open());
  }
  open() {
    this.init();
    this.isOpen.set(true);
  }
  close() {
    this.isOpen.set(false);
  }
  onDate(item: PynoDatepickerDateObject) {
    this.selectedDate.set(item);
    this.onInit.emit(this.output());
    if (!this.inline()) this.close();
  }
  changeMonth(month: number, year: number) {
    if (month > 12) {
      month = 1;
      year++;
    } else if (month < 1) {
      month = 12;
      year--;
    }
    this.selectedMonth.set(String(month).padStart(2, '0'));
    this.selectedYear.set(String(year));
    let from = '';
    if (this.calendar() === 'gregorian') {
      from = this.selectedYear() + '-' + this.selectedMonth() + '-' + '15';
    } else {
      const jFrom = this.dateService.jalaliToGregorian(
        +this.selectedYear(),
        +this.selectedMonth(),
        15,
      );
      from = jFrom.gYear + '-' + jFrom.gMonth + '-' + jFrom.gDay;
    }
    const fromTime = this.dateService.strToTime(from)!;
    const fromObj = this.datepickerService.getDateObject(fromTime);
    this.monthDays.set(this.datepickerService.calcDays(fromObj, this.calendar(), this.weekdays()));
  }

  getSecondMonth(number: number) {
    const cal = this.calendar();
    let val = '';
    if (cal === 'gregorian') {
      val = this.datepickerService.jMonths[number];
    } else {
      val = this.datepickerService.gMonths[number];
    }
    return val.substring(0, 3);
  }
  output(): PynoDatepickerDateObject | string | null {
    const dateObj = this.selectedDate();
    if (!dateObj) return null;
    if (this.outputAs() === 'object') return dateObj;
    const format = this.format();
    const cal = this.calendar();
    if (cal === 'gregorian') return this.dateService.gDate(format, dateObj.timestamp);
    return this.dateService.jDate(format, dateObj.timestamp);
  }

  protected goToCurrentMonth() {
    const cal = this.calendar();
    let [cy, cm] = ['', ''];
    if (cal === 'gregorian') {
      [cy, cm] = this.dateService.gDate('Y_m').split('_');
    } else {
      [cy, cm] = this.dateService.jDate('Y_m').split('_');
    }
    this.changeMonth(+cm, +cy);
  }
  getMonths() {
    const cal = this.calendar();
    const months =
      cal === 'gregorian' ? this.datepickerService.gMonths : this.datepickerService.jMonths;
    return Object.values(months).map((q: string, i: number) => {
      return {
        title: q,
        val: i + 1,
      };
    });
  }
  years = computed(() => {
    let offset = this.yearPage() * 25;
    const year = +this.selectedYear() + offset;
    const firstYear = Math.floor(year / 25) * 25;
    return Array.from({length: 25}, (_, i) => firstYear + i);
  });

  protected selectYear(item: number) {
    this.selectedYear.set(String(item).padStart(4, '0'));
    this.mode.set('months');
  }
}
