import { TestBed } from '@angular/core/testing';

import { GoogleSheetsService } from './google-sheets.service';

describe('GoogleSheetsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GoogleSheetsService = TestBed.get(GoogleSheetsService);
    expect(service).toBeTruthy();
  });
});
