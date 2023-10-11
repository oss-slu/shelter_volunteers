import {UpcomingShifts} from "./Shifts";
import Shelters from "./Shelters";
import "./App.css";

function App() {
  return (
    <div>
        {UpcomingShifts()};
        {Shelters()};
    </div>
  )
}

export default App;
