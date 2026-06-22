export function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  optional,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  optional?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-white/75">
        {label} {optional && <span className="text-white/35">(optional)</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-sm text-white outline-none transition duration-300 placeholder:text-white/30 focus:border-champagne-deep/60 focus:ring-2 focus:ring-champagne-deep/10 disabled:opacity-60"
      />
    </label>
  );
}

export function Submit({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-cta py-3 text-base font-medium text-black ring-1 ring-champagne-deep/40 transition duration-300 hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function Notice({
  kind,
  children,
}: {
  kind: "error" | "success";
  children: React.ReactNode;
}) {
  const styles =
    kind === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  return (
    <p className={`rounded-xl border p-2.5 text-sm ${styles}`}>{children}</p>
  );
}
