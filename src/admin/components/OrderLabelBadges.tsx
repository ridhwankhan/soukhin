import { OrderLabel } from '../../types';
import { getOrderLabelMeta } from '../../config/orderLabels';

export default function OrderLabelBadges({ labels }: { labels?: OrderLabel[] }) {
  if (!labels?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((id) => {
        const meta = getOrderLabelMeta(id);
        if (!meta) return null;
        return (
          <span key={id} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${meta.className}`}>
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}
