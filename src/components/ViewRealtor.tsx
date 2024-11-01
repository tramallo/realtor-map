import "./ViewRealtor.css";
import { useRealtorStore } from "../utils/domainDataStore";
import { RealtorSchema } from "../utils/domainSchemas";

export interface ViewRealtorProps {
  realtorId: RealtorSchema["id"];
}

export default function ViewRealtor({ realtorId }: ViewRealtorProps) {
  const realtors = useRealtorStore((store) => store.realtors);
  const realtor = realtors.find((realtor) => realtor.id == realtorId);

  return (
    <div className="view-realtor">
      {!realtor && <span>Realtor not found</span>}
      {realtor && (
        <>
          <label>
            Name: <span>{realtor.name}</span>
          </label>
        </>
      )}
    </div>
  );
}
