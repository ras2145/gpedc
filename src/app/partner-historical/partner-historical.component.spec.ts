import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerHistoricalComponent } from './partner-historical.component';

describe('PartnerHistoricalComponent', () => {
  let component: PartnerHistoricalComponent;
  let fixture: ComponentFixture<PartnerHistoricalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerHistoricalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerHistoricalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
