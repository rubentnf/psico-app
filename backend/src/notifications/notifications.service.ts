import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    private readonly resend: Resend;
    private readonly fromAddress = 'Psico App <onboarding@resend.dev>';

    constructor(private readonly config: ConfigService) {
        this.resend = new Resend(this.config.get('RESEND_API_KEY'));
    }

    async sendBookingConfirmation(params: {
        to: string,
        patientName: string;
        sessionTypeName: string;
        startAt: Date;
        price: string;
    }): Promise<void> {
        const formattedDate = params.startAt.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
        });

        try {
            await this.resend.emails.send({
                from: this.fromAddress,
                to: params.to,
                subject: 'Confirmación de tu cita',
                html: `
                <h2>Hola ${params.patientName},</h2>
                <p>Tu cita ha sido confirmada:</p>
                <ul>
                    <li><strong>Tipo de sesión:</strong> ${params.sessionTypeName}</li>
                    <li><strong>Fecha:</strong> ${formattedDate}</li>
                    <li><strong>Precio:</strong> ${params.price} €</li>
                </ul>
                <p>Recuerda que puedes cancelar hasta 24 horas antes sin coste.  Cancelaciones con menos antelación tienen una penalización del 50%.</p>
                `,
            });
        } catch (error) {
            this.logger.error('Error al enviar email de confirmación', error);
        }
    }

    async sendCancellationNotice(params: {
        to: string;
        patientName: string;
        sessionTypeName: string;
        startAt: Date;
        penaltyApplied: boolean;
    }): Promise<void> {
        const formattedDate = params.startAt.toLocaleString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
        });

        try {
            await this.resend.emails.send({
                from: this.fromAddress,
                to: params.to,
                subject: 'Cita cancelada',
                html: `
          <h2>Hola ${params.patientName},</h2>
          <p>Tu cita del ${formattedDate} (${params.sessionTypeName}) ha sido cancelada.</p>
          ${params.penaltyApplied
                        ? '<p><strong>Se ha aplicado una penalización del 50%</strong> por cancelar con menos de 24h de antelación.</p>'
                        : '<p>No se ha aplicado ningún cargo.</p>'
                    }
        `,
            });
        } catch (error) {
            this.logger.error('Error al enviar email de cancelación', error);
        }
    }
}
