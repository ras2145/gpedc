import { IOption } from './lib/ng-select/option.interface.d';
import { countryComparison } from './countryComparison';
import { WebService } from './services/web.service';
import { MapService } from './services/map.service';
import { LoaderService } from './services/loader.service';
import { Component, Inject, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { titles } from './titles';
import { legends } from './legends';
import { regions, incomeGroups, countryContexts, partnerAggregate } from './filterCountries';
import { saveAs } from 'file-saver';
import { getValueFromObject } from 'ngx-bootstrap/typeahead/typeahead-utils';
import { TabsModule } from 'ngx-bootstrap/tabs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  viewModal = true;
  notFromTab = true;
  viewTab = true;
  viewerTab: any;
  mapTitle: any;
  validIndicator: any;
  percent: any;
  legendTitle: any;
  legendMap = [];
  popupText: any;
  countriesQuery: any;
  footerTab = '';
  allLabels = {};
  countryComparer: any;
  organizationComparer: any;
  countryComparisonOptions: any;
  countrySelectors = [];
  organizationSelectors = [];
  selectedCountry: any = false;
  indicatorsSelectedCountry: any;
  indicatorSelectedFooter: any;
  categoriesNotNull: any;
  selectedTab = 'tab1';
  partners: any;
  categorizedPartners: any;
  countryName = 'Country';
  title = 'app';
  modalRef: BsModalRef;
  name: any;
  titles: any;
  legends: any;
  regions: any;
  incomeGroups: any;
  countryContexts: any;
  footerText = '';
  mapUrlProfile: any;
  subIndicator: any;
  isNumber: any;
  indicator: any;
  firstCountry: any;
  secondCountry: any;
  geoJson: any;
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
  openedIndicator: string;
  indicatorTitle: any;
  selectedSidCountry = null;
  isSmallStateSelected = false;
  sidsCountries = [];
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
  heightDropDown: any;
  viewCountryComparer: boolean = true;
  selectFirstCountry: string;
  selectSecondCountry: string;
  tutorial = [
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ];
  @ViewChild('tuto') tuto: TemplateRef<any>;
  constructor(
    private mapService: MapService,
    private modalService: BsModalService,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    this.mapService.allDataCountryQuery().subscribe(val => {
      this.countriesQuery = val;
    });
    this.mapService.sidsCountriesQuery(undefined).subscribe(val => {
      const countriesObj = {};
      for (let country of val) {
        if (countriesObj[country.country]) {
          if (countriesObj[country.country].area < country.area) {
            countriesObj[country.country] = country;
          }
        } else {
          countriesObj[country.country] = country;
        }

      }
      this.sidsCountries = [];
      for (let countryName in countriesObj) {
        this.sidsCountries.push(countriesObj[countryName]);
      }
    });
    this.getPartners();
    this.countryComparisonOptions = countryComparison;
    this.chargeCountryComparison();
    this.titles = titles;
    this.legends = legends;
    this.regions = regions;
    this.incomeGroups = incomeGroups;
    this.countryContexts = countryContexts;
    this.mapUrlProfile = '#';
    this.resetModels();
    this.mapService.createMap('map');
    this.mapConfig();
    this.indicator = true;
    this.validIndicator = false;
    this.viewerTab = '1';
    this.heightDropDown = '75vh';
  }
  ngAfterViewInit() {
    this.openModal(this.tuto);
  }
  chargeOrganizationComparison() {
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
        console.log(this.organizationSelectors);
        console.log(this.organizationComparer);
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
  chargeCountryComparison() {
    for (const key in countryComparison) {
      this.countrySelectors.push({
        key: key,
        value: new Array<IOption>()
      });
      const size = this.countrySelectors.length;
      // tslint:disable-next-line:forin
      for (const arrays in countryComparison[key]) {
        this.countrySelectors[size - 1]['value'].push({
          value: arrays, label: arrays, disabled: true
        });
        for (const ele of countryComparison[key][arrays]) {
          this.countrySelectors[size - 1]['value'].push({
            value: ele, label: ele
          });
        }
      }
    }
  }
  onSelectedCountry(event, type) {
    if (type === 'first') {
      if (event.value === this.countryComparer.secondCountry) {
        this.mapService.paintTwoClearOne('first');
        setTimeout(() => {
          this.countryComparer.firstCountry = undefined;
        }, 10);
        return;
      }
      if (this.countryComparer.firstCountry !== '') {
        this.mapService.paintTwoCountry(this.countryComparer.firstCountry, 'first');
      }
    } else {
      if (event.value === this.countryComparer.firstCountry) {
        setTimeout(() => {
          this.countryComparer.secondCountry = undefined;
        }, 10);
        this.mapService.paintTwoClearOne('second');
        return;
      }
      if (this.countryComparer.secondCountry !== '') {
        this.mapService.secondCountry = '';
        this.mapService.paintTwoCountry(this.countryComparer.secondCountry, 'second');
      }
    }
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
    // TODO organization data
    // LOL
  }
  onDeselected(event, type) {
    if (type === 'first') {
      this.countryComparer.firstCountry = '';
    } else {
      this.countryComparer.secondCountry = '';
    }
    this.mapService.paintTwoCountry(event.value, 'ok');
  }
  mapConfig() {
    this.loaderService.start();
    const self = this;
    this.mapService.onLoad(() => {
      this.mapTitle = '';
      this.setColor();
      this.loaderService.start();
      this.mapService.getCountriesYearGeoJSON(this.model.year.year).subscribe(geojson => {
        self.mapService.build(geojson);
        self.geoJson = geojson;
        this.loaderService.end();
      }, error => {
        this.loaderService.end();
      });
      this.mapService.mouseCountryHover(event => {
        const countries = self.mapService.map.queryRenderedFeatures(event.point, {
          layers: ['country-fills']
        });
        this.countryName = countries[0].properties.country;
        this.getTextPopUp(this.countryName);
      });
      this.mapService.mouseLeave(() => {
        this.countryName = 'Country';
        this.popupText = '';
      });
      this.mapService.clickCountry(event => {
        if (this.selectedTab === 'tab1') {
          let feature = event.features[ event.features.length - 1 ];
          if (event.features.length > 1) {
            for (let feature1 of event.features) {
              if (feature1.properties.country == self.selectedSidCountry.country) {
                feature = feature1;
              }
            }
          }
          self.mapUrlProfile = feature.properties.profile;
          if (self.mapUrlProfile === 'null' || self.mapUrlProfile == null) {
            self.mapUrlProfile = '#';
          } else if (!self.mapUrlProfile.includes('http://')) {
            self.mapUrlProfile = 'http://' + self.mapUrlProfile;
          }
          const point = event.point ? event.point : [self.mapService.map.getCanvas().width / 2, self.mapService.map.getCanvas().height / 2];
          const selectedCountry = self.mapService.map.queryRenderedFeatures(point, {
            layers: ['country-fills']
          });
          if (selectedCountry.length === 0 ) {
              selectedCountry[0] = feature;
          }
          this.selectedCountry = self.mapService.paintOneCountry(selectedCountry[0].properties.country);
          console.log(this.selectedCountry);
          if (this.selectedCountry) {
            this.indicatorsSelectedCountry = this.countriesQuery.filter((a) => a.country === this.selectedCountry)[0];
            this.categoriesNotNull = [];
            setTimeout(() => {
              this.getCategoriesNotNull();
              for (let ind of this.categoriesNotNull){
                if (ind.id == this.model.category.id){
                  this.indicatorSelectedFooter = this.model.category.id ? this.model.category.id : (this.categoriesNotNull.length ? this.categoriesNotNull[0].id : this.model.year.categories[0].id);
                  break;
                }else {
                  this.indicatorSelectedFooter = this.categoriesNotNull.length ? this.categoriesNotNull[0].id : this.model.year.categories[0].id;
                }
              }
              this.getIndicator(this.indicatorSelectedFooter);
            }, 100);
          } else {
            this.indicatorSelectedFooter = this.model.year.categories[0].id;
          }
        } else if (this.selectedTab === 'tab2') {
          const selectedCountry = self.mapService.map.queryRenderedFeatures(event.point, {
            layers: ['country-fills']
          });
          let send = 'bad';
          if (!this.countryComparer.firstCountry) {
            send = 'first';
          } else if (!this.countryComparer.secondCountry) {
            send = 'second';
          }
          const aux = self.mapService.paintTwoCountry(selectedCountry[0].properties.country, send);
          this.countryComparer.firstCountry = aux[0];
          this.countryComparer.secondCountry = aux[1];
        }
      });
      this.loaderService.end();
    });
  }
  resetComparer() {
    this.legendMap = this.legends['noLegend' + this.model.year.year];
    this.mapService.paintTwoCountryClear();
    this.countryComparer.firstCountry = '';
    this.countryComparer.secondCountry = '';
    this.loaderService.start();
    this.mapService.getCountriesYearGeoJSON(this.model.year.year).subscribe(geojson => {
      this.mapService.update(geojson);
      this.loaderService.end();
    }, error => {
      this.loaderService.end();
    });
  }
  openModal(template: TemplateRef<any>) {
     this.viewModal = false;
     this.modalRef = this.modalService.show(template);
  }

  selTab (cid, mcid) {
      if (cid == mcid && this.viewTab) {
        this.viewTab = false;
        return true;
      }else {
        return false;
      }
  }
  getIndicatorValue(country, year) {
    if (!country) {
      return 'No data';
    }
    let category;
    let ind = '', index = -1;
    for (const indicator of this.model.year.categories) {
      if (this.model.category && this.model.category.label === indicator.label) {
        ind = indicator.id;
        category = indicator;
      }
      indicator.subcategories.forEach((ele, idx) => {
        if (this.model.subcategory && this.model.subcategory.label === ele.label) {
          category = ele;
          ind = indicator.id;
          index = idx + 1;
          if (this.model.subcategory.id) {
            index = -1;
          }
        }
      });
    }

    if (ind === '1a') {
      ind = ind.replace('a', '');
    }
    ind = `_${year}_${ind}`;
    if (index !== -1) {
      ind = `${ind}_${index}`;
    }
    if (this.countriesQuery) {
      const countryQuery = this.countriesQuery.filter(ele => {
        return ele.country === country;
      })[0];
      if (countryQuery && countryQuery.hasOwnProperty(ind)) {
        return this.formatValuePopUp(category, countryQuery[ind]);
      }
    }
    return 'No data';
  }

  findViewerCategory(category, subcategory, indicator, subIndicator) {
    this.notFromTab = true;
    this.model.category = category;
    this.model.subcategory = subcategory;
    this.indicator = indicator;
    this.subIndicator = subIndicator;
  }
  // function to set variables that determines if request of template 
  // is from the modal or not
  findTabCategory(tabId) {
    this.footerTab = tabId;
    this.notFromTab = false;
    console.log(this.footerTab);
  }
  setTrueTab() {
    this.notFromTab = true;
  }
  test(val) {
    console.log('val', val);
  }
    // function that un-paint a country and unselect it
  closeFooter() {
    this.mapService.paintOneCountry(this.selectedCountry);
    this.selectedCountry = null;
  }

  selectTab(event) {
    this.mapService.resetLayer();
    this.legendMap = [];
    if (event.target.id) {
      if (event.target.id != this.selectedTab) {
        this.selectedTab = event.target.id;
        this.mapService.applyFilters(event.target.id);
        this.mapService.resetClickLayer();
        this.selectedCountry = '';
        titles.forEach(title => {
          if (title.year === '2016') {
            this.model.year = title;
            this.model.category = title.categories[0];
            this.model.subcategory = title.categories[0].subcategories[0];
          }
        });
        this.indicator = true;
        if (this.selectedTab === 'tab1') {
          this.viewerTab ='1';
          this.mapTitle = '';
          this.model.region = this.regions[0];
          this.model.countryContext = this.countryContexts[0];
          this.model.incomeGroup = this.incomeGroups[0];
          this.loaderService.start();
          this.mapService.getCountriesYearGeoJSON(this.model.year.year).subscribe(geojson => {
            this.mapService.update(geojson);
            this.loaderService.end();
          }, error => {
            this.loaderService.end();
          });
          this.setColor();
          this.selectedSidCountry = null;
        }
        if (this.selectedTab === 'tab2') {
          this.viewerTab = '2';
          this.legendTitle = '';
          this.indicator = false;
          this.mapTitle = '';
          this.resetComparer();
          this.model.category = {
            label: '',
            title: 'Select two countries for comparing indicators: ',
            column: '',
            id: '',
            legendText: ''
          };
          this.selectedSidCountry = null;
        }
        setTimeout(() => {
          this.mapService.resize();
          this.mapService.switchMapCenter(event.target.id);
        }, 100);
      }
    }
  }
  selectCategory(category) {
    this.model.category = category;
    this.model.subcategory = null;
    this.indicator = false;
    this.subIndicator = true;
    this.updateIndicatorGeojson();
    this.validIndicator = true;
    this.updateMapTitle();    
    console.log(this.model);
    console.log(this.indicator);
    console.log(this.subIndicator);
  }
  selectSubcategory(category, subcategory) {
    this.model.category = category;
    this.model.subcategory = subcategory;
    this.subIndicator = false;
    this.indicator = false;
    this.updateIndicatorGeojson();
    this.validIndicator = true;
    this.updateMapTitle();
    console.log(this.model);
    console.log(this.indicator);
    console.log(this.subIndicator);
  }
  unselectCategory() {
    this.subIndicator = false;
    this.indicator = false;
    this.getCategoriesNotNull();
    this.getIndicator(this.model.year.categories[0].id);
    this.changeYearLabel(this.model.year.year);
  }
  changeYearLabel(y) {
    this.mapService.resetLayer();
    this.legendMap = [];
    let currentCategory = this.model.category;
    let currentSubCategory = this.model.subcategory;
    let keepLayer = 0;
    titles.forEach(title => {
      if (y.year === title.year) {
        this.model.year = title;
        this.model.category = title.categories[0];
        this.model.subcategory = null;
        title.categories.forEach(category => {
          if (category.label === currentCategory.label) {
            keepLayer = 1;
            currentCategory = category;
            currentSubCategory = category.subcategories[currentSubCategory];
          }
        });
      }
    });
    this.footerTab = '';
    this.footerText = '';
    this.mapService.resetClickLayer();
    this.indicatorSelectedFooter = this.model.year.categories[0].id;
    this.indicator = true;
    this.selectedCountry = null;
    this.model.region = this.regions[0];
    this.model.countryContext = this.countryContexts[0];
    this.model.incomeGroup = this.incomeGroups[0];
    if (keepLayer === 1 && this.validIndicator === true) {
      this.selectSubcategory(currentCategory, currentSubCategory);
    } else {
      this.validIndicator = false;
      this.loaderService.start();
      this.mapService.getCountriesYearGeoJSON(this.model.year.year).subscribe(geojson => {
        this.loaderService.end();
        this.mapService.update(geojson);
      }, error => {
        this.loaderService.end();
      });
    }
    this.setColor();
  }
  getText(value, indicator) {
    return this.formatValue(indicator, value);
  }
  onIndicatorOver(category) {
    this.openedIndicator = category.id;
  }
  selectRegion(region) {
    this.model.region = region;
    this.updateIndicatorGeojson();
  }
  selectIncomeGroup(incomeGroup) {
    this.model.incomeGroup = incomeGroup;
    this.updateIndicatorGeojson();
  }
  selectCountryContext(countryContext) {
    this.model.countryContext = countryContext;
    this.updateIndicatorGeojson();
  }
  updateIndicatorGeojson() {
    const self = this;
    this.selectedCountry = '';
    this.mapService.resetClickLayer();
    let indicator = null;
    if (!this.indicator) {
      indicator = this.model.subcategory ? this.model.subcategory.column : this.model.category.column;
    }
    const region = this.model.region.value;
    const incomeGroup = this.model.incomeGroup.value;
    const countryContext = this.model.countryContext.value;
    const year = this.model.year.year;
    this.loaderService.start();
    this.mapService.getIndicatorFilterGeoJSON(indicator, region, incomeGroup, countryContext, year).subscribe(geojson => {
      self.geoJson = geojson;
      this.mapService.update(geojson);
      this.setColor();
      this.loaderService.end();
    }, error => {
      this.loaderService.end();
    });
  }
  getCategoriesNotNull() {
    this.categoriesNotNull = [];
    if (this.selectedCountry) {
      const isCountryDac = this.isDac(this.selectedCountry);
      for (const i of this.model.year.categories) {
        let sw = false;
        if (this.indicatorsSelectedCountry[i.column] != null) {
          sw = true;
        }
        for (const j of i.subcategories) {
          if (this.indicatorsSelectedCountry[j.column] != null) {
            sw = true;
          }
        }
        if (isCountryDac) {
          if (i.id == '2' || i.id == '3' || i.id == '8') {
            sw = false;
          }
        }
        if (i.id == '4' && !isCountryDac) {
          sw = false;
        }
        if (sw) {
          this.categoriesNotNull.push(i);
        }
      }
    }
  }
  getLabelCountry(indicator, typeOfCountry, isOrganization?: boolean) {
    const countryName = isOrganization ? this.organizationComparer[typeOfCountry] : this.countryComparer[typeOfCountry];
    if (!countryName || !indicator) {
      return '-';
    }
    const dataObject = isOrganization ? this.partners : this.countriesQuery;
    const field = isOrganization ? 'partner' : 'country';
    const country = dataObject.filter((a) => {
      if (!a[field]) {
        return false;
      }
      return a[field].toLowerCase().trim() === countryName.toLowerCase().trim();
    })[0];
    let text = '';
    if (!country) {
      return '-';
    }
    const value = this.formatValue(indicator, country[indicator.column]);
    if (indicator['subcategories']) {
      // if (this.checkIfString(value) && value.toUpperCase() === 'YES') {
      // text = text + ' ' + indicator['yesText'];
      // } else if (this.checkIfString(value) && value.toUpperCase() === 'NO') {
      //  text = text + ' ' + indicator['noText'];
      //} else {
      // text = text + ' ' + indicator['prefix'] + ' <b>' + value + '</b> ' + indicator['suffix'];
      text = text + '<p>' + value + '</p>';
      //}
    } else {
      /*if (this.checkIfString(value) && value.toUpperCase() === 'YES') {
        text = text + ' ' + indicator.yesText;
      } else if (this.checkIfString(value) && value.toUpperCase() === 'NO') {
        text = text + ' ' + indicator.noText;
      } else {*/
      text = text + '<p>' + value + '</p>';
      // }
    }
    if (text == null || text.trim() == 'null' || text.trim() == 'undefined') {
      return '-';
    }
    return text;
  }
  formatValue(indicator, oldValue) {
    let value = '';
    if (indicator.type === 'percent') {
      const previousValue = oldValue;
      oldValue = oldValue * 100;
      value = (previousValue != null) ? (parseFloat(oldValue + '').toFixed(indicator.precision) + '%') : 'No data available';
    } else if (indicator.type === 'number') {
      value = oldValue ? (parseFloat(oldValue).toFixed(indicator.precision)) : 'No data available';
    } else if (indicator.type === 'text') {
      value = oldValue ? oldValue : 'No data available';
    }
    return value;
  }
  formatValuePopUp(indicator, oldValue) {
    let value = '';
    if (indicator.type === 'percent') {
      const previousValue = oldValue;
      oldValue = oldValue * 100;
      value = (previousValue != null) ? (parseFloat(oldValue + '').toFixed(indicator.precision) + '%') : 'No data';
    } else if (indicator.type === 'number') {
      value = oldValue ? (parseFloat(oldValue).toFixed(indicator.precision)) : 'No data';
    } else if (indicator.type === 'text') {
      value = oldValue ? oldValue : 'No data';
    }
    return value;
  }
  checkIfString(val) {
    return typeof val === 'string';
  }
  getTextPopUp(countryName) {
    this.popupText = '';
    if (countryName !== 'Country') {
      const country = this.countriesQuery.filter((a) => a.country === countryName)[0];
      if (this.model.category == null) {
        this.popupText = 'No indicator selected.<br>';
      } else if (this.model.category != null && this.model.subcategory == null) {
        if (country[this.model.category.column] != null) {
          if (this.checkIfString(country[this.model.category.column]) && country[this.model.category.column].toUpperCase() === 'YES') {
            this.popupText = this.model.category['prefix'] + ' ' + this.model.category['yesText'];
          } else if (this.checkIfString(country[this.model.category.column]) && country[this.model.category.column].toUpperCase() === 'NO') {
            this.popupText = this.model.category['prefix'] + ' ' + this.model.category['noText'];
          } else {
            this.popupText = this.popupText + ' ' + this.model.category['prefix'] + ' <b>' + this.formatValuePopUp(this.model.category, country[this.model.category.column]) + '</b> ' + this.model.category['suffix'];
          }
        }
      } else if (this.model.category != null && this.model.subcategory != null) {
        if (country[this.model.subcategory.column] != null) {
          if (this.checkIfString(country[this.model.subcategory.column]) && country[this.model.subcategory.column].toUpperCase() === 'YES') {
            this.popupText = this.model.subcategory['prefix'] + ' ' + this.model.subcategory.yesText;
          } else if (this.checkIfString(country[this.model.subcategory.column]) && country[this.model.subcategory.column].toUpperCase() === 'NO') {
            this.popupText = this.model.subcategory['prefix'] + ' ' + this.model.subcategory.noText;
          } else {
            this.popupText = this.popupText + ' ' + this.model.subcategory.prefix + ' <b>' + this.formatValuePopUp(this.model.subcategory, country[this.model.subcategory.column]) + ' </b>' + this.model.subcategory.suffix;
          }
        }
      }
    }
  }
  getIndicator(indicator: any) {
    this.footerTab = indicator;
    this.indicatorSelectedFooter = indicator;
    this.footerText = '';
    if (this.selectedCountry) {
      const categories = this.model.year.categories;
      let notPrint = [];
      for (const i of categories) {
        if (i.id === indicator) {
          const value = this.formatValue(i, this.indicatorsSelectedCountry[i.column]);
          let cols = [1, 11];
          if (i.id == '1a' || i.id == '5a' || i.id == '5b' || i.id == '6' || i.id == '9b' || i.id == '10') {
            cols = [3, 9];
          }
          if (!notPrint.includes(i.id)) {
            if (value === 'Yes') {
              this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div><div class="tabs-result">' + i.yesText + '</div>';
            } else if (value === 'No') {
              this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div><div class="tabs-result">' + i.noText + '</div>';
            } else if (i.id === '8') {
              this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div><div class="tabs-result">' + (i.prefix + ' <div>' + value + ' </div>' + i.suffix) + '</div>';
            } else if (i.id == '4') {
              if (value == 'No data available') {
                this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div>';
                // <div class="tabs-result">' + (i.prefix + ' ' + value + ' ' + i.suffix) + '</div>';
              } else {
                this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div><div class="tabs-result">' + (i.prefix + ' <h2>' + value + ' </h2>' + i.suffix) + '</div>';
              }
            } else if (i.id == '1a' || i.id == '2' || i.id == '3' || i.id == '5a' || i.id == '5b' || i.id == '6' || i.id == '9a' || i.id == '9b' || i.id == '10') {
              if (value == 'No data available') {
                this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div>';
                // <div class="tabs-result">' + (i.prefix + ' ' + value + ' ' + i.suffix) + '</div>';
              } else {
                this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div><div class="tabs-result">' + (i.prefix + ' <div class="row"><div class="col-md-' + cols[0] + '"><h2>' + value + ' </h2></div><div class="col-md-' + cols[1] + '">' + i.suffix) + '</div></div></div>';
              }
            } else if (i.label != '1a') {
              this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div><div class="tabs-result">' + (i.prefix + ' <div>' + value + ' </div>' + i.suffix) + '</div>';
            }
          }
          let jumps = 0;
          for (const j of i.subcategories) {
            jumps = 1;
            const subvalue = this.formatValue(j, this.indicatorsSelectedCountry[j.column]);
            if (j.label.indexOf('Summary') >= 0) {
              continue;
            }
            if (subvalue === 'Yes') {
              this.footerText = this.footerText + '<div class="tabs-result">' + j.yesText + '</div>';
            } else if (subvalue === 'No') {
              this.footerText = this.footerText + '<div class="tabs-result">' + j.noText + '</div>';
            } else if (i.id == '4' || i.id == '7' || i.id == '8') {
              if (subvalue == 'No data available') {
                this.footerText = this.footerText + '<div class="tabs-result">' + j.prefix + ' ' + subvalue + ' ' + j.suffix + '</div>';
              } else {
                this.footerText = this.footerText + '<div class="tabs-result">' + j.prefix + ' <h2>' + subvalue + ' </h2>' + j.suffix + '</div>';
              }
            } else if (i.id == '1a' || i.id == '2' || i.id == '3' || i.id == '5a' || i.id == '5b' || i.id == '6' || i.id == '9a' || i.id == '9b' || i.id == '10') {
              if (subvalue == 'No data available') {
                this.footerText = this.footerText + '<div class="tabs-result">' + j.prefix + ' ' + subvalue + ' ' + j.suffix + '</div>';
              } else {
                this.footerText = this.footerText + '<div class="tabs-result">' + j.prefix + ' <div class="row"><div class="col-md-' + cols[0] +'"><h2>' + subvalue + ' </h2></div><div class="col-md-' + cols[1] + '">' + j.suffix + '</div></div></div>';
              }
            } else {
              this.footerText = this.footerText + '<div class="tabs-result">' + (j.prefix + ' <div>' + subvalue + '</div> ' + j.suffix) + '</div>';
            }
          }
        }
      }
    }
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
        if (!this.sidsIgnoreGroups.includes(partnerName)){
          this.categorizedPartners.push({
            name: partnerName,
            partners: categorizedPartners[partnerName],
            open: false,
            selected: false
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
      this.chargeOrganizationComparison();
    });
  }
  isDac(country) {
    for (const partnerGroup of this.categorizedPartners) {
      if (partnerGroup.name.includes('DAC')) {
        for (const partner of partnerGroup.partners) {
          if (partner.partner == country) {
            return true;
          }
        }
      }
    }
    return false;
  }
  resetModels() {
    this.countryComparer = {
      firstCountry: '',
      secondCountry: '',
      aggregate: ''
    };
    this.organizationComparer = {
      firstOrganization: '',
      ssecondOrganization: '',
      aggregate: ''
    };
    titles.forEach(title => {
      if (title.year === '2016') {
        this.model.year = title;
        this.model.category = title.categories[0];
        this.model.subcategory = null;
      }
    });
    this.model.region = this.regions[0];
    this.model.incomeGroup = this.incomeGroups[0];
    this.model.countryContext = this.countryContexts[0];
    this.indicatorSelectedFooter = this.model.year.categories[0].id;
    this.subIndicator = true;
    this.isNumber = false;
    this.countryComparer.firstCountry = '';
    this.countryComparer.secondCountry = '';
  }
  resetSmallState() {
    this.mapService.switchMapCenter('tab1');
    this.isSmallStateSelected = false;
    this.selectedSidCountry = false;
    this.mapService.paintOneCountry(this.selectedCountry);
    this.selectedCountry = false;

  }
  exportCsv(isOrganization?: boolean) {
    const comparer = isOrganization ? this.organizationComparer : this.countryComparer;
    const first = isOrganization ? 'firstOrganization' : 'firstCountry';
    const second = isOrganization ? 'secondOrganization' : 'secondCountry';
    const lines = [];
    const headers = ['Indicator'];
    if (comparer[first] != '') {
      headers.push(comparer[first]);
    }
    if (comparer[second] != '') {
      headers.push(comparer[second]);
    }
    if (comparer.aggregate != '') {
      headers.push(comparer.aggregate);
    }
    lines.push(headers);
    this.model.year.categories.forEach(category => {
      let line = [];
      line.push(category.title);
      if (comparer[first] != '') {
        line.push(this.getLabelCountry(category, first, isOrganization).trim());
      }
      if (comparer[second] != '') {
        line.push(this.getLabelCountry(category, second, isOrganization).trim());
      }
      if (comparer.aggregate != '') {
        line.push(this.getLabelCountry(category, 'aggregate', isOrganization).trim());
      }
      lines.push(line);
      category.subcategories.forEach(subcategory => {
        line = [];
        line.push(subcategory.label);
        if (comparer[first] != '') {
          line.push(this.getLabelCountry(subcategory, first, isOrganization).trim());
        }
        if (comparer[second] != '') {
          line.push(this.getLabelCountry(subcategory, second, isOrganization).trim());
        }
        if (comparer.aggregate != '') {
          line.push(this.getLabelCountry(subcategory, 'aggregate', isOrganization).trim());
        }
        lines.push(line);
      });
    });
    let linesString = lines.map(line => line.map(element => '"' + element.replace('<p>', '').replace('</p>', '') + '"').join(','));
    let result = linesString.join('\n');
    result = result.replace(/ ?<\/?b> ?/g, ' ');
    result = result.replace(/," /g, ',"');
    result = result.replace(/ ",/g, '",');
    console.log(result);
    let blob = new Blob([result], { type: 'text/csv' });
    const fileName = isOrganization ? 'organizations' : 'countries';
    saveAs(blob, fileName + '.csv');
  }
  exportCsvViewer() {
    const lines = [];
    const headers = ['Country', this.mapTitle];
    lines.push(headers);
    let column = this.model.category.column;
    let indicator = this.model.category;
    if (this.model.subcategory != null) {
      column = this.model.subcategory.column;
      indicator = this.model.subcategory;
    }
    let countriesList = [];
    for (const feature of this.geoJson.features) {
      const line = [];
      line.push(feature.properties.country);
      line.push(this.formatValue(indicator, feature.properties[column]));
      countriesList.push(line);
    }
    countriesList.sort((a, b) => (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0)));
    for (const line of countriesList) {
      lines.push(line);
    }
    lines.push(['', '']);
    lines.push(['Development Partners', '']);
    for (const partnerGroup of this.categorizedPartners) {
      lines.push([partnerGroup.name, '']);
      for (const partner of partnerGroup.partners) {
        const line = [];
        line.push(partner.partner);
        line.push(this.formatValue(indicator, partner[column]));
        if (line[1] != 'No data available' && line[1] != '-' && line[1] != '' && line[1] != null) {
          lines.push(line);
        }
      }
    }
    let linesString = lines.map(line => line.map(element => '"' + element + '"').join(','));
    let result = linesString.join('\n');
    result = result.replace(/ ?<\/?b> ?/g, ' ');
    result = result.replace(/," /g, ',"');
    result = result.replace(/ ",/g, '",');
    let blob = new Blob([result], { type: 'text/csv' });
    const fileName = 'viewer';
    saveAs(blob, fileName + '.csv');
  }
  noIsInvalidSelection(category) {
    return !(category.id === '7' || category.id === '8' || category.id === '1a' || category.id === '2' || category.id === '3' || category.id === '4');
  }
  setColor() {
    const category = this.model.category;
    const subcategory = this.model.subcategory;
    const year = this.model.year.year;
    if (this.indicator) {
        this.legendTitle = '';
        this.legendMap = this.legends['noLegend' + this.model.year.year];
        return;
    }
    console.log("CATEGORY ", category, subcategory);
    let indicator = null;
    if (!this.indicator) {
      indicator = this.model.subcategory ? this.model.subcategory.column : this.model.category.column;
    }
    this.mapService.sidsCountriesQuery(indicator).subscribe(val => {
      const countriesObj = {};
      for (let country of val) {
        if (countriesObj[country.country]) {
          if (countriesObj[country.country].area < country.area) {
            countriesObj[country.country] = country;
          }
        } else {
          countriesObj[country.country] = country;
        }
      }
      this.sidsCountries = [];
      for (let countryName in countriesObj) {
        this.sidsCountries.push(countriesObj[countryName]);
      }
      this.heightDropDown = this.sidsCountries.length < 13 ? '45vh' : '75vh';
    });
    this.legendTitle = category.legendText;
    if (subcategory != null) {
      this.legendTitle = subcategory.legendText;
      if (subcategory.type === 'text') {
        if (category.id === '4') {
          this.legendMap = this.legends.indicator4;
        } else {
          this.legendMap = this.legends.yesNo;
        }
      } else if (subcategory.type === 'percent') {
        this.legendMap = this.legends.percent;
      } else if (subcategory.type === 'number') {
        if (subcategory.column.includes('2_1')) {
          this.legendMap = this.legends.indicator2_1;
        } else if (subcategory.column.includes('2_2')) {
          this.legendMap = this.legends.indicator2_2;
        } else if (subcategory.column.includes('2_3') || subcategory.column.includes('2_4')) {
          this.legendMap = this.legends.indicator2_34;
        } else if (subcategory.column.includes('_3_')) {
          this.legendMap = this.legends.number;
        }
      }
    } else {
      if (category['type'] === 'text') {
        this.legendMap = this.legends.yesNo;
      } else if (category['type'] === 'percent') {
        this.legendMap = this.legends.percent;
      } else if (category['type'] === 'number') {
        if (category.id === '9a') {
          this.legendMap = this.legends.indicator9a;
        } else if (category['precision'] == '0') {
          this.legendMap = this.legends.number;
        } else {
          this.legendMap = this.legends.number2;
        }
      }
    }
    return this.mapService.paintForIndicator(category, subcategory, year);
  }
  zoomIn() {
    this.mapService.zoomIn();
  }
  zoomOut() {
    this.mapService.zoomOut();
  }
  updateMapTitle() {
    if (!this.indicator && !this.subIndicator) {
      this.mapTitle = this.model.subcategory.title;
    } else if (!this.indicator) {
      this.mapTitle = this.model.category.title;
    } else {
      this.mapTitle = '';
    }
  }
  tabsToShow(category) {
    return (category === '1a' || category === '2' || category === '3' || category === '4');
  }
  selectSid(sidCountry) {
    this.closeFooter();
    this.isSmallStateSelected = true;
    this.selectedSidCountry = sidCountry;
    this.mapService.mapSetCenter([sidCountry.centerx, sidCountry.centery]);
    this.mapService.mapFitBounds([[sidCountry.bboxx1, sidCountry.bboxy1], [sidCountry.bboxx2, sidCountry.bboxy2]]);
    this.loaderService.start();
    setTimeout(() => {
      this.mapService.map.fire('click', [sidCountry.firstx, sidCountry.firsty]);
      this.loaderService.end();
    }, 5000);
  }
  switchPartnerGroupOpen(event, partnerGroup) {
    partnerGroup.open = !partnerGroup.open;
  }
  selectPartnerGroup(partnerGroup) {
    partnerGroup.selected = !partnerGroup.selected;
    console.log(partnerGroup);
    this.chargeOrganizationComparison();
  }
  continueTutorial() {
    let index = -1;
    for (let i = 0; i < this.tutorial.length; i++) {
      if (this.tutorial[i]) {
        index = i;
      }
    }
    if (index == -1) {
      this.tutorial[0] = true;
    } else {
      this.tutorial[index] = false;
      this.tutorial[(index + 1) % this.tutorial.length] = true;
    }
  }
  selectTutorial(index) {
    this.deselectTutorial();
    this.tutorial[index] = true;
  }
  deselectTutorial() {
    for (let i = 0; i < this.tutorial.length; i++) {
      this.tutorial[i] = false;
    }
  }
  isLoading() {
    return this.loaderService.isLoading();
  }
  isCategoryTop() {
    if (this.model.category == null) {
      return false;
    }
    if (this.model.category.id == '8' || this.model.category.id == '9b') {
      return true;
    }
    return false;
  }
  selectCountryComparer(firstCountry, secondCountry) {
    this.selectFirstCountry = firstCountry || '';
    this.selectSecondCountry = secondCountry || '';
    this.viewCountryComparer = this.selectFirstCountry !== '' && this.selectSecondCountry !== '' ? true : false;
    return this.viewCountryComparer;
  };
  viewTableIndicatorComparison(firstCountry, secondCountry) {
    let output: boolean;
    firstCountry = firstCountry === '-' ? '<p>No data available</p>' : firstCountry;
    secondCountry = secondCountry === '-' ? '<p>No data available</p>' : secondCountry;
    if(this.selectFirstCountry !== '' && this.selectSecondCountry !== '') {
      output = firstCountry === '<p>No data available</p>' && secondCountry === '<p>No data available</p>' ? false : true;
    } else if(this.selectFirstCountry !== '') {
      output = firstCountry === '<p>No data available</p>' ? false : true;
    } else {
      output = secondCountry === '<p>No data available</p>' ? false : true;
    } 
    return output;
  };
  viewTableIndicator(indicator, valueIndicator) {
    let output: number = 0;
    if(valueIndicator) {
      for(let subcategory of indicator.subcategories) {
        if(this.viewTableIndicatorComparison(this.getLabelCountry(subcategory, 'firstOrganization', true), this.getLabelCountry(subcategory, 'secondOrganization', true))) {
          output++;
        }
      }      
    } else {
      for(let subcategory of indicator.subcategories) {
        if(this.viewTableIndicatorComparison(this.getLabelCountry(subcategory, 'firstCountry'), this.getLabelCountry(subcategory, 'secondCountry'))) {
          output++;
        }
      }
    }
    return output > 0 ? true : false;
  };
}
