import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { ModelService } from '../services/model.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {
  categoriesNotNull: any;
  selectedCountry: any = false;
  indicatorsSelectedCountry: any;
  partners: any;
  categorizedPartners: any;
  mapTitle: any;
  geoJson: any;
  indicatorSelectedFooter: any;
  footerTab = '';
  footerText = '';
  titles: any;
  years: any;
  indicator = true;
  subDropdown: any;
  subIndicator = false;
  model = {
    year: {
      year: '2016',
      categories: []
    },
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
  partnerType = 'partcntry';
  arrayPartner =  ['1a', '2', '3', '5a', '5b', '6', '7', '8', '9a', '9b', '10'];
  arrayDev = ['1a', '4', '5a', '5b', '6', '9b', '10'];

  @Input() optionsSubject: Subject<any>;
  @Output() changeSubindicator = new EventEmitter();
  @Output() changeYear = new EventEmitter();
  @Output() changeIndicator = new EventEmitter();
  constructor(
    private loaderService: LoaderService,
    private modelService: ModelService
  ) { }

  ngOnInit() {
    this.titles = this.modelService.getTitles();
  }
  ngOnChanges() {
    this.optionsSubject.subscribe(event => {
      this.model = event.model;
      this.partnerType = event.partnerType;
      console.log('GOOD', this.partnerType);
      this.newValues();
    });
  }
  newValues() {
    this.changeyearLabel(this.model.year);
  }
  getYears() {
    this.years = this.modelService.getYears();
    return this.years;
  }
  getIndicators(year) {
    const categories = this.modelService.getIndicators(year);
    const array = this.partnerType === 'devpart' ? this.arrayDev : this.arrayPartner;
    const categoriesShow = [];
    for (const cat of categories) {
      if (array.includes(cat.id) ) {
        categoriesShow.push(cat);
      }
    }
    return categoriesShow;

  }
  selectCategory(category) {
    this.model.category = category;
    this.model.subcategory = null;
    this.indicator = false;
    this.subIndicator = true;
    this.changeIndicatorEmit();
  }
  unselectCategory() {
    this.subIndicator = false;
    this.indicator = true;
    this.subDropdown = false;
    this.model.category = {
      label: 'Select indicator',
      title: '',
      column: '',
      id: '',
      legendText: ''
    };
    this.changeIndicatorEmit();
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
  changeyearLabel(year) {
    this.unselectCategory();
    this.changeYearEmit();
  }
  selectSubcategory(category, subcategory) {
    this.model.category = category;
    this.model.subcategory = subcategory;
    this.subIndicator = false;
    this.indicator = false;
    this.changeEmit();
  }
  unselectSubCategory() {
    this.subIndicator = false;
    this.model.subcategory = false;
    const category = this.model.category;
    this.changeEmit();
  }
  changeYearEmit() {
    this.changeYear.emit({
      options: this.model
    });
  }
  changeIndicatorEmit() {
    this.changeIndicator.emit({
      options: this.model
    });
  }
  changeEmit() {
    this.changeSubindicator.emit({
      options: this.model
    });
  }
}
