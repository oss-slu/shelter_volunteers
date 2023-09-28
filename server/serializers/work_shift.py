import json

class WorkShiftJsonEncoder(json.JSONEncoder):
   def default(self, workshift):
      try:
         to_serialize = {
            "code": str(workshift.code),
            "worker": workshift.worker,
            "shelter": workshift.shelter,
            "start_time": workshift.start_time,
            "end_time": workshift.end_time,
         }
         return to_serialize
      except AttributeError:
         return super().default(workshift)
