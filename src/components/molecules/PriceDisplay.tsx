import { View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import {
  cheapestPrice,
  preferredPriceBreakdown,
} from "@/services/motus/stationDisplay";
import type { Price } from "@/services/motus/types";

export interface PriceDisplayProps {
  prices: Price[];
  preferredFuels: string[];
}

/**
 * Renders a station's price summary for list rows: a single "cheapest
 * price" when 0 or 1 fuel is preferred (current default behavior), or one
 * labelled line per preferred fuel when 2+ are selected — "quando ne
 * seleziono più di uno vedrei diversi prezzi con la specifica del tipo di
 * carburante" (Task 19 follow-up). Falls back to the single cheapest line
 * if none of the preferred fuels match anything at this station, so a
 * preference never collapses a real row to nothing.
 */
export function PriceDisplay({ prices, preferredFuels }: PriceDisplayProps) {
  if (preferredFuels.length > 1) {
    const breakdown = preferredPriceBreakdown(prices, preferredFuels);
    if (breakdown.length > 0) {
      return (
        <View className="items-end gap-xs">
          {breakdown.map((line) => (
            <View key={line.fuel} className="items-end">
              <AppText variant="caption" color="muted">
                {line.fuel}
              </AppText>
              <AppText variant="caption">{line.priceLabel}</AppText>
            </View>
          ))}
        </View>
      );
    }
  }

  const price = cheapestPrice(prices, preferredFuels);
  return price ? <AppText variant="caption">{price}</AppText> : null;
}
