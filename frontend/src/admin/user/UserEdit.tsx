import React from "react";
import {
    Edit,
    PasswordInput,
    required,
    SelectInput,
    SimpleForm,
    TextInput,
} from "react-admin";

const ROLE_CHOICES = [
    { id: "ADMIN", name: "Quản trị" },
    { id: "SELLER", name: "Người bán" },
    { id: "BUYER", name: "Người mua" },
];

const STATUS_CHOICES = [
    { id: "ACTIVE", name: "Hoạt động" },
    { id: "BANNED", name: "Đã khóa" },
];

export const UserEdit = () => (
    <Edit mutationMode="pessimistic">
        <SimpleForm>
            <TextInput source="id" label="ID" disabled />
            <TextInput source="email" label="Email" type="email" validate={required()} fullWidth />
            <PasswordInput source="password" label="Mật khẩu mới (để trống nếu giữ nguyên)" fullWidth />
            <TextInput source="fullName" label="Họ và tên" validate={required()} fullWidth />
            <TextInput source="phoneNumber" label="Số điện thoại" fullWidth />
            <TextInput source="avatarUrl" label="Ảnh đại diện (URL)" fullWidth />
            <SelectInput
                source="role"
                label="Quyền"
                choices={ROLE_CHOICES}
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
