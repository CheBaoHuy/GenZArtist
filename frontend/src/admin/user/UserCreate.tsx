import React from "react";
import {
    Create,
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

export const UserCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <TextInput source="email" label="Email" type="email" validate={required()} fullWidth />
            <PasswordInput source="password" label="Mật khẩu" validate={required()} fullWidth />
            <TextInput source="fullName" label="Họ và tên" validate={required()} fullWidth />
            <TextInput source="phoneNumber" label="Số điện thoại" fullWidth />
            <TextInput source="avatarUrl" label="Ảnh đại diện (URL)" fullWidth />
            <SelectInput
                source="role"
                label="Quyền"
                choices={ROLE_CHOICES}
                defaultValue="BUYER"
                validate={required()}
            />
            <SelectInput
                source="status"
                label="Trạng thái"
                choices={STATUS_CHOICES}
                defaultValue="ACTIVE"
                validate={required()}
            />
        </SimpleForm>
    </Create>
);
