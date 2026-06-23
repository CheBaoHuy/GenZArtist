import {DataProvider, fetchUtils} from "react-admin";

const apiUrl = 'http://localhost:8080/api/v1';

// Map resource của react-admin -> path thật trên backend
const resourceBase = (resource: string) => {
    if (resource === 'user') return `${apiUrl}/admin/users`;
    if (resource === 'product') return `${apiUrl}/admin/products`;
    if (resource === 'category') return `${apiUrl}/admin/categories`;
    if (resource === 'order') return `${apiUrl}/admin/orders`;
    return `${apiUrl}/${resource}`;
};

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
        // Resource product map sang /admin/products (envelope ApiResponse)
        if (resource === 'product') {
            const productQuery: any = { page, size: perPage };
            if (params.filter && params.filter.status) {
                productQuery.status = params.filter.status;
            }
            const { json } = await httpClient(
                `${apiUrl}/admin/products?${fetchUtils.queryParameters(productQuery)}`,
                { method: 'GET' }
            );
            return {
                data: json.data.products,
                total: json.data.pagination.totalItems,
            };
        }
        // Danh mục: GET /categories trả ApiResponse<List<Category>> (không phân trang)
        if (resource === 'category') {
            const { json } = await httpClient(`${apiUrl}/categories`, { method: 'GET' });
            return {
                data: json.data,
                total: json.data.length,
            };
        }
        // Đơn hàng: id là chuỗi orderId nên cần map orderId -> id cho react-admin
        if (resource === 'order') {
            const orderQuery: any = { page, size: perPage };
            if (params.filter && params.filter.orderStatus) {
                orderQuery.status = params.filter.orderStatus;
            }
            const { json } = await httpClient(
                `${apiUrl}/admin/orders?${fetchUtils.queryParameters(orderQuery)}`,
                { method: 'GET' }
            );
            return {
                data: json.data.orders.map((o: any) => ({ ...o, id: o.orderId })),
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
        if (resource === 'product') {
            const { json } = await httpClient(`${apiUrl}/admin/products/${params.id}`, {
                method: 'GET',
            });
            // categoryId đã có sẵn từ backend để bind vào SelectInput
            return { data: json.data };
        }
        if (resource === 'category') {
            const { json } = await httpClient(`${apiUrl}/admin/categories/${params.id}`, {
                method: 'GET',
            });
            return { data: json.data };
        }
        if (resource === 'order') {
            const { json } = await httpClient(`${apiUrl}/admin/orders/${params.id}`, {
                method: 'GET',
            });
            return { data: { ...json.data, id: json.data.orderId } };
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
            const { json } = await httpClient(`${apiUrl}/admin/products`, {
                method: 'POST',
                body: JSON.stringify(params.data),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
            });
            return { data: json.data };
        }
        if (resource === 'category') {
            const { json } = await httpClient(`${apiUrl}/admin/categories`, {
                method: 'POST',
                body: JSON.stringify(params.data),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
            });
            return { data: json.data };
        }
        if (resource === 'order') {
            const { json } = await httpClient(`${apiUrl}/admin/orders`, {
                method: 'POST',
                body: JSON.stringify(params.data),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
            });
            return { data: { ...json.data, id: json.data.orderId } };
        }
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
            const { json } = await httpClient(`${apiUrl}/admin/products/${params.id}`, {
                method: 'PUT',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
                body: JSON.stringify(params.data),
            });
            return { data: json.data };
        }
        if (resource === 'category') {
            const { json } = await httpClient(`${apiUrl}/admin/categories/${params.id}`, {
                method: 'PUT',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
                body: JSON.stringify(params.data),
            });
            return { data: json.data };
        }
        if (resource === 'order') {
            const { json } = await httpClient(`${apiUrl}/admin/orders/${params.id}`, {
                method: 'PUT',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
                body: JSON.stringify(params.data),
            });
            return { data: { ...json.data, id: json.data.orderId } };
        }
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
        await httpClient(`${resourceBase(resource)}/${params.id}`, {
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
        const base = resourceBase(resource);
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