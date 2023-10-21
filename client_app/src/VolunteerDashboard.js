import Shelters from "./Shelters";
import { UpcomingShifts } from "./Shifts";

function VolunteerDashboard() {
  return (
    <div class="volunteer-dashboard">
      <div class="column column-1">
        <UpcomingShifts />
      </div>

      <div class="column column-2">
        <h3>Shelters looking for Volunteers</h3>
        <Shelters condensed={true} />
      </div>

      <div class="column column-3">
        <h3>Impact Created</h3>
        <div class="card">
          <h4>Total hours served</h4>
          <p>106</p>
        </div>

        <div class="card">
          <h4>Lives Touched</h4>
          <p>17</p>
        </div>

        <div class="card">
          <h4>Shelters served</h4>
          <p>4</p>
        </div>
      </div>
    </div>
  );
}

export default VolunteerDashboard;
