import { Component, OnInit } from '@angular/core';
import { PartnerHistoricalService } from '../services/partner-historical.service';
import { Indicator } from './indicator.model';
import { Subindicator } from './subindicator.model';
import { Year } from './year.model';
import { IOption } from '../lib/ng-select/option.interface.d';

enum Years {
  _2005,
  _2007,
  _2010,
  _2014,
  _2016
}
enum EnumPartner {
  'Bilateral',
  'OtherBilateral',
  'Multilateral',
  'UNAgencies',
  'OtherIntAndReg',
  'Foundations',
  'Global'
}
@Component({
  selector: 'app-partner-historical',
  templateUrl: './partner-historical.component.html',
  styleUrls: ['./partner-historical.component.css']
})
export class PartnerHistoricalComponent implements OnInit {
  years: Array<number>;
  partnerTypes: Array<string>;

  selectedYear: number;

  selectedYearId: number;

  selectedIndicator: Indicator;
  selectedSubindicator: Subindicator;

  yearModel: Year;

  navbarTitle: string;

  partners: Map<string, Array<string>>;

  rawPartners;

  constructor(private phService: PartnerHistoricalService) {
    this.selectedYearId = Years._2016; // defalut year
    this.years = [2005, 2007, 2010, 2014, 2016];
    this.partnerTypes = [];
    this.selectedYear = this.years[this.selectedYearId];

    this.yearModel = new Year();

    this.selectedIndicator = null;
    this.selectedSubindicator = null;

    this.partners = new Map<string, Array<string>>();
  }

  ngOnInit() {
    this.yearModel = this.phService.getDataByYear(this.selectedYearId);
    this.phService.getAllPartners().subscribe(res => {
      this.rawPartners = res;
    });
    console.log(this.rawPartners);
  }

  changeYear(year) {
    this.yearModel = this.phService.getDataByYear(this.getYearId(year));
    this.selectedIndicator = null;
    this.selectedSubindicator = null;
    this.getNavbarTitle();
    console.log(this.yearModel);
  }

  selectIndicator(indicator) {
    this.selectedIndicator = indicator;
    this.selectedSubindicator = null;
    this.getNavbarTitle();
    console.log(this.selectedIndicator);
  }

  unselectIndicator() {
    this.selectedIndicator = null;
    this.selectedSubindicator = null;
    this.getNavbarTitle();
    console.log(this.selectedIndicator);
  }

  selectSubindicator(subindicator) {
    this.selectedSubindicator = subindicator;
    this.getNavbarTitle();
    console.log(this.selectedSubindicator);
  }

  unselectSubindicator() {
    this.selectedSubindicator = null;
    this.getNavbarTitle();
  }

  getYearId(year) {
    for (let i = 0; i < this.years.length; i++) {
      if (year === this.years[i]) {
        return i;
      }
    }
  }

  getNavbarTitle() {
    let ans = '';
    if (this.selectedSubindicator) {
      ans = this.selectedSubindicator.title;
      ans = ans.replace('[YEAR]', String(this.yearModel.year));
    }
    this.navbarTitle = ans;
  }

  getPartners() {

  }
}
