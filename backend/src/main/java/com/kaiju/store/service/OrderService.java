package com.kaiju.store.service;

import com.kaiju.store.dto.PaginationDto;
import com.kaiju.store.enums.OrderStatus;
import com.kaiju.store.model.*;
import com.kaiju.store.repository.OrderItemRepository;
import com.kaiju.store.repository.OrderRepository;
import com.kaiju.store.repository.OrderRequest;
import com.kaiju.store.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Map<String, Object> createOrder(User buyer, OrderRequest request) {
        String orderId = generateOrderId();
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = new Order();
        order.setId(orderId);
        order.setBuyer(buyer);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentUrl(buildPaymentUrl(orderId, request.getPaymentMethod()));

        for (OrderRequest.OrderItemDto itemDto : request.getItems()) {
            Product product = productService.findById(itemDto.getProductId());
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItems.add(orderItem);
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())));
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);
        orderRepository.save(order);

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("buyerId", buyer.getId());
        data.put("totalAmount", order.getTotalAmount());
        data.put("orderStatus", order.getOrderStatus().name());
        data.put("paymentUrl", order.getPaymentUrl());
        data.put("createdAt", order.getCreatedAt());
        return data;
    }

    public Map<String, Object> payOrder(User buyer, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new RuntimeException("Bạn không có quyền thanh toán đơn hàng này.");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("paymentMethod", order.getPaymentMethod());
        data.put("paymentUrl", order.getPaymentUrl());
        data.put("totalAmount", order.getTotalAmount());
        return data;
    }

    public Map<String, Object> getOrderHistory(User buyer, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size);
        Page<Order> orderPage = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId(), pageable);

        List<Map<String, Object>> orders = orderPage.getContent().stream()
                .map(this::toHistoryItem)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("orders", orders);
        data.put("pagination", new PaginationDto(page, orderPage.getTotalPages(), orderPage.getTotalElements()));
        return data;
    }

    public Map<String, Object> getSellerOrders(User seller, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size);
        List<OrderItem> items = orderItemRepository.findBySellerId(seller.getId(), pageable);
        long totalItems = orderItemRepository.countDistinctOrdersBySellerId(seller.getId());

        Map<String, Order> uniqueOrders = new LinkedHashMap<>();
        for (OrderItem item : items) {
            uniqueOrders.putIfAbsent(item.getOrder().getId(), item.getOrder());
        }

        List<Map<String, Object>> orders = uniqueOrders.values().stream()
                .map(order -> toSellerOrderItem(order, seller.getId()))
                .collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) totalItems / size);

        Map<String, Object> data = new HashMap<>();
        data.put("orders", orders);
        data.put("pagination", new PaginationDto(page, totalPages, totalItems));
        return data;
    }

    public Map<String, Object> getAllOrders(String statusStr, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size);
        Page<Order> orderPage;
        if (statusStr != null && !statusStr.isBlank()) {
            OrderStatus status = parseStatus(statusStr, null);
            orderPage = orderRepository.findByOrderStatus(status, pageable);
        } else {
            orderPage = orderRepository.findAll(pageable);
        }

        List<Map<String, Object>> orders = orderPage.getContent().stream()
                .map(this::toAdminItem)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("orders", orders);
        data.put("pagination", new PaginationDto(page, orderPage.getTotalPages(), orderPage.getTotalElements()));
        return data;
    }

    // ===== Admin CRUD =====

    public Map<String, Object> getAdminOrderDetail(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        return toAdminDetail(order);
    }

    @Transactional
    public Map<String, Object> adminCreateOrder(Map<String, Object> request) {
        Object buyerIdRaw = request.get("buyerId");
        if (buyerIdRaw == null || buyerIdRaw.toString().isBlank()) {
            throw new RuntimeException("Vui lòng chọn người mua.");
        }
        Long buyerId = Long.valueOf(buyerIdRaw.toString().trim());
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người mua."));

        Object itemsRaw = request.get("items");
        if (!(itemsRaw instanceof List) || ((List<?>) itemsRaw).isEmpty()) {
            throw new RuntimeException("Đơn hàng phải có ít nhất một sản phẩm.");
        }

        Order order = new Order();
        order.setId(generateOrderId());
        order.setBuyer(buyer);
        String paymentMethod = request.get("paymentMethod") != null
                ? request.get("paymentMethod").toString() : "VNPAY";
        order.setPaymentMethod(paymentMethod);
        order.setOrderStatus(parseStatus(request.get("orderStatus"), OrderStatus.PENDING));
        order.setPaymentUrl(buildPaymentUrl(order.getId(), paymentMethod));

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        for (Object raw : (List<?>) itemsRaw) {
            Map<?, ?> itemMap = (Map<?, ?>) raw;
            if (itemMap.get("productId") == null) {
                continue;
            }
            Long productId = Long.valueOf(itemMap.get("productId").toString().trim());
            int quantity = itemMap.get("quantity") != null
                    ? Integer.parseInt(itemMap.get("quantity").toString().trim()) : 1;
            Product product = productService.findById(productId);
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(product.getPrice());
            orderItems.add(orderItem);
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);
        orderRepository.save(order);
        return toAdminDetail(order);
    }

    @Transactional
    public Map<String, Object> adminUpdateOrder(String orderId, Map<String, Object> request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (request.get("orderStatus") != null) {
            order.setOrderStatus(parseStatus(request.get("orderStatus"), order.getOrderStatus()));
        }
        if (request.get("paymentStatus") != null) {
            order.setPaymentStatus(request.get("paymentStatus").toString());
        }
        if (request.containsKey("paymentMethod") && request.get("paymentMethod") != null) {
            order.setPaymentMethod(request.get("paymentMethod").toString());
        }

        orderRepository.save(order);
        return toAdminDetail(order);
    }

    @Transactional
    public void adminDeleteOrder(String orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Không tìm thấy đơn hàng");
        }
        orderRepository.deleteById(orderId);
    }

    private Map<String, Object> toAdminDetail(Order order) {
        Map<String, Object> item = new HashMap<>();
        item.put("orderId", order.getId());
        item.put("totalAmount", order.getTotalAmount());
        item.put("paymentMethod", order.getPaymentMethod());
        item.put("paymentStatus", order.getPaymentStatus());
        item.put("orderStatus", order.getOrderStatus() != null ? order.getOrderStatus().name() : null);
        item.put("createdAt", order.getCreatedAt());
        if (order.getBuyer() != null) {
            Map<String, Object> buyer = new HashMap<>();
            buyer.put("id", order.getBuyer().getId());
            buyer.put("fullName", order.getBuyer().getFullName());
            buyer.put("email", order.getBuyer().getEmail());
            item.put("buyer", buyer);
            item.put("buyerId", order.getBuyer().getId());
            item.put("buyerName", order.getBuyer().getFullName());
        }
        if (order.getItems() != null) {
            item.put("items", order.getItems().stream().map(oi -> {
                Map<String, Object> productItem = new HashMap<>();
                productItem.put("productId", oi.getProduct().getId());
                productItem.put("name", oi.getProduct().getName());
                productItem.put("unitPrice", oi.getUnitPrice());
                productItem.put("quantity", oi.getQuantity());
                productItem.put("imageUrl", oi.getProduct().getImageUrl());
                return productItem;
            }).collect(Collectors.toList()));
        }
        return item;
    }

    private OrderStatus parseStatus(Object value, OrderStatus fallback) {
        if (value == null || value.toString().isBlank()) {
            return fallback;
        }
        try {
            return OrderStatus.valueOf(value.toString().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái đơn hàng không hợp lệ.");
        }
    }

    @Transactional
    public Map<String, Object> cancelOrder(User currentUser, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Nếu là tài khoản người mua (BUYER), chỉ được hủy đơn của chính mình
        if (currentUser.getRole().name().equals("BUYER") && !order.getBuyer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này.");
        }

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng đang ở trạng thái PENDING.");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("orderStatus", order.getOrderStatus().name());
        return data;
    }

    @Transactional
    public Map<String, Object> updateOrderStatus(User currentUser, String orderId, String statusStr) {
        // Theo đặc tả API 3.4: Chỉ Seller hoặc Admin mới được phép cập nhật trạng thái
        if (currentUser.getRole().name().equals("BUYER")) {
            throw new RuntimeException("Bạn không có quyền cập nhật trạng thái đơn hàng.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        try {
            order.setOrderStatus(OrderStatus.valueOf(statusStr.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái đơn hàng không hợp lệ.");
        }
        orderRepository.save(order);

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("orderStatus", order.getOrderStatus().name());
        data.put("updatedAt", LocalDateTime.now());
        return data;
    }

    private Map<String, Object> toHistoryItem(Order order) {
        Map<String, Object> item = new HashMap<>();
        item.put("orderId", order.getId());
        item.put("totalAmount", order.getTotalAmount());
        item.put("paymentMethod", order.getPaymentMethod());
        item.put("orderStatus", order.getOrderStatus().name());
        item.put("createdAt", order.getCreatedAt());
        item.put("items", order.getItems().stream().map(oi -> {
            Map<String, Object> productItem = new HashMap<>();
            productItem.put("productId", oi.getProduct().getId());
            productItem.put("name", oi.getProduct().getName());
            productItem.put("unitPrice", oi.getUnitPrice());
            productItem.put("imageUrl", oi.getProduct().getImageUrl());
            productItem.put("fileUrl", order.getOrderStatus() == OrderStatus.COMPLETED
                    ? oi.getProduct().getFileUrl() : null);
            return productItem;
        }).collect(Collectors.toList()));
        return item;
    }

    private Map<String, Object> toSellerOrderItem(Order order, Long sellerId) {
        Map<String, Object> item = new HashMap<>();
        item.put("orderId", order.getId());
        item.put("createdAt", order.getCreatedAt());

        Map<String, Object> buyer = new HashMap<>();
        buyer.put("fullName", order.getBuyer().getFullName());
        buyer.put("email", order.getBuyer().getEmail());
        item.put("buyer", buyer);

        List<Map<String, Object>> sellerItems = order.getItems().stream()
                .filter(oi -> oi.getProduct().getSeller().getId().equals(sellerId))
                .map(oi -> {
                    Map<String, Object> productItem = new HashMap<>();
                    productItem.put("productId", oi.getProduct().getId());
                    productItem.put("name", oi.getProduct().getName());
                    productItem.put("unitPrice", oi.getUnitPrice());
                    productItem.put("quantity", oi.getQuantity());
                    return productItem;
                }).collect(Collectors.toList());

        BigDecimal subTotal = sellerItems.stream()
                .map(i -> ((BigDecimal) i.get("unitPrice")).multiply(BigDecimal.valueOf((Integer) i.get("quantity"))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        item.put("items", sellerItems);
        item.put("subTotal", subTotal);
        item.put("paymentStatus", order.getOrderStatus() == OrderStatus.COMPLETED ? "PAID" : "PENDING");
        return item;
    }

    private Map<String, Object> toAdminItem(Order order) {
        Map<String, Object> item = new HashMap<>();
        item.put("orderId", order.getId());
        item.put("buyerId", order.getBuyer().getId());
        item.put("buyerName", order.getBuyer().getFullName());
        item.put("totalAmount", order.getTotalAmount());
        item.put("paymentMethod", order.getPaymentMethod());
        item.put("orderStatus", order.getOrderStatus().name());
        item.put("createdAt", order.getCreatedAt());
        return item;
    }

    private String generateOrderId() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String suffix = UUID.randomUUID().toString().substring(0, 3).toUpperCase();
        return "ORD-" + date + "-" + suffix;
    }

    private String buildPaymentUrl(String orderId, String paymentMethod) {
        if ("MOMO".equalsIgnoreCase(paymentMethod)) {
            return "https://test-payment.momo.vn/v2/gateway/pay?orderId=" + orderId;
        }
        return "https://sandbox.vnpayment.vn/payment/v2/?orderId=" + orderId;
    }
}
