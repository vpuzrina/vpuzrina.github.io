// Everything on /about (and, in Phase 4, /cv). Newest first within each group.
// "[TODO: ...]" shows on the page as a highlighted marker.

export type Entry = {
  org: string;
  role: string;
  place: string;
  dates: string;
  note?: string; // supervisor, funding, one line under the role
  bullets: string[];
  paper?: string;
};

export const research: Entry[] = [
  {
    org: 'Boston University, CAS Directed Study in Economics',
    role: 'Independent researcher',
    place: 'Boston, MA',
    dates: 'Fall 2026',
    note: 'Advisor: Prof. Onur Celik',
    bullets: [
      'Writing a paper on whether women in Power 4 college basketball get fewer Instagram followers than men with the same on-court performance, as a measure of marketability under NIL.',
      'Wrote the research proposal; the department chair approved it. Drafting the introduction and literature review; analysis will be in R.',
      'Broader working title: "The Evolution of the Gender Pay Gap in American Sports Compensation: From Title IX to NIL."',
    ],
    paper: 'nil-gender-gap',
  },
  {
    org: 'Independent research',
    role: 'Event study of the Cobre Panamá closure',
    place: 'Boston, MA',
    dates: 'Sep 2026 – present',
    bullets: [
      "Measuring how equity markets priced the shutdown of First Quantum's Cobre Panamá copper mine, against a set of comparison copper producers. Results are not final.",
      '[TODO: data source, tools and current status]',
    ],
    paper: 'cobre-panama',
  },
  {
    org: 'Boston University, Department of Economics',
    role: 'Research assistant, funded by a BU research grant',
    place: 'Boston, MA',
    dates: 'Sep 2026 – present',
    note: 'For PhD researcher Artem Vyshinskiy; project on the 1892–93 cholera epidemic in Imperial Russia',
    bullets: [
      'Built a monthly mortality panel by uezd (district) for 16 provinces over 1888–1893, 72 months each, plus 1892 medical-capacity data, from scanned Russian-language statistical yearbooks.',
      'Checked every table against its printed row and column totals, corrected source errors, and built a crosswalk between two district-coding systems so the datasets could be merged.',
      'Running regressions in R and Stata on the district panel, merged with an MIT famine dataset (harvests, taxes, serfdom).',
    ],
    paper: 'imperial-mortality',
  },
  {
    org: 'National Bureau of Economic Research',
    role: 'Research assistant',
    place: 'Boston, MA',
    dates: 'Mar 2026 – present',
    note: 'NBER project on racial expulsions in the U.S., 1880s; Prof. Martin Fiszbein (BU) and Prof. A. Ferrara (University of Pittsburgh)',
    bullets: [
      'Classified 5,000+ newspaper articles from the 1880s, 300–600 a week, as YES, POTENTIAL or NO under a detailed coding rubric, recording event location, violence and fatalities for each case.',
      'Kept the event location separate from the dateline and flagged duplicate coverage so each event counts once.',
      'One of 12+ research assistants at Boston University, UT Austin and Tulane. Approved to join the data-analysis stage.',
    ],
    paper: 'newspaper-expulsions',
  },
];

export const work: Entry[] = [
  {
    org: 'CarPot',
    role: 'Marketing and analytics intern, car-repair marketplace startup',
    place: 'Boston, MA',
    dates: 'May – Jul 2026',
    bullets: [
      'Analyzed website and app data (traffic, acquisition, engagement) and reported findings to the founders.',
      'Benchmarked competing car-repair platforms on pricing, fee models (subscription against per-job) and acquisition, for the positioning of the iOS and Android app.',
      'Researched Boston-area demand and customer segments on both sides of the marketplace, car owners and mechanics.',
    ],
  },
  {
    org: 'Yandex',
    role: 'Research intern, International Marketing Department',
    place: 'Moscow',
    dates: 'Jun – Aug 2025',
    bullets: [
      'Wrote the market-entry report "E-commerce Market of Uzbekistan: Barriers and Opportunities," which the department adopted.',
      'Designed and ran interviews with 19 small-business owners, surveyed 60+ consumers and benchmarked 8 e-commerce platforms to map demand and entry barriers.',
      'Analyzed the revenue of local competitors and compiled statistical summaries for department leadership.',
    ],
  },
];

export const leadership: Entry[] = [
  {
    org: 'Russian Speaking Society, Boston University',
    role: 'Senior treasurer',
    place: 'Boston, MA',
    dates: 'May 2025 – present',
    bullets: [
      'Manage a $3,000–4,000 semester budget and plan the budgets for 3 flagship events of 40–50 attendees each.',
      'Write the semester funding request to the Student Activities Allocations Board, process about 20 reimbursements a semester and report expenses to the university finance office.',
    ],
  },
  {
    org: 'BU AdClub Varsity Team',
    role: 'Project manager',
    place: 'Boston, MA',
    dates: '[TODO: dates]',
    bullets: ['Led a team of 7 on a campaign for a real client, The Half Cookie. [TODO: deliverables]'],
  },
];

export const activities = 'BU Hillel, volunteering team member. Girls Who Code, member.';

export const educationDetail = {
  school: 'Boston University, College of Arts & Sciences',
  place: 'Boston, MA',
  degree: 'B.A. in Computer Science and Economics (joint major)',
  minor: '[TODO: show the Minor in Business Administration or not]',
  grad: 'Expected May 2028',
  honors: "Dean's List",
  // Completed or in progress by the end of Fall 2026
  coursework: [
    ['EC 101', '[TODO: course name]'],
    ['EC 102', '[TODO: course name]'],
    ['EC 201', 'Intermediate Microeconomics'],
    ['EC 202', 'Intermediate Macroeconomics (in progress)'],
    ['EC 203', 'Empirical Economics I'],
    ['EC 204', 'Empirical Economics II'],
    ['CS 111', 'Introduction to Computer Science I (Python)'],
    ['CS 112', 'Introduction to Computer Science II (Java), taken as the intensive section CS 392 XI'],
    ['[TODO: code]', 'Calculus I'],
  ] as [string, string][],
  next: 'CS 131, CS 132, CS 210, CS 330 (2027)',
};

export const skills: [string, string][] = [
  ['Analysis', 'R, Stata (regressions), Python (pandas), SQL (basic), Excel'],
  ['Programming', 'Python, Java (coursework)'],
  ['Methods', 'event studies, OLS regression, data cleaning and validation, text classification against a rubric [TODO: confirm]'],
  ['Languages', 'Russian (native), English (fluent), Spanish (basic)'],
];

export const certifications = {
  issuer: 'Kaggle Learn',
  date: 'Oct 2026',
  items: 'Pandas, Data Cleaning, Data Visualization, Intro to SQL, Intro to Machine Learning',
};
