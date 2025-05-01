import { useEffect, useRef, memo, ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { useMap } from "react-leaflet";
import L, { ControlPosition } from "leaflet";

export interface MapComponentProps {
  children: ReactNode;
  position: ControlPosition;
  customMargin?: string;
}

export function MapComponent({
  children,
  position,
  customMargin,
}: MapComponentProps) {
  const rootRef = useRef<ReactDOM.Root | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlRef = useRef<L.Control | null>(null);
  const mountedRef = useRef(false);

  const map = useMap();

  //addControlsToMap effect
  useEffect(() => {
    mountedRef.current = true;
    if (controlRef.current) return;

    console.log(`MapContols -> effect [addControlsToMap]`);

    const CustomControl = L.Control.extend({
      onAdd: () => {
        containerRef.current = L.DomUtil.create(
          "div",
          "leaflet-control-custom"
        );
        containerRef.current.style.margin = customMargin ?? "0";

        return containerRef.current;
      },
    });

    controlRef.current = new CustomControl({ position });
    map.addControl(controlRef.current);

    return () => {
      console.log(`MapContols -> effect [addControlsToMap] remove controls`);

      mountedRef.current = false;

      if (controlRef.current) {
        map.removeControl(controlRef.current);

        //avoid race condition by deferring the root unmount to the next frame
        setTimeout(() => {
          if (!mountedRef.current && rootRef.current) {
            rootRef.current.unmount();
            rootRef.current = null;
            containerRef.current = null;
          }
        }, 0);
      }
    };
  }, [map, position, customMargin]);

  //renderControls effect
  useEffect(() => {
    if (!containerRef.current || !mountedRef.current) return;

    console.log(`MapControls -> effect [renderControls]`);

    if (!rootRef.current) {
      rootRef.current = ReactDOM.createRoot(containerRef.current);
    }

    rootRef.current.render(children);
  }, [children]);

  return null;
}

export const MemoMapComponent = memo(MapComponent);
