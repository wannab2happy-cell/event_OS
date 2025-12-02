'use client';

export function AlgorithmSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <label className="font-medium">Algorithm:</label>
      <select
        className="border rounded px-2 py-1 bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="round_robin">Round Robin</option>
        <option value="vip_spread">VIP Spread</option>
        <option value="group_by_company">Group by Company</option>
      </select>
    </div>
  );
}

