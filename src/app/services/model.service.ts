import { Injectable } from '@angular/core';
import { titles } from '../titles';
@Injectable()
export class ModelService {
  model = {
    year: null,
    category: {
      label: 'Select indicator',
      title: '',
      column: '',
      id: '',
      legendText: ''
    },
    subcategory: null,
    region: null,
    incomeGroup: null,
    countryContext: null
  };
  titles: any;
  constructor() { }
  // return all titles
  getTitles() {
    return titles;
  }
  // return all data from year
  getIndicators(year) {
    this.titles = titles;
      for (const title of titles) {
        if (year === title.year) {
          return title.categories;
        }
      }
  }
  getYears() {
    const years = [];
    for (const title of titles) {
      years.push(title);
    }
    return years;
  }
  getCategoriesYear(year) {
    for (const title of titles) {
      if (title.year === year) {
        return title.categories;
      }
    }
  }
}
