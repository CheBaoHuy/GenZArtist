import {BooleanInput, Edit, ImageField, ImageInput, NumberInput, SelectInput, SimpleForm, TextInput} from "react-admin";
import React from "react";

export const UserEdit = ()=> {
    const roles = [
        {id: 1, name : 'ADMIN'},
        {id:2,name:'USER'}
    ]
    return (
        <Edit>
            <SimpleForm>
                <TextInput source={"id"} label={"ID"}/>
                <TextInput source={"email"} label={"Email"}/>
                <NumberInput source={"phone"} label={"Số điện thoại"}/>
                <TextInput source={"fullName"} label={"Họ và tên"}/>
                <ImageField source="avatar" label="Ảnh gốc"/>
                <ImageInput source="avatar" label={"Thêm ảnh mới"} accept="image/*">
                    <ImageField source="src"/>
                </ImageInput>
                <SelectInput
                    source="role.id"
                    choices={roles.map(i => ({
                        id: i.id,
                        name: i.name
                    }))}
                    optionValue="id"
                    optionText="name"
                    label="Quyền" />
                <BooleanInput source={"status"} label={"Trạng thái"}/>
            </SimpleForm>
        </Edit>
    )
}