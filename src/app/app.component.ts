import { Component } from '@angular/core';
import { setClassMetadata } from '@angular/core/src/render3';
import { listeners } from 'cluster';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'lm-joint-showcase';
  scale = 1000;

  centreX = this.scale;
  centreY = this.scale / 2;

  circles = [
    { title: '1' },
    { title: '2' },
    { title: '3' },
    { title: '4' },
    { title: '5' },
    { title: '6' },
    { title: '7' },
    { title: '8' },
    { title: '9' }
  ]

  radius = 450;

  lines = [
    { title: '1' },
    { title: '2' },
    { title: '3' },
    { title: '4' },
    { title: '8' },
  ]

  edgeX(index, length) {
    const angle = index / length;
    const x = this.radius * Math.sin(angle * 2 * Math.PI);
    console.log(x);
    return x;
  }

  edgeY(index, length) {
    const angle = index / length;
    const y = this.radius * Math.cos(angle * 2 * Math.PI);
    console.log(y);
    return y;
  }
}
