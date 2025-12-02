'use client';

export function AssignmentStateBadge({
  hasDraft,
  hasConfirmed,
}: {
  hasDraft: boolean;
  hasConfirmed: boolean;
}) {
  let text = 'No Assignment';
  let color = 'bg-gray-300';

  if (hasDraft) {
    text = 'Draft Assignment';
    color = 'bg-yellow-400';
  } else if (hasConfirmed) {
    text = 'Confirmed Assignment';
    color = 'bg-green-400';
  }

  return (
    <div className={`inline-block px-3 py-1 rounded ${color} font-medium text-sm`}>
      {text}
    </div>
  );
}

