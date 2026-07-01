import type { Review } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { StarIcon } from '@/components/common/icons';
import { formatDateShort } from '@/utils/formatting';

function avg(ratings: Record<string, number>): number {
  const values = Object.values(ratings);
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

interface Props {
  review: Review;
  reviewerName?: string;
  reviewerPhoto?: string;
}

export function ReviewSummary({ review, reviewerName = 'Usuario', reviewerPhoto }: Props) {
  const score = avg(review.ratings);
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <Avatar name={reviewerName} photoUrl={reviewerPhoto} size={40} />
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{reviewerName}</div>
          <div className="text-xs text-gray-400">{formatDateShort(review.createdAt)}</div>
        </div>
        <div className="flex items-center gap-1 text-gold-500 font-semibold">
          <StarIcon width={16} height={16} />
          {score.toFixed(1)}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {Object.entries(review.ratings).map(([cat, val]) => (
          <span key={cat} className="chip bg-gray-100 text-gray-600">
            {cat}: {val}
          </span>
        ))}
      </div>

      {review.comment && <p className="text-sm text-gray-700 mt-3">“{review.comment}”</p>}

      {review.response && (
        <div className="mt-3 pl-3 border-l-2 border-brand-200">
          <div className="text-xs font-semibold text-brand-600">Respuesta</div>
          <p className="text-sm text-gray-600">{review.response}</p>
        </div>
      )}
    </div>
  );
}
