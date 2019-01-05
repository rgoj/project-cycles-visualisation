import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Entry, EntryArc, Subsystem, EntrySubsystem, EntryStage } from '../interfaces/item';
import { GoogleSheetsService } from './google-sheets.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  rawData: any;
  data = new BehaviorSubject<any>(null);

  sheetConfig;

  stages = [];
  subsystems = [];
  entries: Entry[] = [];

  constructor(private googleSheets: GoogleSheetsService) {
    this.googleSheets.getData().subscribe((data) => {
      this.rawData = data;
      this.processData();
      this.data.next({
        sheetConfig: this.sheetConfig,
        stages: this.stages,
        subsystems: this.subsystems,
        entries: this.entries
      })
    });
  }

  getData() {
    return this.data;
  }

  processData() {
    const indexFirstStage = this.convertColumn('L');
    const indexLastStage = this.convertColumn('Y');

    const indexFirstSubsystem = this.convertColumn('Z');
    const indexLastSubsystem = this.convertColumn('AK');

    this.sheetConfig = {
      headings: this.rawData.values[0],

      indexFirstStage: indexFirstStage,
      indexLastStage: indexLastStage,
      numberOfStages: indexLastStage - indexFirstStage,

      indexFirstSubsystem: indexFirstSubsystem,
      indexLastSubsystem: indexLastSubsystem,
      numberOfSubsystems: indexLastSubsystem - indexFirstSubsystem,

      indexFirstEntry: 1,
    }

    for (let i = 0; i <= this.sheetConfig.numberOfStages; i++) {
      this.stages.push({
        index: i,
        title: this.sheetConfig.headings[indexFirstStage + i],
      });
    }
    console.log(this.stages);

    for (let i = 0; i <= this.sheetConfig.numberOfSubsystems; i++) {
      this.subsystems.push({
        index: i,
        title: this.sheetConfig.headings[indexFirstSubsystem + i],
      });
    }
    console.log(this.subsystems);


    for (let i = this.sheetConfig.indexFirstEntry; i < this.sheetConfig.indexFirstEntry + 1; i++) {
    // for (let i = this.sheetConfig.indexFirstEntry; i < this.rawData.values.length; i++) {
      console.log('Processing row ' + i);
      const entryRow = this.rawData.values[i];
      const entry = new Entry();

      entry.text = entryRow[1];

      entry.subsystems = this.processEntrySubsystems(entryRow);
      entry.primarySubsystem = this.findPrimarySubsystem(entry.subsystems);

      entry.stages = this.processEntryStages(entryRow);

      console.log('Adding the following entry:');
      console.log(entry);
      this.entries.push(entry);
    }

  }

  processEntrySubsystems(entryRow: []): EntrySubsystem[] {
    const subsystems = [];

    for (let i = 0; i < this.sheetConfig.numberOfSubsystems; i++) {
      const subsystem = new Subsystem;

      const columnIndex = this.sheetConfig.indexFirstSubsystem + i;
      const state = entryRow[columnIndex];
      console.log(state);
      let status: string = null;

      subsystem.index = i;
      subsystem.name = this.subsystems[i].title;

      if (state == 'YES') {
        status = 'secondary';
      } else if (state == 'PRIMARY') {
        status = 'primary';
      }

      if (status) {
        subsystems.push(new EntrySubsystem(subsystem, status));
      }
    }

    return subsystems;
  }

  findPrimarySubsystem(subsystems: EntrySubsystem[]): EntrySubsystem {
    return subsystems.find(x => x.status === 'primary');
  }

  processEntryStages(entryRow: []): EntryStage[] {
    const entryStages: EntryStage[] = [];

    let firstStageIndex: null|number = null;
    let lastStageIndex: null|number = null;

    for (let i = 0; i <= this.sheetConfig.numberOfStages + 1; i++) {
      const columnIndex = this.sheetConfig.indexFirstStage + i;
      const state = entryRow[columnIndex];

      if (state === 'YES' && firstStageIndex === null) {
        firstStageIndex = i;          
      }

      if (
        state !== 'YES' && firstStageIndex !== null && lastStageIndex === null ||
        state === 'YES' && columnIndex === lastStageIndex
      ) {
        lastStageIndex = i - 1;

        entryStages.push(
          new EntryStage(this.stages[firstStageIndex], this.stages[lastStageIndex])
        );

        firstStageIndex = null;
        lastStageIndex = null;
      }
    }

    return entryStages;
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
}
