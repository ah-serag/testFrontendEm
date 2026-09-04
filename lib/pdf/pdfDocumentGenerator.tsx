import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { toast } from 'sonner';

// تسجيل الخط العربي
Font.register({
  family: 'Tajawal',
  fonts: [
    { src: `${typeof window !== 'undefined' ? window.location.origin : ''}/fonts/Tajawal-Regular.ttf`, fontWeight: 'normal' },
    { src: `${typeof window !== 'undefined' ? window.location.origin : ''}/fonts/Tajawal-Bold.ttf`, fontWeight: 'bold' },
  ],
});

const COLORS = {
  primary: '#173E54',
  orange: '#E8702A',
  text: '#1F2937',
  secondary: '#64748B',
  muted: '#94A3B8', // 🔴 تم إضافة اللون المفقود هنا
  border: '#D9E1E7',
  light: '#F7F9FA',
  white: '#FFFFFF',
  success: '#15803D',
};

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 65, paddingHorizontal: 35, backgroundColor: COLORS.white, fontFamily: 'Tajawal', color: COLORS.text },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 7, flexDirection: 'row' },
  topBarBlue: { flex: 1, backgroundColor: COLORS.primary },
  topBarOrange: { width: 105, backgroundColor: COLORS.orange },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 7, flexDirection: 'row-reverse' },

  header: { height: 110, marginTop: 5, marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1.5, borderBottomColor: COLORS.primary, flexDirection: 'row-reverse', justifyContent: 'space-between' },
  companyBlock: { width: '45%', alignItems: 'flex-end' },
  logoWrapper: { marginBottom: 12, alignItems: 'center', alignSelf: 'flex-end' },
  logoEnglishRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoEM: { fontSize: 30, lineHeight: 1, fontWeight: 'bold', color: COLORS.orange },
  logoPAPY: { fontSize: 30, lineHeight: 1, fontWeight: 'bold', color: COLORS.primary },
  logoArabic: { fontSize: 20, lineHeight: 1, fontWeight: 'bold', color: COLORS.orange, marginTop: 3, letterSpacing: 1 },
  companyInfo: { marginTop: 4, fontSize: 7.5, color: COLORS.secondary, textAlign: 'right' },

  invoiceMetaBlock: { width: '45%', alignItems: 'flex-end', justifyContent: 'center' },
  docTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, textAlign: 'right', marginBottom: 10, paddingBottom: 4, borderBottomWidth: 2, borderBottomColor: COLORS.orange },
  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 3 },
  metaLabel: { width: 60, fontSize: 8.5, color: COLORS.secondary, textAlign: 'right' },
  metaValue: { flex: 1, fontSize: 9, fontWeight: 'bold', color: COLORS.text, textAlign: 'right' },

  customerBox: { padding: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, backgroundColor: COLORS.light, marginBottom: 15 },
  customerTitle: { fontSize: 10, fontWeight: 'bold', color: COLORS.primary, textAlign: 'right', marginBottom: 6 },
  customerRow: { flexDirection: 'row-reverse', marginBottom: 2 },
  customerLabel: { width: 70, fontSize: 8.5, color: COLORS.secondary, textAlign: 'right' },
  customerValue: { flex: 1, fontSize: 9, fontWeight: 'bold', textAlign: 'right' },

  table: { width: '100%', borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, overflow: 'hidden', marginBottom: 15 },
  tableHeader: { flexDirection: 'row-reverse', alignItems: 'center', minHeight: 30, backgroundColor: COLORS.primary },
  tableRow: { flexDirection: 'row-reverse', alignItems: 'center', minHeight: 35, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 6 },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  
  colNo: { width: '8%', textAlign: 'center' },
  colDesc: { width: '47%', textAlign: 'right', paddingRight: 8 },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'center' },
  colTotal: { width: '15%', textAlign: 'center', fontWeight: 'bold' },

  thText: { fontSize: 8.5, fontWeight: 'bold', color: COLORS.white },
  tdText: { fontSize: 8.5, color: COLORS.text, fontWeight: 'normal' },

  summaryBox: { width: '45%', alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, overflow: 'hidden', marginBottom: 25 },
  summaryRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', padding: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryLabel: { fontSize: 9, color: COLORS.secondary },
  summaryValue: { fontSize: 9, fontWeight: 'bold' },
  totalRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', padding: 10, backgroundColor: COLORS.primary },
  totalLabel: { fontSize: 11, fontWeight: 'bold', color: COLORS.white },
  totalValue: { fontSize: 12, fontWeight: 'bold', color: COLORS.white },

  signaturesSection: { flexDirection: 'row-reverse', justifyContent: 'space-around', marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: COLORS.border },
  signatureBox: { alignItems: 'center', width: '40%' },
  signatureLabel: { fontSize: 9, color: COLORS.secondary, marginBottom: 5 },
  signatureName: { fontSize: 11, fontWeight: 'bold', color: COLORS.primary },

  footer: { position: 'absolute', left: 35, right: 35, bottom: 20, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.orange, alignItems: 'center' },
  footerCompany: { fontSize: 8.5, fontWeight: 'bold', color: COLORS.primary, marginBottom: 2 },
  footerContact: { fontSize: 7, color: COLORS.secondary },
  pageNumber: { position: 'absolute', left: 35, bottom: 10, fontSize: 6.5, color: COLORS.muted },
});

const formatMoney = (val: number) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DocumentTemplate = ({ data }: { data: any }) => (
  <Document title={`${data.docType === 'invoice' ? 'فاتورة' : 'عرض_سعر'}_${data.customerName}`}>
    <Page size="A4" style={styles.page}>
      <View style={styles.topBar} fixed><View style={styles.topBarBlue} /><View style={styles.topBarOrange} /></View>
      <View style={styles.bottomBar} fixed><View style={styles.topBarOrange} /><View style={styles.topBarBlue} /></View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.companyBlock}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoEnglishRow}><Text style={styles.logoEM}>EM</Text><Text style={styles.logoPAPY}>PAPY</Text></View>
            <Text style={styles.logoArabic}>إمبـابـي</Text>
          </View>
          <Text style={styles.companyInfo}>محمد إمبابي - لإدارة التبريد والتكييف</Text>
          <Text style={styles.companyInfo}>دمياط - مصر | 01021217797</Text>
        </View>

        <View style={styles.invoiceMetaBlock}>
          <Text style={styles.docTitle}>{data.docType === 'invoice' ? 'فاتورة مبيعات / خدمات' : 'عرض سعر (Quotation)'}</Text>
          <View style={styles.metaRow}><Text style={styles.metaLabel}>رقم المستند:</Text><Text style={styles.metaValue}>{data.docNumber}</Text></View>
          <View style={styles.metaRow}><Text style={styles.metaLabel}>التاريخ:</Text><Text style={styles.metaValue}>{data.date}</Text></View>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.customerBox}>
        <Text style={styles.customerTitle}>بيانات العميل (السادة المحترمين)</Text>
        <View style={styles.customerRow}><Text style={styles.customerLabel}>الاسم / الشركة:</Text><Text style={styles.customerValue}>{data.customerName || '________________'}</Text></View>
        <View style={styles.customerRow}><Text style={styles.customerLabel}>رقم التواصل:</Text><Text style={styles.customerValue}>{data.customerPhone || '________________'}</Text></View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader} fixed>
          <Text style={[styles.thText, styles.colNo]}>م</Text>
          <Text style={[styles.thText, styles.colDesc]}>البيان / الوصف</Text>
          <Text style={[styles.thText, styles.colQty]}>الكمية</Text>
          <Text style={[styles.thText, styles.colPrice]}>سعر الوحدة</Text>
          <Text style={[styles.thText, styles.colTotal]}>الإجمالي</Text>
        </View>
        {data.items.map((item: any, i: number) => (
          // 🔴 تم حل المشكلة هنا باستخدام المعامل الثلاثي بدلاً من المعامل المنطقي &&
          <View key={i} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowAlt : {}]} wrap={false}>
            <Text style={[styles.tdText, styles.colNo]}>{i + 1}</Text>
            <Text style={[styles.tdText, styles.colDesc]}>{item.description}</Text>
            <Text style={[styles.tdText, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.tdText, styles.colPrice]}>{formatMoney(item.price)}</Text>
            <Text style={[styles.tdText, styles.colTotal, { color: COLORS.primary }]}>{formatMoney(item.total)}</Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryBox} wrap={false}>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>الإجمالي قبل الخصم</Text><Text style={styles.summaryValue}>{formatMoney(data.subTotal)} ج.م</Text></View>
        {data.discount > 0 && (
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>الخصم</Text><Text style={[styles.summaryValue, { color: COLORS.orange }]}>- {formatMoney(data.discount)} ج.م</Text></View>
        )}
        <View style={styles.totalRow}><Text style={styles.totalLabel}>الصافي المستحق</Text><Text style={styles.totalValue}>{formatMoney(data.netTotal)} ج.م</Text></View>
      </View>

      {/* Signatures */}
      <View style={styles.signaturesSection} wrap={false}>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureLabel}>صادر عن:</Text>
          <Text style={styles.signatureName}>شركة إمبـابـي للتبريد والتكييف</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureLabel}>المسئول:</Text>
          <Text style={styles.signatureName}>م/ محمد إمبابي</Text>
        </View>
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerCompany}>MOHAMMED EMBABY ELECTROMECHANICAL</Text>
        <Text style={styles.footerContact}>Damietta  |  (+2) 01021217797</Text>
      </View>
      <Text style={styles.pageNumber} fixed render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </Page>
  </Document>
);

export const generateCustomDocumentPDF = async (data: any) => {
  try {
    const blob = await pdf(<DocumentTemplate data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.docType === 'invoice' ? 'Invoice' : 'Quotation'}_${data.customerName || 'Doc'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("تم إنشاء المستند وتحميله بنجاح");
  } catch (error) {
    console.error("PDF_ERROR:", error);
    toast.error("حدث خطأ أثناء توليد الـ PDF");
  }
};