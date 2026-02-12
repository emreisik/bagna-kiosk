export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 rounded-sm" />
        </div>
      ))}
    </div>
  );
}
