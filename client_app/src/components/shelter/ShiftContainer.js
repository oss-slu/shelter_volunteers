import React, { Component } from "react";
import Roster from "./Roster";
import { useState, useRef, forwardRef, useEffect } from "react";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";
import setMilliseconds from "date-fns/setMilliseconds";
import { SERVER } from "../../config";


const ShiftContainer = (props) => {
    
    // Mock data for shifts
    /*
    const mockShifts = [
      {
        id: 1,
        date: "Monday, Dec 1, 2024",
        shifts: [
          {
            label: "Volunteers",
            time: "9 AM - 11 AM",
            volunteers: ["John Doe", "Jane Smith"],
            pro: "0.6",
          },

          {
            label: "Volunteers",
            time: "1 PM - 3 PM",
            volunteers: ["David Johnson", "Emily Brown", "Michael Wilson"],
            pro: "0.3",
          },
          {
            label: "Volunteers",
            time: "5 PM - 7 PM",
            volunteers: [
              "Sarah Miller",
              "Robert Jones",
              "Lisa Davis",
              "David Johnson",
              "Emily Brown",
              "Michael Wilson",
            ],
            pro: "0.9",
          },
          
        ],
      },
    ];*/

  const [data, setData] = useState([]);
  const [shelterId, setShelterId] = useState(30207);
  const [startTime, setStartDate] = useState(
      setHours(
        setMinutes(setSeconds(setMilliseconds(new Date(), 0), 0), 0),
        new Date().getHours() + 1,
      ),
  );

  const initialized = useRef(false);
  
  useEffect(() => {
    let start = setMilliseconds(setSeconds(setMinutes(setHours(startTime, 0), 0), 0), 0);
    const oneHourInMs = 3600 * 1000;
    const validResponses = [];
    if (!initialized.current && shelterId) {
      initialized.current = true;
      for (let i = 0; i < 24; i++) {
        const intervalStartEpoch = start.getTime() + (i * oneHourInMs);
        const intervalEndEpoch = intervalStartEpoch + oneHourInMs;
        let request_endpoint = `${SERVER}/counts/${shelterId}?filter_start_after=${intervalStartEpoch}&filter_end_before=${intervalEndEpoch}`;
        fetch(request_endpoint, {
          methods: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "volunteer@slu.edu",
          },
        })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            validResponses.push(...data);
            setData(validResponses);
          }
        })
        .catch((error) => console.log(error));  
      }
    }
  }, [shelterId]);
  
    return (
      <>
        {data && (
          <div className="shift-container">
            <Roster shiftDetails={data} />
          </div>
        )}
      </>
    );
}

export default ShiftContainer;
