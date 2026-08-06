import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { MapSurface } from "@/components/organisms/MapSurface";

describe("MapSurface", () => {
  it("renders its background and children without crashing", async () => {
    const { getByText, toJSON } = await render(
      <MapSurface background={<Text>background</Text>}>
        <Text>pin</Text>
      </MapSurface>,
    );

    expect(getByText("background")).toBeTruthy();
    expect(getByText("pin")).toBeTruthy();
    expect(toJSON()).not.toBeNull();
  });
});
