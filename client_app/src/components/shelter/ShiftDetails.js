import React from "react";
import "../../styles/shelter/ShiftDetails.css";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import dayjsUTC from 'dayjs/plugin/utc';
import dayjsTimezone from 'dayjs/plugin/timezone';
import ShiftDetailsTable from "./ShiftDetailsTable";

dayjs.extend(dayjsUTC);
dayjs.extend(dayjsTimezone);

function ShiftDetails() {
    const currentTime = dayjs();
    const startHour = currentTime.add(1, 'hour').startOf('hour');
    const endHour = startHour.add(1, 'hour');
    return (
      <div>
        <div className="shift-details">
          <div className="datetime-picker">
            <h4>Date</h4>
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
          <ShiftDetailsTable />
        </div>
      </div>
    );
}
export default ShiftDetails;