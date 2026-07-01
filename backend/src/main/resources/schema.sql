-- Schema aligned to uploaded JPA entities
-- Entities used: User, Category, Product, Cart, CartItem, Order, OrderItem, RevenueRecord

DROP DATABASE IF EXISTS `digital_art_platform`;
CREATE DATABASE `digital_art_platform` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `digital_art_platform`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `revenue_records`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- users -> User.java
-- =========================
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(255) DEFAULT NULL,
  `verification_token` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(255) NOT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- categories -> Category.java
-- =========================
CREATE TABLE `categories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- products -> Product.java
-- =========================
CREATE TABLE `products` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(38,2) NOT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `file_url` VARCHAR(255) DEFAULT NULL,
  `view_count` INT DEFAULT 0,
  `status` VARCHAR(255) DEFAULT 'PENDING',
  `category_id` BIGINT DEFAULT NULL,
  `seller_id` BIGINT DEFAULT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_products_category_id` (`category_id`),
  KEY `idx_products_seller_id` (`seller_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `fk_products_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- carts -> Cart.java
-- =========================
CREATE TABLE `carts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `buyer_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_carts_buyer_id` (`buyer_id`),
  CONSTRAINT `fk_carts_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- cart_items -> CartItem.java
-- =========================
CREATE TABLE `cart_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `cart_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_cart_items_cart_id` (`cart_id`),
  KEY `idx_cart_items_product_id` (`product_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`),
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- orders -> Order.java
-- =========================
CREATE TABLE `orders` (
  `id` VARCHAR(255) NOT NULL,
  `buyer_id` BIGINT NOT NULL,
  `total_amount` DECIMAL(38,2) NOT NULL,
  `payment_method` VARCHAR(255) NOT NULL,
  `order_status` VARCHAR(255) NOT NULL DEFAULT 'PENDING',
  `payment_url` VARCHAR(255) DEFAULT NULL,
  `payment_status` VARCHAR(255) DEFAULT 'PENDING',
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_orders_buyer_id` (`buyer_id`),
  CONSTRAINT `fk_orders_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- order_items -> OrderItem.java
-- =========================
CREATE TABLE `order_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` VARCHAR(255) NOT NULL,
  `product_id` BIGINT NOT NULL,
  `quantity` INT DEFAULT NULL,
  `unit_price` DECIMAL(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`),
  KEY `idx_order_items_product_id` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- revenue_records -> RevenueRecord.java
-- =========================
CREATE TABLE `revenue_records` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `seller_id` BIGINT NOT NULL,
  `order_id` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(38,2) NOT NULL,
  `recorded_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_revenue_records_seller_id` (`seller_id`),
  KEY `idx_revenue_records_order_id` (`order_id`),
  CONSTRAINT `fk_revenue_records_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_revenue_records_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional sample enum values reminder:
-- users.role: BUYER, SELLER, ADMIN
-- users.status: ACTIVE, BANNED
-- products.status: must match ProductStatus.java, default used by entity is PENDING
-- orders.order_status: must match OrderStatus.java, default used by entity is PENDING
