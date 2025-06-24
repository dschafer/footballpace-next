from os import path


def read_csv_bytes(name: str) -> bytes:
    with open(path.join(path.dirname(__file__), "csvs", name), "rb") as file:
        return file.read()


def read_fpl_bytes(name: str) -> bytes:
    with open(path.join(path.dirname(__file__), "fpl", name), "rb") as file:
        return file.read()


def read_teamcolors_bytes(name: str) -> bytes:
    with open(path.join(path.dirname(__file__), "teamcolors", name), "rb") as file:
        return file.read()
