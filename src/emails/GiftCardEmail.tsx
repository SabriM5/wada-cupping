import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as React from 'react';

interface GiftCardEmailProps {
  code: string;
  serviceName: string;
  recipientName: string;
  message?: string;
  expiresAt: Date;
}

export default function GiftCardEmail({ code, serviceName, recipientName, message, expiresAt }: GiftCardEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre bon cadeau WADA Cupping Therapy est prêt !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>WADA</Heading>
          <Text style={text}>Bonjour,</Text>
          <Text style={text}>Nous vous remercions pour votre achat. Voici le bon cadeau à transmettre à <strong>{recipientName}</strong> de votre part.</Text>
          
          {/* LA CARTE CADEAU VISUELLE */}
          <Section style={card}>
            <Text style={cardSubtitle}>BON CADEAU VALABLE POUR UN</Text>
            <Text style={cardTitle}>{serviceName}</Text>
            <Hr style={hrGold} />
            
            <Text style={codeLabel}>CODE À UTILISER LORS DE LA RÉSERVATION</Text>
            <Text style={codeBox}>{code}</Text>
            
            {message && (
              <Text style={messageBox}>
                "{message}"
              </Text>
            )}
            
            <Text style={cardFooter}>
              Valable jusqu'au {format(new Date(expiresAt), 'd MMMM yyyy', { locale: fr })}.
            </Text>
          </Section>

          <Text style={text}>
            <strong>Comment l'utiliser ?</strong><br/>
            Le bénéficiaire devra simplement se rendre sur notre site, choisir son créneau, et entrer ce code dans la case "Code Promo". L'étape de paiement sera automatiquement masquée.
          </Text>
          
          <Text style={text}>À très bientôt,<br/><strong>Amira</strong></Text>
          <Hr style={hrFooter} />
          <Text style={footer}>Cet e-mail contient des informations confidentielles. Ne partagez ce code qu'avec le bénéficiaire du soin.</Text>
        </Container>
      </Body>
    </Html>
  );
}

// --- STYLES PREMIUM ---
const main = { backgroundColor: '#FAFAF7', fontFamily: 'Montserrat, sans-serif' };
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '600px' };
const h1 = { color: '#2C4035', fontSize: '32px', fontWeight: 'bold', textAlign: 'center' as const, letterSpacing: '8px', margin: '20px 0 40px' };
const text = { color: '#333333', fontSize: '15px', lineHeight: '24px' };

const card = { backgroundColor: '#2C4035', padding: '40px', borderRadius: '24px', margin: '30px 0', textAlign: 'center' as const };
const cardSubtitle = { color: '#D4AF37', fontSize: '12px', fontWeight: 'bold', letterSpacing: '3px', margin: '0 0 10px' };
const cardTitle = { color: '#FAFAF7', fontSize: '24px', fontWeight: 'bold', margin: '0 0 24px' };
const hrGold = { borderColor: '#D4AF37', opacity: 0.3, margin: '24px 0' };

const codeLabel = { color: '#FAFAF7', opacity: 0.7, fontSize: '10px', letterSpacing: '2px', margin: '0 0 8px' };
const codeBox = { color: '#2C4035', backgroundColor: '#D4AF37', fontSize: '28px', fontWeight: 'bold', letterSpacing: '6px', padding: '16px', borderRadius: '12px', margin: '0 auto 24px', display: 'inline-block' };

const messageBox = { color: '#FAFAF7', fontStyle: 'italic', fontSize: '16px', margin: '0 0 24px', opacity: 0.9 };
const cardFooter = { color: '#FAFAF7', opacity: 0.5, fontSize: '12px', margin: '0' };

const hrFooter = { borderColor: '#E5E5E0', margin: '40px 0 20px' };
const footer = { color: '#7A7A7A', fontSize: '11px', textAlign: 'center' as const };