import React from "react";
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

export const PendingReviews = ({ pendingReviews }: { pendingReviews: any[] }) => {
    return (
        <Card sx={{ mt: 2 }}>
            <CardContent>
                <Box>
                    <Typography variant="h6" align="center">Đánh giá gần đây</Typography>
                    <List>
                        {pendingReviews.map(rate => (
                            <ListItem key={rate.id}
                                      component={Link}
                                      to={`/admin/product-review/${rate.id}`}
                                      sx={{ textDecoration: 'none', color: 'inherit' }}>
                                <ListItemAvatar>
                                    <Avatar>{'★'}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={
                                    <>
                                        <Typography variant={"subtitle2"}>
                                            {rate.rating ? `${rate.rating}★ ` : ''}{rate.comment || '(không có nội dung)'}
                                        </Typography>
                                        <Typography variant={"caption"}>
                                            {rate.createdAt ? new Date(rate.createdAt).toLocaleDateString('vi-VN', {
                                                day: '2-digit', month: '2-digit', year: 'numeric'
                                            }) : ''}
                                        </Typography>
                                    </>} />
                            </ListItem>
                        ))}
                        {pendingReviews.length === 0 && (
                            <Typography variant="caption" color="textSecondary" align="center" display="block">
                                Chưa có đánh giá
                            </Typography>
                        )}
                    </List>
                </Box>
            </CardContent>
        </Card>
    );
};
