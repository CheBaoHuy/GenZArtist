
import React from "react";
import {User} from "../../models";
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
export const NewUserStats = ({newUsersList} :  { newUsersList: User[] }) => {

    return (
        <Card>
            <CardContent>
                <Box>
                    <Typography variant="h6" align="center">Người dùng mới gần đây</Typography>
                    <List>
                        {newUsersList.map(user => (
                            <ListItem key={user.id}>
                                <ListItemAvatar>
                                    <Avatar src={user.avatar} />
                                </ListItemAvatar>
                                <ListItemText primary={user.username} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </CardContent>
        </Card>
    );
};