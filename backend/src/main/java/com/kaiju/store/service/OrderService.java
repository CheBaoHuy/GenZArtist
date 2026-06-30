package com.kaiju.store.service;

import com.kaiju.store.dto.PaginationDto;
import com.kaiju.store.enums.OrderStatus;
import com.kaiju.store.enums.PaymentPhase;
import com.kaiju.store.model.*;
import com.kaiju.store.repository.OrderItemRepository;
import com.kaiju.store.repository.OrderRepository;
import com.kaiju.store.repository.CustomOrderRequest;
import com.kaiju.store.repository.OrderRequest;
import com.kaiju.store.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    // Tỷ lệ cọc bắt buộc khi đặt đơn: 30%
    private static final BigDecimal DEPOSIT_RATE = new BigDecimal("0.30");

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

        // Tính cọc 30% / còn lại 70%. Đơn tạo ở trạng thái chưa thanh toán;
        // buyer phải thanh toán cọc 30% qua VNPay thì mới chuyển sang DEPOSIT_PAID.
        applyDepositSplit(order, totalAmount);
        order.setPaymentPhase(PaymentPhase.UNPAID);
        order.setPaymentStatus("PENDING");

        orderRepository.save(order);

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("buyerId", buyer.getId());
        data.put("totalAmount", order.getTotalAmount());
        data.put("depositAmount", order.getDepositAmount());
        data.put("remainingAmount", order.getRemainingAmount());
        data.put("paymentPhase", order.getPaymentPhase().name());
        data.put("orderStatus", order.getOrderStatus().name());
        data.put("paymentUrl", order.getPaymentUrl());
        data.put("createdAt", order.getCreatedAt());
        return data;
    }

    // Đặt đơn vẽ theo yêu cầu: không gắn Product, tổng tiền = ngân sách dự kiến.
    // Vẫn áp dụng cọc 30% và đi qua đúng luồng thanh toán VNPay như đơn thường.
    @Transactional
    public Map<String, Object> createCustomOrder(User buyer, CustomOrderRequest request) {
        if (request.getBudget() == null || request.getBudget().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Ngân sách dự kiến phải lớn hơn 0.");
        }
        if (request.getArtistId() == null) {
            throw new RuntimeException("Vui lòng chọn hoạ sĩ.");
        }
        User artist = userRepository.findById(request.getArtistId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hoạ sĩ đã chọn."));

        String paymentMethod = (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank())
                ? request.getPaymentMethod() : "VNPAY";

        Order order = new Order();
        order.setId(generateOrderId());
        order.setBuyer(buyer);
        order.setPaymentMethod(paymentMethod);
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentUrl(buildPaymentUrl(order.getId(), paymentMethod));
        order.setItems(new ArrayList<>());

        order.setCustomOrder(true);
        order.setCustomerName(request.getCustomerName());
        order.setArtType(request.getArtType());
        order.setStyle(request.getStyle());
        order.setDescription(request.getDescription());
        order.setRefImageUrl(request.getRefImageUrl());
        order.setArtist(artist);

        BigDecimal totalAmount = request.getBudget();
        order.setTotalAmount(totalAmount);
        applyDepositSplit(order, totalAmount);
        order.setPaymentPhase(PaymentPhase.UNPAID);
        order.setPaymentStatus("PENDING");

        orderRepository.save(order);

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("buyerId", buyer.getId());
        data.put("artistId", artist.getId());
        data.put("artistName", artist.getFullName());
        data.put("totalAmount", order.getTotalAmount());
        data.put("depositAmount", order.getDepositAmount());
        data.put("remainingAmount", order.getRemainingAmount());
        data.put("paymentPhase", order.getPaymentPhase().name());
        data.put("orderStatus", order.getOrderStatus().name());
        data.put("paymentUrl", order.getPaymentUrl());
        data.put("createdAt", order.getCreatedAt());
        return data;
    }

    // Thanh toán 70% còn lại sau khi nhận hàng và hài lòng
    @Transactional
    public Map<String, Object> payRemaining(User buyer, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new RuntimeException("Bạn không có quyền thanh toán đơn hàng này.");
        }
        if (order.getPaymentPhase() == PaymentPhase.FULLY_PAID) {
            throw new RuntimeException("Đơn hàng đã được thanh toán đầy đủ.");
        }
        if (order.getPaymentPhase() != PaymentPhase.DEPOSIT_PAID) {
            throw new RuntimeException("Đơn hàng chưa được đặt cọc nên không thể thanh toán phần còn lại.");
        }

        order.setPaymentPhase(PaymentPhase.FULLY_PAID);
        order.setPaymentStatus("PAID");
        order.setFinalPaidAt(LocalDateTime.now());
        order.setOrderStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("paymentPhase", order.getPaymentPhase().name());
        data.put("remainingAmount", order.getRemainingAmount());
        data.put("orderStatus", order.getOrderStatus().name());
        data.put("finalPaidAt", order.getFinalPaidAt());
        return data;
    }

    // ===== Xác nhận thanh toán từ callback VNPay (không có user context) =====

    @Transactional
    public void confirmDepositPaid(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if (order.getPaymentPhase() == null || order.getPaymentPhase() == PaymentPhase.UNPAID) {
            order.setPaymentPhase(PaymentPhase.DEPOSIT_PAID);
            order.setPaymentStatus("DEPOSIT_PAID");
            order.setDepositPaidAt(LocalDateTime.now());
            orderRepository.save(order);
        }
    }

    @Transactional
    public void confirmRemainingPaid(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if (order.getPaymentPhase() != PaymentPhase.FULLY_PAID) {
            order.setPaymentPhase(PaymentPhase.FULLY_PAID);
            order.setPaymentStatus("PAID");
            order.setFinalPaidAt(LocalDateTime.now());
            // Đơn custom: để buyer tự bấm "đơn đã hoàn tất" sau khi tải hình.
            // Đơn thường: hoàn tất ngay khi thanh toán đủ.
            if (!order.isCustomOrder()) {
                order.setOrderStatus(OrderStatus.COMPLETED);
            }
            orderRepository.save(order);
        }
    }

    // Lấy số tiền cần thanh toán cho 1 giai đoạn (deposit/remaining/full) của đơn
    public long getPayableAmount(String orderId, String phase) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        BigDecimal amount;
        if ("full".equalsIgnoreCase(phase)) {
            amount = order.getTotalAmount();
        } else if ("remaining".equalsIgnoreCase(phase)) {
            amount = order.getRemainingAmount();
        } else {
            amount = order.getDepositAmount();
        }
        if (amount == null) {
            amount = BigDecimal.ZERO;
        }
        return amount.setScale(0, RoundingMode.HALF_UP).longValue();
    }

    // Xác nhận thanh toán toàn bộ (sản phẩm có sẵn) từ callback VNPay
    @Transactional
    public void confirmFullPaid(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if (order.getPaymentPhase() != PaymentPhase.FULLY_PAID) {
            order.setPaymentPhase(PaymentPhase.FULLY_PAID);
            order.setPaymentStatus("PAID");
            LocalDateTime now = LocalDateTime.now();
            if (order.getDepositPaidAt() == null) {
                order.setDepositPaidAt(now);
            }
            order.setFinalPaidAt(now);
            // Sản phẩm có sẵn -> hoàn tất ngay. Đơn custom thì để buyer tự đóng.
            if (!order.isCustomOrder()) {
                order.setOrderStatus(OrderStatus.COMPLETED);
            }
            orderRepository.save(order);
        }
    }

    // Tính tiền cọc 30% và phần còn lại 70% (làm tròn tới đơn vị VND)
    private void applyDepositSplit(Order order, BigDecimal totalAmount) {
        BigDecimal deposit = totalAmount.multiply(DEPOSIT_RATE).setScale(0, RoundingMode.HALF_UP);
        order.setDepositAmount(deposit);
        order.setRemainingAmount(totalAmount.subtract(deposit));
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

    // ===== Đơn vẽ theo yêu cầu được đặt cho hoạ sĩ (artist) =====

    // Danh sách đơn custom mà seller hiện tại là hoạ sĩ thực hiện
    public Map<String, Object> getArtistOrders(User artist, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size);
        Page<Order> orderPage = orderRepository
                .findByArtistIdAndCustomOrderTrueOrderByCreatedAtDesc(artist.getId(), pageable);

        List<Map<String, Object>> orders = orderPage.getContent().stream()
                .map(this::toArtistOrderItem)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("orders", orders);
        data.put("pagination", new PaginationDto(page, orderPage.getTotalPages(), orderPage.getTotalElements()));
        return data;
    }

    private Order findArtistOrder(User artist, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if (!order.isCustomOrder() || order.getArtist() == null
                || !order.getArtist().getId().equals(artist.getId())) {
            throw new RuntimeException("Bạn không phải hoạ sĩ thực hiện đơn này.");
        }
        return order;
    }

    // Seller cập nhật tay tiến độ đơn custom của mình (bước 10%, 0..100)
    @Transactional
    public Map<String, Object> updateCustomOrderProgress(User artist, String orderId, Integer progress) {
        if (progress == null || progress < 0 || progress > 100 || progress % 10 != 0) {
            throw new RuntimeException("Tiến độ phải là bội số của 10 trong khoảng 0–100.");
        }
        Order order = findArtistOrder(artist, orderId);

        // Muốn đặt 100% (hoàn thành) thì bắt buộc đã upload hình kết quả
        if (progress == 100 && (order.getResultImageUrl() == null || order.getResultImageUrl().isBlank())) {
            throw new RuntimeException("Vui lòng upload hình kết quả trước khi đánh dấu hoàn thành 100%.");
        }

        order.setProgress(progress);
        // Tiến độ thể hiện qua progress %; COMPLETED chỉ set khi buyer bấm "đơn đã hoàn tất".
        orderRepository.save(order);

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("progress", order.getProgress());
        data.put("orderStatus", order.getOrderStatus().name());
        return data;
    }

    // Seller upload hình kết quả (data URL) cho đơn custom
    @Transactional
    public Map<String, Object> uploadResultImage(User artist, String orderId, String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new RuntimeException("Thiếu dữ liệu hình ảnh.");
        }
        Order order = findArtistOrder(artist, orderId);
        order.setResultImageUrl(imageUrl);
        orderRepository.save(order);

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("hasResultImage", true);
        return data;
    }

    // Buyer đóng đơn sau khi đã thanh toán đủ 100% và tải hình
    @Transactional
    public Map<String, Object> closeOrder(User buyer, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new RuntimeException("Bạn không có quyền đóng đơn hàng này.");
        }
        if (order.getPaymentPhase() != PaymentPhase.FULLY_PAID) {
            throw new RuntimeException("Đơn hàng cần được thanh toán đủ 100% trước khi hoàn tất.");
        }
        order.setOrderStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("orderStatus", order.getOrderStatus().name());
        return data;
    }

    // Buyer tải hình kết quả — chỉ khi đã thanh toán đủ 100%
    public Map<String, Object> getResultImageForBuyer(User buyer, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new RuntimeException("Bạn không có quyền tải hình của đơn này.");
        }
        if (order.getPaymentPhase() != PaymentPhase.FULLY_PAID) {
            throw new RuntimeException("Cần thanh toán đủ 100% để tải hình kết quả.");
        }
        if (order.getResultImageUrl() == null || order.getResultImageUrl().isBlank()) {
            throw new RuntimeException("Đơn chưa có hình kết quả.");
        }
        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("resultImageUrl", order.getResultImageUrl());
        return data;
    }

    private Map<String, Object> toArtistOrderItem(Order order) {
        Map<String, Object> item = new HashMap<>();
        item.put("orderId", order.getId());
        item.put("createdAt", order.getCreatedAt());
        item.put("totalAmount", order.getTotalAmount());
        item.put("depositAmount", order.getDepositAmount());
        item.put("remainingAmount", order.getRemainingAmount());
        item.put("paymentPhase", order.getPaymentPhase() != null ? order.getPaymentPhase().name() : null);
        item.put("orderStatus", order.getOrderStatus().name());
        item.put("progress", order.getProgress());
        item.put("customOrder", buildCustomOrderInfo(order));
        // Seller là người upload nên được xem lại hình kết quả (preview)
        item.put("resultImageUrl", order.getResultImageUrl());
        if (order.getBuyer() != null) {
            Map<String, Object> buyer = new HashMap<>();
            buyer.put("id", order.getBuyer().getId());
            buyer.put("fullName", order.getBuyer().getFullName());
            buyer.put("email", order.getBuyer().getEmail());
            item.put("buyer", buyer);
        }
        return item;
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

        applyDepositSplit(order, totalAmount);
        PaymentPhase phase = parsePaymentPhase(request.get("paymentPhase"), PaymentPhase.DEPOSIT_PAID);
        order.setPaymentPhase(phase);
        if (phase != PaymentPhase.UNPAID) {
            order.setDepositPaidAt(LocalDateTime.now());
            order.setPaymentStatus("DEPOSIT_PAID");
        }
        if (phase == PaymentPhase.FULLY_PAID) {
            order.setFinalPaidAt(LocalDateTime.now());
            order.setPaymentStatus("PAID");
        }

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
        if (request.get("paymentPhase") != null) {
            PaymentPhase phase = parsePaymentPhase(request.get("paymentPhase"), order.getPaymentPhase());
            order.setPaymentPhase(phase);
            if (phase != PaymentPhase.UNPAID && order.getDepositPaidAt() == null) {
                order.setDepositPaidAt(LocalDateTime.now());
            }
            if (phase == PaymentPhase.FULLY_PAID && order.getFinalPaidAt() == null) {
                order.setFinalPaidAt(LocalDateTime.now());
            }
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

    private Map<String, Object> buildCustomOrderInfo(Order order) {
        Map<String, Object> info = new HashMap<>();
        info.put("customerName", order.getCustomerName());
        info.put("artType", order.getArtType());
        info.put("style", order.getStyle());
        info.put("description", order.getDescription());
        info.put("refImageUrl", order.getRefImageUrl());
        // Không trả data URL hình kết quả ở list (buyer chỉ tải được sau khi trả đủ 100%).
        info.put("hasResultImage", order.getResultImageUrl() != null && !order.getResultImageUrl().isBlank());
        if (order.getArtist() != null) {
            info.put("artistId", order.getArtist().getId());
            info.put("artistName", order.getArtist().getFullName());
        }
        return info;
    }

    private Map<String, Object> toAdminDetail(Order order) {
        Map<String, Object> item = new HashMap<>();
        item.put("orderId", order.getId());
        item.put("isCustomOrder", order.isCustomOrder());
        if (order.isCustomOrder()) {
            item.put("customOrder", buildCustomOrderInfo(order));
        }
        item.put("totalAmount", order.getTotalAmount());
        item.put("paymentMethod", order.getPaymentMethod());
        item.put("paymentStatus", order.getPaymentStatus());
        item.put("orderStatus", order.getOrderStatus() != null ? order.getOrderStatus().name() : null);
        item.put("depositAmount", order.getDepositAmount());
        item.put("remainingAmount", order.getRemainingAmount());
        item.put("paymentPhase", order.getPaymentPhase() != null ? order.getPaymentPhase().name() : null);
        item.put("depositPaidAt", order.getDepositPaidAt());
        item.put("finalPaidAt", order.getFinalPaidAt());
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
        item.put("depositAmount", order.getDepositAmount());
        item.put("remainingAmount", order.getRemainingAmount());
        item.put("paymentMethod", order.getPaymentMethod());
        item.put("orderStatus", order.getOrderStatus().name());
        item.put("createdAt", order.getCreatedAt());
        item.put("paymentPhase", order.getPaymentPhase() != null ? order.getPaymentPhase().name() : null);
        item.put("progress", order.getProgress());
        item.put("isCustomOrder", order.isCustomOrder());
        if (order.isCustomOrder()) {
            item.put("customOrder", buildCustomOrderInfo(order));
        }
        List<OrderItem> orderItems = order.getItems() != null ? order.getItems() : new ArrayList<>();
        item.put("items", orderItems.stream().map(oi -> {
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
        item.put("depositAmount", order.getDepositAmount());
        item.put("remainingAmount", order.getRemainingAmount());
        item.put("paymentPhase", order.getPaymentPhase() != null ? order.getPaymentPhase().name() : null);
        item.put("paymentMethod", order.getPaymentMethod());
        item.put("orderStatus", order.getOrderStatus().name());
        item.put("createdAt", order.getCreatedAt());
        return item;
    }

    private PaymentPhase parsePaymentPhase(Object value, PaymentPhase fallback) {
        if (value == null || value.toString().isBlank()) {
            return fallback;
        }
        try {
            return PaymentPhase.valueOf(value.toString().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Giai đoạn thanh toán không hợp lệ.");
        }
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
