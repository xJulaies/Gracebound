import { BossDetails } from "../components/organisms/BossDetails";
import { useBossQuery } from "../hooks/useBossesQuery";

export function BossDetailsPage({ bossId }: { bossId: string }) {
  const query = useBossQuery(bossId);

  if (query.isPending) return <main><p role="status">Loading boss details…</p></main>;
  if (query.isError) return <main><p role="alert">Boss details are currently unavailable.</p></main>;
  const boss = query.data.data[0];
  if (!boss) return <main><p>Boss not found.</p></main>;

  return <main><BossDetails boss={boss} /></main>;
}
