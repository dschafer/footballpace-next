from footballpace.definitions import defs


def test_def_can_load():
    assert defs.get_schedule_def("current_season_refresh_schedule")
    assert defs.get_sensor_def("db_write_sensor")
