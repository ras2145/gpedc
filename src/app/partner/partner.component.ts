import { IOption } from '../lib/ng-select/option.interface.d';
import { Component, Inject, TemplateRef, ViewChild, OnInit} from '@angular/core';
import { regions, incomeGroups, countryContexts, partnerAggregate } from '../filterCountries';
import { MapService } from '../services/map.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import {GenerateIndicatorsService} from '../services/generate-indicators.service';
import { titles } from '../titles';
import { saveAs } from 'file-saver';
declare var ga: Function;
@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.css']
})
export class PartnerComponent implements OnInit {
  categorizedPartners: any;
  categorizedPartnersP: any;
  categorizedPartnersS: any;
  partners: any;
  notFromTab: any;
  titles;
  year;
  organizationComparer: any;
  regions: any;
  incomeGroups: any;
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
    'Average for all development partners': 0,
    'Bilateral partners (DAC members)': 1,
    'Other bilateral partners (non-DAC members)': 2,
    'Foundations': 6,
    'Foundation': 6,
    'Global funds and vertical initiatives': 7,
    'Multilateral development banks': 3,
    'Other international and regional organizations': 5,
    'Other international and regional organisations': 5,
    'UN agencies': 4
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
    ga('set', 'page', `/partnercomparison.html`);
    ga('send', 'pageview');
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

      let aux = this.categorizedPartners[0];
      this.categorizedPartners[0] = this.categorizedPartners[5];
      this.categorizedPartners[5] = this.categorizedPartners[3];
      this.categorizedPartners[3] = this.categorizedPartners[6];
      this.categorizedPartners[6] = aux;
      aux = this.categorizedPartners[1];
      this.categorizedPartners[1] = this.categorizedPartners[4];
      this.categorizedPartners[4] = this.categorizedPartners[2];
      this.categorizedPartners[2] = aux;
      console.log("Partnets", this.categorizedPartners);
      
      this.categorizedPartnersP = this.categorizedPartners.slice(0,3);
      this.categorizedPartnersS = this.categorizedPartners.slice(3,7);
      this.chargeOrganizationComparison();
    });
  }
  chargeOrganizationComparison() {
    this.organizationSelectors = [];
    this.organizationSelectors.push({
      key: '2010',
      value1: new Array<IOption>(),
      value2: new Array<IOption>()
    });
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
        this.organizationSelectors[2]['value1'].push(titleObject);
        this.organizationSelectors[2]['value2'].push(titleObject);
        for (const partner of partnerGroup.partners) {
          if (partner['yr2016']) {
            const organizationSelector = {
              value: partner['partner'],
              label: partner['partner']
            };
            this.organizationSelectors[2]['value1'].push(organizationSelector);
            this.organizationSelectors[2]['value2'].push(organizationSelector);
          }
          if (partner['yr2014']) {
            const organizationSelector = {
              value: partner['partner'],
              label: partner['partner']
            };
            this.organizationSelectors[1]['value1'].push(organizationSelector);
            this.organizationSelectors[1]['value2'].push(organizationSelector);
          }
          if (partner['yr2010']) {
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
        this.mergeWithSelected(this.organizationSelectors[2]['value1'], this.organizationComparer.firstOrganization);
        this.mergeWithSelected(this.organizationSelectors[2]['value2'], this.organizationComparer.secondOrganization);  
        this.mergeWithSelected(this.organizationSelectors[3]['value'], this.organizationComparer.aggregate);
      }
    }
    for (const aggregate of partnerAggregate) {
      this.organizationSelectors[3]['value'].push({
        value: aggregate.value,
        label: aggregate.label
      });
    }
    const correctOrder = ['Average for all development partners',
        'Bilateral partners (DAC members)',
        'Other bilateral partners (non-DAC members)',
        'Multilateral development banks',
        'UN agencies',
        'Other international and regional organizations',
        'Foundations',
        'Global funds and vertical initiatives'];
    this.organizationSelectors[3]['value'].sort((a,b) => {
      return this.sidsOrder[a.value] - this.sidsOrder[b.value];
    });
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
    this.notFromTab = true;
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
  htmlIndicator(indicator){
    return this.generateIndicatorsService.htmlIndicatorFunction(indicator);
  }
  getTextIcon(indicator) {
    if(indicator.id ==='8' ) {
      return 'This indicator provides evidence to follow up and review of SDG target 5.c.1, which tracks the proportion of countries with systems to monitor and make public allocations for gender equality and women’s empowerment.';
    } else if (indicator.id === '1a') {
      return 'This indicator provides evidence to follow up and review of SDG target 17.15.1 on the use of country-owned results frameworks and planning tools by providers of development co-operation.';
    }
  }
}
