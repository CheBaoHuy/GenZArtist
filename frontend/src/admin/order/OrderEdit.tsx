import React from "react";
import {
    ArrayField,
    Datagrid,
    Edit,
    NumberField,
    required,
    SelectInput,
    SimpleForm,
    TextField,
    TextInput,
} from "react-admin";

const ORDER_STATUS_CHOICES = [
    { id: "PENDING", name: "Chờ xử lý" },
    { id: "ACCEPTED", name: "Đã duyệt" },
    { id: "REJECTED", name: "Từ chối" },
    { id: "SHIPPING", name: "Đang giao" },
    { id: "DELIVERED", name: "Đã giao" },
    { id: "COMPLETED", name: "Hoàn thành" },
    { id: "CANCELLED", name: "Đã hủy" },
    { id: "REFUNDED", name: "Đã hoàn tiền" },
];

const PAYMENT_STATUS_CHOICES = [
    { id: "PENDING", name: "Chưa thanh toán" },
    { id: "PAID", name: "Đã thanh toán" },
];

const PAYMENT_METHOD_CHOICES = [
    { id: "VNPAY", name: "VNPAY" },
    { id: "MOMO", name: "MOMO" },
];

export const OrderEdit = () => (
    <Edit mutationMode="pessimistic">
        <SimpleForm>
            <TextInput source="orderId" label="Mã đơn" disabled />
            <TextInput source="buyerName" label="Người mua" disabled />
            <SelectInput
                source="orderStatus"
                label="Trạng thái đơn"
                choices={ORDER_STATUS_CHOICES}
                validate={required()}
            />
            <SelectInput
                source="paymentStatus"
                label="Trạng thái thanh toán"
                choices={PAYMENT_STATUS_CHOICES}
            />
            <SelectInput
                source="paymentMethod"
                label="Phương thức thanh toán"
                choices={PAYMENT_METHOD_CHOICES}
            />
            <ArrayField source="items" label="Sản phẩm trong đơn">
                <Datagrid bulkActionButtons={false}>
                    <TextField source="name" label="Tên" />
                    <NumberField
                        source="unitPrice"
                        label="Đơn giá"
                        options={{ style: "currency", currency: "VND" }}
                    />
                    <NumberField source="quantity" label="Số lượng" />
                </Datagrid>
            </ArrayField>
        </SimpleForm>
    </Edit>
);
