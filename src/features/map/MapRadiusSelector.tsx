import { Pressable, ScrollView, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";

/**
 * Selectable radii, in kilometres. `GET /api/stations/nearby` takes no radius
 * parameter (`api-contract.md`: only `lat`, `lon`, `limit`), so this filters
 * the returned set by each station's own `distance_km` — which the endpoint
 * does return, and sorts by. The largest value is therefore bounded in
 * practice by how many stations the screen asks for.
 */
export const RADIUS_OPTIONS_KM = [1, 3, 5, 10, 20] as const;

export const DEFAULT_RADIUS_KM = 5;

export interface MapRadiusSelectorProps {
  value: number;
  onChange: (radiusKm: number) => void;
}

/** Horizontal chip row picking the map's search radius. */
export function MapRadiusSelector({ value, onChange }: MapRadiusSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-sm px-md"
    >
      {RADIUS_OPTIONS_KM.map((radiusKm) => {
        const selected = radiusKm === value;
        return (
          <Pressable
            key={radiusKm}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`Raggio ${radiusKm} km`}
            onPress={() => onChange(radiusKm)}
            className={`h-9 items-center justify-center rounded-full px-md shadow-sm ${
              selected
                ? "border-thick border-primary bg-primary"
                : "border-thick border-border bg-surface"
            }`}
          >
            <View>
              <AppText
                variant="labelMd"
                color={selected ? "onPrimary" : "foreground"}
              >
                {`${radiusKm} km`}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
