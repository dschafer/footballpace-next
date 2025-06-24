from pathlib import Path
import warnings

import dagster as dg

warnings.filterwarnings("ignore", category=dg.BetaWarning)

# This file is all noqa: E402 so that we can call warnings.filterwarnings
# above before doing the imports
# ruff: noqa: E402

from . import assets


@dg.definitions
def defs() -> dg.Definitions:
    return dg.Definitions.merge(
        dg.Definitions(
            assets=dg.link_code_references_to_git(
                dg.with_source_code_references(
                    dg.load_assets_from_package_module(assets)
                ),
                git_url="https://github.com/dschafer/footballpace-next",
                git_branch="main",
                file_path_mapping=dg.AnchorBasedFilePathMapping(
                    local_file_anchor=Path(__file__),
                    file_anchor_path_in_repository="data/footballpace/definitions.py",
                ),
            ),
        ),
        dg.load_from_defs_folder(project_root=Path(__file__).parent.parent),
    )
