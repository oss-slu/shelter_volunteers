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
  
    // Wait for shelter list to load
    await waitFor(() =>
      expect(screen.getByText("National Institute for Change PC")).toBeInTheDocument(),
      { timeout: 5000 }
    );
  
    // Find and click the first shift
    const shiftButtons = screen.getAllByTestId("add-button");
    userEvent.click(shiftButtons[0]);

    // Small delay to allow UI updates
    await new Promise((res) => setTimeout(res, 500));
  
    // Ensure the shift is added
    await waitFor(() =>
      expect(screen.queryByText("Please add your desired shifts from the list")).not.toBeInTheDocument(),
      { timeout: 5000 }
    );
  
    // Ensure the submit button is enabled
    const submitButton = await screen.findByRole("button", { name: /submit shifts/i });
    await expect(submitButton).toBeEnabled();
  
    // Click to add a second shift
    userEvent.click(shiftButtons[1]);

    // Allow time for UI update
    await new Promise((res) => setTimeout(res, 500));

    // Ensure submit button remains enabled
    await expect(submitButton).toBeEnabled();
  
    // Remove the first shift
    const cancelButtons = await screen.findAllByText("X");
    userEvent.click(cancelButtons[0]);

    // Small delay before checking UI updates
    await new Promise((res) => setTimeout(res, 500));

    // Verify first shift removal and Submit Shifts remains enabled
    await waitFor(() => expect(screen.queryByText("6093")).not.toBeInTheDocument(), { timeout: 5000 });
    await expect(submitButton).toBeEnabled();
  
    // Remove the second shift
    userEvent.click(cancelButtons[1]);

    // Small delay before checking UI updates
    await new Promise((res) => setTimeout(res, 500));

    // Verify all shifts are removed
    await waitFor(() =>
      expect(screen.getByText("Please add your desired shifts from the list")).toBeInTheDocument(),
      { timeout: 5000 }
    );
    await expect(submitButton).toBeDisabled();
  }, 6000);
});
