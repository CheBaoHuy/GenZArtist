import { users, products } from '../mocks/data';

export const mockLogin = (email, password) => {
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    return { success: true, data: { accessToken: "mock-token", user } };
  }
  return { success: false, message: "Invalid credentials" };
};

export const mockGetProducts = () => {
  return products;
};

export const mockGetTrendingProducts = () => {
  return products.slice(0, 6);
};

export const mockGetOrders = () => {
  return [
    { id: 101, total: 230, status: "Delivered", date: "2026-06-01" },
    { id: 102, total: 150, status: "Pending", date: "2026-06-25" }
  ];
};

export const mockGetStats = () => {
  return {
    revenue: [
      { month: "Jan", amount: 1000 },
      { month: "Feb", amount: 1500 },
      { month: "Mar", amount: 2000 }
    ],
    categories: [
      { name: "Painting", value: 60 },
      { name: "Digital Art", value: 40 }
    ]
  };
};

export const mockGetProfile = () => {
  return users[0];
};

export const mockUpdateProfile = (data) => {
  return { ...users[0], ...data };
};
