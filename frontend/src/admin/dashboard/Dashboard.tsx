import React, {useMemo} from "react";
import {endOfMonth, startOfDay, startOfMonth, subDays, subMonths} from "date-fns";
import {useGetList} from "react-admin";
import {Order, Rate, User} from "../../models";
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Avatar, Box, Card, CardContent, Grid, Typography} from "@mui/material";
import {Person, PersonAdd, ShoppingCart, RateReview} from "@mui/icons-material"
import {NewUserStats} from "./NewUserStats";
import {PendingOrders} from "./PendingOrders";
import {InfoCard} from "./InfoCard";
import {PendingReviews} from "./PendingReview";
import {FaShoppingCart} from "react-icons/fa";
import { log } from "console";

const Dashboard = () => {
    const firstDayOfMonth  = startOfMonth(subMonths(new Date(), 1))
    const lastDayOfMonth = endOfMonth(subMonths(new Date(), 1));
    const { data: users } = useGetList<User>('user', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'createdAt', order: 'DESC' },
        filter: {},
    });
    const { data: orders } = useGetList<Order>('order', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'createdAt', order: 'DESC' },
        filter: {},
    });
    const { data: reviews } = useGetList<Rate>('review', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'createdAt', order: 'DESC' },
        filter: {},
    });
    const formatToVNPrice = (price: any) => {
        return price.toLocaleString('vi-VN') + 'đ';
    }
    const currentMonth = new Date().getMonth() + 1;
    const useUsersByMonth = () => {
        return useMemo(() => {
            if (!users) return [];

            return users.filter((user) => {
                const createdAt = new Date(user.createdAt);
                return createdAt.getMonth() + 1 === currentMonth;
            });
        }, [users, currentMonth]);
    };
    const usePendingOrders = useMemo(() => {
        if (!orders) return [];

        return orders.filter((order) => order.orderStatus.id === 1);
    }, [orders, currentMonth]);
    const usePendingReviews = useMemo(() => {
        if (!reviews) return [];

        return reviews.filter((reviews) => reviews.status === false);
    }, [reviews, currentMonth]);
    const getRevenueOfDay = useMemo(()=> {
        if (!orders) return [];
        const revenueByDate = orders
            .filter(order => order.orderStatus.id !== 3)
            .reduce((accumulator, order) => {
                const date = new Date(order.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })
                if (!accumulator[date]) {
                    accumulator[date] = {date, revenue: 0}
                }
                accumulator[date].revenue += order.total_amount;
                return accumulator;
            }, {} as { [date: string]: { date: string; revenue: number } })
        return Object.keys(revenueByDate).sort().map((date)=> ({
            date,
            revenue: revenueByDate[date].revenue,
        }));
    }, [orders, firstDayOfMonth, lastDayOfMonth])

    const getRevenueOfPreviousMonth = useMemo(() => {
        if (!orders) return 0;
    
        const previousMonth = new Date().getMonth();
        const previousMonthYear = new Date().getFullYear();
        const totalRevenue = orders
            .filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.getMonth() + 1 === previousMonth && orderDate.getFullYear() === previousMonthYear && order.orderStatus.id !== 3;
            })
            .reduce((accumulator, order) => accumulator + order.total_amount, 0);
            
        return totalRevenue;
    }, [orders]);
    return (
        <Grid container spacing={2}>
            <Grid item md={8}>
                <Grid container spacing={1} style={{ padding: '20px' }}>
                    <Grid item md={6}>
                        <InfoCard icon={<Person/>}
                                  title={"Doanh thu tháng trước"}
                                  iconColor={"purple"}
                                  content={formatToVNPrice(getRevenueOfPreviousMonth)}/>
                    </Grid>
                    <Grid item md={6}>
                        <InfoCard icon={<Person/>}
                                  title={"Người dùng mới"}
                                  iconColor={"blue"}
                                  content={useUsersByMonth().length}/>
                    </Grid>
                    <Grid item md={6}>
                        <InfoCard icon={<ShoppingCart/>}
                                  title={"Đơn hàng mới"}
                                  iconColor={"red"}
                                  content={useUsersByMonth().length}/>
                    </Grid>
                    <Grid item md={6}>
                        <InfoCard icon={<RateReview/>}
                                  title={"Đánh giá mới"}
                                  iconColor={"green"}
                                  content={usePendingReviews.length}/>
                    </Grid>
                </Grid>
                <ResponsiveContainer height={400}>
                    <LineChart data={getRevenueOfDay}
                               margin={{top: 5, right: 10, left:10, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Grid>
            <Grid item md={4}>
                <Box>
                    {/*<NewUserStats newUsersList={useUsersByMonth()}/>*/}
                    <PendingOrders pendingOrders={usePendingOrders}/>
                    <PendingReviews pendingReviews={usePendingReviews}/>
                </Box>
            </Grid>
        </Grid>
        
        

    )
}
export default Dashboard;