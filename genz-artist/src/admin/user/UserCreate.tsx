import {Create, ImageField, ImageInput, NumberInput, SelectInput, SimpleForm, TextInput, useGetList} from "react-admin";
import React from "react";

export const UserCreate = ()=> {
    const roles = [
        {id: 1, name : 'ADMIN'},
        {id:2,name:'USER'}
    ]

    return (
        <Create>
            <SimpleForm>
                <TextInput source={"username"} label={"Tên người dùng"}/>
                <TextInput source={"password"} label={"Mật khẩu"}/>
                <TextInput source={"email"} label={"Email"}/>
                <NumberInput source={"phone"} label={"Số điện thoại"}/>
                <TextInput source={"fullName"} label={"Họ và tên"}/>
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
            </SimpleForm>
        </Create>
    )
}