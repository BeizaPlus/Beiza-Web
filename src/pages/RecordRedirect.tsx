import { Navigate, useSearchParams } from "react-router-dom";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";

/** `/record` and `/record?circle=:id` — legacy vs public circle record routes. */
export default function RecordRedirect() {
  const [search] = useSearchParams();
  const circleId = search.get("circle");
  if (circleId) {
    return <Navigate to={BEIZA_LINKS.circle.record(circleId)} replace />;
  }
  return <Navigate to={BEIZA_LINKS.legacy.recordStation} replace />;
}
