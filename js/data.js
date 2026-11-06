/**
 * data.js — Static event catalogue for KIIT Fest 2026.
 *
 * All event content lives here so it can later be swapped for an API
 * without touching any rendering code. Each event exposes:
 *   id, title, category, date (ISO), time, venue, image, capacity,
 *   booked (seats already taken before this browser's registrations),
 *   short + long description, speakers, schedule, rules, map pin coords.
 */

/** The flagship event the hero countdown ticks towards (IST, UTC+05:30). */
export const FLAGSHIP = {
  name: 'KIIT Fest 2026',
  start: '2026-12-18T17:00:00+05:30',
};

/** Category metadata used for filter pills, tags and ticket prefixes. */
export const CATEGORIES = {
  tech: { label: 'Tech', code: 'TEC' },
  cultural: { label: 'Cultural', code: 'CUL' },
  sports: { label: 'Sports', code: 'SPT' },
  hackathon: { label: 'Hackathons', code: 'HAK' },
  lecture: { label: 'Guest Lectures', code: 'LEC' },
  workshop: { label: 'Workshops', code: 'WKS' },
};

export const EVENTS = [
  {
    id: 'kiit-fest-mainstage',
    title: 'KIIT Fest Mainstage Night',
    category: 'cultural',
    date: '2026-12-18',
    time: '17:00 – 23:00',
    venue: 'KIIT Stadium, Campus 6',
    image: 'hero',
    capacity: 5000,
    booked: 4620,
    summary: 'The flagship opening night — live bands, a celebrity headliner and the biggest light show on campus.',
    description:
      'KIIT Fest opens with a three-act concert on the stadium mainstage. Student bands from across Odisha warm up the crowd before the headliner takes over, followed by a drone-and-laser finale above Campus 6. Gates open at 16:00; entry is by registered pass only.',
    speakers: [
      { name: 'The Kalinga Collective', role: 'Opening band' },
      { name: 'DJ Ananya Rao', role: 'Sunset set' },
      { name: 'Headliner — TBA', role: 'Announced 1 Dec' },
    ],
    schedule: [
      ['16:00', 'Gates open & security check'],
      ['17:00', 'Inaugural ceremony'],
      ['18:30', 'Student band showcase'],
      ['21:00', 'Headliner performance'],
      ['22:45', 'Drone & laser finale'],
    ],
    rules: ['Carry your KIIT ID and digital pass.', 'No outside food, bottles or bags larger than A4.', 'Re-entry is not permitted after 20:00.'],
    pin: { x: 72, y: 38 },
  },
  {
    id: 'hack-kiit-36',
    title: 'HackKIIT 36',
    category: 'hackathon',
    date: '2026-12-19',
    time: '09:00 (36 hrs)',
    venue: 'Campus 15 Innovation Hall',
    image: 'hackathon',
    capacity: 400,
    booked: 312,
    summary: 'A 36-hour build sprint with ₹5 lakh in prizes across AI, climate-tech and open-source tracks.',
    description:
      'Form teams of 2–4 and ship something real in 36 hours. Mentors from industry and KIIT-TBI rotate through the hall, and finalists pitch to a jury on day two. Meals, Wi-Fi and a nap zone are on us — bring your laptop and your ideas.',
    speakers: [
      { name: 'Dr. Sushree Mohanty', role: 'Head Judge, School of CSE' },
      { name: 'Rohan Verma', role: 'Mentor, Cloud Infrastructure' },
      { name: 'Priya Nair', role: 'Mentor, Product Design' },
    ],
    schedule: [
      ['09:00', 'Check-in & team formation'],
      ['10:30', 'Problem statements released'],
      ['22:00', 'Midnight mentor round'],
      ['21:00 +1', 'Code freeze & final pitches'],
    ],
    rules: ['Teams of 2–4 students; cross-branch teams encouraged.', 'All code must be written during the event.', 'Use of open-source libraries is allowed with attribution.'],
    pin: { x: 30, y: 26 },
  },
  {
    id: 'robo-wars',
    title: 'RoboWars & Tech Expo',
    category: 'tech',
    date: '2026-12-19',
    time: '11:00 – 18:00',
    venue: 'Campus 8 Mechanical Arena',
    image: 'tech',
    capacity: 600,
    booked: 388,
    summary: 'Combat robots, autonomous drones and 40+ student prototypes under one roof.',
    description:
      'Watch 15 kg combat bots battle it out in the arena while the expo floor showcases student-built EVs, drones and IoT projects. Registered teams compete for the RoboWars trophy; visitors can vote for the People’s Choice prototype.',
    speakers: [
      { name: 'Prof. Arjun Das', role: 'Faculty Coordinator, Robotics Society' },
      { name: 'Team Kronos', role: 'Defending champions' },
    ],
    schedule: [
      ['11:00', 'Expo floor opens'],
      ['13:00', 'RoboWars league rounds'],
      ['16:30', 'Finals & award ceremony'],
    ],
    rules: ['Bots must meet the 15 kg weight class.', 'Safety inspection is mandatory before 12:30.', 'Spectators stay behind the arena barrier.'],
    pin: { x: 48, y: 62 },
  },
  {
    id: 'odissi-nritya',
    title: 'Nritya Sandhya — Classical Night',
    category: 'cultural',
    date: '2026-12-20',
    time: '18:30 – 21:00',
    venue: 'KIIT Convention Centre',
    image: 'cultural',
    capacity: 1200,
    booked: 1150,
    summary: 'An evening of Odissi, Kathak and Bharatanatyam celebrating Odisha’s living heritage.',
    description:
      'Nritya Sandhya brings together student troupes and guest artists for a curated evening of classical dance. The programme closes with a collaborative Odissi piece choreographed by the KIIT Cultural Society.',
    speakers: [
      { name: 'Guru Sujata Mohapatra', role: 'Guest Artist' },
      { name: 'KIIT Cultural Society', role: 'Host troupe' },
    ],
    schedule: [
      ['18:30', 'Lamp lighting & invocation'],
      ['19:00', 'Student troupe performances'],
      ['20:15', 'Guest artist recital'],
    ],
    rules: ['Seating is first-come within your pass block.', 'Photography without flash only.', 'Please be seated by 18:20.'],
    pin: { x: 60, y: 48 },
  },
  {
    id: 'inter-uni-football',
    title: 'Inter-University Football Cup',
    category: 'sports',
    date: '2026-12-20',
    time: '15:00 – 19:00',
    venue: 'KIIT Stadium Main Ground',
    image: 'sports',
    capacity: 3000,
    booked: 1740,
    summary: 'Eight universities, one trophy — the knockout finals under floodlights.',
    description:
      'Cheer for KIIT as eight university squads battle through the knockout bracket. Registered spectators get stand access, and student players can still register for the halftime penalty-shootout challenge.',
    speakers: [
      { name: 'Coach Bikash Pradhan', role: 'KIIT Football Head Coach' },
      { name: 'Ravi Kumar', role: 'Match Commentator' },
    ],
    schedule: [
      ['15:00', 'Semi-final 1'],
      ['16:30', 'Semi-final 2'],
      ['18:00', 'Grand Final & trophy presentation'],
    ],
    rules: ['Spectator pass grants stand access only.', 'No flares or air horns.', 'Players must carry university ID.'],
    pin: { x: 74, y: 44 },
  },
  {
    id: 'ai-keynote',
    title: 'Keynote: Building Responsible AI',
    category: 'lecture',
    date: '2026-12-21',
    time: '10:00 – 12:00',
    venue: 'Campus 17 Auditorium',
    image: 'lecture',
    capacity: 800,
    booked: 702,
    summary: 'An industry leader on shipping AI that is safe, fair and actually useful — followed by open Q&A.',
    description:
      'This guest lecture explores how modern AI systems are evaluated, deployed and governed. Expect real case studies, a frank discussion of failure modes and a 30-minute open Q&A with students and faculty.',
    speakers: [
      { name: 'Dr. Meera Iyer', role: 'Director of AI Research (Guest)' },
      { name: 'Prof. Sanjay Panda', role: 'Moderator, School of CSE' },
    ],
    schedule: [
      ['10:00', 'Welcome address'],
      ['10:15', 'Keynote talk'],
      ['11:15', 'Panel & open Q&A'],
    ],
    rules: ['Seats are released 10 minutes after start.', 'Questions via the live Q&A board.', 'Certificates for registered attendees.'],
    pin: { x: 22, y: 52 },
  },
  {
    id: 'uiux-workshop',
    title: 'Hands-on UI/UX Design Sprint',
    category: 'workshop',
    date: '2026-12-21',
    time: '14:00 – 17:30',
    venue: 'Campus 25 Design Lab',
    image: 'workshop',
    capacity: 120,
    booked: 104,
    summary: 'Go from sketch to clickable prototype in one afternoon with industry mentors.',
    description:
      'A practical workshop covering user research, wireframing and prototyping in Figma. Work in pairs on a real campus problem and leave with a portfolio-ready case study and a participation certificate.',
    speakers: [
      { name: 'Kavya Reddy', role: 'Senior Product Designer (Guest)' },
      { name: 'KIIT Design Club', role: 'Facilitators' },
    ],
    schedule: [
      ['14:00', 'Research & problem framing'],
      ['15:00', 'Wireframing sprint'],
      ['16:30', 'Prototype critiques'],
    ],
    rules: ['Bring a laptop with Figma installed.', 'Limited seats — pairs assigned on arrival.', 'Certificate on full attendance only.'],
    pin: { x: 38, y: 74 },
  },
  {
    id: 'iot-workshop',
    title: 'IoT & Embedded Systems Bootcamp',
    category: 'workshop',
    date: '2026-12-22',
    time: '10:00 – 16:00',
    venue: 'Campus 3 Electronics Lab',
    image: 'workshop',
    capacity: 90,
    booked: 41,
    summary: 'Solder, flash and deploy your own smart sensor node in a full-day bootcamp.',
    description:
      'Learn microcontroller basics, sensor integration and MQTT messaging, then build a working environmental monitor to take home. Kits are provided for every registered participant.',
    speakers: [
      { name: 'Dr. Anil Behera', role: 'School of Electronics' },
      { name: 'IEEE KIIT Student Branch', role: 'Co-hosts' },
    ],
    schedule: [
      ['10:00', 'Microcontroller fundamentals'],
      ['12:30', 'Lunch break'],
      ['13:30', 'Build & deploy session'],
    ],
    rules: ['Kits must be signed out and returned.', 'Closed-toe shoes required in the lab.', 'Open to all branches.'],
    pin: { x: 18, y: 34 },
  },
  {
    id: 'code-relay',
    title: 'Code Relay Championship',
    category: 'tech',
    date: '2026-12-22',
    time: '13:00 – 17:00',
    venue: 'Campus 15 Lab Complex',
    image: 'hackathon',
    capacity: 300,
    booked: 196,
    summary: 'Tag-team competitive programming: three coders, one keyboard, 15-minute handovers.',
    description:
      'Teams of three solve algorithmic problems in relay — only one member codes at a time, and you hand over every 15 minutes. Fast thinking, clean handovers and great communication win the day.',
    speakers: [{ name: 'KIIT Competitive Coding Club', role: 'Organisers' }],
    schedule: [
      ['13:00', 'Briefing & environment check'],
      ['13:30', 'Relay round (3 hrs)'],
      ['16:45', 'Results'],
    ],
    rules: ['Teams of exactly three.', 'C++, Java or Python only.', 'Internet access is disabled during the round.'],
    pin: { x: 34, y: 22 },
  },
  {
    id: 'campus-marathon',
    title: 'KIIT Campus Run 10K',
    category: 'sports',
    date: '2026-12-23',
    time: '05:45 – 09:00',
    venue: 'Start: Campus 6 Gate',
    image: 'sports',
    capacity: 1500,
    booked: 820,
    summary: 'A sunrise 10K and 5K fun run looping through KIIT’s green campus trails.',
    description:
      'Lace up for the campus run that closes KIIT Fest. Choose the timed 10K or the untimed 5K fun run. Every finisher gets a medal and breakfast at the finish line.',
    speakers: [{ name: 'KIIT Sports Council', role: 'Race organisers' }],
    schedule: [
      ['05:45', 'Bib collection & warm-up'],
      ['06:15', '10K flag-off'],
      ['06:30', '5K fun run flag-off'],
      ['08:30', 'Medals & breakfast'],
    ],
    rules: ['Medical fitness self-declaration required.', 'Bibs must be visible at all times.', 'Hydration points every 2.5 km.'],
    pin: { x: 66, y: 30 },
  },
];

/** Multi-day timeline for the Schedule section (references event ids). */
export const SCHEDULE_DAYS = [
  { label: 'Day 1', date: '2026-12-18', items: ['kiit-fest-mainstage'] },
  { label: 'Day 2', date: '2026-12-19', items: ['hack-kiit-36', 'robo-wars'] },
  { label: 'Day 3', date: '2026-12-20', items: ['inter-uni-football', 'odissi-nritya'] },
  { label: 'Day 4', date: '2026-12-21', items: ['ai-keynote', 'uiux-workshop'] },
  { label: 'Day 5', date: '2026-12-22–23', items: ['iot-workshop', 'code-relay', 'campus-marathon'] },
];
