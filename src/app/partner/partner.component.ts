import { IOption } from '../lib/ng-select/option.interface.d';
import { Component, Inject, TemplateRef, ViewChild, OnInit} from '@angular/core';
import { regions, incomeGroups, countryContexts, partnerAggregate } from '../filterCountries';
import { MapService } from '../services/map.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import {GenerateIndicatorsService} from '../services/generate-indicators.service';
import { titles } from '../titles';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.css']
})
export class PartnerComponent implements OnInit {
  categorizedPartners: any;
  partners: any; 
  titles;
  year;
  organizationComparer: any;
  regions: any;
  incomeGroups: any
  countryContexts: any;
  indicatorSelectedFooter: any;
  indicator: any;
  subIndicator: any;
  isNumber: any;
  modalRef: BsModalRef;
  viewModal = true;
  countrySelectors = [];
  organizationSelectors = [];
  sidsIgnoreGroups = [
    'Aggregate'
  ];
  sidsOrder = {
    'Bilateral partners (DAC members)': 0,
    'Other bilateral partners (non-DAC members)': 1,
    'Foundation': 2,
    'Global funds and vertical initiatives': 3,
    'Multilateral development banks': 4,
    'Other international and regional organizations': 5,
    'UN agencies': 6
  };  
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
  constructor(private mapService: MapService, private generateIndicatorsService: GenerateIndicatorsService,
  private modalService: BsModalService) { }

  ngOnInit() {
    this.titles = titles;
    this.getPartners();
    this.year = '2016';
    this.model.year = titles[2];
    this.organizationComparer = {
      firstOrganization: '',
      ssecondOrganization: '',
      aggregate: ''
    };
  }
  changeYear(year) {
    console.log(year.year, '------------');
    this.resetModels();
    this.year = year.year;
  }
  resetModels() {
    this.organizationComparer = {
      firstOrganization: '',
      ssecondOrganization: '',
      aggregate: ''
    };
    // titles.forEach(title => {
    //   if (title.year === '2016') {
    //     this.model.year = title;
    //     this.model.category = title.categories[0];
    //     this.model.subcategory = null;
    //   }
    // });
  }
  getPartners() {
    this.mapService.getPartners().subscribe(res => {
      this.partners = res;
      const categorizedPartners = {};
      for (const partner of this.partners) {
        if (!categorizedPartners[partner.type_partner]) {
          categorizedPartners[partner.type_partner] = [];
        }
        categorizedPartners[partner.type_partner].push(partner);
      }
      this.categorizedPartners = [];
      for (const partnerName in categorizedPartners) {
        if (!this.sidsIgnoreGroups.includes(partnerName)) {
          this.categorizedPartners.push({
            name: partnerName,
            partners: categorizedPartners[partnerName],
            open: true,
            selected: true
          });
        }
      }
      this.categorizedPartners.sort((a, b) => {
        if (this.sidsOrder[a.name] < this.sidsOrder[b.name]) {
          return -1;
        } else if (this.sidsOrder[a.name] > this.sidsOrder[b.name]) {
          return 1;
        }
        return 0;
      });
      console.log("Partnets",this.categorizedPartners);
      this.chargeOrganizationComparison();
    });
  } 
  chargeOrganizationComparison() {
    this.resetModels();
    this.organizationSelectors = [];
    this.organizationSelectors.push({
      key: '2014',
      value1: new Array<IOption>(),
      value2: new Array<IOption>()
    });
    this.organizationSelectors.push({
      key: '2016',
      value1: new Array<IOption>(),
      value2: new Array<IOption>()
    });
    this.organizationSelectors.push({
      key: 'Aggregate',
      value: new Array<IOption>()
    });
    for (const partnerGroup of this.categorizedPartners) {
      if (partnerGroup.selected) {
        const titleObject = {
          value: partnerGroup.name,
          label: partnerGroup.name,
          disabled: true
        };
        this.organizationSelectors[0]['value1'].push(titleObject);
        this.organizationSelectors[0]['value2'].push(titleObject);
        this.organizationSelectors[1]['value1'].push(titleObject);
        this.organizationSelectors[1]['value2'].push(titleObject);
        for (const partner of partnerGroup.partners) {
          if (partner['_2016'].toUpperCase() === 'YES' || partner['_2016'].toUpperCase() === 'TRUE') {
            const organizationSelector = {
              value: partner['partner'],
              label: partner['partner']
            };
            this.organizationSelectors[1]['value1'].push(organizationSelector);
            this.organizationSelectors[1]['value2'].push(organizationSelector);
          }
          if (partner['_2014'].toUpperCase() === 'YES' || partner['_2014'].toUpperCase() === 'TRUE') {
            const organizationSelector = {
              value: partner['partner'],
              label: partner['partner']
            };
            this.organizationSelectors[0]['value1'].push(organizationSelector);
            this.organizationSelectors[0]['value2'].push(organizationSelector);
          }
        }
        this.mergeWithSelected(this.organizationSelectors[0]['value1'], this.organizationComparer.firstOrganization);
        this.mergeWithSelected(this.organizationSelectors[0]['value2'], this.organizationComparer.secondOrganization);
        this.mergeWithSelected(this.organizationSelectors[1]['value1'], this.organizationComparer.firstOrganization);
        this.mergeWithSelected(this.organizationSelectors[1]['value2'], this.organizationComparer.secondOrganization);
        this.mergeWithSelected(this.organizationSelectors[2]['value'], this.organizationComparer.aggregate);
      }
    }
    for (const aggregate of partnerAggregate) {
      this.organizationSelectors[2]['value'].push({
        value: aggregate.value,
        label: aggregate.label
      });
    }
  } 
  mergeWithSelected(options, selectedOption) {
    if (selectedOption) {
      const selectedOptionObject = {
        value: selectedOption,
        label: selectedOption
      };
      if (!this.containsOrganization(options, selectedOptionObject)) {
        options.unshift(selectedOptionObject);
      }
    }
  }
  containsOrganization(options, value) {
    for (let option of options) {
      if (option.value == value.value) {
        return true;
      }
    }
    return false;
  }
  switchPartnerGroupOpen(event, partnerGroup) {
    partnerGroup.open = !partnerGroup.open;
  }
  selectPartnerGroup(partnerGroup) {
    partnerGroup.selected = !partnerGroup.selected;
    this.chargeOrganizationComparison();
    return partnerGroup.selected;
  }
  onSelectedOrganization(event, type) {
    if (type === 'first') {
      if (event.value === this.organizationComparer.secondOrganization) {
        setTimeout(() => {
          this.organizationComparer.firstOrganization = undefined;
        }, 10);
      }
    } else {
      if (event.value === this.organizationComparer.firstOrganization) {
        setTimeout(() => {
          this.organizationComparer.secondOrganization = undefined;
        }, 10);
      }
    }
  }  
  hasSubOrganization(indicator) {
    let ans = 0;
    for (let subcategory of indicator.subcategories) {
      if (this.availableOrganizationRow(subcategory)) {
        ans++;
      }
    }

    return ans;
  }
  availableOrganizationRow(category) {
    let d = 0;
    d += this.organizationComparer.firstOrganization ? 1 : 0;
    d += this.organizationComparer.secondOrganization ? 1 : 0;
    if (d === 2) {
      const texa = this.generateIndicatorsService.getLabelCountryFunction(category, 'firstOrganization', this.organizationComparer, this.partners, true);
      const texb = this.generateIndicatorsService.getLabelCountryFunction(category, 'secondOrganization', this.organizationComparer, this.partners, true);
      let isValid = false;
      isValid = (texa !== '-' && !texa.includes('No data'));
      isValid = isValid || (texb !== '-' && !texb.includes('No data'));
      return isValid;
    }
    if(category.id==null)
    {
      if (category.column=='_2014_8' || category.column=='_2016_8' || category.column=='_2014_7' || category.column=='_2016_7') 
      return false;
    }
    return true;
  }
  findViewerCategory(category, subcategory, indicator, subIndicator) {
    // this.notFromTab = true;
    this.model.category = category;
    this.model.subcategory = subcategory;
    this.indicator = indicator;
    this.subIndicator = subIndicator;
  }
  openModal(template: TemplateRef<any>) {
     this.viewModal = false;
     this.modalRef = this.modalService.show(template);
  }
  getLabelCountry(indicator, typeOfCountry, isOrganization?: boolean) {
    return this.generateIndicatorsService.getLabelCountryFunction(indicator,  typeOfCountry, this.organizationComparer, this.partners, true);
  }
  tabsToShow(category) {
    return (category === '1a' || category === '2' || category === '3' || category === '4');
  }
  exportCsv() {
    this.generateIndicatorsService.exportCsvFunction(this.organizationComparer, this.partners, this.model, true);
  }
}
