import { LatLng } from "leaflet"
import { Dataset,DatasetVariable } from '../../Types'


export function toCodeString(set: Dataset, position: LatLng, row?: DatasetVariable, column?: DatasetVariable, auxs: DatasetVariable[]=[]) {
    const api = set.api
    const idx = api.lastIndexOf(".")
    const dataset = api.substring(idx + 1)
    const imprt = api.substring(0, idx)
    const pos = { lat: position.lat.toFixed(4), lng: position.lng.toFixed(4) }
    const rv = row ? row.name : "hs"
    const cv = column ? column.name : "tp"
    const bins = [rv, cv]
    const aux_vars = auxs.map(v => v.name)
    const variables = bins.concat(aux_vars)
    const aux_args = aux_vars.length > 0 ? ", " + aux_vars.map(v => v + "=" + v).join(",") : ""
    return `
from datetime import datetime
import os
import openpyxl
from openpyxl.cell import Cell
from openpyxl.styles import PatternFill
from openpyxl.worksheet.worksheet import Worksheet

from bluesmet.common.scatter import Scatter
from bluesmet.${imprt} import ${dataset}


class ScatterExcelWriter:
    """Write a scatter table to an excel file"""

    def __init__(self, scatter: Scatter, row_name: str, column_name: str):
        self.scatter = scatter
        self.row_name = row_name
        self.column_name = column_name
        self.workbook = openpyxl.Workbook()
        self.sheet: Worksheet = self.workbook.active

    def __get_color(self, occurence: int, total: int):
        """Get a color for the cell based on the occurence and the total number of occurences"""
        if occurence == 0:
            return None

        prob = occurence / total
        # scale the probability to shift it towards the red end of the spectrum to exagerate the small values
        value = min(1.0, 5 * prob)
        red = int(255 * value)
        green = int(255 * (1 - value))
        blue = 0
        chex = [f"{i:02x}" for i in [red, green, blue]]
        return "".join(chex)

    def write_occurences(self):
        """Write the occurences to the excel file"""
        upper_row = self.scatter.row_values()
        upper_column = self.scatter.column_values()
        occurences = self.scatter.occurences()
        header = (
            [f"{self.row_name}/{self.column_name}"] + upper_column.tolist() + ["Sum"]
        )
        self.sheet.append(header)
        total_sum = occurences.sum()
        for i, occ in enumerate(occurences):
            row = [upper_row[i]] + occ.tolist() + [occ.sum()]
            self.sheet.append(row)
            for j, cell in enumerate(occ):
                color = self.__get_color(cell, total_sum)
                if color:
                    self.sheet.cell(i + 2, j + 2).fill = PatternFill(
                        "solid", start_color=color
                    )

        footer = ["Sum"] + occurences.sum(axis=0).tolist() + [total_sum]
        self.sheet.append(footer)

    def append(self, row):
        """Append a row to the excel file"""
        self.sheet.append(row)

    def write_mean_of(self, name):
        """Write the scatter table to the excel file"""
        self.sheet.append([f"Mean {name}"])
        scatter_values = self.scatter.get_values(name)
        row_vals = self.scatter.row_values()
        col_vals = self.scatter.column_values()
        self.sheet.append([f"{self.row_name}/{self.column_name}"] + col_vals.tolist())
        for i, value_row in enumerate(scatter_values):
            self.sheet.append([row_vals[i]] + value_row.tolist())
            for j, _ in enumerate(value_row):
                sc: Cell = self.sheet.cell(self.sheet.max_row, j + 1)
                sc.number_format = "0.00"

    def save(self, filename):
        """Save the excel file"""
        self.workbook.save(filename)


def write_scatter():
    """Write a scatter table to an excel file"""
    lat_pos = ${pos.lat}
    lon_pos = ${pos.lng}
    start_date = datetime(2020, 10, 21)
    end_date = datetime(2020, 11, 21)
    variables = [${variables.map(v => "\"" + v + "\"").join(",")}]
    values = wave_sub_time.get_values_between(
        lat_pos, lon_pos, start_date, end_date, requested_values=variables
    )

    bin_size = 2.0
    scatter = Scatter(bin_size=bin_size)
    for ${variables.join(",")} in zip(${variables.map(v => "values[\"" + v + "\"]").join(",")}):
        scatter.add(${bins.join(",")}${aux_args})

    writer = ScatterExcelWriter(scatter, "${rv}", "${cv}")
    writer.write_occurences()
    writer.append([])

${aux_vars.map(v => "    writer.write_mean_of(\"" + v + "\")\n    writer.append([])").join("\n")}

    # Save the Excel file
    filename = "./output/scatter.xlsx"
    os.makedirs("./output", exist_ok=True)
    writer.save(filename)
    print(f"Saved to {filename}")


if __name__ == "__main__":
    write_scatter()

`
}