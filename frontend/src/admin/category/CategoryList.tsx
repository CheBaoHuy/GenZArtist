import React from "react";
import {
    BulkDeleteButton,
    Datagrid,
    DeleteButton,
    EditButton,
    List,
    TextField,
} from "react-admin";

export const CategoryList = () => (
    <List>
        <Datagrid
            rowClick="edit"
            bulkActionButtons={<BulkDeleteButton mutationMode="pessimistic" />}
        >
            <TextField source="id" label="ID" />
            <TextField source="name" label="Tên danh mục" />
            <EditButton />
            <DeleteButton
                mutationMode="pessimistic"
                confirmTitle="Xóa danh mục"
                confirmContent="Bạn có chắc chắn muốn xóa danh mục này không?"
            />
        </Datagrid>
    </List>
);
