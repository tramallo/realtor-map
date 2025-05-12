/* import { Button, Stack, TextField, Typography } from "@mui/material";
import ListPersons from "../components/persons/ListPersons";
import CreateProperty from "../components/properties/CreateProperty";
import ListRealtors from "../components/realtors/ListRealtors";
import { usePersonStore } from "../stores/personsStore";
import { SelectPerson } from "../components/persons/SelectPerson";
import RealtorField from "../components/RealtorField";
import { useState } from "react"; */
import CreateContract from "../components/contracts/CreateContract";
import SearchContracts from "../components/contracts/SearchContracts";
import { ListContracts } from "../components/contracts/ListContracts";
import ViewContract from "../components/contracts/ViewContract";
import { ListPersons } from "../components/persons/ListPersons";
import SearchPersons from "../components/persons/SearchPersons";
import { ListProperties } from "../components/properties/ListProperties";
import SearchProperties from "../components/properties/SearchProperties";
import { ListRealtors } from "../components/realtors/ListRealtors";
import SearchRealtors from "../components/realtors/SearchRealtors";
//import ListProperties from "../components/properties/ListProperties";

export default function Test() {
  console.log(`Test -> render`);
  /* const persons = usePersonStore((store) => store.persons);
  const searchPersons = usePersonStore((store) => store.searchPersons);

  const [state, setState] = useState([]); */
  return (
    <>
      {/* <Stack spacing={1} padding={1}>
      <Button onClick={() => searchPersons({})}>search</Button>
      <Typography>persons</Typography>
      {Object.entries(persons).map(([personId, person], index) => (
        <TextField key={index} value={person.name} />
      ))}
    </Stack> */}
      <ListContracts contractIds={[2, 3, 4, 5]} onSelect={alert} />
    </>
  );
}
