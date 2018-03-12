import { Indicator } from './indicator.model';

export class Year {
  year: number;
  indicators: Array<Indicator>;

  constructor() {
    this.year = -1;
    this.indicators = new Array<Indicator>();
  }
}
