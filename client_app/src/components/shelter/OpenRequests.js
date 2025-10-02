import React, { Component } from "react";
import ServiceShiftDetails from "./ServiceShiftDetails";
import { shiftDetailsData } from "./ShiftDetailsData.tsx";

class OpenShifts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: shiftDetailsData
    }
  }

  render() {
    const { data } = this.state;

    return (
      <div className="open-requests">
        {data.map((shift) => (
          <ServiceShiftDetails key={shift._id} shift={shift} />
        ))}
      </div>
    );
  }
}

export default OpenShifts;
