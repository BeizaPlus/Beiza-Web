import { Navigate, useSearchParams } from "react-router-dom";

/** `/record` and `/record?circle=:id` — legacy vs public circle record routes. */
export default function RecordRedirect() {
  const [search] = useSearchParams();
  const circleId = search.get("circle");
  if (circleId) {
    return <Navigate to={`/circle/${circleId}/record`} replace />;
  }
  return <Navigate to="/legacy/record" replace />;
}
