import { AuthProvider } from 'react-admin';
import  {JwtPayload} from 'jwt-decode';
import axios from "axios";

export const authProvider : AuthProvider = {
    checkAuth: ()=> {
        const token = localStorage.getItem('token');
        if (token) {
            const role = JSON.parse(token).role;
            if (role === 'ADMIN') {
                return Promise.resolve();
            } else {
                localStorage.removeItem('token');
                return Promise.reject();
            }
        } else {
            localStorage.removeItem('token');
            return Promise.reject();
        }
    },
    checkError: (error: any) =>{
        const status = error.response ? error.response.status : null;
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            return Promise.reject();
        }
        return Promise.resolve();
    },
    getPermissions: () => {
        const token = localStorage.getItem('token');
        if (token) {
            const role = JSON.parse(token).role;
            if (role === 'ADMIN') {
                return Promise.resolve();
            } else {
                localStorage.removeItem('token');
                return Promise.reject();
            }
        } else {
            localStorage.removeItem('token');
            return Promise.reject();
        }

    },
    login: async ({username, password}: { username: string, password: string }) => {
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/login', {username, password});
            const token = response.data;
            const role = response.data.role;
            if (!token) {
                throw new Error('Phiên đăng nhập đã hết hạn !');
            }
            if (role === 'ADMIN') {
                localStorage.setItem('token', token);
            } else
                throw new Error('Tài khoản không có quyền hạng để đăng nhập vào hệ thống !.');
        } catch (err) {
            throw new Error('Username hoặc mật khẩu không đúng !');
        }
    },
    logout() {
        localStorage.removeItem('token');
        return Promise.resolve();
    }

}