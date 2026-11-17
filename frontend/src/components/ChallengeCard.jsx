import { Link } from 'react-router-dom';
import { Clock, Images } from 'lucide-react';
import SmartImage from './SmartImage';
import { CHALLENGE_STATUS } from '../utils/constants';
import { deadlineLabel, plural } from '../utils/format';

const BADGE = {
  active: 'bg-cyano text-white',
  upcoming: 'bg-sand text-ink',
  closed: 'bg-ink/80 text-paper',
};

export default function ChallengeCard({ challenge: c }) {
  return (
    <Link
      to={`/challenges/${c._id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface/70 transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-cyano-soft">
        {c.coverUrl ? (
          <SmartImage src={c.coverUrl} width={700} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center px-6 text-center text-2xl font-semibold tracking-tight text-cyano-text/70">{c.theme}</div>
        )}
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${BADGE[c.status]}`}>
          {CHALLENGE_STATUS[c.status]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-semibold tracking-tight">{c.title}</h3>
        <p className="mt-1.5 line-clamp-2 font-serif text-base leading-snug text-mute">{c.description}</p>
        <div className="mt-auto flex items-center gap-4 pt-4 text-sm text-mute">
          <span className="inline-flex items-center gap-1.5"><Clock size={15} />{deadlineLabel(c)}</span>
          <span className="inline-flex items-center gap-1.5"><Images size={15} />{plural(c.submissionCount, 'entry').replace('entrys', 'entries')}</span>
        </div>
      </div>
    </Link>
  );
}
