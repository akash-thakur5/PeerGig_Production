const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #eaeaea;
  border-radius: 12px;
`;

const buttonStyle = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #3B82F6;
  color: #ffffff !important;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  margin-top: 20px;
`;

export function getWelcomeEmailHtml(name: string) {
  return `
    <div style="${baseStyles}">
      <h1 style="color: #111;">Welcome to PeerGig, ${name}! 🎉</h1>
      <p>We're thrilled to have you join our peer-to-peer learning community.</p>
      <p>Whether you're here to learn a new skill, share your expertise, or both, PeerGig is designed to make knowledge exchange seamless and rewarding.</p>
      <a href="http://localhost:3000/dashboard" style="${buttonStyle}">Go to Dashboard</a>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">If you didn't create this account, you can safely ignore this email.</p>
    </div>
  `;
}

export function getBookingPendingTutorHtml(tutorName: string, gigTitle: string) {
  return `
    <div style="${baseStyles}">
      <h1 style="color: #111;">New Booking Request! 🚀</h1>
      <p>Hi ${tutorName},</p>
      <p>Great news! A student has just booked your gig: <strong>"${gigTitle}"</strong>.</p>
      <p>Their payment has been securely verified and is held in escrow. Please log in to accept the booking and release the funds to your wallet.</p>
      <a href="http://localhost:3000/dashboard" style="${buttonStyle}">Review Booking</a>
    </div>
  `;
}

export function getBookingPendingStudentHtml(studentName: string, gigTitle: string) {
  return `
    <div style="${baseStyles}">
      <h1 style="color: #111;">Payment Verified ✅</h1>
      <p>Hi ${studentName},</p>
      <p>Your payment for <strong>"${gigTitle}"</strong> has been securely verified!</p>
      <p>We are currently holding your funds in escrow. The tutor has been notified and needs to accept your booking request. Once they do, we'll send you another email with the confirmation.</p>
      <a href="http://localhost:3000/dashboard" style="${buttonStyle}">View Status</a>
    </div>
  `;
}

export function getBookingConfirmedHtml(studentName: string, gigTitle: string) {
  return `
    <div style="${baseStyles}">
      <h1 style="color: #111;">Booking Confirmed! 🎉</h1>
      <p>Hi ${studentName},</p>
      <p>Your tutor has accepted your booking for <strong>"${gigTitle}"</strong>.</p>
      <p>You can view your confirmed schedule and access your secure meeting room directly from your dashboard.</p>
      <a href="http://localhost:3000/dashboard" style="${buttonStyle}">Go to Dashboard</a>
    </div>
  `;
}

export function getBookingRejectedHtml(studentName: string, gigTitle: string) {
  return `
    <div style="${baseStyles}">
      <h1 style="color: #111;">Booking Declined</h1>
      <p>Hi ${studentName},</p>
      <p>Unfortunately, your tutor was unable to accept the booking for <strong>"${gigTitle}"</strong> at this time.</p>
      <p>A full refund has been instantly credited back to your PeerGig wallet. You can use these funds to book another session anytime.</p>
      <a href="http://localhost:3000/wallet" style="${buttonStyle}">View Wallet</a>
    </div>
  `;
}
