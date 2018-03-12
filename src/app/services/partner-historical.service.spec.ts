import { TestBed, inject } from '@angular/core/testing';

import { PartnerHistoricalService } from './partner-historical.service';

describe('PartnerHistoricalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PartnerHistoricalService]
    });
  });

  it('should be created', inject([PartnerHistoricalService], (service: PartnerHistoricalService) => {
    expect(service).toBeTruthy();
  }));
});
