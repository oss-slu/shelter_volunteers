import "./Pagination.css";

export const Pagination = (props) => {
  const handlePageChange = (pageNumber) => {
    props.onPageChange(pageNumber);
  };

  return (
    <div className="pagination-wrapper">
      <div className="pagination">
        <div className="pagination-items-per-page">
          <p>Shelters per page</p>
          <select value={props.itemsPerPage} onChange={props.onItemsPerPageChange}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className="pagination-navigation">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(props.currentPage - 1)}
            disabled={props.currentPage === 1}>
            Previous
          </button>
          <span className="pagination-current-page">{props.currentPage}</span>
          <span className="pagination-total-pages">of {props.totalPages}</span>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(props.currentPage + 1)}
            disabled={props.currentPage === props.totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
