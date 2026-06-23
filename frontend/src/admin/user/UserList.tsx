import React from "react";
import {
    Datagrid,
    DateField,
    DeleteButton,
    EditButton,
    EmailField,
    FilterList,
    FilterListItem,
    FilterLiveSearch,
    FunctionField,
    List,
    TextField,
    useDataProvider,
    useNotify,
    useRefresh,
} from "react-admin";
import { Button, Card, CardContent } from "@mui/material";

const ROLE_LABEL: Record<string, string> = {
    ADMIN: "Quản trị",
    SELLER: "Người bán",
    BUYER: "Người mua",
};

export const UserList = () => {
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const refresh = useRefresh();

    // Khóa / mở khóa tài khoản (ACTIVE <-> BANNED)
    const handleToggleStatus = async (record: any, event: React.MouseEvent) => {
        event.stopPropagation();
        const nextStatus = record.status === "ACTIVE" ? "BANNED" : "ACTIVE";
        try {
            await dataProvider.update("user", {
                id: record.id,
                data: { status: nextStatus },
                previousData: record,
            });
            notify("Cập nhật trạng thái thành công", { type: "success" });
            refresh();
        } catch (error) {
            notify(`Lỗi: ${error}`, { type: "warning" });
        }
    };

    return (
        <List aside={<UserFilterSidebar />}>
            <Datagrid rowClick="edit">
                <TextField source="id" label="ID" />
                <EmailField source="email" label="Email" />
                <TextField source="fullName" label="Họ và tên" />
                <TextField source="phoneNumber" label="Số điện thoại" />
                <FunctionField
                    label="Quyền"
                    render={(record: any) => ROLE_LABEL[record.role] || record.role}
                />
                <FunctionField
                    label="Trạng thái"
                    render={(record: any) => (
                        <Button
                            onClick={(event) => handleToggleStatus(record, event)}
                            color={record.status === "ACTIVE" ? "primary" : "error"}
                        >
                            {record.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                        </Button>
                    )}
                />
                <DateField source="createdAt" label="Ngày tạo" showTime />
                <EditButton />
                <DeleteButton />
            </Datagrid>
        </List>
    );
};

const UserFilterSidebar = () => (
    <Card sx={{ order: -1, mr: 2, mt: 6, width: 200 }}>
        <CardContent>
            <FilterLiveSearch label="Tìm..." />
            <FilterList label="Quyền" icon={null}>
                <FilterListItem label="Quản trị" value={{ role: "ADMIN" }} />
                <FilterListItem label="Người bán" value={{ role: "SELLER" }} />
                <FilterListItem label="Người mua" value={{ role: "BUYER" }} />
            </FilterList>
        </CardContent>
    </Card>
);
