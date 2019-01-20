import { Directive, Component, OnInit, ViewChildren, ElementRef, Input } from '@angular/core';

import { diagramConfig } from 'src/app/diagram.config';
import { Entry } from 'src/app/interfaces/item';
import { DataService } from '../../services/data.service';


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
    console.log('setPivot fired!');
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

  convertMapToObject(map) {
    let object = Object.create(null);
    for (let property of Array.from(map.entries())) {
      object[property[0]] = property[1];
    }
    return object;
  }
}
