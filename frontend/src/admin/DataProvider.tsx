import {DataProvider, fetchUtils} from "react-admin";
import {imgUpload} from "./img/imageUpload";

const apiUrl = 'http://localhost:8080/api/v1';

// Wrapper tự động đính kèm JWT (Bearer) vào mọi request gọi tới backend.
// Các endpoint /admin/** yêu cầu quyền ADMIN nên bắt buộc phải có header này.
const httpClient = (url: string, options: any = {}) => {
    const headers = options.headers instanceof Headers
        ? options.headers
        : new Headers(options.headers || { Accept: 'application/json' });
    const token = localStorage.getItem('token');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return fetchUtils.fetchJson(url, { ...options, headers });
};
// @ts-ignore
export const dataProvider: DataProvider = {
    // @ts-ignore
    getList: async (resource, params) => {
        const { page = 1, perPage = 10 } = params.pagination || {}; // Lấy thông tin phân trang
        // Resource user map sang endpoint /admin/users (envelope ApiResponse)
        if (resource === 'user') {
            const userQuery: any = { page, size: perPage };
            if (params.filter && params.filter.role) {
                userQuery.role = params.filter.role;
            }
            const { json } = await httpClient(
                `${apiUrl}/admin/users?${fetchUtils.queryParameters(userQuery)}`,
                { method: 'GET' }
            );
            return {
                data: json.data.users,
                total: json.data.pagination.totalItems,
            };
        }
        const { field = 'id', order = 'ASC' } = params.sort || {}; // Lấy thông tin sắp xếp
        const query = {
            sortBy: field, // Trường cần sắp xếp
            sortDir: order, // Thứ tự sắp xếp
            page: page -1,
            size: perPage,
            filter: JSON.stringify(fetchUtils.flattenObject(params.filter)),
        };
        const {json} = await httpClient(`${apiUrl}/${resource}?${fetchUtils.queryParameters(query)}`, {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            }),
        })
        return {
            data: json.content,
            total: parseInt(json.totalElements, 10),
        }
    },
// @ts-ignore
    getOne: async (resource: any, params: any) => {
        if (resource === 'user') {
            const { json } = await httpClient(`${apiUrl}/admin/users/${params.id}`, {
                method: 'GET',
            });
            return { data: json.data };
        }
        const {json} = await httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            }),
        })
        return {data: json}
    },
// @ts-ignore
    getManyReference: async (resource: any, params: any) => {
    },

    // @ts-ignore
    create: async (resource: any, params: any) => {
        if(resource === 'product') {
            if (params.data.image_url && params.data.image_url.rawFile) {
                // Upload image to imgBB
                const imageUrl = await imgUpload(params.data.image_url);
                params.data.image_url = imageUrl;
            }
            const {data: category} = await dataProvider.getOne('category', params.data.category);
            params.data.category = category;
            const { json } = await httpClient(`${apiUrl}/${resource}`, {
                method: 'POST', // or 'PATCH' depending on your API
                body: JSON.stringify(params.data),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),

            });
            return { data: json };
        }
        // if (resource === 'category') {
        //     if (params.data.parentCategory.id === null || params.data.parentCategory.id === undefined ) {
        //         params.data.parentCategory = null
        //     }
        //     const { json } = await httpClient(`${apiUrl}/${resource}`, {
        //         method: 'POST',
        //         body: JSON.stringify(params.data),
        //         headers: new Headers({
        //             'Content-Type': 'application/json',
        //             Accept: 'application/json',
        //         }),
        //
        //     });
        //     return { data: json };
        // }
        if(resource === 'user') {
            const { json } = await httpClient(`${apiUrl}/admin/users`, {
                method: 'POST',
                body: JSON.stringify(params.data),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
            });
            return { data: json.data };
        }
        else {
            const { json } = await httpClient(`${apiUrl}/${resource}`, {
                method: 'POST',
                body: JSON.stringify(params.data),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),

            });
            window.location.href = `/admin/${resource}`
            return { data: json };
        }
    }
    ,
    // @ts-ignore
    update: async (resource: any, params: any) => {
        if (resource === 'product') {
            const { id, data } = params;
            if (data.image_url && data.image_url.rawFile) {
                // Upload image to imgBB
                const imageUrl = await imgUpload(data.image_url);
                data.image_url = imageUrl;
            }

            const { json } = await httpClient(`${apiUrl}/${resource}/${id}`, {
                method: 'PUT',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
                body: JSON.stringify(data),
            });
            return { data: json.data };
        }
        // if (resource === 'category') {
        //     if (params.data.parentCategory.id === null) {
        //         params.data.parentCategory = null
        //     }
        //     const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`, {
        //         method: 'PUT',
        //         headers: new Headers({
        //             'Content-Type': 'application/json',
        //             Accept: 'application/json',
        //         }),
        //         body: JSON.stringify(params.data),
        //     });
        //     return { data: json };
        // }
        if (resource === 'user') {
            // Không gửi password rỗng để backend giữ nguyên mật khẩu cũ
            const body = { ...params.data };
            if (!body.password) {
                delete body.password;
            }
            const { json } = await httpClient(`${apiUrl}/admin/users/${params.id}`, {
                method: 'PUT',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
                body: JSON.stringify(body),
            });
            return { data: json.data };
        }
        else {
            const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`, {
                method: 'PUT',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
                body: JSON.stringify(params.data),
            });
            return { data: json };
        }
    },
// @ts-ignore
    delete: async (resource: any, params: any) => {
        const url = resource === 'user'
            ? `${apiUrl}/admin/users/${params.id}`
            : `${apiUrl}/${resource}/${params.id}`;
        await httpClient(url, {
            method: 'DELETE',
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            }),
        });
        // react-admin cần record vừa xóa; backend trả data=null nên tự dựng lại
        return { data: { ...params.previousData, id: params.id } };
    },
// @ts-ignore
    deleteMany: async (resource: any, params: any) => {
        const base = resource === 'user' ? `${apiUrl}/admin/users` : `${apiUrl}/${resource}`;
        await Promise.all(
            params.ids.map((id: any) =>
                httpClient(`${base}/${id}`, {
                    method: 'DELETE',
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    }),
                })
            )
        );
        return { data: params.ids };
    },


}