import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BookOpenCheck, CalendarClock, CalendarDays, CircleCheck, Clock3, Eye, GraduationCap, Hourglass, Languages, Lock, LogOut,
  Minus, PencilLine, Plus, Sparkles, UserPlus, Users, Zap,
} from 'lucide-react';
import { Avatar, Skeleton, useToast } from '../../design/kit';
import { LanguageFlag, LanguagePicker } from '../../components/LanguagePicker';
import { requestApi, supabase, type Profile } from '../../integration/api';
import { availableLanguages, findLanguage, languageName } from '../../domain/languages';
import {
  gradingDelayLabels, gradingDelays, levelCodes, levelLabel,
  type CurrentProfileV2, type GradingDelayHours, type LevelCode, type TeacherProfile,
} from '../../integration/v2';
import {
  ChoiceGrid, JourneyActions, JourneyCelebration, JourneyQuestion, JourneyShell, JourneyStage, prefersReducedMotion,
  type JourneyStep,
} from '../journey';
import './teacher-onboarding.css';

type ProfileWithTeacher = Profile & { teacherProfile?: TeacherProfile | null };

/**
 * Profil professeur de l'utilisateur. Si le profil reçu ne le porte pas encore, GET /me est relu ; une passerelle
 * antérieure à l'incrément (aucun profil professeur) ne déclenche jamais le questionnaire.
 */
export function useTeacherProfile(profile: Profile, token: string) {
  const carried = 'teacherProfile' in profile;
  const teacher = profile.role === 'teacher';
  const [state, setState] = useState<{ checked: boolean; teacherProfile: TeacherProfile | null }>(() => ({
    checked: !teacher || carried, teacherProfile: (profile as ProfileWithTeacher).teacherProfile ?? null,
  }));
  useEffect(() => {
    if (!teacher || carried) return;
    let active = true;
    requestApi<Partial<CurrentProfileV2>>('/me', token).then(
      (me) => { if (active) setState({ checked: true, teacherProfile: me.teacherProfile ?? null }); },
      () => { if (active) setState({ checked: true, teacherProfile: null }); },
    );
    return () => { active = false; };
  }, [teacher, carried, token]);
  return {
    teacherProfile: state.teacherProfile,
    needsOnboarding: teacher && state.checked && state.teacherProfile !== null
      && (!state.teacherProfile.onboardedAt || missingPreferences(state.teacherProfile).length > 0),
    update: (teacherProfile: TeacherProfile) => setState({ checked: true, teacherProfile }),
  };
}

type QuestionId = 'languages' | 'availability' | 'courses' | 'levels' | 'learners' | 'delay' | 'bio';
type StepId = QuestionId | 'welcome' | 'summary';
type CourseCreationMode = NonNullable<TeacherProfile['courseCreationMode']>;
const firstTimeQuestions: readonly QuestionId[] = ['languages', 'availability', 'courses', 'levels', 'learners', 'delay'];
const stepLabels: Record<StepId, string> = {
  welcome: 'Bienvenue', languages: 'Langues', availability: 'Disponibilité', courses: 'Cours',
  levels: 'Niveaux', learners: 'Élèves', delay: 'Correction', bio: 'Présentation', summary: 'Validation',
};
const stepIcons: Record<StepId, ReactNode> = {
  welcome: <Sparkles />, languages: <Languages />, availability: <UserPlus />, courses: <BookOpenCheck />, levels: <GraduationCap />,
  learners: <Users />, delay: <Hourglass />, bio: <PencilLine />, summary: <CircleCheck />,
};
const teacherWords = ['Willkommen', 'Unterricht', 'Hallo', 'Danke', 'Prima', 'Guten Tag', 'Bitte', 'Toll gemacht'];
const availabilityLabels = { yes: 'Je souhaite accueillir de nouveaux élèves', no: 'J’ai déjà mes élèves' };
const availabilityQuestion = 'Êtes-vous à l’écoute de nouveaux élèves sur LinguaCap, ou avez-vous déjà les vôtres ?';
const courseModeQuestion = 'Voulez-vous construire vos cours vous-même, ou laisser LinguaCap les construire ?';
const courseModeLabels: Record<CourseCreationMode, string> = {
  self: 'Je construis mes cours', linguacap: 'LinguaCap construit mes cours',
};
const courseModeCard: Record<CourseCreationMode, string> = {
  self: 'Cours construits par vos soins', linguacap: 'Cours préparés par LinguaCap',
};
const learnerPresets = [5, 10, 15, 20, 30];
const delayHints: Record<GradingDelayHours, string> = {
  24: 'Idéal pour les élèves au rythme intensif.',
  48: 'Un bon équilibre entre réactivité et disponibilité.',
  72: 'Pour un emploi du temps déjà bien rempli.',
  168: 'Pour un suivi plus espacé, une fois par semaine.',
};
const delayIcons: Record<GradingDelayHours, ReactNode> = {
  24: <Zap />, 48: <Clock3 />, 72: <CalendarClock />, 168: <CalendarDays />,
};
const MAX_BIO = 500;
const CLASSROOM = 30;
const CELEBRATION_MS = 2800;
const pilotLevels = new Set(findLanguage('de')?.levels ?? []);

interface Answers {
  languages: string[]; levels: LevelCode[]; maxLearners: number | null; gradingDelayHours: GradingDelayHours | null; bio: string;
  acceptingNewStudents: boolean | null; courseCreationMode: CourseCreationMode | null;
}

function missingPreferences(profile: TeacherProfile): QuestionId[] {
  const missing: QuestionId[] = [];
  if (typeof profile.acceptingNewStudents !== 'boolean') missing.push('availability');
  if (profile.courseCreationMode !== 'self' && profile.courseCreationMode !== 'linguacap') missing.push('courses');
  return missing;
}

function initialAnswers(initial: TeacherProfile | null): Answers {
  const open = new Set(availableLanguages.map((language) => language.id));
  const existing = Boolean(initial?.onboardedAt);
  const languages = existing ? initial?.languages ?? [] : (initial?.languages ?? []).filter((id) => open.has(id));
  return {
    languages: languages.length ? languages : availableLanguages.slice(0, 1).map((language) => language.id),
    levels: initial?.levels?.length ? initial.levels : ['A1', 'A2'],
    maxLearners: existing ? initial?.maxLearners ?? null : initial?.maxLearners ?? 10,
    gradingDelayHours: existing ? initial?.gradingDelayHours ?? null : initial?.gradingDelayHours ?? 48,
    bio: initial?.bio ?? '',
    acceptingNewStudents: initial?.acceptingNewStudents ?? null,
    courseCreationMode: initial?.courseCreationMode ?? null,
  };
}

/** « Professeur d’allemand et d’anglais » (élision devant une voyelle). */
function teacherTitle(languageIds: readonly string[]) {
  const names = languageIds.map((id) => {
    const name = languageName(id).toLowerCase();
    return `${/^[aeiouyéèêh]/i.test(name) ? 'd’' : 'de '}${name}`;
  });
  return names.length ? `Professeur ${names.length > 1 ? `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}` : names[0]}` : 'Professeur';
}

/**
 * Carte de présentation qui se construit au fil des réponses : chaque information apparaît quand sa question est atteinte,
 * celle de la question en cours est mise en lumière.
 */
function TeacherCard({ name, answers, revealed, focus, compact = false }: {
  name: string; answers: Answers; revealed: (id: QuestionId) => boolean; focus: StepId | null; compact?: boolean;
}) {
  const availability = revealed('availability') ? answers.acceptingNewStudents : null;
  const publicCard = availability !== false;
  const lit = (id: QuestionId) => (focus === id ? ' is-focus' : '');
  return (
    <section className={`tob-card${compact ? ' is-compact' : ''}`} aria-label="Aperçu de votre carte de présentation">
      <div className="tob-card-band" aria-hidden="true">
        <svg viewBox="0 0 120 40" preserveAspectRatio="none" focusable="false">
          <path d="M-4 30 C 26 18, 44 34, 72 22 S 110 10, 126 18" />
          <path d="M-4 38 C 30 26, 52 40, 80 30 S 112 20, 126 26" />
        </svg>
        <span className={`tob-card-status${availability === null ? ' is-pending' : ''}${lit('availability')}`}>
          {availability === null ? <i className="tob-card-status-wait" />
            : <span key={String(availability)} className={`tob-pop ${availability ? 'is-open' : 'is-closed'}`}>
              <i />{availability ? 'Accueille de nouveaux élèves' : 'Élèves déjà suivis'}
            </span>}
        </span>
      </div>
      <div className="tob-card-body">
        <span className="tob-card-avatar"><Avatar name={name} size={compact ? 52 : 62} /></span>
        <strong className="tob-card-name">{name}</strong>
        <span className={`tob-card-title${lit('languages')}`}>
          {revealed('languages') ? (
            <span key={answers.languages.join()} className="tob-pop">
              <span className="tob-card-flags">{answers.languages.slice(0, 3).map((id) => <LanguageFlag key={id} languageId={id} />)}</span>
              {teacherTitle(answers.languages)}
            </span>
          ) : <Skeleton width="70%" height={11} radius={6} />}
        </span>
        <div className={`tob-card-levels${lit('levels')}`}>
          {revealed('levels') ? (answers.levels.length
            ? answers.levels.map((level) => <span key={level} className="tob-card-level">{level}</span>)
            : <span className="tob-card-empty">Niveaux à préciser</span>)
            : <><Skeleton width={34} height={20} radius={20} /><Skeleton width={34} height={20} radius={20} /><Skeleton width={34} height={20} radius={20} /></>}
        </div>
        <ul className="tob-card-facts">
          <li className={lit('courses').trim() || undefined}>
            <BookOpenCheck size={15} aria-hidden="true" />
            {revealed('courses') && answers.courseCreationMode
              ? <span key={answers.courseCreationMode} className="tob-pop">{courseModeCard[answers.courseCreationMode]}</span>
              : <Skeleton width="72%" height={10} radius={6} />}
          </li>
          <li className={lit('learners').trim() || undefined}>
            <Users size={15} aria-hidden="true" />
            {revealed('learners')
              ? <span key={String(answers.maxLearners)} className="tob-pop">{answers.maxLearners ? `Jusqu’à ${answers.maxLearners} élèves` : 'Nombre d’élèves ouvert'}</span>
              : <Skeleton width="58%" height={10} radius={6} />}
          </li>
          <li className={lit('delay').trim() || undefined}>
            <Hourglass size={15} aria-hidden="true" />
            {revealed('delay')
              ? <span key={String(answers.gradingDelayHours)} className="tob-pop">
                {answers.gradingDelayHours ? `Corrige ${gradingDelayLabels[answers.gradingDelayHours].toLowerCase()}` : 'Délai de correction à préciser'}
              </span>
              : <Skeleton width="64%" height={10} radius={6} />}
          </li>
        </ul>
        {publicCard && (
          <p className={`tob-card-bio${answers.bio.trim() ? '' : ' is-empty'}${lit('bio')}`}>
            <span>{answers.bio.trim() || 'Votre présentation apparaîtra ici.'}</span>
          </p>
        )}
      </div>
      <footer className="tob-card-foot">
        {publicCard ? <><Eye size={14} aria-hidden="true" /> Visible par les élèves</> : <><Lock size={14} aria-hidden="true" /> Profil réservé à votre espace</>}
      </footer>
    </section>
  );
}

function Counter({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const clamp = (next: number) => Math.min(500, Math.max(1, Math.round(next) || 1));
  return (
    <div className="tob-counter" role="group" aria-label="Nombre d’élèves envisagé">
      <button type="button" onClick={() => onChange(clamp(value - 1))} disabled={value <= 1} aria-label="Un élève de moins"><Minus size={20} aria-hidden="true" /></button>
      <label className="tob-counter-value">
        <span className="sr-only">Nombre d’élèves</span>
        <input type="number" inputMode="numeric" min={1} max={500} value={value} onChange={(event) => onChange(clamp(Number(event.target.value)))} />
        <small>{value > 1 ? 'élèves' : 'élève'}</small>
      </label>
      <button type="button" onClick={() => onChange(clamp(value + 1))} disabled={value >= 500} aria-label="Un élève de plus"><Plus size={20} aria-hidden="true" /></button>
    </div>
  );
}

/** Une petite classe qui se remplit avec le nombre d'élèves (décor). */
function Classroom({ count }: { count: number | null }) {
  const filled = Math.min(CLASSROOM, count ?? 0);
  return (
    <div className="tob-classroom" aria-hidden="true">
      {Array.from({ length: CLASSROOM }, (_, index) => (
        <i key={index} className={index < filled ? 'is-on' : undefined} style={{ '--k': index } as CSSProperties} />
      ))}
      {count !== null && count > CLASSROOM && <span>+{count - CLASSROOM}</span>}
    </div>
  );
}

export function TeacherOnboarding({ name, token, initial, onDone }: {
  name: string; token: string; initial: TeacherProfile | null; onDone: (profile: TeacherProfile) => void;
}) {
  const toast = useToast();
  const navigate = useNavigate();
  const bioId = useId();
  const [step, setStep] = useState<StepId>('welcome');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [fromSummary, setFromSummary] = useState(false);
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<TeacherProfile | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [furthest, setFurthest] = useState(0);
  const finishing = useRef(false);
  const timers = useRef<number[]>([]);
  const updating = Boolean(initial?.onboardedAt);
  const baseQuestions = updating && initial ? missingPreferences(initial) : firstTimeQuestions;
  const showCard = answers.acceptingNewStudents === true;
  const askBio = showCard && (!updating || baseQuestions.includes('availability'));
  const questions: QuestionId[] = askBio ? [...baseQuestions, 'bio'] : [...baseQuestions];
  const steps: StepId[] = ['welcome', ...questions, 'summary'];
  const index = steps.indexOf(step);
  const question = questions.findIndex((id) => id === step) + 1;
  const first = name.trim().split(/\s+/)[0] || name;
  const toInvitations = answers.acceptingNewStudents === false;

  useEffect(() => { setFurthest((value) => Math.max(value, index)); }, [index]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const set = (change: Partial<Answers>) => setAnswers((current) => ({ ...current, ...change }));
  const go = (next: StepId, way: 'forward' | 'back') => { setDirection(way); setError(''); setStep(next); };
  const preferencesComplete = answers.acceptingNewStudents !== null && answers.courseCreationMode !== null;
  const valid = step === 'languages' ? answers.languages.length > 0
    : step === 'levels' ? answers.levels.length > 0
    : step === 'availability' ? answers.acceptingNewStudents !== null
    : step === 'courses' ? answers.courseCreationMode !== null
    : step === 'summary' ? preferencesComplete
    : true;

  /** Une information de la carte apparaît dès que sa question a été atteinte (ou si elle n'est pas posée). */
  const revealed = (id: QuestionId) => Boolean(saved) || !questions.includes(id) || steps.indexOf(id) <= Math.max(index, furthest);

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || busy || saved) return;
    if (step === 'summary') { void submit(); return; }
    if (fromSummary && question) {
      if (step === 'availability' && askBio) {
        go('bio', 'forward');
      } else {
        setFromSummary(false);
        go('summary', 'forward');
      }
      return;
    }
    const following = steps[index + 1];
    if (following) go(following, 'forward');
  }

  function back() {
    if (fromSummary) {
      setFromSummary(false);
      go('summary', 'back');
      return;
    }
    const previous = steps[index - 1];
    if (previous) go(previous, 'back');
  }

  function edit(target: QuestionId) {
    setFromSummary(true);
    go(target, 'back');
  }

  async function submit() {
    if (!preferencesComplete) return;
    setBusy(true);
    setError('');
    try {
      const result = await requestApi<CurrentProfileV2>('/me/teacher-profile', token, {
        method: 'PUT',
        body: {
          languages: answers.languages, levels: answers.levels, maxLearners: answers.maxLearners,
          gradingDelayHours: answers.gradingDelayHours, bio: answers.bio.trim(),
          acceptingNewStudents: answers.acceptingNewStudents, courseCreationMode: answers.courseCreationMode,
        },
      });
      if (!result.teacherProfile?.onboardedAt || missingPreferences(result.teacherProfile).length) {
        setError('Vos préférences n’ont pas été confirmées. Réessayez.');
        return;
      }
      setSaved(result.teacherProfile);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'L’enregistrement est momentanément impossible. Réessayez.');
    } finally {
      setBusy(false);
    }
  }

  /** Après la célébration : fondu de sortie, puis l'espace (ou les invitations) prend le relais. */
  function finish() {
    if (!saved || finishing.current) return;
    finishing.current = true;
    setLeaving(true);
    const done = () => {
      toast(updating ? 'Vos préférences ont été mises à jour.' : `Votre profil professeur est prêt, ${first}.`);
      onDone(saved);
      if (toInvitations) navigate('/espace/invitations', { replace: true });
    };
    if (prefersReducedMotion()) done();
    else timers.current.push(window.setTimeout(done, 340));
  }

  function signOut() {
    void (supabase?.auth.signOut({ scope: 'local' }) ?? Promise.resolve()).finally(() => navigate('/', { replace: true }));
  }

  const summaryRows: [QuestionId, string, string][] = [
    ['languages', 'Langues enseignées', answers.languages.map(languageName).join(', ')],
    ['availability', 'Disponibilité', answers.acceptingNewStudents === null ? '' : availabilityLabels[answers.acceptingNewStudents ? 'yes' : 'no']],
    ['courses', 'Construction des cours', answers.courseCreationMode ? courseModeLabels[answers.courseCreationMode] : ''],
    ['levels', 'Niveaux', answers.levels.join(', ')],
    ['learners', 'Élèves envisagés', answers.maxLearners ? `Jusqu’à ${answers.maxLearners}` : 'À préciser'],
    ['delay', 'Délai de correction', answers.gradingDelayHours ? gradingDelayLabels[answers.gradingDelayHours] : 'À préciser'],
  ];
  if (showCard) summaryRows.push(['bio', 'Présentation', answers.bio.trim() || 'Aucune pour le moment']);

  const content: Record<StepId, { eyebrow: string; title: string; lead: string; body: ReactNode }> = {
    welcome: {
      eyebrow: updating ? 'Nouvelles questions' : 'Accueil professeur',
      title: updating ? `Complétez vos préférences, ${first}` : `Bienvenue ${first} !`,
      lead: updating ? 'Retrouvez vos réglages existants et répondez aux nouvelles questions.' : 'Préparez votre espace professeur en quelques questions.',
      body: updating ? null : (
        <div className="tob-welcome">
          <ul className="tob-intro lc-stagger">
            <li><span><Languages size={20} aria-hidden="true" /></span><div><strong>Vos langues et vos niveaux</strong><small>Pour inviter des élèves dans la bonne langue.</small></div></li>
            <li><span><Users size={20} aria-hidden="true" /></span><div><strong>Votre disponibilité</strong><small>Pour adapter votre espace à vos besoins.</small></div></li>
            <li><span><PencilLine size={20} aria-hidden="true" /></span><div><strong>La construction des cours</strong><small>Vous choisissez qui prépare vos cours.</small></div></li>
          </ul>
          <p className="tob-welcome-meta"><Clock3 size={15} aria-hidden="true" /> Environ deux minutes · tout reste modifiable ensuite</p>
        </div>
      ),
    },
    languages: {
      eyebrow: '', title: 'Quelles langues enseignez-vous ?',
      lead: 'Choisissez une ou plusieurs langues. Les autres langues arrivent bientôt sur LinguaCap.',
      body: <LanguagePicker multiple label="Langues enseignées" hideLabel value={answers.languages} onChange={(languages) => set({ languages })} />,
    },
    availability: {
      eyebrow: '', title: availabilityQuestion,
      lead: 'Choisissez l’option qui correspond à votre situation.',
      body: (
        <ChoiceGrid<'yes' | 'no'> legend={availabilityQuestion} hideLegend layout="tile" columns={2}
          value={answers.acceptingNewStudents === null ? null : answers.acceptingNewStudents ? 'yes' : 'no'}
          onChange={(value) => set({ acceptingNewStudents: value === 'yes' })}
          options={[
            { value: 'yes', title: availabilityLabels.yes, description: 'Préparez une présentation que des élèves pourront consulter.', icon: <UserPlus /> },
            { value: 'no', title: availabilityLabels.no, description: 'Invitez les élèves que vous accompagnez déjà.', icon: <Users /> },
          ]} />
      ),
    },
    courses: {
      eyebrow: '', title: courseModeQuestion,
      lead: 'Quel que soit votre choix, vous pourrez modifier vos cours par la suite.',
      body: (
        <ChoiceGrid<CourseCreationMode> legend={courseModeQuestion} hideLegend layout="tile" columns={2}
          value={answers.courseCreationMode} onChange={(courseCreationMode) => set({ courseCreationMode })}
          options={[
            { value: 'self', title: courseModeLabels.self, description: 'Vous préparez le contenu et la progression de vos élèves.', icon: <PencilLine /> },
            { value: 'linguacap', title: courseModeLabels.linguacap, description: 'Vous partez des cours préparés par LinguaCap.', icon: <BookOpenCheck /> },
          ]} />
      ),
    },
    levels: {
      eyebrow: '', title: 'Quels niveaux accompagnez-vous ?',
      lead: 'Sélectionnez tous les niveaux que vous pouvez enseigner. Les parcours A1 et A2 sont disponibles aujourd’hui.',
      body: (
        <ChoiceGrid<LevelCode> multiple legend="Niveaux enseignés" hideLegend layout="tile" columns={3} className="tob-levels"
          value={answers.levels} onChange={(levels) => set({ levels })}
          options={levelCodes.map((level) => ({
            value: level, title: <span className="tob-level-code">{level}</span>, description: levelLabel(level).split(' · ')[1],
            tag: pilotLevels.has(level) ? 'Parcours prêt' : 'Bientôt', tagTone: pilotLevels.has(level) ? 'success' : 'neutral',
          }))} />
      ),
    },
    learners: {
      eyebrow: '', title: 'Combien d’élèves envisagez-vous de suivre ?',
      lead: 'Une estimation suffit : elle nous aide à répartir les élèves. Vous pourrez toujours en accueillir davantage.',
      body: (
        <div className="tob-learners">
          <div className="tob-learners-main">
            {answers.maxLearners === null ? (
              <p className="tob-unknown"><Hourglass size={18} aria-hidden="true" /> Vous préciserez plus tard.</p>
            ) : <Counter value={answers.maxLearners} onChange={(maxLearners) => set({ maxLearners })} />}
            <Classroom count={answers.maxLearners} />
          </div>
          <div className="tob-chips" role="group" aria-label="Nombres suggérés">
            {learnerPresets.map((count) => (
              <button key={count} type="button" className="kit-chip" aria-pressed={answers.maxLearners === count} onClick={() => set({ maxLearners: count })}>
                {count} élèves
              </button>
            ))}
            <button type="button" className="kit-chip" aria-pressed={answers.maxLearners === null}
              onClick={() => set({ maxLearners: answers.maxLearners === null ? 10 : null })}>Je ne sais pas encore</button>
          </div>
        </div>
      ),
    },
    delay: {
      eyebrow: '', title: 'Sous quel délai corrigez-vous les copies ?',
      lead: 'Écrits et oraux des évaluations : vos élèves sauront quand attendre votre retour.',
      body: (
        <ChoiceGrid<`${GradingDelayHours}`> legend="Délai de correction" hideLegend columns={2}
          value={answers.gradingDelayHours ? `${answers.gradingDelayHours}` : null}
          onChange={(value) => set({ gradingDelayHours: Number(value) as GradingDelayHours })}
          options={gradingDelays.map((delay) => ({
            value: `${delay}` as `${GradingDelayHours}`, title: gradingDelayLabels[delay], description: delayHints[delay], icon: delayIcons[delay],
            tag: delay === 48 ? 'Conseillé' : undefined,
          }))} />
      ),
    },
    bio: {
      eyebrow: '', title: 'Présentez-vous en quelques mots',
      lead: 'Votre parcours, votre façon d’enseigner, ce qui vous plaît dans la langue : quelques lignes suffisent. Facultatif.',
      body: (
        <div className="tob-presentation">
          <div className="tob-bio">
            <label htmlFor={bioId} className="sr-only">Courte présentation</label>
            <textarea id={bioId} rows={6} maxLength={MAX_BIO} value={answers.bio} onChange={(event) => set({ bio: event.target.value })}
              placeholder="Professeure d’allemand depuis dix ans, j’aime faire parler mes élèves dès la première séance…" />
            <small className={answers.bio.length > MAX_BIO - 40 ? 'is-near' : undefined}>{answers.bio.length} / {MAX_BIO}</small>
          </div>
          <div className="tob-scene-preview">
            <TeacherCard name={name} answers={answers} revealed={revealed} focus="bio" compact />
          </div>
        </div>
      ),
    },
    summary: {
      eyebrow: 'Récapitulatif', title: 'Tout est prêt ?',
      lead: showCard ? 'Vérifiez votre profil avant de le valider.' : 'Vérifiez vos réponses avant de passer aux invitations.',
      body: (
        <dl className="tob-summary lc-stagger">
          {summaryRows.map(([target, label, value]) => (
            <div key={target} className={target === 'bio' ? 'is-wide' : undefined}>
              <span className="tob-summary-icon" aria-hidden="true">{stepIcons[target]}</span>
              <dt>{label}</dt>
              <dd>{value}</dd>
              {questions.includes(target) && (
                <button type="button" className="icon-button tob-summary-edit" onClick={() => edit(target)}
                  aria-label={`Modifier ${label.toLowerCase()}`} title="Modifier">
                  <PencilLine size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </dl>
      ),
    },
  };
  const current = content[step];
  const eyebrow = question ? `Question ${question} sur ${questions.length}` : current.eyebrow;
  const journeySteps: JourneyStep[] = steps.map((id, position) => ({
    id, label: stepLabels[id], icon: stepIcons[id], reachable: !saved && !busy && position < index,
  }));
  const shortcutsHint = ['availability', 'courses', 'delay', 'levels'].includes(step)
    ? <><kbd>1</kbd>–<kbd>{step === 'levels' ? 6 : step === 'delay' ? 4 : 2}</kbd> pour choisir · <kbd>Entrée</kbd> pour continuer</>
    : undefined;

  return (
    <JourneyShell variant="teacher" label="Accueil professeur" kicker="Accueil professeur" words={teacherWords}
      steps={journeySteps} current={saved ? 'summary' : step} celebrate={Boolean(saved)} leaving={leaving}
      navLabel="Étapes de votre accueil" onSelectStep={(id) => { setFromSummary(false); go(id as StepId, 'back'); }}
      actions={(
        <button type="button" className="btn btn-ghost btn-sm tob-signout" onClick={signOut}>
          <LogOut size={16} aria-hidden="true" /><span>Se déconnecter</span>
        </button>
      )}
      canvas={(
        <div className="tob-preview">
          <p className="tob-preview-caption"><i aria-hidden="true" />Aperçu en direct</p>
          <TeacherCard name={name} answers={answers} revealed={revealed} focus={saved ? null : step} />
        </div>
      )}>
      {saved ? (
        <JourneyCelebration eyebrow={updating ? 'Préférences enregistrées' : 'Profil enregistré'}
          title={updating ? `C’est noté, ${first} !` : `Votre espace est prêt, ${first} !`}
          description={toInvitations ? 'Place aux invitations : ajoutez les élèves que vous accompagnez déjà.'
            : 'Votre carte de présentation est enregistrée : les élèves pourront bientôt vous découvrir.'}
          items={[
            { icon: <Languages />, label: 'Langues', value: answers.languages.map(languageName).join(', ') },
            { icon: <GraduationCap />, label: 'Niveaux', value: answers.levels.join(', ') },
            { icon: <Users />, label: 'Élèves', value: answers.maxLearners ? `Jusqu’à ${answers.maxLearners}` : 'À préciser' },
            { icon: <Hourglass />, label: 'Correction', value: answers.gradingDelayHours ? gradingDelayLabels[answers.gradingDelayHours] : 'À préciser' },
          ]}
          autoContinue={{ after: CELEBRATION_MS, label: toInvitations ? 'Ouverture des invitations…' : 'Ouverture de votre espace…', onContinue: finish }}>
          <button type="button" className="btn btn-primary btn-lg tob-open" onClick={finish}>
            {toInvitations ? 'Ouvrir les invitations' : 'Ouvrir mon espace'} <ArrowRight size={18} aria-hidden="true" />
          </button>
        </JourneyCelebration>
      ) : (
        <JourneyStage onSubmit={next} className={`tob-stage is-${step}`}>
          <JourneyQuestion stepKey={step} direction={direction} eyebrow={eyebrow} icon={stepIcons[step]} title={current.title}
            description={current.lead}>
            {current.body}
            {error && <p className="inline-message warning" role="alert">{error}</p>}
          </JourneyQuestion>
          <JourneyActions onBack={index > 0 ? back : undefined} disabled={!valid} busy={busy} hint={shortcutsHint}>
            {step === 'welcome' ? <>Commencer <ArrowRight size={18} aria-hidden="true" /></>
              : step === 'summary' ? <><CircleCheck size={18} aria-hidden="true" /> {busy ? 'Enregistrement…' : showCard ? 'Valider mon profil' : 'Valider et ouvrir les invitations'}</>
              : fromSummary && !(step === 'availability' && askBio) ? <>Revenir au récapitulatif <ArrowRight size={18} aria-hidden="true" /></>
              : <>Continuer <ArrowRight size={18} aria-hidden="true" /></>}
          </JourneyActions>
        </JourneyStage>
      )}
    </JourneyShell>
  );
}
