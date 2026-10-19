import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link } from '@react-email/components';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as React from 'react';

export default function AdminNotificationEmail({ appointment, service }: any) {
  const formattedDate = format(new Date(appointment.startsAt), 'EEEE d MMMM yyyy', { locale: fr });
  const formattedTime = format(new Date(appointment.startsAt), 'HH:mm', { locale: fr });

  // Formatage du numéro pour WhatsApp (ex: 06 12 34 56 78 -> 33612345678)
  const cleanPhone = (appointment.clientPhone || "").replace(/[\s.-]/g, "");
  const waPhone = cleanPhone.startsWith("0") ? `33${cleanPhone.substring(1)}` : cleanPhone.replace("+", "");

  // Message pré-rempli pour proposer un autre créneau
  const rescheduleText = encodeURIComponent(
    `Bonjour ${appointment.clientName},\n\nMerci beaucoup pour votre réservation chez WADA Cupping Therapy (${service?.name}) prévue le ${formattedDate} à ${formattedTime}.\n\nJ'ai malheureusement un imprévu sur ce créneau exact. Seriez-vous disponible à un autre moment dans la journée ou sur une autre date qui vous arrangerait ?\n\nÀ très vite,\nAmira - WADA`
  );

  const whatsappUrl = `https://wa.me/${waPhone}?text=${rescheduleText}`;
  const mailtoUrl = `mailto:${appointment.clientEmail}?subject=${encodeURIComponent(`Votre rendez-vous WADA du ${formattedDate}`)}&body=${rescheduleText}`;

  return (
    <Html>
      <Head />
      <Preview>Nouveau RDV : {appointment.clientName} - {formattedDate} à {formattedTime}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Nouvelle Réservation WADA</Heading>
          <Text style={text}>
            Bonjour Amira, une nouvelle réservation vient d'être effectuée sur le site :
          </Text>

          <Section style={card}>
            <Text style={cardTitle}>Détails du Rendez-vous</Text>
            <Hr style={hr} />
            <Text style={cardText}><strong>Cliente :</strong> {appointment.clientName}</Text>
            <Text style={cardText}>
              <strong>Prestation :</strong> {service?.name} {appointment.isCure ? "(Format CURE)" : "(Séance à l'unité)"}
            </Text>
            <Text style={cardText}><strong>Date & Heure :</strong> {formattedDate} à {formattedTime}</Text>
            <Text style={cardText}><strong>Paiement :</strong> {appointment.paymentMethod}</Text>
            <Text style={cardText}><strong>Adresse :</strong> {appointment.clientAddress}</Text>
            <Text style={cardText}><strong>Téléphone :</strong> {appointment.clientPhone || "Non renseigné"}</Text>
            <Text style={cardText}><strong>Email :</strong> {appointment.clientEmail}</Text>
          </Section>

          <Section style={actionBox}>
            <Text style={actionTitle}>Un imprévu sur ce créneau ?</Text>
            <Text style={actionDesc}>
              Cliquez ci-dessous pour contacter directement la cliente avec un message pré-rempli et convenir ensemble d'un autre horaire :
            </Text>

            {waPhone && (
              <Link href={whatsappUrl} style={btnWhatsapp}>
                💬 Proposer un autre créneau sur WhatsApp
              </Link>
            )}

            <Link href={mailtoUrl} style={btnMail}>
              ✉️ Proposer un autre créneau par E-mail
            </Link>

            <Link href="https://www.wada-cupping.fr/admin/calendrier" style={btnAdmin}>
              🗓️ Ouvrir mon Planning Admin (Valider / Déplacer)
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#FAFAF7', fontFamily: 'Montserrat, sans-serif' };
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '600px' };
const h1 = { color: '#1A1A1A', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' as const, margin: '20px 0' };
const text = { color: '#333333', fontSize: '15px', lineHeight: '24px' };
const card = { backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', margin: '20px 0', border: '1px solid #E5E5E0' };
const cardTitle = { color: '#8C8C8C', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' as const, letterSpacing: '2px', margin: '0 0 12px' };
const cardText = { color: '#1A1A1A', fontSize: '15px', margin: '8px 0' };
const hr = { borderColor: '#E5E5E0', margin: '12px 0' };

const actionBox = { backgroundColor: '#1A1A1A', padding: '28px', borderRadius: '20px', margin: '24px 0', textAlign: 'center' as const };
const actionTitle = { color: '#FAFAF7', fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px' };
const actionDesc = { color: '#CCCCCC', fontSize: '13px', lineHeight: '20px', margin: '0 0 20px' };

const btnWhatsapp = { display: 'block', backgroundColor: '#25D366', color: '#FFFFFF', padding: '14px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none', marginBottom: '12px' };
const btnMail = { display: 'block', backgroundColor: '#FFFFFF', color: '#1A1A1A', padding: '14px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none', marginBottom: '12px' };
const btnAdmin = { display: 'block', backgroundColor: '#8C8C8C', color: '#FFFFFF', padding: '14px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none' };