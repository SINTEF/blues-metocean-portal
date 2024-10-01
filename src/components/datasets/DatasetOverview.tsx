import React, { useContext, useEffect, useState } from 'react'
import { Tree, TreeNode } from '../Tree'

import { Grid, LinearProgress } from '@mui/material'
import Box from '@mui/material/Box'
import { LatLng, latLng } from 'leaflet'
import { AppCtx } from '../../App'
import { Dataset,DatasetContainer } from '../../Types'
import { CardWrapper } from '../Card'
import { TextMarker } from '../TextMarker'
import DatasetMap, { MapDataset } from './DatasetMap'
import { DatasetView } from './DatasetView'


const colors = ["red", "blue", "yellow"]

function createSetNode(set: Dataset, counter: () => number): TreeNode {
  const idx = counter()
  const color = colors[idx]
  const mset: MapDataset = {
    dataset: set,
    selected: false,
    color: color
  }
  return {
    id: "set" + idx,
    checked: mset.selected,
    label: set.name,
    color: color,
    data: mset
  }
}

function createContainerNode(container: DatasetContainer, ccounter: () => number, scounter: () => number): TreeNode {
  const node: TreeNode = {
    id: "container" + ccounter(),
    checked: false,
    label: container.name
  }

  var children: TreeNode[] = []
  if (container.containers) {
    children = container.containers.map((cnode) => createContainerNode(cnode, ccounter, scounter))
  }
  const sets = container.datasets
  if (sets) {
    children = children.concat(sets.map((node) => createSetNode(node, scounter)));
  }
  if (children.length > 0) {
    node.items = children
  }
  return node;
}

function findSelected(root: TreeNode,setSelected: (selected: MapDataset[]) => void) {
  if (root) {
    const selectedSets: MapDataset[] = []
    findSelectedNodes(root, selectedSets)
    setSelected(selectedSets)
  }
}

function findSelectedNodes(node: TreeNode, selected: MapDataset[]) {
  const data = node.data
  if (node.data) {
    const set: MapDataset = data;
    if (set.selected) {
      selected.push(data)
    }
  }
  const children = node.items
  if (children) {
    children.forEach(child => {
      findSelectedNodes(child, selected)
    })
  }
}

function nodeSelected(root: TreeNode, node: TreeNode,nodeSelected: (selected: MapDataset[]) => void) {
  const mset: MapDataset = node.data
  mset.selected = node.checked ? node.checked : false
  if (root) {
    findSelected(root,nodeSelected)
  }
}

export function DatasetOverview() {
  const app = useContext(AppCtx);

  const [position, setPosition] = useState<LatLng>(latLng(64.1154, 7.8877))

  const [root, setRoot] = useState<TreeNode>()

  const [selected, setSelected] = useState<MapDataset[]>([])

  useEffect(() => {
    if (app) {
      const containers = app.datasetContainers
      var ccount = 0
      var scount = 0
      const ccounter = () => {
        return ccount++
      }
      const scounter = () => {
        return scount++
      }
      const treeRoot: TreeNode = {
        id: "root",
        label: "Datasets",
        items: containers.map(node => createContainerNode(node, ccounter, scounter))
      };
      setRoot(treeRoot)
      findSelected(treeRoot,setSelected)
    }
  }, [app]);

  if (!root) {
    return <LinearProgress />
  }

  

  return (
    <>
      <AppCtx.Provider value={app}>
        {root && (
          <div>
            <div>
              Select one or more datasets to explore in the tree and then further dive into the sections that appear in the bottom
              The map shows the area of available data for the given dataset.
            </div>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <CardWrapper style={{ width: '100%', height: '100%' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Tree data={[root]} onSelection={node => nodeSelected(root,node,setSelected)}/>
                    </Box>
                    <TextMarker position={position} setPosition={setPosition}/>
                  </CardWrapper>
                </Grid>
                <Grid item xs={9}>
                  <DatasetMap datasets={selected} position={position} setPosition={setPosition} />
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                {selected.filter(set => set.selected).map((set, idx) =>
                (
                  <Grid key={set.dataset.name} item xs={12}>
                    <CardWrapper style={{ width: '100%', height: '100%' }}>
                      <DatasetView set={set.dataset} position={position} />
                    </CardWrapper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </div>
        )}
      </AppCtx.Provider>
    </>
  )
}
