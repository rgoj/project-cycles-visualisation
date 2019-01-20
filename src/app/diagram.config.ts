export const diagramConfig = {
  pivot: null,
  // pivot: 'Current',
  // pivot: 'Potential Disruption',
  // pivot: 'Disruption',
  // pivot: 'Outside UK',


  reverseSubsystemSortDirection: true,
  subsystems: [
    { header: 'Project' }, // in the centre if `reverseSubsystemSortDirection` is false
    { header: 'Service  / Profession' },
    { header: 'Policy / Regulation' },
    { header: 'Political' },
    { header: 'Economic' },
    { header: 'Technology' },
    { header: 'Ecological' },
    { header: 'Education' },
    { header: 'Cultural' },
    { header: 'Social' },
    { header: 'Health / Wellbeing' },
    { header: 'Individual / Home' }, // in the centre if `reverseSubsystemSortDirection` is true
  ],

  stages: [
    { header: 'Idea', angularWidth: 1 / 16 },
    { header: 'Team-find', angularWidth: 1 / 16 },
    { header: 'Fund-raise', angularWidth: 1 / 16 },
    { header: 'Procurement', angularWidth: 1 / 16 },
    { header: '0 Strategic Definition', angularWidth: 1 / 14 },
    { header: '1 Preparation and Brief', angularWidth: 1 / 14 },
    { header: '2 Concept Design', angularWidth: 1 / 14 },
    { header: '3 Developed Design', angularWidth: 1 / 14 },
    { header: '4 Technical Design', angularWidth: 1 / 14 },
    { header: '5 Construction', angularWidth: 1 / 14 },
    { header: '6 Handover and Close Out', angularWidth: 1 / 14 },
    { header: '7 In Use', angularWidth: 1 / 12 },
    { header: 'Maintain', angularWidth: 1 / 12 },
    { header: 'Decline', angularWidth: 1 / 12 },
  ],

  pivots: [
    { header: 'Current', title: 'Current system' },
    { header: 'Disruption', title: 'Disruption in the system' },
    { header: 'Potential Disruption', title: 'Potential disruption' },
    { header: 'Outside UK', title: 'Systems outside of the UK' },
  ]
};
