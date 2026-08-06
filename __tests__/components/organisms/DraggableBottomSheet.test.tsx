import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { DraggableBottomSheet } from "@/components/organisms/DraggableBottomSheet";

describe("DraggableBottomSheet", () => {
  it("renders the header and children without crashing", async () => {
    const { getByText, toJSON } = await render(
      <DraggableBottomSheet header={<Text>header</Text>} collapsedTravel={200}>
        <Text>content</Text>
      </DraggableBottomSheet>,
    );

    expect(getByText("header")).toBeTruthy();
    expect(getByText("content")).toBeTruthy();
    expect(toJSON()).not.toBeNull();
  });

  it("takes no fixed height of its own, so its content decides how tall it is", async () => {
    const { toJSON } = await render(
      <DraggableBottomSheet header={<Text>header</Text>} collapsedTravel={0}>
        <Text>content</Text>
      </DraggableBottomSheet>,
    );

    const root = toJSON();
    const style = Array.isArray(root) ? undefined : root?.props?.style;
    const flattened = (Array.isArray(style) ? style : [style])
      .filter(Boolean)
      .reduce((merged, entry) => ({ ...merged, ...entry }), {});

    // A measured height here would mean measuring the sheet to size the
    // sheet — the layout feedback loop that made it tremble at rest.
    expect(flattened).not.toHaveProperty("height");
  });
});
