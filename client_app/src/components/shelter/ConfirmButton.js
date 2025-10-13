import { useRef, useState } from "react";
import { delay } from "msw";

const ConfirmButton = ({ expirationTimeMillis = 3000, onConfirm, initialText, confirmationText = "Confirm?" }) => {

  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const displayText = (isAwaitingConfirmation ? confirmationText : initialText);

  let expirationTag = useRef(0);

  const onClick = () => {
    expirationTag.current = (expirationTag.current + 1) % 100;
    if (!isAwaitingConfirmation) {
      setIsAwaitingConfirmation(true);
      const expirationTagSnapshot = expirationTag.current;
      delay(expirationTimeMillis).then(() => {
        if (expirationTag.current === expirationTagSnapshot) {
          console.log(expirationTag.current);
          setIsAwaitingConfirmation(false);
        }
      })
    } else {
      onConfirm();
    }
  }

  return (
    <button
      className={"btn " + (isAwaitingConfirmation ? "btn-warning" : "btn-danger")}
      onClick={onClick} > {displayText}</button >
  )
};

export default ConfirmButton;