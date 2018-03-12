import { TestBed, inject } from '@angular/core/testing';

import { CountryAnalysisService } from './country-analysis.service';

describe('CountryAnalysisService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CountryAnalysisService]
    });
  });

  it('should be created', inject([CountryAnalysisService], (service: CountryAnalysisService) => {
    expect(service).toBeTruthy();
  }));
});
