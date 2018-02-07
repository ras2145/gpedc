import { TestBed, inject } from '@angular/core/testing';

import { GenerateIndicatorsService } from './generate-indicators.service';

describe('GenerateIndicatorsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GenerateIndicatorsService]
    });
  });

  it('should be created', inject([GenerateIndicatorsService], (service: GenerateIndicatorsService) => {
    expect(service).toBeTruthy();
  }));
});
