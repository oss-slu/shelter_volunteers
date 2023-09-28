import { useState,useEffect } from 'react'

import {SERVER} from './config'

import ShiftList from './Components/ShiftList'


function Shifts(){
   const [data, setData] = useState([])
   console.log(SERVER)
   const shelters_endpoint = SERVER+'/shifts';
   console.log(shelters_endpoint)
   useEffect(()=>{
       fetch(shelters_endpoint,{
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
         <ShiftList shifts={data}/>
     </div>
   )
}

export default Shifts;
