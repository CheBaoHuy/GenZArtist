import React from "react";
import {
    BulkDeleteButton,
    Datagrid,
    DateField,
    DeleteButton,
    EditButton,
    FunctionField,
    List,
    TextField,
} from "react-admin";
import { RatingStars } from "./RatingField";

export const ProductReviewList = () => (
    <List sort={{ field: "createdAt", order: "DESC" }}>
        <Datagrid
            rowClick="edit"
            bulkActionButtons={<BulkDeleteButton mutationMode="pessimistic" />}
        >
            <TextField source="id" label="ID" />
            <TextField source="productName" label="Sản phẩm" />
            <TextField source="reviewerName" label="Người đánh giá" />
            <FunctionField
                label="Số sao"
                render={(record: any) => <RatingStars value={record.rating} />}
            />
            <TextField source="comment" label="Nhận xét" />
            <DateField source="createdAt" label="Ngày đánh giá" showTime />
            <EditButton />
            <DeleteButton
                mutationMode="pessimistic"
                confirmTitle="Xóa đánh giá"
                confirmContent="Bạn có chắc chắn muốn xóa đánh giá này không?"
            />
        </Datagrid>
    </List>
);
