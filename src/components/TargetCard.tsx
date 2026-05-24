export function TargetCard({
  value,
  active = false
}: {
  value: string;
  active?: boolean;
}) {
  return (
    <span className={`target-card${active ? " is-active" : ""}`}>
      {value}
    </span>
  );
}
