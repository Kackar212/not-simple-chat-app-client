import { render } from "@/tests/test.utils";
import { ServerIcon } from "./server-icon.component";
import {
  createServerEntityMock,
  createUserServerEntityMock,
} from "@/tests/server/entities";

describe("ServerIcon", () => {
  it("should render text placeholder if servers does not have icon", async () => {
    const { getByText } = await render(
      <ServerIcon server={createServerEntityMock(1, 1)} />
    );

    expect(getByText("st1")).toBeInTheDocument();
  });

  it("should render icon as image with alt telling user where this link will take him to", async () => {
    const serverEntity = createUserServerEntityMock(
      3,
      3,
      "https://placehold.co/48"
    );

    const { getByAltText } = await render(
      <ServerIcon
        server={serverEntity}
        alt={`Go to ${serverEntity.name} server`}
      />
    );

    expect(getByAltText(/Go to server test 3 server/i)).toBeInTheDocument();
  });
});
