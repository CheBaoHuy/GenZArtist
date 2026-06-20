import {
    BooleanInput,
    DateInput,
    Edit,
    ImageField, ImageInput,
    NumberInput,
    SelectInput,
    SimpleForm,
    TextInput,
    useGetList
} from 'react-admin';
import {useEffect, useState} from "react";
import {Category} from "../../models";

export const ProductEdit = () => {

    const [categories, setCategories] = useState<Category[]>([])
    const {data: listCategory} = useGetList('category', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'id', order: 'ASC' },
    })

    useEffect(()=> {
        if (listCategory) {
            setCategories(listCategory.filter(category => category.parentCategory !== null))
        }
    })
    // const imageFile  = useWat({name: 'image'});
    return (
        <Edit>
            <SimpleForm>
                <TextInput source="id"/>
                {/*<NumberInput source="category.id"/>*/}
                <SelectInput
                    source="category.id"
                    label="Danh mục"
                    choices={categories.map(category => ({
                        id: category.id,
                        name: category.name
                    }))}
                    optionValue="id"
                    optionText="name"
                    fullWidth
                />
                <TextInput source="title"/>
                <ImageField source="image" label="Ảnh gốc"/>
                <ImageInput source="image" label={"Thêm ảnh mới"} accept="image/*">
                    <ImageField source="src"/>
                </ImageInput>
                <NumberInput source="oldPrice"/>
                <NumberInput source="currentPrice"/>
                <NumberInput source="quantity"/>
                <TextInput source="description"/>
                <TextInput source="author"/>
                <TextInput source="publisher"/>
                <NumberInput source="publishYear"/>
                <BooleanInput source="active"/>
            </SimpleForm>
        </Edit>
    )
};