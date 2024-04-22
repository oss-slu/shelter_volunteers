import { render, screen, waitFor } from "@testing-library/react";
import Shelters from "./../Shelters";
import userEvent from "@testing-library/user-event";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";
import setMilliseconds from "date-fns/setMilliseconds";
import { format } from "date-fns";

test("submit shifts button is disabled when no shifts are selected", async () => {
  render(<Shelters condensed={false} isSignupPage={true} />);
  await waitFor(() => {
    expect(screen.getByText("Submit Shifts")).toBeDisabled();
  });
}, 5000);

describe("add and cancel shifts", () => {
  let startTime;
  let endTime;
  let formattedStartTime;
  let formattedEndTime;
  beforeEach(() => {
    startTime = setHours(
      setMinutes(setSeconds(setMilliseconds(new Date(), 0), 0), 0),
      new Date().getHours() + 1,
    );
    endTime = setHours(
      setMinutes(setSeconds(setMilliseconds(new Date(), 0), 0), 0),
      new Date().getHours() + 2,
    );
    formattedStartTime = format(startTime, "M/dd/yy HH:mm");
    formattedEndTime = format(endTime, "M/dd/yy HH:mm");
  });
  test("shelter allows user to add and delete one shift", async () => {
    render(<Shelters condensed={false} isSignupPage={true} />);
    await waitFor(() => expect(screen.getByText("Crystal Geyser Recovery")).toBeInTheDocument(), {
      timeout: 3000,
    });
    const buttons = screen.getAllByTestId("add-button");
    const button = buttons[0];
    userEvent.click(button);
    await waitFor(() =>
      expect(
        screen.queryByText("Please add your desired shifts from the list"),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(screen.getByText("30207")).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByText(formattedStartTime + " to " + formattedEndTime)).toBeInTheDocument(),
    );
    await waitFor(() => expect(screen.getByText("Submit Shifts")).toBeEnabled());
    const cancelbtn = await screen.findByText("X");
    userEvent.click(cancelbtn);
    await waitFor(() =>
      expect(screen.getByText("Please add your desired shifts from the list")).toBeInTheDocument(),
    );
    await waitFor(() => {
      expect(screen.getByText("Submit Shifts")).toBeDisabled();
    });
  }, 6000);

  test("user can select and remove multiple shifts", async () => {
    render(<Shelters condensed={false} isSignupPage={true} />);
    await waitFor(
      () => expect(screen.getByText("National Institute for Change PC")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    const buttons = screen.getAllByTestId("add-button");
    const button = buttons[3];
    userEvent.click(button);
    await waitFor(() =>
      expect(
        screen.queryByText("Please add your desired shifts from the list"),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(screen.getByText("6093")).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByText(formattedStartTime + " to " + formattedEndTime)).toBeInTheDocument(),
    );
    await waitFor(() => expect(screen.getByText("Submit Shifts")).toBeEnabled());
    //next shelter
    await waitFor(() => expect(screen.getByText("Municipality Facility")).toBeInTheDocument());
    const button2 = buttons[1];
    userEvent.click(button2);
    await waitFor(() => expect(screen.getByText("30027")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Submit Shifts")).toBeEnabled());
    //cancel shifts
    const cancelbtns = await screen.findAllByText("X");
    const cancelbtn = cancelbtns[0];
    userEvent.click(cancelbtn);
    await waitFor(() => expect(screen.queryByText("6093")).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Submit Shifts")).toBeEnabled());
    await waitFor(() => expect(screen.getByText("30027")).toBeInTheDocument());
    const cancelbtn2 = await screen.findByText("X");
    userEvent.click(cancelbtn2);
    await waitFor(() =>
      expect(screen.getByText("Please add your desired shifts from the list")).toBeInTheDocument(),
    );
    await waitFor(() => expect(screen.getByText("Submit Shifts")).toBeDisabled());
  }, 6000);
});
