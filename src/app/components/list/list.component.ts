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

  entryPreviewed: Entry;
  entrySelected: Entry;

  constructor(private dataService: DataService) {
    this.dataService.getData().subscribe((data) => {
      this.data = data;
    });

    this.dataService.entryPreviewed.subscribe((entryPreviewed) => {
      this.entryPreviewed = entryPreviewed;
      if (this.entryPreviewed) {
        console.log(this.entryPreviewed.primarySubsystem.subsystem.name);
      }
    });
  }

  ngOnInit() {
  }
}
