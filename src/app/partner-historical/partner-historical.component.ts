import { Component, OnInit } from '@angular/core';
import { PartnerHistoricalService } from '../services/partner-historical.service';
import { Indicator } from './indicator.model';
import { Subindicator } from './subindicator.model';


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
  selectedYear: number;
  selectedIndicatorId: string;
  selectedSubindicatorId: string;

  indicators: Array<Indicator>;

  constructor(private phService: PartnerHistoricalService) {
    this.selectedYear = Years._2016; // defalut year
    this.selectedIndicatorId = null;
    this.selectedSubindicatorId = null;
    this.indicators = new Array<Indicator>();
  }

  ngOnInit() {
    this.getIndicatorsByYear(Years._2005);
    console.log(this.indicators);
  }
  getIndicatorsByYear(yearId) {
    this.indicators = this.phService.getIndicatorsByYear(yearId);
  }
}
