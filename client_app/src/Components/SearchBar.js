import React, {useState} from "react";
import "./SearchBar.css"

export const SearchBar = ({ onSearch }) => {

    const [input, setInput]= useState("");
    const [searchButtonDisabled, setIsSearchButtonDisabled] = useState(true);

  const handleSearch = () => {
    const trimmedInput = input.trim();
      onSearch(trimmedInput);
  };

  const validateSearch = (e) => {
    if (e === "Enter") {
      if (input.length >= 5 && input.trim() !== ""){
        handleSearch();
      }
    }
  };

  const handleClear = () => {
    setInput("");
    onSearch("");
    setIsSearchButtonDisabled(true);
  };

    const handleChange = (value) => {
      const validInputs = /^[a-zA-Z0-9\s-'&/():,]+$/;
      if ((validInputs.test(value) || value === "") && value.length <= 55)
        setInput(value);
        if (value==="") {
          onSearch("");
        }
        if (value.length >= 5 && value.trim()!== "")
        {
          setIsSearchButtonDisabled(false);
        } else {
          setIsSearchButtonDisabled(true);
        }}

    return (
        <div className="input-wrapper">
          <input
            placeholder="search for a shelter"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => validateSearch(e.code)}/>
          <button type="button" className="clear-button" onClick={handleClear}>
            Clear
          </button>
          <button
            type="button"
            className="search-button"
            disabled={searchButtonDisabled}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      );
}
