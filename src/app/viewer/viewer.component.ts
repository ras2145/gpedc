import { IOption } from '../lib/ng-select/option.interface.d';
import { countryComparison } from '../countryComparison';
import { WebService } from '../services/web.service';
import { MapService } from '../services/map.service';
import { LoaderService } from '../services/loader.service';
import { Component, Inject, TemplateRef, OnInit} from '@angular/core';
import { titles } from '../titles';
import { legends } from '../legends';
import { regions, incomeGroups, countryContexts, partnerAggregate } from '../filterCountries';
import { saveAs } from 'file-saver';
import { getValueFromObject } from 'ngx-bootstrap/typeahead/typeahead-utils';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { indicator2Exceptions } from '../indicator2.exceptions';
import { Subject } from 'rxjs/Subject';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
declare var ga: Function;

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
  // changeDetection: ChangeDetectionStrategy.Default
})
export class ViewerComponent implements OnInit {
  partnerType = 'partcntry';
  optionsSubject: Subject <any> = new Subject();
  titleSubject: Subject <any> = new Subject();
  subDropdown = false;
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
  listIndicator={ title:'',id:null,yesText:'', noText:'', indicator: [] };
  dateModal: any;
  // listIndicator: any
  model = {
    year: null,
    category: {
      label: 'Select indicator',
      title: '',
      column: '',
      id: '',
      legendText: '',
      devpart:'',
      partcntry: ''
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
    'Foundations': 2,
    'Global funds and vertical initiatives': 3,
    'Multilateral development banks': 4,
    'Other international and regional organisations': 5,
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
  changeyear;
  column_indicator=[{}];
  column_content:'';
  country_modal:'';
  iconIndicator;
  modalRef: BsModalRef;

  constructor(
    private mapService: MapService,
    private loaderService: LoaderService,
    private modalService: BsModalService
  ) { }
 private indicator2Exceptions;
  ngOnInit() {
    ga('set', 'page', `/viewer.html`);
    ga('send', 'pageview');
    this.mapService.allDataCountryQuery().subscribe(val => {
      this.countriesQuery = val;
    });
    // this.mapService.sidsCountriesQuery(undefined, '2016', '', '', '').subscribe(val => {
    //   const countriesObj = {};
    //   for (let country of val) {
    //     if (countriesObj[country.country]) {
    //       if (countriesObj[country.country].area < country.area) {
    //         countriesObj[country.country] = country;
    //       }
    //     } else {
    //       countriesObj[country.country] = country;
    //     }
    //   }
    //   this.sidsCountries = [];
    //   for (let countryName in countriesObj) {
    //     this.sidsCountries.push(countriesObj[countryName]);
    //   }
    // });
    this.getPartners();
    this.countryComparisonOptions = countryComparison;
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
    this.dateModal = {};
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

  mapConfig() {
    this.loaderService.start();
    const self = this;
    this.mapService.onLoad(() => {
      this.mapTitle = '';
      this.setColor();
      this.loaderService.start();
      this.mapService.getCountriesYearVectorUrl(this.model.year.year).subscribe(tiles => {
        self.mapService.buildVectorSource(tiles);
        self.geoJson = tiles;
        this.loaderService.end();
      }, error => {
        this.loaderService.end();
      });
      this.mapService.mouseCountryHover(event => {
        const countries = self.mapService.map.queryRenderedFeatures(event.point, {
          layers: ['country-fills']
        });
        // console.log('COUNTRIES',countries);
    //     const column=Object.keys(countries[0].properties);
    // for(var i=0;i<column.length;i++) {
    //   const val=(countries[0].properties[column[i]]).toString();
    //   if (val=="9999") {
    //     countries[0].properties[column[i]]="Not Applicable";
    //   }
    // }
        if((countries[0].properties[countries[0]['layer'].paint['fill-color'].property]?countries[0].properties[countries[0]['layer'].paint['fill-color'].property]:"null").toString()!="9999") {
          this.countryName = countries[0].properties.country;
          this.getTextPopUp(this.countryName);
        } else {
          this.countryName = 'Country-not';
          this.popupText = '';
        }
      });
      this.mapService.mouseLeave(() => {
        this.countryName = 'Country';
        this.popupText = '';
      });
      this.mapService.clickCountry(event => {
        console.log('CLICK ', event);
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
          if (self.mapUrlProfile === 'http://') {
            self.mapUrlProfile = '#';
          }
          console.log('COUNTRY PDF URL ', self.mapUrlProfile);
          const point = event.point ? event.point : [self.mapService.map.getCanvas().width / 2, self.mapService.map.getCanvas().height / 2];
          const selectedCountry = self.mapService.map.queryRenderedFeatures(point, {
            layers: ['country-fills']
          });
          // if (selectedCountry.length === 0 ) {
          //     selectedCountry[0] = feature;
          // }
          // console.log('SELECTED COUYNTRY', selectedCountry,"valor", selectedCountry[0].properties[selectedCountry[0]['layer'].paint['fill-color'].property] );
          selectedCountry[0] = feature;
          this.country_modal = feature.properties['country'];

          console.log('VALUE THAT CHANGE', selectedCountry[0].properties[selectedCountry[0]['layer'].paint['fill-color'].property]);
          if(((selectedCountry[0].properties[selectedCountry[0]['layer'].paint['fill-color'].property]?selectedCountry[0].properties[selectedCountry[0]['layer'].paint['fill-color'].property]:"null").toString()!="9999"))
          {
            this.selectedCountry = self.mapService.paintOneCountry(selectedCountry[0].properties.country);
          }
          // console.log("select-paint", selectedCountry[0].properties.country);
          this.selectedCountry = self.mapService.paintOneCountry(selectedCountry[0].properties.country);
          if (this.selectedCountry) {
            this.indicatorsSelectedCountry = this.countriesQuery.filter((a) => a.country === this.selectedCountry)[0];
            this.categoriesNotNull = [];
            setTimeout(() => {
              this.getCategoriesNotNull();
              console.log("getcate", this.categoriesNotNull);
              for (let ind of this.categoriesNotNull){
                if (ind.id == this.model.category.id){
                  this.indicatorSelectedFooter = this.model.category.id ? this.model.category.id : (this.categoriesNotNull.length ? this.categoriesNotNull[0].id : this.model.year.categories[0].id);
                  break;
                } else {
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
    console.log(this.model);
    this.legendMap = this.legends['noLegend' + this.model.year.year];
    this.mapService.paintTwoCountryClear();
    this.countryComparer.firstCountry = '';
    this.countryComparer.secondCountry = '';
    this.loaderService.start();
    this.mapService.getCountriesYearVectorUrl(this.model.year.year).subscribe(tiles => {
      this.mapService.updateVectorSource(tiles);
      this.loaderService.end();
    }, error => {
      this.loaderService.end();
    });
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
      // console.log(this.model.category.label, '------');
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
    // console.log('-->  !! --> ', ind);

    if (ind === '1a') {
      ind = ind.replace('a', '');
    }
    const columnCat = this.getColumn();
    // console.log('--> ', columnCat);
    // const columnCat = this.partnerType === 'devpart' ? this.model.category.devpart : this.model.category.partcntry;
    console.log('--> ', columnCat);
    // ind = columnCat;
    const options = columnCat.toString().slice(6);
    const yearone = year;
    ind = '_' + year + '_' + options;
    console.log('options --> ', ind);
    // console.log('--> column cat', columnCat);
    // if (ind !== '7') {
    //   const options = columnCat.toString().slice(9, 18);
    //   ind = `_${year}_${ind}` + '_' + options.trim();
    // } else {
    //   ind = `_${year}_${ind}`.trim();
    //   // console.log('--> indicator -->  ', ind);
    // }
    // if (index !== -1) {
    //   ind = `${ind}_${index}`;
    //   console.log('mno llega --> ', ind);
    // }
    if (this.countriesQuery) {
      const countryQuery = this.countriesQuery.filter(ele => {
        return ele.country === country;
      })[0];
      if (countryQuery && countryQuery.hasOwnProperty(ind)) {
        // console.log('indiator --> ', ind, '---> ', countryQuery, '...> ',category);
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
  }
  setTrueTab() {
    this.notFromTab = true;
  }
  test(val) {
    // console.log('val', val);
  }
    // function that un-paint a country and unselect it
  closeFooter() {
    this.mapService.paintOneCountry(this.selectedCountry);
    this.selectedCountry = null;
  }

  selectTab(event) {
    this.mapService.resetLayer();
    this.resetModels();
    this.legendMap = [];
    if (event.target.id) {
      if (event.target.id !== this.selectedTab) {
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
          this.viewerTab = '1';
          this.mapTitle = '';
          this.model.region = this.regions[0];
          this.model.countryContext = this.countryContexts[0];
          this.model.incomeGroup = this.incomeGroups[0];
          this.loaderService.start();
          this.mapService.getCountriesYearVectorUrl(this.model.year.year).subscribe(tiles => {
            this.mapService.updateVectorSource(tiles);
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
            legendText: '',
            devpart:'',
            partcntry: ''
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
    console.log("cat",category);
    this.model.category = category;
    this.model.subcategory = null;
    this.indicator = false;
    this.subIndicator = true;
    // if (!this.subDropdown) {
      this.updateIndicatorVector();
    // }
    this.validIndicator = true;
    this.updateMapTitle();
   // console.log(this.model);
   // console.log(this.indicator);
   // console.log(this.subIndicator);
  }
  selectSubcategory(category, subcategory) {
    this.model.category = category;
    this.model.subcategory = subcategory;
    this.subIndicator = false;
    this.indicator = false;
    this.updateIndicatorVector();
    this.validIndicator = true;
    this.updateMapTitle();
  //  console.log(this.model);
  //  console.log(this.indicator);
  //  console.log(this.subIndicator);
  }
  unselectCategory() {
    console.log("unselected");
    this.subIndicator = false;
    this.indicator = false;
    console.log('UNSELECT',this.model);
    this.getCategoriesNotNull();
    this.getIndicator(this.model.year.categories[0].id);
    this.changeYearLabel(this.model.year);
    // this.exportCsvViewer(this.model);
    this.sendTitle();
  }
  unselectSubCategory() {
    this.subIndicator = false;
    const category = this.model.category;
    this.getCategoriesNotNull();
    this.getIndicator(this.model.year.categories[0].id);
    this.changeYearLabel(this.model.year);
    this.selectCategory(category);
  }
  changeYearLabel(y) {
    this.changeyear = y.year;
    this.iconIndicator = '';
    this.mapService.resetLayer();
    this.legendMap = [];
    let currentCategory = this.model.category;
    let currentSubCategory = this.model.subcategory;
    let keepLayer = 0;
    this.selectedSidCountry = false;
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
      this.mapService.getCountriesYearVectorUrl(this.model.year.year).subscribe(tiles => {
        this.loaderService.end();
        this.mapService.updateVectorSource(tiles);
      }, error => {
        this.loaderService.end();
      });
    }
    this.setColor();
    return y.year;
  }
  getText(value, indicator) {
    return this.formatValue(indicator, value);
  }
  onIndicatorOver(category) {
    this.openedIndicator = category.id;
  }
  selectRegion(region) {
    this.model.region = region;
    this.updateIndicatorVector();
  }
  selectIncomeGroup(incomeGroup) {
    this.model.incomeGroup = incomeGroup;
    this.updateIndicatorVector();
  }
  selectCountryContext(countryContext) {
    this.model.countryContext = countryContext;
    this.updateIndicatorVector();
  }
  updateIndicatorVector() {
    const self = this;
    this.selectedCountry = '';
    this.mapService.resetClickLayer();
    let indicator = null;
    const region = this.model.region.value;
    const incomeGroup = this.model.incomeGroup.value;
    const countryContext = this.model.countryContext.value;
    const year = this.model.year.year;
    this.loaderService.start();
    this.mapService.resetLayer();
    indicator = this.getColumn();
    this.mapService.getIndicatorFilterVectorUrl(indicator, region, incomeGroup, countryContext, year).subscribe(tiles => {
      self.geoJson = tiles;
      this.mapService.updateVectorSource(tiles);
      this.setColor();
      if (this.model.category != null) {
        console.log(this.model);
        const column = this.model.subcategory ? this.model.subcategory.column : this.model.category.column;
        console.log('COLUMN ',column, indicator);
        this.mapService.filterNotNull(indicator);
      }
      this.loaderService.end();
    }, error => {
      this.loaderService.end();
      console.log("error");
    });
  }
  getColumn() {
    const indicator = this.model.category;
    const subindicator = this.model.subcategory;
    let column = '';
    console.log(this.model);
    if ( subindicator ) {
      column = this.partnerType === 'devpart' ? this.model.subcategory.devpart : this.model.subcategory.partcntry;
    } else if ( indicator ) {
      column = this.partnerType === 'devpart' ? this.model.category.devpart : this.model.category.partcntry;
    }
    console.log('COLUMN',column);
    return column;
  }
  getCategoriesNotNull() {
    this.categoriesNotNull = [];
    if (this.selectedCountry) {
      const isCountryDac = this.isDac(this.selectedCountry);
      for (const i of this.model.year.categories) {
        let sw = false;
        if (this.partnerType==='devpart' ?this.indicatorsSelectedCountry[i.devpart]: this.indicatorsSelectedCountry[i.partcntry] != null) {
          sw = true;
        }
        for (const j of i.subcategories) {
          if (this.partnerType==='devpart' ?this.indicatorsSelectedCountry[j.devpart]:this.indicatorsSelectedCountry[j.partcntry] != null) {
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
    let aux = indicator.column;

    //const countryName = isOrganization ? this.organizationComparer[typeOfCountry] : this.countryComparer[typeOfCountry];
    const countryName = this.organizationComparer[typeOfCountry] ? this.organizationComparer[typeOfCountry] : this.countryComparer[typeOfCountry];
    //if (indicator.column == '_2014_5a') console.log('AC',this.organizationComparer[typeOfCountry],this.countryComparer[typeOfCountry]);

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
      const val = (value.toString() !== '9999') ? value : 'Not Applicable';
      text = text + '<p>' + val   + '</p>';
      //}
    } else {
      /*if (this.checkIfString(value) && value.toUpperCase() === 'YES') {
        text = text + ' ' + indicator.yesText;
      } else if (this.checkIfString(value) && value.toUpperCase() === 'NO') {
        text = text + ' ' + indicator.noText;
      } else {*/
      const val = value.toString() !== '9999'? value : 'Not Applicable';
      text = text + '<p>' + val + '</p>';
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
      if (previousValue != '9999')  {
        value = (previousValue != null) ? (parseFloat(oldValue + '').toFixed(indicator.precision) + '%') : 'No data available';
      } else {
        value = 'Not Applicable';
      }
    } else if (indicator.type === 'number') {
      value = oldValue ? (parseFloat(oldValue).toFixed(indicator.precision)) : 'No data available';
    } else if (indicator.type === 'text') {
        if(oldValue!=undefined){
            value = oldValue.toString() ? oldValue.toString():'No data available';
            if(indicator.id==7 || indicator.id==8 || indicator.column.substr(0,7)=='_2014_7' || indicator.column.substr(0,7)=='_2014_8'){
              value=value=='true'?'Yes':'No';
            }
        }
    }
    if(Number(value).toString()=='9999')
    {
      value='No data available';
    }
    return value;
  }
  formatValuePopUp(indicator, oldValue) {
    // console.log('indictor --> ', indicator, 'olvalue ---> ', oldValue);
    let value = '';
    if (indicator.type === 'percent' && oldValue != 9999) {
      const previousValue = oldValue;
      oldValue = oldValue * 100;
      value = (previousValue != null) ? (parseFloat(oldValue + '').toFixed(indicator.precision) + '%') : 'No data';
    } else {
      if (indicator.type === 'number') {
        value = oldValue ? (parseFloat(oldValue).toFixed(indicator.precision)) : 'No data';
      } else {
        if (indicator.type === 'text') {
          if (oldValue === null || oldValue === '9999') {
            value = 'No data';
          } else {
            let valueBol = oldValue.toString();
            if (oldValue.toString() === 'true' || oldValue.toString() === 'false') {
              valueBol = (oldValue ? ' Yes' : 'No');
              console.log('valoes true false', valueBol);
              oldValue = valueBol;
            } 
            value = oldValue ? (valueBol) : 'No data';
          }
        }
      }
    }
    // if (indicator.type === 'percent' && oldValue!=9999) {
    //   const previousValue = oldValue;
    //   oldValue = oldValue * 100;
    //   value = (previousValue != null) ? (parseFloat(oldValue + '').toFixed(indicator.precision) + '%') : 'No data';
    // } else if (indicator.type === 'number') {
    //   value = oldValue ? (parseFloat(oldValue).toFixed(indicator.precision)) : 'No data';
    // } else 
    //   if (indicator.type === 'text') {
    //     console.log('pass--------------');
    //     if(oldValue!=undefined){
    //       value = oldValue.toString() ? oldValue.toString():'No data available';
    //       if(indicator.id==7 || indicator.id==8 || indicator.column.substr(0,7)=='_2014_7' || indicator.column.substr(0,7)=='_2014_8'){
    //         value=value=='true'?'Yes':'No';
    //     } 
    //   }
    // }
    // const val = (value.toString() === '9999' || value.toString() === '') ? 'Not Applicable' : value;
    return value;
  }
  checkIfString(val) {
    return typeof val === 'string';
  }
  getTextPopUp(countryName) {
    this.popupText = '';
    // const columnCat = this.partnerType === 'devpart' ? this.model.category.devpart : this.model.category.partcntry;
    // console.log('-----> column ', columnCat);
    const columnCat = this.getColumn();
    // console.log('sub categorias --> ', this.model.subcategory);
    // const options = columnCat.toString().slice(9, 18);
    const options = columnCat;
    // console.log('options --> ', options);

    if (countryName !== 'Country') {
      const country = this.countriesQuery.filter((a) => a.country === countryName)[0];
      if (this.model.category == null) {
        this.popupText = 'No indicator selected.<br>';
      } else if (this.model.category != null && this.model.subcategory == null) {
        if (country[options] != null) {
          // console.log('console log --> ', this.checkIfString(country[options]) && country[options].toUpperCase());
          if (this.checkIfString(country[options]) && country[options].toUpperCase() === 'YES') {
            this.popupText = this.model.category['prefix'] + ' ' + this.model.category['yesText'];
          } else if (this.checkIfString(country[options]) && country[options].toUpperCase() === 'NO') {
            this.popupText = this.model.category['prefix'] + ' ' + this.model.category['noText'];
          } else {
            this.popupText = this.popupText + ' ' + this.model.category['prefix'] + ' <b>' + this.formatValuePopUp(this.model.category, country[options]) + '</b> ' + this.model.category['suffix'];
          }
        }
      } else if (this.model.category != null && this.model.subcategory != null) {
        if (country[options] != null) {
          if (this.checkIfString(country[options]) && country[options].toUpperCase() === 'YES') {
            this.popupText = this.model.subcategory['prefix'] + ' ' + this.model.subcategory.yesText;
          } else if (this.checkIfString(country[options]) && country[options].toUpperCase() === 'NO') {
            this.popupText = this.model.subcategory['prefix'] + ' ' + this.model.subcategory.noText;
          } else {
            this.popupText = this.popupText + ' ' + this.model.subcategory.prefix + ' <b>' + this.formatValuePopUp(this.model.subcategory, country[options]) + ' </b>' + this.model.subcategory.suffix;
          }
        }
      }
    }
  }
  getIndicator(indicator: any) {
    this.footerTab = indicator;
    this.indicatorSelectedFooter = indicator;
    this.footerText = '';
    this.listIndicator.indicator=[];
    if (this.selectedCountry) {
      const categories = this.model.year.categories;
      let notPrint = [];
      for (const i of categories) {
        if (i.id === indicator) {
          const value2 = this.formatValue(i, this.partnerType==='devpart'?this.indicatorsSelectedCountry[i.devpart]:this.indicatorsSelectedCountry[i.partcntry]);
          // if(i){

          // }
          const value=(value2=='9999')?"Not Applicable":value2;
          // let cols = [1, 11];
          // if (i.id == '1a' || i.id == '5a' || i.id == '5b' || i.id == '6' || i.id == '9b' || i.id == '10') {
          //   cols = [3, 9];
          // }
          if (!notPrint.includes(i.id)) {
            this.listIndicator.title=i.footer;
            this.listIndicator.id=i.id;
            this.listIndicator.yesText=(i.yesText)?i.yesText:'';
            this.listIndicator.noText=(i.noText)?i.noText:'';
            if(i.subcategories.length==0)
            {
              this.listIndicator.indicator.push({prefix:(i.prefix)?i.prefix:'', suffix:(i.suffix)?i.suffix:'', value:value, yesText:(i.yesText)?i.yesText:'', noText:(i.noText)?i.noText:''});
            }
            // if (value === 'Yes') {
            //   this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div><div class="tabs-result">' + i.yesText + '</div>';
            // } else if (value === 'No' ) {
            //   this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div><div class="tabs-result"> ' + ((i.id!='7' && i.id!='8')?i.noText:'') + '</div>';
            // } else if (i.id === '8') {
            //   this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div><div class="tabs-result">' + (i.prefix + ' <div>' + value + ' </div>' + i.suffix) + '</div>';
            // } else if (i.id == '4') {
            //   if (value == 'No data available') {
            //     this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div>';
            //   } else {
            //     this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div><div class="tabs-result">' + (i.prefix + ' <h2>' + value + ' </h2>' + i.suffix) + '</div>';
            //   }
            // } else if (i.id == '1a' || i.id == '2' || i.id == '3' || i.id == '5a' || i.id == '5b' || i.id == '6' || i.id == '9a' || i.id == '9b' || i.id == '10') {
            //   if (value == 'No data available') {
            //     this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div>';
            //   } else {
            //     this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div><div class="tabs-result">' + (i.prefix + ' <div class="row"><div class="col-md-' + cols[0] + '"><h2>' + value + ' </h2></div><div class="col-md-' + cols[1] + '">' + i.suffix) + '</div></div></div>';
            //   }
            // } else if (i.label != '1a') {
            //   this.footerText = this.footerText + '<div class="tabs-result"><b> ' + i.footer + '</b> </div><div class="tabs-result">' + (i.prefix + ' <div>' + value + ' </div>' + i.suffix) + '</div>';
            // }
          }
          let jumps = 0;
          for (const j of i.subcategories) {
            jumps = 1;
            const subvalue2 = this.formatValue(j, this.partnerType==='devpart'?this.indicatorsSelectedCountry[j.devpart]:this.indicatorsSelectedCountry[j.partcntry]);
            const subvalue=(subvalue2=='9999')?"Not Applicable":subvalue2;
            this.listIndicator.indicator.push({column:j.column, prefix:(j.prefix)?j.prefix:'', suffix:(j.suffix)?j.suffix:'', value:subvalue, yesText:(j.yesText)?j.yesText:'', noText:(j.noText)?j.noText:''});
            // if (j.label.indexOf('Summary') >= 0) {
            //   continue;
            // }
            // if (subvalue === 'Yes') {
            //   console.log("yes",subvalue);
            //   this.footerText = this.footerText + '<div class="tabs-result">' + j.yesText + '</div>';
            // } else if (subvalue === 'No') {
            //   console.log("no",subvalue);
            //   this.footerText = this.footerText + '<div class="tabs-result"> ' + j.noText + '</div>';
            // } else if (i.id == '4' || i.id == '7' || i.id == '8') {
            //   if (subvalue == 'No data available') {
            //     this.footerText = this.footerText + '<div class="tabs-result">' + j.prefix + ' ' + subvalue + ' ' + j.suffix + '</div>';
            //   } else {
            //     this.footerText = this.footerText + '<div class="tabs-result">' + j.prefix + ' <h2>' + subvalue + ' </h2>' + j.suffix + '</div>';
            //   }
            // } else if (i.id == '1a' || i.id == '2' || i.id == '3' || i.id == '5a' || i.id == '5b' || i.id == '6' || i.id == '9a' || i.id == '9b' || i.id == '10') {
            //   if (subvalue == 'No data available') {
            //     this.footerText = this.footerText + '<div class="tabs-result">' + j.prefix + ' ' + subvalue + ' ' + j.suffix + '</div>';
            //   } else {
            //     this.footerText = this.footerText + '<div class="tabs-result">' + j.prefix + ' <div class="row"><div class="col-md-' + cols[0] +'"><h2>' + subvalue + ' </h2></div><div class="col-md-' + cols[1] + '">' + j.suffix + '</div></div></div>'; 
            //   }
            // } else {
            //   this.footerText = this.footerText + '<div class="tabs-result">' + (j.prefix + ' <div>' + subvalue + '</div> ' + j.suffix) + '</div>';
            // }
          }
        }
      }
      // console.log("listIndicator",this.listIndicator);
    }
  }

  getPartners() {
    this.mapService.getPartners().subscribe(res => {
      this.partners = res;
      const categorizedPartners = {};
      const arrayPartner = [{}];
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
            selected: true,
            value: this.sidsOrder[partnerName]
          });
        }
      }
      this.categorizedPartners.sort((a, b) => (a.value < b.value ? -1 : (a.value > b.value ? 1 : 0)));
      // this.categorizedPartners.sort((a, b) => {
      //   if (a.value < b.value) {
      //     return -1;
      //   }
      //   if (a.value > b.value) {
      //     return 1;
      //   }
      //   return 0;
      // });
      // arrayPartner.push(this.categorizedPartners[4]);
      // arrayPartner.push(this.categorizedPartners[5]);
      // arrayPartner.push(this.categorizedPartners[1]);
      // arrayPartner.push(this.categorizedPartners[6]);
      // arrayPartner.push(this.categorizedPartners[2]);
      // arrayPartner.push(this.categorizedPartners[3]);
      // arrayPartner.push(this.categorizedPartners[0]);
      // this.categorizedPartners = arrayPartner;
      // this.categorizedPartners.shift();
      console.log("Partnets",this.categorizedPartners);
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
    this.iconIndicator = '';
  }
  resetSmallState() {
    this.mapService.switchMapCenter('tab1');
    this.isSmallStateSelected = false;
    this.selectedSidCountry = false;
    this.mapService.paintOneCountry(this.selectedCountry);
    this.selectedCountry = false;
  }
  exportCsvViewer(event) {
    // console.log("export",  this.partnerType); 
    this.loaderService.start();
    let nameIndicator=(event.options.subcategory!=null)?event.options.subcategory.label:event.options.category.label;
    const lines = [];
    // const headers = ['Country', this.mapTitle];
    const headers = ['Country', nameIndicator];
    lines.push(headers);
    let column = this.partnerType==='devpart'?this.model.category.devpart:this.model.category.partcntry;
    let indicator = this.model.category;
    if (this.model.subcategory != null) {
      column = this.partnerType==='devpart'?this.model.subcategory.devpart:this.model.subcategory.partcntry;
      indicator = this.model.subcategory;
    }
    let countriesList = [];
    const self = this;
    this.mapService.getIndicatorFilterGeoJSON(this.partnerType==='devpart'?this.indicator.devpart:indicator.partcntry, this.model.region.value, this.model.incomeGroup.value, this.model.countryContext.value, this.model.year.year).subscribe(geojson => {
      self.geoJson = geojson;
      for (const feature of self.geoJson.features) {
        const line = [];
        line.push(feature.properties.country);
        line.push(self.formatValue(indicator, feature.properties[column]));
        countriesList.push(line);
      }
      countriesList.sort((a, b) => (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0)));
      for (const line of countriesList) {
        lines.push(line);
      }
      lines.push(['', '']);
      lines.push(['Development Partners', '']);
      for (const partnerGroup of self.categorizedPartners) {
        lines.push([partnerGroup.name, '']);
        for (const partner of partnerGroup.partners) {
          const line = [];
          line.push(partner.partner);
          line.push(self.formatValue(indicator, partner[column]));
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
      self.loaderService.end();
    }, error => {
      self.loaderService.end();
    });
  }

  noIsInvalidSelection(category) {
    const validSelection = (category.id === '7' || category.id === '8' || category.id === '1a' || category.id === '2' || category.id === '3' || category.id === '4');
    if (!validSelection) {
      this.subDropdown = false;
    } else {
      this.subDropdown = category;
    }
    return true;
  }
  setColor() {
    const category = this.model.category;
    const subcategory = this.model.subcategory;
    const year = this.model.year.year;
    const region = this.model.region.value;
    const countryContext = this.model.countryContext.value;
    const incomeGroup = this.model.incomeGroup.value;
    const columnCat = this.partnerType === 'devpart' ? this.model.category.devpart : this.model.category.partcntry;
    let columnSub = null;
    if (this.model.subcategory) {
      columnSub = this.partnerType === 'devpart' ? this.model.subcategory.devpart : (this.model.subcategory.partcntry);
    }
    let indicator = null;
    if (!this.indicator) {
      indicator = this.model.subcategory ? (columnSub) : (columnCat);
    }
    this.mapService.sidsCountriesQuery(indicator, this.model.year.year, region, incomeGroup, countryContext).subscribe(val => {
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
    if (this.indicator) {
        this.legendTitle = '';
        this.legendMap = this.legends['noLegend' + this.model.year.year];
        return;
    }
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
        if (columnSub.includes('2_1')) {
          this.legendMap = this.legends.indicator2_1;
        } else if (columnSub.includes('2_2')) {
          this.legendMap = this.legends.indicator2_2;
        } else if (columnSub.includes('2_3') || columnSub.includes('2_4')) {
          this.legendMap = this.legends.indicator2_34;
        } else if (columnSub.includes('_3_')) {
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
    if(this.legendMap[0].textFirst!='Not Available')
    {
      this.legendMap.unshift({ color: '#BBBBBB', textFirst: 'Not Available', textMiddle: '', textLast: ''});
    }
    return this.mapService.paintForIndicator(category, subcategory, year,this.partnerType);
  }
  zoomIn() {
    this.mapService.zoomIn();
  }
  zoomOut() {
    this.mapService.zoomOut();
  }
  updateMapTitle() {
    this.iconIndicator = this.mapService.iconIndicator_1_8(this.model.category.id);
    console.log('ICON', this.iconIndicator);
    if ((!this.indicator && !this.subIndicator) && this.model.subcategory.title ) {
      this.mapTitle = this.model.subcategory.title;
    } else if (!this.indicator  && this.model.category.title) {
      this.mapTitle = this.model.category.title;
    } else {
      this.mapTitle = '';
    }
    this.sendTitle();
  }
  getImage() {
    if(this.model.category.id ==='8' ) {
      return 'assets/icon5.svg';
    } else if (this.model.category.id === '1a') {    
      return 'assets/icon17.svg';
    }
  }
  getTextIcon() {
    if(this.model.category.id ==='8' ) {
      return 'This indicator provides evidence to follow up and review of SDG target 5.c.1, which tracks the proportion of countries with systems to monitor and make public allocations for gender equality and women’s empowerment.';
    } else if (this.model.category.id === '1a') {
      return 'This indicator provides evidence to follow up and review of SDG target 17.15.1 on the use of country-owned results frameworks and planning tools by providers of development co-operation.';
    }
  }
  sendTitle() {
    const send = {
      mapTitle: this.mapTitle,
      indicator: this.indicator
    };
    console.log('IND',this.indicator);
    this.titleSubject.next(send);
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

  isLoading() {
    return this.loaderService.isLoading();
  }
  // isCategoryTop() {
  //   if (this.model.category == null) {
  //     return false;
  //   }
  //   if (this.model.category.id == '7' || this.model.category.id == '8') {
  //     return true;
  //   }
  //   return false;
  // }
  selectCountryComparer(firstCountry, secondCountry) {
    this.selectFirstCountry = firstCountry || '';
    this.selectSecondCountry = secondCountry || '';
    this.viewCountryComparer = this.selectFirstCountry !== '' && this.selectSecondCountry !== '' ? true : false;
    return this.viewCountryComparer;
  }
  viewTableIndicatorComparison(firstCountry, secondCountry) {
    let output: boolean;
    firstCountry = firstCountry == '-' ? '<p>No data available</p>' : firstCountry;
    secondCountry = secondCountry == '-' ? '<p>No data available</p>' : secondCountry;
    if(this.selectFirstCountry !== '' && this.selectSecondCountry !== '') {
      output = firstCountry == '<p>No data available</p>' && secondCountry == '<p>No data available</p>' ? false : true;
    } else if(this.selectFirstCountry !== '') {
      output = firstCountry == '<p>No data available</p>' ? false : true;
    } else {
      output = secondCountry == '<p>No data available</p>' ? false : true;
    }
    return output;
  }
  changePartnerType(type) {
    this.partnerType = type;
    this.resetModels();
    const send = {
      model: this.model,
      partnerType : this.partnerType
    };
    this.optionsSubject.next(send);
  }
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
    //return true;
    if(this.model.year.year == '2014')
      return true;
    else
      return output > 0 ? true : false;
  };
  // trueORfalse(category){
  //   if (category.column=='_2014_8' || category.column=='_2016_8' || category.column=='_2014_7' || category.column=='_2016_7') {
  //     return false;
  //   }else{return true;}
  // };  
  modalIndicator(indicator){ 
    if(indicator.id==2)
    {  return true;    }  else{ return false;}
  }
  modalSubcategory(indicator){
    this.column_indicator=[{}];
    this.dateModal=indicator2Exceptions[Number(indicator.column.split('_')[3])-1] ;
    this.dateModal.title=this.dateModal.title.replace('Module '+this.dateModal.id+' • ','');
    let column_query, column_indicator='';
    this.column_content=indicator.column;
      for(let i=0; i<this.dateModal.content.length;i++)
      { column_indicator=column_indicator+indicator.column+'_'+this.dateModal.content[i].id+','; }
        column_query=column_indicator.slice(0, column_indicator.length-1);
        // console.log("para query",column_query, this.country_modal);
        this.mapService.modalQuery(column_query, this.country_modal).subscribe(val => {
        this.column_indicator = val;
      });
  }
  marcadorIndicatorContent(id)
  {
    return (this.column_indicator[0][this.column_content+'_'+id]=='Yes')?'check':'close';
  }
  valorIndicatorContent(id)
  {
    if(this.column_indicator[0][this.column_content+'_'+id])
    {
      return  ((this.column_indicator[0][this.column_content+'_'+id]).toString()!='9999')?true:false;
    }
  }
  updateSubindicatorValues(event) {
    console.log("Subindicator", event);
    if (event.options.subcategory !== false && event.options.subcategory !== null) {
      this.selectSubcategory(event.options.category, event.options.subcategory);
    } else {
      console.log("ELSE SUBCATEGORY ");
      this.unselectSubCategory();
    }
  }
  updateIndicatorValues(event) {
    this.iconIndicator='';
    const category = event.options.category;
    if (category.label !== 'Select indicator') {
    this.noIsInvalidSelection(category);
    this.selectCategory(category);
    } else {
      this.model.category = category;
      this.unselectCategory();
    }
  }
  updateYearValues(event) {
    console.log('EVENT',event);
    if (event.options) {
      this.changeYearLabel(event.options.year);
      this.getCategoriesNotNull();
      this.getIndicator(event.options.year === '2016'?'1a':'5a');
      // this.exportCsvViewer(event.options.indicator);
    }
  }
  icon1a_8(event) {
    console.log('----> indicator -->  ', event.options.category.id);
    const indi = event.options.category.id;
    return this.mapService.iconIndicator_1_8(indi);
  }
  openModal(template: TemplateRef<any>) {
    this.viewModal = false;
    this.modalRef = this.modalService.show(template);
  }
}
