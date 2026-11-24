import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, Check, CheckCircle2, ClipboardCheck, Clock3, Flame, GraduationCap, Headphones, LayoutDashboard, MessageSquare, Play, Sparkles, Target, Users } from 'lucide-react';
import { isApiMode } from '../../app/config';
import { availableLanguages, languages, languageStatusLabels } from '../../domain/languages';
import { countWord, levelRange, levelSeries, usePublicLanguages, usePublicOffer } from '../../integration/languages';
import { levelLabel } from '../../integration/v2';
import './home.css';

const roles = [
  { title: 'Apprendre', name: 'Espace élève', path: '/eleve', icon: BookOpen, tone: 'is-brand',
    description: 'Vos séances du jour, des leçons avec images et voix natives, des exercices corrigés et vos résultats.' },
  { title: 'Accompagner', name: 'Espace professeur', path: '/professeur', icon: Users, tone: 'is-violet',
    description: 'Invitez vos élèves, fixez leurs objectifs, repérez les retards et corrigez leurs évaluations.' },
  { title: 'Organiser', name: 'Administration', path: '/administration', icon: LayoutDashboard, tone: 'is-accent',
    description: 'Gérez les accès, enrichissez le catalogue niveau par niveau et suivez les indicateurs du pilote.' },
];

const steps = [
  { icon: Target, title: 'Choisissez votre objectif', text: 'Niveau visé, date cible et jours d’étude : votre planning se construit tout seul.' },
  { icon: CalendarDays, title: 'Suivez vos séances', text: 'Leçon, écoute, exercices : chaque séance tient en quelques minutes et reprend là où vous vous êtes arrêté.' },
  { icon: MessageSquare, title: 'Progressez accompagné', text: 'Votre professeur voit vos résultats, corrige vos évaluations et vous encourage.' },
];

const week = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/**
 * Langues de LinguaCap : les langues ouvertes en avant avec leurs niveaux publiés (catalogue, GET /public/languages), les
 * suivantes annoncées. Sans la liste publique, les langues ouvertes s'affichent sans niveau.
 */
function LanguagesSection() {
  const { languages: published } = usePublicLanguages();
  const openLanguages = published?.length
    ? published.map((language) => ({ ...language, levels: language.levels.map((level) => level.code) }))
    : availableLanguages.map((language) => ({ ...language, levels: [] as string[] }));
  const open = new Set(openLanguages.map((language) => language.id));
  const soonLanguages = languages.filter((language) => !open.has(language.id) && language.status !== 'available');
  return (
    <section className="home-section is-tinted" id="langues">
      <div className="container">
        <header className="home-section-head">
          <p className="eyebrow"><span className="eyebrow-line" /> Les langues</p>
          <h2>L’allemand aujourd’hui, d’autres langues bientôt.</h2>
          <p className="muted">Chaque langue ouvre avec son test de niveau, ses parcours et ses professeurs.</p>
        </header>
        <div className="home-languages">
          {openLanguages.map((language) => (
            <article key={language.id} className="home-lang-feature">
              <div className="home-lang-feature-top">
                <span className="home-lang-mono" aria-hidden="true">{language.id.toUpperCase()}</span>
                <span className="home-lang-open"><i aria-hidden="true" />{languageStatusLabels.available}</span>
              </div>
              <h3>{language.name}</h3>
              <p className="home-lang-native" lang={language.id}>{language.nativeName}</p>
              {language.levels.length > 0 && (
                <ul className="home-lang-levels lc-stagger" aria-label="Niveaux proposés">
                  {language.levels.map((level) => <li key={level}><GraduationCap size={15} aria-hidden="true" />{levelLabel(level)}</li>)}
                </ul>
              )}
              <p className="home-lang-text">Test de niveau, parcours sur mesure jusqu’à votre objectif et professeur qui vous accompagne.</p>
            </article>
          ))}
          <div className="home-lang-soon">
            <p className="home-lang-soon-title"><Clock3 size={15} aria-hidden="true" /> {languageStatusLabels.coming_soon} sur LinguaCap</p>
            <ul className="home-lang-grid lc-stagger" aria-label="Langues bientôt disponibles">
              {soonLanguages.map((language) => (
                <li key={language.id} className="home-lang">
                  <span className="home-lang-mono" aria-hidden="true">{language.id.toUpperCase()}</span>
                  <span className="home-lang-name"><strong>{language.name}</strong><small lang={language.id} dir="auto">{language.nativeName}</small></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Maquette animée de l'écran « Aujourd'hui » de l'élève (décorative). */
function AppMockup() {
  return (
    <div className="home-mock" aria-hidden="true">
      <div className="home-mock-window">
        <div className="home-mock-bar"><i /><i /><i /><span>linguacap.app/espace</span></div>
        <div className="home-mock-body">
          <div className="home-mock-head">
            <div><small>Mercredi</small><strong>Bonjour Camille</strong></div>
            <span className="home-mock-streak"><Flame size={14} /> 4 jours</span>
          </div>
          <div className="home-mock-goal">
            <span className="home-mock-ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" /><circle cx="18" cy="18" r="15" /></svg><b>38 %</b></span>
            <div><small>Objectif</small><strong>Allemand A1</strong><em>3 séances sur 8</em></div>
          </div>
          <div className="home-mock-week">
            {week.map((day, index) => (
              <span key={index} className={index < 2 ? 'is-done' : index === 2 ? 'is-today' : undefined}>
                <small>{day}</small><b>{index < 2 && <Check size={12} />}</b>
              </span>
            ))}
          </div>
          <div className="home-mock-next">
            <span className="home-mock-icon"><Headphones size={18} /></span>
            <div><small>Séance du jour</small><strong>Au café</strong></div>
            <span className="home-mock-play"><Play size={15} /></span>
          </div>
        </div>
      </div>
      <div className="home-mock-float home-mock-word"><span className="is-der">der</span><strong>Kaffee</strong></div>
      <div className="home-mock-float home-mock-word is-second"><span className="is-die">die</span><strong>Milch</strong></div>
      <div className="home-mock-float home-mock-score"><CheckCircle2 size={18} /><div><strong>Bonne réponse</strong><small>Ich möchte einen Kaffee.</small></div></div>
    </div>
  );
}

/** Preuves du héros : les niveaux publiés (« A1 → B1 · trois niveaux complets »), puis les voix et le professeur. */
function HeroProof() {
  const offer = usePublicOffer();
  const count = offer.codes.length;
  const levels = count
    ? <><b>{levelRange(offer.codes)}</b><span>{countWord(count)} niveau{count > 1 ? 'x' : ''} complet{count > 1 ? 's' : ''}</span></>
    : <><b>Pas à pas</b><span>niveau après niveau</span></>;
  return (
    <ul className="home-proof">
      {offer.pending ? <li aria-hidden="true" style={{ visibility: 'hidden' }}>{levels}</li> : <li className="lc-enter">{levels}</li>}
      <li><b>Voix natives</b><span>dans chaque leçon</span></li>
      <li><b>1 professeur</b><span>qui suit vos progrès</span></li>
    </ul>
  );
}

/** Pastille du héros : « Pilote d’allemand A1, A2 et B1 sur invitation » (démonstration : « Parcours d’allemand A1 et A2 »). */
function HeroPill() {
  const offer = usePublicOffer();
  const levels = offer.codes.length ? ` ${levelSeries(offer.codes)}` : '';
  const label = isApiMode ? `Pilote ${offer.of}${levels} sur invitation` : `Parcours ${offer.of}${levels}`;
  return offer.pending
    ? <p className="home-pill" aria-hidden="true" style={{ visibility: 'hidden' }}><Sparkles size={14} /> {label}</p>
    : <p className="home-pill lc-enter"><Sparkles size={14} /> {label}</p>;
}

export default function HomePage() {
  const primary = isApiMode
    ? <Link className="btn btn-primary btn-lg" to="/connexion">Se connecter <ArrowRight size={18} /></Link>
    : <Link className="btn btn-primary btn-lg" to="/eleve">Essayer l’espace élève <ArrowRight size={18} /></Link>;

  return (
    <div className="home">
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div className="home-hero-copy">
            <HeroPill />
            <h1>Un objectif clair.<br /><span>Un parcours qui s’adapte.</span></h1>
            <p className="home-intro">Apprenez l’allemand à votre rythme : votre planning organise leçons, exercices et évaluations, et votre professeur vous accompagne séance après séance.</p>
            <div className="home-actions">
              {primary}
              <a className="btn btn-secondary btn-lg" href="#parcours">Découvrir le parcours</a>
            </div>
            <HeroProof />
          </div>
          <AppMockup />
        </div>
      </section>

      <section className="home-section" id="parcours">
        <div className="container">
          <header className="home-section-head">
            <p className="eyebrow"><span className="eyebrow-line" /> Le parcours</p>
            <h2>Trois étapes, puis une habitude.</h2>
          </header>
          <ol className="home-steps lc-stagger">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title}>
                <span className="home-step-number">{index + 1}</span>
                <span className="home-step-icon"><Icon size={22} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-section is-tinted" id="methode">
        <div className="container">
          <header className="home-section-head">
            <p className="eyebrow"><span className="eyebrow-line" /> La méthode</p>
            <h2>Tout ce qu’il faut pour pratiquer, au même endroit.</h2>
          </header>
          <div className="home-bento lc-stagger">
            <article className="home-tile is-wide">
              <div className="home-tile-text">
                <span className="home-tile-icon is-brand"><Headphones size={20} /></span>
                <h3>Des leçons vivantes</h3>
                <p>Vocabulaire classé par genre, dialogues illustrés et enregistrements de voix natives, avec vitesse réglable.</p>
              </div>
              <div className="home-tile-art home-vocab" aria-hidden="true">
                <span><i className="is-der">der</i>Bahnhof</span>
                <span><i className="is-die">die</i>Straße</span>
                <span><i className="is-das">das</i>Brötchen</span>
                <div className="home-wave">{Array.from({ length: 28 }, (_, index) => <b key={index} style={{ animationDelay: `${(index % 7) * 90}ms` }} />)}</div>
              </div>
            </article>
            <article className="home-tile">
              <span className="home-tile-icon is-success"><CheckCircle2 size={20} /></span>
              <h3>Corrigé tout de suite</h3>
              <p>Chaque exercice vous dit ce qui est juste et pourquoi, sans attendre.</p>
            </article>
            <article className="home-tile">
              <span className="home-tile-icon is-accent"><CalendarDays size={20} /></span>
              <h3>Un planning qui s’adapte</h3>
              <p>Une séance manquée ? Le planning se réorganise pour tenir votre date.</p>
            </article>
            <article className="home-tile is-wide">
              <div className="home-tile-text">
                <span className="home-tile-icon is-violet"><ClipboardCheck size={20} /></span>
                <h3>Des évaluations pour valider chaque niveau</h3>
                <p>Compréhension, expression et vocabulaire : vos résultats montrent clairement ce qui est acquis.</p>
              </div>
              <div className="home-tile-art home-bars" aria-hidden="true">
                {[62, 78, 54, 88, 71].map((value, index) => <span key={index} style={{ '--h': `${value}%`, animationDelay: `${index * 80}ms` } as CSSProperties} />)}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="home-section" id="espaces">
        <div className="container">
          <header className="home-section-head">
            <p className="eyebrow"><span className="eyebrow-line" /> {isApiMode ? 'Pour qui' : 'Démonstration'}</p>
            <h2>{isApiMode ? 'Les espaces LinguaCap' : 'Explorez les trois espaces'}</h2>
            {!isApiMode && <p className="muted">Les comptes et les contenus présentés ici sont des exemples.</p>}
          </header>
          <div className="home-roles lc-stagger">
            {roles.map(({ title, name, path, icon: Icon, tone, description }) => {
              const body = (
                <>
                  <span className={`home-tile-icon ${tone}`}><Icon size={22} /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  {!isApiMode && <span className="home-role-link">{name} <ArrowRight size={16} /></span>}
                </>
              );
              return isApiMode
                ? <article className="home-role" key={path}>{body}</article>
                : <Link className="home-role is-link" to={path} key={path}>{body}</Link>;
            })}
          </div>
        </div>
      </section>

      <LanguagesSection />

      <section className="home-cta">
        <div className="container home-cta-inner">
          <div>
            <h2>{isApiMode ? 'Vous avez reçu une invitation ?' : 'Prêt à commencer ?'}</h2>
            <p>{isApiMode ? 'Ouvrez le lien reçu par e-mail pour activer votre compte, puis connectez-vous.' : 'Ouvrez l’espace élève et suivez votre première séance.'}</p>
          </div>
          {isApiMode
            ? <Link className="btn btn-lg home-cta-button" to="/connexion">Se connecter <ArrowRight size={18} /></Link>
            : <Link className="btn btn-lg home-cta-button" to="/eleve/seances/premiere-seance">Essayer une séance <ArrowRight size={18} /></Link>}
        </div>
      </section>
    </div>
  );
}
