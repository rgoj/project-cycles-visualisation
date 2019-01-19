import { Component, OnInit } from '@angular/core';

import { Entry } from 'src/app/interfaces/item';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  data: any;

  pivots: any;

  entryPreviewed: Entry;
  entrySelected: Entry;

  constructor(private dataService: DataService) {
    this.dataService.getData().subscribe((data) => {
      this.data = data;

      console.log('This has been received by the list component:')
      console.log(this.data);
      console.log(this.pivots);
    });

    this.dataService.entryPreviewed.subscribe((entryPreviewed) => {
      this.entryPreviewed = entryPreviewed;
      if (this.entryPreviewed) {
        // console.log(this.entryPreviewed.primarySubsystem.subsystem.name);
        // console.log(this.entryPreviewed.text);
      }
    });
  }

  ngOnInit() {
  }
}
