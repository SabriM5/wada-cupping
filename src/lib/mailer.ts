import { Resend } from 'resend';
import ClientConfirmationEmail from '@/emails/ClientConfirmationEmail';
import AdminNotificationEmail from '@/emails/AdminNotificationEmail';
import CancellationEmail from '@/emails/CancellationEmail';

// Initialisation avec la clé API stockée dans le fichier .env
const resend = new Resend(process.env.RESEND_API_KEY);

// L'adresse d'expédition (Doit utiliser le nom de domaine que tu vas lier à Vercel/Resend)
const SENDER_EMAIL = 'WADA Cupping Therapy <contact@wada-cupping.fr>'; 
// L'email d'Amira qui recevra les notifications de nouveaux RDV
const ADMIN_EMAIL = 'wada.cupping@gmail.com';

export async function sendClientConfirmation(appointment: any, service: any) {
  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: appointment.clientEmail,
      subject: 'Confirmation de votre séance de Cupping Therapy',
      replyTo: ADMIN_EMAIL,
      react: ClientConfirmationEmail({ appointment, service }),
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur d'envoi email client:", error);
    return { success: false, error };
  }
}

export async function sendAdminNotification(appointment: any, service: any) {
  try {
    await resend.emails.send({
      from: 'Système de Réservation <system@tondomaine.fr>',
      to: ADMIN_EMAIL,
      subject: `Nouveau Rendez-vous : ${service.name} - ${appointment.clientName}`,
      react: AdminNotificationEmail({ appointment, service }),
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur d'envoi email admin:", error);
    return { success: false, error };
  }
}

export async function sendCancellation(appointment: any, service: any, cancelledBy: 'ADMIN' | 'CLIENT') {
  const recipient = cancelledBy === 'ADMIN' ? appointment.clientEmail : ADMIN_EMAIL;
  const subject = cancelledBy === 'ADMIN' 
    ? 'Annulation de votre séance de Cupping Therapy' 
    : `Annulation client : ${appointment.clientName}`;

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: recipient,
      subject: subject,
      replyTo: ADMIN_EMAIL,
      react: CancellationEmail({ appointment, service, cancelledBy }),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendReminderEmail(appointment: any, service: any) {
  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: appointment.clientEmail,
      subject: 'Rappel de votre séance de Cupping Therapy',
      replyTo: ADMIN_EMAIL,
      react: ClientConfirmationEmail({ appointment, service }), // On réutilise le template pour l'instant
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}