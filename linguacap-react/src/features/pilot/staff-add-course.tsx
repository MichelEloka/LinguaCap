/**
 * « Ajouter des cours » : panneau latéral large ouvert depuis l'onglet « Parcours ». Arbre de la bibliothèque de la
 * langue de l'élève, choix d'un module entier ou d'une activité, placement (prochaine séance ou avant l'examen blanc),
 * estimation de l'impact, puis nouvelle proposition de planning calculée par le serveur et validation.
 */
import { useId, useMemo, useState } from 'react';
import { BookOpen, CalendarCheck, CheckCircle2, ChevronRight, CircleCheck, Target, Layers3, ListPlus, PencilLine, SearchX } from 'lucide-react';
import { Badge, EmptyState, ProgressBar } from '../../components/ui';
import { Callout, Drawer, Facts, SearchField, Segmented, SkeletonCard, useToast } from '../../design/kit';
import { requestApi } from '../../integration/api';
import {
  additionPlacementLabels, blockingReasonMessages, feasibilityLabels, formatMinutes, levelLabel, weeklyCapacity,
  type AdditionCreated, type AdditionPlacement, type Library, type LibraryActivityItem, type LibraryLevel, type LibraryModule,
  type LevelCode, type PathView,
} from '../../integration/v2';
import { capitalize, localDate } from './learner-calendar';
import { LevelSpans, errorText, formatShortDay, useLoad } from './staff-contracts';
import { plural } from './staff-kit';

interface Choice { level: LibraryLevel; module: LibraryModule; activity: LibraryActivityItem | null }

const kindNames: Record<LibraryActivityItem['kind'], string> = { lesson: 'Leçon', exercise: 'Exercice', mission: 'Mission' };
const kindIcons: Record<LibraryActivityItem['kind'], typeof BookOpen> = { lesson: BookOpen, exercise: PencilLine, mission: Target };
const placementHints: Record<AdditionPlacement, string> = {
  next: 'Les activités ajoutées ouvrent les prochaines séances du niveau.',
  end_of_level: 'Les activités ajoutées se placent juste avant l’examen blanc, pour réviser.',
};
const normalize = (value: string) => value.toLocaleLowerCase('fr').normalize('NFD').replace(/[̀-ͯ]/g, '');
const moduleMinutes = (module: LibraryModule) => module.activities.reduce((sum, activity) => sum + activity.estimatedMinutes, 0);
const sessionDay = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

/** Estimation locale de la charge avant l'appel au serveur (capacité des jours jusqu'à la date cible). */
function localImpact(path: PathView, added: number) {
  const days = Math.max(1, Math.round((localDate(path.targetDate).getTime() - Date.now()) / 86_400_000));
  const capacity = Math.round(weeklyCapacity(path.availability) * days / 7);
  const before = capacity ? Math.round((path.requiredMinutes / capacity) * 100) : 100;
  const after = capacity ? Math.round(((path.requiredMinutes + added) / capacity) * 100) : 100;
  return { capacity, before, after };
}

function ActivityIcon({ kind }: { kind: LibraryActivityItem['kind'] }) {
  const Icon = kindIcons[kind] ?? PencilLine;
  // Mêmes teintes que la séance et la bibliothèque : leçon bleue, exercice violet, mission verte.
  const tone = kind === 'mission' ? { color: 'var(--success)', background: 'var(--success-50)' }
    : kind === 'exercise' ? { color: 'var(--violet)', background: 'var(--violet-50)' } : undefined;
  return <span className={`sac-kind is-${kind}`} style={tone} aria-hidden="true"><Icon size={15} /></span>;
}

export function AddCourseDrawer({ path, learnerName, token, onClose, onChanged }: {
  path: PathView; learnerName: string; token: string; onClose: () => void; onChanged: () => void;
}) {
  const toast = useToast();
  const group = useId();
  const noteId = useId();
  const pid = encodeURIComponent(path.id);
  const id = encodeURIComponent(path.learnerId);
  const library = useLoad<Library>(() => requestApi<Library>(`/learning/library?learnerId=${id}`, token), [id, token]);
  const openSteps = path.steps.filter((step) => step.status === 'active' || step.status === 'planned').sort((a, b) => a.position - b.position);
  const activeStep = openSteps.find((step) => step.status === 'active') ?? openSteps[0];
  const [levelCode, setLevelCode] = useState<LevelCode | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [choice, setChoice] = useState<Choice | null>(null);
  const [placement, setPlacement] = useState<AdditionPlacement>('next');
  const [stepLevel, setStepLevel] = useState<LevelCode | undefined>(activeStep?.levelCode);
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<AdditionCreated | null>(null);
  const first = learnerName.trim().split(/\s+/)[0] || learnerName;

  const levels = library.data?.levels ?? [];
  const level = levels.find((item) => item.levelCode === levelCode)
    ?? levels.find((item) => item.levelCode === activeStep?.levelCode) ?? levels.find((item) => item.current) ?? levels[0];
  const search = normalize(query.trim());
  const modules = useMemo(() => (level?.modules ?? []).map((module) => {
    if (!search) return { module, activities: module.activities, match: false };
    const moduleMatch = normalize(`${module.title} ${module.objective}`).includes(search);
    const activities = moduleMatch ? module.activities : module.activities.filter((activity) => normalize(activity.title).includes(search));
    return { module, activities, match: activities.length > 0 };
  }).filter((entry) => !search || entry.match).sort((a, b) => a.module.position - b.module.position), [level, search]);

  const added = choice ? (choice.activity?.estimatedMinutes ?? moduleMinutes(choice.module)) : 0;
  const impact = localImpact(path, added);
  const choiceTitle = choice ? (choice.activity?.title ?? choice.module.title) : '';
  const key = (module: LibraryModule, activity?: LibraryActivityItem | null) => `${level?.trackVersionId}|${module.id}|${activity?.id ?? ''}`;
  const chosenKey = choice ? `${choice.level.trackVersionId}|${choice.module.id}|${choice.activity?.id ?? ''}` : '';

  function toggle(moduleId: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId); else next.add(moduleId);
      return next;
    });
  }

  async function add() {
    if (!choice || !stepLevel || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await requestApi<AdditionCreated>(`/learning/paths/${pid}/additions`, token, {
        method: 'POST',
        body: {
          stepLevel, trackVersionId: choice.level.trackVersionId, moduleId: choice.module.id,
          ...(choice.activity ? { activityId: choice.activity.id } : {}), placement, ...(note.trim() ? { note: note.trim() } : {}),
        },
      });
      setCreated(result);
      toast(`« ${result.addition.title} » est ajouté au parcours de ${learnerName}.`);
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  async function validate() {
    if (!created || busy) return;
    setBusy(true);
    setError('');
    try {
      await requestApi<PathView>(`/learning/paths/${pid}/proposal/validate`, token, { method: 'POST', body: { number: created.proposal.number } });
      toast(`Planning validé : les séances de ${first} intègrent les cours ajoutés.`);
      onChanged();
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  const proposal = created?.proposal;
  const footer = <div className="sct-foot">{created ? (
    <>
      <button type="button" className="btn btn-outline" onClick={onChanged} disabled={busy}>Plus tard</button>
      <button type="button" className="btn btn-primary" onClick={() => void validate()} disabled={busy || !proposal?.validatable}>
        <CircleCheck size={17} aria-hidden="true" /> {busy ? 'Validation…' : 'Valider le nouveau planning'}
      </button>
    </>
  ) : (
    <>
      <button type="button" className="btn btn-outline" onClick={onClose}>Annuler</button>
      <button type="button" className="btn btn-primary" onClick={() => void add()} disabled={busy || !choice || !stepLevel}>
        <ListPlus size={17} aria-hidden="true" /> {busy ? 'Ajout…' : 'Ajouter au parcours'}
      </button>
    </>
  )}</div>;

  return (
    <Drawer wide title="Ajouter des cours" onClose={created ? onChanged : onClose} footer={footer}
      description={created ? `Nouveau planning proposé pour ${learnerName}` : `Bibliothèque de ${learnerName} : un module entier ou une activité`}>
      {created && proposal ? (
        <div className="sac-review lc-enter" ref={(node) => node?.scrollIntoView({ block: 'start' })}>
          <Callout tone="success" title={`« ${created.addition.title} » est ajouté`}>
            {additionPlacementLabels[created.addition.placement]}, au niveau {created.addition.stepLevel} · {formatMinutes(created.addition.minutes)} de plus.
          </Callout>
          <Facts items={[
            { label: 'Séances prévues', value: proposal.sessions.length },
            { label: 'Programme', value: formatMinutes(proposal.requiredMinutes) },
            { label: 'Temps disponible', value: formatMinutes(proposal.capacityMinutes) },
            { label: 'Faisabilité', value: <Badge tone={proposal.feasibility.code === 'comfortable' ? 'green' : proposal.feasibility.code === 'tight' ? 'amber' : 'red'}>
              {feasibilityLabels[proposal.feasibility.code]} · {proposal.feasibility.loadPercent} %</Badge> },
          ]} />
          <LevelSpans spans={proposal.levels} />
          {(() => {
            const sessions = proposal.sessions.filter((session) => session.items.some((item) => item.additionId === created.addition.id));
            return sessions.length > 0 && (
              <div className="sac-sessions">
                <span className="sac-label"><CalendarCheck size={14} aria-hidden="true" /> Séances concernées</span>
                <ul>
                  {sessions.slice(0, 4).map((session) => {
                    const count = session.items.filter((item) => item.additionId === created.addition.id).length;
                    return (
                      <li key={`${session.date}-${session.slot}`}>
                        <span className="sac-session-day">{capitalize(sessionDay.format(localDate(session.date)))}</span>
                        <strong>{session.title}</strong>
                        <small>{plural(count, 'activité ajoutée', 'activités ajoutées')} · {formatMinutes(session.minutes)}</small>
                      </li>
                    );
                  })}
                </ul>
                {sessions.length > 4 && <small className="sac-more">Et {plural(sessions.length - 4, 'autre séance', 'autres séances')}.</small>}
              </div>
            );
          })()}
          {proposal.overflowCount > 0 && <Callout tone="warning" title={`${plural(proposal.overflowCount, 'activité ne tient', 'activités ne tiennent')} pas avant la date cible`}>{blockingReasonMessages.overflow}</Callout>}
          {!proposal.validatable && proposal.blockingReason && proposal.overflowCount === 0 && <Callout tone="info">{blockingReasonMessages[proposal.blockingReason]}</Callout>}
          {proposal.validatable && <p className="sac-hint">Les séances de {first} ne changent qu’à la validation. Vous pouvez aussi valider plus tard depuis l’onglet « Parcours ».</p>}
          {error && <div role="alert"><Callout tone="warning" title="Validation impossible">{error}</Callout></div>}
        </div>
      ) : library.error ? <Callout tone="warning" title="Bibliothèque indisponible">{library.error}</Callout>
        : !library.data ? <SkeletonCard lines={6} label="Chargement de la bibliothèque…" />
        : !levels.length ? <EmptyState icon={<BookOpen size={26} />} title="Bibliothèque vide" description="Aucune version publiée pour cette langue." />
        : (
          <div className="sac">
            <div className="sac-toolbar">
              {levels.length > 1 && (
                <Segmented label="Niveau de la bibliothèque" value={level?.levelCode ?? levels[0].levelCode} onChange={(value) => setLevelCode(value)}
                  options={levels.map((item) => ({ value: item.levelCode, label: `${item.levelCode}${item.current ? ' · en cours' : ''}` }))} />
              )}
              <SearchField value={query} onChange={setQuery} label="Rechercher un cours" placeholder="Rechercher un module ou une activité" />
            </div>

            <fieldset className="sac-tree">
              <legend className="sr-only">Cours à ajouter</legend>
              {modules.length === 0 ? (
                <EmptyState icon={<SearchX size={26} />} title="Aucun cours ne correspond"
                  action={<button type="button" className="btn btn-soft btn-sm" onClick={() => setQuery('')}>Effacer la recherche</button>} />
              ) : (
                <ul className="sac-modules lc-stagger">
                  {modules.map(({ module, activities }) => {
                    const open = expanded.has(module.id) || Boolean(search);
                    const minutes = moduleMinutes(module);
                    const done = module.activities.filter((activity) => activity.lastResult).length;
                    return (
                      <li key={module.id} className={`sac-module${open ? ' is-open' : ''}${chosenKey.startsWith(`${level?.trackVersionId}|${module.id}|`) ? ' has-choice' : ''}`}>
                        <div className="sac-module-head">
                          <button type="button" className="sac-module-toggle" aria-expanded={open} onClick={() => toggle(module.id)}>
                            <ChevronRight size={18} aria-hidden="true" />
                            <span className="sac-module-text">
                              <small>Module {module.position}{done ? ` · ${done} déjà travaillée${done > 1 ? 's' : ''}` : ''}</small>
                              <strong>{module.title}</strong>
                              {module.objective && <span>{module.objective}</span>}
                            </span>
                          </button>
                          <label className={`sac-choice is-module${chosenKey === key(module) ? ' is-checked' : ''}`}>
                            <input type="radio" name={group} checked={chosenKey === key(module)}
                              onChange={() => level && setChoice({ level, module, activity: null })} />
                            <Layers3 size={15} aria-hidden="true" />
                            <span>Tout le module<small>{plural(module.activities.length, 'activité', 'activités')} · {formatMinutes(minutes)}</small></span>
                          </label>
                        </div>
                        {open && (
                          <ul className="sac-activities">
                            {activities.map((activity) => (
                              <li key={activity.id}>
                                <label className={`sac-choice is-activity${chosenKey === key(module, activity) ? ' is-checked' : ''}`}>
                                  <input type="radio" name={group} checked={chosenKey === key(module, activity)}
                                    onChange={() => level && setChoice({ level, module, activity })} />
                                  <ActivityIcon kind={activity.kind} />
                                  <span className="sac-activity-text">
                                    <strong>{activity.title}</strong>
                                    <small>{kindNames[activity.kind]} · {activity.estimatedMinutes} min
                                      {activity.lastResult ? ` · dernier score ${activity.lastResult.correct} / ${activity.lastResult.total}` : ''}</small>
                                  </span>
                                  {activity.lastResult && <CheckCircle2 className="sac-done" size={16} aria-label="Déjà travaillée" />}
                                </label>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </fieldset>

            <div className="sac-settings">
              <fieldset className="sac-placement">
                <legend>Placement dans le parcours</legend>
                <div className="sac-placement-grid">
                  {(['next', 'end_of_level'] as const).map((value) => (
                    <label key={value} className={`sac-placement-option${placement === value ? ' is-checked' : ''}`}>
                      <input type="radio" name={`${group}-placement`} checked={placement === value} onChange={() => setPlacement(value)} />
                      <strong>{additionPlacementLabels[value]}</strong>
                      <small>{placementHints[value]}</small>
                    </label>
                  ))}
                </div>
              </fieldset>
              {openSteps.length > 1 && (
                <div className="sac-step">
                  <span className="sac-label">Niveau du parcours</span>
                  <Segmented label="Niveau du parcours qui reçoit l’ajout" value={stepLevel ?? openSteps[0].levelCode} onChange={(value) => setStepLevel(value)}
                    options={openSteps.map((step) => ({ value: step.levelCode, label: `${step.levelCode}${step.status === 'active' ? ' · en cours' : ''}` }))} />
                </div>
              )}
              <label htmlFor={noteId}>Note pour l’élève (facultative)
                <textarea id={noteId} rows={2} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)}
                  placeholder="Pour revoir l’accusatif avant le bilan." />
              </label>
            </div>

            <section className={`sac-impact${choice ? '' : ' is-empty'}`} aria-label="Impact sur le planning" aria-live="polite">
              {choice ? (
                <>
                  <div className="sac-impact-head">
                    <strong>{choiceTitle}</strong>
                    <span>+ {formatMinutes(added)} au niveau {stepLevel ?? '—'}</span>
                  </div>
                  <div className="sac-impact-bars">
                    <span>Avant</span><ProgressBar value={impact.before} label={`Charge avant l’ajout : ${impact.before} %`} /><b>{impact.before} %</b>
                    <span>Après</span><ProgressBar value={impact.after} label={`Charge après l’ajout : ${impact.after} %`} /><b className={impact.after > 100 ? 'is-over' : undefined}>{impact.after} %</b>
                  </div>
                  <p className="sac-hint">
                    {impact.after > 100 ? `Estimation : le temps disponible jusqu’au ${formatShortDay(path.targetDate)} risque de manquer. Prévoyez plus de temps par semaine ou proposez un avenant.`
                      : impact.after > 85 ? `Estimation : le planning reste tenable mais serré jusqu’au ${formatShortDay(path.targetDate)}.`
                      : `Estimation : le planning devrait tenir confortablement jusqu’au ${formatShortDay(path.targetDate)}.`}
                    {' '}Le calcul exact suit l’ajout.
                  </p>
                </>
              ) : <p className="sac-hint">Choisissez un module ou une activité pour voir l’impact sur le planning de {first} ({levelLabel(activeStep?.levelCode)}).</p>}
            </section>
            {error && <div role="alert"><Callout tone="warning" title="Ajout impossible">{error}</Callout></div>}
          </div>
        )}
    </Drawer>
  );
}
