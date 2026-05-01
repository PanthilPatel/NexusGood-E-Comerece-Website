const Skeleton = ({ className }) => (
  <div className={`bg-white/5 rounded-2xl skeleton-pulse ${className}`} />
);

export const ProductSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-8 py-6">
        <Skeleton className="h-8 w-full rounded-xl" />
      </td>
    ))}
  </tr>
);

export default Skeleton;
