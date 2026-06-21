
import {
    BooleanInput,
    Edit,
    ImageField,
    ImageInput,
    SimpleForm,
    TextInput,
} from "react-admin";

import { RichTextInput } from "ra-input-rich-text";

export const BlogEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput source="id" disabled />

                <TextInput source="title" />

                <RichTextInput source="content" />

                {/* Ảnh hiện tại */}
                <ImageField source="thumbnail" label="Ảnh gốc" />

                {/* Upload ảnh mới (React Admin v5+) */}
                <ImageInput
                    source="thumbnail"
                    label="Thêm ảnh mới"
                    options={{
                        accept: {
                            "image/*": [],
                        },
                    }}
                >
                    <ImageField source="src" />
                </ImageInput>

                <BooleanInput source="status" />
            </SimpleForm>
        </Edit>
    );
};

