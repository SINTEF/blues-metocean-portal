from pathlib import Path
import json
import folium
import numpy as np
import xarray as xr
from metocean_api.ts.internal import products


# I need a new __get_products() function that returns the products as dictionary with product name as key and dicationary of lat and lon as value
def __get_products():
    return {
        "NORA3_wave_sub": {"url":"https://thredds.met.no/thredds/catalog/nora3_subset_wave/wave_tser/catalog.html","fromDate": "1976-01-01","toDate": "2024-05-31"},
        "NORA3_wave": {"url":"https://thredds.met.no/thredds/catalog/windsurfer/mywavewam3km_files/catalog.html","fromDate": "1976-01-01","toDate": "2024-05-31","drop_coordinates": True},
        "NORA3_wind_sub": {"url":"https://thredds.met.no/thredds/catalog/nora3_subset_atmos/wind_hourly/catalog.html","fromDate": "1970-01-01","toDate": "2023-12-31"},
        "NORAC_wave": {"url":"https://thredds.met.no/thredds/catalog/norac_wave/field/catalog.html","fromDate": "2017-01-01","toDate": "2023-12-31","drop_coordinates": True},
        "NORA3_stormsurge": {"url":"https://thredds.met.no/thredds/catalog/stormrisk/catalog.html","fromDate": "1979-01-01","toDate": "2022-12-31","latitude": "lat_rho", "longitude": "lon_rho"},
        "NORA3_atm_sub": {"url":"https://thredds.met.no/thredds/catalog/nora3_subset_atmos/atm_hourly/catalog.html","fromDate": "1970-01-01","toDate": "2024-06-30"},
        "NORA3_atm3hr_sub": {"url":"https://thredds.met.no/thredds/catalog/nora3_subset_atmos/atm_3hourly/catalog.html","fromDate": "1970-01-01","toDate": "2024-06-30"},
        "NORKYST800": {"url":"https://thredds.met.no/thredds/fou-hi/norkyst800v2.html","latitude": "lat", "longitude": "lon","fromDate": "2016-09-14"},
        "NorkystDA_surface": {"url":"https://thredds.met.no/thredds/catalog/nora3_subset_ocean/catalog.html","latitude": "lat", "longitude": "lon","fromDate": "2017-01-02","toDate": "2018-12-31"},
        "NorkystDA_zdepth": {"url":"https://thredds.met.no/thredds/catalog/nora3_subset_ocean/catalog.html","latitude": "lat", "longitude": "lon","fromDate": "2017-01-02","toDate": "2018-12-31"},
        "NORA3_wave_spec": {"url":"https://thredds.met.no/thredds/catalog/windsurfer/mywavewam3km_spectra/catalog.html","drop_coordinates": True,"fromDate": "1975-01-01","toDate": "2024-05-31"},
        "NORAC_wave_spec": {"url":"https://thredds.met.no/thredds/catalog/norac_wave/spec/catalog.html","drop_coordinates": True,"fromDate": "2017-01-01","toDate": "2023-10-31"},
    }


def __download_metadata_for(product_name, products_input):
    lat_name = products_input.get("latitude", "latitude")
    lon_name = products_input.get("longitude", "longitude")

    from_date = products_input["fromDate"]

    product = products.find_product(product_name)
    urls = product.get_url_for_dates(from_date, from_date)
    url = urls[0]

    dataset = {
        "name": product_name,
        "fromDate": products_input["fromDate"],
        "url": product_input["url"],
    }

    if "toDate" in products_input:
        dataset["toDate"] = products_input["toDate"]

    with xr.open_dataset(url) as ds:
        latitude = ds[lat_name].values
        longitude = ds[lon_name].values
        desc = []
        if "title" in ds.attrs:
            desc.append(ds.attrs["title"])
        if "summary" in ds.attrs:
            desc.append(ds.attrs["summary"])

        if len(desc) > 0:
            dataset["description"] = "\n\n".join(desc)

        variables = []
        for varname, var in ds.variables.items():
            variable = {"name": varname}
            if len(var.dims) > 0:
                variable["dimensions"] = ",".join(var.dims)

            desc = []
            if "long_name" in var.attrs:
                desc.append(var.attrs["long_name"])
            if "standard_name" in var.attrs:
                desc.append(var.attrs["standard_name"])
            if len(desc) > 0:
                variable["description"] = ",".join(desc)
            if "units" in var.attrs:
                variable["unit"] = var.attrs.get("units")
            variables.append(variable)

        dataset["variables"] = variables
        __find_edge_coordinates(latitude, longitude, dataset, products_input)

    __write_metadata(dataset, folder / f"{name}.json")

    return dataset


def __reduce_points(latitudes, longitudes, number_of_points):
    # Reduce the number of points
    latitudes_edge = []
    longitudes_edge = []
    lsum = 0
    for lats in latitudes:
        lsum += len(lats)
    step = int(lsum / number_of_points)
    for latitudes, longitudes in zip(latitudes, longitudes):
        latitudes_edge.append(latitudes[0])
        longitudes_edge.append(longitudes[0])
        for i in range(1, len(latitudes) - 1):
            if i % step == 0:
                latitudes_edge.append(latitudes[i])
                longitudes_edge.append(longitudes[i])
        if len(latitudes) % step != 0:
            # Always add the last points even if they are not part of the step
            latitudes_edge.append(latitudes[-1])
            longitudes_edge.append(longitudes[-1])

    return latitudes_edge, longitudes_edge


def __find_edge_coordinates(latitudes, longitudes, dataset, products_input):
    # latitudes and longitudes are organized as a two dimentions array
    # Travel along the edges of the array to create a polygon
    if products_input.get("drop_coordinates", False):
        dataset["latitudes"] = []
        dataset["longitudes"] = []
        return

    latitudes_edges = [list(latitudes[0, :])]
    latitudes_edges.append(list(latitudes[:, -1]))
    latitudes_edges.append(list(reversed(latitudes[-1, :])))
    latitudes_edges.append(list(reversed(latitudes[:, 0])))

    longitudes_edges = [list(longitudes[0, :])]
    longitudes_edges.append(list(longitudes[:, -1]))
    longitudes_edges.append(list(reversed(longitudes[-1, :])))
    longitudes_edges.append(list(reversed(longitudes[:, 0])))

    # Reduce the number of points
    number_of_points = 100
    latitudes_edge, longitudes_edge = __reduce_points(
        latitudes_edges, longitudes_edges, number_of_points
    )
    dataset["latitudes"] = latitudes_edge
    dataset["longitudes"] = longitudes_edge

    __create_map(dataset)


def __create_map(dataset):
    # Just for debug purposes
    latitudes_edge = dataset["latitudes"]
    longitudes_edge = dataset["longitudes"]

    latitude_center = sum(latitudes_edge) / len(latitudes_edge)
    longitude_center = sum(longitudes_edge) / len(longitudes_edge)
    mymap = folium.Map(location=(latitude_center, longitude_center), zoom_start=3)

    lat_lon_points = []
    for lat, lon in zip(latitudes_edge, longitudes_edge):
        lat_lon_points.append([lat, lon])

    folium.Polygon(
        locations=lat_lon_points,  # List of lat/lon points
        color="black",  # Border color of the polygon
        fill=True,  # Whether to fill the polygon
    ).add_to(mymap)

    mymap.save(folder / "map.html")


def __write_metadata(meta_data, meta_file):
    class NumpyEncoder(json.JSONEncoder):
        def default(self, o):
            if isinstance(o, (np.float64, np.int64, np.float32, np.int32)):
                return o.item()  # Convert to native Python type
            elif isinstance(o, np.ndarray):
                return o.tolist()  # Convert NumPy array to list
            return super().default(o)

    # Save as json
    with open(meta_file, "w", encoding="utf8") as f:
        f.write(json.dumps(meta_data, cls=NumpyEncoder))


all_products = __get_products()
datasets = []
# Download metadata for all products and save them in the output folder
root = Path("output")
for name, product_input in all_products.items():
    folder = root / name
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    datasets.append(__download_metadata_for(name, product_input))

portal_metadata = {"providers": [{"name": "met.no", "datasets": datasets}]}

# Update the portal.json file
__write_metadata(portal_metadata, "public/portal.json")
