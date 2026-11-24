/**
 * Bandeau de l'accueil de l'élève : séquence du Ciné-club proposée par son professeur (la plus récente en cours), avec un
 * accès direct. Rien n'est affiché sans proposition, ni si le service ne répond pas.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { requestApi } from '../../integration/api';
import { recommenderLabels, sequenceHref, type CineOverview } from '../../integration/cine';
import './cine.css';

interface Proposal { href: string; title: string; film: string; by: string; note: string; more: number }

export function CineRecommendationBanner({ token }: { token: string }) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  useEffect(() => {
    let active = true;
    requestApi<CineOverview>('/learning/cine', token).then((view) => {
      if (!active) return;
      const current = view.recommendations.filter((item) => !item.dismissedAt);
      for (const item of current) {
        const film = view.films.find((entry) => entry.id === item.filmId) ?? view.films.find((entry) => entry.sequences.some((sequence) => sequence.id === item.sequenceId));
        const sequence = film?.sequences.find((entry) => entry.id === item.sequenceId);
        if (!film || !sequence || sequence.lastResult) continue;
        setProposal({ href: sequenceHref(film.id, sequence.id), title: sequence.title, film: film.title, by: recommenderLabels[item.recommendedByRole] ?? 'votre professeur',
          note: item.note, more: current.length - 1 });
        return;
      }
    }, () => { /* service antérieur ou indisponible : pas de bandeau */ });
    return () => { active = false; };
  }, [token]);
  if (!proposal) return null;
  return (
    <Link className="lib-cine-banner cine-home-banner lc-enter" to={proposal.href}>
      <span className="lib-cine-banner-icon" aria-hidden="true"><Sparkles size={18} /></span>
      <span>
        <strong>Proposée par {proposal.by} : « {proposal.title} »</strong>
        <small>{proposal.film} · Ciné-club, pour aller plus loin{proposal.note ? ` · « ${proposal.note} »` : ''}{proposal.more > 0 ? ` · et ${proposal.more} autre${proposal.more > 1 ? 's' : ''}` : ''}</small>
      </span>
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}
