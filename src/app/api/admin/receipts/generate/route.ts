import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { decrypt } from '@/lib/crypto';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { Resend } from 'resend';
import archiver from 'archiver';

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

const ORG_NAME = process.env.ORG_NAME || '에코행복연구소 자유후원';
const ORG_UNIQUE_NUMBER = process.env.ORG_UNIQUE_NUMBER || '';

async function generateReceiptPDF(donation: {
  id: string;
  name: string;
  amount: number;
  resident_number_encrypted: string | null;
  created_at: string;
  lecture_title: string;
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 750;

  const drawText = (text: string, x: number, size = 12, bold = false) => {
    const f = bold ? fontBold : font;
    page.drawText(text, { x, y, size, font: f });
    y -= size + 4;
  };

  drawText('기 부 금 영 수 증', 220, 24, true);
  y -= 20;

  drawText(`단체명: ${ORG_NAME}`, 50, 12);
  if (ORG_UNIQUE_NUMBER) drawText(`고유번호: ${ORG_UNIQUE_NUMBER}`, 50, 12);
  drawText(`발급일: ${new Date().toLocaleDateString('ko-KR')}`, 50, 12);
  y -= 20;

  drawText('기부자 정보', 50, 14, true);
  drawText(`성명: ${donation.name}`, 50, 12);
  if (donation.resident_number_encrypted) {
    try {
      const rn = decrypt(donation.resident_number_encrypted);
      drawText(`주민번호: ${rn}*******`, 50, 12);
    } catch {
      drawText('주민번호: (암호화됨)', 50, 12);
    }
  }
  drawText(`기부금액: ${donation.amount.toLocaleString()}원`, 50, 12);
  drawText(`기부일자: ${new Date(donation.created_at).toLocaleDateString('ko-KR')}`, 50, 12);
  drawText(`적요: ${donation.lecture_title}`, 50, 12);
  y -= 20;

  drawText('위 기부금을 영수증합니다.', 50, 12);
  y -= 40;
  drawText(`${ORG_NAME}`, 400, 12);
  drawText('대표자 (인)', 400, 10);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get('ids');
  const sendEmail = searchParams.get('email') === 'true';
  const asZip = searchParams.get('zip') === '1';

  if (!idsParam) {
    return NextResponse.json({ error: 'ids required' }, { status: 400 });
  }

  const ids = idsParam.split(',').filter(Boolean);
  const supabase = getSupabase();
  const { data: donations, error } = await supabase
    .from('donations')
    .select('id, name, amount, email, resident_number_encrypted, created_at, lecture_title')
    .in('id', ids)
    .eq('status', 'completed')
    .eq('receipt_required', true);

  if (error || !donations || donations.length === 0) {
    return NextResponse.json({ error: 'No donations found' }, { status: 404 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  if (asZip && donations.length > 1) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    archive.on('data', (chunk) => chunks.push(chunk as Buffer));

    const zipPromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
    });

    for (const d of donations) {
      const pdfBuffer = await generateReceiptPDF(d);
      const safeName = d.name.replace(/[^a-zA-Z0-9가-힣]/g, '_');
      archive.append(pdfBuffer, { name: `receipt_${safeName}_${d.id.slice(0, 8)}.pdf` });
    }

    archive.finalize();
    const zipBuffer = await zipPromise;

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="receipts.zip"`,
      },
    });
  }

  const donation = donations[0];
  const pdfBuffer = await generateReceiptPDF(donation);

  if (sendEmail && donation.email && resend) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'donation@resend.dev',
        to: donation.email,
        subject: `[에코행복연구소 자유후원] 영수증`,
        attachments: [
          {
            filename: `receipt_${donation.name}.pdf`,
            content: pdfBuffer,
          },
        ],
        html: `<p>${donation.name}님, 기부금 영수증을 첨부합니다.</p>`,
      });
    } catch (e) {
      console.error('Email send error:', e);
    }
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt_${donation.name}.pdf"`,
    },
  });
}
