import { render } from "@testing-library/react-native";

import { MotusLogo } from "@/components/atoms/MotusLogo";

describe("MotusLogo", () => {
  it("renders the MOTUS wordmark by default", async () => {
    const { getByText } = await render(<MotusLogo />);
    expect(getByText("MOTUS")).toBeTruthy();
  });

  it("hides the wordmark when markOnly is set", async () => {
    const { queryByText } = await render(<MotusLogo markOnly />);
    expect(queryByText("MOTUS")).toBeNull();
  });
});
