import { Injectable } from '@angular/core';
import { analysisData } from '../analysisData';
import { Indicator } from '../partner-historical/indicator.model';
import { Subindicator } from '../partner-historical/subindicator.model';
import { Year } from '../partner-historical/year.model';
import { SERVER } from '../server.config';
import { WebService } from './web.service';
import { partnerTypes } from '../partner-historical/partner-types';

@Injectable()
export class PartnerHistoricalService {

  years: Array<Number>;

  constructor(private webService: WebService) {
    this.years = [2005, 2007, 2010, 2014, 2016];
  }

  getAll() {
    return analysisData;
  }

  getYears() {
    return this.years;
  }

  getIndicatorsByYear(yearId): Array<Indicator> {
    const dataYear = analysisData[yearId];

    const indicators = new Array<Indicator>();
    for (const it1 of dataYear.data) {
      const indicator = new Indicator();
      indicator.id = it1.indicator;
      indicator.title = it1.titlepartner;
      indicator.dropdown = it1.dropdownpartner;
      indicator.type = it1.type;
      indicator.chartText = it1.charttext;
      indicator.autoselect = it1.autoselect === '' ? false : true;

      const subindicators = new Array<Subindicator>();
      for (const it2 of it1.subdropdown) {
        const subindicator = new Subindicator();
        subindicator.id = it2.indicator;
        subindicator.title = it2.titlepartner;
        subindicator.type = it2.type;
        subindicator.subdropdown = it2.subdropdown;
        subindicator.chartText = it2.charttext;
        subindicator.autoselect = it2.autoselect === '' ? false : true;
        subindicators.push(subindicator);
      }
      indicator.subindicators = subindicators;
      indicators.push(indicator);
    }
    return indicators;
  }
  getDataByYear(yearId): Year {
    const data = new Year();
    data.year = analysisData[yearId].year;
    data.indicators = this.getIndicatorsByYear(yearId);
    return data;
  }
  getPartners() {
    return partnerTypes;
  }
}
