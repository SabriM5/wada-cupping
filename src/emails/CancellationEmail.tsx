import * as React from 'react';

export default function CancellationEmail({ appointment, service, cancelledBy }: any) {
  return <div>Le rendez-vous a été annulé par {cancelledBy}.</div>;
}