import {Edit, NumberInput, TextInput, SimpleForm, SelectInput} from "react-admin";
// import React from "react";

export const OrderEdit = () => {
    const statusChoices = [
        { id: 1, name: 'Đang chờ' },
        { id: 2, name: 'Đã duyệt' },
        { id: 3, name: 'Đã hủy' }
    ];
    return (
        <Edit>
            <SimpleForm>
                <TextInput source="id" label={"ID"}/>
                <TextInput source="fullName" label={"Họ và Tên"}/>
                <NumberInput source="phone" label={"SĐT"}/>
                <SelectInput
                    source="orderStatus.id"
                    choices={statusChoices.map(i => ({
                        id: i.id,
                        name: i.name
                    }))}
                    optionValue="id"
                    optionText="name"
                    label="Trạng thái" />
            </SimpleForm>
        </Edit>
    )
}