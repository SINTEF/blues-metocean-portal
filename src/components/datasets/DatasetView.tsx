import React from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary } from '@mui/material';
import AccordionDetails from '@mui/material/AccordionDetails';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import moment from "moment";
import { Dataset } from '../../Types';
import { DatasetVariableTable } from './DatasetVariableTable';
import { LatLng } from 'leaflet';
export const DatasetView = (props: { set: Dataset, position: LatLng  }): JSX.Element => {
  const { set,position } = props
  return (
    <>
      <Accordion>
        <AccordionSummary sx={{ flexDirection: "row-reverse" }}
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography>{set.name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>{set.description}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Data from</TableCell>
                <TableCell>{moment((set.fromDate)).format('MMMM D, YYYY')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Found here</TableCell>
                <TableCell><a href={set.url}>{set.url}</a></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <DatasetVariableTable set={set} position={position}></DatasetVariableTable>
        </AccordionDetails>
      </Accordion>
    </>
  )
}
