import React from "react";
import { Edit, required, SimpleForm, TextInput } from "react-admin";

export const CategoryEdit = () => (
    <Edit mutationMode="pessimistic">
        <SimpleForm>
            <TextInput source="id" label="ID" disabled />
            <TextInput source="name" label="Tên danh mục" validate={required()} fullWidth />
        </SimpleForm>
    </Edit>
);
