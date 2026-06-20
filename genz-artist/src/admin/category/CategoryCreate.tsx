import {useEffect, useState} from "react";
import {Category} from "../../models";
import {BooleanField, Create, Edit, SelectInput, SimpleForm, TextField, TextInput, useGetList} from "react-admin";

export const CategoryCreate = () => {
    const [categories, setCategories] = useState<Category[]>([])
    const {data: listCategory} = useGetList('category', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'id', order: 'ASC' },
    })

    useEffect(()=> {
        if (listCategory) {
            setCategories(listCategory.filter(category => category.parentCategory === null))
        }
    })

    return (
        <Create>
            <SimpleForm>
                <TextInput source="name" />
                <SelectInput
                    source="parentCategory.id"
                    label="Danh mục"
                    choices={categories.map(category => ({
                        id: category.id,
                        name: category.name
                    }))}
                    optionValue="id"
                    optionText="name"
                />
            </SimpleForm>
        </Create>
    )
}