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
import {Link} from "react-router-dom";
import React from "react";
import {Order} from "../../models";

export const PendingOrders = ({pendingOrders}: {pendingOrders: Order[]}) => {
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
                                    <Avatar src={order.fullName} />
                                </ListItemAvatar>
                                <ListItemText primary={
                                    <>
                                        <Typography variant={"subtitle2"}>{order.fullName}</Typography>
                                        <Typography variant={"caption"}>{new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}</Typography>
                                    </>
                                }/>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </CardContent>
        </Card>
    );
}