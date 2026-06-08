export type Lang = 'th' | 'en';

const en = {
  otherLang: 'TH' as const,

  // Start
  gameTitle: 'Graph Copy',
  gameSubtitle: 'The Easing Lab / Kinetic Training',
  helpBtn: 'How to Play',
  hot: 'Hot',

  easyMode: 'Easy Mode',       easyModeDesc: 'Standard Training',
  hardMode: 'Hard Mode',       hardModeDesc: 'Hidden Coordinates',
  insaneMode: 'Insane Mode',   insaneModeDesc: 'Time Per Round',
  tournament: 'Tournament',    tournamentDesc: '15s Global Limit',

  howToPlay: 'How to Play',
  step1: 'Observe the Reference Motion and memorize its acceleration pattern.',
  step2: 'Adjust the Bezier handles to replicate the motion curve.',
  step3: 'Apply to compare your motion with the original and see your accuracy score.',
  keyboardShortcuts: 'Keyboard Shortcuts',
  resetGraph: 'Reset Graph',
  applyNext: 'Apply / Next',

  // Observe
  observationPhase: 'Observation Phase',
  memorizeMotion: 'Memorize the Motion',
  memorizeDesc: 'Watch the kinetic behavior carefully',

  // Play
  matchPhase: 'Match Phase',
  livePreview: 'Live Preview',
  livePreviewDesc: 'Observe your current curve behavior',
  bezierWorkspace: 'Bezier Workspace',
  workspaceDesc: 'Adjust control points to match the motion',
  proTips: 'Pro Tips:',
  tipShift: 'Hold SHIFT to snap to grid',
  tipBounce: 'Y-axis expanded for Bounce & Elastic effects',
  tipRhythm: "Match the ball's rhythm, not just the curve shape",
  resetBtn: 'Reset',
  applyCompare: 'Apply & Compare',
  roundLabel: (cur: number, total: number) => `ROUND ${cur} / ${total}`,

  // Simulation labels
  comparisonMode: 'Comparison Mode',
  referenceMotion: 'Reference Motion',
  livePreviewLabel: 'Live Preview',
  referenceTrack: 'Reference',
  yourMotion: 'Your Motion',
  comparing: 'Comparing',
  refActive: 'Ref Active',
  userActive: 'User Active',
  standby: 'Standby',
  loopLabel: (cur: number, total: number) => `LOOP ${cur} / ${total}`,

  // Result
  analysisResult: 'Analysis Result',
  masterful: 'Masterful!',
  analyzed: 'Analyzed',
  roundAccuracy: (n: number) => `Round ${n} Accuracy`,
  nextRound: 'Next Round',
  finalResults: 'Final Results',

  // Final
  trainingComplete: 'Training Complete',
  finalEval: 'Final Performance Evaluation',
  timeout: 'TIME OUT',
  restartSession: 'Restart Session',

  // Help page
  helpPageTitle: 'How to Play',
  backToMenu: '← Back',
  helpIntro: 'Copy the bezier easing curve as accurately as you can. Each round shows an animation — replicate its timing with the bezier editor.',

  modeGuideTitle: 'Game Modes',

  easyGuideTitle: 'Easy Mode',
  easyGuideDesc: 'The animation plays twice and the coordinates are displayed. Best for beginners. Use the shown values as a starting point, then fine-tune.',
  easyGuideTags: ['2 loops', 'Coordinates visible'],

  hardGuideTitle: 'Hard Mode',
  hardGuideDesc: 'The animation plays only once and coordinates are hidden. You must rely entirely on visual memory of the motion.',
  hardGuideTags: ['1 loop', 'Coordinates hidden'],

  insaneGuideTitle: 'Insane Mode',
  insaneGuideDesc: 'A countdown timer (15 s / 30 s / 60 s) runs during your editing phase. If you run out of time the answer auto-submits.',
  insaneGuideTags: ['Timed', '15 / 30 / 60 s'],

  tournamentGuideTitle: 'Tournament',
  tournamentGuideDesc: 'No result screen between rounds — submit and move on instantly. A 15-second timer covers the whole session. Pure speed and accuracy.',
  tournamentGuideTags: ['No result screen', '15 s total'],

  scoringTitle: 'Scoring',
  scoringDesc: 'Your score is the average distance between your curve and the target, sampled at 25 parametric points. A perfect match scores 100%.',

  tipsTitle: 'Tips',
  tips: [
    'Focus on the feel — slow start, fast end, bounce, or anticipation.',
    'Hold Shift while dragging a handle to snap it to the grid.',
    'The Y-axis extends beyond 0–1 to support bounce and elastic curves.',
    'In Easy mode, use the displayed coordinates as a starting point then fine-tune.',
  ],
};

const th: typeof en = {
  otherLang: 'EN',

  gameTitle: 'Graph Copy',
  gameSubtitle: 'ฝึกจังหวะการเคลื่อนไหวด้วยเส้นโค้ง',
  helpBtn: 'วิธีเล่น',
  hot: 'ร้อน',

  easyMode: 'โหมดง่าย',     easyModeDesc: 'ฝึกพื้นฐาน',
  hardMode: 'โหมดยาก',     hardModeDesc: 'ซ่อน Coordinates',
  insaneMode: 'โหมดบ้า',   insaneModeDesc: 'มีตัวจับเวลา',
  tournament: 'ทัวร์นาเมนต์', tournamentDesc: 'ลิมิต 15 วินาที',

  howToPlay: 'วิธีเล่น',
  step1: 'ดูอนิเมชันอ้างอิงและจำรูปแบบความเร็วของมัน',
  step2: 'ปรับ Handle ของ Bezier ให้ตรงกับเส้นโค้งที่เห็น',
  step3: 'กด Apply เพื่อเปรียบเทียบและดูคะแนนความแม่น',
  keyboardShortcuts: 'คีย์ลัด',
  resetGraph: 'รีเซ็ตกราฟ',
  applyNext: 'Apply / ถัดไป',

  observationPhase: 'เฟสสังเกต',
  memorizeMotion: 'จำการเคลื่อนไหว',
  memorizeDesc: 'ดูพฤติกรรมของอนิเมชันให้ดี',

  matchPhase: 'เฟสจับคู่',
  livePreview: 'พรีวิวสด',
  livePreviewDesc: 'ดูพฤติกรรมเส้นโค้งปัจจุบัน',
  bezierWorkspace: 'พื้นที่ Bezier',
  workspaceDesc: 'ปรับจุดควบคุมให้ตรงกับการเคลื่อนไหว',
  proTips: 'เคล็ดลับ:',
  tipShift: 'กด SHIFT ค้างเพื่อสแนปตาราง',
  tipBounce: 'แกน Y ขยายสำหรับ Bounce และ Elastic',
  tipRhythm: 'จับจังหวะของลูก ไม่ใช่แค่รูปทรงเส้น',
  resetBtn: 'รีเซ็ต',
  applyCompare: 'ยืนยัน & เปรียบเทียบ',
  roundLabel: (cur: number, total: number) => `รอบที่ ${cur} / ${total}`,

  comparisonMode: 'โหมดเปรียบเทียบ',
  referenceMotion: 'อนิเมชันอ้างอิง',
  livePreviewLabel: 'พรีวิวสด',
  referenceTrack: 'อ้างอิง',
  yourMotion: 'ของคุณ',
  comparing: 'กำลังเปรียบเทียบ',
  refActive: 'อ้างอิงทำงาน',
  userActive: 'ของคุณทำงาน',
  standby: 'รอ',
  loopLabel: (cur: number, total: number) => `รอบที่ ${cur} / ${total}`,

  analysisResult: 'ผลการวิเคราะห์',
  masterful: 'เยี่ยมมาก!',
  analyzed: 'วิเคราะห์แล้ว',
  roundAccuracy: (n: number) => `ความแม่นรอบที่ ${n}`,
  nextRound: 'รอบถัดไป',
  finalResults: 'ผลสุดท้าย',

  trainingComplete: 'ฝึกครบแล้ว',
  finalEval: 'ผลการประเมินรวม',
  timeout: 'หมดเวลา',
  restartSession: 'เริ่มใหม่',

  helpPageTitle: 'วิธีเล่น',
  backToMenu: '← กลับ',
  helpIntro: 'คัดลอกเส้นโค้ง Bezier easing ให้แม่นที่สุด แต่ละด่านจะแสดงอนิเมชัน — ให้สร้างจังหวะเดียวกันด้วยตัวแก้ไข Bezier',

  modeGuideTitle: 'โหมดเกม',

  easyGuideTitle: 'โหมดง่าย',
  easyGuideDesc: 'อนิเมชันเล่น 2 รอบ และแสดง Coordinates ครบ เหมาะสำหรับมือใหม่ที่เพิ่งหัดอ่านเส้นโค้ง Bezier ใช้ค่าที่แสดงเป็นจุดเริ่มต้นแล้วค่อยปรับ',
  easyGuideTags: ['2 รอบ', 'เห็น Coordinates'],

  hardGuideTitle: 'โหมดยาก',
  hardGuideDesc: 'อนิเมชันเล่นรอบเดียว และซ่อน Coordinates ทั้งหมด ต้องพึ่งความจำทางสายตาล้วนๆ',
  hardGuideTags: ['1 รอบ', 'ซ่อน Coordinates'],

  insaneGuideTitle: 'โหมดบ้า',
  insaneGuideDesc: 'มีตัวนับถอยหลัง (15 / 30 / 60 วิ) ระหว่างแก้ไข ถ้าหมดเวลาก่อนกดยืนยัน ระบบจะส่งคำตอบอัตโนมัติ',
  insaneGuideTags: ['มีเวลาจำกัด', '15 / 30 / 60 วิ'],

  tournamentGuideTitle: 'ทัวร์นาเมนต์',
  tournamentGuideDesc: 'ไม่มีหน้าผลคะแนนระหว่างด่าน กดยืนยันแล้วไปด่านถัดไปทันที มีเวลารวมทั้งหมด 15 วินาที วัดทั้งความเร็วและความแม่น',
  tournamentGuideTags: ['ไม่มีหน้า Result', '15 วิ รวม'],

  scoringTitle: 'การให้คะแนน',
  scoringDesc: 'คะแนนคำนวณจากระยะห่างเฉลี่ยระหว่างเส้นโค้งของคุณกับเส้นโค้งเป้าหมาย โดยสุ่ม 25 จุด ถ้าตรงกันทั้งหมดได้ 100%',

  tipsTitle: 'เคล็ดลับ',
  tips: [
    'โฟกัสที่ "ความรู้สึก" ของจังหวะ — ช้า เร็ว กระดอน หรือกวัดล้วงหน้า',
    'กด Shift ค้างระหว่างลาก Handle เพื่อสแนปตาราง',
    'แกน Y ขยายเกิน 0–1 ได้ เพื่อรองรับ Bounce และ Elastic curve',
    'ในโหมดง่าย ใช้ Coordinates ที่แสดงเป็นจุดเริ่มต้น แล้วค่อยปรับละเอียด',
  ],
};

export const translations = { en, th };
export type Tx = typeof en;
