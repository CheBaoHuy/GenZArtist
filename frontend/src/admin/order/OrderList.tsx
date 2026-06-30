import React from "react";
import {
    BulkDeleteButton,
    Datagrid,
    DateField,
    DeleteButton,
    EditButton,
    FilterList,
    FilterListItem,
    FunctionField,
    List,
    NumberField,
    TextField,
} from "react-admin";
import { Card, CardContent, Chip } from "@mui/material";

export const ORDER_STATUS: Record<string, { label: string; color: any }> = {
    PENDING: { label: "Chờ xử lý", color: "warning" },
    ACCEPTED: { label: "Đã duyệt", color: "info" },
    REJECTED: { label: "Từ chối", color: "error" },
    SHIPPING: { label: "Đang giao", color: "info" },
    DELIVERED: { label: "Đã giao", color: "success" },
    COMPLETED: { label: "Hoàn thành", color: "success" },
    CANCELLED: { label: "Đã hủy", color: "default" },
    REFUNDED: { label: "Đã hoàn tiền", color: "secondary" },
};

export const PAYMENT_PHASE: Record<string, { label: string; color: any }> = {
    UNPAID: { label: "Chưa thanh toán", color: "default" },
    DEPOSIT_PAID: { label: "Đã cọc 30%", color: "warning" },
    FULLY_PAID: { label: "Đã thanh toán đủ", color: "success" },
};

export const OrderList = () => (
    <List sort={{ field: "createdAt", order: "DESC" }} aside={<OrderFilterSidebar />}>
        <Datagrid
            rowClick="edit"
            bulkActionButtons={<BulkDeleteButton mutationMode="pessimistic" />}
        >
            <TextField source="orderId" label="Mã đơn" />
            <TextField source="buyerName" label="Người mua" />
            <NumberField
                source="totalAmount"
                label="Tổng tiền"
                options={{ style: "currency", currency: "VND" }}
            />
            <NumberField
                source="depositAmount"
                label="Cọc 30%"
                options={{ style: "currency", currency: "VND" }}
            />
            <FunctionField
                label="Thanh toán"
                render={(record: any) => {
                    const meta = PAYMENT_PHASE[record.paymentPhase] || { label: record.paymentPhase || "—", color: "default" };
                    return <Chip size="small" label={meta.label} color={meta.color} />;
                }}
            />
            <FunctionField
                label="Trạng thái"
                render={(record: any) => {
                    const meta = ORDER_STATUS[record.orderStatus] || { label: record.orderStatus, color: "default" };
                    return <Chip size="small" label={meta.label} color={meta.color} />;
                }}
            />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <EditButton />
            <DeleteButton
                mutationMode="pessimistic"
                confirmTitle="Xóa đơn hàng"
                confirmContent="Bạn có chắc chắn muốn xóa đơn hàng này không?"
            />
        </Datagrid>
    </List>
);

const OrderFilterSidebar = () => (
    <Card sx={{ order: -1, mr: 2, mt: 6, width: 200 }}>
        <CardContent>
            <FilterList label="Trạng thái" icon={null}>
                {Object.entries(ORDER_STATUS).map(([value, meta]) => (
                    <FilterListItem key={value} label={meta.label} value={{ orderStatus: value }} />
                ))}
            </FilterList>
        </CardContent>
    </Card>
);
