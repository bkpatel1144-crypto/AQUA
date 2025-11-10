import React from 'react';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import logo from '../../public/lovable-uploads/logo.png';
import stamplogo from '../../public/lovable-uploads/logowithsign.png';

interface InvoicePreviewProps {
  invoice: Invoice;
}

/* ------------------------------------------------------------------ */
/*  Helper – calculate due date from terms string                     */
/* ------------------------------------------------------------------ */
const calculateDueDate = (invoiceDate: string, terms: string): string | null => {
  if (!terms || terms.toUpperCase() === 'COD') return null;

  // Look for a number followed by "day(s)"
  const match = terms.match(/(\d+)\s*day/i);
  if (match) {
    const days = Number(match[1]);
    const base = new Date(invoiceDate);
    const due = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    return due.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');
  }

  // If we cannot parse a number, just return the invoice date as fallback
  return new Date(invoiceDate)
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '-');
};

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    try {
      const element = document.querySelector('.invoice-content') as HTMLElement;
      if (!element) {
        console.error('Invoice content element not found');
        return;
      }

      const options = {
        margin: 0.3,
        filename: `Invoice-${invoice.invoiceNo}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: false,
          backgroundColor: '#ffffff',
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString)
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, '-');

  const dueDate = calculateDueDate(invoice.date, invoice.terms ?? '');

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* ----- Buttons (hidden on print) ----- */}
      <div className="mb-4 print:hidden flex gap-2">
        <Button onClick={handlePrint} className="bg-blue-700 hover:bg-blue-800 text-white">
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </Button>
        {/* <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button> */}
      </div>

      {/* ----- Invoice Content ----- */}
      <div
        className="invoice-content border border-gray-400"
        style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
      >
        {/* ==== Header ==== */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Aqua Diamonds Logo" style={{ height: '100px' }} />
          </div>
          <div className="text-right text-xs leading-relaxed">
            <p>UNIT M2B - 3, 7/F Kaiser Estate Phase 3</p>
            <p>11 Hok Yuen Street, Hunghom</p>
            <p>Kowloon, Hong Kong</p>
            <p className="mt-1">Tel No: +85227730368</p>
            <p>Fax No: +85227730386</p>
            <p>Email: info@aquahk.com</p>
          </div>
        </div>

        {/* ==== Dashed Divider ==== */}
        <div className="border-t border-dashed border-gray-600 mb-4" />

        {/* ==== Invoice Title ==== */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">INVOICE</h2>
        </div>

        {/* ==== TO + Invoice Info ==== */}
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm font-semibold mb-1">TO: {invoice.customerName}</p>
            <div className="text-xs leading-relaxed">
              <p>{invoice.customerAddress}</p>
              <p>{invoice.customerCity}</p>
              {invoice.customerPhone && <p>Tel: {invoice.customerPhone}</p>}
            </div>
          </div>

          {/* Invoice meta box */}
          <div className="border border-gray-400 p-2 min-w-[180px] text-xs">
            <div className="flex justify-between">
              <span className="font-semibold">Invoice No:</span>
              <span>{invoice.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Date:</span>
              <span>{formatDate(invoice.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Terms:</span>
              <span>{invoice.terms ?? ''}</span>
            </div>
            {/* Due Date – only when NOT COD */}
            {dueDate && (
              <div className="flex justify-between">
                <span className="font-semibold">Due Date:</span>
                <span>{dueDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* ==== Items Table ==== */}
        <table className="w-full border border-gray-400 text-xs mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-1 text-left">SR NO</th>
              <th className="border border-gray-400 p-1 text-left">STOCK ID</th>
              <th className="border border-gray-400 p-1 text-left">DESCRIPTION</th>
              <th className="border border-gray-400 p-1 text-center">WEIGHT</th>
              <th className="border border-gray-400 p-1 text-center">
                PRICE<br />
                <span className="text-xs">(USD / HKD)</span>
              </th>
              <th className="border border-gray-400 p-1 text-center">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-gray-400 p-1 text-center">{index + 1}</td>
                <td className="border border-gray-400 p-1">{item.stockId}</td>
                <td className="border border-gray-400 p-1">{item.description}</td>
                <td className="border border-gray-400 p-1 text-center">{item.weight}CT</td>
                <td className="border border-gray-400 p-1 text-center">{item.pricePerUnit}$</td>
                <td className="border border-gray-400 p-1 text-center">{item.total}$</td>
              </tr>
            ))}

            {/* Fill to 6 rows */}
            {Array.from({ length: Math.max(0, 0 - invoice.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-gray-400 p-1">&nbsp;</td>
                <td className="border border-gray-400 p-1">&nbsp;</td>
                <td className="border border-gray-400 p-1">&nbsp;</td>
                <td className="border border-gray-400 p-1">&nbsp;</td>
                <td className="border border-gray-400 p-1">&nbsp;</td>
                <td className="border border-gray-400 p-1">&nbsp;</td>
              </tr>
            ))}

            {/* Total row */}
            {invoice.shippingCharges > 0 && (
              <tr>
                <td colSpan={5} className="border border-gray-400 p-1 text-right font-bold">
                  <div className="text-right font-semibold">Shipping Charges</div>
                </td>
                <td className="border border-gray-400 p-1 text-center font-bold">{invoice.shippingCharges}$</td>
              </tr>
            )}
            {invoice.otherCharges > 0 && (
              <tr>
                <td colSpan={5} className="border border-gray-400 p-1 text-right font-bold">
                  <div className="text-right font-semibold">Sales Tax</div>
                </td>
                <td className="border border-gray-400 p-1 text-center font-bold">{invoice.otherCharges}$</td>
              </tr>
            )}
            <tr>
              <td colSpan={5} className="border border-gray-400 p-1 text-right font-bold">
                TOTAL
              </td>
              <td className="border border-gray-400 p-1 text-center font-bold">
                {invoice.totalAmount}$
              </td>
            </tr>
          </tbody>
        </table>

        {/* ==== Notes ==== */}
        <div className="text-xs mb-4">
          <ul className="list-disc pl-5 space-y-1">
            <li>All goods are sold & delivered in Hong Kong. Goods once sold are not returnable and refundable</li>
            <li>Aqua diamonds Ltd. reserves the right to have the final decision on all matters concerning the terms of the invoice</li>
          </ul>
        </div>

        {/* ==== Bank Details (side-by-side) ==== */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-xs" style={{ fontSize: '10px' }}>
          <div className="border border-gray-400 p-2">
            <p className="font-bold mb-1">BANK DETAILS,</p>
            <p>A/C NAME : AQUA DIAMONDS LTD</p>
            <p>BANK NAME: Fubon Bank (Hong Kong) Ltd</p>
            <p>US$ A/C NO : 128-862-022-09882</p>
            <p>HKS A/C NO : 128-862-011-33774</p>
            <p>SWIFT CODE : IBALHKHH</p>
          </div>
          <div className="border border-gray-400 p-2">
            <p className="font-bold mb-1">BANK DETAILS,</p>
            <p>A/C NAME : AQUA DIAMONDS LTD</p>
            <p>BANK NAME: Bank of China (Hong Kong) Ltd</p>
            <p>US$ A/C NO : 012-862-2-009086-8</p>
            <p>HKS A/C NO : 012-662-0-009086-7</p>
            <p>SWIFT CODE : BKCHHKHHXXX</p>
          </div>
        </div>

        {/* ==== Signatures ==== */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="border-t border-gray-400 w-40 mt-6" />
            <p className="text-xs mt-1">Chop & signature.</p>
          </div>
          <div className="text-center">
            <img 
              src={stamplogo} 
              alt="Aqua Jewels Stamp" 
              className=" mx-auto"
              style={{ height: '100px' }}
            />
            <div className="border-t border-gray-400 w-40 mx-auto" />
            <p className="text-xs mt-1">Chop & Authorized Signature</p>
          </div>
        </div>

        {/* ==== E. & O. E. ==== */}
        <div className="text-xs leading-tight space-y-1 border-t border-gray-400 pt-2" style={{ fontSize: '7px' }}>
          <p>
            E. & O. E. For any polished diamonds fabricated from rough diamonds mined from January 1, 2003 onward, the seller warrants that diamonds have been purchased from legitimate sources not involved in funding conflict and in compliance with United Nations Resolutions. The seller hereby guarantees that these diamonds are conflict free, based on personal knowledge and/or written guarantees provided by the supplier of these diamonds. For any polished diamonds fabricated from rough diamonds mined prior to January 1, 2003, the seller warrants that conflict diamonds will not be knowingly sold and that, to the best of his ability, the seller will undertake reasonable measures to help prevent the sales of conflict diamonds in this country.
          </p>
          <p>
            The ownership of the goods will not pass to the purchaser and will remain with the company until payment in full of the purchase price of the goods (including sales tax therefor) owing to the company by the purchaser. Before the ownership passes to the purchaser the following conditions apply: -
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>The purchaser holds the goods as fiduciary Bailee and agent for the company.</li>
            <li>The purchaser must return the goods immediately upon demand of the company.</li>
            <li>If the purchaser fails to return the goods when demanded the company is entitled to go onto any premises occupied by the purchaser and to do all things necessary in order to take possession of the goods. The purchaser shall be liable for all the costs of whatsoever nature of and associated with the exercise of the company's rights under this clause, which shall be payable on demand.</li>
            <li>The goods shall be stored separately and, in a manner, to enable them to be identified and cross referenced to particular invoices.</li>
            <li>Risk in the goods shall pass at the time of delivery and the purchaser shall insure (and keep insured) the goods.</li>
            <li>Unless otherwise notified in writing the purchaser is entitled to sell the goods in the ordinary course of business. The purchaser shall be the company's agent and must hold the proceeds in a separate account on trust for the company and should not mix the proceeds with any other money, including funds of the purchaser.</li>
            <li>A breach of any of the above conditions on the part of the purchaser shall also be construed as a breach of trust.</li>
          </ol>
          <p>This contract is governed by the laws of Hong Kong.</p>
        </div>

        {/* ==== Thank You ==== */}
        <div className="text-center mt-4">
          <p className="font-bold text-sm">THANK YOU FOR YOUR BUSINESS</p>
        </div>
      </div>

      {/* ==== Print Styles ==== */}
      <style>{`
        @media print {
          .invoice-content {
            border: none !important;
            padding: 20px !important;
            margin: 0 !important;
          }
          body * { visibility: hidden; }
          .invoice-content, .invoice-content * { visibility: visible; }
          .invoice-content { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 0.3in; size: A4; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};
