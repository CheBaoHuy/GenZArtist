import {
    BooleanField,
    Datagrid,
    DateField, DeleteButton,
    FilterList, FilterListItem,
    FilterLiveSearch,
    FunctionField,
    List,
    TextField, useDataProvider, useNotify, useRefresh
} from 'react-admin';
import {Star, StarBorder} from "@mui/icons-material"
import {Button, Card, CardContent} from "@mui/material";
import React from "react";
export const ReviewList = () =>{
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const handleStatus= async (record: any, event: React.MouseEvent) => {
        event.stopPropagation()
        try {
            // Gửi yêu cầu cập nhật trạng thái người dùng
            await dataProvider.update('review', {
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
    return  (
        <List aside={<ReviewFilterSidebar/>}>
            <Datagrid rowClick={"show"}>
                <TextField source="comment" label={"Nhận xét"}/>
                <FunctionField label={"Số sao"} render={
                    (record : any) => {
                        return [...Array(5)].map((_, index) => index < record.rating ? <Star key={index} color="primary" /> :
                            <StarBorder key={index} color="primary"/>
                        );}
                }/>
                <DateField source="createdAt"  label={"Ngày đánh giá"}/>
                <FunctionField label={"Trạng thái"} render={(record: any) => (
                    <Button onClick={(event) => handleStatus(record, event)} color={record.status ? 'primary' : 'error'}>
                        {record.status ? 'Hoạt động' : 'Tạm dừng'}
                    </Button>
                )}/>
                <DeleteButton label={""}/>
            </Datagrid>
        </List>
    )
};
const ReviewFilterSidebar = () => {
    return (
        <Card sx={{order: -1, mr: 2, mt: 6, width: 200}}>
            <CardContent>
                <FilterLiveSearch label={'Tìm...'}/>
                <FilterList label="Trạng thái" icon={null}>
                    <FilterListItem label="Đã duyệt" value={{status: true}}/>
                    <FilterListItem label="Chưa duyệt" value={{status: false}}/>
                </FilterList>
            </CardContent>
        </Card>
    )
}