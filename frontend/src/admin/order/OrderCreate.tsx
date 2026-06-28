import React from "react";
import {
    ArrayInput,
    Create,
    NumberInput,
    required,
    SelectInput,
    SimpleForm,
    SimpleFormIterator,
    useGetList,
} from "react-admin";

const ORDER_STATUS_CHOICES = [
    { id: "PENDING", name: "Chờ xử lý" },
    { id: "ACCEPTED", name: "Đã duyệt" },
    { id: "COMPLETED", name: "Hoàn thành" },
    { id: "CANCELLED", name: "Đã hủy" },
];

const PAYMENT_METHOD_CHOICES = [
    { id: "VNPAY", name: "VNPAY" },
    { id: "MOMO", name: "MOMO" },
];

export const OrderCreate = () => {
    const { data: users = [] } = useGetList("user", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "id", order: "ASC" },
    });
    const { data: products = [] } = useGetList("product", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "id", order: "ASC" },
    });

    const buyerChoices = users.map((u: any) => ({
        id: u.id,
        name: `${u.fullName || "(không tên)"} — ${u.email}`,
    }));

    return (
        <Create redirect="list">
            <SimpleForm>
                <SelectInput
                    source="buyerId"
                    label="Người mua"
                    choices={buyerChoices}
                    validate={required()}
                    fullWidth
                />
                <SelectInput
                    source="paymentMethod"
                    label="Phương thức thanh toán"
                    choices={PAYMENT_METHOD_CHOICES}
                    defaultValue="VNPAY"
                    validate={required()}
                />
                <SelectInput
                    source="orderStatus"
                    label="Trạng thái"
                    choices={ORDER_STATUS_CHOICES}
                    defaultValue="PENDING"
                />
                <ArrayInput source="items" label="Sản phẩm" validate={required()}>
                    <SimpleFormIterator inline>
                        <SelectInput
                            source="productId"
                            label="Sản phẩm"
                            choices={products}
                            optionValue="id"
                            optionText="name"
                            validate={required()}
                        />
                        <NumberInput
                            source="quantity"
                            label="Số lượng"
                            defaultValue={1}
                            min={1}
                            validate={required()}
                        />
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Create>
    );
};
