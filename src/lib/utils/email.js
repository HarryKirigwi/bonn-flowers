const brevoApiKey = process.env.BREVO_API_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Helper to send email via Brevo REST API
async function sendBrevoEmail({ to, sender, subject, htmlContent }) {
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': brevoApiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ to, sender, subject, htmlContent })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo email failed: ${error}`);
  }
  return response.json();
}

// Send order confirmation to customer
async function sendOrderConfirmation({ to, name, orderNumber }) {
  return sendBrevoEmail({
    to: [{ email: to, name }],
    sender: { email: adminEmail, name: 'Bonn Flowers' },
    subject: `Your Order ${orderNumber} has been received!`,
    htmlContent: `
      <h2>Thank you for your order, ${name}!</h2>
      <p>Your order <b>${orderNumber}</b> has been received and is being processed.</p>
      <p>We will contact you soon to confirm delivery details.</p>
      <p>With love,<br/>Bonn Flowers Team</p>
    `
  });
}

// Send order notification to admin
async function sendOrderNotificationToAdmin({ order }) {
  const shipping = order.shippingAddress || {};
  const itemsHtml = order.orderItems
    ? order.orderItems.map(item => `<li>${item.quantity} x ${item.product?.name || 'Product #' + item.productId} @ KES ${item.price}</li>`).join('')
    : '';
  return sendBrevoEmail({
    to: [{ email: adminEmail, name: 'Admin' }],
    sender: { email: adminEmail, name: 'Bonn Flowers' },
    subject: `New Order: ${order.orderNumber || order.id}`,
    htmlContent: `
      <h2>New Order Received</h2>
      <p><b>Order Number:</b> ${order.orderNumber || order.id}</p>
      <p><b>Customer Name:</b> ${shipping.name}</p>
      <p><b>Email:</b> ${shipping.email}</p>
      <p><b>Phone:</b> ${shipping.phone}</p>
      <p><b>Address:</b> ${shipping.address}, ${shipping.city}, ${shipping.county}, ${shipping.postalCode || ''}</p>
      <p><b>Special Instructions:</b> ${shipping.specialInstructions || ''}</p>
      <p><b>Preferred Delivery Time:</b> ${shipping.preferredDeliveryTime || ''}</p>
      <p><b>Items:</b></p>
      <ul>${itemsHtml}</ul>
      <p><b>Total:</b> KES ${order.total}</p>
      <p><b>Delivery Fee:</b> KES ${order.deliveryFee || 0}</p>
      <p>Status: ${order.status}</p>
    `
  });
}

export { sendOrderConfirmation, sendOrderNotificationToAdmin };
