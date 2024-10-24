export interface Person {
    name: string;
    mobile?: string;
    email?: string;
}

export interface Realtor {
    name: string
}

export interface Coordinates {
    lat: number;
    lng: number;
}

export type PropertyState = 'rented' | 'available' | 'reserved';
export type PropertyType = 'house' | 'apartment';

export interface Property {
    address: string;
    type: PropertyType;
    coordinates: Coordinates;
    description?: string;
    state?: PropertyState;
    owner?: Person;
    realtors?: Realtor[];
    exclusive?: Realtor;
}

export interface ShowingAppointment {
    property: Property;
    agent: Person;
    client: Person;
    dateTime: Date;
}