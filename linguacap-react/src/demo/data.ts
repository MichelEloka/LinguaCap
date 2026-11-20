import type { DemoState, Lesson, MediaAsset, Session } from '../domain/types';

export const learnerId = 'camille';
export const teacherName = 'Marie Laurent';

function localDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function relativeDate(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return localDate(date);
}

export const todayIndex = (new Date().getDay() + 6) % 7;
export const weekDates = Array.from({ length: 7 }, (_, index) => relativeDate(index - todayIndex));

export const lessons: Lesson[] = [
  {
    id: 'cafe',
    title: 'Commander au café',
    skill: 'Écoute',
    summary: 'Reconnaissez un mot à l’oral, puis apprenez à commander une boisson poliment.',
    phrases: [
      { german: 'der Kaffee', french: 'le café' },
      { german: 'Ich möchte einen Kaffee, bitte.', french: 'Je voudrais un café, s’il vous plaît.' },
      { german: 'Danke schön!', french: 'Merci beaucoup !' },
    ],
    mediaIds: ['coffee-photo', 'coffee-audio'],
    question: {
      prompt: 'Comment dit-on « Je voudrais un café, s’il vous plaît » ?',
      choices: ['Ich möchte einen Kaffee, bitte.', 'Ich heiße Kaffee.', 'Wo ist der Bahnhof?'],
      correct: 0,
      feedback: '« Ich möchte …, bitte » est une formule polie pour passer une commande.',
    },
  },
  {
    id: 'salutations',
    title: 'Saluer et prendre congé',
    skill: 'Vocabulaire',
    summary: 'Choisissez une salutation adaptée au moment de la journée.',
    phrases: [
      { german: 'Guten Morgen!', french: 'Bonjour ! (le matin)' },
      { german: 'Guten Abend!', french: 'Bonsoir !' },
      { german: 'Auf Wiedersehen!', french: 'Au revoir !' },
    ],
    mediaIds: [],
    question: {
      prompt: 'Que dites-vous pour saluer quelqu’un le matin ?',
      choices: ['Guten Abend!', 'Guten Morgen!', 'Auf Wiedersehen!'],
      correct: 1,
      feedback: '« Guten Morgen » s’utilise pour saluer quelqu’un le matin.',
    },
  },
  {
    id: 'presentation',
    title: 'Se présenter en allemand',
    skill: 'Expression orale',
    summary: 'Présentez-vous en trois phrases avec votre nom et un lieu.',
    phrases: [
      { german: 'Ich heiße Camille.', french: 'Je m’appelle Camille.' },
      { german: 'Ich komme aus Frankreich.', french: 'Je viens de France.' },
      { german: 'Ich wohne in Lyon.', french: 'J’habite à Lyon.' },
    ],
    mediaIds: [],
    question: {
      prompt: 'Quelle phrase signifie « J’habite à Lyon » ?',
      choices: ['Ich komme aus Lyon.', 'Ich heiße Lyon.', 'Ich wohne in Lyon.'],
      correct: 2,
      feedback: 'Employez « ich wohne in » pour dire où vous habitez.',
    },
  },
  {
    id: 'direction',
    title: 'Demander son chemin',
    skill: 'Lecture',
    summary: 'Repérez la gare et comprenez des indications courtes.',
    phrases: [
      { german: 'Wo ist der Bahnhof?', french: 'Où est la gare ?' },
      { german: 'Gehen Sie geradeaus.', french: 'Allez tout droit.' },
      { german: 'Dann links.', french: 'Ensuite à gauche.' },
    ],
    mediaIds: [],
    question: {
      prompt: 'Que veut dire « geradeaus » ?',
      choices: ['Tout droit', 'À gauche', 'À droite'],
      correct: 0,
      feedback: '« Geradeaus » signifie « tout droit ».',
    },
  },
  {
    id: 'message',
    title: 'Écrire un message simple',
    skill: 'Expression écrite',
    summary: 'Confirmez un rendez-vous avec un message bref.',
    phrases: [
      { german: 'Hallo Anna!', french: 'Salut Anna !' },
      { german: 'Ich komme um zehn Uhr.', french: 'Je viens à dix heures.' },
      { german: 'Bis morgen!', french: 'À demain !' },
    ],
    mediaIds: [],
    question: {
      prompt: 'Quelle expression correspond à « À demain » ?',
      choices: ['Bis später!', 'Bis morgen!', 'Bis bald!'],
      correct: 1,
      feedback: '« Morgen » signifie « demain » dans cette expression.',
    },
  },
];

const media: MediaAsset[] = [
  {
    id: 'coffee-photo',
    title: 'Une tasse de café',
    kind: 'image',
    src: '/media/kaffee.jpg',
    alt: 'Une tasse blanche remplie de café sur une soucoupe.',
    credit: 'Douglas Perkins · CC0 1.0',
  },
  {
    id: 'coffee-audio',
    title: 'Prononciation de « Kaffee »',
    kind: 'audio',
    src: '/media/kaffee.wav',
    transcript: 'Kaffee. Ich möchte einen Kaffee, bitte.',
    credit: 'Voix de synthèse allemande · eSpeak NG',
  },
];

function initialSessions(): Session[] {
  const scheduledLessons = ['salutations', 'presentation', 'direction', 'message'];
  const planned = weekDates.map((_, day) => ({
    id: `weekly-${day}`,
    lessonId: scheduledLessons[day % scheduledLessons.length],
    day,
    minutes: day % 2 === 0 ? 20 : 25,
    completed: day < todayIndex && day >= todayIndex - 3,
    ...(day < todayIndex && day >= todayIndex - 3 ? { score: 100 } : {}),
  }));
  return [
    { id: 'premiere-seance', day: todayIndex, minutes: 20, lessonId: 'cafe', completed: false },
    ...planned,
  ];
}

export function createDemoState(): DemoState {
  const sessions = initialSessions();
  const progress = Math.round(sessions.filter((session) => session.completed).length / sessions.length * 100);
  return {
    goal: {
      level: 'A1',
      title: 'Me présenter et échanger au quotidien',
      targetDate: relativeDate(18),
      pace: 'Intensif',
      days: [0, 1, 2, 3, 4, 5, 6],
      sessionsPerDay: 2,
      minutesPerSession: 25,
    },
    students: [
      { id: learnerId, name: 'Camille Bernard', email: 'camille@example.test', level: 'A1', teacher: teacherName, progress, status: 'on-track', lastActivity: relativeDate(0), targetDate: relativeDate(18) },
      { id: 'alice', name: 'Alice Martin', email: 'alice@example.test', level: 'A1', teacher: teacherName, progress: 74, status: 'on-track', lastActivity: relativeDate(-1), targetDate: relativeDate(22) },
      { id: 'thomas', name: 'Thomas Dubois', email: 'thomas@example.test', level: 'A2', teacher: teacherName, progress: 44, status: 'at-risk', lastActivity: relativeDate(-5), targetDate: relativeDate(20) },
      { id: 'sarah', name: 'Sarah Leroy', email: 'sarah@example.test', level: 'A1', teacher: teacherName, progress: 59, status: 'on-track', lastActivity: relativeDate(-1), targetDate: relativeDate(16) },
      { id: 'nicolas', name: 'Nicolas Klein', email: 'nicolas@example.test', level: 'A2', teacher: teacherName, progress: 86, status: 'review', lastActivity: relativeDate(-1), targetDate: relativeDate(12) },
      { id: 'emma', name: 'Emma Moreau', email: 'emma@example.test', level: 'A1', teacher: teacherName, progress: 29, status: 'at-risk', lastActivity: relativeDate(-6), targetDate: relativeDate(19) },
      { id: 'lucas', name: 'Lucas Bernard', email: 'lucas@example.test', level: 'A2', teacher: null, progress: 63, status: 'on-track', lastActivity: relativeDate(-2), targetDate: relativeDate(32) },
    ],
    sessions,
    assessments: [
      { id: 'diagnostic-a1', title: 'Diagnostic de départ', level: 'A1', type: 'Diagnostic', learnerId, dueDate: relativeDate(-4), status: 'reviewed', score: 68, feedback: 'Les salutations sont acquises. Travaillez la présentation et les nombres.' },
      { id: 'bilan-a1', title: 'Bilan des premières séances', level: 'A1', type: 'Bilan', learnerId, dueDate: relativeDate(3), status: 'ready' },
      { id: 'examen-a1', title: 'Examen blanc A1', level: 'A1', type: 'Examen blanc', learnerId, dueDate: relativeDate(17), status: 'ready' },
      { id: 'examen-nicolas', title: 'Examen blanc A2', level: 'A2', type: 'Examen blanc', learnerId: 'nicolas', dueDate: relativeDate(1), status: 'submitted', writing: 'Hallo Anna! Ich komme morgen um zehn Uhr. Bis morgen!' },
    ],
    messages: [
      { id: 'message-marie', learnerId, author: teacherName, body: 'Pour votre prochaine séance, réécoutez les salutations et essayez de vous présenter à voix haute. Nous en parlerons après le bilan.', createdAt: `${relativeDate(-1)}T14:00:00` },
    ],
    invitations: [
      { id: 'invite-lea', name: 'Léa Garcia', email: 'lea@example.test', role: 'learner', teacher: teacherName, status: 'pending', createdAt: `${relativeDate(-2)}T10:00:00` },
    ],
    catalog: [
      { id: 'allemand-a1', level: 'A1', title: 'Allemand A1', description: 'Saluer, se présenter et communiquer dans des situations simples du quotidien.', status: 'published', version: 1, mediaIds: ['coffee-photo', 'coffee-audio'] },
      { id: 'allemand-a2', level: 'A2', title: 'Allemand A2', description: 'Décrire son quotidien, organiser un rendez-vous et comprendre de courts échanges.', status: 'published', version: 1, mediaIds: [] },
      { id: 'allemand-b1', level: 'B1', title: 'Allemand B1', description: 'Brouillon éditorial pour préparer les prochaines publications.', status: 'draft', version: 1, mediaIds: [] },
    ],
    media,
  };
}
