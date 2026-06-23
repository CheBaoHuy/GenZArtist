
// import React from "react";
import {
    Admin,
    Resource,
    ShowGuesser,
    Layout,
    Menu,
    MenuItemLink
} from "react-admin";
import { Navigate } from "react-router-dom";

import {
    Home,
    SpaceDashboard,
    People,
    Inventory,
    Category,
    Receipt,
    RateReview,

} from "@mui/icons-material";

import { dataProvider } from "./DataProvider";
import { authProvider } from "./AuthProvider";

import Dashboard from "./dashboard/Dashboard";

import { UserList } from "./user/UserList";
import { UserEdit } from "./user/UserEdit";
import { UserCreate } from "./user/UserCreate";

import { ProductList } from "./product/ProductList";
import { ProductEdit } from "./product/ProductEdit";
import { ProductCreate } from "./product/ProductCreate";

import { CategoryList } from "./category/CategoryList";
import { CategoryEdit } from "./category/CategoryEdit";
import { CategoryCreate } from "./category/CategoryCreate";

import { OrderList } from "./order/OrderList";
import { OrderEdit } from "./order/OrderEdit";
import { OrderCreate } from "./order/OrderCreate";

import { ReviewList } from "./review/ReviewList";



/**
 * Custom Menu
 */
const CustomMenu = () => (
    <Menu>
        <MenuItemLink
            to="/"
            primaryText="Home"
            leftIcon={<Home />}
        />

        <MenuItemLink
            to="/admin"
            primaryText="Bảng điều khiển"
            leftIcon={<SpaceDashboard />}
        />

        <MenuItemLink
            to="/admin/user"
            primaryText="Người dùng"
            leftIcon={<People />}
        />

        <MenuItemLink
            to="/admin/product"
            primaryText="Sản phẩm"
            leftIcon={<Inventory />}
        />

        <MenuItemLink
            to="/admin/category"
            primaryText="Danh mục"
            leftIcon={<Category />}
        />

        <MenuItemLink
            to="/admin/order"
            primaryText="Đơn hàng"
            leftIcon={<Receipt />}
        />



        <MenuItemLink
            to="/admin/review"
            primaryText="Đánh giá"
            leftIcon={<RateReview />}
        />


    </Menu>
);

/**
 * Custom Layout
 */
const CustomLayout = (props: any) => (
    <Layout {...props} menu={CustomMenu} />
);

/**
 * Custom Login Page
 */
const LoginRedirect = () => <Navigate to="/sign-in" replace />;

export const Manager = () => {
    return (
        <Admin
            basename="/admin"
            dataProvider={dataProvider}
            authProvider={authProvider}
            dashboard={Dashboard}
            layout={CustomLayout}
            loginPage={LoginRedirect}
        >
            <Resource
                name="user"
                list={UserList}
                show={ShowGuesser}
                edit={UserEdit}
                create={UserCreate}
                options={{ label: "Người dùng" }}
            />

            <Resource
                name="product"
                list={ProductList}
                show={ShowGuesser}
                edit={ProductEdit}
                create={ProductCreate}
                options={{ label: "Sản phẩm" }}
            />

            <Resource
                name="category"
                list={CategoryList}
                show={ShowGuesser}
                edit={CategoryEdit}
                create={CategoryCreate}
                options={{ label: "Danh mục" }}
            />

            <Resource
                name="order"
                list={OrderList}
                show={ShowGuesser}
                edit={OrderEdit}
                create={OrderCreate}
                options={{ label: "Đơn hàng" }}
            />



            <Resource
                name="review"
                list={ReviewList}
                show={ShowGuesser}
                options={{ label: "Đánh giá" }}
            />


        </Admin>
    );
};
