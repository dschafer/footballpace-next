from os import path


def read_csv_bytes(name: str) -> bytes:
    with open(path.join(path.dirname(__file__), "csvs", name), "rb") as file:
        return file.read()
