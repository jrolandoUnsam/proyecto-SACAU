export default function SimilitudBadge({ valor }: { valor: number }) {
  const pct = Math.max(0, Math.min(1, valor)) * 100;
  let color = "bg-red-100 text-red-800";
  if (pct >= 75) color = "bg-green-100 text-green-800";
  else if (pct >= 50) color = "bg-yellow-100 text-yellow-800";
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {pct.toFixed(1)}%
    </span>
  );
}
