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

@Component({
  selector: 'app-partner-historical',
  templateUrl: './partner-historical.component.html',
  styleUrls: ['./partner-historical.component.css']
})
export class PartnerHistoricalComponent implements OnInit {
  years: Array<number>;

  selectedYear: number;
  selectedYearId: number;

  selectedIndicator: Indicator;
  selectedSubindicator: Subindicator;

  yearModel: Year;

  navbarTitle: string;

  partners: any;
  dropdownContent: Array<any>;

  selectedDevPartner: any;
  selectedPartnerTypes: Array<boolean>;

  constructor(private phService: PartnerHistoricalService) {
    this.selectedYearId = Years._2016; // defalut year
    this.years = this.phService.getYears();

    this.selectedYear = this.years[this.selectedYearId];
    this.selectedDevPartner = null;
    this.selectedIndicator = null;
    this.selectedSubindicator = null;

    this.yearModel = new Year();

    this.dropdownContent = new Array<any>();
    this.selectedPartnerTypes = new Array<boolean>();
  }

  ngOnInit() {
    this.yearModel = this.phService.getDataByYear(this.selectedYearId);
    this.partners = this.phService.getDevPartners();
    this.resetSelectedPartnerTypes();
    this.fillDropdown();
  }

  resetSelectedPartnerTypes() {
    this.selectedPartnerTypes = new Array<boolean>();
    for (let i = 0; i < this.partners.length; i++) {
      this.selectedPartnerTypes.push(true);
    }
  }
  onSelected(event) {
    this.getNavbarTitle();
  }
  onDeselected(event) {
    this.getNavbarTitle();
  }
  changeYear(year) {
    this.yearModel = this.phService.getDataByYear(this.getYearId(year));
    this.selectedIndicator = null;
    this.selectedSubindicator = null;
    this.getNavbarTitle();
    this.resetSelectedPartnerTypes();
    this.fillDropdown();
    this.selectedDevPartner = null;
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
    if (this.selectedSubindicator && this.selectedDevPartner) {
      ans = this.selectedSubindicator.title;
      ans = ans.replace('[YEAR]', String(this.yearModel.year));
      ans = ans.replace('[DEVELOPMENT PARTNER]', this.selectedDevPartner);
    } if (this.selectedIndicator && this.selectedIndicator.id == '10' && this.selectedDevPartner) {
      ans = this.selectedIndicator.title;
      ans = ans.replace('[YEAR]', String(this.yearModel.year));
      ans = ans.replace('[DEVELOPMENT PARTNER]', this.selectedDevPartner);
    }
    this.navbarTitle = ans;
  }
  updateCheck(i) {
    this.selectedPartnerTypes[i] = !this.selectedPartnerTypes[i];
    this.fillDropdown();
  }

  fillDropdown() {
    let dropdownItem, i;
    i = 0;
    this.dropdownContent = [];
    for (const it1 of this.partners) {
      if (this.selectedPartnerTypes[i] === true) {
        dropdownItem = {
          value: it1.type,
          label: it1.type,
          disabled: true
        };
        this.dropdownContent.push(dropdownItem);
        for (const p of it1.devpartners) {
          dropdownItem = {
            value: p,
            label: p,
            disabled: false
          };
          this.dropdownContent.push(dropdownItem);
        }
      }
      i++;
    }
  }

  runAnalysis() {
    if (this.selectedDevPartner &&  (this.selectedSubindicator || (this.selectedIndicator && this.selectedIndicator.id === '10'))) {
      const sYear = String(this.selectedYear);
      let sIndicator;
      if (!this.selectedSubindicator) { // special case for indicator 10
        sIndicator = this.selectedIndicator.id;
      } else {
        sIndicator = this.selectedSubindicator.id;
      }
      const sDevPartner = this.selectedDevPartner;
      this.phService.getChartData(sYear, sIndicator, sDevPartner).subscribe(
        res => {
          console.log(res);
        }
      );
    } else {
      alert('Select a indicator, subindicator and a development partner');
    }
  }
}
