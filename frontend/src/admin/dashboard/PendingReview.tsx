
import React, {useEffect, useState} from "react";
import {Rate, User} from "../../models";
import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardHeader, List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography
} from "@mui/material";
import { Link } from "react-router-dom";
export const PendingReviews = ({pendingReviews} : {pendingReviews: Rate[]}) => {

    return (
        <Card>
            <CardContent>
                <Box>
                    <Typography variant="h6" align="center">Đánh giá đang chờ</Typography>
                    <List>
                        {pendingReviews.map(rate => (
                            <ListItem key={rate.id} 
                                        component={Link} 
                                        to={`/admin/review/${rate.id}/show`}
                                        sx={{ textDecoration: 'none', color: 'inherit' }}>
                                <ListItemAvatar>
                                    <Avatar src={rate.createdAt} />
                                </ListItemAvatar>
                                <ListItemText primary={
                                    <>
                                        <Typography variant={"subtitle2"}>{rate.comment}</Typography>
                                        <Typography variant={"subtitle2"}>{new Date(rate.createdAt).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}</Typography>
                                    </>} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </CardContent>
        </Card>
    );
};