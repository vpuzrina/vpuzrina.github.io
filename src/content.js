// All site text lives here. Edit freely; layout code reads from this file.
//
// Rules the renderer enforces:
// - Any field containing "[TODO" or "[FILL" is NOT shown on the page. Replace the marker with the
//   real text and the element appears. Hidden items are listed in the build/dev terminal, and in
//   the browser console on `npm run dev`.
// - A `todos: [...]` array on an item is never rendered; it is only listed with the others.
// - Empty links (github: '') are hidden.

export default {
  meta: {
    title: 'Varvara Puzrina | Research and data analysis | Boston University',
    description:
      'Varvara Puzrina: Economics and Computer Science student at Boston University and research assistant on an NBER project. Builds datasets from primary sources and tests them in R. Looking for economic consulting and research analytics internships.',
    url: 'https://vpuzrina.github.io', // used for absolute Open Graph / canonical URLs
  },

  person: {
    name: 'Varvara Puzrina',
    short: 'VP',
    email: 'vpuzrina@gmail.com',
    linkedin: 'https://www.linkedin.com/in/varvara-puzrina-703221328',
    github: '[FILL: GitHub URL]', // header icon, footer link and Work samples card appear once filled
    cv: 'resume.pdf', // file in /public, served as a real file when deployed
    cvDownloadName: 'Varvara-Puzrina-CV.pdf',
  },

  // `section` ties a link to a section; links to hidden sections are dropped automatically
  nav: [
    { label: 'About', href: '#about' },
    { label: 'Research', href: '#research' },
    { label: 'Case study', href: '#case' },
    { label: 'Projects', href: '#project', section: 'featuredProject' },
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
  ],

  hero: {
    availability: 'Open to Summer 2027 internships and research roles',
    // Pick one with `headline` (0–3). Each option is two lines.
    headlineOptions: [
      ['I build the dataset', 'and test what it shows.'],
      ['From raw records', 'to tested answers.'],
      ['I build the data', 'and run the analysis.'],
      ['Careful data work,', 'from the source to the answer.'],
    ],
    headline: 0,
    subline:
      'Economics and Computer Science student at Boston University, research assistant on an NBER project, and former research intern at Yandex.',
    primaryCta: 'Download CV',
    secondaryCta: 'See my research',
    kpis: [
      { value: '5,000+', label: 'historical documents coded', note: 'NBER' },
      { value: "Dean's List", label: 'last 2 semesters', note: 'Boston University' },
      { value: '$3,000–4,000', label: 'semester budget managed', note: 'Russian Speaking Society' },
      { value: '19 + 60+', label: 'interviews and survey responses', note: 'Yandex' },
    ],
  },

  affiliations: {
    label: 'Affiliations',
    items: ['Boston University', 'National Bureau of Economic Research', 'Yandex'],
  },

  about: {
    title: 'Most of my work happens between the archive and the regression.',
    paragraphs: [
      "I'm a junior at Boston University. On my research projects I classify historical documents under a rubric, digitize archive tables and reconcile them to their totals, then run the analysis in R and write up what it shows.",
      'Next I want to do this work at an economic consulting firm or on a research-analytics team.',
    ],
    degree: 'B.S. Computer Science and Economics (joint major), Boston University · expected May 2028 · Dean’s List',
    minor: '[FILL: yes/no] Minor in Business Administration', // shown only once the marker is removed
    photo: 'photo.jpg', // add public/photo.jpg and it appears next to this text; hidden while the file is missing
    photoAlt: 'Varvara Puzrina',
  },

  research: {
    title: 'Research',
    relevantLabel: 'Relevant to',
    roles: [
      {
        org: 'National Bureau of Economic Research',
        orgShort: 'NBER',
        role: 'Research Assistant',
        project: 'Racial Expulsions in the U.S.',
        supervisors: [
          { name: 'Prof. Martin Fiszbein', affil: 'Boston University', short: 'BU' },
          // Full name hidden until filled: replace with e.g. 'Prof. Firstname Ferrara'
          { name: 'Prof. A. Ferrara', fullName: '[FILL: Prof. first name Ferrara]', affil: 'University of Pittsburgh', short: 'Pitt' },
        ],
        dates: 'Mar 2026 – Present',
        relevant: 'Document review and coding',
        bullets: [
          'Classify 300–600 U.S. newspaper articles from the 1880s each week as YES, POTENTIAL or NO cases of racial expulsion under a detailed coding rubric; 5,000+ classified so far.',
          'Record each case as a structured entry, with the event location kept separate from the dateline, plus violence and fatalities, and flag duplicate coverage so each event counts once.',
          "Selected for the project's data-analysis stage.",
        ],
      },
      {
        org: 'Boston University, Department of Economics',
        orgShort: 'BU Economics',
        role: 'Grant-Funded Research Assistant',
        project: '1892–93 Cholera in Imperial Russia',
        supervisors: [{ name: 'A. Vyshinskiy', fullName: '[FILL: first name Vyshinskiy]', affil: 'PhD researcher, BU Economics', short: 'PhD researcher, BU' }],
        dates: 'Aug 2026 – Present',
        funding: 'Funded by a Boston University research grant',
        relevant: 'Dataset construction',
        bullets: [
          'Built a monthly mortality panel for 16 provinces over 1888–1893 (72 months each), digitized from scanned Russian-language Imperial statistical yearbooks.',
          'Checked every table against its row and column totals, corrected source errors and built a crosswalk between two district-coding systems so the datasets could be merged.',
          'Now running regressions in R on the district panel, merged with an MIT famine dataset (harvests, taxes, serfdom).',
        ],
      },
      {
        org: 'BU CAS Directed Study Program',
        orgShort: 'BU Directed Study',
        role: 'Independent Researcher',
        project: 'Gender Gap in College Athlete NIL Compensation',
        supervisors: [{ name: 'Prof. Onur Celik', affil: 'Advisor, BU Economics', short: 'BU' }],
        dates: 'Sep 2026 – Present',
        relevant: 'Empirical testing',
        bullets: [
          'Wrote an original empirical proposal on the gender gap in NIL pay among NCAA Division I basketball players; the department chair approved it.',
          'Now building a cross-section that matches On3 NIL valuations to 2025–26 season statistics, with rules for missing data and a top-1% outlier check.',
          'Designed the test: OLS in R with controls, in levels and logs, based on a review of the pay-gap literature.',
        ],
      },
    ],
  },

  caseStudy: {
    title: 'Case study: e-commerce market entry in Uzbekistan',
    org: 'Yandex · International Marketing Department',
    role: 'Research Intern',
    dates: '[FILL: month–month year]', // shown in the case-study header once filled
    reportTitle: 'E-commerce Market of Uzbekistan: Barriers and Opportunities',
    question: 'What barriers and opportunities would Yandex face if it entered e-commerce in Uzbekistan?',
    approachLabel: 'Approach',
    approach: [
      { value: '19', label: 'interviews with SMB owners, using an interview guide I designed' },
      { value: '60+', label: 'local consumers surveyed' },
      { value: '8', label: 'e-commerce platforms benchmarked' },
    ],
    approachNote: 'I also analyzed competitor revenue and compiled statistical summaries for department leadership.',
    findingsLabel: 'What I found',
    findings: ['[FILL: finding 1]', '[FILL: finding 2]', '[FILL: finding 3]'], // row hidden while empty
    outcomeLabel: 'Outcome',
    outcome: 'The International Marketing Department adopted the report.',
  },

  // Hidden until the project is finished. Set visible: true and fill src/data/cobre.json
  // with real estimates ("placeholder": false); the chart refuses to draw placeholder data.
  featuredProject: {
    visible: false,
    title: 'Cobre Panamá mine closure: an event study',
    lead: 'Written up the way I would hand it to a manager: the question, the data, the method and the answer.',
    reportId: 'Report 01',
    question: '[TODO: the exact question]',
    data: '[TODO: data sources, tickers, frequency and sample window]',
    method: '[TODO: estimation window, benchmark model, event window and test used]',
    findingLabel: 'Key finding',
    chartTitle: 'Event window',
    github: '',
    githubLabel: 'Code and write-up on GitHub',
  },

  // Max 3 cards; each shows only when filled. The section disappears when none is.
  workSamples: {
    title: 'Work samples',
    nil: {
      label: 'Research proposal',
      title: 'Gender gap in college athlete NIL pay',
      abstract: '[FILL: 2–3 sentence abstract]', // expandable card
      more: 'Read abstract',
    },
    github: {
      label: 'Code',
      title: 'GitHub',
      text: '[FILL: one line on what the repos contain]',
    },
    cobre: {
      // appears automatically when featuredProject.visible is true
      label: 'Event study',
      title: 'Cobre Panamá mine closure',
      text: 'Question, data, method and result, written up as a short report.',
    },
  },

  experience: {
    title: 'Experience',
    items: [
      {
        role: 'Marketing & Analytics Intern',
        org: 'CarPot',
        place: 'Boston',
        dates: 'May – Jul 2026',
        // If you add a number or result, put it in `result`; it is appended to the first bullet
        result: '[FILL: number or result]',
        bullets: [
          'Analyzed website and app data (traffic, acquisition, engagement) and reported findings to the founders',
          'Benchmarked competing car-repair platforms on pricing and fee models, subscription against per-job.',
        ],
      },
      {
        role: 'Senior Treasurer',
        org: 'Russian Speaking Society at BU',
        dates: 'May 2025 – Present',
        bullets: [
          'Manage a $3,000–4,000 semester budget and plan budgets for 3 flagship events of 40–50 attendees each.',
          'Prepare funding requests to the Allocations Board and process about 20 reimbursements a semester.',
        ],
      },
      {
        role: 'Project Manager',
        org: 'BU AdClub Varsity Team',
        dates: '[FILL: dates]',
        bullets: ['Led a 7-person team on a campaign for a real client, The Half Cookie.'],
      },
    ],
  },

  skills: {
    title: 'Skills',
    groups: [
      { name: 'Analysis', items: ['R', 'Stata', 'Excel', 'Regression analysis (OLS)', 'Panel data', 'Data cleaning'] },
      { name: 'Research', items: ['Rubric-based document coding', 'Archival research', 'Data validation', 'Survey design', 'Interviews', 'Report writing'] },
      { name: 'Programming', items: ['Python', 'Java'] },
      { name: 'Languages', items: ['English · fluent', 'Russian · native', 'Spanish · basic'] },
      {
        name: 'Coursework',
        items: ['Empirical Economics I & II', 'Intermediate Microeconomics', 'Intermediate Macroeconomics', 'Intro to CS I (Python)', 'Intro to CS II (Java)'],
      },
    ],
  },

  contact: {
    title: "Let's talk.",
    text: "I'm looking for internships and research roles in economic consulting and research analytics.",
    emailCta: 'Email me',
    linkedinCta: 'LinkedIn',
    githubCta: 'GitHub',
    cvCta: 'Download CV',
    footer: 'Varvara Puzrina · Boston, MA',
    updated: 'Updated Oct 2026',
  },
};
