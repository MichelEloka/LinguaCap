import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpenCheck, Check, CircleCheck, Clock3, GraduationCap, Hourglass, Languages, LogOut, Minus, PencilLine,
  Plus, Sparkles, UserPlus, Users,
} from 'lucide-react';
import { Avatar, useToast } from '../../design/kit';
import { LanguagePicker } from '../../components/LanguagePicker';
import { requestApi, supabase, type Profile } from '../../integration/api';
import { availableLanguages, findLanguage, languageName } from '../../domain/languages';
import {
  gradingDelayLabels, gradingDelays, levelCodes, levelLabel,
  type CurrentProfileV2, type GradingDelayHours, type LevelCode, type TeacherProfile,
} from '../../integration/v2';
import { WelcomeJourney } from '../onboarding/WelcomeJourney';
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
const availabilityLabels = { yes: 'Je souhaite accueillir de nouveaux élèves', no: 'J’ai déjà mes élèves' };
const availabilityQuestion = 'Êtes-vous à l’écoute de nouveaux élèves sur LinguaCap, ou avez-vous déjà les vôtres ?';
const courseModeQuestion = 'Voulez-vous construire vos cours vous-même, ou laisser LinguaCap les construire ?';
const courseModeLabels: Record<CourseCreationMode, string> = {
  self: 'Je construis mes cours', linguacap: 'LinguaCap construit mes cours',
};
const learnerPresets = [5, 10, 15, 20, 30];
const delayHints: Record<GradingDelayHours, string> = {
  24: 'Idéal pour les élèves au rythme intensif.',
  48: 'Un bon équilibre entre réactivité et disponibilité.',
  72: 'Pour un emploi du temps déjà bien rempli.',
  168: 'Pour un suivi plus espacé, une fois par semaine.',
};
const MAX_BIO = 500;
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

/** « Professeur d’allemand et d’anglais » (élision devant une voyelle). */
function teacherTitle(languageIds: readonly string[]) {
  const names = languageIds.map((id) => {
    const name = languageName(id).toLowerCase();
    return `${/^[aeiouyéèêh]/i.test(name) ? 'd’' : 'de '}${name}`;
  });
  return names.length ? `Professeur ${names.length > 1 ? `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}` : names[0]}` : 'Professeur';
}

function TeacherPreview({ name, answers }: { name: string; answers: Answers }) {
  return (
    <section className="tob-preview" aria-label="Aperçu de votre carte de présentation">
      <span className="tob-preview-eyebrow"><Sparkles size={14} aria-hidden="true" /> Votre carte de présentation</span>
      <div className="tob-card">
        <div className="tob-card-head">
          <Avatar name={name} size={56} />
          <div>
            <strong>{name}</strong>
            <small>{teacherTitle(answers.languages)}</small>
          </div>
        </div>
        <div className="tob-card-row">
          {answers.levels.length ? answers.levels.map((level) => <span key={level} className="tob-card-level">{level}</span>)
            : <span className="tob-card-empty">Niveaux à préciser</span>}
        </div>
        <ul className="tob-card-facts">
          <li><Hourglass size={15} />{answers.gradingDelayHours ? `Corrige ${gradingDelayLabels[answers.gradingDelayHours].toLowerCase()}` : 'Délai de correction à préciser'}</li>
          <li><Users size={15} />{answers.maxLearners ? `Jusqu’à ${answers.maxLearners} élèves` : 'Nombre d’élèves ouvert'}</li>
        </ul>
        <p className={answers.bio.trim() ? 'tob-card-bio' : 'tob-card-bio is-empty'}>
          {answers.bio.trim() || 'Votre présentation apparaîtra ici.'}
        </p>
      </div>
    </section>
  );
}

function PreferenceChoices<Value extends string>({ label, name, value, options, onChange }: {
  label: string; name: string; value: Value | null;
  options: readonly { value: Value; title: string; icon: ReactNode; detail: string }[];
  onChange: (next: Value) => void;
}) {
  return (
    <fieldset className="tob-preferences">
      <legend className="sr-only">{label}</legend>
      <div className="tob-preference-grid lc-stagger">
        {options.map((option) => (
          <label key={option.value} className="tob-preference">
            <input type="radio" name={name} checked={value === option.value} onChange={() => onChange(option.value)} />
            <span className="tob-preference-icon" aria-hidden="true">{option.icon}</span>
            <span className="tob-preference-copy"><strong>{option.title}</strong><small>{option.detail}</small></span>
            <span className="tob-preference-dot" aria-hidden="true">{value === option.value && <Check size={15} strokeWidth={3} />}</span>
          </label>
        ))}
      </div>
    </fieldset>
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

export function TeacherOnboarding({ name, token, initial, onDone }: {
  name: string; token: string; initial: TeacherProfile | null; onDone: (profile: TeacherProfile) => void;
}) {
  const toast = useToast();
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const bioId = useId();
  const [step, setStep] = useState<StepId>('welcome');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [fromSummary, setFromSummary] = useState(false);
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const updating = Boolean(initial?.onboardedAt);
  const baseQuestions = updating && initial ? missingPreferences(initial) : firstTimeQuestions;
  const showCard = answers.acceptingNewStudents === true;
  const askBio = showCard && (!updating || baseQuestions.includes('availability'));
  const questions: QuestionId[] = askBio ? [...baseQuestions, 'bio'] : [...baseQuestions];
  const steps: StepId[] = ['welcome', ...questions, 'summary'];
  const index = steps.indexOf(step);
  const question = questions.findIndex((id) => id === step) + 1;
  const first = name.trim().split(/\s+/)[0] || name;

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => element?.close();
  }, []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [step]);

  const set = (change: Partial<Answers>) => setAnswers((current) => ({ ...current, ...change }));
  const go = (next: StepId, way: 'forward' | 'back') => { setDirection(way); setError(''); setStep(next); };
  const preferencesComplete = answers.acceptingNewStudents !== null && answers.courseCreationMode !== null;
  const valid = step === 'languages' ? answers.languages.length > 0
    : step === 'levels' ? answers.levels.length > 0
    : step === 'availability' ? answers.acceptingNewStudents !== null
    : step === 'courses' ? answers.courseCreationMode !== null
    : step === 'summary' ? preferencesComplete
    : true;

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || busy) return;
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
      toast(updating ? 'Vos préférences ont été mises à jour.' : `Votre profil professeur est prêt, ${first}.`);
      onDone(result.teacherProfile);
      if (answers.acceptingNewStudents === false) navigate('/espace/invitations', { replace: true });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'L’enregistrement est momentanément impossible. Réessayez.');
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    void (supabase?.auth.signOut({ scope: 'local' }) ?? Promise.resolve()).finally(() => navigate('/', { replace: true }));
  }

  const toggleLevel = (level: LevelCode, checked: boolean) =>
    set({ levels: levelCodes.filter((code) => (code === level ? checked : answers.levels.includes(code))) });

  const summaryRows: [QuestionId, string, string][] = [
    ['languages', 'Langues enseignées', answers.languages.map(languageName).join(', ')],
    ['availability', 'Disponibilité', answers.acceptingNewStudents === null ? '' : availabilityLabels[answers.acceptingNewStudents ? 'yes' : 'no']],
    ['courses', 'Construction des cours', answers.courseCreationMode ? courseModeLabels[answers.courseCreationMode] : ''],
    ['levels', 'Niveaux', answers.levels.join(', ')],
    ['learners', 'Élèves envisagés', answers.maxLearners ? `Jusqu’à ${answers.maxLearners}` : 'À préciser'],
    ['delay', 'Délai de correction', answers.gradingDelayHours ? gradingDelayLabels[answers.gradingDelayHours] : 'À préciser'],
  ];
  if (showCard) summaryRows.push(['bio', 'Présentation', answers.bio.trim() || 'Aucune pour le moment']);

  const content: Record<StepId, { icon: ReactNode; title: string; lead: string; body: ReactNode }> = {
    welcome: {
      icon: <Sparkles size={22} />, title: updating ? `Complétez vos préférences, ${first}` : `Bienvenue ${first} !`,
      lead: updating ? 'Retrouvez vos réglages existants et répondez aux nouvelles questions.' : 'Préparez votre espace professeur en quelques questions.',
      body: updating ? null : (
        <ul className="tob-intro lc-stagger">
          <li><span><Languages size={18} aria-hidden="true" /></span><div><strong>Vos langues et vos niveaux</strong><small>Pour inviter des élèves dans la bonne langue.</small></div></li>
          <li><span><Users size={18} aria-hidden="true" /></span><div><strong>Votre disponibilité</strong><small>Pour adapter votre espace à vos besoins.</small></div></li>
          <li><span><PencilLine size={18} aria-hidden="true" /></span><div><strong>La construction des cours</strong><small>Vous choisissez qui prépare vos cours.</small></div></li>
        </ul>
      ),
    },
    languages: {
      icon: <Languages size={22} />, title: 'Quelles langues enseignez-vous ?',
      lead: 'Choisissez une ou plusieurs langues.',
      body: <LanguagePicker multiple label="Langues enseignées" hideLabel value={answers.languages} onChange={(languages) => set({ languages })} />,
    },
    availability: {
      icon: <UserPlus size={22} />, title: availabilityQuestion,
      lead: 'Choisissez l’option qui correspond à votre situation.',
      body: (
        <PreferenceChoices<'yes' | 'no'>
          label={availabilityQuestion} name="availability"
          value={answers.acceptingNewStudents === null ? null : answers.acceptingNewStudents ? 'yes' : 'no'}
          onChange={(value) => set({ acceptingNewStudents: value === 'yes' })}
          options={[
            { value: 'yes', title: availabilityLabels.yes, detail: 'Préparez une présentation que des élèves pourront consulter.', icon: <UserPlus size={20} /> },
            { value: 'no', title: availabilityLabels.no, detail: 'Invitez les élèves que vous accompagnez déjà.', icon: <Users size={20} /> },
          ]}
        />
      ),
    },
    courses: {
      icon: <PencilLine size={22} />, title: courseModeQuestion,
      lead: 'Quel que soit votre choix, vous pourrez modifier vos cours par la suite.',
      body: (
        <PreferenceChoices<CourseCreationMode>
          label={courseModeQuestion} name="courseMode" value={answers.courseCreationMode}
          onChange={(courseCreationMode) => set({ courseCreationMode })}
          options={[
            { value: 'self', title: courseModeLabels.self, detail: 'Vous préparez le contenu et la progression de vos élèves.', icon: <PencilLine size={20} /> },
            { value: 'linguacap', title: courseModeLabels.linguacap, detail: 'Vous partez des cours préparés par LinguaCap.', icon: <BookOpenCheck size={20} /> },
          ]}
        />
      ),
    },
    levels: {
      icon: <GraduationCap size={22} />, title: 'Quels niveaux accompagnez-vous ?',
      lead: 'Sélectionnez tous les niveaux que vous pouvez enseigner. Les parcours A1 et A2 sont disponibles aujourd’hui.',
      body: (
        <fieldset className="tob-levels">
          <legend className="sr-only">Niveaux enseignés</legend>
          <div className="tob-level-grid lc-stagger">
            {levelCodes.map((level) => {
              const checked = answers.levels.includes(level);
              const [, title] = levelLabel(level).split(' · ');
              return (
                <label key={level} className={`tob-level${checked ? ' is-checked' : ''}`}>
                  <input type="checkbox" checked={checked} onChange={(event) => toggleLevel(level, event.target.checked)} />
                  <span className="tob-level-code">{level}</span>
                  <span className="tob-level-text"><strong>{title}</strong>
                    <small>{pilotLevels.has(level) ? 'Parcours prêt' : 'Bientôt'}</small></span>
                  <span className="tob-level-check" aria-hidden="true">{checked && <Check size={14} strokeWidth={3} />}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ),
    },
    learners: {
      icon: <Users size={22} />, title: 'Combien d’élèves envisagez-vous de suivre ?',
      lead: 'Une estimation suffit : elle nous aide à répartir les élèves. Vous pourrez toujours en accueillir davantage.',
      body: (
        <div className="tob-learners">
          {answers.maxLearners === null ? (
            <p className="tob-unknown"><Hourglass size={18} aria-hidden="true" /> Vous préciserez plus tard.</p>
          ) : <Counter value={answers.maxLearners} onChange={(maxLearners) => set({ maxLearners })} />}
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
      icon: <Clock3 size={22} />, title: 'Sous quel délai corrigez-vous les copies ?',
      lead: 'Écrits et oraux des évaluations : vos élèves sauront quand attendre votre retour.',
      body: (
        <fieldset className="tob-delays">
          <legend className="sr-only">Délai de correction</legend>
          <div className="tob-delay-grid lc-stagger">
            {gradingDelays.map((delay) => (
              <label key={delay} className={`tob-delay${answers.gradingDelayHours === delay ? ' is-checked' : ''}`}>
                <input type="radio" name="gradingDelay" checked={answers.gradingDelayHours === delay} onChange={() => set({ gradingDelayHours: delay })} />
                <span className="tob-delay-icon" aria-hidden="true"><Clock3 size={18} /></span>
                <span className="tob-delay-text"><strong>{gradingDelayLabels[delay]}</strong><small>{delayHints[delay]}</small></span>
                {delay === 48 && <span className="tob-delay-tag">Conseillé</span>}
              </label>
            ))}
          </div>
        </fieldset>
      ),
    },
    bio: {
      icon: <PencilLine size={22} />, title: 'Présentez-vous en quelques mots',
      lead: 'Votre parcours, votre façon d’enseigner, ce qui vous plaît dans la langue : quelques lignes suffisent. Facultatif.',
      body: (
        <div className="tob-presentation">
          <div className="tob-bio">
            <label htmlFor={bioId} className="sr-only">Courte présentation</label>
            <textarea id={bioId} rows={6} maxLength={MAX_BIO} value={answers.bio} onChange={(event) => set({ bio: event.target.value })}
              placeholder="Professeure d’allemand depuis dix ans, j’aime faire parler mes élèves dès la première séance…" />
            <small className={answers.bio.length > MAX_BIO - 40 ? 'is-near' : undefined}>{answers.bio.length} / {MAX_BIO}</small>
          </div>
          <TeacherPreview name={name} answers={answers} />
        </div>
      ),
    },
    summary: {
      icon: <BookOpenCheck size={22} />, title: 'Tout est prêt ?',
      lead: showCard ? 'Vérifiez votre profil avant de le valider.' : 'Vérifiez vos réponses avant de passer aux invitations.',
      body: (
        <dl className="tob-summary lc-stagger">
          {summaryRows.map(([target, label, value]) => (
            <div key={target}>
              <dt>{label}</dt>
              <dd>{value}</dd>
              {questions.includes(target) && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => edit(target)} aria-label={`Modifier ${label.toLowerCase()}`}>Modifier</button>
              )}
            </div>
          ))}
        </dl>
      ),
    },
  };
  const current = content[step];

  return (
    <dialog ref={dialog} className="tob" aria-labelledby={headingId} onCancel={(event) => event.preventDefault()}>
      <div className="tob-shell">
        <aside className="tob-aside">
          <div className="tob-brand"><img src="/favicon.svg" alt="" /><span>LinguaCap</span></div>
          <p className="tob-aside-title">Votre espace professeur</p>
          <ol className="tob-aside-steps" aria-hidden="true">
            {questions.map((id, position) => (
              <li key={id} className={index > position + 1 ? 'is-done' : index === position + 1 ? 'is-current' : undefined}>
                <i>{index > position + 1 ? <Check size={12} strokeWidth={3} /> : position + 1}</i>{stepLabels[id]}
              </li>
            ))}
          </ol>
        </aside>

        <div className="tob-main">
          <header className="tob-top">
            <span className="tob-top-brand"><img src="/favicon.svg" alt="" /> Accueil professeur</span>
            <button type="button" className="btn btn-ghost btn-sm tob-signout" onClick={signOut}><LogOut size={16} aria-hidden="true" /><span>Se déconnecter</span></button>
          </header>
          <div className="tob-journey">
            <WelcomeJourney steps={steps.map((id) => stepLabels[id])} current={index} label="Avancement de votre accueil" variant="teacher" />
          </div>

          <form key={step} className={`tob-step is-${direction}`} onSubmit={next} noValidate>
            <div className="tob-step-inner">
              <span className="tob-step-icon" aria-hidden="true">{current.icon}</span>
              <h1 id={headingId} ref={heading} tabIndex={-1}>{current.title}</h1>
              <p className="tob-lead">{current.lead}</p>
              {current.body && <div className="tob-body">{current.body}</div>}
              {error && <p className="inline-message warning" role="alert">{error}</p>}
            </div>
            <footer className="tob-actions">
              {index > 0 ? (
                <button type="button" className="btn btn-ghost" onClick={back} disabled={busy}>
                  <ArrowLeft size={17} aria-hidden="true" /> Retour
                </button>
              ) : <span />}
              <button type="submit" className="btn btn-primary btn-lg" disabled={!valid || busy}>
                {step === 'welcome' ? <>Commencer <ArrowRight size={18} aria-hidden="true" /></>
                  : step === 'summary' ? <><CircleCheck size={18} aria-hidden="true" /> {busy ? 'Enregistrement…' : showCard ? 'Valider mon profil' : 'Valider et ouvrir les invitations'}</>
                  : fromSummary && !(step === 'availability' && askBio) ? <>Revenir au récapitulatif <ArrowRight size={18} aria-hidden="true" /></>
                  : <>Continuer <ArrowRight size={18} aria-hidden="true" /></>}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </dialog>
  );
}
