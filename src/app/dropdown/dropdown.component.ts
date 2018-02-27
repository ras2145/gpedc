import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { ModelService } from '../services/model.service';

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
    year: '2016',
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
  @Output() changeValues = new EventEmitter();

  constructor(
    private loaderService: LoaderService,
    private modelService: ModelService
  ) { }

  ngOnInit() {
    this.titles = this.modelService.getTitles();
  }
  getYears() {
    this.years = this.modelService.getYears();
    return this.years;
  }
  getIndicators(year) {
    const categories = this.modelService.getIndicators(year);
    return categories;
  }
  selectCategory(category) {
    this.model.category = category;
    this.model.subcategory = null;
    this.indicator = false;
    this.subIndicator = true;
    this.changeEmit();
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
    this.changeEmit();
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
    this.model.year = year;
    this.unselectCategory();
    this.changeEmit();
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
  changeEmit() {
    this.changeValues.emit({
      options: this.model
    });
  }
}
