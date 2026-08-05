import { render } from "@testing-library/react-native";

import { AppText } from "@/components/atoms/AppText";

describe("AppText", () => {
  it("renders its content and forwards essential text properties", async () => {
    const { getByRole, getByText } = await render(
      <AppText accessibilityRole="header" testID="app-text">
        Accessible text
      </AppText>,
    );

    expect(getByText("Accessible text")).toBeTruthy();
    expect(getByRole("header")).toHaveProp("testID", "app-text");
  });

  it("accepts an optional NativeWind className", async () => {
    await expect(
      render(<AppText className="text-primary">Motus</AppText>),
    ).resolves.toBeTruthy();
  });

  it("renders with every typography variant without crashing", async () => {
    const variants = ["caption", "body", "label", "title", "headline"] as const;
    for (const variant of variants) {
      await expect(
        render(<AppText variant={variant}>{variant}</AppText>),
      ).resolves.toBeTruthy();
    }
  });

  it("renders with every semantic color token without crashing", async () => {
    const colors = [
      "foreground",
      "muted",
      "primary",
      "onPrimary",
      "secondary",
      "onSecondary",
      "danger",
      "onDanger",
      "warning",
      "onWarning",
      "success",
      "onSuccess",
      "onSelected",
      "onDisabled",
    ] as const;
    for (const color of colors) {
      await expect(
        render(<AppText color={color}>{color}</AppText>),
      ).resolves.toBeTruthy();
    }
  });

  it("defaults to body/foreground when no variant or color is given", async () => {
    const { getByText } = await render(<AppText>Default</AppText>);

    expect(getByText("Default").props.className).toContain("text-body");
    expect(getByText("Default").props.className).toContain("text-foreground");
  });
});
