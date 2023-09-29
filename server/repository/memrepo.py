from domains.work_shift import WorkShift


class MemRepo:
   def __init__(self, data):
      self.data = data

   def list(self):
      return [WorkShift.from_dict(i) for i in self.data]
   
   def get_by_id(self, shift_id):
        for item in self.data:
            if item["code"] == shift_id:
                return WorkShift.from_dict(item)
        return None

def delete(self, shift_id):
    for item in self.data:
        if item["code"] == shift_id:
            self.data.remove(item)
            return

