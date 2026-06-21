import axios from "axios";

export const imgUpload = async (file: any) => {
    const formData = new FormData();
    formData.append('image', file.rawFile);
    try {
        const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
            params: {
                key: 'd93fdf2d91f1de505c0a4ac7bfc09d04',
            },
        });
        if (response.data && response.data.data && response.data.data.url) {
            return response.data.data.url;
        } else {
            throw new Error('Invalid response from imgBB');
        }
    } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
    }
};