import * as React from 'react';

export default function AdminNotificationEmail({ appointment, service }: any) {
  return <div>Nouveau rendez-vous pris pour la prestation : {service?.name}</div>;
}