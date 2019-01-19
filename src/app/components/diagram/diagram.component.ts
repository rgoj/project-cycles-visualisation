import { Component } from '@angular/core';

import * as _ from 'lodash';

import { DataService } from '../../services/data.service';
import { Entry, SubsystemView, SubsystemCircle, EntryView } from '../../interfaces/item';


@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss']
})
export class DiagramComponent {
  diagramConfig;

  scale = 1000;

  centreX = this.scale / 2 + 30;
  centreY = this.scale / 2;

  radius = 450;
  smallestRadius = 20; 
  circleRadialDistance;

  sheetConfig;

  stageLines;
  subsystemViews: SubsystemView[] = [];
  subsystemCircles;
  entryViews;
  pivots;
  pivotsMap;

  entryViewPreviewed: Entry;
  pivotSelected: string|null = null;

  constructor(private dataService: DataService) {
    this.diagramConfig = this.dataService.diagramConfig;

    this.dataService.getData().subscribe((data) => {
      if(data) {
        this.sheetConfig = data.sheetConfig;

        this.circleRadialDistance = this.radius / (data.subsystems.length + 1);

        this.pivots = data.pivots;
        this.pivotsMap = data.pivotsMap;
        this.stageLines = data.stages.map(stage => this.calculateStageLine(stage));
        this.subsystemCircles = data.subsystems.map(
          subsystem => this.calculateSubsystemCircle(subsystem)
        );
        this.entryViews = this.buildViewsFromEntries(data.entries);
      }
    });

    this.dataService.getEntryPreviewed().subscribe((entry) => {
      this.entryViewPreviewed = this.entryViews.find((entryView: EntryView) => {
        return entryView.entry === entry
      });
    });

    this.dataService.getPivotSelected().subscribe((pivotName) => {
      this.changePivot(pivotName);
    });
  }

  previewOn(entryView: EntryView) {
    if(!this.pivotSelected || entryView.entry.pivots.includes(this.pivotSelected)) {
      this.dataService.previewEntry(entryView.entry);
      this.addClassToAllEntries('entry_fade-partial');
      entryView.addClass('entry_preview');
    }
  }

  previewOff(entryView: EntryView) {
    if(!this.pivotSelected || entryView.entry.pivots.includes(this.pivotSelected)) {
      this.dataService.previewEntry(null);
      this.deleteClassFromAllEntries('entry_fade-partial');
      entryView.deleteClass('entry_preview');
    }
  }

  calculateStageLine(stage) {
    // Sum up angular widths of all stages before this one to find the final angle
    let angle = 0;
    let headerFound = false;
    for (let diagramStage of this.diagramConfig.stages) {
      if (diagramStage.header == stage.name) {
        headerFound = true;
        break; // We've got the final angle!
      } else {
        angle += diagramStage.angularWidth;
      }
    }

    if (!headerFound) {
      console.error(`Failed to assign an angle for stage "${stage.name}"`);
    }

    const stageLine = {
      stage: stage,
      angle: angle,
      edgeX: this.radialX(angle, this.radius),
      edgeY: this.radialY(angle, this.radius)
    }

    return stageLine;
  }

  calculateSubsystemCircle(subsystem) {
    return new SubsystemCircle(subsystem, this.circleRadialDistance * (subsystem.index + 1));
  }

  buildViewsFromEntries(entries: Entry[]): EntryView[] {
    // entries = _.sortBy(entries, 'primarySubsystem.subsystem.name'); // Alphabetical
    const direction = this.diagramConfig.reverseSubsystemSortDirection ? -1 : 1;
    entries = _.sortBy(entries, (entry) => {
      return direction * _.findIndex(this.diagramConfig.subsystems, (subsystem: any) => {
        return subsystem.header == entry.primarySubsystem.subsystem.name
      });
    });
    console.log(entries);

    const entryViews: EntryView[] = [];

    const radiusIncrement = (this.radius - this.smallestRadius) / (entries.length - 1)

    let currentSubsystem = null;
    for(let iEntry = 0; iEntry < entries.length; iEntry++) {
      const entry = entries[iEntry];
      const entryView = new EntryView(entry);

      const subsystem = entry.primarySubsystem.subsystem;
      const subsystemClass = this.createClassNameFromString(subsystem.name);
      entryView.addClass("subsystem_" + subsystemClass);

      const radius = this.smallestRadius + iEntry * radiusIncrement;
      entryView.radius = radius;

      if (currentSubsystem != subsystemClass) {
        currentSubsystem = subsystemClass;

        if(this.subsystemViews.length) {
          const previousSubsystemView = this.subsystemViews[this.subsystemViews.length - 1];
          previousSubsystemView.radiusEnd = radius - radiusIncrement;
          previousSubsystemView.radiusMiddle = previousSubsystemView.radiusEnd - previousSubsystemView.radiusStart;
        }

        this.subsystemViews.push(new SubsystemView(subsystem, radius, 0, 0));
      }

      entryView.arcs = this.buildArcsWithRadius(entry, radius);

      entryViews.push(entryView);
    }

    console.log(`The following ${this.subsystemViews.length} subsystems are represented in the current diagram (showing their auto-generated class names):`)
    console.log(this.subsystemViews);
    console.log('\n');

    // Add arcs for secondary subsystems
    for(let iEntry = 0; iEntry < entries.length; iEntry++) {
      const entryView = entryViews[iEntry];
      entryView.secondaryArcs = {};

      for(let iSubsystem = 0; iSubsystem < entryView.entry.subsystems.length; iSubsystem++) {
        const entrySubsystem = entryView.entry.subsystems[iSubsystem];
        const subsystemClass = this.createClassNameFromString(entrySubsystem.subsystem.name);

        if(entrySubsystem.status === 'secondary') {
          entryView.secondaryArcs[subsystemClass] = this.buildArcsWithRadius(entryView.entry, entryView.radius + (iSubsystem + 1) * 50);
        }
      }
    }
    
    console.log(`The following views have been created for each entry:`)
    console.log(entryViews);
    console.log('\n');

    return entryViews;
  }

  private buildArcsWithRadius(entry: Entry, radius: number) {
    const arcs = [];

    for (let iEntryStage = 0; iEntryStage < entry.stages.length; iEntryStage++) {
      const entryStage = entry.stages[iEntryStage];
      const startAngle = this.findStageAngle(entryStage.startStage);
      const endStage = entryStage.endStage;
      const endStageConfig = this.diagramConfig.stages.find((header) => header.header == endStage.name);
      const endAngle = this.findStageAngle(endStage) + endStageConfig.angularWidth;

      // Check whether we're crossing the first stage... (angle = 0)
      const crossingToggle = endAngle < startAngle ? 1 : 0;

      const arc = {
        radius: radius,
        startAngle: startAngle,
        endAngle: endAngle,
        startX: this.radialX(startAngle, radius),
        startY: this.radialY(startAngle, radius),
        endX: this.radialX(endAngle, radius),
        endY: this.radialY(endAngle, radius),
        largeArcFlag: Math.abs(crossingToggle + endAngle - startAngle) > 0.5 ? 1 : 0,
      }

      arcs.push(arc);
    }

    return arcs;
  }


  changePivot(pivotName: string) {
    this.pivotSelected = pivotName;

    if (pivotName) {
      this.addClassToAllEntries('entry_fade');

      for (const entry of this.pivotsMap.get(pivotName)) {
        const entryView = this.entryViews.find((entryView) => entryView.entry == entry);
        entryView.deleteClass('entry_fade');
      }
    } else {
      this.deleteClassFromAllEntries('entry_fade');
    }
  }

  addClassToAllEntries(className) {
    for (const entryView of this.entryViews) entryView.addClass(className);
  }

  deleteClassFromAllEntries(className) {
    for (const entryView of this.entryViews) entryView.deleteClass(className);
  }

  /*
   * Helper function: medium abstraction
   */
  findStageAngle(stage) {
    return this.stageLines.find(line => line.stage == stage).angle;
  }

  /*
   * Helper functions: smallest abstraction
   */
  lineAngle(index: number, length: number) {
    return index / (length + 1);
  }

  radialX(angle, radius, fromCentre=true) {
    let x = - radius * Math.sin(angle * 2 * Math.PI);
    if (fromCentre) { x += this.centreX; }
    return x;
  }

  radialY(angle, radius, fromCentre=true) {
    let y = radius * Math.cos(angle * 2 * Math.PI);
    if (fromCentre) { y += this.centreY; }
    return y;
  }

  createClassNameFromString(string: string) {
    string = string.replace(/[^a-z0-9]/g, s => {
      var c = s.charCodeAt(0);
      if (c >= 65 && c <= 90) return s.toLowerCase();
      return '-';
    });
    string = string.replace(/-+/g, s => { return '-'});
    return string;
  }













  //  for (let i = this.sheetConfig.indexFirstEntry; i < this.sheetConfig.indexFirstEntry + 1; i++) {
  //   // for (let i = this.sheetConfig.indexFirstEntry; i < this.rawData.values.length; i++) {
  //     console.log('Processing row ' + i);
  //     const entryRow = this.rawData.values[i];
  //     const entry = new Entry();

  //     entry.text = entryRow[1];

  //     entry.primaryAspect = this.processEntryAspects(this.sheetConfig, entryRow);

  //     // TODO: Move to "processEntryStages";
  //     let arcFirstStage: null|number = null;
  //     let arcLastStage: null|number = null;
  //     for (let stage = 0; stage <= this.sheetConfig.numberOfStages + 1; stage++) {
  //       const stageColumn = indexFirstStage + stage;
  //       const stageState = entryRow[stageColumn];

  //       if (stageState === 'YES' && arcFirstStage === null) {
  //         arcFirstStage = stage;          
  //       }

  //       if (
  //         stageState !== 'YES' && arcFirstStage !== null && arcLastStage === null ||
  //         stageState === 'YES' && stageColumn === indexLastStage
  //       ) {
  //         arcLastStage = stage - 1;

  //         entry.arcs.push(
  //           this.createArc(
  //             this.sheetConfig,
  //             arcFirstStage,
  //             arcLastStage,
  //             entry.primaryAspect.aspectIndex
  //           )
  //         );
          
  //         arcFirstStage = null;
  //         arcLastStage = null;
  //       }
  //     }

  //     console.log('Adding the following item:');
  //     console.log(entry);
  //     this.entries.push(entry);
  //   }

  // }

  // processEntryAspects(sheetConfig, itemRow: []): Aspect {
  //   const primaryAspect = new Aspect;

  //   for (let aspect = 0; aspect < sheetConfig.numberOfStages; aspect++) {
  //     const aspectColumn = sheetConfig.indexFirstSubsystem + aspect;
  //     const aspectState = itemRow[aspectColumn];
  //     if (aspectState === 'PRIMARY') {
  //       primaryAspect.aspectIndex = aspect;
  //       primaryAspect.aspectName = this.subsystems[aspect].title;
  //     }
  //   }

  //   return primaryAspect;
  // }

  // createArc(
  //   sheetConfig,
  //   firstStageIndex: number,
  //   lastStageIndex: number,
  //   aspectIndex: number
  // ): EntryArc {
  //   const largeArcFlag = (lastStageIndex - firstStageIndex) / sheetConfig.numberOfStages > 0.5 ? 1 : 0;

  //   const EntryArc: EntryArc = {
  //     firstStageIndex: firstStageIndex,
  //     lastStageIndex: lastStageIndex, 

  //     firstStageName: this.stages[firstStageIndex].title,
  //     lastStageName: this.stages[lastStageIndex].title,

  //     aspectIndex: aspectIndex,
  //     aspectName: this.subsystems[aspectIndex].title,

  //     radius: this.subsystems[aspectIndex].radius,
  //     startX: this.intersectX(sheetConfig, firstStageIndex, aspectIndex),
  //     startY: this.intersectY(sheetConfig, firstStageIndex, aspectIndex),
  //     endX: this.intersectX(sheetConfig, lastStageIndex + 1, aspectIndex),
  //     endY: this.intersectY(sheetConfig, lastStageIndex + 1, aspectIndex),

  //     largeArcFlag: largeArcFlag,
  //   } 
  //   console.log('Adding arc')
  //   return EntryArc;
  // }


  // /*
  //  * Helper functions
  //  */

  // // Converts Excel column to index
  // // Source: https://stackoverflow.com/questions/9905533/convert-excel-column-alphabet-e-g-aa-to-number-e-g-25
  // convertColumn(column: string) {
  //   const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  //   let result = 0;
  
  //   for (let i = 0, j = column.length - 1; i < column.length; i += 1, j -= 1) {
  //     result += Math.pow(base.length, j) * (base.indexOf(column[i]) + 1);
  //   }
  //   return result - 1;
  // };

  // lineAngle(index: number, length: number) {
  //   return index / (length + 1);
  // }

  // edgeX(index: number, length: number) {
  //   const angle = this.lineAngle(index, length);
  //   const x = this.radius * Math.sin(angle * 2 * Math.PI);
  //   return x;
  // }

  // edgeY(index: number, length: number) {
  //   const angle = this.lineAngle(index, length);
  //   const y = this.radius * Math.cos(angle * 2 * Math.PI);
  //   return y;
  // }

  // intersectX(sheetConfig, stageIndex, aspectIndex) {
  //   const angle = this.lineAngle(stageIndex, sheetConfig.numberOfStages);
  //   const x = this.subsystems[aspectIndex].radius * Math.sin(angle * 2 * Math.PI);
  //   return this.centreX + x;
  // }

  // intersectY(sheetConfig, stageIndex, aspectIndex) {
  //   const angle = this.lineAngle(stageIndex, sheetConfig.numberOfStages);
  //   const y = this.subsystems[aspectIndex].radius * Math.cos(angle * 2 * Math.PI);
  //   return this.centreY + y;
  // }

}
