import { Suspense, useEffect, useState } from "react";
import { serviceShiftAPI } from "../../api/serviceShift";

const ShiftUserInfoDisplay = ({ shift, onDismiss, isOpen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userInfos, setUserInfos] = useState([]);

  useEffect(() => {
    if (!shift || !shift._id) return;
    setIsLoading(true);
    serviceShiftAPI.getUserInfosInShift(shift._id).then((infos) => {
      setUserInfos(infos);
      setIsLoading(false);
    });
  }, [shift]);

  if (!shift) {
    return null;
  }

  return (
    isOpen &&
    shift?._id !== null && (
      <>
        <div className={"modal-overlay"} onClick={onDismiss}>
          <div
            className={"modal-content overflow-hidden d-flex flex-column align-items-center"}
            onClick={(e) => e.stopPropagation()}>
            <div className={"d-flex justify-content-between w-100 mx-5"}>
              <h1>Volunteer Info</h1>
              <p>
                Volunteers: {shift.volunteers.length}/{shift.required_volunteer_count}
              </p>
            </div>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <table className={"table mx-6 my-2"}>
                <thead>
                  <tr>
                    <td>Name</td>
                    <td>Phone#</td>
                    <td>Email</td>
                  </tr>
                </thead>
                <tbody>
                  {userInfos.map((userInfo) => (
                    <tr key={userInfo.email}>
                      <td>
                        {userInfo.first_name === null && userInfo.last_name === null
                          ? "EMPTY"
                          : userInfo.first_name + " " + userInfo.last_name}
                      </td>
                      <td>{userInfo.phone_number ?? "EMPTY"}</td>
                      <td>{userInfo.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </>
    )
  );
};

export default ShiftUserInfoDisplay;
