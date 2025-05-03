import { create } from "zustand";

import { CreatePersonData, PersonData, PersonFilterData, UpdatePersonData } from "../utils/domainSchemas";
import { OperationResponse } from "../utils/helperFunctions";
import { BackendEvent } from "../utils/backendApiInterface";
import { realtorMapApi as backendApi } from "../utils/realtorMapService";

export interface PersonStore {
    persons: Record<PersonData["id"], PersonData>;
    fetchPerson: (personId: PersonData["id"]) => Promise<OperationResponse>;
    searchPersons: (filter: PersonFilterData) => Promise<OperationResponse>;
    createPerson: (newPersonData: CreatePersonData) => Promise<OperationResponse>;
    updatePerson: (personId: PersonData["id"], updateData: UpdatePersonData) => Promise<OperationResponse>;
    deletePerson: (personId: PersonData['id']) => Promise<OperationResponse>;
}

const PERSONS_LOCAL_STORAGE_KEY = "persons-store";
const fetchLocalStoragePersons = (): OperationResponse<Record<PersonData["id"], PersonData> | undefined> => {
    console.log(`personsStorage -> fetchLocalStoragePersons`);

    const rawLocalStorageData = localStorage.getItem(PERSONS_LOCAL_STORAGE_KEY);

    if (!rawLocalStorageData) {
        return { data: undefined };
    }

    try {
        const parsedLocalStorageData = JSON.parse(rawLocalStorageData);
        return { data: parsedLocalStorageData };
    } catch (error) {
        return { error: new Error(`fetchLocalStoragePersons -> error: ${error}`) };
    }
}

export const usePersonStore = create<PersonStore>((set, get) => {
    console.log(`personsStore -> create`);

    const storePersons = (persons: PersonData[]) => {
        const { persons: storedPersons } = get();
        const storedPersonsCopy = { ...storedPersons };

        persons.forEach((person) => {
            storedPersonsCopy[person.id] = person;
        });
    
        set({ persons: storedPersonsCopy });
    }
    const removePersons = (personIds: Array<PersonData['id']>) => {
        const { persons: storedPersons } = get();
        const storedPersonsCopy = { ...storedPersons };
        
        personIds.forEach((personId) => {
            delete storedPersonsCopy[personId];
        })

        set({ persons: storedPersonsCopy });
    }

    const newPersonHandler = (newPerson: PersonData) => {
        console.log(`event -> [${BackendEvent.NewPerson}] ${newPerson.name} `);
        storePersons([newPerson]);
    }
    const updatedPersonHandler = (updatedPerson: PersonData) => {
        console.log(`event -> [${BackendEvent.UpdatedPerson}] ${updatedPerson.name} `);
        storePersons([updatedPerson]);
    }
    const deletedPersonHandler = (deletedPerson: PersonData) => {
        console.log(`event -> [${BackendEvent.DeletedPerson}] ${deletedPerson.name}`);
        removePersons([deletedPerson.id]);
    }
    backendApi.personsSubscribe(newPersonHandler, updatedPersonHandler, deletedPersonHandler);

    const syncLocalStorageState = async () => {
        console.log(`personsStorage -> syncLocalStorageState`);

        const { error, data: localStoragePersons} = fetchLocalStoragePersons();
        
        if (error) {
            console.log('personsStorage -> syncLocalStorageState -> error: ', error);
            localStorage.removeItem(PERSONS_LOCAL_STORAGE_KEY);
            return;
        }

        if (!localStoragePersons) {
            return;
        }

        const localStoragePersonIds = Object.keys(localStoragePersons) as unknown as Array<PersonData["id"]>;

        if (localStoragePersonIds.length == 0) {
            return;
        }

        const { data: validIds, error: invalidatePersonsError } = await backendApi.invalidatePersons(localStoragePersonIds, Date.now());

        if (invalidatePersonsError) {
            console.error('personsStorage -> syncLocalStorageState -> error: ', invalidatePersonsError);
            return;
        }

        const validPersons: Record<PersonData["id"], PersonData> = {};
        validIds.forEach((validId) => {
            validPersons[validId] = localStoragePersons![validId];
        })

        set({ persons: validPersons });
    }
    syncLocalStorageState();

    return {
        persons: {},
        fetchPerson: async (personId: PersonData["id"]) => {
            console.log(`personStore -> fetchPerson - personId: ${personId}`)

            const { persons: storedPersons } = get();
            const storedPerson = storedPersons[personId];

            if (storedPerson) {
                return { data: undefined };
            }

            const { data: persons, error } = await backendApi.getPersons([personId]);

            if (error) {
                return { error };
            }

            if (persons) {
                storePersons(persons);
            }

            return { data: undefined };
        },
        searchPersons: async (filter) => {
            console.log(`personStore -> searchPersons - filter: ${JSON.stringify(filter)}`)

            const { error, data } = await backendApi.searchPersonIds(filter);

            if (error) {
                return { error };
            }

            const { persons } = get();
            const storedPersonIds = new Set(Object.keys(persons).map(Number));
            const nonStoredPersonIds = data.filter((personId) => !storedPersonIds.has(personId));

            if (nonStoredPersonIds.length == 0) {
                return { data: undefined };
            }

            const { error: getPersonsError, data: nonStoredPersons } = await backendApi.getPersons(nonStoredPersonIds);

            if (getPersonsError) {
                return { error: getPersonsError };
            }

            storePersons(nonStoredPersons);
            return { data: undefined };
        },
        createPerson: async (newPersonData) => {
            console.log(`personStore -> createPerson - personData: ${JSON.stringify(newPersonData)}`)

            const { error } = await backendApi.createPerson(newPersonData);

            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        updatePerson: async (personId, updateData) => {
            console.log(`personStore -> updatePerson - personId: ${personId} updateData: ${JSON.stringify(updateData)}`)

            const { error } = await backendApi.updatePerson(personId, updateData);

            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        deletePerson: async (personId) => {
            console.log(`personStore -> deletePerson personId: ${personId}`);

            const { error } = await backendApi.deletePerson(personId);

            if (error) {
                return { error };
            }

            return { data: undefined };
        }
    };
})

usePersonStore.subscribe((state) => {
    localStorage.setItem(PERSONS_LOCAL_STORAGE_KEY, JSON.stringify(state.persons));
})

export const fetchByIdSelector = (personId: PersonData["id"]) => {
    return (store: PersonStore) => store.persons[personId];
}
