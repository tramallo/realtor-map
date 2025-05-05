import {
  AuthChangeEvent,
  createClient,
  RealtimeChannel,
  Session,
  Subscription,
  SupabaseClient,
} from "@supabase/supabase-js";

import { OperationResponse } from "../utils/helperFunctions";
import {
  Contract,
  CreateContractDTO,
  CreatePersonDTO,
  CreatePropertyDTO,
  CreateRealtorDTO,
  Person,
  Property,
  Realtor,
  UpdateContractDTO,
  UpdatePersonDTO,
  UpdatePropertyDTO,
  UpdateRealtorDTO,
} from "../utils/data-schema";
import { BackendApi } from "../utils/services-interface";
import {
  ContractFilter,
  PersonFilter,
  PropertyFilter,
  RealtorFilter,
} from "../utils/data-filter-schema";

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

const client = createClient(supabaseUrl, key);

// AUTH
export const getSession = async (): Promise<OperationResponse<Session>> => {
  const { data, error } = await client.auth.getSession();

  if (!data.session) {
    return { error: error ?? new Error("Session not found.") };
  }

  return { data: data.session };
};

export const onAuthStateChange = (
  callback: (event: AuthChangeEvent, session: Session | null) => void
): OperationResponse<Subscription> => {
  const { data } = client.auth.onAuthStateChange(callback);

  return { data: data.subscription };
};

export const signInWithPassword = async (
  email: string,
  password: string
): Promise<OperationResponse<Session>> => {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (!data.session) {
    return { error: error ?? new Error("No session") };
  }

  return { data: data.session };
};

export const logout = async (): Promise<OperationResponse> => {
  const { error } = await client.auth.signOut();

  if (error) {
    return { error };
  }

  return { data: undefined };
};

// SQL
const queryConstructor = {
  searchPropertyIdsQuery: (
    supabaseClient: SupabaseClient,
    filter: PropertyFilter
  ) => {
    const query = supabaseClient.from("property").select("id");

    if (filter.idEq) {
      query.eq("id", filter.idEq);
    }
    if (filter.idNot) {
      query.not("id", "in", `${filter.idNot.join(",")}`);
    }
    if (filter.createdBy) {
      query.eq("createdBy", filter.createdBy);
    }
    if (filter.createdAtAfter) {
      query.gte("createdAt", filter.createdAtAfter);
    }
    if (filter.createdAtBefore) {
      query.lte("createdAt", filter.createdAtBefore);
    }
    if (filter.updatedBy) {
      query.eq("updatedBy", filter.updatedBy);
    }
    if (filter.updatedAtAfter) {
      query.gte("updatedAt", filter.updatedAtAfter);
    }
    if (filter.updatedAtBefore) {
      query.lte("updatedAt", filter.updatedAtBefore);
    }
    if (filter.deleted != undefined) {
      query.eq("deleted", filter.deleted);
    }

    if (filter.address) {
      const filterWords = filter.address.split(" ");
      filterWords.forEach((word) => query.ilike("address", `%${word}%`));
    }
    if (filter.type) {
      query.eq("type", filter.type);
    }
    if (filter.state) {
      query.eq("state", filter.state);
    }
    if (filter.ownerId) {
      query.eq("ownerId", filter.ownerId);
    }
    if (filter.exclusiveRealtorId) {
      query.eq("exclusiveRealtorId", filter.exclusiveRealtorId);
    }
    if (filter.relatedRealtorIds) {
      query.contains("relatedRealtorIds", filter.relatedRealtorIds);
    }

    return query;
  },
  searchRealtorIdsQuery: (
    supabaseClient: SupabaseClient,
    filter: RealtorFilter
  ) => {
    const query = supabaseClient.from("realtor").select("id");

    if (filter.idEq) {
      query.eq("id", filter.idEq);
    }
    if (filter.idNot) {
      query.not("id", "in", `${filter.idNot.join(",")}`);
    }
    if (filter.createdBy) {
      query.eq("createdBy", filter.createdBy);
    }
    if (filter.createdAtAfter) {
      query.gte("createdAt", filter.createdAtAfter);
    }
    if (filter.createdAtBefore) {
      query.lte("createdAt", filter.createdAtBefore);
    }
    if (filter.updatedBy) {
      query.eq("updatedBy", filter.updatedBy);
    }
    if (filter.updatedAtAfter) {
      query.gte("updatedAt", filter.updatedAtAfter);
    }
    if (filter.updatedAtBefore) {
      query.lte("updatedAt", filter.updatedAtBefore);
    }
    if (filter.deleted != undefined) {
      query.eq("deleted", filter.deleted);
    }

    if (filter.name) {
      const filterWords = filter.name.split(" ");
      filterWords.forEach((word) => query.ilike("name", `%${word}%`));
    }

    return query;
  },
  searchPersonIdsQuery: (
    supabseClient: SupabaseClient,
    filter: PersonFilter
  ) => {
    const query = supabseClient.from("person").select("id");

    if (filter.idEq) {
      query.eq("id", filter.idEq);
    }
    if (filter.idNot) {
      query.not("id", "in", `${filter.idNot.join(",")}`);
    }
    if (filter.createdBy) {
      query.eq("createdBy", filter.createdBy);
    }
    if (filter.createdAtAfter) {
      query.gte("createdAt", filter.createdAtAfter);
    }
    if (filter.createdAtBefore) {
      query.lte("createdAt", filter.createdAtBefore);
    }
    if (filter.updatedBy) {
      query.eq("updatedBy", filter.updatedBy);
    }
    if (filter.updatedAtAfter) {
      query.gte("updatedAt", filter.updatedAtAfter);
    }
    if (filter.updatedAtBefore) {
      query.lte("updatedAt", filter.updatedAtBefore);
    }
    if (filter.deleted != undefined) {
      query.eq("deleted", filter.deleted);
    }

    if (filter.name) {
      const filterWords = filter.name.split(" ");
      filterWords.forEach((word) => query.ilike("name", `%${word}%`));
    }
    if (filter.email) {
      query.eq("email", filter.email);
    }
    if (filter.mobile) {
      query.eq("mobile", filter.mobile);
    }

    return query;
  },
  searchContractIdsQuery: (
    supabaseClient: SupabaseClient,
    filter: ContractFilter
  ) => {
    const query = supabaseClient.from("contract").select("id");

    if (filter.idEq) {
      query.eq("id", filter.idEq);
    }
    if (filter.idNot) {
      query.not("id", "in", `${filter.idNot.join(",")}`);
    }
    if (filter.createdBy) {
      query.eq("createdBy", filter.createdBy);
    }
    if (filter.createdAtAfter) {
      query.gte("createdAt", filter.createdAtAfter);
    }
    if (filter.createdAtBefore) {
      query.lte("createdAt", filter.createdAtBefore);
    }
    if (filter.updatedBy) {
      query.eq("updatedBy", filter.updatedBy);
    }
    if (filter.updatedAtAfter) {
      query.gte("updatedAt", filter.updatedAtAfter);
    }
    if (filter.updatedAtBefore) {
      query.lte("updatedAt", filter.updatedAtBefore);
    }
    if (filter.deleted != undefined) {
      query.eq("deleted", filter.deleted);
    }

    if (filter.property) {
      query.eq("property", filter.property);
    }
    if (filter.client) {
      query.eq("client", filter.client);
    }
    if (filter.startAfter) {
      query.gte("start", filter.startAfter);
    }
    if (filter.startBefore) {
      query.lte("start", filter.startBefore);
    }
    if (filter.endAfter) {
      query.gte("end", filter.endAfter);
    }
    if (filter.endBefore) {
      query.lte("end", filter.endBefore);
    }

    return query;
  },
};

// property
let propertyChannel = undefined as RealtimeChannel | undefined;
const searchPropertyIds = async (
  filter: PropertyFilter
): Promise<OperationResponse<Array<Property["id"]>>> => {
  console.log(`supabaseService -> searchPropertyIds`);
  const query = queryConstructor.searchPropertyIdsQuery(client, filter);
  const { data, error } = await query;

  if (error) {
    return { error };
  }

  const propertyIds = data.map((idObj) => idObj.id);
  return { data: propertyIds };
};
const getProperties = async (
  propertyIds: Array<Property["id"]>
): Promise<OperationResponse<Array<Property>>> => {
  console.log(`supabaseService -> getProperties propertyIds: ${propertyIds}`);
  const { data, error } = await client
    .from("property")
    .select()
    .in("id", propertyIds);

  if (error) {
    return { error };
  }

  return { data };
};
const createProperty = async (
  newPropertyData: CreatePropertyDTO
): Promise<OperationResponse> => {
  console.log(`supabaseService -> createProperty ${newPropertyData.address}`);
  const { error } = await client.from("property").insert(newPropertyData);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const updateProperty = async (
  propertyId: Property["id"],
  updateData: UpdatePropertyDTO
): Promise<OperationResponse> => {
  console.log(`supabaseService -> updateProperty ${propertyId}`);
  const { error } = await client
    .from("property")
    .update(updateData)
    .eq("id", propertyId);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const deleteProperty = async (
  propertyId: Property["id"]
): Promise<OperationResponse> => {
  console.log(`supabaseService -> deleteProperty ${propertyId}`);
  const { error } = await client.from("property").delete().eq("id", propertyId);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const invalidateProperties = async (
  propertyIds: Array<Property["id"]>,
  timestamp: number
): Promise<OperationResponse<Array<Property["id"]>>> => {
  console.log(`supabaseService -> invalidateProperties ${propertyIds}`);

  if (propertyIds.length === 0) {
    return { data: [] };
  }

  const { data, error } = await client
    .from("property")
    .select("id")
    .in("id", propertyIds)
    .or(`updatedAt.is.NULL,updatedAt.lt.${timestamp}`);

  if (error) {
    console.error(`supabaseService -> invalidateProperties: `, error);
    return { error };
  }

  const validIds = data.map((property) => property.id);
  return { data: validIds };
};
const propertiesSubscribe = async (
  newPropertyHandler: (newProperty: Property) => void,
  updatedPropertyHandler: (updatedProperty: Property) => void,
  deletedPropertyHandler: (deletedProperty: Property) => void
): Promise<OperationResponse> => {
  console.log(`supabaseApi -> propertiesSubscribe`);

  if (propertyChannel) {
    console.log(`Already subscribed -> unsubscribing first`);
    const { error } = await propertiesUnsubscribe();
    if (error) {
      return { error: new Error(`propertiesSubscribe -> error: ${error}`) };
    }
  }

  propertyChannel = client
    .channel("realtime-properties")
    .on(
      "postgres_changes",
      { event: "INSERT", table: "property", schema: "public" },
      (payload) => newPropertyHandler(payload.new as Property)
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", table: "property", schema: "public" },
      (payload) => updatedPropertyHandler(payload.new as Property)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", table: "property", schema: "public" },
      (payload) => deletedPropertyHandler(payload.old as Property)
    );

  propertyChannel.subscribe((_status, err) => {
    if (err) {
      propertyChannel = undefined;
      return { error: new Error(`propertiesSubscribe -> error: ${err}`) };
    }
  });

  return { data: undefined };
};
const propertiesUnsubscribe = async (): Promise<OperationResponse> => {
  console.log(`supabaseApi -> propertiesUnsubscribe`);

  if (!propertyChannel) {
    console.log(`propertiesUnsubscribe -> Already unsubscribed`);
    return { data: undefined };
  }

  client
    .removeChannel(propertyChannel)
    .then(() => {
      propertyChannel = undefined;
      return { data: undefined };
    })
    .catch((err) => {
      return { error: new Error(`propertiesUnsubscribe -> error: ${err}`) };
    });

  return { data: undefined };
};

// realtor
let realtorChannel = undefined as RealtimeChannel | undefined;
const searchRealtorIds = async (
  filter: RealtorFilter
): Promise<OperationResponse<Array<Realtor["id"]>>> => {
  console.log(`supabaseService -> searchRealtorIds`);
  const query = queryConstructor.searchRealtorIdsQuery(client, filter);
  const { data, error } = await query;

  if (error) {
    return { error };
  }

  const realtorIds = data.map((idObj) => idObj.id);
  return { data: realtorIds };
};
const getRealtors = async (
  realtorIds: Array<Realtor["id"]>
): Promise<OperationResponse<Array<Realtor>>> => {
  console.log(`supabaseService -> getRealtors realtorIds: ${realtorIds}`);
  const { data, error } = await client
    .from("realtor")
    .select()
    .in("id", realtorIds);

  if (error) {
    return { error };
  }

  return { data };
};
const createRealtor = async (
  newRealtorData: CreateRealtorDTO
): Promise<OperationResponse> => {
  console.log(`supabaseService -> createRealtor ${newRealtorData.name}`);
  const { error } = await client.from("realtor").insert(newRealtorData);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const updateRealtor = async (
  realtorId: Realtor["id"],
  updateData: UpdateRealtorDTO
): Promise<OperationResponse> => {
  console.log(`supabaseService -> updateRealtor ${realtorId}`);
  const { error } = await client
    .from("realtor")
    .update(updateData)
    .eq("id", realtorId);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const deleteRealtor = async (
  realtorId: Realtor["id"]
): Promise<OperationResponse> => {
  console.log(`supabaseService -> deleteRealtor ${realtorId}`);
  const { error } = await client.from("realtor").delete().eq("id", realtorId);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const invalidateRealtors = async (
  realtorIds: Array<Realtor["id"]>,
  timestamp: number
): Promise<OperationResponse<Array<Realtor["id"]>>> => {
  console.log(`supabaseService -> invalidateRealtors ${realtorIds}`);

  if (realtorIds.length === 0) {
    return { data: [] };
  }

  const { data, error } = await client
    .from("realtor")
    .select("id")
    .in("id", realtorIds)
    .or(`updatedAt.is.NULL,updatedAt.lt.${timestamp}`);

  if (error) {
    console.error(`supabaseService -> invalidateRealtors: `, error);
    return { error };
  }

  const validIds = data.map((realtor) => realtor.id);
  return { data: validIds };
};
const realtorsSubscribe = async (
  newRealtorHandler: (newRealtor: Realtor) => void,
  updatedRealtorHandler: (updatedRealtor: Realtor) => void,
  deletedRealtorHandler: (deletedRealtor: Realtor) => void
): Promise<OperationResponse> => {
  console.log(`supabaseApi -> realtorsSubscribe`);

  if (realtorChannel) {
    console.log(`Already subscribed -> unsubscribing first`);
    const { error } = await realtorsUnsubscribe();
    if (error) {
      return { error: new Error(`realtorsSubscribe -> error: ${error}`) };
    }
  }

  realtorChannel = client
    .channel("realtime-realtors")
    .on(
      "postgres_changes",
      { event: "INSERT", table: "realtor", schema: "public" },
      (payload) => newRealtorHandler(payload.new as Realtor)
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", table: "realtor", schema: "public" },
      (payload) => updatedRealtorHandler(payload.new as Realtor)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", table: "realtor", schema: "public" },
      (payload) => deletedRealtorHandler(payload.old as Realtor)
    );

  realtorChannel.subscribe((_status, err) => {
    if (err) {
      realtorChannel = undefined;
      return { error: new Error(`realtorsSubscribe -> error: ${err}`) };
    }
  });

  return { data: undefined };
};
const realtorsUnsubscribe = async (): Promise<OperationResponse> => {
  console.log(`supabaseApi -> realtorsUnsubscribe`);

  if (!realtorChannel) {
    console.log(`realtorsUnsubscribe -> Already unsubscribed`);
    return { data: undefined };
  }

  client
    .removeChannel(realtorChannel)
    .then(() => {
      realtorChannel = undefined;
      return { data: undefined };
    })
    .catch((err) => {
      return { error: new Error(`realtorsUnsubscribe -> error: ${err}`) };
    });

  return { data: undefined };
};

// person
let personChannel = undefined as RealtimeChannel | undefined;
const searchPersonIds = async (
  filter: PersonFilter
): Promise<OperationResponse<Array<Person["id"]>>> => {
  console.log(`supabaseService -> searchPersonIds`);
  const query = queryConstructor.searchPersonIdsQuery(client, filter);
  const { data, error } = await query;

  if (error) {
    return { error };
  }

  const personIds = data.map((idObj) => idObj.id);
  return { data: personIds };
};
const getPersons = async (
  personIds: Array<Person["id"]>
): Promise<OperationResponse<Array<Person>>> => {
  console.log(`supabaseService -> getPersons personIds: ${personIds}`);
  const { data, error } = await client
    .from("person")
    .select()
    .in("id", personIds);

  if (error) {
    return { error };
  }

  return { data };
};
const createPerson = async (
  newPersonData: CreatePersonDTO
): Promise<OperationResponse> => {
  console.log(`supabaseService -> createPerson ${newPersonData.name}`);
  const { error } = await client.from("person").insert(newPersonData);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const updatePerson = async (
  personId: Person["id"],
  updateData: UpdatePersonDTO
): Promise<OperationResponse> => {
  console.log(`supabaseService -> updatePerson ${personId}`);
  const { error } = await client
    .from("person")
    .update(updateData)
    .eq("id", personId);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const deletePerson = async (
  personId: Person["id"]
): Promise<OperationResponse> => {
  console.log(`supabaseService -> deletePerson ${personId}`);
  const { error } = await client.from("person").delete().eq("id", personId);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const invalidatePersons = async (
  personIds: Array<Person["id"]>,
  timestamp: number
): Promise<OperationResponse<Array<Person["id"]>>> => {
  console.log(`supabaseService -> invalidatePersons ${personIds}`);

  if (personIds.length === 0) {
    return { data: [] };
  }

  const { data, error } = await client
    .from("person")
    .select("id")
    .in("id", personIds)
    .or(`updatedAt.is.NULL,updatedAt.lt.${timestamp}`);

  if (error) {
    console.error(`supabaseService -> invalidatePersons: `, error);
    return { error };
  }

  const validIds = data.map((person) => person.id);
  return { data: validIds };
};
const personsSubscribe = async (
  newPersonHandler: (newPerson: Person) => void,
  updatedPersonHandler: (updatedPerson: Person) => void,
  deletedPersonHandler: (deletedPerson: Person) => void
): Promise<OperationResponse> => {
  console.log(`supabaseApi -> personsSubscribe`);

  if (personChannel) {
    console.log(`Already subscribed -> unsubscribing first`);
    const { error } = await personsUnsubscribe();

    if (error) {
      return { error: new Error(`personsSubscribe -> error: ${error}`) };
    }
  }

  personChannel = client
    .channel("realtime-persons")
    .on(
      "postgres_changes",
      { event: "INSERT", table: "person", schema: "public" },
      (payload) => newPersonHandler(payload.new as Person)
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", table: "person", schema: "public" },
      (payload) => updatedPersonHandler(payload.new as Person)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", table: "person", schema: "public" },
      (payload) => deletedPersonHandler(payload.old as Person)
    );

  personChannel.subscribe((_status, err) => {
    if (err) {
      personChannel = undefined;
      return { error: new Error(`personsSubscribe -> error: ${err}`) };
    }
  });

  return { data: undefined };
};
const personsUnsubscribe = async (): Promise<OperationResponse> => {
  console.log(`supabaseApi -> personsUnsubscribe`);

  if (!personChannel) {
    console.log(`personsUnsubscribe -> Already unsubscribed`);
    return { data: undefined };
  }

  client
    .removeChannel(personChannel)
    .then(() => {
      personChannel = undefined;
      return { data: undefined };
    })
    .catch((err) => {
      return { error: new Error(`personsUnsubscribe -> error: ${err}`) };
    });

  return { data: undefined };
};

// contract
let contractChannel = undefined as RealtimeChannel | undefined;
const searchContractIds = async (
  filter: ContractFilter
): Promise<OperationResponse<Array<Contract["id"]>>> => {
  console.log(`supabaseService -> searchContractIds`);
  const query = queryConstructor.searchContractIdsQuery(client, filter);
  const { data, error } = await query;

  if (error) {
    return { error };
  }

  const contractIds = data.map((idObj) => idObj.id);
  return { data: contractIds };
};
const getContracts = async (
  contractIds: Array<Contract["id"]>
): Promise<OperationResponse<Array<Contract>>> => {
  console.log(`supabaseService -> getContracts contractIds: ${contractIds}`);
  const { data, error } = await client
    .from("contract")
    .select()
    .in("id", contractIds);

  if (error) {
    return { error };
  }

  return { data };
};
const createContract = async (
  newContractData: CreateContractDTO
): Promise<OperationResponse> => {
  console.log(
    `supabaseService -> createContract property: ${newContractData.property} client: ${newContractData.client}`
  );
  const { error } = await client.from("contract").insert(newContractData);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const updateContract = async (
  contractId: Contract["id"],
  updateData: UpdateContractDTO
): Promise<OperationResponse> => {
  console.log(`supabaseService -> updateContract ${contractId}`);
  const { error } = await client
    .from("contract")
    .update(updateData)
    .eq("id", contractId);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const deleteContract = async (
  contractId: Contract["id"]
): Promise<OperationResponse> => {
  console.log(`supabaseService -> deleteContract ${contractId}`);
  const { error } = await client.from("contract").delete().eq("id", contractId);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const invalidateContracts = async (
  contractIds: Array<Contract["id"]>,
  timestamp: number
): Promise<OperationResponse<Array<Contract["id"]>>> => {
  console.log(`supabaseService -> invalidateContracts ${contractIds}`);

  if (contractIds.length === 0) {
    return { data: [] };
  }

  const { data, error } = await client
    .from("contract")
    .select("id")
    .in("id", contractIds)
    .or(`updatedAt.is.NULL,updatedAt.lt.${timestamp}`);

  if (error) {
    console.error(`supabaseService -> invalidateContracts: `, error);
    return { error };
  }

  const validIds = data.map((contract) => contract.id);
  return { data: validIds };
};
const contractsSubscribe = async (
  newContractHandler: (newContract: Contract) => void,
  updatedContractHandler: (updatedContract: Contract) => void,
  deletedContractHandler: (deletedContract: Contract) => void
): Promise<OperationResponse> => {
  console.log(`supabaseApi -> contractsSubscribe`);

  if (contractChannel) {
    console.log(`Already subscribed -> unsubscribing first`);
    const { error } = await contractsUnsubscribe();
    if (error) {
      return { error: new Error(`contractsSubscribe -> error: ${error}`) };
    }
  }

  contractChannel = client
    .channel("realtime-contracts")
    .on(
      "postgres_changes",
      { event: "INSERT", table: "contract", schema: "public" },
      (payload) => newContractHandler(payload.new as Contract)
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", table: "contract", schema: "public" },
      (payload) => updatedContractHandler(payload.new as Contract)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", table: "contract", schema: "public" },
      (payload) => deletedContractHandler(payload.old as Contract)
    );

  contractChannel.subscribe((_status, err) => {
    if (err) {
      contractChannel = undefined;
      return { error: new Error(`contractsSubscribe -> error: ${err}`) };
    }
  });

  return { data: undefined };
};
const contractsUnsubscribe = async (): Promise<OperationResponse> => {
  console.log(`supabaseApi -> contractsUnsubscribe`);

  if (!contractChannel) {
    console.log(`contractsUnsubscribe -> Already unsubscribed`);
    return { data: undefined };
  }

  client
    .removeChannel(contractChannel)
    .then(() => {
      contractChannel = undefined;
      return { data: undefined };
    })
    .catch((err) => {
      return { error: new Error(`contractsUnsubscribe -> error: ${err}`) };
    });

  return { data: undefined };
};

export const supabaseApi: BackendApi = {
  //person
  searchPersonIds,
  getPersons,
  createPerson,
  updatePerson,
  deletePerson,
  invalidatePersons,
  personsSubscribe,
  personsUnsubscribe,
  //realtor
  searchRealtorIds,
  getRealtors,
  createRealtor,
  updateRealtor,
  deleteRealtor,
  invalidateRealtors,
  realtorsSubscribe,
  realtorsUnsubscribe,
  //property
  searchPropertyIds,
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  invalidateProperties,
  propertiesSubscribe,
  propertiesUnsubscribe,
  //contract
  searchContractIds,
  getContracts,
  createContract,
  updateContract,
  deleteContract,
  invalidateContracts,
  contractsSubscribe,
  contractsUnsubscribe,
};
