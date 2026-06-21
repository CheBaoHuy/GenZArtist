import React from 'react';
import {SvgIconProps, Card, CardContent, Typography, Box } from "@mui/material";

interface InfoCardProps {
    icon: React.ReactElement<SvgIconProps>;
    title: string;
    content: any;
    iconColor?: string;
}
export const InfoCard = ({ icon, title, content, iconColor = 'inherit' } : InfoCardProps) => {
    return (
        <Card style={{ margin: 10}}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent={"space-between"}>
                    <Box
                        mr={2}
                        // display="flex"
                        // justifyContent="center"
                        // alignItems="center"
                        // bgcolor="#f0f0f0"
                        // borderRadius="50%"
                        color={iconColor}
                    >
                        {React.cloneElement(icon, { fontSize: 'large' })}
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" color="textSecondary">{title}</Typography>
                        <Typography variant="h5" textAlign={"right"}>{content}</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};