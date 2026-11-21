/**
 * Accueil du professeur en questions : plein écran, une question par écran (langues enseignées, niveaux, nombre
 * d'élèves envisagé, délai de correction, courte présentation), récapitulatif puis PUT /me/teacher-profile.
 * Affiché par StaffPilot tant que le profil professeur n'est pas complété (`teacherProfile.onboardedAt` nul).
 */
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpenCheck, Check, CircleCheck, Clock3, GraduationCap, Hourglass, Languages, LogOut, Minus, PencilLine,
  Plus, Sparkles, Users,
} from 'lucide-react';
import { Avatar, useToast } from '../../design/kit';
import { LanguagePicker } from '../../components/LanguagePicker';
import { requestApi, supabase, type Profile } from '../../integration/api';
import { availableLanguages, findLanguage, languageName } from '../../domain/languages';
import {
  gradingDelayLabels, gradingDelays, levelCodes, levelLabel,
  type CurrentProfileV2, type GradingDelayHours, type LevelCode, type TeacherProfile,
} from '../../integration/v2';
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
    needsOnboarding: teacher && state.checked && state.teacherProfile !== null && !state.teacherProfile.onboardedAt,
    update: (teacherProfile: TeacherProfile) => setState({ checked: true, teacherProfile }),
  };
}

type StepId = 'welcome' | 'languages' | 'levels' | 'learners' | 'delay' | 'bio' | 'summary';
const steps: StepId[] = ['welcome', 'languages', 'levels', 'learners', 'delay', 'bio', 'summary'];
const questionCount = 5;
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
}

function initialAnswers(initial: TeacherProfile | null): Answers {
  const open = new Set(availableLanguages.map((language) => language.id));
  const languages = (initial?.languages ?? []).filter((id) => open.has(id));
  return {
    languages: languages.length ? languages : availableLanguages.slice(0, 1).map((language) => language.id),
    levels: initial?.levels?.length ? initial.levels : ['A1', 'A2'],
    maxLearners: initial?.maxLearners ?? 10,
    gradingDelayHours: initial?.gradingDelayHours ?? 48,
    bio: initial?.bio ?? '',
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

/** Carte présentée aux élèves, construite au fil des réponses (aperçu décoratif). */
function TeacherPreview({ name, answers }: { name: string; answers: Answers }) {
  return (
    <div className="tob-preview" aria-hidden="true">
      <span className="tob-preview-eyebrow"><Sparkles size={14} /> Aperçu de votre carte</span>
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
      <p className="tob-preview-note">Vos élèves verront cette carte depuis leur espace.</p>
    </div>
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
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [fromSummary, setFromSummary] = useState(false);
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const step = steps[index];
  const question = index >= 1 && index <= questionCount ? index : null;
  const progress = Math.round((Math.min(index, questionCount + 1) / (questionCount + 1)) * 100);
  const first = name.trim().split(/\s+/)[0] || name;

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => element?.close();
  }, []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [index]);

  const set = (change: Partial<Answers>) => setAnswers((current) => ({ ...current, ...change }));
  const go = (next: number, way: 'forward' | 'back') => { setDirection(way); setError(''); setIndex(next); };
  const valid = step === 'languages' ? answers.languages.length > 0 : step === 'levels' ? answers.levels.length > 0 : true;

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || busy) return;
    if (step === 'summary') { void submit(); return; }
    if (fromSummary && question) { setFromSummary(false); go(steps.indexOf('summary'), 'forward'); return; }
    go(index + 1, 'forward');
  }

  function edit(target: StepId) {
    setFromSummary(true);
    go(steps.indexOf(target), 'back');
  }

  async function submit() {
    setBusy(true);
    setError('');
    try {
      const result = await requestApi<CurrentProfileV2>('/me/teacher-profile', token, {
        method: 'PUT',
        body: {
          languages: answers.languages, levels: answers.levels, maxLearners: answers.maxLearners,
          gradingDelayHours: answers.gradingDelayHours, bio: answers.bio.trim(),
        },
      });
      toast(`Bienvenue ${first} ! Votre profil professeur est prêt.`);
      onDone(result.teacherProfile ?? { ...answers, bio: answers.bio.trim(), onboardedAt: new Date().toISOString() });
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

  const content: Record<StepId, { icon: ReactNode; title: string; lead: string; body: ReactNode }> = {
    welcome: {
      icon: <Sparkles size={22} />, title: `Bienvenue ${first} !`,
      lead: 'Cinq questions rapides pour préparer votre espace professeur et présenter votre accompagnement à vos élèves. Comptez deux minutes.',
      body: (
        <ul className="tob-intro lc-stagger">
          <li><span><Languages size={18} aria-hidden="true" /></span><div><strong>Vos langues et vos niveaux</strong><small>Pour inviter des élèves dans la bonne langue.</small></div></li>
          <li><span><Users size={18} aria-hidden="true" /></span><div><strong>Votre disponibilité</strong><small>Nombre d’élèves envisagé et délai de correction.</small></div></li>
          <li><span><PencilLine size={18} aria-hidden="true" /></span><div><strong>Quelques mots sur vous</strong><small>Vos élèves les liront depuis leur espace.</small></div></li>
        </ul>
      ),
    },
    languages: {
      icon: <Languages size={22} />, title: 'Quelles langues enseignez-vous ?',
      lead: 'Choisissez une ou plusieurs langues. LinguaCap ouvre l’allemand pour commencer ; les autres langues arrivent bientôt.',
      body: <LanguagePicker multiple label="Langues enseignées" hideLabel value={answers.languages} onChange={(languages) => set({ languages })} />,
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
        <div className="tob-bio">
          <label htmlFor={bioId} className="sr-only">Courte présentation</label>
          <textarea id={bioId} rows={6} maxLength={MAX_BIO} value={answers.bio} onChange={(event) => set({ bio: event.target.value })}
            placeholder="Professeure d’allemand depuis dix ans, j’aime faire parler mes élèves dès la première séance…" />
          <small className={answers.bio.length > MAX_BIO - 40 ? 'is-near' : undefined}>{answers.bio.length} / {MAX_BIO}</small>
        </div>
      ),
    },
    summary: {
      icon: <BookOpenCheck size={22} />, title: 'Tout est prêt ?',
      lead: 'Vérifiez vos réponses. Vous pourrez inviter vos élèves dès la validation.',
      body: (
        <dl className="tob-summary lc-stagger">
          {([
            ['languages', 'Langues enseignées', answers.languages.map(languageName).join(', ')],
            ['levels', 'Niveaux', answers.levels.join(', ')],
            ['learners', 'Élèves envisagés', answers.maxLearners ? `Jusqu’à ${answers.maxLearners}` : 'À préciser'],
            ['delay', 'Délai de correction', answers.gradingDelayHours ? gradingDelayLabels[answers.gradingDelayHours] : 'À préciser'],
            ['bio', 'Présentation', answers.bio.trim() || 'Aucune pour le moment'],
          ] as [StepId, string, string][]).map(([target, label, value]) => (
            <div key={target}>
              <dt>{label}</dt>
              <dd>{value}</dd>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => edit(target)} aria-label={`Modifier : ${label}`}>Modifier</button>
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
          <TeacherPreview name={name} answers={answers} />
          <ol className="tob-aside-steps" aria-hidden="true">
            {steps.slice(1, questionCount + 1).map((id, position) => (
              <li key={id} className={index > position + 1 ? 'is-done' : index === position + 1 ? 'is-current' : undefined}>
                <i>{index > position + 1 ? <Check size={12} strokeWidth={3} /> : position + 1}</i>{content[id].title}
              </li>
            ))}
          </ol>
        </aside>

        <div className="tob-main">
          <header className="tob-top">
            <span className="tob-top-brand"><img src="/favicon.svg" alt="" /> Accueil professeur</span>
            <span className="tob-top-count">{question ? `Question ${question} sur ${questionCount}` : step === 'summary' ? 'Récapitulatif' : 'Bienvenue'}</span>
            <button type="button" className="btn btn-ghost btn-sm tob-signout" onClick={signOut}><LogOut size={16} aria-hidden="true" /><span>Se déconnecter</span></button>
          </header>
          <div className="tob-progress" role="progressbar" aria-label="Avancement du questionnaire" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <form key={step} className={`tob-step is-${direction}`} onSubmit={next} noValidate>
            <div className="tob-step-inner">
              <span className="tob-step-icon" aria-hidden="true">{current.icon}</span>
              {question && <p className="eyebrow">Question {question} sur {questionCount}</p>}
              <h1 id={headingId} ref={heading} tabIndex={-1}>{current.title}</h1>
              <p className="tob-lead">{current.lead}</p>
              <div className="tob-body">{current.body}</div>
              {error && <p className="inline-message warning" role="alert">{error}</p>}
            </div>
            <footer className="tob-actions">
              {index > 0 ? (
                <button type="button" className="btn btn-ghost" onClick={() => { setFromSummary(false); go(index - 1, 'back'); }} disabled={busy}>
                  <ArrowLeft size={17} aria-hidden="true" /> Retour
                </button>
              ) : <span />}
              <button type="submit" className="btn btn-primary btn-lg" disabled={!valid || busy}>
                {step === 'welcome' ? <>Commencer <ArrowRight size={18} aria-hidden="true" /></>
                  : step === 'summary' ? <><CircleCheck size={18} aria-hidden="true" /> {busy ? 'Enregistrement…' : 'Valider mon profil'}</>
                  : fromSummary ? <>Revenir au récapitulatif <ArrowRight size={18} aria-hidden="true" /></>
                  : <>Continuer <ArrowRight size={18} aria-hidden="true" /></>}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </dialog>
  );
}
