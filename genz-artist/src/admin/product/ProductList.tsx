import React, {useEffect, useState} from "react";
import {
    Datagrid,
    DeleteButton,
    EditButton, FilterList, FilterListItem, FilterLiveSearch, FunctionField,
    ImageField,
    List,
    NumberField,
    TextField, useDataProvider, useGetList, useNotify, useRefresh
} from 'react-admin';
import {Button, Card, CardContent} from "@mui/material";
import {Category} from "../../models";

export const ProductList = () => {
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const handleStatus= async (record: any, event: React.MouseEvent) => {
        event.stopPropagation()
        try {
            // Gửi yêu cầu cập nhật trạng thái người dùng
            await dataProvider.update('product', {
                id: record.id,
                data: {...record, active: !record.active},
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
        <List aside={<ProductFilterSidebar/>}>
            <Datagrid rowClick="show">
                {/*<TextField source="id"/>*/}
                <NumberField source="category.name" label={"Danh mục"}/>
                <TextField source="title" label={"Tên"}/>
                <ImageField source="image" label={"Ảnh"}/>
                <NumberField source="currentPrice" label={"Giá"}/>
                <NumberField source="quantity" label={"Số lượng"}/>
                {/*<BooleanField source="active" />*/}
                <FunctionField label={"Trạng thái"} render={(record: any) => (
                    <Button onClick={(event) => handleStatus(record, event)} color={record.active ? 'primary' : 'error'}>
                        {record.active ? 'Đang bán' : 'Dừng bán'}
                    </Button>
                )}/>
                <EditButton label={""}/>
                <DeleteButton label={""}/>
            </Datagrid>
        </List>
    )
};
const ProductFilterSidebar= () => {
    const [categories, setCategories] = useState<Category[]>([])
    const {data: listCategory} = useGetList('category', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'id', order: 'ASC' },
    })

    useEffect(()=> {
        if (listCategory) {
            setCategories(listCategory.filter(category => category.parentCategory !== null))
        }
    },[listCategory])
    return (
        <Card sx={{order: -1, mr: 2, mt: 9, width: 200}}>
            <CardContent>
                <FilterLiveSearch label={'Tìm...'}/>
                <FilterList label="Danh mục" icon={null}>
                    {categories.map((item, index) => (
                        <FilterListItem label={item.name} value={{category: item.id}} key={index}/>
                        ))}
                </FilterList>
                <FilterList label="Đang bán" icon={null}>
                    <FilterListItem label="Có" value={{status: true}}/>
                    <FilterListItem label="Không" value={{status: false}}/>
                </FilterList>
            </CardContent>
        </Card>
    )
};