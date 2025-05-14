import MapProperties from "../components/properties/MapProperties";

export default function Test() {
  console.log(`Test -> render`);

  return (
    <>
      {/* <Stack spacing={1} padding={1}>
      <Button onClick={() => searchPersons({})}>search</Button>
      <Typography>persons</Typography>
      {Object.entries(persons).map(([personId, person], index) => (
        <TextField key={index} value={person.name} />
      ))}
    </Stack> */}
      <MapProperties propertyIds={[60, 61, 62]} />
    </>
  );
}
