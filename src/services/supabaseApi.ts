import {
  AuthChangeEvent,
  createClient as createSupabaseClient,
  RealtimeChannel,
  Session,
  Subscription,
} from "@supabase/supabase-js";

import { OperationResponse } from "../utils/helperFunctions";
import {
  Contract,
  CreateContractDTO,
  CreateClientDTO,
  CreatePropertyDTO,
  CreateRealtorDTO,
  Client,
  Property,
  Realtor,
  UpdateContractDTO,
  UpdateClientDTO,
  UpdatePropertyDTO,
  UpdateRealtorDTO,
  BaseData,
} from "../utils/data-schema";
import { BackendApi } from "../utils/services-interface";
import {
  BaseDataFilter,
  ContractFilter,
  ClientFilter,
  PropertyFilter,
  RealtorFilter,
  SortConfig,
  PaginationCursor,
  SortConfigEntry,
} from "../utils/data-filter-schema";

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createSupabaseClient(supabaseUrl, key);

// AUTH
export const getSession = async (): Promise<OperationResponse<Session>> => {
  console.log(`supabase -> getSession`);

  const { data, error } = await supabase.auth.getSession();

  if (!data.session) {
    const e = new Error(`getSession -> Session not found. Error: ${error}`);
    console.log(e);
    return { error: e };
  }

  return { data: data.session };
};

export const onAuthStateChange = (
  callback: (event: AuthChangeEvent, session: Session | null) => void
): OperationResponse<Subscription> => {
  console.log(`supabase -> onAuthStateChange: register callback`);

  const { data } = supabase.auth.onAuthStateChange(callback);
  return { data: data.subscription };
};

export const signInWithPassword = async (
  email: string,
  password: string
): Promise<OperationResponse<Session>> => {
  console.log(`supabase -> signInWithPassword: sign in user: ${email}`);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!data.session) {
    return { error: error ?? new Error("No session") };
  }

  return { data: data.session };
};

export const logout = async (): Promise<OperationResponse> => {
  console.log(`supabase -> logout`);

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error };
  }

  return { data: undefined };
};

// SQL

//FIXME: add typing for 'query' parameters
const addBaseDataFilters = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any, 
  filter: BaseDataFilter
) => {
  if (filter.idEq?.length) {
    query.in("id", filter.idEq);
  }
  if (filter.idNeq?.length) {
    query.not("id", "in", `(${filter.idNeq.join(",")})`);
  }
  if (filter.createdByEq) {
    query.eq("createdBy", filter.createdByEq);
  }
  if (filter.createdAtAfter) {
    query.gte("createdAt", filter.createdAtAfter);
  }
  if (filter.createdAtBefore) {
    query.lte("createdAt", filter.createdAtBefore);
  }
  if (filter.updatedByEq) {
    query.eq("updatedBy", filter.updatedByEq);
  }
  if (filter.updatedAtAfter) {
    query.gte("updatedAt", filter.updatedAtAfter);
  }
  if (filter.updatedAtBefore) {
    query.lte("updatedAt", filter.updatedAtBefore);
  }
  if (filter.deletedEq != undefined) {
    query.eq("deleted", filter.deletedEq);
  }

  return query;
}
const addPaginationCursorFilter = <T extends BaseData>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  sortConfig: SortConfig<T>,
  paginationCursor: PaginationCursor<T>,
) => {
  const conditions: string[] = [];

  sortConfig.forEach((sortEntry, sortEntryIndex) => {
    const parts: string[] = [];
    
    // Add equality checks for previous columns
    for (let prevColumnIndex = 0; prevColumnIndex < sortEntryIndex; prevColumnIndex++) {
      const prevSortEntry = sortConfig[prevColumnIndex] as SortConfigEntry<T>;

      if (!paginationCursor[prevSortEntry.column]) {
        console.error(`supabaseApi -> addPaginationCursorFilter -
          error: expected cursor value (${String(prevSortEntry.column)}) is undefined, search results might not be consistent.
          check that cursor is reset between searches`)
        continue;
      } 
      
      parts.push(`${String(prevSortEntry.column)}.eq.${paginationCursor[prevSortEntry.column]}`);
    }
    
    // Add current column inequality
    const operator = sortEntry.direction === 'asc' ? 'gt' : 'lt';
    parts.push(`${String(sortEntry.column)}.${operator}.${paginationCursor[sortEntry.column]}`);
    conditions.push(`and(${parts.join(',')})`);
  })

  query.or(conditions.join(','));
};
const addOrdering = <T extends BaseData>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any, 
  sortConfig: SortConfig<T>
) => {
  sortConfig.forEach(({ column, direction }) => {
    query.order(String(column), { ascending: direction === "asc" });
  });
}

const buildSearchPropertyIdsQuery = (
  filter: PropertyFilter, 
  sortConfig: SortConfig<Property>, 
  recordsPerPage: number,
  paginationCursor: PaginationCursor<Property> | undefined,
) => {
  const query = supabase.from("property").select("id");

  if (filter.addressLike) {
    const filterWords = filter.addressLike.split(" ");
    filterWords.forEach((word) => query.ilike("address", `%${word}%`));
  }
  if (filter.typeEq) {
    query.eq("type", filter.typeEq);
  }
  if (filter.stateEq) {
    query.eq("state", filter.stateEq);
  }
  if (filter.ownerEq) {
    query.eq("owner", filter.ownerEq);
  }
  if (filter.exclusiveRealtorEq) {
    query.eq("exclusiveRealtor", filter.exclusiveRealtorEq);
  }
  if (filter.relatedRealtorIdsHas) {
    query.contains("relatedRealtorIds", filter.relatedRealtorIdsHas);
  }

  addBaseDataFilters(query, filter);
  if (paginationCursor) {
    addPaginationCursorFilter(query, sortConfig, paginationCursor);
  }
  addOrdering(query, sortConfig);
  query.limit(recordsPerPage);

  return query;
}
const buildSearchRealtorIdsQuery = (
  filter: RealtorFilter, 
  sortConfig: SortConfig<Realtor>, 
  recordsPerPage: number, 
  paginationCursor: PaginationCursor<Realtor> | undefined
) => {
  const query = supabase.from("realtor").select("id");

  if (filter.nameLike) {
    const filterWords = filter.nameLike.split(" ");
    filterWords.forEach((word) => query.ilike("name", `%${word}%`));
  }

  addBaseDataFilters(query, filter);
  if (paginationCursor) {
    addPaginationCursorFilter(query, sortConfig, paginationCursor);
  }
  addOrdering(query, sortConfig);
  query.limit(recordsPerPage);

  return query;
}
const buildSearchClientIdsQuery = (
  filter: ClientFilter, 
  sortConfig: SortConfig<Client>, 
  recordsPerPage: number, 
  paginationCursor: PaginationCursor<Client> | undefined
) => {
  const query = supabase.from("client").select("id");

  if (filter.nameLike) {
    const filterWords = filter.nameLike.split(" ");
    filterWords.forEach((word) => query.ilike("name", `%${word}%`));
  }
  if (filter.emailLike) {
    query.ilike("email", `%${filter.emailLike}%`);
  }
  if (filter.mobileLike) {
    query.ilike("mobile", filter.mobileLike);
  }

  addBaseDataFilters(query, filter);
  if (paginationCursor) {
    addPaginationCursorFilter(query, sortConfig, paginationCursor);
  }
  addOrdering(query, sortConfig);
  query.limit(recordsPerPage);

    return query;
}
const buildSearchContractIdsQuery = (
  filter: ContractFilter,
  sortConfig: SortConfig<Contract>,
  recordsPerPage: number,
  paginationCursor: PaginationCursor<Contract> | undefined,
) => {
  const query = supabase.from("contract").select("id");

  if (filter.propertyEq) {
    query.eq("property", filter.propertyEq);
  }
  if (filter.clientEq) {
    query.eq("client", filter.clientEq);
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

  addBaseDataFilters(query, filter);
  if (paginationCursor) {
    addPaginationCursorFilter(query, sortConfig, paginationCursor);
  }
  addOrdering(query, sortConfig);
  query.limit(recordsPerPage);

    return query;
}

// property
let propertyChannel = undefined as RealtimeChannel | undefined;
const searchPropertyIds = async (
  filter: PropertyFilter,
  sortConfig: SortConfig<Property>,
  recordsPerPage: number,
  paginationCursor: PaginationCursor<Property> | undefined,
): Promise<OperationResponse<Array<Property["id"]>>> => {
  console.log(`supabase -> searchPropertyIds - 
    filter: ${JSON.stringify(filter)} 
    sortConfig: ${JSON.stringify(sortConfig)} 
    recordsPerPage: ${recordsPerPage}
    paginationCursor: ${JSON.stringify(paginationCursor)}`
  );
  const query = buildSearchPropertyIdsQuery(filter, sortConfig, recordsPerPage, paginationCursor);
  const { data, error } = await query;

  if (error) {
    const e = new Error(`searchPropertyIds -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  const propertyIds = data.map((idObj) => idObj.id);

  console.log(`searchPropertyIds - 
    return: ${propertyIds}`);
  return { data: propertyIds };
};
const getProperties = async (
  propertyIds: Array<Property["id"]>
): Promise<OperationResponse<Array<Property>>> => {
  console.log(`supabase -> getProperties - 
    propertyIds: ${propertyIds}`);
  const { data, error } = await supabase
    .from("property")
    .select()
    .in("id", propertyIds);

  if (error) {
    const e = new Error(`getProperties -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  console.log(`getProperties -> 
    return: ${JSON.stringify(data)}`);
  return { data };
};
const createProperty = async (
  newPropertyData: CreatePropertyDTO
): Promise<OperationResponse> => {
  console.log(`supabase -> createProperty ${newPropertyData.address}`);
  const { error } = await supabase.from("property").insert(newPropertyData);

  if (error) {
    const e = new Error(`createProperty -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data: undefined };
};
const updateProperty = async (
  propertyId: Property["id"],
  updateData: UpdatePropertyDTO
): Promise<OperationResponse> => {
  console.log(`supabase -> updateProperty ${propertyId}`);
  const { error } = await supabase
    .from("property")
    .update(updateData)
    .eq("id", propertyId);

  if (error) {
    const e = new Error(`updateProperty -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data: undefined };
};
const deleteProperty = async (
  propertyId: Property["id"]
): Promise<OperationResponse> => {
  console.log(`supabase -> deleteProperty ${propertyId}`);
  const { error } = await supabase
    .from("property")
    .delete()
    .eq("id", propertyId);

  if (error) {
    const e = new Error(`deleteProperty -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data: undefined };
};
const invalidateProperties = async (
  propertyIds: Array<Property["id"]>,
  timestamp: number
): Promise<OperationResponse<Array<Property["id"]>>> => {
  console.log(`supabase -> invalidateProperties ${propertyIds}`);

  if (propertyIds.length === 0) {
    return { data: [] };
  }

  const { data, error } = await supabase
    .from("property")
    .select("id")
    .in("id", propertyIds)
    .or(`updatedAt.is.NULL,updatedAt.lt.${timestamp}`);

  if (error) {
    const e = new Error(`invalidateProperties -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  const validIds = data.map((property) => property.id);
  return { data: validIds };
};
const propertiesSubscribe = async (
  newPropertyHandler: (newProperty: Property) => void,
  updatedPropertyHandler: (updatedProperty: Property) => void,
  deletedPropertyHandler: (deletedProperty: Property) => void
): Promise<OperationResponse> => {
  console.log(`supabase -> propertiesSubscribe`);

  if (propertyChannel) {
    console.log(
      `propertiesSubscribe -> Already subscribed: unsubscribing first`
    );
    const { error } = await propertiesUnsubscribe();
    if (error) {
      const e = new Error(`propertiesSubscribe -> error: ${error.message}`);
      console.log(e);
      return { error: e };
    }
  }

  propertyChannel = supabase
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
      const e = new Error(`propertiesSubscribe -> error: ${err.message}`);
      console.log(e);
      return { error: e };
    }
  });

  return { data: undefined };
};
const propertiesUnsubscribe = async (): Promise<OperationResponse> => {
  console.log(`supabase -> propertiesUnsubscribe`);

  if (!propertyChannel) {
    console.log(`propertiesUnsubscribe -> Already unsubscribed`);
    return { data: undefined };
  }

  supabase
    .removeChannel(propertyChannel)
    .then(() => {
      propertyChannel = undefined;
      return { data: undefined };
    })
    .catch((err) => {
      const e = new Error(`propertiesUnsubscribe -> error: ${err.message}`);
      console.log(e);
      return { error: e };
    });

  return { data: undefined };
};

// realtor
let realtorChannel = undefined as RealtimeChannel | undefined;
const searchRealtorIds = async (
  filter: RealtorFilter,
  sortConfig: SortConfig<Realtor>,
  recordsPerPage: number,
  paginationCursor: PaginationCursor<Realtor> | undefined,
): Promise<OperationResponse<Array<Realtor["id"]>>> => {
  console.log(`supabase -> searchRealtorIds - 
    filter: ${JSON.stringify(filter)} 
    sortConfig: ${JSON.stringify(sortConfig)} 
    recordsPerPage: ${recordsPerPage}
    paginationCursor: ${JSON.stringify(paginationCursor)}`
  );
  const query = buildSearchRealtorIdsQuery(filter, sortConfig, recordsPerPage, paginationCursor);
  const { data, error } = await query;

  if (error) {
    const e = new Error(`searchRealtorIds -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  const realtorIds = data.map((idObj) => idObj.id);
  console.log(`searchRealtorIds - 
    return: ${realtorIds}`);
  return { data: realtorIds };
};
const getRealtors = async (
  realtorIds: Array<Realtor["id"]>
): Promise<OperationResponse<Array<Realtor>>> => {
  console.log(`supabase -> getRealtors realtorIds: ${realtorIds}`);
  const { data, error } = await supabase
    .from("realtor")
    .select()
    .in("id", realtorIds);

  if (error) {
    const e = new Error(`getRealtors -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data };
};
const createRealtor = async (
  newRealtorData: CreateRealtorDTO
): Promise<OperationResponse> => {
  console.log(`supabase -> createRealtor ${newRealtorData.name}`);
  const { error } = await supabase.from("realtor").insert(newRealtorData);

  if (error) {
    const e = new Error(`createRealtor -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data: undefined };
};
const updateRealtor = async (
  realtorId: Realtor["id"],
  updateData: UpdateRealtorDTO
): Promise<OperationResponse> => {
  console.log(`supabase -> updateRealtor ${realtorId}`);
  const { error } = await supabase
    .from("realtor")
    .update(updateData)
    .eq("id", realtorId);

  if (error) {
    const e = new Error(`updateRealtor -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data: undefined };
};
const deleteRealtor = async (
  realtorId: Realtor["id"]
): Promise<OperationResponse> => {
  console.log(`supabase -> deleteRealtor ${realtorId}`);
  const { error } = await supabase.from("realtor").delete().eq("id", realtorId);

  if (error) {
    const e = new Error(`deleteRealtor -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data: undefined };
};
const invalidateRealtors = async (
  realtorIds: Array<Realtor["id"]>,
  timestamp: number
): Promise<OperationResponse<Array<Realtor["id"]>>> => {
  console.log(`supabase -> invalidateRealtors ${realtorIds}`);

  if (realtorIds.length === 0) {
    return { data: [] };
  }

  const { data, error } = await supabase
    .from("realtor")
    .select("id")
    .in("id", realtorIds)
    .or(`updatedAt.is.NULL,updatedAt.lt.${timestamp}`);

  if (error) {
    const e = new Error(`invalidateRealtors -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  const validIds = data.map((realtor) => realtor.id);
  return { data: validIds };
};
const realtorsSubscribe = async (
  newRealtorHandler: (newRealtor: Realtor) => void,
  updatedRealtorHandler: (updatedRealtor: Realtor) => void,
  deletedRealtorHandler: (deletedRealtor: Realtor) => void
): Promise<OperationResponse> => {
  console.log(`supabase -> realtorsSubscribe`);

  if (realtorChannel) {
    console.log(`realtorsSubscribe -> Already subscribed: unsubscribing first`);
    const { error } = await realtorsUnsubscribe();
    if (error) {
      const e = new Error(`realtorsSubscribe -> error: ${error.message}`);
      console.log(e);
      return { error: e };
    }
  }

  realtorChannel = supabase
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
      const e = new Error(`realtorsSubscribe -> error: ${err.message}`);
      console.log(e);
      return { error: e };
    }
  });

  return { data: undefined };
};
const realtorsUnsubscribe = async (): Promise<OperationResponse> => {
  console.log(`supabase -> realtorsUnsubscribe`);

  if (!realtorChannel) {
    console.log(`realtorsUnsubscribe -> Already unsubscribed`);
    return { data: undefined };
  }

  supabase
    .removeChannel(realtorChannel)
    .then(() => {
      realtorChannel = undefined;
      return { data: undefined };
    })
    .catch((err) => {
      const e = new Error(`realtorsUnsubscribe -> error: ${err.message}`);
      console.log(e);
      return { error: e };
    });

  return { data: undefined };
};

// client
let clientChannel = undefined as RealtimeChannel | undefined;
const searchClientIds = async (
  filter: ClientFilter,
  sortConfig: SortConfig<Client>,
  recordsPerPage: number,
  paginationCursor: PaginationCursor<Client> | undefined,
): Promise<OperationResponse<Array<Client["id"]>>> => {
  console.log(`supabase -> searchClientIds - 
    filter: ${JSON.stringify(filter)} 
    sortConfig: ${JSON.stringify(sortConfig)} 
    recordsPerPage: ${recordsPerPage}
    paginationCursor: ${JSON.stringify(paginationCursor)}`
  );
  const query = buildSearchClientIdsQuery(filter, sortConfig, recordsPerPage, paginationCursor);
  const { data, error } = await query;

  if (error) {
    const e = new Error(`searchClientIds -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  const clientIds = data.map((idObj) => idObj.id);
  console.log(`searchRealtorIds - 
    return: ${clientIds}`);
  return { data: clientIds };
};
const getClients = async (
  clientIds: Array<Client["id"]>
): Promise<OperationResponse<Array<Client>>> => {
  console.log(`supabase -> getClients clientIds: ${clientIds}`);
  const { data, error } = await supabase
    .from("client")
    .select()
    .in("id", clientIds);

  if (error) {
    const e = new Error(`getClients -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data };
};
const createClient = async (
  newClientData: CreateClientDTO
): Promise<OperationResponse> => {
  console.log(`supabase -> createClient ${newClientData.name}`);
  const { error } = await supabase.from("client").insert(newClientData);

  if (error) {
    const e = new Error(`createClient -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data: undefined };
};
const updateClient = async (
  clientId: Client["id"],
  updateData: UpdateClientDTO
): Promise<OperationResponse> => {
  console.log(`supabase -> updateClient - clientId: ${clientId}`);
  const { error } = await supabase
    .from("client")
    .update(updateData)
    .eq("id", clientId);

  if (error) {
    const e = new Error(`updateClient -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data: undefined };
};
const deleteClient = async (
  clientId: Client["id"]
): Promise<OperationResponse> => {
  console.log(`supabase -> deleteClient - clientId: ${clientId}`);
  const { error } = await supabase.from("client").delete().eq("id", clientId);

  if (error) {
    const e = new Error(`deleteClient -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data: undefined };
};
const invalidateClients = async (
  clientIds: Array<Client["id"]>,
  timestamp: number
): Promise<OperationResponse<Array<Client["id"]>>> => {
  console.log(`supabase -> invalidateClients - clientIds: ${clientIds}`);

  if (clientIds.length === 0) {
    return { data: [] };
  }

  const { data, error } = await supabase
    .from("client")
    .select("id")
    .in("id", clientIds)
    .or(`updatedAt.is.NULL,updatedAt.lt.${timestamp}`);

  if (error) {
    const e = new Error(`invalidateClients -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  const validIds = data.map((client) => client.id);
  return { data: validIds };
};
const clientsSubscribe = async (
  newClientHandler: (newClient: Client) => void,
  updatedClientHandler: (updatedClient: Client) => void,
  deletedClientHandler: (deletedClient: Client) => void
): Promise<OperationResponse> => {
  console.log(`supabase -> clientsSubscribe`);

  if (clientChannel) {
    console.log(`clientsSubscribe -> Already subscribed: unsubscribing first`);
    const { error } = await clientsUnsubscribe();

    if (error) {
      const e = new Error(`clientsSubscribe -> error: ${error.message}`);
      console.log(e);
      return { error: e };
    }
  }

  clientChannel = supabase
    .channel("realtime-clients")
    .on(
      "postgres_changes",
      { event: "INSERT", table: "client", schema: "public" },
      (payload) => newClientHandler(payload.new as Client)
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", table: "client", schema: "public" },
      (payload) => updatedClientHandler(payload.new as Client)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", table: "client", schema: "public" },
      (payload) => deletedClientHandler(payload.old as Client)
    );

  clientChannel.subscribe((_status, err) => {
    if (err) {
      clientChannel = undefined;
      const e = new Error(`clientsSubscribe -> error: ${err.message}`);
      console.log(e);
      return { error: e };
    }
  });

  return { data: undefined };
};
const clientsUnsubscribe = async (): Promise<OperationResponse> => {
  console.log(`supabase -> clientsUnsubscribe`);

  if (!clientChannel) {
    console.log(`clientsUnsubscribe -> Already unsubscribed`);
    return { data: undefined };
  }

  supabase
    .removeChannel(clientChannel)
    .then(() => {
      clientChannel = undefined;
      return { data: undefined };
    })
    .catch((err) => {
      const e = new Error(`clientsUnsubscribe -> error: ${err.message}`);
      console.log(e);
      return { error: e };
    });

  return { data: undefined };
};

// contract
let contractChannel = undefined as RealtimeChannel | undefined;
const searchContractIds = async (
  filter: ContractFilter,
  sortConfig: SortConfig<Contract>,
  recordsPerPage: number,
  paginationCursor: PaginationCursor<Contract> | undefined,
): Promise<OperationResponse<Array<Contract["id"]>>> => {
  console.log(`supabase -> searchContractIds - 
    filter: ${JSON.stringify(filter)} 
    sortConfig: ${JSON.stringify(sortConfig)} 
    recordsPerPage: ${recordsPerPage}
    paginationCursor: ${JSON.stringify(paginationCursor)}`
  );
  const query = buildSearchContractIdsQuery(filter, sortConfig, recordsPerPage, paginationCursor);
  const { data, error } = await query;

  if (error) {
    const e = new Error(`searchContractIds -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  const contractIds = data.map((idObj) => idObj.id);
  console.log(`searchRealtorIds - 
    return: ${contractIds}`);
  return { data: contractIds };
};
const getContracts = async (
  contractIds: Array<Contract["id"]>
): Promise<OperationResponse<Array<Contract>>> => {
  console.log(`supabase -> getContracts contractIds: ${contractIds}`);
  const { data, error } = await supabase
    .from("contract")
    .select()
    .in("id", contractIds);

  if (error) {
    const e = new Error(`getContracts -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data };
};
const createContract = async (
  newContractData: CreateContractDTO
): Promise<OperationResponse> => {
  console.log(
    `supabase -> createContract property: ${newContractData.property} client: ${newContractData.client}`
  );
  const { error } = await supabase.from("contract").insert(newContractData);

  if (error) {
    const e = new Error(`createContract -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data: undefined };
};
const updateContract = async (
  contractId: Contract["id"],
  updateData: UpdateContractDTO
): Promise<OperationResponse> => {
  console.log(`supabase -> updateContract ${contractId}`);
  const { error } = await supabase
    .from("contract")
    .update(updateData)
    .eq("id", contractId);

  if (error) {
    const e = new Error(`updateContract -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data: undefined };
};
const deleteContract = async (
  contractId: Contract["id"]
): Promise<OperationResponse> => {
  console.log(`supabase -> deleteContract ${contractId}`);
  const { error } = await supabase
    .from("contract")
    .delete()
    .eq("id", contractId);

  if (error) {
    const e = new Error(`deleteContract -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  return { data: undefined };
};
const invalidateContracts = async (
  contractIds: Array<Contract["id"]>,
  timestamp: number
): Promise<OperationResponse<Array<Contract["id"]>>> => {
  console.log(`supabase -> invalidateContracts ${contractIds}`);

  if (contractIds.length === 0) {
    return { data: [] };
  }

  const { data, error } = await supabase
    .from("contract")
    .select("id")
    .in("id", contractIds)
    .or(`updatedAt.is.NULL,updatedAt.lt.${timestamp}`);

  if (error) {
    const e = new Error(`invalidateContracts -> error: ${error.message}`);
    console.log(e);
    return { error: e };
  }

  const validIds = data.map((contract) => contract.id);
  return { data: validIds };
};
const contractsSubscribe = async (
  newContractHandler: (newContract: Contract) => void,
  updatedContractHandler: (updatedContract: Contract) => void,
  deletedContractHandler: (deletedContract: Contract) => void
): Promise<OperationResponse> => {
  console.log(`supabase -> contractsSubscribe`);

  if (contractChannel) {
    console.log(
      `contractsSubscribe -> Already subscribed: unsubscribing first`
    );
    const { error } = await contractsUnsubscribe();
    if (error) {
      const e = new Error(`contractsSubscribe -> error: ${error.message}`);
      console.log(e);
      return { error: e };
    }
  }

  contractChannel = supabase
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
      const e = new Error(`contractsSubscribe -> error: ${err.message}`);
      console.log(e);
      return { error: e };
    }
  });

  return { data: undefined };
};
const contractsUnsubscribe = async (): Promise<OperationResponse> => {
  console.log(`supabase -> contractsUnsubscribe`);

  if (!contractChannel) {
    console.log(`contractsUnsubscribe -> Already unsubscribed`);
    return { data: undefined };
  }

  supabase
    .removeChannel(contractChannel)
    .then(() => {
      contractChannel = undefined;
      return { data: undefined };
    })
    .catch((err) => {
      const e = new Error(`contractsUnsubscribe -> error: ${err.message}`);
      console.log(e);
      return { error: e };
    });

  return { data: undefined };
};

export const supabaseApi: BackendApi = {
  //client
  searchClientIds,
  getClients,
  createClient,
  updateClient,
  deleteClient,
  invalidateClients,
  clientsSubscribe,
  clientsUnsubscribe,
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
