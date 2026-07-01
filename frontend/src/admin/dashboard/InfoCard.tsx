import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  SvgIconProps,
} from "@mui/material";

interface InfoCardProps {
  icon: React.ReactElement<SvgIconProps>;
  title: string;
  content: React.ReactNode;
  iconColor?: string;
}

export const InfoCard = ({
  icon,
  title,
  content,
  iconColor = "inherit",
}: InfoCardProps) => {
  return (
    <Card style={{ margin: 10 }}>
      <CardContent>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            style={{
              marginRight: 16,
              color: iconColor,
            }}
          >
            {React.cloneElement(icon, { fontSize: "large" })}
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              style={{ color: "#666" }}
            >
              {title}
            </Typography>

            <Typography
              variant="h5"
              style={{ textAlign: "right" }}
            >
              {content}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};