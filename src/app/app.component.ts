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

  radius = 490;
  circleRadialDistance;

  circles = [];
  lines = [];

  constructor(private googleSheets: GoogleSheetsService) {
    this.googleSheets.getData().subscribe((data) => {
      this.data = data;
      this.processData();
    });
  }

  processData() {
    const headings = this.data.values[0];

    const indexFirstLine = this.convertColumn('L');
    const indexLastLine = this.convertColumn('Y');
    const numberOfLines = indexLastLine - indexFirstLine;

    const indexFirstCircle = this.convertColumn('Z');
    const indexLastCircle = this.convertColumn('AK');

    for (let i = 0; i < numberOfLines; i++) {
      this.lines.push({
        title: headings[indexFirstLine + i],
        angle: this.lineAngle(i, numberOfLines),
        edgeX: this.centreX + this.edgeX(i, numberOfLines),
        edgeY: this.centreY + this.edgeY(i, numberOfLines)
      });
    }

    for (let i = indexFirstCircle; i < indexLastCircle; i++) {
      this.circles.push({ title: headings[i] });
    }
    this.circleRadialDistance = this.radius / this.circles.length;

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

  lineAngle(index: number, length: number) {
    return index / length;
  }

  edgeX(index: number, length: number) {
    const angle = this.lineAngle(index, length);
    const x = this.radius * Math.sin(angle * 2 * Math.PI);
    return x;
  }

  edgeY(index: number, length: number) {
    const angle = this.lineAngle(index, length);
    const y = this.radius * Math.cos(angle * 2 * Math.PI);
    return y;
  }
}
