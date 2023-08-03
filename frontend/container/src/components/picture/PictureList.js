import React from "react";

import { MaterialReactTable } from 'material-react-table';
import { Box } from '@mui/material';
import { Delete } from '@mui/icons-material';

const PictureList = ({ pictureList, deletePictures }) => {
  const { isLoading, data } = pictureList;
  const handleDeleteRows = (rows) => {
    deletePictures(rows.map((row) => row.original));
  };
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
      enableRowSelection
      getRowId={(row) => row.key} //give each row a more useful id
      renderTopToolbarCustomActions={({ table }) => (
        <Box
          sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}
        >
          <Button
            disabled={
              !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            }
            //only export selected rows
            onClick={() => handleDeleteRows(table.getSelectedRowModel().rows)}
            startIcon={<Delete />}
            variant="contained"
          >
            Delete Selected Rows
          </Button>
        </Box>
      )}
    />
  );
};

export default React.memo(PictureList);
