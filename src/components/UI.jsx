export function Card({ className="", children }) {
  return (
    <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-xl ${className}`}>
      {children}
    </div>
  );
}
export function Button({ className="", children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl font-medium transition
      bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 ${className}`}
    >{children}</button>
  );
}
export function Input({ className="", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white
      placeholder-white/50 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 ${className}`}
    />
  );
}
export function Select({ className="", ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white
      outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 ${className}`}
    />
  );
}
