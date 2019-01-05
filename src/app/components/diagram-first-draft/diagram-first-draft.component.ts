import { Component } from '@angular/core';

import { Entry, EntryArc, Aspect } from '../../interfaces/item';
import { GoogleSheetsService } from '../../services/google-sheets.service';

@Component({
  selector: 'app-diagram-first-draft',
  templateUrl: './diagram-first-draft.component.html',
  styleUrls: ['./diagram-first-draft.component.scss']
})
export class DiagramFirstDraftComponent {
  data;

  title = 'lm-joint-showcase';
  scale = 1000;

  centreX = this.scale;
  centreY = this.scale / 2;

  radius = 490;
  circleRadialDistance;

  stages = [];
  subsystems = [];
  entries: Entry[] = [];

  constructor(private googleSheets: GoogleSheetsService) {
    this.googleSheets.getData().subscribe((data) => {
      this.data = data;
      this.processData();
    });
  }

  processData() {
    const indexFirstStage = this.convertColumn('L');
    const indexLastStage = this.convertColumn('Y');

    const indexFirstSubsystem = this.convertColumn('Z');
    const indexLastSubsystem = this.convertColumn('AK');

    const sheetConfig = {
      headings: this.data.values[0],

      indexFirstStage: indexFirstStage,
      indexLastStage: indexLastStage,
      numberOfStages: indexLastStage - indexFirstStage,

      indexFirstSubsystem: indexFirstSubsystem,
      indexLastSubsystem: indexLastSubsystem,
      numberOfSubsystems: indexLastSubsystem - indexFirstSubsystem,

      indexFirstEntry: 1,
    }

    for (let i = 0; i <= sheetConfig.numberOfStages; i++) {
      this.stages.push({
        title: sheetConfig.headings[indexFirstStage + i],
        angle: this.lineAngle(i, sheetConfig.numberOfStages),
        edgeX: this.centreX + this.edgeX(i, sheetConfig.numberOfStages),
        edgeY: this.centreY + this.edgeY(i, sheetConfig.numberOfStages)
      });
    }
    console.log(this.stages);

    this.circleRadialDistance = this.radius / (sheetConfig.numberOfSubsystems + 1);
    console.log(this.circleRadialDistance);

    for (let i = 0; i <= sheetConfig.numberOfSubsystems; i++) {
      this.subsystems.push({
        title: sheetConfig.headings[i + indexFirstSubsystem],
        radius: this.circleRadialDistance * (i + 1)
      });
    }
    console.log(this.subsystems);


    for (let i = sheetConfig.indexFirstEntry; i < sheetConfig.indexFirstEntry + 1; i++) {
    // for (let i = sheetConfig.indexFirstEntry; i < this.data.values.length; i++) {
      console.log('Processing row ' + i);
      const itemRow = this.data.values[i];
      const item = new Entry();

      item.text = itemRow[1];

      item.primaryAspect = this.processEntryAspects(sheetConfig, itemRow);

      // TODO: Move to "processEntryStages";
      let arcFirstStage: null|number = null;
      let arcLastStage: null|number = null;
      for (let stage = 0; stage <= sheetConfig.numberOfStages + 1; stage++) {
        const stageColumn = indexFirstStage + stage;
        const stageState = itemRow[stageColumn];

        if (stageState === 'YES' && arcFirstStage === null) {
          arcFirstStage = stage;          
        }

        if (
          stageState !== 'YES' && arcFirstStage !== null && arcLastStage === null ||
          stageState === 'YES' && stageColumn === indexLastStage
        ) {
          arcLastStage = stage - 1;

          item.arcs.push(
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
      this.entries.push(item);
    }

  }

  processEntryAspects(sheetConfig, itemRow: []): Aspect {
    const primaryAspect = new Aspect;

    for (let aspect = 0; aspect < sheetConfig.numberOfStages; aspect++) {
      const aspectColumn = sheetConfig.indexFirstSubsystem + aspect;
      const aspectState = itemRow[aspectColumn];
      if (aspectState === 'PRIMARY') {
        primaryAspect.aspectIndex = aspect;
        primaryAspect.aspectName = this.subsystems[aspect].title;
      }
    }

    return primaryAspect;
  }

  createArc(
    sheetConfig,
    firstStageIndex: number,
    lastStageIndex: number,
    aspectIndex: number
  ): EntryArc {
    const largeArcFlag = (lastStageIndex - firstStageIndex) / sheetConfig.numberOfStages > 0.5 ? 1 : 0;

    const EntryArc: EntryArc = {
      firstStageIndex: firstStageIndex,
      lastStageIndex: lastStageIndex, 

      firstStageName: this.stages[firstStageIndex].title,
      lastStageName: this.stages[lastStageIndex].title,

      aspectIndex: aspectIndex,
      aspectName: this.subsystems[aspectIndex].title,

      radius: this.subsystems[aspectIndex].radius,
      startX: this.intersectX(sheetConfig, firstStageIndex, aspectIndex),
      startY: this.intersectY(sheetConfig, firstStageIndex, aspectIndex),
      endX: this.intersectX(sheetConfig, lastStageIndex + 1, aspectIndex),
      endY: this.intersectY(sheetConfig, lastStageIndex + 1, aspectIndex),

      largeArcFlag: largeArcFlag,
    } 
    console.log('Adding arc')
    return EntryArc;
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
    const angle = this.lineAngle(stageIndex, sheetConfig.numberOfStages);
    const x = this.subsystems[aspectIndex].radius * Math.sin(angle * 2 * Math.PI);
    return this.centreX + x;
  }

  intersectY(sheetConfig, stageIndex, aspectIndex) {
    const angle = this.lineAngle(stageIndex, sheetConfig.numberOfStages);
    const y = this.subsystems[aspectIndex].radius * Math.cos(angle * 2 * Math.PI);
    return this.centreY + y;
  }
}
