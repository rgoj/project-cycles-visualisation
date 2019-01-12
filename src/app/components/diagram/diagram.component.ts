import { Component } from '@angular/core';

import * as _ from 'lodash';

import { DataService } from '../../services/data.service';
import { Entry, SubsystemCircle, EntryView } from '../../interfaces/item';


@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss']
})
export class DiagramComponent {
  diagramConfig;

  scale = 1000;

  centreX = this.scale;
  centreY = this.scale / 2;

  radius = 490;
  smallestRadius = 20; 
  circleRadialDistance;

  sheetConfig;

  stageLines;
  subsystemCircles;
  entryViews;

  constructor(private dataService: DataService) {
    this.diagramConfig = this.dataService.diagramConfig;

    this.dataService.getData().subscribe((data) => {
      console.log('Subscribed to data service and received:')
      console.log(data);

      if(data) {
        console.log('...which looks like real data, initialising diagram!');

        this.sheetConfig = data.sheetConfig;

        this.circleRadialDistance = this.radius / (data.subsystems.length + 1);

        this.stageLines = data.stages.map(stage => this.calculateStageLine(stage));
        this.subsystemCircles = data.subsystems.map(
          subsystem => this.calculateSubsystemCircle(subsystem)
        );
        this.entryViews = this.buildViewsFromEntries(data.entries);
      }
    });
  }

  hover(entryView) {
    this.dataService.previewEntry(entryView.entry);
  }

  calculateStageLine(stage) {
    // Sum up angular widths of all stages before this one to find the final angle
    let angle = 0;
    for (let diagramStage of this.diagramConfig.stages) {
      console.log(diagramStage, stage);
      if (diagramStage.header == stage.name) {
        break; // We've got the final angle!
      } else {
        angle += diagramStage.angularWidth;
      }

      // Something has gone wrong if we've reached this point
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
    entries = _.sortBy(entries, 'primarySubsystem.subsystem.name');
    console.log(entries);

    const entryViews: EntryView[] = [];

    const radiusIncrement = (this.radius - this.smallestRadius) / (entries.length - 1)

    for(let iEntry = 0; iEntry < entries.length; iEntry++) {
      const entry = entries[iEntry];
      const entryView = new EntryView(entry);

      const subsystemClass = this.createClassNameFromString(entry.primarySubsystem.subsystem.name);
      entryView.class = "primary-subsystem_" + subsystemClass;

      const radius = this.smallestRadius + iEntry * radiusIncrement;
      entryView.radius = radius;

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

        entryView.arcs.push(arc);
      }

      entryViews.push(entryView);
    }

    return entryViews;
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
