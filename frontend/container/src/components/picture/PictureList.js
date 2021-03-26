import MaterialTable from "material-table";

import { MatTableIcons } from "../../shared";

const PictureList = ({ pictureList, ...props }) => {
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
    />
  );
};

export default PictureList;
