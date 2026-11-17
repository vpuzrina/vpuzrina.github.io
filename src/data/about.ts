// Everything on /about (and, in Phase 4, /cv). Newest first within each group.
// "[TODO: ...]" shows on the page as a highlighted marker.

export type Entry = {
  org: string;
  role: string;
  place: string;
  dates: string;
  note?: string; // supervisor, funding, one line under the role
  bullets: string[];
  cv?: string[]; // shorter bullets for the one-page CV; falls back to bullets
  cvRole?: string;
  cvHide?: boolean; // left off the one-page CV, kept on /about
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
    cv: [
      'Paper on whether women in Power 4 basketball get fewer Instagram followers than men with the same stats; proposal approved by the chair; analysis in R.',
    ],
    paper: 'nil-gender-gap',
  },
  {
    org: 'Boston University, EC 204 Empirical Economics II',
    role: 'Course research: group empirical paper',
    place: 'Boston, MA',
    dates: 'Fall 2026',
    note: 'Prof. Ishita Dey, section A1; with two classmates',
    bullets: [
      'Empirical paper applying cross-sectional OLS in Stata. The proposal is done and graded; initial results are due before Thanksgiving and the final paper at the end of the semester.',
    ],
    cvHide: true,
    paper: 'ec204-empirical-paper',
  },
  {
    org: 'Independent research',
    role: 'Event study of the Cobre Panamá closure',
    place: 'Boston, MA',
    dates: 'Sep 2026 – present',
    bullets: [
      'Measured how equity markets priced the 2023–2026 political and legal events around the Cobre Panamá copper mine: 15 firms, five events, a two-factor market model with home-market and copper returns, in R.',
      "First Quantum's abnormal return was −43.6% over two days after the October 2023 referendum announcement, about US$6.1 billion; Franco-Nevada's was −12.1%, about US$3.1 billion. Rival miners and smelters showed no significant response in placebo tests on 639 ordinary days.",
      'Code, event list and decision log: github.com/vpuzrina/cobre-panama-event-study.',
    ],
    cv: ["Event study of 15 firms and 5 Cobre Panamá events in R; First Quantum's 2-day CAR after the referendum: −43.6% (US$6.1 bn)."],
    paper: 'cobre-panama',
  },
  {
    org: 'Independent research',
    role: 'Nasdaq Rule 5210(l) and IPOs by China-based companies',
    place: 'Boston, MA',
    dates: 'working paper, November 2026',
    bullets: [
      'Built a dataset of 939 foreign issuers that filed Form F-1s with the SEC between January 2022 and October 2026, classifying China-based issuers from their prospectuses, and estimated a Poisson difference-in-differences model with month fixed effects.',
      'IPOs by mainland Chinese, Hong Kong and Macau issuers fell 67% relative to other foreign IPOs between the proposal and the effective date, and 88% after it; small Chinese IPOs showed similar ramp-and-dump rates to other small foreign IPOs (13% versus 10%, p = 0.49).',
    ],
    cvHide: true,
    paper: 'nasdaq-china-ipo-rule',
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
    cvRole: 'Research assistant (BU grant), 1892–93 cholera in Imperial Russia, for PhD researcher Artem Vyshinskiy',
    cv: [
      'Built a monthly district mortality panel for 16 provinces, 1888–1893 (72 months each), from scanned statistical yearbooks.',
      'Checked every table against its printed row and column totals, corrected source errors and built a crosswalk between two district-coding systems.',
      'Running regressions in R and Stata on the panel merged with an MIT famine dataset (harvests, taxes, serfdom).',
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
    cvRole: 'Research assistant (Prof. M. Fiszbein, BU; Prof. A. Ferrara, University of Pittsburgh)',
    cv: [
      'Classified 5,000+ U.S. newspaper articles from the 1880s (300–600 a week) as YES, POTENTIAL or NO racial expulsions under a detailed coding rubric, recording location, violence and fatalities.',
      'Kept event location separate from the dateline and flagged duplicate coverage; one of 12+ RAs at BU, UT Austin and Tulane; approved for the data-analysis stage.',
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
    cv: [
      'Analyzed website and app data (traffic, acquisition, engagement) and reported findings to the founders.',
      'Benchmarked competing platforms on pricing and fee models; researched demand among car owners and mechanics.',
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
    cv: [
      'Wrote the report "E-commerce Market of Uzbekistan: Barriers and Opportunities," adopted by the department.',
      'Ran 19 interviews with small-business owners, surveyed 60+ consumers, benchmarked 8 platforms and analyzed competitor revenue.',
    ],
    paper: 'uzbekistan-ecommerce',
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
    cv: ['Manage a $3,000–4,000 semester budget for 3 flagship events of 40–50 attendees; write the funding request to the Allocations Board; process about 20 reimbursements a semester.'],
  },
  {
    org: 'BU AdClub Varsity Team',
    role: 'Project manager',
    place: 'Boston, MA',
    dates: '[TODO: dates]',
    cvHide: true,
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
    ['EC 101', 'Introductory Microeconomic Analysis'],
    ['EC 102', 'Introductory Macroeconomic Analysis'],
    ['EC 201', 'Intermediate Microeconomics'],
    ['EC 202', 'Intermediate Macroeconomics (in progress)'],
    ['EC 203', 'Empirical Economics I'],
    ['EC 204', 'Empirical Economics II'],
    ['CS 111', 'Introduction to Computer Science I (Python)'],
    ['CS 112', 'Introduction to Computer Science II (Java), taken as the intensive section CS 392 XI'],
    ['MA 123', 'Calculus I'],
  ] as [string, string][],
  next: 'CS 131, CS 132, CS 210, CS 330 (2027)',
  cvCoursework:
    'Intermediate Microeconomics (EC 201), Intermediate Macroeconomics (EC 202, in progress), Empirical Economics I and II (EC 203, EC 204), Intro to Computer Science I and II (CS 111, Python; CS 112, Java, intensive section CS 392 XI)',
};

export const skills: [string, string][] = [
  ['Analysis', 'R, Stata (regressions), Python (pandas), SQL (basic), Excel'],
  ['Programming', 'Python, Java (coursework)'],
  ['Methods', 'event studies, OLS regression, data cleaning and validation, text classification against a rubric'],
  ['Languages', 'Russian (native), English (fluent), Spanish (basic)'],
];

export const certifications = {
  issuer: 'Kaggle Learn',
  date: 'Oct 2026',
  items: 'Pandas, Data Cleaning, Data Visualization, Intro to SQL, Intro to Machine Learning',
};
