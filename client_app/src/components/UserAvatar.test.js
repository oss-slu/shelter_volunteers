import { render, screen, fireEvent } from "@testing-library/react";
import UserAvatar, { initialsFor } from "./UserAvatar";

describe("initialsFor", () => {
  it.each([
    ["Sam Rivera", "", "SR"],
    ["sam", "", "SA"],
    ["", "jordan.lee@example.org", "JL"],
    ["", "", "?"],
  ])("name %p email %p -> %p", (name, email, expected) => {
    expect(initialsFor(name, email)).toBe(expected);
  });
});

describe("UserAvatar", () => {
  it("renders the picture when there is one", () => {
    const { container } = render(
      <UserAvatar user={{ name: "Sam Rivera", picture: "https://example.org/sam.png" }} />,
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.org/sam.png");
  });

  it("falls back to initials when the picture fails to load", () => {
    const { container } = render(
      <UserAvatar user={{ name: "Sam Rivera", picture: "https://example.org/broken.png" }} />,
    );
    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("SR")).toBeInTheDocument();
  });
});
