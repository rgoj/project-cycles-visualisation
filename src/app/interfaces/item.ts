export interface ItemArc {
  firstStageIndex: number;
  lastStageIndex: number;

  firstStageName: string;
  lastStageName: string;

  aspectIndex: number;
  aspectName: string;

  radius: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;

  largeArcFlag: number;
}

export class Aspect {
  aspectIndex: number;
  aspectName: string;

  constructor() {
    this.aspectIndex = null;
    this.aspectName = null;
  }
}

export class Item {
  text: string;

  // aspects: Aspect[];
  primaryAspect: Aspect;

  arcs: ItemArc[];

  lineStartX: number;
  lineStartY: number;
    
  constructor() {
    this.text = '';

    this.arcs = [];

    this.lineStartX = null;
    this.lineStartY = null;
  }
}
