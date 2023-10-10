import { useState,useEffect } from 'react'

import {SERVER} from './config'

import ShiftList from './Components/ShiftList'

function Shifts(request_endpoint){
   const [data, setData] = useState([])
   useEffect(()=>{
       fetch(request_endpoint,{
        'methods':'GET',
        headers : {
          'Content-Type':'application/json',
          'Authorization':'volunteer@slu.edu'
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
export function UpcomingShifts(){
   const time_now = new Date().getTime()
   console.log(time_now)
   const shelters_endpoint = SERVER+'/shifts?filter_start_after='+time_now;
   return Shifts(shelters_endpoint)
}

export function PastShifts(){
   const time_now = new Date().getTime()
   const shelters_endpoint = SERVER+'/shifts?filter_end_before='+time_now;
   return Shifts(shelters_endpoint)
}
