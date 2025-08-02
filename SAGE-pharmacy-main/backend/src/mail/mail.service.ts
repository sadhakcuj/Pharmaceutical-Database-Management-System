import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ServiceUnavailableException,
  Injectable,
} from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private orderService: OrderService,
    private prisma: PrismaService,
  ) {}

  private sendMail(options: Omit<ISendMailOptions, 'from'>) {
    return this.mailerService.sendMail(options);
  }

  async sendOrderBill(providerName: string, mail: string, subject?: string) {
    const { email } = await this.prisma.provider.findUnique({
      where: {
        name: providerName,
      },
      select: {
        email: true,
      },
    });

    if (!email) {
      throw new BadRequestException(
        `Provider ${providerName} doesn't have an email adress`,
      );
    }

    // create bill file
    const billPath = await this.orderService.createBillFile(providerName);
    try {
      await this.sendMail({
        to: email,
        subject: subject ? subject : `Commande pour ${providerName}`,
        template: './order',
        context: {
          paragraphs: mail.split('\n').map((paragraph) => ({
            text: paragraph,
          })),
        },
        attachments: [
          {
            path: billPath,
            filename: 'facture.pdf',
          },
        ],
      });
    } catch (e) {
      console.error(e);
      throw new ServiceUnavailableException('Unable to send mail');
    }
  }
}
