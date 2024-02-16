import React, {useState} from "react";
import "./SearchBar.css"

export const SearchBar = () => {

  const handleSearch = () => {
    console.log("search button pressed");
    console.log(input);
    if (input.trim() != "")
    {
        fetchData(input);
        console.log("fetching data");

    }
  };

  const handleClear = () => {
    console.log("clear button pressed");
    setInput("");
  };

    const [input, setInput]= useState("");
    const [searchButtonDisabled, setIsSearchButtonDisabled] = useState(true);
    const fetchData =(value) => {
        fetch("https://jsonplaceholder.typicode.com/users")
        .then((response) => response.json())
        .then((json) => {
            
            const results = json.filter((user) => {
                return (
                user && 
                user.name && 
                user.name.toLowerCase().includes(value.toLowerCase()))
            });
            console.log(json);
            console.log(results);

    });
    }

    const handleChange = (value) => {
        console.log(value);
        const validInputs = /^[a-zA-Z0-9\s\-\'\&\/\(\):,]+$/;
        if (validInputs.test(value) || value==="")
            setInput(value);
            if (value.length >= 5)
            {
                if (value.trim()!= "")
                {
                    console.log("here");
                    setIsSearchButtonDisabled(false);

                }
            } else {
                setIsSearchButtonDisabled(true);
            }
    }

    return <div className="input-wrapper">
        <input 
        placeholder = "search for a shelter" 
        value={input}  
        onChange={(e) => handleChange(e.target.value)}/>
        <button type="button" className="clear-button" onClick={handleClear}>
            Clear
        </button>
        <button type="button" className="search-button" disabled={searchButtonDisabled} onClick={handleSearch}>
            Search
        </button>             
        </div>
}