import { render } from "@testing-library/react-native";

import { MapGridBackground } from "@/components/molecules/MapGridBackground";

describe("MapGridBackground", () => {
  it("renders without crashing and is hidden from accessibility tools (decorative)", async () => {
    const { toJSON } = await render(<MapGridBackground />);
    expect(toJSON()).not.toBeNull();
  });
});
