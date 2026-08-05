import { render } from "@testing-library/react-native";

import { Icon } from "@/components/atoms/Icon";

describe("Icon", () => {
  it("is hidden from accessibility tools by default (decorative)", async () => {
    const { queryByLabelText } = await render(<Icon name="search" />);
    // No accessibilityLabel given -> nothing should be discoverable by label.
    expect(queryByLabelText("search")).toBeNull();
  });

  it("exposes an accessibility label when explicitly given one (icon-only meaning)", async () => {
    const { getByLabelText } = await render(
      <Icon name="favorite" accessibilityLabel="Preferiti" />,
    );
    expect(getByLabelText("Preferiti")).toBeTruthy();
  });

  it("renders without crashing for every glyph name used across the app", async () => {
    const names = [
      "arrow-back",
      "search",
      "person",
      "map",
      "favorite",
      "favorite-outline",
      "workspace-premium",
      "directions",
      "edit-note",
      "bookmark-add",
      "local-gas-station",
      "schedule",
      "send",
      "local-cafe",
      "local-car-wash",
      "wc",
      "local-convenience-store",
      "ev-station",
      "info",
      "trending-down",
      "insights",
      "savings",
      "arrow-downward",
      "arrow-forward",
      "close",
      "view-list",
      "price-change",
    ] as const;

    for (const name of names) {
      const { toJSON } = await render(<Icon name={name} />);
      expect(toJSON()).not.toBeNull();
    }
  });
});
