
export interface  DatasetProvider {
  name: string
  datasets: Dataset[]
}

export interface  Dataset {
  name: string
  description: string
  fromDate: string
  toDate: string
  url: string
  api: string
  latitudes: number[]
  longitudes: number[]
  variables: DatasetVariable[]
}



export interface DatasetVariable {
  name: string
  description: string
  unit: string
  dimensions: string
}

