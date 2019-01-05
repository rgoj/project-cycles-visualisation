import { Injectable } from '@angular/core';

import { GoogleSheetsService } from './google-sheets.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private googleSheets: GoogleSheetsService) { }

  getData() {
    return this.googleSheets.getData();
  }
}
