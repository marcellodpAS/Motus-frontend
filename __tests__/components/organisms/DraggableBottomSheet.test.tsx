import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { DraggableBottomSheet } from "@/components/organisms/DraggableBottomSheet";

describe("DraggableBottomSheet", () => {
  it("renders the header and children without crashing", async () => {
    const { getByText, toJSON } = await render(
      <DraggableBottomSheet header={<Text>header</Text>}>
        <Text>content</Text>
      </DraggableBottomSheet>,
    );

    expect(getByText("header")).toBeTruthy();
    expect(getByText("content")).toBeTruthy();
    expect(toJSON()).not.toBeNull();
  });
});
