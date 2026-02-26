import { Resend } from "resend";
import { config } from "../config/env.js";
import { prisma } from "../config/database.js";

interface OrderWithItems {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  address: string;
  brandSlug: string | null;
  totalAmount: string | null;
  status: string;
  createdAt: Date;
  items: Array<{
    id: string;
    productCode: string;
    title: string;
    price: string;
    sizeRange: string;
    imageUrl: string;
    quantity: number;
    color: string | null;
  }>;
}

// Email cevirileri - backend'de bagimsiz ceviri haritasi
const emailTranslations: Record<string, Record<string, string>> = {
  tr: {
    newOrder: "YENI SIPARIS",
    customerInfo: "Musteri Bilgileri",
    fullName: "Ad Soyad",
    phone: "Telefon",
    address: "Adres",
    orderDetails: "Siparis Detaylari",
    product: "Urun",
    size: "Beden",
    color: "Renk",
    quantity: "Adet",
    price: "Fiyat",
    total: "Toplam",
    orderConfirmed: "Siparisiniz Alindi!",
    dear: "Sayin",
    orderConfirmedMessage:
      "Siparisiniz basariyla alindi. Asagida siparis detaylarinizi bulabilirsiniz.",
    subjectNewOrder: "Yeni Siparis",
    subjectOrderConfirmed: "Siparisiniz Alindi",
  },
  en: {
    newOrder: "NEW ORDER",
    customerInfo: "Customer Information",
    fullName: "Full Name",
    phone: "Phone",
    address: "Address",
    orderDetails: "Order Details",
    product: "Product",
    size: "Size",
    color: "Color",
    quantity: "Qty",
    price: "Price",
    total: "Total",
    orderConfirmed: "Your Order Has Been Received!",
    dear: "Dear",
    orderConfirmedMessage:
      "Your order has been successfully received. You can find your order details below.",
    subjectNewOrder: "New Order",
    subjectOrderConfirmed: "Your Order Has Been Received",
  },
  ru: {
    newOrder: "НОВЫЙ ЗАКАЗ",
    customerInfo: "Информация о клиенте",
    fullName: "Имя Фамилия",
    phone: "Телефон",
    address: "Адрес",
    orderDetails: "Детали заказа",
    product: "Товар",
    size: "Размер",
    color: "Цвет",
    quantity: "Кол-во",
    price: "Цена",
    total: "Итого",
    orderConfirmed: "Ваш заказ принят!",
    dear: "Уважаемый(ая)",
    orderConfirmedMessage:
      "Ваш заказ успешно принят. Ниже вы найдете детали вашего заказа.",
    subjectNewOrder: "Новый заказ",
    subjectOrderConfirmed: "Ваш заказ принят",
  },
};

const localeMap: Record<string, string> = {
  tr: "tr-TR",
  en: "en-US",
  ru: "ru-RU",
};

function getT(lang: string): Record<string, string> {
  return emailTranslations[lang] || emailTranslations["tr"];
}

function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
}

function formatDate(date: Date, lang: string): string {
  return date.toLocaleDateString(localeMap[lang] || "tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildOrderEmailHtml(
  order: OrderWithItems,
  siteName: string,
  siteLogo: string | null,
  lang: string,
): string {
  const t = getT(lang);
  const locale = localeMap[lang] || "tr-TR";
  const totalAmount = order.items.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0,
  );

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0;">
          <strong style="color: #111;">${item.title}</strong><br/>
          <span style="color: #888; font-size: 12px;">${item.productCode}</span>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #555; text-align: center;">
          ${item.sizeRange}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #555; text-align: center;">
          ${item.color || "\u2014"}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #555; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #111; font-weight: 600; text-align: right;">
          ${item.price}
        </td>
      </tr>`,
    )
    .join("");

  const logoHtml = siteLogo
    ? `<img src="${siteLogo}" alt="${siteName}" style="max-width: 160px; height: auto; margin-bottom: 16px;" />`
    : `<h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #111;">${siteName}</h1>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 16px;">

    <!-- Header -->
    <div style="background-color: #ffffff; border-radius: 12px 12px 0 0; padding: 32px; text-align: center; border-bottom: 3px solid #111;">
      ${logoHtml}
      <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #111; letter-spacing: 0.5px;">
        ${t.newOrder}
      </h2>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #888; font-family: monospace;">
        #${order.orderNumber}
      </p>
    </div>

    <!-- Musteri Bilgileri -->
    <div style="background-color: #ffffff; padding: 24px 32px; border-bottom: 1px solid #f0f0f0;">
      <h3 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px;">
        ${t.customerInfo}
      </h3>
      <table style="width: 100%; font-size: 14px; color: #333;">
        <tr>
          <td style="padding: 4px 0; color: #888; width: 120px;">${t.fullName}</td>
          <td style="padding: 4px 0; font-weight: 600;">${order.firstName} ${order.lastName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #888;">${t.phone}</td>
          <td style="padding: 4px 0; font-weight: 600;">${order.phone}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #888;">${t.address}</td>
          <td style="padding: 4px 0; font-weight: 600;">${order.address}</td>
        </tr>
      </table>
    </div>

    <!-- Urunler -->
    <div style="background-color: #ffffff; padding: 24px 32px;">
      <h3 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px;">
        ${t.orderDetails}
      </h3>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #111;">
            <th style="padding: 8px 16px; text-align: left; font-weight: 600; color: #555;">${t.product}</th>
            <th style="padding: 8px 16px; text-align: center; font-weight: 600; color: #555;">${t.size}</th>
            <th style="padding: 8px 16px; text-align: center; font-weight: 600; color: #555;">${t.color}</th>
            <th style="padding: 8px 16px; text-align: center; font-weight: 600; color: #555;">${t.quantity}</th>
            <th style="padding: 8px 16px; text-align: right; font-weight: 600; color: #555;">${t.price}</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>

    <!-- Toplam -->
    <div style="background-color: #111; border-radius: 0 0 12px 12px; padding: 24px 32px; text-align: right;">
      <span style="color: #888; font-size: 14px; margin-right: 16px;">${t.total}</span>
      <span style="color: #fff; font-size: 24px; font-weight: 700;">
        ${totalAmount.toLocaleString(locale)} $
      </span>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px 0;">
      <p style="margin: 0; font-size: 12px; color: #aaa;">
        ${formatDate(order.createdAt, lang)} &bull; ${siteName}
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOrderNotification(
  order: OrderWithItems,
  lang: string = "tr",
): Promise<void> {
  if (!config.RESEND_API_KEY) {
    console.log("RESEND_API_KEY tanimli degil, email gonderilmedi");
    return;
  }

  const t = getT(lang);

  // Settings'ten bildirim emaili ve site bilgilerini al
  const settings = await prisma.settings.findMany({
    where: {
      key: { in: ["notification_email", "site_name", "site_logo"] },
    },
  });

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const notificationEmailRaw = settingsMap["notification_email"];

  if (!notificationEmailRaw || !notificationEmailRaw.trim()) {
    console.log("notification_email ayari tanimli degil, email gonderilmedi");
    return;
  }

  // Virgul ile ayrilmis birden fazla email destegi
  const recipients = notificationEmailRaw
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  if (recipients.length === 0) {
    console.log("Gecerli email adresi bulunamadi");
    return;
  }

  const siteName = settingsMap["site_name"] || "Kiosk QR";
  const siteLogo = settingsMap["site_logo"] || null;

  const resend = new Resend(config.RESEND_API_KEY);
  const html = buildOrderEmailHtml(order, siteName, siteLogo, lang);

  const { error } = await resend.emails.send({
    from: `${siteName} <${config.RESEND_FROM_EMAIL}>`,
    to: recipients,
    subject: `${t.subjectNewOrder} \u2014 #${order.orderNumber}`,
    html,
  });

  if (error) {
    console.error("Resend email hatasi:", error);
  } else {
    console.log(
      `Siparis bildirimi gonderildi: ${order.orderNumber} \u2192 ${recipients.join(", ")}`,
    );
  }
}

function buildCustomerConfirmationHtml(
  order: OrderWithItems,
  siteName: string,
  siteLogo: string | null,
  lang: string,
): string {
  const t = getT(lang);
  const locale = localeMap[lang] || "tr-TR";
  const totalAmount = order.items.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0,
  );

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0;">
          <strong style="color: #111; font-size: 13px;">${item.title}</strong><br/>
          <span style="color: #999; font-size: 11px;">${item.productCode} | ${item.sizeRange}${item.color ? ` | ${item.color}` : ""}</span>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #555; text-align: center; font-size: 13px;">
          x${item.quantity}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #111; font-weight: 600; text-align: right; font-size: 13px;">
          ${item.price}
        </td>
      </tr>`,
    )
    .join("");

  const logoHtml = siteLogo
    ? `<img src="${siteLogo}" alt="${siteName}" style="max-width: 140px; height: auto; margin-bottom: 16px;" />`
    : `<h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #111;">${siteName}</h1>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 32px 16px;">

    <!-- Header -->
    <div style="background-color: #ffffff; border-radius: 12px 12px 0 0; padding: 32px; text-align: center; border-bottom: 2px solid #111;">
      ${logoHtml}
      <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #111;">
        ${t.orderConfirmed}
      </h2>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #888; font-family: monospace;">
        #${order.orderNumber}
      </p>
    </div>

    <!-- Mesaj -->
    <div style="background-color: #ffffff; padding: 24px 32px; border-bottom: 1px solid #f0f0f0;">
      <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
        ${t.dear} ${order.firstName} ${order.lastName},<br/>
        ${t.orderConfirmedMessage}
      </p>
    </div>

    <!-- Urunler -->
    <div style="background-color: #ffffff; padding: 20px 32px;">
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #eee;">
            <th style="padding: 8px 12px; text-align: left; font-weight: 600; color: #888; font-size: 11px; text-transform: uppercase;">${t.product}</th>
            <th style="padding: 8px 12px; text-align: center; font-weight: 600; color: #888; font-size: 11px; text-transform: uppercase;">${t.quantity}</th>
            <th style="padding: 8px 12px; text-align: right; font-weight: 600; color: #888; font-size: 11px; text-transform: uppercase;">${t.price}</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>

    <!-- Toplam -->
    <div style="background-color: #111; border-radius: 0 0 12px 12px; padding: 20px 32px; display: flex; justify-content: space-between; align-items: center;">
      <span style="color: #888; font-size: 14px;">${t.total}</span>
      <span style="color: #fff; font-size: 22px; font-weight: 700; float: right;">
        ${totalAmount.toLocaleString(locale)} $
      </span>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px 0;">
      <p style="margin: 0; font-size: 11px; color: #aaa;">
        ${siteName} &bull; ${formatDate(order.createdAt, lang)}
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendCustomerConfirmation(
  order: OrderWithItems,
  lang: string = "tr",
): Promise<void> {
  if (!config.RESEND_API_KEY || !order.email) {
    return;
  }

  const t = getT(lang);

  const settings = await prisma.settings.findMany({
    where: {
      key: { in: ["site_name", "site_logo"] },
    },
  });

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const siteName = settingsMap["site_name"] || "Kiosk QR";
  const siteLogo = settingsMap["site_logo"] || null;

  const resend = new Resend(config.RESEND_API_KEY);
  const html = buildCustomerConfirmationHtml(order, siteName, siteLogo, lang);

  const { error } = await resend.emails.send({
    from: `${siteName} <${config.RESEND_FROM_EMAIL}>`,
    to: order.email,
    subject: `${t.subjectOrderConfirmed} \u2014 #${order.orderNumber}`,
    html,
  });

  if (error) {
    console.error("Musteri onay emaili hatasi:", error);
  } else {
    console.log(
      `Musteri onay emaili gonderildi: ${order.orderNumber} \u2192 ${order.email}`,
    );
  }
}
