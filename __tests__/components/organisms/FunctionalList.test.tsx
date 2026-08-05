import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

import { FunctionalList } from "@/components/organisms/FunctionalList";

interface Item {
  id: string;
  label: string;
}

describe("FunctionalList", () => {
  it("shows the loading state", async () => {
    const { getByRole } = await render(
      <FunctionalList<Item>
        status="loading"
        data={[]}
        keyExtractor={(item) => item.id}
        renderItem={(item) => <Text>{item.label}</Text>}
        emptyMessage="Nessun risultato"
      />,
    );

    expect(getByRole("progressbar")).toBeTruthy();
  });

  it("shows the empty state", async () => {
    const { getByText } = await render(
      <FunctionalList<Item>
        status="empty"
        data={[]}
        keyExtractor={(item) => item.id}
        renderItem={(item) => <Text>{item.label}</Text>}
        emptyMessage="Nessun risultato"
      />,
    );

    expect(getByText("Nessun risultato")).toBeTruthy();
  });

  it("shows the error state and fires onRetry", async () => {
    const onRetry = jest.fn();
    const { getByText } = await render(
      <FunctionalList<Item>
        status="error"
        data={[]}
        keyExtractor={(item) => item.id}
        renderItem={(item) => <Text>{item.label}</Text>}
        emptyMessage="Nessun risultato"
        errorMessage="Errore di rete"
        onRetry={onRetry}
      />,
    );

    expect(getByText("Errore di rete")).toBeTruthy();
    await fireEvent.press(getByText("Riprova"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders every item with arbitrary content when populated", async () => {
    const data: Item[] = [
      { id: "1", label: "Impianto A" },
      { id: "2", label: "Impianto B" },
    ];
    const { getByText } = await render(
      <FunctionalList<Item>
        status="success"
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={(item) => <Text>{item.label}</Text>}
        emptyMessage="Nessun risultato"
      />,
    );

    expect(getByText("Impianto A")).toBeTruthy();
    expect(getByText("Impianto B")).toBeTruthy();
  });
});
