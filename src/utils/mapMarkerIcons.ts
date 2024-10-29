/** This file exposes different Leaflet Marker icons 
 * and a function that returns the corresponding incon for the provided Property
 */
import { BaseIconOptions, Icon } from "leaflet";

import { Property } from "./domainSchemas";

const defaultIconSizes = {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
} as BaseIconOptions

/** Maps properties to icons, returns an icon based on the property type
 * 
 * @param property: Property object for which to get the corresponding icon
 * @returns: An Icon based on the property type, or the blank icon if property type is not registered
 */
export const getIconForProperty = (property: Property): Icon => {
    if (property.type == 'house') {
        return houseMarkerIcon;
    }
    if (property.type == 'apartment') {
        return apartmentMarkerIcon;
    }

    return redBlankMarkerIcon;
}

export const redBlankMarkerIcon = new Icon({
    iconUrl: "map-marker-icons/red-blank-marker-icon.png",
    ...defaultIconSizes
})

export const searchMarkerIcon = new Icon({
    iconUrl: "map-marker-icons/search-marker-icon.png",
    ...defaultIconSizes,
});

export const houseMarkerIcon = new Icon({
    iconUrl: "map-marker-icons/house-marker-icon.png",
    ...defaultIconSizes
})

export const apartmentMarkerIcon = new Icon({
    iconUrl: "map-marker-icons/apartment-marker-icon.png",
    ...defaultIconSizes
})
