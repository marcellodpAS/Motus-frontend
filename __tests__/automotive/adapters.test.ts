import {
  androidAutoAdapter,
  carplayAdapter,
  createAutomotiveAdapter,
} from "@/automotive/adapters";
import type { AutomotiveMessageViewModel } from "@/automotive/types";
import { buildDeviceContext } from "@/platform/deviceContext";

const messageViewModel: AutomotiveMessageViewModel = {
  template: "message",
  headline: "Nessun impianto trovato",
  body: "Prova ad avvicinarti a un centro abitato.",
};

describe("androidAutoAdapter / carplayAdapter", () => {
  it("carry their own platform id", () => {
    expect(androidAutoAdapter.platform).toBe("android-auto");
    expect(carplayAdapter.platform).toBe("carplay");
  });

  it("pass the view model through unchanged, with no warnings for a matching automotive device", () => {
    const device = buildDeviceContext("android-auto");
    const plan = androidAutoAdapter.render(messageViewModel, device);

    expect(plan.templateKind).toBe("message");
    expect(plan.viewModel).toBe(messageViewModel);
    expect(plan.warnings).toEqual([]);
  });

  it("warns when the adapter's platform doesn't match the given device context", () => {
    const mobileDevice = buildDeviceContext("ios");
    const plan = androidAutoAdapter.render(messageViewModel, mobileDevice);

    expect(plan.warnings).toContain(
      'Adapter for "android-auto" was given a device context for "ios".',
    );
  });

  it("warns when the device isn't an automotive host, alongside the platform-mismatch warning", () => {
    const mobileDevice = buildDeviceContext("android");
    const plan = createAutomotiveAdapter("android-auto").render(
      messageViewModel,
      mobileDevice,
    );

    expect(plan.warnings).toContain(
      '"android" is not an automotive host; this render plan should not be used.',
    );
  });

  it("warns on an empty place-detail view model instead of silently accepting it", () => {
    const device = buildDeviceContext("carplay");
    const plan = carplayAdapter.render(
      { template: "place-detail", title: "Impianto 1", rows: [] },
      device,
    );

    expect(plan.warnings).toContain(
      "place-detail view model has no rows to display.",
    );
  });
});
