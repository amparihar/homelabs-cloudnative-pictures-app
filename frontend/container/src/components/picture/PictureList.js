import React from "react";
import MaterialTable from "material-table";

import { MatTableIcons } from "../../shared";

const PictureList = ({ pictureList, deletePictures }) => {
  const { isLoading, data } = pictureList;
  const columns = [
    {
      title: "Picture Name",
      field: "key",
    },
    {
      title: "Last Modified",
      field: "lastModified",
    },
  ];
  return (
    <MaterialTable
      title="My Pictures"
      columns={columns}
      data={data}
      icons={MatTableIcons}
      isLoading={isLoading}
      options={{ search: true, selection: true }}
      actions={[
        {
          tooltip: "Remove Selected Picture(s)",
          icon: MatTableIcons.Delete,
          onClick: deletePictures,
        },
      ]}
    />
  );
};

export default React.memo(PictureList);
