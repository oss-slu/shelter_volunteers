export const SubmitResultsMessage = ({ resultMessage, closeModal }) => {
  const content = (
    <>
      {resultMessage.text && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className={`message ${resultMessage.success ? 'success' : 'error'}`}>
              {resultMessage.text}
            </div>
          </div>
        </div>
      )}
    </>
  );
  return content;
}