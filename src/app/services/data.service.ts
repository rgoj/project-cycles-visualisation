import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Entry, Subsystem, EntrySubsystem, EntryStage } from '../interfaces/item';
import { GoogleSheetsService } from './google-sheets.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  rawData: any;
  data = new BehaviorSubject<any>(null);

  entryPreviewed = new BehaviorSubject<Entry>(null);
  entrySelected = new BehaviorSubject<Entry>(null);

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

  previewEntry(entry: Entry) {
    this.entryPreviewed.next(entry);
  }

  selectEntry(entry: Entry) {
    this.entrySelected.next(entry);
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
      // numberOfStages: indexLastStage - indexFirstStage + 1,

      indexFirstSubsystem: indexFirstSubsystem,
      indexLastSubsystem: indexLastSubsystem,
      numberOfSubsystems: indexLastSubsystem - indexFirstSubsystem,
      // numberOfStages: indexLastStage - indexFirstStage + 1,

      indexFirstEntry: 1,
    }
    console.log('sheetConfig:', this.sheetConfig);

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


    // for (let i = this.sheetConfig.indexFirstEntry; i < this.sheetConfig.indexFirstEntry + 1; i++) {
    for (let i = this.sheetConfig.indexFirstEntry; i < this.rawData.values.length; i++) {
      console.log('Processing row ' + i);
      const entryRow = this.rawData.values[i];
      const entry = new Entry();

      entry.text = entryRow[1];

      entry.subsystems = this.processEntrySubsystems(entryRow);
      entry.primarySubsystem = this.findPrimarySubsystem(entry.subsystems);

      // TODO: Remember that I'm arbitrarily assigning a primary subsystem!!!
      if(entry.primarySubsystem === undefined) {
        entry.primarySubsystem = entry.subsystems[0];
      }

      entry.stages = this.processEntryStages(entryRow);

      if (entry.text && entry.primarySubsystem) {
        // console.log('Adding the following entry:');
        // console.log(entry);
        this.entries.push(entry);
      } else {
        console.log('Omitting the following entry:')
        console.log(entry);
      }
    }

  }

  processEntrySubsystems(entryRow: []): EntrySubsystem[] {
    const subsystems = [];

    for (let i = 0; i < this.sheetConfig.numberOfSubsystems; i++) {
      const subsystem = new Subsystem;

      const columnIndex = this.sheetConfig.indexFirstSubsystem + i;
      const state = entryRow[columnIndex];
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
