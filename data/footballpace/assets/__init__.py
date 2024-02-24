from .match_results import match_results_csv as match_results_csv
from .match_results import match_results_df as match_results_df
from .match_results import match_results_postgres as match_results_postgres
from .standings_rows import standings_rows_df as standings_rows_df
from .standings_rows import standings_rows_postgres as standings_rows_postgres

all_assets = [
    match_results_csv,
    match_results_df,
    match_results_postgres,
    standings_rows_df,
    standings_rows_postgres,
]
