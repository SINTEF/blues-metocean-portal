import { LatLng } from "leaflet"
import { Dataset,DatasetVariable } from '../../../Types'


export function toScatterCode(set: Dataset, position: LatLng, hs?: DatasetVariable, tp?: DatasetVariable) {
    const api = set.api
    const idx = api.lastIndexOf(".")
    const dataset = api.substring(idx + 1)
    const imprt = api.substring(0, idx)
    const pos = { lat: position.lat.toFixed(4), lng: position.lng.toFixed(4) }
    const rv = hs ? hs.name : "hs"
    const cv = tp ? tp.name : "tp"
    const bins = [rv, cv]
    const variables = bins
    return `
"""
Create a scatter table from wave and wind data
and save it as sima metocean scatter data using (SIMAPY python library)[https://github.com/SINTEF/simapy]

Required libraries:

pip install simapy
"""
from datetime import datetime
from pathlib import Path

import bluesmet.common.scatter as bluesmet
import simapy.metocean.scatter as simamet
from bluesmet.${imprt} import ${dataset}
from dmt.dmt_writer import DMTWriter

def _create_sima_scatter(scatter: bluesmet.Scatter, description: str) -> simamet.Scatter:
    sima_scatter = simamet.Scatter()
    sima_scatter.name = "Scatter"
    hs = scatter.row_values()
    tp = scatter.column_values()
    occurences = scatter.occurences()

    sima_scatter.hsUpperLimits = hs
    sima_scatter.tpUpperLimits = tp

    omni = simamet.Sector()
    omni.name = "Omni"
    omni.description = description
    sima_scatter.omni = omni
    wave = simamet.Wave()
    wave.occurrence = occurences
    omni.wave = wave

    wdir=scatter.get_values("wind_dir")
    wspeed = scatter.get_values("wind_speed")
    wc = simamet.WindCurrent()
    # Assumption on level, as the dataset does not state the reference height
    wc.level = 10.0
    wc.speed = wspeed
    wc.direction = wdir
    omni.wind = [wc]
    return sima_scatter


def create_scatter():
    """Write a scatter table to an excel file and sima metocean data"""
    lat_pos = ${pos.lat}
    lon_pos = ${pos.lng}
    start_date = datetime(2020, 10, 21)
    end_date = datetime(2020, 11, 21)
    variables = [${variables.map(v => "\"" + v + "\"").join(",")},"ff","dd"]
    md = ${dataset}.get_metadata()
    url = md["global"]["url"]
    values = ${dataset}.get_values_between(
        lat_pos, lon_pos, start_date, end_date, requested_values=variables
    )

    output = Path("./output/simamet")
    output.mkdir(parents=True, exist_ok=True)

    bin_size = 2.0
    scatter = bluesmet.Scatter(bin_size=bin_size)

    for ${variables.join(",")},ff,dd in zip(${variables.map(v => "values[\"" + v + "\"]").join(",")},values["ff"],values["dd"]):
        # We need to convert the wind direction to match the system for Metocean task in SIMA
        # Met: North West Up, wind_going_to
        # SIMA: North East Down, wind coming from
        # SIMA direction = MET dir + 90 deg
        wind_dir = (dd+90.0) % 360.0
        scatter.add(${bins.join(",")},wind_dir=wind_dir,wind_speed=ff)

    sd = start_date.strftime("%Y.%m.%d.%H")
    ed = end_date.strftime("%Y.%m.%d.%H")

    description = f"""
Created with data from met.no
From {sd} to {ed} at latitude={lat_pos}, longitude={lon_pos}
See {url}"""
    sima_scatter = _create_sima_scatter(scatter,description)

    prefix = f"omnidir_scatter_{sd}-{ed}_lat={lat_pos}_lon={lon_pos}"
    path = output / f"{prefix}.h5"
    DMTWriter().write(sima_scatter, path)
    print(f"Saved to {path.resolve()}")


if __name__ == "__main__":
    create_scatter()

`
}