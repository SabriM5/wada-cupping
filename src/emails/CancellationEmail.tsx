import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as React from 'react';

export default function CancellationEmail({ appointment, service, cancelledBy }: any) {
  // Sécurité au cas où la date ne soit pas transmise
  const dateObj = appointment.startsAt ? new Date(appointment.startsAt) : new Date();
  const formattedDate = format(dateObj, 'EEEE d MMMM yyyy', { locale: fr });
  const formattedTime = format(dateObj, 'HH:mm', { locale: fr });

  const isAdmin = cancelledBy === 'ADMIN';

  return (
    <Html>
      <Head />
      <Preview>Annulation de votre rendez-vous WADA</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>WADA</Heading>
          <Text style={text}>Bonjour {appointment.clientName},</Text>
          
          {isAdmin ? (
            <Text style={text}>
              Nous vous informons que votre séance de <strong>{service.name}</strong> prévue le <strong>{formattedDate} à {formattedTime}</strong> a malheureusement dû être annulée par la praticienne suite à un imprévu.
            </Text>
          ) : (
            <Text style={text}>
              Nous confirmons l'annulation de votre séance de <strong>{service.name}</strong> prévue le <strong>{formattedDate} à {formattedTime}</strong>, conformément à votre demande.
            </Text>
          )}

          {isAdmin && (
            <Section style={warningBox}>
              <Text style={warningText}>
                <strong>Information Paiement :</strong><br/>
                Si vous aviez opté pour le paiement intégral en ligne lors de votre réservation, <strong>le remboursement total a été déclenché automatiquement</strong> et apparaîtra sur votre compte d'ici quelques jours. Aucun frais n'est prélevé si vous aviez simplement laissé une empreinte bancaire.
              </Text>
            </Section>
          )}

          <Text style={text}>
            Nous espérons vous revoir très bientôt pour une nouvelle parenthèse de bien-être. Vous pouvez reprogrammer un rituel à tout moment directement sur notre site.
          </Text>

          <Text style={text}>À très bientôt,<br/><strong>Amira</strong></Text>
          <Hr style={hrFooter} />
          <Text style={footer}>Ceci est un e-mail automatique de WADA Cupping Therapy.</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#FAFAF7', fontFamily: 'Montserrat, sans-serif' };
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '600px' };
const h1 = { color: '#2C4035', fontSize: '32px', fontWeight: 'bold', textAlign: 'center' as const, letterSpacing: '8px', margin: '20px 0 40px' };
const text = { color: '#333333', fontSize: '15px', lineHeight: '24px', marginBottom: '16px' };
const warningBox = { backgroundColor: '#F3F4F6', padding: '20px', borderRadius: '12px', margin: '24px 0', borderLeft: '4px solid #D4AF37' };
const warningText = { color: '#4B5563', fontSize: '14px', lineHeight: '22px', margin: 0 };
const hrFooter = { borderColor: '#E5E5E0', margin: '40px 0 20px' };
const footer = { color: '#7A7A7A', fontSize: '11px', textAlign: 'center' as const };