from domains.work_shift import WorkShift


class MemRepo:
    def __init__(self, data):
        self.data = data

    def list(self):
        return [WorkShift.from_dict(i) for i in self.data]
