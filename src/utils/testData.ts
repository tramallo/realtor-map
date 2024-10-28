import { Person, Property, Realtor } from "./domainSchemas";

export const testPersons: Person[] = [
    { id: 'juan-id', name: "Juan", createdBy: 'albert', createdAt: 'sometime' },
    { id: 'pedro-id', name: "Pedro", mobile: "091234567", createdBy: 'albert', createdAt: 'sometime' },
    { id: 'maria-id', name: "Maria", email: "maria@mail.com", createdBy: 'albert', createdAt: 'sometime' }
]

export const testRealtors: Realtor[] = [
    { id: 'gabana-id', name: "Gabana", createdBy: 'albert', createdAt: 'sometime' },
    { id: 'larrañaga-id', name: "Larrañaga", createdBy: 'albert', createdAt: 'sometime' },
    { id: 'duran-id', name: "Duran y Piastri", createdBy: 'albert', createdAt: 'sometime' }
]

export const testProperties: Property[] = [
    { id: 'brasil-id', address: 'Brasil 565, 50000 Salto', coordinates: {lat: -31.3858893, lng: -57.968332}, type: 'house', createdBy: 'albert', createdAt: 'sometime' },
    { id: 'liber-id', address: "Av. Gral. Liber Seregni 2401, Salto", coordinates: { lat: -31.3641522, lng: -57.9576805 }, type: 'apartment', createdBy: 'albert', createdAt: 'sometime' },
    { id: 'uruguay-id', address: 'Uruguay 245, Salto', coordinates: {lat: -31.3864893, lng: -57.9732854}, type: 'house', createdBy: 'albert', createdAt: 'sometime' }
]