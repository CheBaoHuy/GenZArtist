import React from "react";
import { Create, required, SimpleForm, TextInput } from "react-admin";

export const CategoryCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <TextInput source="name" label="Tên danh mục" validate={required()} fullWidth />
        </SimpleForm>
    </Create>
);
