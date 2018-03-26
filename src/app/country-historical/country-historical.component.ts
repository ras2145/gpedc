import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { analysisData } from '../../app/analysisData';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Subject } from 'rxjs/Subject';
import { CountryAnalysisService } from '../services/country-analysis.service';
import { GenerateIndicatorsService } from '../services/generate-indicators.service';
import * as d3 from 'd3';
@Component({
  selector: 'app-country-historical',
  templateUrl: './country-historical.component.html',
  styleUrls: ['./country-historical.component.css']
})
export class CountryHistoricalComponent implements OnInit {
  titleSubject: Subject <any> = new Subject();
  filters;
  charttext;
  first = true;
  countries: any;
  firstRow: any;
  loadIndicators: boolean;
  selectedCountry = '';
  indicators = [];
  chartData: any;
  selectedChart = '';
  model = {   };
  indicator = {
    dropdowncountry: '',
    subdropdown: [],
    titlecountry: '',
    indicator: '',
    charttext: '',
    image: '',
    whatdoes: ''
  };
  subIndicator = {
    subdropdown: '',
    titlecountry: '',
    indicator: '',
    charttext: '',
    image: '',
    whatdoes: ''
  };
  isData = false;
  lessData = true;
  buttonMore = true;
  modalRef: BsModalRef;
  @ViewChild('secondGraph') secondGraph: TemplateRef<any>;
  subDropdown = false;
  title = '';

  sortLabel: boolean = false;
  sortValue: boolean = false;

  constructor(private countryAnalysisService: CountryAnalysisService, 
    private modalService: BsModalService, 
    private generateService: GenerateIndicatorsService) { 
  }
  ngOnInit() {
    this.countryAnalysisService.getCountries().subscribe(res => {
      this.countries = res;
      console.log(this.countries);
    });
    this.countryAnalysisService.getFirstRow().subscribe(res => {
      this.firstRow = res;
    });
    this.filters = analysisData;
    this.filters.forEach(filter => {
      if (filter.year === 2016) {
        this.model = filter;
      }
    });
  }
  resetCountry() {
    this.selectedCountry = '';
    this.loadIndicators = false;
    this.sendTitle();
    this.resetIndicators();
  }
  filterIndicator(data) {
    console.log(this.indicators);
    return data.filter(d => {
      let search = [];
      search.push(d.indicator);
      for (let i = 1; i <= 6; i++) {
        search.push(d.indicator + '_' + i);
      }
      return search.filter(s => {
        return this.indicators.filter(ind => ind.indicator === s).length > 0;
      }).length > 0;
    });
  }
  filterSubIndicator(data) {
    return data.filter(d => {
      return this.indicators.filter(ind => d.indicator === ind.indicator).length > 0;
    });
  }
  changeCountry(country) {
    this.selectedCountry = country;
    console.log('COUNTRY ', country);
    this.resetIndicators();
    this.sendTitle();
    this.loadIndicators = false;
    this.subDropdown = false;
    this.countryAnalysisService.getIndicators(this.selectedCountry, this.model['year']).subscribe((res) => {
      this.loadIndicators = true;
      this.indicators = res;
    });
    console.log(this.selectedCountry);  
  }
  canRun() {
    let can = true;
    can = (can && (this.selectedCountry !== ''));
    can = (can && (this.indicator.dropdowncountry !== ''));
    if (this.subDropdown) {
      can = (can && (this.subIndicator.subdropdown !== ''));
    }
    return can;
  }
  run() {
    if (this.selectedCountry === '') {
      alert('Please select a country');
    }
    if (this.indicator.dropdowncountry === '') {
      alert('Please ');
      return;
    }
    if (this.subDropdown) {
      if (this.subIndicator.subdropdown !== '') {
        this.sortLabel = false;
        this.sortValue = false;
        this.countryAnalysisService.getCharData(this.selectedCountry, this.subIndicator.indicator, this.model['year']).subscribe(res => {
          this.chartData = res;
          this.draw(10);
        });
      } else {
        alert('Please select a Sub-Indicator');
        return;
      }
    } else {
      this.sortLabel = false;
      this.sortValue = false;
      this.countryAnalysisService.getCharData(this.selectedCountry, this.indicator.indicator, this.model['year']).subscribe(res => {
        this.chartData = res;
        this.draw(10);
      });
    }
  }
  changeIndicator(indicator) {
    this.indicator = JSON.parse(JSON.stringify(indicator));
    console.log(this.indicator);
    this.sendTitle();
    this.subDropdown = (this.indicator.subdropdown.length > 0);
    this.charttext = this.indicator.charttext;
    this.subIndicator.subdropdown = '';
    if (this.subDropdown) {
      this.indicator.subdropdown.forEach(sub => {
        if (sub.autoselect && this.indicators.filter(ind => sub.indicator === ind.indicator).length > 0) {
          this.subIndicator = sub;
          this.sendTitle();
        }    
      });
    }
  }
  changeSubIndicator(subIndicator) {
    this.subIndicator = JSON.parse(JSON.stringify(subIndicator));
    this.charttext = this.subIndicator.charttext;
    this.sendTitle();
  }
  changeYear(year) {
    this.reset();
  }
  sendTitle() {
    this.title = (this.indicator.titlecountry ? this.indicator.titlecountry : '');
    if (this.subDropdown && this.subIndicator.subdropdown !== '') {
      this.title = (this.subIndicator.titlecountry ? this.subIndicator.titlecountry : '');
      this.charttext = this.subIndicator.charttext;
    }
    this.title = this.title.replace('[YEAR]', this.model['year']);
    this.title = this.title.replace('[DEVELOPING COUNTRY]', this.selectedCountry);
    if (this.selectedCountry === '') {
      this.title = '';
    }
  }
  resetIndicators() {
    this.indicator = {
      dropdowncountry: '',
      subdropdown: [],
      titlecountry: '',
      indicator: '',
      charttext: '',
      image: '',
      whatdoes: ''
    };
    this.subDropdown = false;
    this.subIndicator = {
      subdropdown: '',
      titlecountry: '',
      indicator: '',
      charttext: '',
      image: '',
      whatdoes: ''
    };
  }
  reset() {
    this.indicator = {
      dropdowncountry: '',
      subdropdown: [],
      titlecountry: '',
      indicator: '',
      charttext: '',
      image: '',
      whatdoes: ''
    };
    this.subIndicator = {
      subdropdown: '',
      titlecountry: '',
      indicator: '',
      charttext: '',
      image: '',
      whatdoes: ''
    };
    this.subDropdown = false;
    this.title = '';
    this.selectedCountry = '';
    this.loadIndicators = false;
    this.charttext = '';
    this.isData = false;
    this.buttonMore = true;
    this.lessData = true;
  }
  resetSub() {
    this.subIndicator = {
      subdropdown: '',
      titlecountry: '',
      indicator: '',
      charttext: '',
      image: '',
      whatdoes: ''
    };
    this.charttext = '';
    this.title = (this.indicator.titlecountry ? this.indicator.titlecountry : '');
  }
  show(event) {
    console.log(event);
  }
  getTextIcon() {
    if(this.indicator.indicator ==='8' ) {
      return 'This indicator provides evidence to follow up and review of SDG target 5.c.1, which tracks the proportion of countries with systems to monitor and make public allocations for gender equality and women’s empowerment.';
    } else if (this.indicator.indicator === '1') {
      return 'This indicator provides evidence to follow up and review of SDG target 17.15.1 on the use of country-owned results frameworks and planning tools by providers of development co-operation.';
    }
  }
  showModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  draw(allData?, sort?) {
    this.first = false;
    const scope = this;
    if (sort === 'devpart') {
      if (this.sortLabel) {
        this.chartData.sort((a, b) => {
          return -(a.label.localeCompare(b.label));
        });
      } else {
        this.chartData.sort((a, b) => {
          return a.label.localeCompare(b.label);
        });
      }
    }
    if (sort === 'value') {
      if (this.sortValue) {
        this.chartData.sort((a, b) => {
          if (a.value === b.value) {
            return -(a.label.localeCompare(b.label));
          }
          return a.value - b.value;
        });
      } else {
        this.chartData.sort((a, b) => {
          if (a.value === b.value) {
            return a.label.localeCompare(b.label);
          }
          return b.value - a.value;
        });
      }
    }
    let data = JSON.parse(JSON.stringify(this.chartData));
    this.lessData = data.length <= 10 ? true : false;
    let length = data.length - 10;
    if( allData ) {
      for (let i = 0; i < length; i++) {
        data.pop();
      }
    }
    for (let d of data) {
      d.label = this.firstRow[d.label];
    }

    length = data.length;
    if(length > 0) {
      this.isData = true;
      let div = d3.select("#chart").attr("class", "toolTip");
      let axisMargin = 90,
      margin = 10,
      valueMargin = 4,
      barHeight = 20,
      barPadding = 20,
      bar, svg, scale, xAxis, labelWidth = 0, max;
      const width = parseInt(d3.select('#chart').style('width'), 10),
      height = length * (barHeight + barPadding ) + 120;
      max = 109;
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
        .text(function(d){
          console.log(d.label);
          return d.label + '\t';
        }).each(function() {
          labelWidth = Math.min(1500, Math.ceil(Math.max(labelWidth, this.getBBox().width))) + 2;
        });
      scale = d3.scaleLinear()
        .domain([0, max])
        .range([0, width - margin * 2 - labelWidth]);

      xAxis = d3.axisBottom(scale).
      tickSize(-height + 2 * margin + axisMargin);
      bar.append("rect")
        .attr("transform", "translate("+labelWidth+", 0)")
        .transition()
        .attr("height", barHeight)
        .attr("width", function(d){
            return scale(d.value);
        });

      bar.append("text")
        .attr("class", "value")
        .attr("y", barHeight / 2)
        .attr("dx", d => {
          return -valueMargin + labelWidth + (d.value < 10 ? -22 : d.value < 100 ? -16 : -12);
        }) //margin right
        .attr("dy", ".35em") //vertical align middle
        .attr("text-anchor", "end")
        .style('fill', '#282828')
        .style('font-size', '100%')
        .text(d => {
            return ((d.value * 1.0).toFixed(0) + "%");
        })
        .attr("x", 45)
        .transition()
        .attr("x", function(d) {
            var width = this.getBBox().width;
            return Math.max(width + valueMargin, scale(d.value) + 50);
        });

      svg.insert("g",":first-child")
        .attr("class", "axisHorizontal")
        .attr("transform", "translate(" + (margin + labelWidth) + "," + (height - axisMargin - margin)+")")
        .call(xAxis);

      bar.on('click', function() {
        const self = this; 
        svg.on('click', function() {
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
      bar.append("title")
        .text(function (d) {
          return 'Click to see historical trends in performance';
        });

    } else {
      this.isData = false;
      const content = document.getElementById("chart");
      while (content.firstChild) {
        content.removeChild(content.firstChild);
      }
    }
  }
  exportCSV() {
    if (this.subDropdown) {
      if (this.subIndicator.subdropdown !== '') {
        this.countryAnalysisService.getCharData(this.selectedCountry, this.subIndicator.indicator, this.model['year']).subscribe(res => {
          res.forEach(r => {
            r.label = this.firstRow[r.label];
          });
          this.generateService.exportCSV4_5(this.title + ' Indicator ' + this.indicator.indicator, '4', res);
        });
      } else {
        alert('Please select a Sub-Indicator');
        return;
      }
    } else {
      this.countryAnalysisService.getCharData(this.selectedCountry, this.indicator.indicator, this.model['year']).subscribe(res => {
        res.forEach(r => {
          r.label = this.firstRow[r.label];
        });
        this.generateService.exportCSV4_5(this.title + ' Indicator ' + this.indicator.indicator, '4', res);
      });
    }
    
  }
  drawComplete() {
    this.buttonMore = false;
    this.draw();
  }
  drawLess() {
    this.buttonMore = true;
    this.draw(10);
  }
  openModal() {
    this.modalRef = this.modalService.show(this.secondGraph);
  }
  drawSecondChart(pos) {
    let toDraw = this.chartData[pos];
    this.selectedChart = this.firstRow[toDraw.label];
    console.log('to draw ', toDraw);
    let ind = '';
    if (this.subDropdown) {
      ind = this.subIndicator.indicator;
    } else {
      ind = this.indicator.indicator;
    }
    this.countryAnalysisService.getSecondChartData(this.selectedCountry, ind, toDraw['column']).subscribe(res => {

      const data = [];

      for (let i = 0; i < res.length; i++) {
        const v = +res[i].value;
        if (v === 888) {
          continue;
        }
        data.push({label: res[i].year, value: v});
      }

      const content = document.getElementById("secondChart");
      while (content.firstChild) {
        content.removeChild(content.firstChild);
      }
      const length = data.length;
      const margin = {top: 20, right: 20, bottom: 30, left: 60};
      const width = 550 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
      const formatPercent = d3.format('.0%');
      let x = d3.scaleBand()
      .rangeRound([0, width])
      .padding(0.1);
      let y = d3.scaleLinear().range([height, 0]);
      let xAxis = d3.axisBottom(x);
      let yAxis = d3.axisLeft(y).tickFormat(formatPercent).tickSize(-6);
      let svg = d3.select('#secondChart').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      x.domain(data.map(d => d.label));
      y.domain([0, 1.09999]);
      svg.append('g')
      .call(xAxis)
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`);

      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
        .attr('transform',  'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(ind);

      svg.append('text')
        .attr('x', -(height / 2))
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('color', '#282828')
        .style('font-weight', 'bold')
        .style('letter-spacing', '1px')
        .style('transform', 'rotate(-90deg)')
        .text(this.charttext);

      const bars = svg.selectAll('.bar')
        .data(data)
        .enter().append('g');

      bars.append('rect')
        .attr('class', 'bar2')
        .attr('x', d => x(d.label) + x.bandwidth() / 4)
        .attr('width', x.bandwidth() / 2)
        .attr('y', d => d.value === 999 ? 0 : y(d.value))
        .attr('height', d => d.value === 999 ? 0 : height - y(d.value));

      // align here
      bars.append('text')
        .attr('x', d => x(d.label) + 2 * (x.bandwidth() / 4) - (d.value < 0.1 ? 7 : d.value < 1.0 ? 12 : d.value === 1.0 ? 16 : 37))
        .attr('y', d => d.value === 999 ? height - 5 : y(d.value) - 5)
        .style('font-size', '12px')
        .text((d => (d.value === 999 ? 'Not applicable' : (d.value * 100.0).toFixed(0) + '%')));

    });
  }
  sortDraw(type) {
    if (type == 'devpart') {
      this.sortLabel = !this.sortLabel;
    } else {
      this.sortValue = !this.sortValue;
    }
    if (this.buttonMore) {
      this.draw(10, type);
    } else {
      this.draw(null , type);
    }
  }
  f() {
    console.log(this.indicator && this.indicator.indicator==='10');
    console.log(this.subIndicator && this.subIndicator.subdropdown!=='');
    console.log(this.subIndicator.subdropdown, this.subIndicator.subdropdown!=='');
    return ((this.indicator && this.indicator.indicator==='10') || (this.subIndicator && this.subIndicator.subdropdown!==''));
  }
}
