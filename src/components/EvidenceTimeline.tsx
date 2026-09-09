import React from 'react';
import { TimelineEvent, ArticleMetadata } from '../types';
import { Calendar, Clock, ExternalLink, Milestone } from 'lucide-react';

interface EvidenceTimelineProps {
  timelineEvents: TimelineEvent[];
  articleMetadata?: ArticleMetadata;
}

export const EvidenceTimeline: React.FC<EvidenceTimelineProps> = ({
  timelineEvents,
  articleMetadata,
}) => {
  // Combine article publication date with evidence event dates
  const events = [...timelineEvents];
  if (articleMetadata?.publicationDate) {
    events.unshift({
      date: articleMetadata.publicationDate,
      title: articleMetadata.title || 'Submitted Article / Claim Origination',
      source: articleMetadata.publisher || 'User Input',
      relationship: 'NEUTRAL',
      url: articleMetadata.url,
    });
  }

  // Deduplicate and sort by date ascending
  const sortedEvents = events.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
        <div>
          <h3 className="font-serif text-base font-semibold text-stone-900 flex items-center gap-2">
            <Milestone size={18} className="text-stone-700" />
            Evidence Timeline
          </h3>
          <p className="text-xs text-stone-500">
            Chronological publication history of claims and corroborating or refuting evidence
          </p>
        </div>
        <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
          {sortedEvents.length} Dated Milestone(s)
        </span>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="py-8 text-center text-xs text-stone-500 italic bg-stone-50 rounded-lg border border-dashed border-stone-200">
          No standardized publication timestamps were extractable from the retrieved sources.
          TruthLens strictly avoids fabricating missing dates.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
          {sortedEvents.map((evt, idx) => {
            let dotColor = 'bg-stone-400';
            if (evt.relationship === 'SUPPORTS') dotColor = 'bg-emerald-600 ring-4 ring-emerald-100';
            else if (evt.relationship === 'CONTRADICTS') dotColor = 'bg-rose-600 ring-4 ring-rose-100';
            else if (idx === 0 && articleMetadata?.publicationDate)
              dotColor = 'bg-amber-600 ring-4 ring-amber-100';

            return (
              <div key={idx} className="relative group">
                {/* Dot */}
                <div
                  className={`absolute -left-[19px] top-1 w-3.5 h-3.5 rounded-full ${dotColor} transition-transform group-hover:scale-125`}
                />

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 hover:bg-white hover:border-stone-300 transition-all text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[11px] font-semibold text-stone-800 flex items-center gap-1.5">
                      <Calendar size={12} className="text-stone-500" />
                      {evt.date}
                    </span>
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600 font-medium">
                      {evt.source}
                    </span>
                  </div>

                  <p className="font-medium text-stone-900 leading-snug">{evt.title}</p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60 text-[11px]">
                    <span
                      className={`font-mono font-semibold ${
                        evt.relationship === 'SUPPORTS'
                          ? 'text-emerald-700'
                          : evt.relationship === 'CONTRADICTS'
                          ? 'text-rose-700'
                          : 'text-stone-600'
                      }`}
                    >
                      Relationship: {evt.relationship}
                    </span>

                    {evt.url && (
                      <a
                        href={evt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 underline"
                      >
                        Source Link
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
