import { Component, OnInit } from '@angular/core';
import { analysisData } from '../../app/analysisData';
import { Subject } from 'rxjs/Subject';
import { CountryAnalysisService } from '../services/country-analysis.service';
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
  countries: any;
  firstRow: any;
  selectedCountry = 'Select Country';
  chartData: any;
  selectedChart = '';
  model = {   };
  indicator = {
    dropdowncountry: 'Select an indicator',
    subdropdown: [],
    titlecountry: '',
    indicator: '',
    charttext: ''
  };
  subIndicator = {
    subdropdown: 'Select Sub-Indicator',
    titlecountry: '',
    indicator: '',
    charttext: ''
  };  
  subDropdown = false;
  title = '';
  constructor(private countryAnalysisService: CountryAnalysisService) { 
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
    this.selectedCountry = 'Select Country';
    this.sendTitle();
  }
  changeCountry(country) {
    this.selectedCountry = country;
    this.sendTitle();
    console.log(this.selectedCountry);
  }
  run() {
    console.log(this.indicator);
    console.log(this.subIndicator);
    console.log(this.selectedCountry);
    console.log(this.model['year']);
    if (this.selectedCountry === 'Select Country') {
      alert('Please select a country');
    }
    if (this.indicator.dropdowncountry === 'Select an indicator') {
      alert('Please select an Indicator');
      return;
    }
    if (this.subDropdown) {
      if (this.subIndicator.subdropdown !== 'Select Sub-Indicator') {
        this.countryAnalysisService.getCharData(this.selectedCountry, this.subIndicator.indicator, this.model['year']).subscribe(res => {
          this.chartData = res;
          this.draw();
        });
      } else {
        alert('Please select a Sub-Indicator');
        return;
      }
    } else {
      this.countryAnalysisService.getCharData(this.selectedCountry, this.indicator.indicator, this.model['year']).subscribe(res => {
        this.chartData = res;
        this.draw();
      });
    }
  }
  changeIndicator(indicator) {
    this.indicator = JSON.parse(JSON.stringify(indicator));
    console.log(this.indicator);
    this.sendTitle();
    this.subDropdown = (this.indicator.subdropdown.length > 0);
    this.charttext = this.indicator.charttext;
    this.subIndicator.subdropdown = 'Select Sub-Indicator';
    if (this.subDropdown) {
      this.indicator.subdropdown.forEach(sub => {
        if (sub.autoselect) {
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
    if (this.subDropdown && this.subIndicator.subdropdown !== 'Select Sub-Indicator') {
      this.title = (this.subIndicator.titlecountry ? this.subIndicator.titlecountry : '');
      this.charttext = this.subIndicator.charttext;
    }
    this.title = this.title.replace('[YEAR]', this.model['year']);
    this.title = this.title.replace('[DEVELOPING COUNTRY]', this.selectedCountry);
    if (this.selectedCountry === 'Select Country') {
      this.title = '';
    }
  }
  reset() {
    this.indicator = {
      dropdowncountry: 'Select an indicator',
      subdropdown: [],
      titlecountry: '',
      indicator: '',
      charttext: ''
    };
    this.subIndicator = {
      subdropdown: 'Select Sub-Indicator',
      titlecountry: '',
      indicator: '',
      charttext: ''
    };
    this.subDropdown = false;
    this.title = '';
    this.selectedCountry = 'Select Country';
    this.charttext = '';
  }
  resetSub() {
    this.subIndicator = {
      subdropdown: 'Select Sub-Indicator',
      titlecountry: '',
      indicator: '',
      charttext: ''
    };
    this.charttext = '';
    this.title = (this.indicator.titlecountry ? this.indicator.titlecountry : '');
  }
  show(event) {
    console.log(event);
  }
  draw() {
    const scope = this;
    let data = this.chartData;
    for (let d of data) {
      d.label = this.firstRow[d.label];
    }
    const length = data.length;
    console.log('length ', length);
    let div = d3.select("#chart").attr("class", "toolTip");
    let axisMargin = 90,
    margin = 10,
    valueMargin = 4,
    barHeight = 20,
    barPadding = 20,
    bar, svg, scale, xAxis, labelWidth = 0, max;
    console.log(length * (barHeight + margin * 2) + 10);
    const width = parseInt(d3.select('#chart').style('width'), 10),
    height = length * (barHeight + barPadding ) + 120;
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
            .attr("width", width)
            .attr("height", height);
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
          return d.label;
      }).each(function() {
        // labelWidth = 50;
        labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
      });
    console.log(bar);
    scale = d3.scaleLinear()
      .domain([0, max])
      .range([0, width - margin*2 - labelWidth]);

    xAxis = d3.axisBottom(scale).
    tickSize(-height + 2 * margin + axisMargin);
    
    bar.append("rect")
      .attr("transform", "translate("+labelWidth+", 0)")
      .attr("height", barHeight)
      .attr("width", function(d){
          return scale(d.value);
      });

    bar.append("text")
      .attr("class", "value")
      .attr("y", barHeight / 2)
      .attr("dx", -valueMargin + labelWidth) //margin right
      .attr("dy", ".35em") //vertical align middle
      .attr("text-anchor", "end")
      .text(d => {
          return (d.value+"%");
      })
      .attr("x", function(d) {
          var width = this.getBBox().width;
          return Math.max(width + valueMargin, scale(d.value));
      });
    
    svg.insert("g",":first-child")
      .attr("class", "axisHorizontal")
      .attr("transform", "translate(" + (margin + labelWidth) + ","+ (height - axisMargin - margin)+")")
      .call(xAxis);
    svg.on('click', function() {
      const self = this; 
      bar.on('click', () => {
        const coords = d3.mouse(self);
        let pos = -1;
        for (let index = 0; index < inRangeCoord.length; index++) {
          const coord = inRangeCoord[index];
          if (coords[1] < coord) {
            pos = index;
            break;
          }
        }
        scope.drawSecondChart(pos);    
      });
    });
            
  }
  drawSecondChart(pos) {
    let toDraw = this.chartData[pos];
    this.selectedChart = toDraw.label;
    const content = document.getElementById("chart2"); 
    while (content.firstChild) { 
      content.removeChild(content.firstChild); 
    } 
    console.log('to draw ', toDraw);
    let ind = '';
    if (this.subDropdown) {
      ind = this.subIndicator.indicator;
    } else {
      ind = this.indicator.indicator;
    }
    this.countryAnalysisService.getSecondChartData(this.selectedCountry, ind, toDraw['column']).subscribe(res => {
      console.log(res);
      const years = ['2005', '2007', '2010', '2014', '2016'];
      const data = [];
      years.forEach(year => {
        data.push({label: year, value: 0});
      });
      res.forEach(r => {
        for (let d of data) {
          if (d.label === r.year) {
            d.value = +(+r.value * 100).toFixed(3);
          }
        }
      });
      console.log('my data is ', data);
    });
  }
}
