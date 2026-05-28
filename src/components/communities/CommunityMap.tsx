"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, NavigationControl, type MapRef } from "react-map-gl/mapbox";
import Supercluster from "supercluster";
import { spreadColocatedCoordinates } from "@/lib/map-marker-spread";
import type { CommunityListItem } from "@/lib/types/community";
import { US_MAP_CENTER, US_MAX_BOUNDS } from "@/lib/usMap";
import { CommunityPreviewCard } from "./CommunityPreviewCard";
import styles from "./communities.module.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

type Props = {
  communities: CommunityListItem[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  height?: string | number;
  showPreview?: boolean;
  initialZoom?: number;
  restrictToUS?: boolean;
  /** When false, skip auto-fitting all markers on load (use with selection fly-to). */
  fitAllOnLoad?: boolean;
  /** Zoom level when flying to a selected community. */
  selectedZoom?: number;
};

const DEFAULT_SELECTED_ZOOM = 10;

type ClusterFeature = Supercluster.PointFeature<{
  cluster: boolean;
  communityId: string;
  name: string;
}>;

export function CommunityMap({
  communities,
  selectedId,
  onSelect,
  height = "100%",
  showPreview = true,
  initialZoom,
  restrictToUS = false,
  fitAllOnLoad = true,
  selectedZoom = DEFAULT_SELECTED_ZOOM,
}: Props) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: US_MAP_CENTER.longitude,
    latitude: US_MAP_CENTER.latitude,
    zoom: initialZoom ?? US_MAP_CENTER.zoom,
  });
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(
    null,
  );
  const [zoom, setZoom] = useState(US_MAP_CENTER.zoom);

  const mappable = useMemo(
    () =>
      communities.filter(
        (c): c is CommunityListItem & { latitude: number; longitude: number } =>
          c.latitude != null && c.longitude != null,
      ),
    [communities],
  );

  const displayPositions = useMemo(
    () =>
      spreadColocatedCoordinates(
        mappable.map((c) => ({
          id: c.id,
          longitude: c.longitude,
          latitude: c.latitude,
        })),
        zoom,
      ),
    [mappable, zoom],
  );

  const points = useMemo<ClusterFeature[]>(() => {
    return mappable.map((c) => {
      const pos = displayPositions.get(c.id) ?? {
        longitude: c.longitude,
        latitude: c.latitude,
      };
      return {
        type: "Feature" as const,
        properties: {
          cluster: false,
          communityId: c.id,
          name: c.name,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [pos.longitude, pos.latitude],
        },
      };
    });
  }, [mappable, displayPositions]);

  const index = useMemo(() => {
    const cluster = new Supercluster<{ communityId: string; name: string }>({
      radius: 56,
      maxZoom: 16,
    });
    cluster.load(points);
    return cluster;
  }, [points]);

  const clusters = useMemo(() => {
    if (!bounds) return points;
    return index.getClusters(bounds, Math.floor(zoom)) as ClusterFeature[];
  }, [bounds, zoom, index, points]);

  const selected = useMemo(
    () => communities.find((c) => c.id === selectedId) ?? null,
    [communities, selectedId],
  );

  const handleMove = useCallback(
    (evt: {
      viewState: {
        longitude: number;
        latitude: number;
        zoom: number;
      };
    }) => {
      setViewState(evt.viewState);
      setZoom(evt.viewState.zoom);
    },
    [],
  );

  const flyToSelected = useCallback(() => {
    if (!selected?.latitude || !selected?.longitude) return;
    mapRef.current?.flyTo({
      center: [selected.longitude, selected.latitude],
      zoom: selectedZoom,
      duration: 800,
      essential: true,
    });
  }, [selected, selectedZoom]);

  const zoomToCluster = useCallback(
    (clusterId: number, lng: number, lat: number) => {
      const expansionZoom = index.getClusterExpansionZoom(clusterId);
      const targetZoom = Math.min(
        16,
        Math.max(expansionZoom, Math.floor(zoom) + 1),
      );
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom: targetZoom,
        duration: 500,
        essential: true,
      });
    },
    [index, zoom],
  );

  useEffect(() => {
    if (!fitAllOnLoad || restrictToUS) return;
    if (communities.length === 0) return;
    const lats = communities.map((c) => c.latitude!).filter(Boolean);
    const lngs = communities.map((c) => c.longitude!).filter(Boolean);
    if (lats.length === 0) return;
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    setViewState((prev) => ({
      ...prev,
      longitude: (minLng + maxLng) / 2,
      latitude: (minLat + maxLat) / 2,
      zoom: initialZoom ?? (lats.length === 1 ? 8 : 4),
    }));
  }, [communities, initialZoom, restrictToUS, fitAllOnLoad]);

  useEffect(() => {
    flyToSelected();
  }, [selectedId, flyToSelected]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={styles.status}>
        <p>Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to show the map.</p>
      </div>
    );
  }

  return (
    <div className={styles.mapPane} style={{ height }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        {...viewState}
        onMove={handleMove}
        onMoveEnd={(evt) => {
          const b = evt.target.getBounds();
          if (!b) return;
          setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
        }}
        onLoad={(evt) => {
          const b = evt.target.getBounds();
          if (b) {
            setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
          }
          flyToSelected();
        }}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        reuseMaps
        {...(restrictToUS
          ? { maxBounds: US_MAX_BOUNDS, minZoom: 2.5 }
          : {})}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {clusters.map((feature) => {
          const [lng, lat] = feature.geometry.coordinates;
          const props = feature.properties as {
            cluster?: boolean;
            cluster_id?: number;
            point_count?: number;
            communityId?: string;
            name?: string;
          };
          const isCluster = Boolean(props.cluster);
          const count = isCluster ? (props.point_count ?? 1) : 1;

          if (isCluster) {
            const clusterId = props.cluster_id ?? Number(feature.id);
            return (
              <Marker
                key={`cluster-${feature.id}`}
                longitude={lng}
                latitude={lat}
                anchor="center"
              >
                <button
                  type="button"
                  aria-label={`${count} communities — zoom in`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    zoomToCluster(clusterId, lng, lat);
                  }}
                  style={{
                    width: 36 + Math.min(count, 20),
                    height: 36 + Math.min(count, 20),
                    borderRadius: "50%",
                    background: "#7b8f82",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "2px solid #fcfaf5",
                    boxShadow: "0 4px 12px rgba(42,52,46,0.2)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {count}
                </button>
              </Marker>
            );
          }

          const id = props.communityId!;
          const active = selectedId === id;
          return (
            <Marker
              key={id}
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onSelect?.(id);
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: active ? "#4a6356" : "#7b8f82",
                  border: "2px solid #fcfaf5",
                  boxShadow: "0 2px 8px rgba(42,52,46,0.25)",
                  cursor: "pointer",
                }}
                title={props.name}
              />
            </Marker>
          );
        })}
      </Map>

      {showPreview && selected && (
        <CommunityPreviewCard
          item={selected}
          onClose={() => onSelect?.(null)}
        />
      )}
    </div>
  );
}
