import React, {useState} from "react";
import "./SearchBar.css"

export const SearchBar = () => {

  const handleSearch = () => {
    // Implement your search logic here
    console.log("Searching...");

  };

  const handleClear = () => {
    // Implement your clear logic here
    console.log("Clearing...");
    setInput("");
  };

    const [input, setInput]= useState("")
    const fetchData =(value) => {
        fetch("https://jsonplaceholder.typicode.com/users")
        .then((response) => response.json())
        .then((json) => {
            
            const results = json.filter((user) => {
                return (
                (value.length >= 5) &&
                user && 
                user.name && 
                user.name.toLowerCase().includes(value))
            });
            console.log(json);
            console.log(results);

    });
    }

    const handleChange = (value) => {
        console.log(value)
        setInput(value);
        fetchData(value);
    }

    return <div className="input-wrapper">
        <input 
        placeholder = "search" 
        value={input} 
        onChange={(e) => handleChange(e.target.value)}/>
        <button type="button" className="clear-button" onClick={handleClear}>
            Clear
        </button>
        <button type="button" className="search-button" onClick={handleSearch}>
            Search
        </button>             
        </div>
}