from footballpace import defs


def test_def_can_load():
    assert defs.get_job_def("results_job")
    assert defs.get_job_def("pace_sheets_job")
