import { render, screen, waitFor } from "@testing-library/react";
import Shelters from "../components/volunteer/Shelters";
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

    // wait for shelter name to appear
    await waitFor(async () => expect(screen.getByText("Crystal Geyser Recovery")).toBeInTheDocument(), {
      timeout: 3000,
    });

    // find and click the first available shift button
    const shiftButtons = screen.getAllByTestId("add-button");
    userEvent.click(shiftButtons[0]);

    // verify the selected shift appears in the UI
    await waitFor(() =>
      expect(
        screen.queryByText("Please add your desired shifts from the list"),
      ).not.toBeInTheDocument(),
    );

    // ensure Submit Shifts is enabled
    await waitFor(() => expect(screen.getByText("Submit Shifts")).toBeEnabled());

    // find and click the cancel button
    const cancelButton = await screen.findByText("X");
    userEvent.click(cancelButton);

    // verify shift removal
    await waitFor(() =>
      expect(screen.getByText("Please add your desired shifts from the list")).toBeInTheDocument(),
    );
    await waitFor(() => {
      expect(screen.getByText("Submit Shifts")).toBeDisabled();
    });
  }, 6000);

  test("user can select and remove multiple shifts", async () => {
    render(<Shelters condensed={false} isSignupPage={true} />);
  
    // Wait for first shelter to appear
    await waitFor(
      () => expect(screen.getByText("National Institute for Change PC")).toBeInTheDocument(),
      { timeout: 4000 }
    );
  
    // Select first shift
    const shiftButtons = screen.getAllByTestId("add-button");
    userEvent.click(shiftButtons[3]);
  
    // Verify shift selection
    await waitFor(() =>
      expect(
        screen.queryByText("Please add your desired shifts from the list")
      ).not.toBeInTheDocument()
    );
  
    // Ensure the selected shift appears
    await waitFor(() => expect(screen.getByText("6093")).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByText(formattedStartTime + " to " + formattedEndTime)).toBeInTheDocument()
    );
    await waitFor(() => expect(screen.getByText("Submit Shifts")).toBeEnabled());
  
    // Select another shift from a different shelter
    await waitFor(() => expect(screen.getByText("Municipality Facility")).toBeInTheDocument());
    userEvent.click(shiftButtons[1]);
  
    // Ensure second shift appears
    await waitFor(() => expect(screen.getByText("30027")).toBeInTheDocument());
  
    // "Submit Shifts" should be enabled now, as multiple shifts were added
    await waitFor(() => expect(screen.getByText("Submit Shifts")).toBeEnabled());
  
    // Cancel the first shift
    const cancelButtons = await screen.findAllByText("X");
    userEvent.click(cancelButtons[0]);
  
    // Verify first shift is removed, but second remains
    await waitFor(() => expect(screen.queryByText("6093")).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("30027")).toBeInTheDocument());
  
    // Cancel second shift
    userEvent.click(cancelButtons[1]);
  
    // Verify all shifts are removed
    await waitFor(() =>
      expect(screen.getByText("Please add your desired shifts from the list")).toBeInTheDocument()
    );
    await waitFor(() => expect(screen.getByText("Submit Shifts")).toBeDisabled());
  }, 6000);  
});
