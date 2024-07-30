import React, { Component } from "react";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import "../../styles/shelter/Roster.css";
import { useState, forwardRef, useEffect } from "react";


const Roster = (props) => {

    useEffect(() => {
      console.log(props.shiftDetails);
      props.shiftDetails.forEach(item => {
        const { start_time, end_time, count } = item;
        console.log(`Start Time: ${start_time}, End Time: ${end_time}, Count: ${count}`);
      });
    }, []);

    return (
      <div className="roster-item-container">
        {props.shiftDetails.map((item, index) => (
          <div key={index}>
            <progress 
              value={item.count / 10} 
              className="full-width-progress" 
            />
            <div className="roster-item">
              <PeopleAltIcon />
              <span>{item.count} Volunteer(s)</span>
              <span>{new Date(item.start_time).toLocaleString([], { hour: 'numeric', hour12: true })} - {new Date(item.end_time).toLocaleString(
                [], { hour: 'numeric', hour12: true })}</span>
            </div>
          </div>
      ))}
      </div> 
    );
};

export default Roster;
