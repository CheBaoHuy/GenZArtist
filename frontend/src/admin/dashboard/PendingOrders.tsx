import {
    Avatar,
    Box,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography
} from "@mui/material";
import { Link } from "react-router-dom";
import React from "react";

export const PendingOrders = ({ pendingOrders }: { pendingOrders: any[] }) => {
    return (
        <Card>
            <CardContent>
                <Box>
                    <Typography variant="h6" align="center">Đơn hàng đang chờ</Typography>
                    <List>
                        {pendingOrders.map(order => (
                            <ListItem key={order.id}
                                      component={Link}
                                      to={`/admin/order/${order.id}`}
                                      sx={{ textDecoration: 'none', color: 'inherit' }}>
                                <ListItemAvatar>
                                    <Avatar>{(order.buyerName || '?').charAt(0).toUpperCase()}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={
                                    <>
                                        <Typography variant={"subtitle2"}>{order.buyerName || order.orderId}</Typography>
                                        <Typography variant={"caption"}>
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                day: '2-digit', month: '2-digit', year: 'numeric'
                                            }) : ''}
                                        </Typography>
                                    </>
                                } />
                            </ListItem>
                        ))}
                        {pendingOrders.length === 0 && (
                           <Typography
                                variant="caption"
                                color="textSecondary"
                                align="center"
                                style={{ display: 'block' }}
                                >
                                Không có đơn nào đang chờ
                                </Typography>
                        )}
                    </List>
                </Box>
            </CardContent>
        </Card>
    );
}
