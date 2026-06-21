
import { useMemo } from "react";
import {
    Create,
    ImageField,
    ImageInput,
    NumberInput,
    SelectInput,
    SimpleForm,
    TextInput,
    useGetList
} from "react-admin";

import { RichTextInput } from "ra-input-rich-text";

export const ProductCreate = () => {
    const { data: listCategory } = useGetList("category", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "id", order: "ASC" },
    });

    const categories = useMemo(() => {
        if (!listCategory) return [];
        return listCategory.filter(
            (category: any) => category.parentCategory !== null
        );
    }, [listCategory]);

    return (
        <Create>
            <SimpleForm>
                <TextInput source="title" />

                <ImageInput
                    source="image"
                    label="Thêm ảnh mới"
                    options={{
                        accept: {
                            "image/*": []
                        }
                    }}
                >
                    <ImageField source="src" />
                </ImageInput>

                <SelectInput
                    source="category.id"
                    label="Danh mục"
                    choices={categories.map((category: any) => ({
                        id: category.id,
                        name: category.name,
                    }))}
                    optionValue="id"
                    optionText="name"
                />

                <RichTextInput source="description" />

                <NumberInput source="currentPrice" />
                <NumberInput source="quantity" />

                <TextInput source="author" />
                <TextInput source="publisher" />
                <NumberInput source="publish_year" />
            </SimpleForm>
        </Create>
    );
};

