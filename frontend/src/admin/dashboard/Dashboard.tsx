import React, { useMemo } from "react";
import { subMonths } from "date-fns";
import { useGetList } from "react-admin";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Box, Grid } from "@mui/material";
import { Person, PersonAdd, ShoppingCart, RateReview } from "@mui/icons-material";
import { PendingOrders } from "./PendingOrders";
import { InfoCard } from "./InfoCard";
import { PendingReviews } from "./PendingReview";

const Dashboard = () => {
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();
    const prev = subMonths(now, 1);
    const prevMonth = prev.getMonth();
    const prevYear = prev.getFullYear();

    // Lấy hết (DataProvider đã hỗ trợ) để thống kê
    const { data: users = [] } = useGetList<any>('user', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'createdAt', order: 'DESC' },
        filter: {},
    });
    const { data: orders = [] } = useGetList<any>('order', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'createdAt', order: 'DESC' },
        filter: {},
    });
    const { data: reviews = [] } = useGetList<any>('product-review', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'createdAt', order: 'DESC' },
        filter: {},
    });

    const formatToVNPrice = (price: any) => (Number(price) || 0).toLocaleString('vi-VN') + 'đ';

    const inMonth = (d: any, m: number, y: number) => {
        if (!d) return false;
        const dt = new Date(d);
        return dt.getMonth() === m && dt.getFullYear() === y;
    };
    const orderTotal = (o: any) => Number(o.totalAmount) || 0;
    const isCancelled = (o: any) => String(o.orderStatus) === 'CANCELLED';

    const newUsers = useMemo(
        () => users.filter((u: any) => inMonth(u.createdAt, curMonth, curYear)),
        [users, curMonth, curYear]);
    const newOrders = useMemo(
        () => orders.filter((o: any) => inMonth(o.createdAt, curMonth, curYear)),
        [orders, curMonth, curYear]);
    const newReviews = useMemo(
        () => reviews.filter((r: any) => inMonth(r.createdAt, curMonth, curYear)),
        [reviews, curMonth, curYear]);
    const pendingOrders = useMemo(
        () => orders.filter((o: any) => String(o.orderStatus) === 'PENDING'),
        [orders]);

    const revenuePreviousMonth = useMemo(
        () => orders
            .filter((o: any) => inMonth(o.createdAt, prevMonth, prevYear) && !isCancelled(o))
            .reduce((sum: number, o: any) => sum + orderTotal(o), 0),
        [orders, prevMonth, prevYear]);

    const revenueByDay = useMemo(() => {
        const map: { [date: string]: { date: string; revenue: number } } = {};
        orders
            .filter((o: any) => !isCancelled(o))
            .forEach((o: any) => {
                const date = new Date(o.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                });
                if (!map[date]) map[date] = { date, revenue: 0 };
                map[date].revenue += orderTotal(o);
            });
        return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    }, [orders]);

    return (
        <Grid container spacing={2}>
            <Grid size={{ md: 8 }}>
                <Grid container spacing={1} style={{ padding: '20px' }}>
                    <Grid size={{ md: 6 }}>
                        <InfoCard icon={<Person />} title={"Doanh thu tháng trước"} iconColor={"purple"}
                                  content={formatToVNPrice(revenuePreviousMonth)} />
                    </Grid>
                    <Grid size={{ md: 6 }}>
                        <InfoCard icon={<PersonAdd />} title={"Người dùng mới"} iconColor={"blue"}
                                  content={newUsers.length} />
                    </Grid>
                    <Grid size={{ md: 6 }}>
                        <InfoCard icon={<ShoppingCart />} title={"Đơn hàng mới"} iconColor={"red"}
                                  content={newOrders.length} />
                    </Grid>
                    <Grid size={{ md: 6 }}>
                        <InfoCard icon={<RateReview />} title={"Đánh giá mới"} iconColor={"green"}
                                  content={newReviews.length} />
                    </Grid>
                </Grid>
                <ResponsiveContainer height={400}>
                    <LineChart data={revenueByDay} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(v: any) => formatToVNPrice(v)} />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Grid>
            <Grid size={{ md: 4 }}>
                <Box>
                    <PendingOrders pendingOrders={pendingOrders} />
                    <PendingReviews pendingReviews={reviews.slice(0, 5)} />
                </Box>
            </Grid>
        </Grid>
    );
};
export default Dashboard;
