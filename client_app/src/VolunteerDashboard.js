function VolunteerDashboard() {
  return (
    <div class="volunteer-dashboard">
      <div class="column column-1">
        <h3>Currently Registered</h3>
        <div class="card">
          <h4>St Patrick Center Shelter for Women</h4>
          <p>St. Louis MO, 63101</p>
          <p>THU,FRI - 10:00 AM to 11:00 AM</p>
        </div>
        <div class="card">
          <h4>Covenant House Missouri</h4>
          <p>2727 North Kingshighway Boulevard • St. Louis MO, 63113</p>
          <p>SAT - 01:00 PM to 2:00 PM</p>
        </div>
        <div class="card">
          <h4>The Haven of Grace</h4>
          <p>1225 Warren Street • St. Louis MO</p>
          <p>SUN - 4:00 PM to 1:00 PM</p>
        </div>
      </div>

      <div class="column column-2">
        <h3>Shelters looking for Volunteers</h3>
        <div class="card">
          <h4>AmeriCorps St. Louis Emergency Winter Shelter</h4>
          <p>12 Spots available</p>
          <button>Register</button>
        </div>

        <div class="card">
          <h4>Peter & Paul Community Services</h4>
          <p>14 Spots available</p>
          <button>Register</button>
        </div>
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
