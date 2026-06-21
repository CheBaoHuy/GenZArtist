import {
    BooleanField,
    Datagrid,
    DateField, DeleteButton, FilterList, FilterListItem, FilterLiveSearch,
    FunctionField,
    List,
    TextField,
    useDataProvider,
    useNotify, useRefresh
} from 'react-admin';
import {Button, Card, CardContent} from "@mui/material";
// import React from "react";

export const BlogList = () => {
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const handleStatus= async (record: any) => {
        try {
            // Gửi yêu cầu cập nhật trạng thái người dùng
            await dataProvider.update('blog', {
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
        <List aside={<BlogFilterSidebar/>}>
            <Datagrid rowClick="edit">
                <TextField source="title" label={"Tiêu đề"}/>
                <DateField source="createdAt" label={"Ngày đăng"}/>
                <FunctionField label={"Trạng thái"} render={(record: any) => (
                    <Button onClick={() => handleStatus(record)} color={record.status ? 'primary' : 'error'}>
                        {record.status ? 'Hoạt động' : 'Tạm dừng'}
                    </Button>
                )}/>
                <DeleteButton label={""}/>
            </Datagrid>
        </List>
    )
};
const BlogFilterSidebar = () => {
    return (
        <Card sx={{order: -1, mr: 2, mt: 6, width: 200}}>
            <CardContent>
                <FilterLiveSearch label={'Tìm...'}/>
                <FilterList label="Trạng thái" icon={null}>
                    <FilterListItem label="Hoạt động" value={{status: true}}/>
                    <FilterListItem label="Tạm dừng" value={{status: false}}/>
                </FilterList>
            </CardContent>
        </Card>
    )
}