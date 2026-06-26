import React from "react";
import { KakaoMapView } from "@/components/KakaoMapView";

interface ArtisanMapProps {
  latitude: number;
  longitude: number;
  artisanName: string;
  address?: string;
}

export function ArtisanMap({ latitude, longitude, artisanName, address }: ArtisanMapProps) {
  return (
    <KakaoMapView
      latitude={latitude}
      longitude={longitude}
      address={address}
      height={200}
      markerTitle={artisanName}
    />
  );
}
