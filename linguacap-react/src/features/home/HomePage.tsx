import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays, Check, Globe2, Headphones, LayoutDashboard, Play, Target, Users } from 'lucide-react';
import { isApiMode } from '../../app/config';
import { Badge, ProgressBar } from '../../components/ui';

const roles = [
  { title: 'Apprendre', name: 'Espace élève', path: '/eleve', icon: BookOpen, description: 'Retrouvez vos séances, pratiquez avec des images et des sons, puis suivez vos résultats.' },
  { title: 'Accompagner', name: 'Espace professeur', path: '/professeur', icon: Users, description: 'Fixez les objectifs, suivez les retards et corrigez les évaluations de vos élèves.' },
  { title: 'Organiser', name: 'Administration', path: '/administration', icon: LayoutDashboard, description: 'Gérez les accès, enrichissez le catalogue et consultez les indicateurs du pilote.' },
];

function JourneyPreview() {
  return (
    <div className="journey-art">
      <div className="journey-preview">
        <div className="row between"><Badge tone="blue"><Globe2 size={14} /> Aperçu du parcours</Badge><span className="preview-icon"><Target size={21} /></span></div>
        <h2>Bonjour Camille<span className="preview-dot">.</span></h2>
        <div className="preview-goal">
          <div className="row between"><strong>Allemand A1</strong><Badge tone="blue">Intensif</Badge></div>
          <p>Se présenter et échanger au quotidien</p>
          <ProgressBar value={38} label="Progression de l’exemple" />
          <div className="row between preview-count"><span>3 séances terminées</span><strong>3 / 8</strong></div>
        </div>
        <div className="preview-week">
          <div className="row between"><strong>Cette semaine</strong><CalendarDays size={17} /></div>
          <div className="preview-days" aria-hidden="true">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
              <div className={index === 3 ? 'active' : ''} key={day}><span>{day}</span><b>{index < 3 ? <Check size={14} /> : index === 3 ? '•' : '–'}</b></div>
            ))}
          </div>
        </div>
        <div className="preview-session">
          <span className="icon-tile"><Headphones size={22} /></span>
          <div><strong>Commander au café</strong><span>Écoute · 20 min</span></div>
          <Link className="icon-button preview-play" to="/eleve/seances/premiere-seance" aria-label="Essayer la séance Commander au café"><Play size={18} /></Link>
        </div>
      </div>
    </div>
  );
}

function PilotPreview() {
  return (
    <div className="journey-art">
      <div className="journey-preview stack">
        <div className="row between"><Badge tone="blue"><Globe2 size={14} /> Pilote sur invitation</Badge><span className="preview-icon"><BookOpen size={21} /></span></div>
        <h2>Votre première séance d’allemand</h2>
        <div className="preview-session"><span className="icon-tile"><Headphones size={22} /></span><div><strong>Écoutez et pratiquez</strong><span>Une leçon avec image, audio et quiz</span></div></div>
        <div className="preview-session"><span className="icon-tile"><Target size={22} /></span><div><strong>Choisissez votre cadence</strong><span>Un objectif, une date cible et vos jours d’étude</span></div></div>
        <Link className="text-link" to="/activer-compte">Vous avez reçu une invitation ?</Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> {isApiMode ? 'Pilote d’allemand A1' : 'Parcours d’allemand A1 et A2'}</p>
            <h1>Un objectif clair.<br /><span>Un parcours qui s’adapte.</span></h1>
            <p className="hero-intro">{isApiMode ? 'Choisissez votre objectif, suivez votre première leçon et retrouvez vos résultats. Votre professeur peut suivre votre progression et vous écrire.' : 'Apprenez l’allemand selon vos disponibilités. Votre planning organise leçons, exercices et évaluations. Votre professeur vous accompagne au fil des séances.'}</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to={isApiMode ? '/connexion' : '/eleve'}>{isApiMode ? 'Ouvrir mon espace' : 'Essayer l’espace élève'}</Link>
              {isApiMode ? <Link className="btn btn-outline" to="/integration">Vérifier l’intégration</Link> : <a className="btn btn-outline" href="#espaces">Découvrir les espaces</a>}
            </div>
            <div className="hero-note"><CalendarDays size={19} aria-hidden="true" /><span>Planifiez une ou plusieurs séances par jour.</span></div>
          </div>
          {isApiMode ? <PilotPreview /> : <JourneyPreview />}
        </div>
      </section>
      <section className="role-section" id="espaces">
        <div className="container">
          <div className="section-heading"><h2>{isApiMode ? 'Les espaces LinguaCap' : 'Explorez les trois espaces'}</h2>{!isApiMode && <p className="muted">Les comptes et les contenus présentés ici sont des exemples.</p>}</div>
          <div className="role-grid">
            {roles.map(({ title, name, path, icon: Icon, description }) => (
              <article className="role-card panel" key={path}>
                <span className="icon-tile"><Icon size={23} /></span>
                <h3>{title}</h3>
                <p className="muted">{isApiMode && path === '/professeur' ? 'Invitez vos élèves, suivez leurs objectifs et résultats, et encouragez-les.' : description}</p>
                {!isApiMode && <Link className="text-link" to={path}>{name}</Link>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
