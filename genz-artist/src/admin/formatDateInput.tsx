import {format, parseISO} from "date-fns";

export const formatDateTime = (dateString: string | Date) => {
    if (typeof dateString === 'string') {
        return dateString ? format(parseISO(dateString), "yyyy-MM-dd'T'HH:mm:ss") : '';
    } else {
        return dateString ? format(dateString, "yyyy-MM-dd'T'HH:mm:ss") : '';
    }
};

export const parseDateTime = (dateString: string) => {
    return dateString ? format(new Date(dateString), "yyyy-MM-dd'T'HH:mm:ss") : '';
};