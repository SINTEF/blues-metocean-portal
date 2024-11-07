import { LatLng } from "leaflet"
import { Dataset,DatasetVariable } from '../../../Types'


export function toHindcastCode(set: Dataset, position: LatLng, hs?: DatasetVariable, tp?: DatasetVariable) {
    const pos = { lat: position.lat.toFixed(4), lng: position.lng.toFixed(4) }
    return `
"""
Read data and generate metocean hindcast readable from SIMA
using (SIMAPY python library)[https://github.com/SINTEF/simapy]

pip install simapy
"""
from pathlib import Path
import time as hours
from datetime import datetime
import numpy as np
import pandas as pd
from dmt.dmt_writer import DMTWriter
import simapy.metocean.hindcast as hc


def __create_wave(wave_name, hs, tp, direction):
    # Met: North West Up, wave_going_to
    # SIMA: North East Down, wave coming from
    # SIMA direction = MET dir + 90 deg
    dir_offset = 90.0
    dir_sima = direction + dir_offset
    return hc.StochasticWave(name=wave_name, hs=hs, tp=tp, direction=dir_sima)


def __create_hindcast(hc_name, hc_values):
    waves = []

    waves.append(
        __create_wave("total", hc_values["hs"], hc_values["tp"], hc_values["thq"])
    )
    waves.append(
        __create_wave(
            "windSea", hc_values["hs_sea"], hc_values["tp_sea"], hc_values["thq_sea"]
        )
    )
    waves.append(
        __create_wave(
            "swell",
            hc_values["hs_swell"],
            hc_values["tp_swell"],
            hc_values["thq_swell"],
        )
    )

    # Time is given in Unix epoch
    # convert dates to strings
    dates = hc_values["time"].astype("datetime64[s]")
    sdates = np.datetime_as_string(dates, unit="h", timezone="UTC").astype('|S')

    hindcast = hc.Hindcast()
    hindcast.description = "Collected from norway met's: https://thredds.met.no/thredds/dodsC/nora3wavesubset_files/wave_v4/"
    hindcast.name = hc_name
    hindcast.date = sdates
    hindcast.latitude = hc_values.longitude
    hindcast.longitude = hc_values.latitude
    hindcast.wave = waves

    speed = hc_values["ff"]
    # wind_to_direction
    # Met: North West Up, wind_going_to
    # SIMA: North East Down, wind coming from
    # SIMA direction = MET dir + 90 deg
    direction = hc_values["dd"]

    wind = hc.StochasticWind()
    wind.name = "10.0m"
    wind.level = 10.0
    wind.speed = speed
    dir_offset = 90.0
    wind.direction = direction + dir_offset

    hindcast.wind = [wind]
    return hindcast


if __name__ == "__main__":
    # Start timing
    start = hours.time()
    start_date = datetime(2020, 10, 21)
    end_date = datetime(2020, 11, 21)

    lat_pos = ${pos.lat}
    lon_pos = ${pos.lng}

    variables = [
        "hs",
        "tp",
        "thq",
        "hs_sea",
        "tp_sea",
        "thq_sea",
        "hs_swell",
        "tp_swell",
        "thq_swell",
        "ff",
        "dd"
    ]

    values = wave_sub_time.get_values_between(
        lat_pos, lon_pos, start_date, end_date, requested_values=variables
    )

    # End timing and print elapsed time
    end = hours.time()
    print("Elapsed time: " + str(end - start) + " seconds")

    name = "hindcast_waves_nora3"
    hindcast_data = __create_hindcast(name, values)

    dates = values["time"].values
    dstart = pd.to_datetime(dates[0])
    dend = pd.to_datetime(dates[-1])
    sd = dstart.strftime("%Y.%m.%d.%H")
    ed = dend.strftime("%Y.%m.%d.%H")
    path = Path(f"./output/simamet/{name}_{sd}-{ed}.h5")
    path.parent.mkdir(parents=True, exist_ok=True)
    DMTWriter().write(hindcast_data, path)
    print(f"Written to {path.resolve()}")
 
`
}