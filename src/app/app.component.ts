import { Component } from '@angular/core';

import { Item, ItemArc, Aspect } from './interfaces/item';
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
  items: Item[] = [];

  constructor(private googleSheets: GoogleSheetsService) {
    this.googleSheets.getData().subscribe((data) => {
      this.data = data;
      this.processData();
    });
  }

  processData() {
    const indexFirstLine = this.convertColumn('L');
    const indexLastLine = this.convertColumn('Y');

    const indexFirstCircle = this.convertColumn('Z');
    const indexLastCircle = this.convertColumn('AK');

    const sheetConfig = {
      headings: this.data.values[0],

      indexFirstLine: indexFirstLine,
      indexLastLine: indexLastLine,
      numberOfLines: indexLastLine - indexFirstLine,

      indexFirstCircle: indexFirstCircle,
      indexLastCircle: indexLastCircle,
      numberOfCircles: indexLastCircle - indexFirstCircle,

      indexFirstItem: 1,
    }

    for (let i = 0; i <= sheetConfig.numberOfLines; i++) {
      this.lines.push({
        title: sheetConfig.headings[indexFirstLine + i],
        angle: this.lineAngle(i, sheetConfig.numberOfLines),
        edgeX: this.centreX + this.edgeX(i, sheetConfig.numberOfLines),
        edgeY: this.centreY + this.edgeY(i, sheetConfig.numberOfLines)
      });
    }
    console.log(this.lines);

    this.circleRadialDistance = this.radius / (sheetConfig.numberOfCircles + 1);
    console.log(this.circleRadialDistance);

    for (let i = 0; i <= sheetConfig.numberOfCircles; i++) {
      this.circles.push({
        title: sheetConfig.headings[i + indexFirstCircle],
        radius: this.circleRadialDistance * (i + 1)
      });
    }
    console.log(this.circles);


    for (let i = sheetConfig.indexFirstItem; i < sheetConfig.indexFirstItem + 1; i++) {
    // for (let i = indexFirstItem; i < this.data.values.length; i++) {
      console.log('Processing row ' + i);
      const itemRow = this.data.values[i];
      const item = new Item();

      item.primaryAspect = this.processItemAspects(sheetConfig, itemRow);

      // TODO: Move to "processItemStages";
      let arcFirstStage: null|number = null;
      let arcLastStage: null|number = null;
      for (let stage = 0; stage <= sheetConfig.numberOfLines + 1; stage++) {
        const stageColumn = indexFirstLine + stage;
        const stageState = itemRow[stageColumn];

        if (stageState === 'YES' && arcFirstStage === null) {
          arcFirstStage = stage;          
        }

        if (
          stageState !== 'YES' && arcFirstStage !== null && arcLastStage === null ||
          stageState === 'YES' && stageColumn === indexLastLine
        ) {
          arcLastStage = stage - 1;

          item.itemArcs.push(
            this.createArc(
              sheetConfig,
              arcFirstStage,
              arcLastStage,
              item.primaryAspect.aspectIndex
            )
          );
          
          arcFirstStage = null;
          arcLastStage = null;
        }
      }

      console.log('Adding the following item:');
      console.log(item);
      this.items.push(item);
    }

  }

  processItemAspects(sheetConfig, itemRow: []): Aspect {
    const primaryAspect = new Aspect;

    for (let aspect = 0; aspect < sheetConfig.numberOfLines; aspect++) {
      const aspectColumn = sheetConfig.indexFirstCircle + aspect;
      const aspectState = itemRow[aspectColumn];
      if (aspectState === 'PRIMARY') {
        primaryAspect.aspectIndex = aspect;
        primaryAspect.aspectName = this.circles[aspect].title;
      }
    }

    return primaryAspect;
  }

  createArc(
    sheetConfig,
    firstStageIndex: number,
    lastStageIndex: number,
    aspectIndex: number
  ): ItemArc {
    const largeArcFlag = (lastStageIndex - firstStageIndex) / sheetConfig.numberOfLines > 0.5 ? 1 : 0;

    const itemArc: ItemArc = {
      firstStageIndex: firstStageIndex,
      lastStageIndex: lastStageIndex, 

      firstStageName: this.lines[firstStageIndex].title,
      lastStageName: this.lines[lastStageIndex].title,

      aspectIndex: aspectIndex,
      aspectName: this.circles[aspectIndex].title,

      radius: this.circles[aspectIndex].radius,
      startX: this.intersectX(sheetConfig, firstStageIndex, aspectIndex),
      startY: this.intersectY(sheetConfig, firstStageIndex, aspectIndex),
      endX: this.intersectX(sheetConfig, lastStageIndex + 1, aspectIndex),
      endY: this.intersectY(sheetConfig, lastStageIndex + 1, aspectIndex),

      largeArcFlag: largeArcFlag,
    } 
    console.log('Adding arc')
    return itemArc;
  }


  /*
   * Helper functions
   */

  // Converts Excel column to index
  // Source: https://stackoverflow.com/questions/9905533/convert-excel-column-alphabet-e-g-aa-to-number-e-g-25
  convertColumn(column: string) {
    const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 0;
  
    for (let i = 0, j = column.length - 1; i < column.length; i += 1, j -= 1) {
      result += Math.pow(base.length, j) * (base.indexOf(column[i]) + 1);
    }
    return result - 1;
  };

  lineAngle(index: number, length: number) {
    return index / (length + 1);
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

  intersectX(sheetConfig, stageIndex, aspectIndex) {
    const angle = this.lineAngle(stageIndex, sheetConfig.numberOfLines);
    const x = this.circles[aspectIndex].radius * Math.sin(angle * 2 * Math.PI);
    return this.centreX + x;
  }

  intersectY(sheetConfig, stageIndex, aspectIndex) {
    const angle = this.lineAngle(stageIndex, sheetConfig.numberOfLines);
    const y = this.circles[aspectIndex].radius * Math.cos(angle * 2 * Math.PI);
    return this.centreY + y;
  }
}
