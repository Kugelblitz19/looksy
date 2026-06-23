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
      <span className="mb-1.5 block text-sm font-medium text-ink-60">
        {label}{" "}
        {optional && (
          <span className="text-ink-30 uppercase tracking-[0.22em] text-[11px]">
            optional
          </span>
        )}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        style={{ caretColor: "rgb(var(--c-vermilion))" }}
        className="w-full rounded-sm border border-ink/15 bg-paper px-3.5 py-3 text-sm text-ink outline-none transition duration-200 placeholder:text-ink-30 focus:border-vermilion focus:ring-0 disabled:opacity-50"
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
      className="w-full rounded-sm bg-vermilion py-3 text-sm font-medium uppercase tracking-wide text-paper transition duration-200 hover:bg-vermilion-ink disabled:opacity-50"
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
      ? "border-vermilion/40 bg-vermilion/5 text-vermilion-ink"
      : "border-ink/20 bg-paper text-ink-60";
  return (
    <p className={`rounded-sm border p-2.5 text-sm ${styles}`}>{children}</p>
  );
}
