export interface LectureSeed {
  code: string;
  title: string;
}

export interface ChapterSeed {
  id: string;
  chapterName: string;
  lectures: LectureSeed[];
  domain?: 'Physical' | 'Inorganic' | 'Organic';
}

const codeRange = (start: number, end: number): string[] =>
  Array.from({ length: end - start + 1 }, (_, index) => `L-${start + index}`);

const makeLectures = (
  chapterName: string,
  codes: string[],
  localLabels?: string[],
): LectureSeed[] =>
  codes.map((code, index) => ({
    code,
    title: `${chapterName} ${localLabels?.[index] ?? `L-${index + 1}`}`,
  }));

const chapter = (
  id: string,
  chapterName: string,
  codes: string[],
  domain?: ChapterSeed['domain'],
  localLabels?: string[],
): ChapterSeed => ({
  id,
  chapterName,
  domain,
  lectures: makeLectures(chapterName, codes, localLabels),
});

// Corrected Pragyaan Physics curriculum: 97 lectures.
export const PHYSICS_SEED: ChapterSeed[] = [
  chapter('phy-rectilinear-motion', 'Rectilinear Motion', codeRange(1, 4)),
  chapter('phy-projectile-motion', 'Projectile Motion', codeRange(5, 6)),
  chapter('phy-relative-motion', 'Relative Motion', codeRange(7, 8)),
  chapter('phy-geometrical-optics', 'Geometrical Optics', codeRange(9, 14)),
  chapter('phy-nlm', "Newton's Laws of Motion", codeRange(15, 17)),
  chapter('phy-friction', 'Friction', codeRange(18, 19)),
  chapter('phy-wpe', 'Work, Power and Energy', codeRange(20, 22)),
  chapter('phy-circular-motion', 'Circular Motion', codeRange(23, 25)),
  chapter('phy-centre-of-mass', 'Centre of Mass and Collision', codeRange(26, 29)),
  chapter('phy-rbd', 'Rigid Body Dynamics', codeRange(30, 34)),
  chapter('phy-shm', 'Simple Harmonic Motion', codeRange(35, 37)),
  chapter('phy-electrostatics', 'Electrostatics', codeRange(38, 43)),
  chapter('phy-gravitation', 'Gravitation', codeRange(44, 45)),
  chapter('phy-current-electricity', 'Current Electricity', codeRange(46, 49)),
  chapter('phy-capacitor', 'Capacitor', codeRange(50, 51)),
  chapter('phy-emf', 'Electromagnetic Force and Magnetism', codeRange(52, 56)),
  chapter('phy-emi', 'Electromagnetic Induction', codeRange(57, 60)),
  chapter('phy-ac', 'Alternating Current', codeRange(61, 62)),
  chapter('phy-emw', 'Electromagnetic Waves', ['L-63'], undefined, ['']),
  chapter('phy-dual-nature', 'Dual Nature of Matter and Radiation', codeRange(64, 65)),
  chapter('phy-atomic-structure', 'Atomic Structure', codeRange(66, 67)),
  chapter('phy-nuclei', 'Nuclei', ['L-68']),
  chapter('phy-ktg', 'Kinetic Theory of Gases', ['L-69']),
  chapter('phy-thermodynamics', 'Thermodynamics', codeRange(70, 72)),
  chapter('phy-fluid-mechanics', 'Fluid Mechanics', codeRange(73, 75), undefined, ['L-1', 'L-2', 'L-4']),
  chapter('phy-viscosity', 'Viscosity', ['L-76']),
  chapter('phy-surface-tension', 'Surface Tension', ['L-77']),
  chapter('phy-elasticity', 'Elasticity', ['L-78']),
  chapter('phy-thermal-expansion', 'Thermal Expansion', ['L-79']),
  chapter('phy-calorimetry', 'Calorimetry', ['L-80']),
  chapter('phy-wave-string', 'Wave on String', codeRange(81, 83)),
  chapter('phy-sound-wave', 'Sound Wave', codeRange(84, 86)),
  chapter('phy-wave-optics', 'Wave Optics', codeRange(87, 89)),
  chapter('phy-heat-transfer', 'Heat Transfer', codeRange(90, 91)),
  chapter('phy-semiconductor', 'Semiconductor', codeRange(92, 94)),
  chapter('phy-units-dimensions', 'Units and Dimensions', ['L-95']),
  chapter('phy-errors-measurement', 'Errors and Measurement', codeRange(96, 97)),
];

// Corrected Pragyaan Mathematics tracker: 100 tracker entries.
export const MATHS_SEED: ChapterSeed[] = [
  chapter('mat-sets', 'Sets', ['L-1', 'L-2']),
  chapter('mat-fom', 'Fundamentals of Mathematics', ['L-0', ...codeRange(3, 8)]),
  chapter('mat-trigonometry', 'Trigonometry', codeRange(9, 14)),
  chapter('mat-progression', 'Progression', ['L-0', ...codeRange(28, 31)]),
  chapter('mat-statistics', 'Statistics', codeRange(32, 33)),
  chapter('mat-quadratic', 'Quadratic Equation', codeRange(15, 18)),
  chapter('mat-relation', 'Relation', ['L-19']),
  chapter('mat-function', 'Function', codeRange(20, 24)),
  chapter('mat-itf', 'Inverse Trigonometric Functions', codeRange(25, 27)),
  chapter('mat-matrices-determinants', 'Matrices and Determinants', ['L-0', ...codeRange(34, 39)]),
  chapter('mat-straight-line', 'Straight Line', codeRange(40, 44)),
  chapter('mat-circle', 'Circle', codeRange(45, 48)),
  chapter('mat-vector-3d', 'Vector and 3D Geometry', codeRange(75, 82)),
  chapter('mat-lcd', 'Limits, Continuity and Differentiability', codeRange(49, 54)),
  chapter('mat-mod', 'Method of Differentiation', ['L-55']),
  chapter('mat-aod', 'Application of Derivatives', codeRange(56, 59)),
  chapter('mat-conic-section', 'Conic Section', codeRange(60, 62)),
  chapter('mat-indefinite-integration', 'Indefinite Integration', codeRange(63, 65)),
  chapter('mat-definite-integration', 'Definite Integration', codeRange(66, 69)),
  chapter('mat-area', 'Area Under Curves', codeRange(70, 71)),
  chapter('mat-differential-equation', 'Differential Equation', codeRange(72, 74)),
  chapter('mat-complex-numbers', 'Complex Numbers', codeRange(83, 86)),
  chapter('mat-binomial-theorem', 'Binomial Theorem', codeRange(87, 89)),
  chapter('mat-permutation-combination', 'Permutation and Combination', codeRange(91, 93)),
  chapter('mat-probability', 'Probability', codeRange(96, 99)),
  chapter('mat-solution-triangle', 'Solution of Triangle', ['L-100']),
];

// Corrected Pragyaan Chemistry curriculum in planner order: 98 lectures.
export const CHEMISTRY_SEED: ChapterSeed[] = [
  chapter('che-mole-concept', 'Mole Concept', codeRange(1, 5), 'Physical'),
  chapter('che-iupac', 'IUPAC Nomenclature and General Names', codeRange(6, 8), 'Organic'),
  chapter('che-atomic-structure', 'Atomic Structure', codeRange(9, 14), 'Physical'),
  chapter('che-periodic-table', 'Periodic Table', codeRange(15, 17), 'Inorganic'),
  chapter('che-goc', 'General Organic Chemistry', codeRange(18, 22), 'Organic'),
  chapter('che-chemical-bonding', 'Chemical Bonding', codeRange(23, 30), 'Inorganic'),
  chapter('che-isomerism', 'Isomerism (Structural and Stereoisomerism)', codeRange(31, 35), 'Organic'),
  chapter('che-equilibrium', 'Chemical and Ionic Equilibrium', codeRange(36, 44), 'Physical'),
  chapter('che-coordination', 'Coordination Compounds', codeRange(45, 49), 'Inorganic'),
  chapter('che-hydrocarbons', 'Hydrocarbons', codeRange(50, 53), 'Organic'),
  chapter('che-electrochemistry', 'Electrochemistry', codeRange(54, 58), 'Physical'),
  chapter('che-haloalkanes', 'Haloalkanes and Aryl Halides', codeRange(59, 61), 'Organic'),
  chapter('che-qualitative-analysis', 'Qualitative Analysis (JEE Main)', codeRange(62, 63), 'Inorganic'),
  chapter('che-p-block', 'P-Block (JEE Main)', codeRange(64, 67), 'Inorganic'),
  chapter('che-alcohol-ether-phenol', 'Alcohol, Ether and Phenol', codeRange(68, 71), 'Organic'),
  chapter('che-chemical-kinetics', 'Chemical Kinetics', codeRange(72, 75), 'Physical'),
  chapter('che-amines', 'Amines and Diazonium Salt', ['L-76'], 'Organic'),
  chapter('che-carbonyls', 'Aldehydes, Ketones and Carboxylic Acids', codeRange(77, 80), 'Organic'),
  chapter('che-liquid-solution', 'Liquid Solution', codeRange(81, 84), 'Physical'),
  chapter('che-df-block', 'D and F Block', codeRange(85, 86), 'Inorganic'),
  chapter('che-biomolecules', 'Biomolecules', codeRange(87, 88), 'Organic'),
  chapter('che-separation-tests', 'Basic Techniques of Separation and Tests (POC)', ['L-89'], 'Organic'),
  chapter('che-thermodynamics', 'Thermodynamics and Thermochemistry', codeRange(90, 96), 'Physical'),
  chapter('che-equivalent-concept', 'Equivalent Concept', codeRange(97, 98), 'Physical'),
];

export const EXAM_CONFIG_DEFAULT = {
  id: 'singleton' as const,
  jeeMainS1Date: '2027-01-24',
  jeeMainS1Official: false,
  jeeMainS2Date: '2027-04-02',
  jeeMainS2Official: false,
  jeeAdvancedDate: '2027-05-16',
  jeeAdvancedOfficial: false,
  phase1EndDate: '2026-12-31',
};

export const APP_SETTINGS_DEFAULT = {
  id: 'singleton' as const,
  mathsAvgLectureMinutes: 120,
  chemPreferredSpeed: '1.25x' as const,
  theoryPlanStartDate: '2026-07-04',
  theoryTargetDate: '2026-12-31',
  plannedLecturesPerDay: 2,
  physicsLecturesPerDay: null,
  chemistryLecturesPerDay: null,
  mathsLecturesPerDay: null,
  activeThemeId: 'nerv-terminal' as const,
};
