import { Directive, Component, OnInit, ViewChildren, ElementRef, Input } from '@angular/core';

import { diagramConfig } from 'src/app/diagram.config';
import { Entry } from 'src/app/interfaces/item';
import { DataService } from '../../services/data.service';
import { animate } from '@angular/animations';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  diagramConfig = diagramConfig;

  data: any;

  pivots: any;
  pivotsDict: any;
  pivotSelected: string;

  entryPreviewed: Entry;
  entrySelected: Entry;

  animate = false;
  animationIntervalId: any;
  animationTimeoutIds = [];

  constructor(private dataService: DataService) {
    this.dataService.getData().subscribe((data) => {
      this.data = data;

      this.pivotsDict = this.convertMapToObject(this.data.pivotsMap);

      // console.log('This has been received by the list component:')
      // console.log(this.data);
    });

    this.dataService.getPivotSelected().subscribe((pivotName) => this.pivotSelected = pivotName);

    this.dataService.entryPreviewed.subscribe((entryPreviewed) => {
      this.entryPreviewed = entryPreviewed;
      if (this.entryPreviewed && !this.pivotSelected) {
        this.dataService.selectPivot(this.entryPreviewed.pivots[0]);
      }
    });
  }

  ngOnInit() {
  }

  setPivot(pivotName) {
    this.dataService.selectPivot(pivotName);
  }

  closePivot(pivotName) {
    if(this.pivotSelected === pivotName) this.setPivot(null);
  }

  previewOn(entry: Entry) {
    this.dataService.previewEntry(entry);
  }

  previewOff(entry: Entry) {
    this.dataService.previewEntry(null);
  }

  scrollIntoView() {
    // Ouch. What a hack :(
    const nativeElement = window.document.getElementById('entryPreviewed');
    (nativeElement as any).scrollIntoViewIfNeeded({ behavior: "smooth", block: "start" });
  }

  autoAnimate() {
    this.runAutoAnimateCycle();
    this.animationIntervalId = setInterval(() => {
      this.runAutoAnimateCycle();
    }, 10000);
  }

  runAutoAnimateCycle() {
    // First, pick an entry
    const entryIndex = this.getRandomInt(this.data.entries.length);
    const entry = this.data.entries[entryIndex];
    const pivotName = entry.pivots[0];

    // Wait with the diagram in its original format
    this.animationTimeoutIds.push(setTimeout(() => {
      this.setPivot(pivotName);

      // Wait with pivot open
      this.animationTimeoutIds.push(setTimeout(() => {
        this.previewOn(entry);

        // Leave a few seconds for reading the entry
        this.animationTimeoutIds.push(setTimeout(() => {
          this.previewOff(entry);

          // Wait with entry closed but pivot open
          this.animationTimeoutIds.push(setTimeout(() => {
            this.closePivot(pivotName);
          }, 1000))
        }, 7000))
      }, 1000))
    }, 1000));
  }

  stopAutoAnimate() {
    clearInterval(this.animationIntervalId);
    this.animationTimeoutIds.forEach(timeoutId => {
      clearTimeout(timeoutId); 
    });

    const entry = this.entryPreviewed
    this.previewOff(entry);

    setTimeout(() => {
      this.closePivot(entry.pivots[0]);
    }, 500);
  }

  toggleAutoAnimate() {
    if(this.animate) {
      this.animate = false;
      this.stopAutoAnimate();
    } else {
      this.animate = true;
      this.autoAnimate();
    }
  }





  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  convertMapToObject(map) {
    let object = Object.create(null);
    for (let property of Array.from(map.entries())) {
      object[property[0]] = property[1];
    }
    return object;
  }
}
