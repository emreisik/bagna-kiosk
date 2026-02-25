import { Resend } from "resend";
import { config } from "../config/env.js";
import { prisma } from "../config/database.js";

interface OrderWithItems {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
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

function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("tr-TR", {
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
): string {
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
          ${item.color || "—"}
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
        YENI SIPARIS
      </h2>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #888; font-family: monospace;">
        #${order.orderNumber}
      </p>
    </div>

    <!-- Musteri Bilgileri -->
    <div style="background-color: #ffffff; padding: 24px 32px; border-bottom: 1px solid #f0f0f0;">
      <h3 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px;">
        Musteri Bilgileri
      </h3>
      <table style="width: 100%; font-size: 14px; color: #333;">
        <tr>
          <td style="padding: 4px 0; color: #888; width: 120px;">Ad Soyad</td>
          <td style="padding: 4px 0; font-weight: 600;">${order.firstName} ${order.lastName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #888;">Telefon</td>
          <td style="padding: 4px 0; font-weight: 600;">${order.phone}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #888;">Adres</td>
          <td style="padding: 4px 0; font-weight: 600;">${order.address}</td>
        </tr>
      </table>
    </div>

    <!-- Urunler -->
    <div style="background-color: #ffffff; padding: 24px 32px;">
      <h3 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px;">
        Siparis Detaylari
      </h3>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #111;">
            <th style="padding: 8px 16px; text-align: left; font-weight: 600; color: #555;">Urun</th>
            <th style="padding: 8px 16px; text-align: center; font-weight: 600; color: #555;">Beden</th>
            <th style="padding: 8px 16px; text-align: center; font-weight: 600; color: #555;">Renk</th>
            <th style="padding: 8px 16px; text-align: center; font-weight: 600; color: #555;">Adet</th>
            <th style="padding: 8px 16px; text-align: right; font-weight: 600; color: #555;">Fiyat</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>

    <!-- Toplam -->
    <div style="background-color: #111; border-radius: 0 0 12px 12px; padding: 24px 32px; text-align: right;">
      <span style="color: #888; font-size: 14px; margin-right: 16px;">Toplam</span>
      <span style="color: #fff; font-size: 24px; font-weight: 700;">
        ${totalAmount.toLocaleString("tr-TR")} $
      </span>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px 0;">
      <p style="margin: 0; font-size: 12px; color: #aaa;">
        ${formatDate(order.createdAt)} &bull; ${siteName}
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOrderNotification(
  order: OrderWithItems,
): Promise<void> {
  if (!config.RESEND_API_KEY) {
    console.log("RESEND_API_KEY tanimli degil, email gonderilmedi");
    return;
  }

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
  const html = buildOrderEmailHtml(order, siteName, siteLogo);

  const { error } = await resend.emails.send({
    from: `${siteName} <${config.RESEND_FROM_EMAIL}>`,
    to: recipients,
    subject: `Yeni Siparis — #${order.orderNumber}`,
    html,
  });

  if (error) {
    console.error("Resend email hatasi:", error);
  } else {
    console.log(
      `Siparis bildirimi gonderildi: ${order.orderNumber} → ${recipients.join(", ")}`,
    );
  }
}
