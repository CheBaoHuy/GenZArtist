import React from "react";
import { Star, StarBorder } from "@mui/icons-material";

// Hiển thị số sao (1-5) dạng icon
export const RatingStars = ({ value }: { value: number }) => (
    <>
        {[...Array(5)].map((_, i) =>
            i < value ? (
                <Star key={i} fontSize="small" color="warning" />
            ) : (
                <StarBorder key={i} fontSize="small" color="warning" />
            )
        )}
    </>
);

export const RATING_CHOICES = [
    { id: 1, name: "1 sao" },
    { id: 2, name: "2 sao" },
    { id: 3, name: "3 sao" },
    { id: 4, name: "4 sao" },
    { id: 5, name: "5 sao" },
];
