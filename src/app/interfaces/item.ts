export interface EntryArc {
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

export class Entry {
  text: string;

  // aspects: Aspect[];
  primaryAspect: Aspect;

  arcs: EntryArc[];

  stageStartX: number;
  stageStartY: number;
    
  constructor() {
    this.text = '';

    this.arcs = [];

    this.stageStartX = null;
    this.stageStartY = null;
  }
}
