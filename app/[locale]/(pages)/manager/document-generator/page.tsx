"use client";

import React, { useState } from "react";
import { 
  Plus, Trash2, FileText, FileSignature, 
  User, Phone, CalendarDays, Hash, ReceiptText, LayoutList 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// تأكد من مسار دالة إنشاء الـ PDF
import { generateCustomDocumentPDF } from "@/lib/pdf/pdfDocumentGenerator"; 

export default function DocumentGeneratorPage() {
  const [docType, setDocType] = useState<"invoice" | "quotation">("quotation"); 
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [docNumber, setDocNumber] = useState(`DOC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [discount, setDiscount] = useState<number | "">("");

  const [items, setItems] = useState([
    { id: 1, description: "", quantity: 1, price: 0 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), description: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (id: number) => {
    if (items.length === 1) return toast.error("يجب أن يحتوي المستند على صنف واحد على الأقل");
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subTotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
  const netTotal = subTotal - Number(discount || 0);

  const handleGenerate = () => {
    if (!customerName) return toast.error("يرجى إدخال اسم العميل أو الشركة");
    if (items.some(i => !i.description || Number(i.price) <= 0)) {
      return toast.error("يرجى استكمال بيانات الأصناف (البيان والسعر)");
    }

    const documentData = {
      docType,
      customerName,
      customerPhone,
      docNumber,
      date: new Date(docDate).toLocaleDateString('ar-EG'),
      items: items.map(i => ({
        description: i.description,
        quantity: Number(i.quantity),
        price: Number(i.price),
        total: Number(i.quantity) * Number(i.price)
      })),
      subTotal,
      discount: Number(discount || 0),
      netTotal
    };

    generateCustomDocumentPDF(documentData);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 md:p-6" dir="rtl">
      
      <div className="max-w-9xl mx-auto space-y-6 pb-20">
        
        {/* ===================== 1. Header (رأس الصفحة) ===================== */}
        <div className="bg-primary rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 shrink-0 bg-white rounded-2xl flex items-center justify-center text-primary border border-primary/20">
            <FileSignature className="w-7 h-7" />
          </div>
          <div className="flex flex-col text-right">
            <h1 className="text-2xl font-normal text-slate-200">إصدار مستند مالي</h1>
            <p className="text-slate-200 mt-1 text-sm font-medium">عروض أسعار وفواتير مُنسقة جاهزة للطباعة (PDF).</p>
          </div>
        </div>

        {/* ===================== 2. نوع المستند ===================== */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/60 shadow-sm">
          <Label className="text-sm font-extrabold text-primary mb-4 block">1. حدد نوع المستند المراد إصداره:</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setDocType("quotation")}
              className={`flex items-center justify-center gap-2 py-4 rounded-xl border text-base font-bold transition-all ${
                docType === "quotation" 
                  ? "bg-primary/5 border-primary text-primary shadow-sm ring-1 ring-primary/20" 
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <LayoutList className="w-5 h-5" /> عرض سعر (Quotation)
            </button>
            
            <button
              type="button"
              onClick={() => setDocType("invoice")}
              className={`flex items-center justify-center gap-2 py-4 rounded-xl border text-base font-bold transition-all ${
                docType === "invoice" 
                  ? "bg-primary/5 border-primary text-primary shadow-sm ring-1 ring-primary/20" 
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <ReceiptText className="w-5 h-5" /> فاتورة مبيعات (Invoice)
            </button>
          </div>
        </div>

        {/* ===================== 3. بيانات العميل ===================== */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/60 shadow-sm">
          <Label className="text-sm font-extrabold text-primary mb-5 block">2. بيانات العميل والتاريخ:</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><User className="w-4 h-4"/> العميل / الشركة</Label>
              <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="اسم العميل..." className="h-12 text-sm rounded-xl bg-slate-50 focus-visible:ring-primary/20" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><Phone className="w-4 h-4"/> هاتف العميل</Label>
              <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="010..." className="h-12 text-sm rounded-xl bg-slate-50 focus-visible:ring-primary/20" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><Hash className="w-4 h-4"/> الرقم المرجعي</Label>
              <Input value={docNumber} onChange={e => setDocNumber(e.target.value)} className="h-12 text-sm rounded-xl bg-slate-50 font-mono text-left focus-visible:ring-primary/20" dir="ltr" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><CalendarDays className="w-4 h-4"/> التاريخ</Label>
              <Input type="date" value={docDate} onChange={e => setDocDate(e.target.value)} className="h-12 text-sm rounded-xl bg-slate-50 focus-visible:ring-primary/20" />
            </div>
          </div>
        </div>

        {/* ===================== 4. الأصناف ===================== */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/60 shadow-sm">
          <Label className="text-sm font-extrabold text-primary mb-5 block">3. الأصناف والخدمات المقدمة:</Label>
          
          <div className="space-y-4 mb-6">
            {items.map((item, index) => (
              // تصميم الصنف: يعرض كـ Column في الموبايل، وكـ Row منتظم في الكمبيوتر
              <div key={item.id} className="relative flex flex-col md:flex-row items-start md:items-end gap-4 p-5 bg-slate-50/80 rounded-xl border border-slate-200/80 transition-all hover:border-primary/30">
                
                {/* زر الحذف في الموبايل (مطلق بالأعلى) */}
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute top-4 left-4 md:hidden w-8 h-8 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* رقم الصنف (اختياري للزينة) */}
                <div className="hidden md:flex flex-col space-y-2 w-6 pb-3 justify-end items-center">
                  <span className="font-extrabold text-slate-400 text-sm">{index + 1}</span>
                </div>

                <div className="w-full md:flex-1 space-y-2">
                  <Label className="text-xs font-bold text-slate-600">البيان / الوصف</Label>
                  <Input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="اكتب وصف الخدمة..." className="h-12 text-sm rounded-xl bg-white focus-visible:ring-primary/20" />
                </div>
                
                <div className="w-full md:w-28 space-y-2">
                  <Label className="text-xs font-bold text-slate-600">الكمية</Label>
                  <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} className="h-12 text-sm rounded-xl bg-white text-center font-mono focus-visible:ring-primary/20" />
                </div>
                
                <div className="w-full md:w-36 space-y-2">
                  <Label className="text-xs font-bold text-slate-600">السعر</Label>
                  <Input type="number" min="0" value={item.price} onChange={e => updateItem(item.id, 'price', e.target.value)} className="h-12 text-sm rounded-xl bg-white text-center font-mono focus-visible:ring-primary/20" />
                </div>
                
                <div className="w-full md:w-36 space-y-2">
                  <Label className="text-xs font-bold text-slate-600">الإجمالي</Label>
                  <div className="h-12 bg-white flex items-center justify-center rounded-xl border border-slate-200 font-extrabold text-primary text-sm font-mono shadow-sm">
                    {(Number(item.quantity) * Number(item.price)).toLocaleString()} ج.م
                  </div>
                </div>

                {/* زر الحذف في الكمبيوتر (يظهر بجوار الإجمالي) */}
                <Button 
                  variant="ghost" 
                  onClick={() => handleRemoveItem(item.id)} 
                  className="hidden md:flex w-12 h-12 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>

              </div>
            ))}
          </div>

          <Button 
            onClick={handleAddItem} 
            variant="outline" 
            className="w-full h-12 border-dashed border-2 border-slate-300 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 rounded-xl text-sm font-bold transition-all"
          >
            <Plus className="w-5 h-5 ml-2" /> أضف صنف أو خدمة جديدة
          </Button>
        </div>

        {/* ===================== 5. الماليات والطباعة ===================== */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/60 shadow-md">
          <Label className="text-sm font-extrabold text-primary mb-6 block">4. مراجعة الإجماليات والطباعة:</Label>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* إدخال الخصم */}
            <div className="w-full md:w-1/2 space-y-3">
              <Label className="text-sm font-bold text-slate-700">قيمة الخصم (إن وجد)</Label>
              <Input 
                type="number" min="0" value={discount} 
                onChange={e => setDiscount(e.target.value === "" ? "" : Number(e.target.value))} 
                placeholder="0.00" 
                className="h-12 text-base rounded-xl bg-slate-50 font-mono text-left focus-visible:ring-primary/20" 
                dir="ltr"
              />
              <p className="text-xs text-slate-400 text-right">أدخل قيمة الخصم ليتم طرحها من الإجمالي.</p>
            </div>

            {/* الإجماليات وزر الطباعة */}
            <div className="w-full md:w-1/2 flex flex-col gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-600">الإجمالي قبل الخصم</span>
                <span className="font-extrabold font-mono text-slate-800">{subTotal.toLocaleString()} ج.م</span>
              </div>
              
              {Number(discount) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-rose-500">قيمة الخصم</span>
                  <span className="font-extrabold font-mono text-rose-600">- {Number(discount).toLocaleString()} ج.م</span>
                </div>
              )}
              
              <div className="bg-primary rounded-xl p-4 mt-2 shadow-inner border border-primary/20">
                <span className="block text-white/80 text-xs font-bold mb-1">الصافي النهائي للمستند</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold font-mono text-3xl text-white">{netTotal.toLocaleString()}</span>
                  <span className="text-sm font-bold text-white/70">ج.م</span>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full h-14 mt-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-base shadow-lg transition-all active:scale-[0.98]"
              >
                <FileText className="w-5 h-5 ml-2" />
                إنشاء وطباعة הـ PDF
              </Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}