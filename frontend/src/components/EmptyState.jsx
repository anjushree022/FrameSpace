export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      {Icon && (
        <span className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-sand text-mute">
          <Icon size={24} />
        </span>
      )}
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {children && <p className="mt-2 font-serif text-lg leading-snug text-mute">{children}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
