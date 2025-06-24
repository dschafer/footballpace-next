from footballpace.partitions import seasons_to_predicted_seasons


def test_seasons_to_predicted_seasons():
    mapping = seasons_to_predicted_seasons(range(2000, 3000), 5)
    assert mapping[2000] == [2001, 2002, 2003, 2004, 2005]
    assert mapping[2001] == [2000, 2002, 2003, 2004, 2005, 2006]
    assert mapping[2002] == [2000, 2001, 2003, 2004, 2005, 2006, 2007]
    assert mapping[2003] == [2000, 2001, 2002, 2004, 2005, 2006, 2007, 2008]
    assert mapping[2004] == [2000, 2001, 2002, 2003, 2005, 2006, 2007, 2008, 2009]
    assert mapping[2005] == [2000, 2001, 2002, 2003, 2004, 2006, 2007, 2008, 2009, 2010]
    assert mapping[2006] == [2007, 2008, 2009, 2010, 2011]
    assert mapping[2007] == [2008, 2009, 2010, 2011, 2012]
