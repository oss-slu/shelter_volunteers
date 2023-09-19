import { useState,useEffect } from 'react'

import ShelterList from './Components/ShelterList'

function Shelters(){
   const [data, setData] = useState([])
   useEffect(()=>{
       fetch('http://127.0.0.1:5000/shelters',{
        'methods':'GET',
        headers : {
          'Content-Type':'application/json'
        }
      })
      .then(response => response.json())
      .then(response => setData(response))
      .catch(error => console.log(error))

   },[])

   return(
     <div>
         <ShelterList shelters={data.shelters}/>
     </div>
   )
}

export default Shelters;
