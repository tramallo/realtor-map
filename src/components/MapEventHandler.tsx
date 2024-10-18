import { LeafletEventHandlerFnMap } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function MapEventHandler({ eventMap }: { eventMap: LeafletEventHandlerFnMap }) {
  const map = useMap();

  useEffect(() => {
    map.on(eventMap);

    return () => { map.off(eventMap) }
  }, [map, eventMap])

  return null;
}
