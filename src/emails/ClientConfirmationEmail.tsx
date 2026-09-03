import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EmailProps {
  appointment: any;
  service: any;
}

export default function ClientConfirmationEmail({ appointment, service }: EmailProps) {
  const formattedDate = format(new Date(appointment.startsAt), 'EEEE d MMMM yyyy', { locale: fr });
  const formattedTime = format(new Date(appointment.startsAt), 'HH:mm', { locale: fr });

  return (
    <Html>
      <Head />
      <Preview>Votre séance de Cupping Therapy est confirmée pour le {formattedDate}.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Cupping Therapy</Heading>
          <Text style={text}>Bonjour {appointment.clientName},</Text>
          <Text style={text}>Votre réservation a bien été confirmée. Je me déplacerai à votre domicile à l'adresse indiquée pour votre séance.</Text>
          
          <Section style={card}>
            <Text style={cardTitle}>Récapitulatif de votre séance</Text>
            <Hr style={hr} />
            <Text style={cardText}><strong>Prestation :</strong> {service.name}</Text>
            <Text style={cardText}><strong>Date :</strong> {formattedDate} à {formattedTime}</Text>
            <Text style={cardText}><strong>Lieu :</strong> {appointment.clientAddress}</Text>
          </Section>

          {/* LA RÈGLE D'ANNULATION CLAIREMENT ÉCRITE */}
          <Section style={warningCard}>
            <Text style={warningText}>
              <strong>Politique d'annulation :</strong> En cas d'imprévu, vous pouvez annuler ou reporter votre séance sans frais jusqu'à 24h avant. <strong>Toute annulation à moins de 24h du rendez-vous entraînera automatiquement un prélèvement de 20%</strong> du montant du soin via votre empreinte bancaire.
            </Text>
          </Section>

          <Text style={text}>
            <strong>Avant la séance :</strong><br/>
            Il est recommandé d'avoir pris un repas léger 2h à 3h avant et de préparer un espace calme.
          </Text>
          <Text style={text}>À très bientôt,<br/><strong>Amira</strong></Text>
          <Hr style={hrFooter} />
          <Text style={footer}>Ceci est un email automatique. Pour annuler votre rendez-vous, connectez-vous à votre Espace Client.</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#FAFAF7', fontFamily: 'Montserrat, sans-serif' };
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '600px' };
const h1 = { color: '#2C4035', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' as const, margin: '30px 0' };
const text = { color: '#333333', fontSize: '16px', lineHeight: '24px' };
const card = { backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', margin: '20px 0', border: '1px solid #E5E5E0' };
const cardTitle = { color: '#D4AF37', fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px' };
const cardText = { color: '#333333', fontSize: '16px', margin: '8px 0' };
const warningCard = { backgroundColor: '#FFF5F5', padding: '16px', borderRadius: '8px', margin: '20px 0', border: '1px solid #FCA5A5' };
const warningText = { color: '#991B1B', fontSize: '14px', lineHeight: '20px', margin: 0 };
const hr = { borderColor: '#E5E5E0', margin: '16px 0' };
const hrFooter = { borderColor: '#E5E5E0', margin: '40px 0 20px' };
const footer = { color: '#7A7A7A', fontSize: '12px', textAlign: 'center' as const };