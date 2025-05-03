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
  CreatePersonData,
  CreatePropertyData,
  CreateRealtorData,
  PersonData,
  PersonFilterData,
  PropertyData,
  PropertyFilterData,
  RealtorData,
  RealtorFilterData,
  UpdatePersonData,
  UpdatePropertyData,
  UpdateRealtorData,
} from "../utils/domainSchemas";
import { BackendApi } from "../utils/services-interface";

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
    filter: PropertyFilterData
  ) => {
    let query = supabaseClient.from("property").select("id");

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
    filter: RealtorFilterData
  ) => {
    let query = supabaseClient.from("realtor").select("id");

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
    filter: PersonFilterData
  ) => {
    let query = supabseClient.from("person").select("id");

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
};

// property
let propertyChannel = undefined as RealtimeChannel | undefined;
const searchPropertyIds = async (
  filter: PropertyFilterData
): Promise<OperationResponse<Array<PropertyData["id"]>>> => {
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
  propertyIds: Array<PropertyData["id"]>
): Promise<OperationResponse<Array<PropertyData>>> => {
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
  newPropertyData: CreatePropertyData
): Promise<OperationResponse> => {
  console.log(`supabaseService -> createProperty ${newPropertyData.address}`);
  const { error } = await client.from("property").insert(newPropertyData);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const updateProperty = async (
  propertyId: PropertyData["id"],
  updateData: UpdatePropertyData
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
  propertyId: PropertyData["id"]
): Promise<OperationResponse<undefined>> => {
  console.log(`supabaseService -> deleteProperty ${propertyId}`);
  const { data, error } = await client
    .from("property")
    .delete()
    .eq("id", propertyId)
    .select();

  if (error) {
    return { error };
  }

  return { data: data[0] };
};
const invalidateProperties = async (
  propertyIds: Array<PropertyData["id"]>,
  timestamp: number
): Promise<OperationResponse<Array<PropertyData["id"]>>> => {
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
  newPropertyHandler: (newProperty: PropertyData) => void,
  updatedPropertyHandler: (updatedProperty: PropertyData) => void,
  deletedPropertyHandler: (deletedProperty: PropertyData) => void
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
      (payload) => newPropertyHandler(payload.new as PropertyData)
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", table: "property", schema: "public" },
      (payload) => updatedPropertyHandler(payload.new as PropertyData)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", table: "property", schema: "public" },
      (payload) => deletedPropertyHandler(payload.old as PropertyData)
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
  filter: RealtorFilterData
): Promise<OperationResponse<Array<RealtorData["id"]>>> => {
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
  realtorIds: Array<RealtorData["id"]>
): Promise<OperationResponse<Array<RealtorData>>> => {
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
  newRealtorData: CreateRealtorData
): Promise<OperationResponse> => {
  console.log(`supabaseService -> createRealtor ${newRealtorData.name}`);
  const { error } = await client.from("realtor").insert(newRealtorData);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const updateRealtor = async (
  realtorId: RealtorData["id"],
  updateData: UpdateRealtorData
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
  realtorId: RealtorData["id"]
): Promise<OperationResponse<undefined>> => {
  console.log(`supabaseService -> deleteRealtor ${realtorId}`);
  const { data, error } = await client
    .from("realtor")
    .delete()
    .eq("id", realtorId)
    .select();

  if (error) {
    return { error };
  }

  return { data: data[0] };
};
const invalidateRealtors = async (
  realtorIds: Array<RealtorData["id"]>,
  timestamp: number
): Promise<OperationResponse<Array<RealtorData["id"]>>> => {
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
  newRealtorHandler: (newRealtor: RealtorData) => void,
  updatedRealtorHandler: (updatedRealtor: RealtorData) => void,
  deletedRealtorHandler: (deletedRealtor: RealtorData) => void
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
      (payload) => newRealtorHandler(payload.new as RealtorData)
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", table: "realtor", schema: "public" },
      (payload) => updatedRealtorHandler(payload.new as RealtorData)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", table: "realtor", schema: "public" },
      (payload) => deletedRealtorHandler(payload.old as RealtorData)
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
  filter: PersonFilterData
): Promise<OperationResponse<Array<PersonData["id"]>>> => {
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
  personIds: Array<PersonData["id"]>
): Promise<OperationResponse<Array<PersonData>>> => {
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
  newPersonData: CreatePersonData
): Promise<OperationResponse> => {
  console.log(`supabaseService -> createPerson ${newPersonData.name}`);
  const { error } = await client.from("person").insert(newPersonData);

  if (error) {
    return { error };
  }

  return { data: undefined };
};
const updatePerson = async (
  personId: PersonData["id"],
  updateData: UpdatePersonData
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
  personId: PersonData["id"]
): Promise<OperationResponse<undefined>> => {
  console.log(`supabaseService -> deletePerson ${personId}`);
  const { data, error } = await client
    .from("person")
    .delete()
    .eq("id", personId)
    .select();

  if (error) {
    return { error };
  }

  return { data: data[0] };
};
const invalidatePersons = async (
  personIds: Array<PersonData["id"]>,
  timestamp: number
): Promise<OperationResponse<Array<PersonData["id"]>>> => {
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
  newPersonHandler: (newPerson: PersonData) => void,
  updatedPersonHandler: (updatedPerson: PersonData) => void,
  deletedPersonHandler: (deletedPerson: PersonData) => void
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
      (payload) => newPersonHandler(payload.new as PersonData)
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", table: "person", schema: "public" },
      (payload) => updatedPersonHandler(payload.new as PersonData)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", table: "person", schema: "public" },
      (payload) => deletedPersonHandler(payload.old as PersonData)
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
};
