import React from "react";
import {
    BulkDeleteButton,
    Datagrid,
    DateField,
    DeleteButton,
    EditButton,
    FilterList,
    FilterListItem,
    FilterLiveSearch,
    FunctionField,
    ImageField,
    List,
    NumberField,
    TextField,
} from "react-admin";
import { Card, CardContent, Chip } from "@mui/material";

const STATUS_META: Record<string, { label: string; color: any }> = {
    PENDING: { label: "Chờ duyệt", color: "warning" },
    APPROVED: { label: "Đã duyệt", color: "success" },
    REJECTED: { label: "Từ chối", color: "error" },
    INACTIVE: { label: "Ngừng bán", color: "default" },
    BANNED: { label: "Bị khóa", color: "error" },
};

export const ProductList = () => (
    <List aside={<ProductFilterSidebar />}>
        <Datagrid
            rowClick="edit"
            bulkActionButtons={<BulkDeleteButton mutationMode="pessimistic" />}
        >
            <TextField source="id" label="ID" />
            <ImageField source="imageUrl" label="Ảnh" sx={{ "& img": { maxWidth: 60, maxHeight: 60 } }} />
            <TextField source="name" label="Tên sản phẩm" />
            <NumberField
                source="price"
                label="Giá"
                options={{ style: "currency", currency: "VND" }}
            />
            <TextField source="seller.fullName" label="Người bán" />
            <FunctionField
                label="Trạng thái"
                render={(record: any) => {
                    const meta = STATUS_META[record.status] || { label: record.status, color: "default" };
                    return <Chip size="small" label={meta.label} color={meta.color} />;
                }}
            />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <EditButton />
            <DeleteButton
                mutationMode="pessimistic"
                confirmTitle="Xóa sản phẩm"
                confirmContent="Bạn có chắc chắn muốn xóa sản phẩm này không?"
            />
        </Datagrid>
    </List>
);

const ProductFilterSidebar = () => (
    <Card sx={{ order: -1, mr: 2, mt: 6, width: 200 }}>
        <CardContent>
            <FilterLiveSearch label="Tìm..." />
            <FilterList label="Trạng thái" icon={null}>
                <FilterListItem label="Chờ duyệt" value={{ status: "PENDING" }} />
                <FilterListItem label="Đã duyệt" value={{ status: "APPROVED" }} />
                <FilterListItem label="Từ chối" value={{ status: "REJECTED" }} />
                <FilterListItem label="Ngừng bán" value={{ status: "INACTIVE" }} />
                <FilterListItem label="Bị khóa" value={{ status: "BANNED" }} />
            </FilterList>
        </CardContent>
    </Card>
);
