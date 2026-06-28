import React from "react";
import {
    Edit,
    required,
    SelectInput,
    SimpleForm,
    TextInput,
    useGetList,
} from "react-admin";
import { RATING_CHOICES } from "./RatingField";

export const ProductReviewEdit = () => {
    const { data: products = [] } = useGetList("product", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "id", order: "ASC" },
    });
    const { data: users = [] } = useGetList("user", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "id", order: "ASC" },
    });

    const userChoices = users.map((u: any) => ({
        id: u.id,
        name: `${u.fullName || "(không tên)"} — ${u.email}`,
    }));

    return (
        <Edit mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="id" label="ID" disabled />
                <SelectInput
                    source="productId"
                    label="Sản phẩm"
                    choices={products}
                    optionValue="id"
                    optionText="name"
                    validate={required()}
                    fullWidth
                />
                <SelectInput
                    source="reviewerId"
                    label="Người đánh giá"
                    choices={userChoices}
                    validate={required()}
                    fullWidth
                />
                <SelectInput
                    source="rating"
                    label="Số sao"
                    choices={RATING_CHOICES}
                    validate={required()}
                />
                <TextInput source="comment" label="Nhận xét" multiline fullWidth />
            </SimpleForm>
        </Edit>
    );
};
