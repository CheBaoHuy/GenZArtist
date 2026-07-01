package com.kaiju.store.controller;

import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.service.OrderService;
import com.kaiju.store.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment/vnpay")
public class PaymentController {

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private OrderService orderService;

    @Value("${vnpay.frontend-result-url}")
    private String frontendResultUrl;

    private static final String SEP = "__"; // ngăn cách orderId và phase trong txnRef

    /**
     * Tạo URL thanh toán VNPay.
     * - Nếu có orderId (đơn thật): số tiền lấy từ đơn theo phase (deposit/remaining).
     * - Nếu không (demo từ Checkout mock): dùng tham số amount truyền vào.
     */
    @GetMapping("/create")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPayment(
            @RequestParam(required = false) String orderId,
            @RequestParam(defaultValue = "deposit") String phase,
            @RequestParam(required = false) Long amount,
            HttpServletRequest request) {

        String normalizedPhase = "remaining".equalsIgnoreCase(phase) ? "remaining"
                : "full".equalsIgnoreCase(phase) ? "full" : "deposit";
        long amountVnd;
        String txnRef;

        if (orderId != null && !orderId.isBlank()) {
            amountVnd = orderService.getPayableAmount(orderId, normalizedPhase);
            txnRef = orderId + SEP + normalizedPhase;
        } else {
            // Chế độ demo (Checkout mock): không gắn với đơn thật
            amountVnd = amount != null ? amount : 10000L;
            txnRef = "DEMO" + System.currentTimeMillis() + SEP + normalizedPhase;
        }

        if (amountVnd <= 0) {
            amountVnd = 10000L;
        }

        // "full" = thanh toán toàn bộ (sản phẩm có sẵn); deposit/remaining = đơn vẽ custom
        String label = normalizedPhase.equals("remaining") ? "70% con lai"
                : normalizedPhase.equals("full") ? "toan bo don hang" : "coc 30%";
        String orderInfo = "Thanh toan " + label + (orderId != null ? " don " + orderId : "");
        String paymentUrl = vnPayService.createPaymentUrl(txnRef, amountVnd, orderInfo, getClientIp(request));

        Map<String, Object> data = new HashMap<>();
        data.put("paymentUrl", paymentUrl);
        data.put("amount", amountVnd);
        data.put("phase", normalizedPhase);
        return ResponseEntity.ok(new ApiResponse<>("success", null, data));
    }

    /**
     * VNPay redirect trình duyệt người dùng về đây sau khi thanh toán.
     * Verify chữ ký, cập nhật đơn (nếu là đơn thật) rồi chuyển hướng về trang kết quả của frontend.
     */
    @GetMapping("/return")
    public RedirectView vnpayReturn(@RequestParam Map<String, String> params) {
        boolean validSignature = vnPayService.verifySignature(params);
        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.getOrDefault("vnp_TxnRef", "");
        boolean success = validSignature && "00".equals(responseCode);

        String phase = txnRef.contains(SEP) ? txnRef.substring(txnRef.lastIndexOf(SEP) + SEP.length()) : "deposit";
        String orderId = txnRef.contains(SEP) ? txnRef.substring(0, txnRef.lastIndexOf(SEP)) : "";
        boolean isRealOrder = !orderId.isBlank() && !orderId.startsWith("DEMO");

        if (success && isRealOrder) {
            try {
                if ("remaining".equalsIgnoreCase(phase)) {
                    orderService.confirmRemainingPaid(orderId);
                } else if ("full".equalsIgnoreCase(phase)) {
                    orderService.confirmFullPaid(orderId);
                } else {
                    orderService.confirmDepositPaid(orderId);
                }
            } catch (RuntimeException ignored) {
                // Không chặn redirect nếu cập nhật đơn lỗi (vd: đơn demo / không tồn tại)
            }
        }

        String redirect = frontendResultUrl
                + "?status=" + (success ? "success" : "failed")
                + "&phase=" + enc(phase)
                + "&orderId=" + enc(orderId)
                + "&amount=" + enc(params.getOrDefault("vnp_Amount", ""))
                + "&code=" + enc(responseCode != null ? responseCode : "");
        return new RedirectView(redirect);
    }

    /**
     * IPN (server-to-server) — VNPay gọi để xác nhận giao dịch. Trả JSON theo chuẩn VNPay.
     */
    @GetMapping("/ipn")
    public Map<String, String> vnpayIpn(@RequestParam Map<String, String> params) {
        Map<String, String> result = new HashMap<>();
        if (!vnPayService.verifySignature(params)) {
            result.put("RspCode", "97");
            result.put("Message", "Invalid signature");
            return result;
        }

        String txnRef = params.getOrDefault("vnp_TxnRef", "");
        String responseCode = params.get("vnp_ResponseCode");
        String phase = txnRef.contains(SEP) ? txnRef.substring(txnRef.lastIndexOf(SEP) + SEP.length()) : "deposit";
        String orderId = txnRef.contains(SEP) ? txnRef.substring(0, txnRef.lastIndexOf(SEP)) : "";

        if ("00".equals(responseCode) && !orderId.isBlank() && !orderId.startsWith("DEMO")) {
            try {
                if ("remaining".equalsIgnoreCase(phase)) {
                    orderService.confirmRemainingPaid(orderId);
                } else if ("full".equalsIgnoreCase(phase)) {
                    orderService.confirmFullPaid(orderId);
                } else {
                    orderService.confirmDepositPaid(orderId);
                }
            } catch (RuntimeException ignored) {
            }
        }

        result.put("RspCode", "00");
        result.put("Message", "Confirm Success");
        return result;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    private String enc(String value) {
        return URLEncoder.encode(value != null ? value : "", StandardCharsets.UTF_8);
    }
}
