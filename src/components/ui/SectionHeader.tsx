interface SectionHeaderProps {
  label: string;
  title: string;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="section-header-label">// {label}</div>
      <div className="section-header-title text-2xl sm:text-3xl">{title}</div>
      <div className="section-header-bar" />
    </div>
  );
}
