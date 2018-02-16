import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryHistoricalComponent } from './country-historical.component';

describe('CountryHistoricalComponent', () => {
  let component: CountryHistoricalComponent;
  let fixture: ComponentFixture<CountryHistoricalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountryHistoricalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryHistoricalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
