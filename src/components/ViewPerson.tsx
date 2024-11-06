import "./ViewPerson.css";
import { usePersonStore } from "../utils/domainDataStore";
import { PersonData } from "../utils/domainSchemas";

export interface ViewPersonProps {
  personId: PersonData["id"];
}

export default function ViewPerson({ personId }: ViewPersonProps) {
  const persons = usePersonStore((store) => store.persons);
  const person = persons.find((person) => person.id == personId);

  return (
    <div className="view-person">
      {!person && <span>Person not found</span>}
      {person && (
        <>
          <label>
            Name: <span>{person.name}</span>
          </label>
          <label>
            Mobile: <span>{person.mobile ?? ""}</span>
          </label>
          <label>
            Email: <span>{person.email ?? ""}</span>
          </label>
        </>
      )}
    </div>
  );
}
