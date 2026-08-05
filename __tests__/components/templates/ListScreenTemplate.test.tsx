import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

import { ListScreenTemplate } from "@/components/templates/ListScreenTemplate";

interface Item {
  id: string;
  label: string;
}

describe("ListScreenTemplate", () => {
  it("renders the header and the list's current state without a search control by default", async () => {
    const { getByRole, getByText, queryByLabelText } = await render(
      <ListScreenTemplate<Item>
        title="Impianti"
        list={{
          status: "empty",
          data: [],
          emptyMessage: "Nessun impianto da mostrare.",
          keyExtractor: (item) => item.id,
          renderItem: (item) => <Text>{item.label}</Text>,
        }}
      />,
    );

    expect(getByRole("header", { name: "Impianti" })).toBeTruthy();
    expect(getByText("Nessun impianto da mostrare.")).toBeTruthy();
    expect(queryByLabelText("Cerca")).toBeNull();
  });

  it("renders the search control and forwards typed text when onSearchChange is given", async () => {
    const onSearchChange = jest.fn();
    const { getByLabelText } = await render(
      <ListScreenTemplate<Item>
        title="Impianti"
        searchValue=""
        onSearchChange={onSearchChange}
        list={{
          status: "empty",
          data: [],
          emptyMessage: "Nessun impianto da mostrare.",
          keyExtractor: (item) => item.id,
          renderItem: (item) => <Text>{item.label}</Text>,
        }}
      />,
    );

    const field = getByLabelText("Cerca");
    await fireEvent.changeText(field, "Milano");
    expect(onSearchChange).toHaveBeenCalledWith("Milano");
  });
});
