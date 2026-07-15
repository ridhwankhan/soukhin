import { groupAssignableCategories } from '../../lib/categoryGroups';
import type { AssignableCategory } from '../../lib/categoryService';

interface CategorySelectProps {
  categories: AssignableCategory[];
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
  className?: string;
  includeAllOption?: { value: string; label: string };
  required?: boolean;
}

export default function CategorySelect({
  categories,
  value,
  onChange,
  disabled,
  className = 'w-full px-4 py-2 border border-line rounded-sm disabled:bg-canvas',
  includeAllOption,
  required,
}: CategorySelectProps) {
  const groups = groupAssignableCategories(categories);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      className={className}
    >
      {includeAllOption && <option value={includeAllOption.value}>{includeAllOption.label}</option>}
      {groups.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.items.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.parentSlug && cat.rootSlug !== cat.parentSlug ? `↳ ${cat.name}` : cat.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
