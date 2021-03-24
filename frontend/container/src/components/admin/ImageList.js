import MaterialTable from "material-table";

import { MatTableIcons } from "../../shared";

const ImageList = ({ imageList, ...props }) => {
  const { isLoading, data } = imageList;
  const columns = [
    {
      title: "Image Name",
      field: "key",
    },
    {
      title: "Last Modified",
      field: "lastModified",
    },
  ];
  return (
    <MaterialTable
      title="My Images"
      columns={columns}
      data={data}
      icons={MatTableIcons}
      isLoading={isLoading}
      options={{ search: true, selection: true }}
    />
  );
};

export default ImageList;
