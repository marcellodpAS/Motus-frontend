import { fireEvent, render } from "@testing-library/react-native";

import { EmptyState } from "@/components/molecules/EmptyState";

describe("EmptyState", () => {
  it("renders the message without an action by default", async () => {
    const { getByText, queryByRole } = await render(
      <EmptyState message="Nessun impianto da mostrare." />,
    );

    expect(getByText("Nessun impianto da mostrare.")).toBeTruthy();
    expect(queryByRole("button")).toBeNull();
  });

  it("renders and fires the optional action when both actionLabel and onAction are given", async () => {
    const onAction = jest.fn();
    const { getByRole } = await render(
      <EmptyState
        message="Nessun impianto da mostrare."
        actionLabel="Aggiorna"
        onAction={onAction}
      />,
    );

    await fireEvent.press(getByRole("button"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
