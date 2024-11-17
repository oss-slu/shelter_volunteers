import "../../styles/shelter/ShiftDetails.css";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import dayjsUTC from 'dayjs/plugin/utc';
import dayjsTimezone from 'dayjs/plugin/timezone';
import { ShiftDetailsTable } from "./ShiftDetailsTable.js";
import { ShiftsModal } from "./ShiftsModal.js";
import { useState } from 'react';
import { EmergencyAlertModal } from "./EmergencyAlertModal";
import { EditStatusConfirmationModal } from "./EditStatusConfirmationModal";
import { availableShifts } from "./ShiftDetailsData.tsx";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { format } from "date-fns";

dayjs.extend(dayjsUTC);
dayjs.extend(dayjsTimezone);

export const ShiftDetails = () => {
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
    const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [shift, setShift] = useState();
    const shiftsList = availableShifts;
    const [selectedShifts, setSelectedShift] = useState([]);
    const stickyHeader = (isEmergencyModalOpen || isVolunteerModalOpen || isStatusModalOpen) ? "static" : "sticky";
    const headerZIndex = (isEmergencyModalOpen || isVolunteerModalOpen || isStatusModalOpen) ? 0 : 1;

    const handleChange = (event) => {
      const {
        target: { value },
      } = event;
      setSelectedShift(
        typeof value === 'string' ? value.split(',') : value,
      );
    };

    const onSignUpVolunteersClick = () => {
      setIsVolunteerModalOpen(true);
    }

    const onSendEmergencyAlertClick = () => {
      setIsEmergencyModalOpen(true);
    }

    const onStatusModalClick = shift => {
      setShift(shift);
      setIsStatusModalOpen(true);
    }

    const renderDropDown = () => {
      return (shiftsList.shifts.map((shiftSlot => {
        const nameAndTime = shiftSlot.name ? shiftSlot.name + ": " + format(shiftSlot.startTime, "hh:mm aaaaa'm'") + " - " + format(shiftSlot.endTime, "hh:mm aaaaa'm'") : format(shiftSlot.startTime, "hh:mm aaaaa'm'") + " - " + format(shiftSlot.endTime, "hh:mm aaaaa'm'");
        return (
          <MenuItem key={shiftSlot.id} value={nameAndTime}>
            <Checkbox checked={selectedShifts.includes(nameAndTime)} />
            <ListItemText primary={nameAndTime} />
          </MenuItem>
        )
    })))
    }

    return (
      <div>
        {isVolunteerModalOpen && <ShiftsModal isVolunteerModalOpen={isVolunteerModalOpen} setIsVolunteerModalOpen={setIsVolunteerModalOpen} />}
        {isEmergencyModalOpen && <EmergencyAlertModal isEmergencyModalOpen={isEmergencyModalOpen} setIsEmergencyModalOpen={setIsEmergencyModalOpen} />}
        {isStatusModalOpen && <EditStatusConfirmationModal isStatusModalOpen={isStatusModalOpen} setIsStatusModalOpen={setIsStatusModalOpen} shift={shift}/>}
        <div className="shift-details">
          <div className="datetime-picker">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <h4 className="date-label">Start Date: </h4>
              <DatePicker defaultValue={dayjs()} slotProps={{textField: {size: "small"}}} sx={{width: 200}} />
              <h4 className="date-label">End Date: </h4>
              <DatePicker defaultValue={dayjs()} slotProps={{textField: {size: "small"}}} sx={{width: 200}} />
            </LocalizationProvider>
            <h4 className="endtime-label">Select Shift(s): </h4>
            <FormControl sx={{ m: .5, width: 250}}>
              <InputLabel id="shiftsCheckedDropDown" hidden={isEmergencyModalOpen||isStatusModalOpen||isVolunteerModalOpen}>Shift(s)</InputLabel>
              <Select
                labelId="shiftCheckboxLabel"
                id="multiShiftCheckboxLabel"
                multiple
                value={selectedShifts}
                onChange={handleChange}
                input={<OutlinedInput label="Shift(s)" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {renderDropDown()}
              </Select>
            </FormControl>
          </div> 
        </div>
        <div className="shiftdetails-table">
          <ShiftDetailsTable 
            onSignUpVolunteersClick={onSignUpVolunteersClick} 
            onSendEmergencyAlertClick={onSendEmergencyAlertClick} 
            onStatusModalClick={onStatusModalClick}
            stickyHeader={stickyHeader}
            headerZIndex={headerZIndex}/>
        </div>
      </div>
    );
}
