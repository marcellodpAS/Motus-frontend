import { fireEvent, render } from "@testing-library/react-native";

import { ErrorState } from "@/components/molecules/ErrorState";

describe("ErrorState", () => {
  it("renders a generic string message without assuming a specific error shape", async () => {
    const { getByText } = await render(
      <ErrorState message="Si è verificato un errore imprevisto." />,
    );

    expect(getByText("Si è verificato un errore imprevisto.")).toBeTruthy();
  });

  it("shows no retry action by default, and fires onRetry with the default label when provided", async () => {
    const onRetry = jest.fn();
    const { getByText, queryByRole, rerender } = await render(
      <ErrorState message="Errore" />,
    );
    expect(queryByRole("button")).toBeNull();

    await rerender(<ErrorState message="Errore" onRetry={onRetry} />);
    const retry = getByText("Riprova");
    await fireEvent.press(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("accepts a custom retry label", async () => {
    const { getByText } = await render(
      <ErrorState message="Errore" onRetry={jest.fn()} retryLabel="Ricarica" />,
    );

    expect(getByText("Ricarica")).toBeTruthy();
  });
});
