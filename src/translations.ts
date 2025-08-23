import { Locale } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";

export type AppTranslation = {
    titles: { 
        //client
        newClient: string,
        viewClient: string, 
        selectClient: string,
        updateClient: string,
        deleteClient: string,
        restoreClient: string,
        //contract
        newContract: string,
        viewContract: string,
        contractsAtDay: string,
        deleteContract: string,
        updateContract: string,
        restoreContract: string,
        //property
        newProperty: string,
        viewProperty: string,
        selectProperty: string,
        deleteProperty: string,
        updateProperty: string,
        //realtor
        newRealtor: string,
        viewRealtor: string,
        selectRealtor: string,
        deleteRealtor: string,
        updateRealtor: string,
        //misc
        selectLocation: string,
    },
    layouts: {
        clients: { label: string },
        contracts: { label: string },
        properties: { label: string },
        realtors: { label: string },
    },
    fields: {
        emailField: { label: string },
        passwordField: { label: string },
        languageField: { label: string },
        addressField: { label: string },
        selectedField: { label: string },
        searchLabel: { text: string },
    },
    buttons: {
        //common
        loginButton: { label: string },
        logoutButton: { label: string },
        selectButton: { label: string },
        confirmButton: { label: string },
        deleteButton: { label: string },
        restoreButton: { label: string },
        updateButton: { label: string },
        viewButton: { label: string },
        submitButton: { label: string },
        //by entity
        newClientButton: { label: string },
        newContractButton: { label: string },
        newPropertyButton: { label: string },
        newRealtorButton: { label: string },
    },
    errorMessages: {
        //client
        clientNotFound: string, 
        clientNotCreated: string,
        clientNotDeleted: string,
        clientNotRestored: string,
        clientNotUpdated: string,
        //contract 
        contractNotFound: string,
        contractNotCreated: string,
        contractNotDeleted: string,
        contractNotRestored: string,
        contractNotUpdated: string,
        //property
        propertyNotFound: string,
        propertyNotCreated: string,
        propertyNotDeleted: string,
        propertyNotRestored: string,
        propertyNotUpdated: string,
        //realtor
        realtorNotFound: string,
        realtorNotCreated: string,
        realtorNotDeleted: string,
        realtorNotRestored: string,
        realtorNotUpdated: string,
    },
    notifications: {
        //client
        clientCreated: string,
        clientDeleted: string,
        clientRestored: string,
        clientUpdated: string,
        //contract
        contractCreated: string,
        contractDeleted: string,
        contractRestored: string,
        contractUpdated: string,
        //property
        propertyCreated: string,
        propertyDeleted: string,
        propertyRestored: string,
        propertyUpdated: string,
        //realtor
        realtorCreated: string,
        realtorDeleted: string,
        realtorRestored: string,
        realtorUpdated: string,
    }
    entities: {
        base: {
            id: string,
            createdBy: string,
            createdAt: string,
            updatedBy: string,
            updatedAt: string,
            deleted: string,
            filter: {
                idEq: string, 
                createdByEq: string, 
                createdBefore: string, 
                createdAfter: string, 
                updatedByEq: string,
                updatedBefore: string,
                updatedAfter: string,
                deletedEq: string,
            }
        },
        client: {
            name: string,
            mobile: string,
            email: string,
            filter: {
                nameLike: string,
                mobileLike: string,
                emailLike: string,
            }
        }
        contract: {
            property: string,
            client: string,
            start: string,
            end: string,
            description: string,
            filter: {
                propertyEq: string,
                clientEq: string,
                startBefore: string,
                startAfter: string,
                endBefore: string,
                endAfter: string,
            }
        },
        property: {
            address: string,
            coordinates: string,
            type: string,
            state: string,
            owner: string,
            description: string,
            exclusiveRealtor: string,
            relatedRealtorIds: string,
            filter: {
                addressLike: string,
                typeEq: string,
                stateEq: string,
                ownerEq: string,
                exclusiveRealtorEq: string,
                relatedRealtorIdsHas: string,
            }
        },
        realtor: {
            name: string,
            filter: {
                nameLike: string,
            }
        }
    }
}

export const supportedLanguages = ["en", "es"] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export const supportedLocales: Record<SupportedLanguage, Locale> = {
    en: enUS,
    es: es,
}

type TranslationNamespace = {
    // default namespace
    translation: AppTranslation
}

export const translations: Record<SupportedLanguage, TranslationNamespace> = {
    "en": {
        translation: { 
            titles: {
                //client 
                newClient: "New client",
                viewClient: "View client", 
                selectClient: "Select client(s)",
                deleteClient: "Delete client",
                restoreClient: "Restore client",
                updateClient: "Update client",
                //contract
                newContract: "New contract",
                viewContract: "View contract",
                contractsAtDay: "Contracts at {{dateString, string}}",
                deleteContract: "Delete contract",
                updateContract: "Update contract",
                restoreContract: "Restore contract",
                //property
                newProperty: "New property",
                viewProperty: "View property",
                selectProperty: "Select property(es)",
                deleteProperty: "Delete property",
                updateProperty: "Update property",
                //realtor
                newRealtor: "New realtor",
                viewRealtor: "View realtor",
                selectRealtor: "Select realtor(s)",
                deleteRealtor: "Delete realtor",
                updateRealtor: "Update realtor",
                //misc
                selectLocation: "Select location",
            },
            layouts: {
                clients: { label: "Clients" },
                contracts: { label: "Contracts" },
                properties: { label: "Properties" },
                realtors: { label: "Realtors" },
            },
            fields: {
                emailField: { label: "Email" },
                passwordField: { label: "Password" },
                languageField: { label: "Language" },
                addressField: { label: "Address" },
                selectedField: { label: "Selected" },
                searchLabel: { text: "Search" },
            },
            buttons: {
                loginButton: { label: "Log in" },
                logoutButton: { label: "Logout" },
                selectButton: { label: "Select" },
                confirmButton: { label: "Confirm" },
                deleteButton: { label: "Delete" },
                restoreButton: { label: "Restore" },
                updateButton: { label: "Update" },
                viewButton: { label: "View" },
                submitButton: { label: "Submit" },
                newClientButton: { label: "New client" },
                newContractButton: { label: "New contract" },
                newPropertyButton: { label: "New property" },
                newRealtorButton: { label: "New realtor" },
            },
            errorMessages: {
                //client 
                clientNotFound: "Client ({{clientId, number}}) not found", 
                clientNotCreated: "Error. Client not created",
                clientNotDeleted: "Error. Client not deleted",
                clientNotRestored: "Error. Client not restored",
                clientNotUpdated: "Error. Client not updated",
                //contract
                contractNotFound: "Contract ({{contractId, number}}) not found",
                contractNotCreated: "Error. Contract not created",
                contractNotDeleted: "Error. Contract not deleted",
                contractNotRestored: "Error. Contract not restored",
                contractNotUpdated: "Error. Contract not updated",
                //property
                propertyNotFound: "Property ({{propertyId, number}}) not found",
                propertyNotCreated: "Error. Property not created",
                propertyNotDeleted: "Error. Property not deleted",
                propertyNotRestored: "Error. Property not restored",
                propertyNotUpdated: "Error. Property not updated",
                //realtor
                realtorNotFound: "Realtor ({{realtorId, number}}) not found",
                realtorNotCreated: "Error. Realtor not created",
                realtorNotDeleted: "Error. Realtor not deleted",
                realtorNotRestored: "Error. Realtor not restored",
                realtorNotUpdated: "Error. Realtor not updated",
            },
            notifications: {
                //client
                clientCreated: "Client created",
                clientDeleted: "Client deleted",
                clientRestored: "Client restored",
                clientUpdated: "Client updated",
                //contract
                contractCreated: "Contract created",
                contractDeleted: "Contract deleted",
                contractRestored: "Contract restored",
                contractUpdated: "Contract updated",
                //property
                propertyCreated: "Property created",
                propertyDeleted: "Property deleted",
                propertyRestored: "Property restored",
                propertyUpdated: "Property updated",
                //realtor
                realtorCreated: "Realtor created",
                realtorDeleted: "Realtor deleted",
                realtorRestored: "Realtor restored",
                realtorUpdated: "Realtor updated",
            },
            entities: {
                base: {
                    id: "Id",
                    createdBy: "Created by",
                    createdAt: "Created at",
                    updatedBy: "Updated by",
                    updatedAt: "Updated at",
                    deleted: "Deleted",
                    filter: {
                        idEq: "Id", 
                        createdByEq: "Created by", 
                        createdBefore: "Created before", 
                        createdAfter: "Created after", 
                        updatedByEq: "Updated by",
                        updatedBefore: "Updated before",
                        updatedAfter: "Updated after",
                        deletedEq: "Hide deleted",
                    },
                },
                client: {
                    name: "Name",
                    mobile: "Mobile",
                    email: "Email",
                    filter: {
                        nameLike: "Name",
                        mobileLike: "Mobile",
                        emailLike: "Email"
                    }
                },
                contract: {
                    property: "Property",
                    client: "Client",
                    start: "Start",
                    end: "End",
                    description: "Description",
                    filter: {
                        propertyEq: "Property",
                        clientEq: "Client",
                        startBefore: "Start before",
                        startAfter: "Start after",
                        endBefore: "End before",
                        endAfter: "End after"
                    }
                },
                property: {
                    address: "Address",
                    coordinates: "Coordinates",
                    type: "Type",
                    state: "State",
                    owner: "Owner",
                    description: "Description",
                    exclusiveRealtor: "Exclusive realtor",
                    relatedRealtorIds: "Related realtors",
                    filter: {
                        addressLike: "Address",
                        typeEq: "Type",
                        stateEq: "State",
                        ownerEq: "Owner",
                        exclusiveRealtorEq: "Exclusive realtor",
                        relatedRealtorIdsHas: "Associated realtors",
                    }
                },
                realtor: {
                    name: "Name",
                    filter: {
                        nameLike: "Name"
                    }
                }
            },
        }
    },
    "es": {
        translation: {
            titles: { 
                //client
                viewClient: "Ver cliente", 
                selectClient: "Seleccionar cliente(s)",
                newClient: "Nuevo cliente",
                deleteClient: "Borrar cliente",
                restoreClient: "Restaurar cliente",
                updateClient: "Modificar cliente",
                //contract
                newContract: "Nuevo contrato",
                viewContract: "Ver contrato",
                contractsAtDay: "Contratos en {{dateString, string}}",
                deleteContract: "Borrar contrato",
                updateContract: "Modificar contrato",
                restoreContract: "Restaurar contrato",
                //property
                newProperty: "Nuevo inmueble",
                viewProperty: "Ver inmueble",
                selectProperty: "Seleccionar inmueble(s)",
                deleteProperty: "Borrar inmueble",
                updateProperty: "Modificar inmueble",
                //realtor
                newRealtor: "Nueva inmobiliaria",
                viewRealtor: "Ver inmobiliaria",
                selectRealtor: "Seleccionar inmobiliaria(s)",
                deleteRealtor: "Borrar inmobiliaria",
                updateRealtor: "Modificar inmobiliaria",
                //misc
                selectLocation: "Seleccionar ubicación",
            },
            layouts: {
                clients: { label: "Clientes" },
                contracts: { label: "Contratos" },
                properties: { label: "Inmuebles" },
                realtors: { label: "Inmobiliarias" },
            },
            fields: {
                emailField: { label: "Correo" },
                passwordField: { label: "Contraseña" },
                languageField: { label: "Idioma" },
                addressField: { label: "Dirección" },
                selectedField: { label: "Seleccionado(s)" },
                searchLabel: { text: "Buscar" },
            },
            buttons: {
                loginButton: { label: "Iniciar sesión" },
                logoutButton: { label: "Cerrar sesión" },
                selectButton: { label: "Seleccionar" },
                confirmButton: { label: "Confirmar" },
                deleteButton: { label: "Borrar" },
                restoreButton: { label: "Restaurar" },
                updateButton: { label: "Modificar" },
                viewButton: { label: "Ver" },
                submitButton: { label: "Enviar" },
                newClientButton: { label: "Nuevo cliente" },
                newContractButton: { label: "Nuevo contrato" },
                newPropertyButton: { label: "Nuevo inmueble" },
                newRealtorButton: { label: "Nueva inmobiliaria" },
            },
            errorMessages: { 
                //client
                clientNotFound: "Cliente ({{clientId, number}}) no encontrado",
                clientNotCreated: "Error. Cliente no guardado",
                clientNotDeleted: "Error. Cliente no borrado",
                clientNotRestored: "Error. Cliente no restaurado",
                clientNotUpdated: "Error. Cliente no modificado",
                //contract
                contractNotFound: "Contrato ({{contractId, number}}) no encontrado",
                contractNotCreated: "Error. Contrato no guardado",
                contractNotDeleted: "Error. Contrato no borrado",
                contractNotRestored: "Error. Contrato no restaurado",
                contractNotUpdated: "Error. Contrato no modificado",
                //property
                propertyNotFound: "Inmueble ({{propertyId, number}}) no encontrado",
                propertyNotCreated: "Error. Inmueble no guardado",
                propertyNotDeleted: "Error. Inmueble no borrado",
                propertyNotRestored: "Error. Inmueble no restaurado",
                propertyNotUpdated: "Error. Inmueble no modificado",
                //realtor
                realtorNotFound: "Inmobiliaria ({{realtorId, number}}) no encontrada",
                realtorNotCreated: "Error. Inmobiliaria no guardada",
                realtorNotDeleted: "Error. Inmobiliaria no borrada",
                realtorNotRestored: "Error. Inmobiliaria no restaurada",
                realtorNotUpdated: "Error. Inmobiliaria no modificada",
            },
            notifications: {
                //client
                clientCreated: "Cliente guardado",
                clientDeleted: "Cliente borrado",
                clientRestored: "Cliente restaurado",
                clientUpdated: "Cliente modificado",
                //contract
                contractCreated: "Contrato guardado",
                contractDeleted: "Contrato borrado",
                contractRestored: "Contrato restaurado",
                contractUpdated: "Contrato modificado",
                //property
                propertyCreated: "Inmueble guardado",
                propertyDeleted: "Inmueble borrado",
                propertyRestored: "Inmueble restaurado",
                propertyUpdated: "Inmueble modificado",
                //realtor
                realtorCreated: "Inmobiliaria guardada",
                realtorDeleted: "Inmobiliaria borrada",
                realtorRestored: "Inmobiliaria restaurada",
                realtorUpdated: "Inmobiliaria modificada",
            },
            entities: {
                base: {
                    id: "Id",
                    createdBy: "Creado por",
                    createdAt: "Creado en",
                    updatedBy: "Modificado por",
                    updatedAt: "Modificado en",
                    deleted: "Borrado",
                    filter: {
                        idEq: "Id", 
                        createdByEq: "Creado por", 
                        createdBefore: "Creado antes de", 
                        createdAfter: "Creado después de", 
                        updatedByEq: "Modificado por",
                        updatedBefore: "Modificado antes de",
                        updatedAfter: "Modificado después de",
                        deletedEq: "Ocultar eliminados",
                    },
                },
                client: {
                    name: "Nombre",
                    mobile: "Celular",
                    email: "Correo",
                    filter: {
                        nameLike: "Nombre",
                        mobileLike: "Celular",
                        emailLike: "Correo",
                    }
                },
                contract: {
                    property: "Inmueble",
                    client: "Cliente",
                    start: "Inicio",
                    end: "Fin",
                    description: "Descripción",
                    filter: {
                        propertyEq: "Inmueble",
                        clientEq: "Cliente",
                        startBefore: "Inicia antes de",
                        startAfter: "Inicia después de",
                        endBefore: "Finaliza antes de",
                        endAfter: "Finaliza después de"
                    }
                },
                property: {
                    address: "Dirección",
                    coordinates: "Coordenadas",
                    type: "Tipo",
                    state: "Estado",
                    owner: "Propietario",
                    description: "Descripción",
                    exclusiveRealtor: "Inmobiliaria exclusiva",
                    relatedRealtorIds: "Inmobiliarias asociadas",
                    filter: {
                        addressLike: "Dirección",
                        typeEq: "Tipo",
                        stateEq: "Estado",
                        ownerEq: "Propietario",
                        exclusiveRealtorEq: "Inmobiliaria exclusiva",
                        relatedRealtorIdsHas: "Inmobiliarias asociadas",
                    }
                },
                realtor: {
                    name: "Nombre",
                    filter: {
                        nameLike: "Nombre"
                    }
                }
            },
        }
    }
}
