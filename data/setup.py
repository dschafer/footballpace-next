from setuptools import find_packages, setup

setup(
    name="footballpace",
    packages=find_packages(exclude=["footballpace_tests"]),
    install_requires=[
        "dagster",
        "dagster-cloud",
        "dagster-pandas",
        "pandas",
        "psycopg[binary]",
        "requests",
    ],
    extras_require={"dev": ["dagster-webserver", "pytest"]},
)
