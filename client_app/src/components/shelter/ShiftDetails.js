import React from "react";
import "../../styles/shelter/ShiftDetails.css";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import dayjsUTC from 'dayjs/plugin/utc';
import dayjsTimezone from 'dayjs/plugin/timezone';
import { ShiftDetailsTable } from "./ShiftDetailsTable.js";
import { MoreDetailsBox } from "./MoreDetailsBox.js";
import { ShiftsModal } from "./ShiftsModal.js"

dayjs.extend(dayjsUTC);
dayjs.extend(dayjsTimezone);

export const ShiftDetails = () => {
    const [isMModalOpen, setIsMModalOpen] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const onClickMoreDetails = () => {
      setIsMModalOpen(true);
    }

    const onSignUpVolunteersClick = () => {
      setIsMModalOpen(false);
      setIsModalOpen(true);
    }

    const currentTime = dayjs();
    const startHour = currentTime.add(1, 'hour').startOf('hour');
    const endHour = startHour.add(1, 'hour');
    return (
      <div>
        {isMModalOpen} < MoreDetailsBox onSignUpVolunteersClick={onSignUpVolunteersClick} isMModalOpen={isMModalOpen} setIsMModalOpen={setIsMModalOpen} isModalOpen={isModalOpen} />
        {isModalOpen} < ShiftsModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        <div className="shift-details">
          <div className="datetime-picker">
            <h4 className="date-label">Date</h4>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker defaultValue={dayjs()} slotProps={{textField: {size: "small"}}} sx={{width: 200}} />
              <h4 className="starttime-label">Shift Start Time</h4>
              <TimePicker defaultValue={startHour}  slotProps={{textField: {size: "small"}}} sx={{width: 200}} />
              <h4 className="endtime-label">Shift End Time</h4>
              <TimePicker defaultValue={endHour} slotProps={{textField: {size: "small"}}} sx={{width: 200}} />
            </LocalizationProvider>
          </div> 
        </div>
        <div className="shiftdetails-table">
          <ShiftDetailsTable onClickMoreDetails={onClickMoreDetails} />
        </div>
      </div>
    );
}
