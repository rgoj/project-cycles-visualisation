import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { diagramConfig } from '../diagram.config';
import { Entry, Subsystem, EntrySubsystem, EntryStage, Pivot } from '../interfaces/item';
import { GoogleSheetsService } from './google-sheets.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  rawData: any;
  data = new BehaviorSubject<any>(null);

  diagramConfig = diagramConfig;
  sheetConfig;

  pivotSelected = new BehaviorSubject<string>(diagramConfig.pivot);
  entryPreviewed = new BehaviorSubject<Entry>(null);
  entrySelected = new BehaviorSubject<Entry>(null);


  stages = [];
  subsystems = [];
  entries: Entry[] = [];
  pivots: Pivot[];

  pivotsMap = new Map<string, Entry[]>();

  constructor(private googleSheets: GoogleSheetsService) {
    this.googleSheets.getData().subscribe((data) => {
      this.rawData = data;
      this.processData();
      this.data.next({
        sheetConfig: this.sheetConfig,
        stages: this.stages,
        subsystems: this.subsystems,
        entries: this.entries,
        pivots: this.pivots,
        pivotsMap: this.pivotsMap
      })
    });
  }

  getConfig() {
    return this.diagramConfig;
  }

  getData() {
    return this.data;
  }

  getEntryPreviewed() {
    return this.entryPreviewed;
  }

  getPivotSelected() {
    return this.pivotSelected;
  }

  previewEntry(entry: Entry) {
    this.entryPreviewed.next(entry);
  }

  selectEntry(entry: Entry) {
    this.entrySelected.next(entry);
  }

  selectPivot(pivotName: string) {
    this.pivotSelected.next(pivotName);
  }

  private processData() {
    const indexFirstStage = this.convertColumn('M');
    const indexLastStage = this.convertColumn('Z');

    const indexFirstSubsystem = this.convertColumn('AA');
    const indexLastSubsystem = this.convertColumn('AL');

    const indexFirstPivot = this.convertColumn('AM');
    const indexLastPivot = this.convertColumn('AP');

    this.sheetConfig = {
      headings: this.rawData.values[0],

      indexFirstStage: indexFirstStage,
      indexLastStage: indexLastStage,
      numberOfStages: indexLastStage - indexFirstStage + 1,

      indexFirstSubsystem: indexFirstSubsystem,
      indexLastSubsystem: indexLastSubsystem,
      numberOfSubsystems: indexLastSubsystem - indexFirstSubsystem + 1,

      indexFirstPivot: indexFirstPivot,
      indexLastPivot: indexLastPivot,
      numberOfPivots: indexLastPivot - indexFirstPivot + 1,

      indexFirstEntry: 1,
    }

    console.log('\n');
    console.log('sheetConfig:', this.sheetConfig);
    console.log('First stage: ', this.sheetConfig.headings[indexFirstStage]);
    console.log('Last stage: ', this.sheetConfig.headings[indexLastStage]);
    console.log('First subsystem: ', this.sheetConfig.headings[indexFirstSubsystem]);
    console.log('Last subsystem: ', this.sheetConfig.headings[indexLastSubsystem]);
    console.log('\n');

    for (let i = 0; i < this.sheetConfig.numberOfStages; i++) {
      this.stages.push({
        index: i,
        name: this.sheetConfig.headings[indexFirstStage + i],
      });
    }
    console.log('The following stages have been identified:')
    console.log(this.stages);
    console.log('\n');

    for (let i = 0; i < this.sheetConfig.numberOfSubsystems; i++) {
      this.subsystems.push({
        index: i,
        name: this.sheetConfig.headings[indexFirstSubsystem + i],
      });
    }
    console.log('The following subsystems have been identified:')
    console.log(this.subsystems);
    console.log('\n');

    console.log('Processing data for individual entries now...');
    // for (let i = this.sheetConfig.indexFirstEntry; i < this.sheetConfig.indexFirstEntry + 1; i++) {
    for (let i = this.sheetConfig.indexFirstEntry; i < this.rawData.values.length; i++) {
      const entryRow = this.rawData.values[i];
      const entry = new Entry();

      entry.text = entryRow[1];

      entry.subsystems = this.processEntrySubsystems(entryRow);
      entry.primarySubsystem = this.findPrimarySubsystem(entry.subsystems);
      const continueProcessing = this.checkEntry(i, entry);

      entry.stages = this.processEntryStages(entryRow);

      entry.pivots = this.processEntryPivots(entryRow)

      if (continueProcessing) {
        this.entries.push(entry);

        for (const pivot of entry.pivots) {
          if (this.pivotsMap.has(pivot)) {
            this.pivotsMap.get(pivot).push(entry);
          } else {
            this.pivotsMap.set(pivot, [entry])
          }
        }
      } 
    }
    console.log('The following entries have been identified:')
    console.log(this.entries);

    // Testing that the pivots contain the same objects as the entries! :)
    // this.pivotsMap.get('Current')[0].text = 'Kowabonga!';
    // console.log(this.pivotsMap.get('Current')[0]);

    this.pivots = this.createPivotsArray(this.pivotsMap);

    console.log('The following pivots have been identified:')
    console.log(this.pivots);
  }


  private processEntrySubsystems(entryRow: []): EntrySubsystem[] {
    const subsystems = [];

    for (let i = 0; i < this.sheetConfig.numberOfSubsystems; i++) {
      const subsystem = new Subsystem;

      const columnIndex = this.sheetConfig.indexFirstSubsystem + i;
      const state = entryRow[columnIndex];
      let status: string = null;

      subsystem.index = i;
      subsystem.name = this.subsystems[i].name;

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

  private findPrimarySubsystem(subsystems: EntrySubsystem[]): EntrySubsystem {
    return subsystems.find(x => x.status === 'primary');
  }

  private checkEntry(i: number, entry: Entry): boolean {
    const omitMessage = `Omitting the following entry (spreadsheet row ${i + 1}) because `;

    if (entry.subsystems.length === 0) {
      console.log(omitMessage + 'it does not have any subsystems defined:');
      console.log(entry.text)
      console.log('\n');
      return false;
    }

    if (entry.primarySubsystem === undefined) {
      console.log(omitMessage + 'neither of its subsystems is declared primary:');
      console.log(entry.text)
      console.log('\n');
      return false;

      // Another option would be to select any of the subsystems as primary...
      // entry.primarySubsystem = entry.subsystems[0];
    }

    if (entry.text && entry.primarySubsystem) {
      return true;
    } else {
      // We should never get here
      console.error(omitMessage + 'for unknown reasons - is there an unknown problem?');
      console.log(entry.text)
      console.log('\n');
      return false;
    }
  }

  private processEntryStages(entryRow: []): EntryStage[] {
    const entryStages: EntryStage[] = [];

    let firstStageIndex: null|number = null;
    let lastStageIndex: null|number = null;

    for (let i = 0; i < this.sheetConfig.numberOfStages + 1; i++) {
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

  private processEntryPivots(entryRow): string[] {
    const pivots: string[] = [];

    for (let i = 0; i < this.sheetConfig.numberOfPivots; i++) {
      const columnIndex = this.sheetConfig.indexFirstPivot + i;
      const pivotName = this.sheetConfig.headings[columnIndex];
      const state = entryRow[columnIndex];

      if (state == 'YES') {
        pivots.push(pivotName);
      } else if (!state) {
        continue;
      } else {
        console.error(
          'Unknown problem when processing pivot named: ',
          pivotName,
          ' for entry: ',
          entryRow[0]
        );
      }
    }
    
    return pivots;
  }

  private createPivotsArray(pivotsMap: Map<string, Entry[]>): Pivot[] {
    const pivotsArray = Array.from(pivotsMap.entries()).map((pivotData) => {
      const pivot = new Pivot(pivotData[0], pivotData[1]);
      return pivot;
    });
    return pivotsArray;
  }


  /*
   * Helper functions
   */
  // Converts Excel column to index
  // Source: https://stackoverflow.com/questions/9905533/convert-excel-column-alphabet-e-g-aa-to-number-e-g-25
  private convertColumn(column: string) {
    const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 0;
  
    for (let i = 0, j = column.length - 1; i < column.length; i += 1, j -= 1) {
      result += Math.pow(base.length, j) * (base.indexOf(column[i]) + 1);
    }
    return result - 1;
  };
}
