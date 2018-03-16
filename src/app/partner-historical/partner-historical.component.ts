import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { PartnerHistoricalService } from '../services/partner-historical.service';
import { Indicator } from './indicator.model';
import { Subindicator } from './subindicator.model';
import { Year } from './year.model';
import { IOption } from '../lib/ng-select/option.interface.d';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import * as d3 from 'd3';

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
  chartTitle: string;

  partners: any;
  dropdownContent: Array<any>;

  selectedDevPartner: any;
  selectedPartnerTypes: Array<boolean>;

  chartData: any;
  isData: boolean;
  lessData: boolean;
  buttonMore: boolean;

  modalRef: BsModalRef;
  @ViewChild('secondGraph') secondGraph: TemplateRef<any>;

  selectedChart: string;

  constructor(private phService: PartnerHistoricalService, private modalService: BsModalService) {
    this.selectedYearId = Years._2016; // defalut year
    this.years = this.phService.getYears();

    this.selectedYear = this.years[this.selectedYearId];
    this.selectedDevPartner = null;
    this.selectedIndicator = null;
    this.selectedSubindicator = null;

    this.yearModel = new Year();

    this.dropdownContent = new Array<any>();
    this.selectedPartnerTypes = new Array<boolean>();

    this.isData = false;
    this.lessData = true;
    this.buttonMore = true;

    this.selectedChart = '';
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
    } else if (this.selectedIndicator && this.selectedIndicator.id === '10' && this.selectedDevPartner) {
      ans = this.selectedIndicator.title;
      ans = ans.replace('[YEAR]', String(this.yearModel.year));
      ans = ans.replace('[DEVELOPMENT PARTNER]', this.selectedDevPartner);
    }
    this.navbarTitle = ans;
  }
  getChartTitle() {
    let ans = '';
    if (this.selectedSubindicator && this.selectedDevPartner) {
      ans = this.selectedSubindicator.chartText;
    } else if (this.selectedIndicator && this.selectedIndicator.id === '10' && this.selectedDevPartner) {
      ans = this.selectedIndicator.chartText;
    }
    this.chartTitle = ans;
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
    if (this.selectedDevPartner && (this.selectedSubindicator || (this.selectedIndicator && this.selectedIndicator.id === '10'))) {
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
          this.chartData = res;
          this.getChartTitle();
          this.drawChart(10);
        }
      );
    } else {
      alert('Select a indicator, subindicator and a development partner');
    }
  }

  drawChart(allData?) {
    const scope = this;
    let data = this.chartData;
    this.lessData = data.length <= 10 ? true : false;
    let length = data.length - 10;
    if (allData) {
      for (let i = 0; i < length; i++) {
        data.pop();
      }
    }

    length = data.length;
    console.log('length ', length);
    if (length > 0) {
      this.isData = true;
      let div = d3.select("#chart").attr("class", "toolTip");
      let axisMargin = 90,
        margin = 10,
        valueMargin = 4,
        barHeight = 20,
        barPadding = 20,
        bar, svg, scale, xAxis, labelWidth = 0, max;
      console.log(length * (barHeight + margin * 2) + 10);
      const width = parseInt(d3.select('#chart').style('width'), 10),
        height = length * (barHeight + barPadding) + 120;
      console.log(length, barHeight, barPadding, (length * (barHeight + barPadding * 2)));
      console.log(width, height);
      max = 109;
      console.log('my max is ', max, data);
      const content = document.getElementById("chart");
      while (content.firstChild) {
        content.removeChild(content.firstChild);
      }
      svg = d3.select('#chart')
        .append("svg")
        .attr("width", width + 30)
        .attr("height", height - 35);
      svg.selectAll('.bar').remove();
      bar = svg.selectAll("g")
        .data(data)
        .enter()
        .append("g");
      let inRangeCoord = [];
      bar.attr("class", "bar")
        .attr("cy", 0)
        .attr("transform", (d, i) => {
          if (i) {
            inRangeCoord.push((i * (barHeight + barPadding) + barPadding));
          }
          return "translate(" + margin + "," + (i * (barHeight + barPadding) + barPadding) + ")";
        });
      inRangeCoord.push(Number.MAX_VALUE);
      bar.append("text")
        .attr("class", "label")
        .attr("y", barHeight / 2)
        .attr("dy", ".35em") //vertical align middle
        .text(function (d) {
          console.log('LABEL', d.label);
          return d.label;
        }).each(function () {
          console.log('Width', this.getBBox());
          labelWidth = Math.min(1500, Math.ceil(Math.max(labelWidth, this.getBBox().width)));
        });
      scale = d3.scaleLinear()
        .domain([0, max])
        .range([0, width - margin * 2 - labelWidth]);

      xAxis = d3.axisBottom(scale).
        tickSize(-height + 2 * margin + axisMargin);
      console.log('LABEL WIDTH', labelWidth);
      bar.append("rect")
        .attr("transform", "translate(" + labelWidth + ", 0)")
        .attr("height", barHeight)
        .attr("width", function (d) {
          return scale(d.value);
        });

      bar.append("text")
        .attr("class", "value")
        .attr("y", barHeight / 2)
        .attr("dx", -valueMargin + labelWidth) //margin right
        .attr("dy", ".35em") //vertical align middle
        .attr("text-anchor", "end")
        .text(d => {
          return (d.value + "%");
        })
        .attr("x", function (d) {
          var width = this.getBBox().width;
          return Math.max(width + valueMargin, scale(d.value));
        });

      svg.insert("g", ":first-child")
        .attr("class", "axisHorizontal")
        .attr("transform", "translate(" + (margin + labelWidth) + "," + (height - axisMargin - margin) + ")")
        .call(xAxis);
      bar.on('click', function () {
        const self = this;
        svg.on('click', function () {
          const coords = d3.mouse(this);
          let pos = -1;
          for (let index = 0; index < inRangeCoord.length; index++) {
            const coord = inRangeCoord[index];
            if (coords[1] < coord) {
              pos = index;
              break;
            }
          }
          scope.openModal();
          scope.drawSecondChart(pos);
        });
      });
    } else {
      this.isData = false;
      const content = document.getElementById("chart");
      while (content.firstChild) {
        content.removeChild(content.firstChild);
      }
    }
  }

  drawComplete() {
    this.buttonMore = false;
    if (this.selectedDevPartner && (this.selectedSubindicator || (this.selectedIndicator && this.selectedIndicator.id === '10'))) {
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
          this.chartData = res;
          this.getChartTitle();
          this.drawChart();
        }
      );
    } else {
      alert('Select a indicator, subindicator and a development partner');
    }
  }

  drawLess() {
    this.buttonMore = true;
    this.runAnalysis();
  }

  openModal() {
    this.modalRef = this.modalService.show(this.secondGraph);
  }

  drawSecondChart(pos) {
    console.log(pos);
    let toDraw = this.chartData[pos];
    this.selectedChart = toDraw.label;
    if (this.selectedDevPartner && (this.selectedSubindicator || (this.selectedIndicator && this.selectedIndicator.id === '10'))) {
      const sYear = String(this.selectedYear);
      let sIndicator;
      if (!this.selectedSubindicator) { // special case for indicator 10
        sIndicator = this.selectedIndicator.id;
      } else {
        sIndicator = this.selectedSubindicator.id;
      }
      const sDevPartner = this.selectedDevPartner;
      this.phService.getSecondChartData(sDevPartner, sIndicator, this.selectedChart).subscribe(res => {
        console.log(res);
        const years = ['2005', '2007', '2010', '2014', '2016'];
        const data = [];
        years.forEach(year => {
          data.push({ label: year, value: 0 });
        });
        res.forEach(r => {
          for (let d of data) {
            if (d.label === r.year) {
              if (+r.value > 1) {
                continue;
              }
              d.value = +(+r.value);
            }
          }
        });
        const content = document.getElementById("secondChart");
        while (content.firstChild) {
          content.removeChild(content.firstChild);
        }
        const length = data.length;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = 580 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
        const formatPercent = d3.format('.0%');
        let x = d3.scaleBand()
          .rangeRound([0, width])
          .padding(0.1);
        let y = d3.scaleLinear().range([height, 0]);
        let xAxis = d3.axisBottom(x);
        let yAxis = d3.axisLeft(y).tickFormat(formatPercent).tickSize(-width + margin.left / 2);
        let svg = d3.select('#secondChart').append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
        console.log(svg);
        x.domain(data.map(d => d.label));
        y.domain([0, 1]);
        svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', `translate(0,${height})`)
          .call(xAxis);
        svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text(sIndicator);

        console.log(x.bandwidth());
        svg.selectAll('.bar')
          .data(data)
          .enter().append('rect')
          .attr('class', 'bar')
          .attr('x', d => x(d.label) + 23.75)
          .attr('width', x.bandwidth() / 2)
          .attr('y', d => y(d.value))
          .attr('height', d => height - y(d.value));
      });
    }
  }
}
