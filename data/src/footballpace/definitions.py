from pathlib import Path
import warnings

import dagster as dg


def augment_assets_with_references(asset_defs):
    if asset_defs is None:
        return None
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", dg.BetaWarning)
        return dg.link_code_references_to_git(
            dg.with_source_code_references(asset_defs),
            git_url="https://github.com/dschafer/footballpace-next",
            git_branch="main",
            file_path_mapping=dg.AnchorBasedFilePathMapping(
                local_file_anchor=Path(__file__),
                file_anchor_path_in_repository="data/src/footballpace/definitions.py",
            ),
        )


@dg.definitions
def defs() -> dg.Definitions:
    folder_defs = dg.load_from_defs_folder(path_within_project=Path(__file__))
    return dg.Definitions(
        assets=augment_assets_with_references(folder_defs.assets),
        asset_checks=folder_defs.asset_checks,
        schedules=folder_defs.schedules,
        sensors=folder_defs.sensors,
        jobs=folder_defs.jobs,
        resources=folder_defs.resources,
    )
