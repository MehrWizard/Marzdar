import time


class MemoryStorage:
    def __init__(self):
        self._data = {}

    def set(self, key, value):
        self._data[key] = value

    def get(self, key, default=None):
        return self._data.get(key, default)

    def delete(self, key):
        self._data.pop(key, None)

    def clear(self):
        self._data.clear()


class ListStorage(list):
    def __init__(self, update_func, ttl: float = 30.0):
        super().__init__()
        self.update_func = update_func
        self.ttl = ttl
        self.last_update = 0.0

    def _check_and_update(self):
        if not self or (self.ttl and (time.time() - self.last_update > self.ttl)):
            self.update()

    def __getitem__(self, index):
        self._check_and_update()
        return super().__getitem__(index)

    def __iter__(self):
        self._check_and_update()
        return super().__iter__()

    def __str__(self):
        self._check_and_update()
        return super().__str__()

    def update(self):
        self.update_func(self)
        self.last_update = time.time()


class DictStorage(dict):
    def __init__(self, update_func, ttl: float = 30.0):
        super().__init__()
        self.update_func = update_func
        self.ttl = ttl
        self.last_update = 0.0

    def _check_and_update(self):
        if not self or (self.ttl and (time.time() - self.last_update > self.ttl)):
            self.update()

    def __getitem__(self, key):
        self._check_and_update()
        return super().__getitem__(key)

    def __iter__(self):
        self._check_and_update()
        return super().__iter__()

    def __str__(self):
        self._check_and_update()
        return super().__str__()

    def values(self):
        self._check_and_update()
        return super().values()

    def keys(self):
        self._check_and_update()
        return super().keys()

    def items(self):
        self._check_and_update()
        return super().items()

    def get(self, key, default=None):
        self._check_and_update()
        return super().get(key, default)

    def update(self):
        self.update_func(self)
        self.last_update = time.time()
