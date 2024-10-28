import { Person, Property, Realtor } from "./domainSchemas";

export const testPersons: Person[] = [
    { name: "Juan" },
    { name: "Pedro", mobile: "091234567" },
    { name: "Maria", email: "maria@mail.com" }
]

export const testRealtors: Realtor[] = [
    { name: "Gabana" },
    { name: "Larrañaga" },
    { name: "Duran y Piastri" }
]

export const testProperties: Property[] = [
    { address: 'Brasil 565, 50000 Salto', coordinates: {lat: -31.3858893, lng: -57.968332}, type: 'house' },
    { address: "Av. Gral. Liber Seregni 2401, Salto", coordinates: { lat: -31.3641522, lng: -57.9576805 }, type: 'apartment' },
    { address: 'Uruguay 245, Salto', coordinates: {lat: -31.3864893, lng: -57.9732854}, type: 'house' }
]