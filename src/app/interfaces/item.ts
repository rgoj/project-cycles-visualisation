export interface ItemArc {
  firstStageName: string;
  lastStageName: string;

  firstStageIndex: number;
  lastStageIndex: number;

  arcStartX: number;
  arcStartY: number;
  arcEndX: number;
  arcEndY: number;
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
  // aspects: Aspect[];
  primaryAspect: Aspect;

  itemArcs: ItemArc[];

  lineStartX: number;
  lineStartY: number;
    
  constructor() {
        this.itemArcs = [];

        this.lineStartX = null;
        this.lineStartY = null;
    }
}
