import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  // Holly's actual spreadsheet!
  //'https://docs.google.com/spreadsheets/d/1Oj8zoAbxjTsGsuzDoOzCPiw7CemWQmWRkAJH8CQjZ-E/edit?usp=sharing'
  sheetsId = '1Oj8zoAbxjTsGsuzDoOzCPiw7CemWQmWRkAJH8CQjZ-E'; 

  // My API key
  apiKey = 'AIzaSyAXPMtMuYPyseYTM1AURzZ7KtF3vkTf08I';

  sheetsUrl = 'https://sheets.googleapis.com/v4/spreadsheets/' + this.sheetsId + '/values/Sheet1?key=' + this.apiKey;

  constructor(private http: HttpClient) { }

  getData() {
    return this.http.get(this.sheetsUrl);
  }
}
