
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
    Discount,
    RateReview,
    Newspaper
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

import { DiscountList } from "./discount/DiscountList";
import { DiscountEdit } from "./discount/DiscountEdit";
import { DiscountCreate } from "./discount/DiscountCreate";

import { ReviewList } from "./review/ReviewList";

import { BlogList } from "./blog/BlogList";
import { BlogEdit } from "./blog/BlogEdit";
import { BlogCreate } from "./blog/BlogCreate";

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
            to="/admin/discount"
            primaryText="Mã giảm giá"
            leftIcon={<Discount />}
        />

        <MenuItemLink
            to="/admin/review"
            primaryText="Đánh giá"
            leftIcon={<RateReview />}
        />

        <MenuItemLink
            to="/admin/blog"
            primaryText="Bài viết"
            leftIcon={<Newspaper />}
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
                options={{ label: "Đơn hàng" }}
            />

            <Resource
                name="discount"
                list={DiscountList}
                show={ShowGuesser}
                edit={DiscountEdit}
                create={DiscountCreate}
                options={{ label: "Mã giảm giá" }}
            />

            <Resource
                name="review"
                list={ReviewList}
                show={ShowGuesser}
                options={{ label: "Đánh giá" }}
            />

            <Resource
                name="blog"
                list={BlogList}
                edit={BlogEdit}
                create={BlogCreate}
                options={{ label: "Bài viết" }}
            />
        </Admin>
    );
};
