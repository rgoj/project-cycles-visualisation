import { Component } from '@angular/core';

import { DataService } from '../../services/data.service';


@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss']
})
export class DiagramComponent {
  data;

  scale = 1000;

  centreX = this.scale;
  centreY = this.scale / 2;

  radius = 490;
  circleRadialDistance;

  stages;
  subsystems;
  entries;

  constructor(private dataService: DataService) {
    this.dataService.getData().subscribe((data) => {
      this.data = data;

      console.log('Subscribed to data service and received:')
      console.log(data);

      if(data) {
        console.log('...which looks like real data, initialising diagram!');

        this.stages = data.stages;
        this.subsystems = data.subsystems;
        this.entries = data.entries;

        this.circleRadialDistance = this.radius / (this.subsystems.length + 1);
      }
    });
  }
}
