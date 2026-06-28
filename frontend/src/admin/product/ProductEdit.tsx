import React from "react";
import {
    Edit,
    ImageField,
    NumberInput,
    required,
    SelectInput,
    SimpleForm,
    TextInput,
    useGetList,
} from "react-admin";

const STATUS_CHOICES = [
    { id: "PENDING", name: "Chờ duyệt" },
    { id: "APPROVED", name: "Đã duyệt" },
    { id: "REJECTED", name: "Từ chối" },
    { id: "INACTIVE", name: "Ngừng bán" },
    { id: "BANNED", name: "Bị khóa" },
];

export const ProductEdit = () => {
    const { data: categories = [] } = useGetList("category", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "id", order: "ASC" },
    });

    return (
        <Edit mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="id" label="ID" disabled />
                <TextInput source="name" label="Tên sản phẩm" validate={required()} fullWidth />
                <TextInput source="description" label="Mô tả" multiline fullWidth />
                <NumberInput source="price" label="Giá (VND)" validate={required()} />
                <ImageField source="imageUrl" label="Ảnh hiện tại" />
                <TextInput source="imageUrl" label="Ảnh preview (URL)" fullWidth />
                <TextInput source="fileUrl" label="File gốc (URL)" fullWidth />
                <SelectInput
                    source="categoryId"
                    label="Danh mục"
                    choices={categories}
                    optionValue="id"
                    optionText="name"
                    validate={required()}
                />
                <SelectInput
                    source="status"
                    label="Trạng thái"
                    choices={STATUS_CHOICES}
                    validate={required()}
                />
            </SimpleForm>
        </Edit>
    );
};
