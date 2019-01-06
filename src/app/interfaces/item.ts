export class Stage {
  index: number;
  name: string;

  constructor() {
    this.index = null;
    this.name = null;
  }
}

export class Subsystem {
  index: number;
  name: string;

  constructor() {
    this.index = null;
    this.name = null;
  }
}

export class SubsystemCircle {
  subsystem: Subsystem;
  radius: number;

  constructor(subsystem: Subsystem, radius: number) {
    this.subsystem = subsystem;
    this.radius = radius;
  }
}

export class Entry {
  text: string;

  subsystems: EntrySubsystem[];
  primarySubsystem: EntrySubsystem;

  stages: EntryStage[];

  constructor() {
    this.text = '';
    this.stages = [];
    this.subsystems = [];
    this.primarySubsystem = null;
  }
}

export class EntrySubsystem {
  subsystem: Subsystem;
  status: string;

  constructor(subsystem: Subsystem, status: string) {
    this.subsystem = subsystem;
    this.status = status;
  }
}

export class EntryStage {
  startStage: Stage;
  endStage: Stage;

  constructor(startStage: Stage, endStage: Stage) {
    this.startStage = startStage;
    this.endStage = endStage;
  }
}

export class EntryView {
  entry: Entry;
  arcs: any;
  class: string;

  radius: number;

  constructor(entry: Entry) {
    this.entry = entry;
    this.arcs = [];
    this.class = '';
    this.radius = null;
  }
}

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
