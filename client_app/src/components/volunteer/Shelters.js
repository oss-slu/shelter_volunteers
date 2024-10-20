import { useState, useEffect } from "react";
import ShelterList from "./ShelterList";
import ConfirmationPage from "./ConfirmationPage";
import { Pagination } from "./Pagination";
import { GETHELP_API, SERVER } from "../../config";
import { Link } from "react-router-dom";
import getAuthHeader from "../../authentication/getAuthHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SearchBar } from "./SearchBar";
import { faCalendarDays, faArrowRight, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { useSpring, animated } from "@react-spring/web";
import dayjs from 'dayjs';
import CurrentSelection from "./CurrentSelection";

const Shelters = (props) => {
  let defaultRadius = "5";
  if (props.condensed) defaultRadius = "25";
  const [data, setData] = useState([]);
  const [latitude, setLatitude] = useState(33.997103);
  const [longitude, setLongitude] = useState(-118.4472731);
  const [radius, setRadius] = useState(defaultRadius);
  const [loading, setLoading] = useState(true);
  const [isButtonDisabled, setButtonDisabled] = useState(true);
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [shiftStatusList, setShiftStatusList] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [onMobileContinueclicked, setOnMobileContinueclicked] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [noSearchDataAvailable, setNoSearchDataAvailable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(0);

  const shakeAnimation = useSpring({
    transform: shaking ? "translateY(-20px)" : "translateY(0px)",
  });

  useEffect(() => {
    fetchData();
  }, [latitude, longitude, radius]);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
  };

  function handleSearch(query) {
    setLoading(true);
    setSearchQuery(query);
    setCurrentPage(1);
  }

  function handlePagination(data) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);
    return paginatedData;
  }

  function totalPagesCount(data) {
    const newTotalPages = Math.ceil(data.length / itemsPerPage);
    return newTotalPages;
  }

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      if (originalData) {
        const filteredData = originalData.filter((shelter) =>
          shelter.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        if (filteredData.length === 0) {
          setNoSearchDataAvailable(true);
          setData(handlePagination(originalData));
          setTotalPages(totalPagesCount(originalData));
        } else {
          setData(handlePagination(filteredData));
          setNoSearchDataAvailable(false);
          setTotalPages(totalPagesCount(filteredData));
        }
      }
    } else {
      setData(handlePagination(originalData));
      setNoSearchDataAvailable(false);
      setTotalPages(totalPagesCount(originalData));
    }
  }, [searchQuery, originalData, currentPage, itemsPerPage]);

  const fetchData = () => {
    setLoading(true);
    let newEndpoint =
      GETHELP_API +
      "v2/facilities?page=0&pageSize=1000&latitude=" +
      latitude +
      "&longitude=" +
      longitude +
      "&radius=" +
      radius;
    fetch(newEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setOriginalData(data.content);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  function getLocation() {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setLocation);
    }
  }

  function setLocation(location) {
    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
  }

  function setRadiusfromLocation(event) {
    setRadius(event.target.value);
  }

  function manageShifts(shift) {
    setShaking(true);
    setTimeout(() => setShaking(false), 200);
    //setSelectedShifts([...selectedShifts, shift]);
    //setButtonDisabled(selectedShifts.length === 0);
    const shiftStart = dayjs(shift.start);
    const shiftEnd = dayjs(shift.end);

    const overlap = selectedShifts.some(selectedShift => {
      const selectedShiftStart = dayjs(selectedShift.start);
      const selectedShiftEnd = dayjs(selectedShift.end);

      // Check for overlap
      return shiftStart.isBefore(selectedShiftEnd) && shiftEnd.isAfter(selectedShiftStart);
    });

    if (overlap) {
      alert("The selected shift overlaps with another shift.");
      setButtonDisabled(true); // Disable submit button
    } else {
      setSelectedShifts([...selectedShifts, shift]);
      setButtonDisabled(false); // Enable submit button
    }
  }

  function onShiftClose(event) {
    let id = event.target.id;
    let shift = id.split("_")[2];

    const codes = selectedShifts.map((s) => s.code);
    if (codes.includes(shift)) {
      let index = selectedShifts.findIndex((s) => s.code === shift);
      if (index !== -1) {
        const newSelected = [...selectedShifts];
        newSelected.splice(index, 1);
        setSelectedShifts(newSelected);
        setButtonDisabled(selectedShifts.length === 0);
      }
    }
  }

  function submitShifts() {
    let shifts = [...selectedShifts];
    let shiftsPayload = shifts.map((shift) => ({ ...shift })); // Create new objects
    shiftsPayload = shiftsPayload.map((shift) => {
      delete shift.code;
      return shift;
    }); 
    const shiftsEndpoint = SERVER + "/shifts";
    const header = getAuthHeader();
    fetch(shiftsEndpoint, {
      method: "POST",
      body: JSON.stringify(shiftsPayload),
      headers: header,
    })
      .then((response) => response.json())
      .then((data) => {
        setShiftStatusList(data.map((item) => item.success));
      })
      .then(() => setShowConfirmation(true))
      .catch((error) => console.log(error));
  }

  function onMobileContinueClick() {
    if (selectedShifts.length < 1) {
      return;
    }
    setOnMobileContinueclicked(true);
  }

  function handleCurrentSelectionClose() {
    setOnMobileContinueclicked(false);
  }

  useEffect(() => {
    setButtonDisabled(selectedShifts.length === 0);
  }, [selectedShifts]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  

  return (
    <>
      {!showConfirmation && (
        <div>
          {props.condensed && (
            <div className="text-center">
              <button onClick={getLocation}>Get Shelters from Current Location</button>
              <ShelterList
                shelters={originalData.slice(0, 3)}
                loadingFunction={setLoading}
                manageShiftsFunction={manageShifts}
                isSignupPage={false}
              />
              <div className="text-center">
                <Link to="/shelters">
                  <button>View All Shelters</button>
                </Link>
              </div>
            </div>
          )}
          {!props.condensed && (
            <div>
              <div className="signup-page">
                <div className="column column-1">
                  <div className="text-center">
                    <h1>Volunteering Opportunities</h1>
                    <button onClick={getLocation}>Show opportunities near me</button>
                    <br />
                    <SearchBar onSearch={handleSearch} />
                    {noSearchDataAvailable && (
                      <div className="no-data-message">
                        <h1>
                          No shelters found with that name. Explore the list below for available
                          shelters.
                        </h1>
                      </div>
                    )}
                    <label htmlFor="radius-select">Radius (miles): </label>
                    <select id="radius-select" onChange={setRadiusfromLocation}>
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                  {loading && <div className="loader"></div>}
                  <ShelterList
                    shelters={data}
                    loadingFunction={setLoading}
                    manageShiftsFunction={manageShifts}
                    isSignupPage={true}
                  />
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
                <div
                  className={
                    onMobileContinueclicked ? "column column-2 active" : "column column-2"
                  }>
                  <div
                    className={
                      onMobileContinueclicked ? "current-selection active" : "current-selection"
                    }>
                    <h2>Current Selection</h2>
                    {onMobileContinueclicked && (
                      <div className="close-btn" onClick={handleCurrentSelectionClose}>
                        <FontAwesomeIcon icon={faCircleXmark} size="2x" />
                      </div>
                    )}
                    {selectedShifts && (
                      <div>
                        <CurrentSelection
                          selectedShifts={selectedShifts}
                          removeShift={onShiftClose}
                          submitShifts={submitShifts}
                          />
                      </div>
                    )}
                    <div id="submit-shifts" data-testid="submit-shifts-button">
                      <button onClick={submitShifts} disabled={isButtonDisabled}>
                        Submit Shifts
                      </button>
                    </div>
                  </div>
                </div>
                {!onMobileContinueclicked && (
                  <div className="continue-bottom-row">
                    <animated.div
                      className="cart"
                      onClick={onMobileContinueClick}
                      style={shakeAnimation}>
                      <div className="circle">
                        <FontAwesomeIcon icon={faCalendarDays} size="2x" />
                      </div>
                      <div className="count-bubble">{selectedShifts.length}</div>
                    </animated.div>
                    <button
                      className={selectedShifts.length > 0 ? "cont-btn" : "cont-btn disabled"}
                      onClick={onMobileContinueClick}>
                      Continue
                      {selectedShifts.length > 0 && (
                        <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: "1em" }} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {showConfirmation && shiftStatusList && (
        <div>
          <ConfirmationPage selectedShifts={selectedShifts} shiftStatusList={shiftStatusList} />
        </div>
      )}
    </>
  );
};

export default Shelters;
