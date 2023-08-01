import React from "react";
import { MaterialReactTable } from 'material-react-table';

import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const PictureList = ({ pictureList, deletePictures }) => {
  const { isLoading, data } = pictureList;
  const columns = [
    {
      header: "Picture Name",
      accessorKey: "key",
    },
    {
      header: "Last Modified",
      accessorKey: "lastModified",
    },
  ];
  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement="right" title="Delete">
              <IconButton color="error" onClick={() => deletePictures(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
    />
  );
};

export default React.memo(PictureList);
