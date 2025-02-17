import "../../styles/shelter/ShiftDetails.css";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { ShiftDetailsTable } from "./ShiftDetailsTable.js";
import { ShiftsModal } from "./ShiftsModal.js";
import { useState } from "react";
import { ContactVolunteersModal } from "./ContactVolunteersModal";
import { EditStatusConfirmationModal } from "./EditStatusConfirmationModal";
import { availableShifts } from "./ShiftDetailsData.tsx";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";

export const ShiftDetails = () => {
  const [isContactVolunteersModalOpen, setIsContactVolunteersModalOpen] = useState(false);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const shiftsList = availableShifts;
  const [selectedShifts, setSelectedShift] = useState([]);
  const [repeatDays, setRepeatDays] = useState([]);

  const daysOfWeek = [
    { id: 0, label: "Sunday" },
    { id: 1, label: "Monday" },
    { id: 2, label: "Tuesday" },
    { id: 3, label: "Wednesday" },
    { id: 4, label: "Thursday" },
    { id: 5, label: "Friday" },
    { id: 6, label: "Saturday" },
  ];

  const handleChange = (event) => {
    setSelectedShift(
      typeof event.target.value === "string"
        ? event.target.value.split(",")
        : event.target.value
    );
  };

  const handleRepeatChange = (event) => {
    const selectedDay = event.target.value;
    setRepeatDays(
      repeatDays.includes(selectedDay)
        ? repeatDays.filter((day) => day !== selectedDay)
        : [...repeatDays, selectedDay]
    );
  };

  const onSubmitShift = () => {
    const shiftData = {
      selectedShifts,
      repeatDays,
    };
    console.log("Submitting Shift:", shiftData);
    // TODO: Send shiftData to backend via API call
  };

  return (
    <div>
      {isVolunteerModalOpen && (
        <ShiftsModal
          isVolunteerModalOpen={isVolunteerModalOpen}
          setIsVolunteerModalOpen={setIsVolunteerModalOpen}
        />
      )}
      {isContactVolunteersModalOpen && (
        <ContactVolunteersModal
          isContactVolunteersModalOpen={isContactVolunteersModalOpen}
          setIsContactVolunteersModalOpen={setIsContactVolunteersModalOpen}
        />
      )}
      {isStatusModalOpen && (
        <EditStatusConfirmationModal
          isStatusModalOpen={isStatusModalOpen}
          setIsStatusModalOpen={setIsStatusModalOpen}
        />
      )}

      <div className="shift-details">
        <div className="datetime-picker">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <h4 className="date-label">Start Date:</h4>
            <DatePicker
              defaultValue={dayjs()}
              slotProps={{ textField: { size: "small" } }}
              sx={{ width: 200 }}
            />
            <h4 className="date-label">End Date:</h4>
            <DatePicker
              defaultValue={dayjs()}
              slotProps={{ textField: { size: "small" } }}
              sx={{ width: 200 }}
            />
          </LocalizationProvider>

          <h4 className="endtime-label">Select Shift(s):</h4>
          <FormControl sx={{ m: 0.5, width: 250 }}>
            <InputLabel id="shiftsCheckedDropDown">Shift(s)</InputLabel>
            <Select
              labelId="shiftCheckboxLabel"
              id="multiShiftCheckboxLabel"
              multiple
              value={selectedShifts}
              onChange={handleChange}
              input={<OutlinedInput label="Shift(s)" />}
              renderValue={(selected) => selected.join(", ")}
            >
              {shiftsList.shifts.map((shiftSlot) => (
                <MenuItem key={shiftSlot.id} value={shiftSlot.name}>
                  <Checkbox checked={selectedShifts.includes(shiftSlot.name)} />
                  <ListItemText primary={shiftSlot.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <h4 className="repeat-days-label">Repeat on:</h4>
          <FormControl sx={{ m: 0.5, width: 250 }}>
            <InputLabel id="repeatDaysCheckboxLabel">Days</InputLabel>
            <Select
              labelId="repeatDaysCheckboxLabel"
              id="repeatDaysMultiSelect"
              multiple
              value={repeatDays}
              onChange={handleRepeatChange}
              input={<OutlinedInput label="Days" />}
              renderValue={(selected) =>
                selected.map((id) => daysOfWeek.find((day) => day.id === id)?.label).join(", ")
              }
            >
              {daysOfWeek.map((day) => (
                <MenuItem key={day.id} value={day.id}>
                  <Checkbox checked={repeatDays.includes(day.id)} />
                  <ListItemText primary={day.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <Button variant="contained" color="primary" onClick={onSubmitShift}>
          Submit Shift
        </Button>
      </div>

      <div className="shiftdetails-table">
        <ShiftDetailsTable />
      </div>
    </div>
  );
};
