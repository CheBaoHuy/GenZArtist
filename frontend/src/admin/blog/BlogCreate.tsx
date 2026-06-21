
import {
    Create,
    SimpleForm,
    TextInput,
    ImageField,
    ImageInput,
} from "react-admin";

import { RichTextInput } from "ra-input-rich-text";

export const BlogCreate = () => {
    return (
        <Create>
            <SimpleForm>
                <TextInput source="title" label="Tiêu đề" />

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

                <RichTextInput source="content" />
            </SimpleForm>
        </Create>
    );
};

