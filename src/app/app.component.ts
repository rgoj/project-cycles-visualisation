import { Component } from '@angular/core';

import { GoogleSheetsService } from './services/google-sheets.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  data;

  title = 'lm-joint-showcase';
  scale = 1000;

  centreX = this.scale;
  centreY = this.scale / 2;

  circles = [
    { title: '1' },
    { title: '2' },
    { title: '3' },
    { title: '4' },
    { title: '5' },
    { title: '6' },
    { title: '7' },
    { title: '8' },
    { title: '9' }
  ]

  radius = 450;

  lines = [];

  constructor(private googleSheets: GoogleSheetsService) {
    this.googleSheets.getData().subscribe((data) => {
      this.data = data;
      this.processData();
    });
    this.lines.push('asdf');
  }

  processData() {
    const headings = this.data.values[0];
    const indexFirstStage = this.convertColumn('L');
    const indexLastStage = this.convertColumn('Y');

    for (let i = indexFirstStage; i < indexLastStage; i++) {
      this.lines.push({ title: headings[i] });
    }

    console.log(this.lines);
  }



  /*
   * Helper functions
   */

  // Source: https://stackoverflow.com/questions/9905533/convert-excel-column-alphabet-e-g-aa-to-number-e-g-25
  convertColumn(column: string) {
    const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 0;
  
    for (let i = 0, j = column.length - 1; i < column.length; i += 1, j -= 1) {
      result += Math.pow(base.length, j) * (base.indexOf(column[i]) + 1);
    }
    return result;
  };

  edgeX(index, length) {
    const angle = index / length;
    const x = this.radius * Math.sin(angle * 2 * Math.PI);
    return x;
  }

  edgeY(index, length) {
    const angle = index / length;
    const y = this.radius * Math.cos(angle * 2 * Math.PI);
    return y;
  }
}
