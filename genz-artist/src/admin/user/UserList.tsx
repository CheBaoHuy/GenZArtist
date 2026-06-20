import React from "react";
import {
    BooleanField,
    Datagrid,
    EditButton,
    FilterList,
    FilterListItem,
    FilterLiveSearch,
    FunctionField,
    List,
    NumberField,
    TextField,
    useDataProvider,
    useNotify, useRefresh
} from "react-admin";
import {Button, Card, CardContent} from "@mui/material";

export const UserList = () => {
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const handleStatus= async (record: any, event: React.MouseEvent) => {
        event.stopPropagation()
        try {
            // Gửi yêu cầu cập nhật trạng thái người dùng
            await dataProvider.update('user', {
                id: record.id,
                data: {...record, status: !record.status},
                previousData: record
            });
            // Hiển thị thông báo thành công
            notify('Thay đổi trạng thái thành công', {type: 'success'});
            // Làm mới danh sách
            refresh();
        } catch (error) {
            // Hiển thị thông báo lỗi
            notify(`Error: ` + error ,{type: 'warning'});
        }
    }
    return (
        <List aside={<UserFilterSidebar/>}>
            <Datagrid rowClick="edit">
                <TextField source="username" label={"Tên tài khoản"}/>
                {/*<TextField source="password" />*/}
                <TextField source="role.name" label={"Quyền"}/>
                <FunctionField label={"Trạng thái"} render={(record: any) => (
                    <Button onClick={(event) => handleStatus(record, event)} color={record.status ? 'primary' : 'error' }>
                        {record.status ? 'Hoạt động' : 'Đã khóa' }
                    </Button>
                )}/>
                <EditButton/>
            </Datagrid>
        </List>
    )
};
const UserFilterSidebar = () => {
    return (
        <Card sx={{order: -1, mr: 2, mt: 6, width: 200}}>
            <CardContent>
                <FilterLiveSearch label={'Tìm...'}/>
                <FilterList label="Trạng thái" icon={null}>
                    <FilterListItem label="Hoạt động" value={{status: true}}/>
                    <FilterListItem label="Đã khóa" value={{status: false}}/>
                </FilterList>
            </CardContent>
        </Card>
    )
}