import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const orders=sqliteTable('orders',{
 id:text('id').primaryKey(), tokenHash:text('token_hash').notNull().unique(), requestHash:text('request_hash').notNull(),
 razorpayOrderId:text('razorpay_order_id').unique(), paymentId:text('payment_id').unique(),
 amount:integer('amount').notNull(), currency:text('currency').notNull().default('INR'),
 items:text('items').notNull(), customer:text('customer').notNull(), status:text('status').notNull().default('creating'),
 createdAt:integer('created_at').notNull(), paidAt:integer('paid_at'),
});
export const limits=sqliteTable('checkout_limits',{
 id:text('id').primaryKey(), count:integer('count').notNull(), expiresAt:integer('expires_at').notNull(),
});
