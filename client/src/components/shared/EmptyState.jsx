// client/src/components/shared/EmptyState.jsx
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      {Icon && (
        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4 border border-neutral-200 shadow-sm">
          <Icon className="w-8 h-8 text-neutral-400" />
        </div>
      )}
      <h3 className="text-lg font-bold text-neutral-800 mb-1">{title}</h3>
      {description && <p className="text-neutral-500 text-sm max-w-sm mb-6 leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}
