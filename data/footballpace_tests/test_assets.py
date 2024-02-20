import pandas as pd

from dagster import Output

from footballpace.assets import match_results_df, match_results_postgres

sample_bytes_95 = b"Div,Date,HomeTeam,AwayTeam,FTHG,FTAG,FTR,HTHG,HTAG,HTR,,,,,,,,,,,\r\nE0,19/08/95,Aston Villa,Man United,3,1,H,3,0,H,,,,,,,,,,,\r\nE0,19/08/95,Blackburn,QPR,1,0,H,1,0,H,,,,,,,,,,,\r\n,,,,,,,,,"
sample_bytes_22 = b"Div,Date,Time,HomeTeam,AwayTeam,FTHG,FTAG,FTR,HTHG,HTAG,HTR,Referee,HS,AS,HST,AST,HF,AF,HC,AC,HY,AY,HR,AR,B365H,B365D,B365A,BWH,BWD,BWA,IWH,IWD,IWA,PSH,PSD,PSA,WHH,WHD,WHA,VCH,VCD,VCA,MaxH,MaxD,MaxA,AvgH,AvgD,AvgA,B365>2.5,B365<2.5,P>2.5,P<2.5,Max>2.5,Max<2.5,Avg>2.5,Avg<2.5,AHh,B365AHH,B365AHA,PAHH,PAHA,MaxAHH,MaxAHA,AvgAHH,AvgAHA,B365CH,B365CD,B365CA,BWCH,BWCD,BWCA,IWCH,IWCD,IWCA,PSCH,PSCD,PSCA,WHCH,WHCD,WHCA,VCCH,VCCD,VCCA,MaxCH,MaxCD,MaxCA,AvgCH,AvgCD,AvgCA,B365C>2.5,B365C<2.5,PC>2.5,PC<2.5,MaxC>2.5,MaxC<2.5,AvgC>2.5,AvgC<2.5,AHCh,B365CAHH,B365CAHA,PCAHH,PCAHA,MaxCAHH,MaxCAHA,AvgCAHH,AvgCAHA\r\nE0,05/08/2022,20:00,Crystal Palace,Arsenal,0,2,A,0,1,A,A Taylor,10,10,2,2,16,11,3,5,1,2,0,0,4.2,3.6,1.85,4.33,3.5,1.87,4.3,3.55,1.85,4.5,3.65,1.89,4.4,3.5,1.83,4.6,3.5,1.87,4.6,3.78,1.95,4.39,3.59,1.88,2.1,1.72,2.14,1.78,2.19,1.91,2.09,1.76,0.5,2.04,1.89,2.03,1.89,2.06,1.91,2.01,1.87,4.5,3.6,1.8,4.5,3.5,1.83,4.4,3.55,1.85,4.58,3.63,1.88,4.8,3.4,1.78,4.75,3.5,1.85,5.01,3.7,1.91,4.56,3.57,1.85,2.1,1.72,2.14,1.78,2.19,1.91,2.08,1.76,0.5,2.09,1.84,2.04,1.88,2.09,1.88,2.03,1.85\r\nE0,06/08/2022,12:30,Fulham,Liverpool,2,2,D,1,0,H,A Madley,9,11,3,4,7,9,4,4,2,0,0,0,11,6,1.25,10,5.75,1.28,12,5.75,1.27,11.2,6.22,1.28,12,5.5,1.27,13,6,1.25,13,6.4,1.31,10.99,6.05,1.28,1.5,2.62,1.5,2.7,1.54,2.76,1.48,2.63,1.75,1.9,2.03,1.91,2,1.92,2.04,1.89,1.99,11,5.75,1.28,9.25,6,1.29,11,5.5,1.3,10.5,6.5,1.29,11,5.5,1.27,11.5,6,1.29,11.95,6.93,1.3,10.33,6.2,1.28,1.5,2.62,1.49,2.77,1.51,3,1.47,2.73,1.75,1.9,2.03,1.91,2.02,2.01,2.06,1.89,1.99\r\n"


def test_match_results_df_95():
    df_output = match_results_df(sample_bytes_95)
    assert isinstance(df_output, Output)
    df = df_output.value
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 2
    assert df["Date"][0] == pd.Timestamp("1995-08-19")


def test_match_results_df_22():
    df_output = match_results_df(sample_bytes_22)
    assert isinstance(df_output, Output)
    df = df_output.value
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 2
    assert df["Date"][0] == pd.Timestamp("2022-08-05")


def test_match_results_postgres():
    df_output = match_results_df(sample_bytes_22)
    assert isinstance(df_output, Output)
    df = df_output.value

    class FakeVercelPostgresResource:
        def upsert_matches(self, matches) -> int:
            assert len(matches) == 2
            return 2

    output = match_results_postgres(df, FakeVercelPostgresResource())
    assert isinstance(output, Output)
    assert output.metadata["rowcount"].value == 2
