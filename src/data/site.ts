// Facts about me, in one place. Pages read from here; nothing else hard-codes them.
// Anything still unknown is written as "[TODO: ...]" and shows on the page as a highlighted marker.
// The main-site deploy refuses to ship while any [TODO] is left in the built HTML.

export const person = {
  name: 'Varvara Puzrina',
  email: 'vpuzrina@gmail.com',
  linkedin: 'https://www.linkedin.com/in/varvara-puzrina-703221328',
  linkedinLabel: 'linkedin.com/in/varvara-puzrina-703221328',
  github: 'https://github.com/vpuzrina',
  githubLabel: 'github.com/vpuzrina',
  repo: 'https://github.com/vpuzrina/vpuzrina.github.io',
  cvPdf: '/varvara-puzrina-cv.pdf',
  city: 'Boston, MA',
};

export const availability = {
  badge: 'Internship · Spring/Summer 2027',
  sentence:
    'Looking for a Spring 2027 (part-time) or Summer 2027 internship in economic consulting, research analytics or due diligence.',
  location: 'Based in Boston. Open to New York, London, Dubai, Hong Kong.',
};

export const education = {
  school: 'Boston University, College of Arts & Sciences',
  degree: 'B.A. in Computer Science and Economics (joint major)',
  minor: '[TODO: show the Minor in Business Administration or not]',
  grad: 'Expected May 2028',
  honors: "Dean's List",
};

export type Role = {
  org: string;
  role: string;
  place: string;
  dates: string;
  line: string; // one sentence for the home page
  paper?: string; // slug of the paper page, if any
};

// Home page "Experience", newest first. CarPot is on /about and /cv only.
export const experience: Role[] = [
  {
    org: 'Boston University, CAS Directed Study',
    role: 'Independent researcher',
    place: 'Boston',
    dates: 'Fall 2026',
    line:
      'With Prof. Onur Celik, I am writing a paper on whether women in Power 4 college basketball draw smaller Instagram audiences than men with the same on-court numbers. I am drafting the introduction and literature review.',
    paper: 'nil-gender-gap',
  },
  {
    org: 'Boston University, Department of Economics',
    role: 'Research assistant, BU grant',
    place: 'Boston',
    dates: 'Sep 2026 – present',
    line:
      'For PhD researcher Artem Vyshinskiy, I am building a monthly mortality panel for 16 provinces of Imperial Russia, 72 months each, from scanned statistical yearbooks, and checking every table against its printed totals.',
    paper: 'imperial-mortality',
  },
  {
    org: 'National Bureau of Economic Research',
    role: 'Research assistant',
    place: 'Boston',
    dates: 'Mar 2026 – present',
    line:
      'On an NBER project on racial expulsions in the U.S. in the 1880s (Prof. Martin Fiszbein, BU, and Prof. A. Ferrara, Pittsburgh), I have classified 5,000+ newspaper articles against the coding rubric, 300–600 a week, alongside 12+ RAs at BU, UT Austin and Tulane.',
    paper: 'newspaper-expulsions',
  },
  {
    org: 'Yandex, International Marketing Department',
    role: 'Research intern',
    place: 'Moscow',
    dates: 'Jun – Aug 2025',
    line:
      'I wrote a market-entry report on e-commerce in Uzbekistan from 19 interviews with small-business owners, a survey of 60+ consumers and a benchmark of 8 platforms. The department adopted it.',
  },
];

export const otherWork: Role[] = [
  {
    org: 'Russian Speaking Society at BU',
    role: 'Senior treasurer',
    place: 'Boston',
    dates: 'May 2025 – present',
    line:
      'I run a $3,000–4,000 semester budget, write the funding request to the Student Activities Allocations Board and process about 20 reimbursements a semester.',
  },
  {
    org: 'BU AdClub Varsity Team',
    role: 'Project manager',
    place: 'Boston',
    dates: '[TODO: dates]',
    line: 'I led a team of 7 on a campaign for a real client, The Half Cookie. [TODO: deliverables]',
  },
];
