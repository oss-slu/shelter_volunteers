import React from "react";
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
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { availableShifts } from "./ShiftDetailsData.tsx";

dayjs.extend(dayjsUTC);
dayjs.extend(dayjsTimezone);

export const ShiftDetails = () => {
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
    const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [shift, setShift] = useState();
    const shiftsList = availableShifts;
    const [selectedShifts, setSelectedShift] = useState("");

    const handleChange = (event) => {
      setSelectedShift(event.target.value);
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
        const nameAndTime = shiftSlot.name ? shiftSlot.name + ": " + shiftSlot.startTime + " - " + shiftSlot.endTime : shiftSlot.startTime + " - " + shiftSlot.endTime;
        return (
          <MenuItem key={shiftSlot.id} value={nameAndTime}>{nameAndTime}</MenuItem>
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
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Shift(s)</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectedShifts}
                  label="Shift(s)"
                  onChange={handleChange}
                >
                  {renderDropDown()}
                </Select>
              </FormControl>
            </Box>
          </div> 
        </div>
        <div className="shiftdetails-table">
          <ShiftDetailsTable onSignUpVolunteersClick={onSignUpVolunteersClick} onSendEmergencyAlertClick={onSendEmergencyAlertClick} onStatusModalClick={onStatusModalClick}/>
        </div>
      </div>
    );
}
