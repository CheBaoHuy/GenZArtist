import {
    BooleanField,
    Datagrid,
    DeleteButton,
    EditButton, FilterList, FilterListItem, FilterLiveSearch,
    List,
    TextField,
    useDataProvider,
    useNotify,
    useRefresh,
} from 'react-admin';
import React from "react";
import {Card, CardContent} from "@mui/material";

export const CategoryList = () => {
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const handleStatus= async (record: any,event: React.MouseEvent) => {
        event.stopPropagation()
        try {
            // Gửi yêu cầu cập nhật trạng thái người dùng
            await dataProvider.update('discount', {
                id: record.id,
                data: {...record, status: !record.status},
                previousData: record
            });
            // Hiển thị thông báo thành công
            notify('Thay đổi trạng thái thành công', {type: 'success'});
            // Làm mới danh sách
            refresh();
        } catch ({message}) {
            // Hiển thị thông báo lỗi
            notify(`Error: ${message}`, {type: 'warning'});
        }
    }
    return (
        <List aside={<CategoryFilterSidebar/>}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" label={"Tên"}/>
            <TextField source="parentCategory.name" label={"Danh mục cha"}/>
            <BooleanField source="active" label={"Trạng thái"}/>
            {/* <EditButton label={"Chỉnh sửa"}/> */}
            <DeleteButton label={""}/>
        </Datagrid>
    </List>
    )
};
const CategoryFilterSidebar = () => {

    return (
        <Card sx={{order: -1, mr: 2, mt: 6, width: 200}}>
            <CardContent>
                <FilterLiveSearch label={'Tìm...'}/>
                <FilterList label="Đang bán" icon={null}>
                    <FilterListItem label="Có" value={{status: true}}/>
                    <FilterListItem label="Không" value={{status: false}}/>
                </FilterList>
            </CardContent>
        </Card>
    )
}