import React, {useState} from "react";
import "./SearchBar.css"

export const SearchBar = ({ onSearch }) => {

    const [input, setInput]= useState("");
    const [searchButtonDisabled, setIsSearchButtonDisabled] = useState(true);

  const handleSearch = () => {
    const trimmedInput = input.trim();
    if (trimmedInput.trim() !== "")
    {
        onSearch(trimmedInput);
    }
  };

  const handleClear = () => {
    setInput("");
    onSearch("");
  };

    const handleChange = (value) => {
        const validInputs = /^[a-zA-Z0-9\s\-\'\&\/\(\):,]+$/;
        if (validInputs.test(value) || value==="")
            setInput(value);
            if (value.length >= 5)
            {
                if (value.trim()!= "")
                {
                    setIsSearchButtonDisabled(false);

                }
            } else {
                setIsSearchButtonDisabled(true);
            }
    }

    return (
        <div className="input-wrapper">
          <input
            placeholder="search for a shelter"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
          />
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
