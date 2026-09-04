"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react'; 
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { 
  Plus, Minus, X, Search, Trash2, Loader2, AlertCircle, 
  Camera, FileText, Package, Banknote, Wrench, Users, QrCode, Calculator, ImagePlus,
  Sigma, AlertTriangle, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import imageCompression from 'browser-image-compression';
import { 
  useGetActiveServicesListQuery, 
  useLazySearchActiveMembersQuery,
  useLazySearchMaterialsForExecutionQuery,
  useUpdateRejectedExecutionMutation
} from '@/redux/features/TeamApiSlice';
import { completeAssignmentSchema, CompleteAssignmentFormValues } from '@/lib/validation/completeAssignments';
import {
  Dialog,
  DialogContent,
  DialogTitle, 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

export interface Member { user_id: number; name: string; }
export interface Service { id: number; name_ar: string; base_price: string; }

interface EditRejectedExecutionFormProps {
  execution: any; 
  isOpen: boolean;
  onClose: () => void;
}

export default function EditRejectedExecutionModal({ execution, isOpen, onClose }: EditRejectedExecutionFormProps) {

  const { data: servicesResponse } = useGetActiveServicesListQuery(undefined);
  const [searchMemberTrigger, { data: searchResults, isFetching: isSearching }] = useLazySearchActiveMembersQuery();
  const [searchMaterialTrigger, { data: materialResults, isFetching: isSearchingMaterials }] = useLazySearchMaterialsForExecutionQuery();
  
  const [updateExecution, { isLoading: isSubmitting }] = useUpdateRejectedExecutionMutation();

  const servicesList: Service[] = servicesResponse?.data || [];
  const activeSearchResults: Member[] = searchResults?.data || [];
  const activeMaterialResults: any[] = materialResults?.data || [];

  const initialMembers = execution?.execution_members?.map((m: any) => ({ user_id: m.member_id, name: m.name })) || [];
  const initialServices = execution?.services?.length > 0 
    ? execution.services.map((s: any) => ({ service_id: String(s.service_id), quantity: s.quantity })) 
    : [{ service_id: "", quantity: 1 }];

  const initialMaterials = execution?.materials?.map((m: any) => ({
    id: m.material_id,
    name: m.name_ar,
    selectedQty: Number(m.quantity),
    current_price: m.unit_price,
    unit_cost: m.unit_cost,
    is_serialized: m.is_serialized || false,
    available_stock: 9999, 
    enteredSerials: m.serials_used || []
  })) || [];

  const { control, handleSubmit, setValue, getValues, reset, formState: { errors, isValid } } = useForm<CompleteAssignmentFormValues>({
    resolver: zodResolver(completeAssignmentSchema),
    mode: 'onChange',
    defaultValues: { members: [{ user_id: 0, name: "" }], services: [{ service_id: "", quantity: 1 }] }
  });

  useEffect(() => {
    if (isOpen && execution) {
      const initM = execution.execution_members?.map((m: any) => ({ user_id: m.member_id, name: m.name })) || [];
      const initS = execution.services?.length > 0 ? execution.services.map((s: any) => ({ service_id: String(s.service_id), quantity: s.quantity })) : [{ service_id: "", quantity: 1 }];
      reset({ members: initM, services: initS });
      
      const initMats = execution.materials?.map((m: any) => ({
        id: m.material_id, name: m.name_ar, selectedQty: Number(m.quantity), current_price: m.unit_price, unit_cost: m.unit_cost, is_serialized: m.is_serialized || false, available_stock: 9999, enteredSerials: m.serials_used || []
      })) || [];
      setSelectedMaterials(initMats);
      setTechNotes(execution.tech_notes || "");
      setExistingBeforePhotos(execution.photos?.filter((p: any) => p.stage === 'BEFORE') || []);
      setExistingAfterPhotos(execution.photos?.filter((p: any) => p.stage === 'AFTER') || []);
      setBeforePhotos([]); setAfterPhotos([]);
      const pMethod = execution.payment_method || 'NONE';
      const cAmount = Number(execution.collected_amount) > 0 ? String(Number(execution.collected_amount)) : "";
      const addExp = Number(execution.additional_expenses) > 0 ? String(Number(execution.additional_expenses)) : "";
      setPaymentMethod(pMethod as any); setCollectedAmount(cAmount); setHasExpenses(!!addExp); setAdditionalExpenses(addExp); setExpensesReason(execution.expenses_reason || "");
    }
  }, [isOpen, execution, reset]);

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({ control, name: "services" });
  const watchedMembers = useWatch({ control, name: "members", defaultValue: [] });
  const watchedServices = useWatch({ control, name: "services", defaultValue: [] });

  const [searchTerm, setSearchTerm] = useState('');
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const [techNotes, setTechNotes] = useState("");
  
  const [existingBeforePhotos, setExistingBeforePhotos] = useState<any[]>([]);
  const [existingAfterPhotos, setExistingAfterPhotos] = useState<any[]>([]);
  const [beforePhotos, setBeforePhotos] = useState<{ file: File, preview: string }[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<{ file: File, preview: string }[]>([]);
  
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  const [paymentMethod, setPaymentMethod] = useState<'NONE' | 'CASH' | 'TRANSFER'>('NONE');
  const [collectedAmount, setCollectedAmount] = useState("");
  const [hasExpenses, setHasExpenses] = useState(false);
  const [additionalExpenses, setAdditionalExpenses] = useState("");
  const [expensesReason, setExpensesReason] = useState("");
  const [serialInput, setSerialInput] = useState<{ [key: string]: string }>({});

  const calculatedTotalAmount = useMemo(() => {
    let total = 0;
    watchedServices.forEach(srv => {
      if (srv.service_id) {
        const foundService = servicesList.find(s => String(s.id) === String(srv.service_id));
        if (foundService && foundService.base_price) { total += (Number(foundService.base_price) * Number(srv.quantity || 1)); } 
        else { const oldSrv = execution?.services?.find((os:any)=> String(os.service_id) === String(srv.service_id)); if(oldSrv) total += (Number(oldSrv.unit_price) * Number(srv.quantity || 1)); }
      }
    });
    selectedMaterials.forEach(mat => { if (mat.current_price) total += (Number(mat.current_price) * Number(mat.selectedQty || 1)); });
    return total;
  }, [watchedServices, selectedMaterials, servicesList, execution]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.value; setSearchTerm(val); if (val.trim().length > 2) searchMemberTrigger(val); };
  const handleAddMember = (member: Member) => { const currentMembers = getValues("members"); if (!currentMembers.find(m => m.user_id === member.user_id)) { setValue("members", [...currentMembers, member], { shouldValidate: true }); } setSearchTerm(''); };
  const handleRemoveMember = (userId: number) => { const currentMembers = getValues("members"); setValue("members", currentMembers.filter(m => m.user_id !== userId), { shouldValidate: true }); };
  const handleMaterialSearch = (e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.value; setMaterialSearchTerm(val); if (val.trim().length > 2) searchMaterialTrigger(val); };
  const handleAddMaterial = (material: any) => { if (!selectedMaterials.find(m => m.id === material.id)) { setSelectedMaterials(prev => [...prev, { ...material, selectedQty: 1, enteredSerials: [] }]); } setMaterialSearchTerm(''); };
  const handleUpdateMaterialQty = (materialId: string, delta: number) => { setSelectedMaterials(prev => prev.map(mat => { if (mat.id === materialId) { const newQty = mat.selectedQty + delta; if (newQty >= 1 && newQty <= mat.available_stock) { let updatedSerials = mat.enteredSerials; if (mat.is_serialized && newQty < mat.enteredSerials.length) { updatedSerials = mat.enteredSerials.slice(0, newQty); } return { ...mat, selectedQty: newQty, enteredSerials: updatedSerials }; } else if (newQty > mat.available_stock) { toast.error(`عفواً، أقصى رصيد هو ${mat.available_stock}`); } } return mat; })); };
  const handleAddSerial = (materialId: string) => { const currentSerial = serialInput[materialId]?.trim(); if (!currentSerial) return; setSelectedMaterials(prev => prev.map(mat => { if (mat.id === materialId) { if (mat.enteredSerials.length >= mat.selectedQty) { toast.error(`لا يمكنك إضافة أكثر من ${mat.selectedQty}`); return mat; } if (mat.enteredSerials.includes(currentSerial)) { toast.error(`هذا السيريال مضاف مسبقاً!`); return mat; } return { ...mat, enteredSerials: [...mat.enteredSerials, currentSerial] }; } return mat; })); setSerialInput(prev => ({ ...prev, [materialId]: "" })); };
  const handleRemoveSerial = (materialId: string, serialToRemove: string) => { setSelectedMaterials(prev => prev.map(mat => { if (mat.id === materialId) { return { ...mat, enteredSerials: mat.enteredSerials.filter((s: string) => s !== serialToRemove) }; } return mat; })); };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, stage: 'BEFORE' | 'AFTER') => {
    if (e.target.files && e.target.files.length > 0) {
      const maxAllowed = 5; 
      const currentCount = stage === 'BEFORE' ? existingBeforePhotos.length + beforePhotos.length : existingAfterPhotos.length + afterPhotos.length;
      if (currentCount + e.target.files.length > maxAllowed) { toast.error(`عفواً، الحد الأقصى هو ${maxAllowed} صور.`); return; }
      const newPhotosArray: { file: File, preview: string }[] = [];
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true, fileType: "image/jpeg" };
      try {
        for (let i = 0; i < e.target.files.length; i++) {
          const originalFile = e.target.files[i];
          const compressedFile = await imageCompression(originalFile, options);
          const finalFile = new File([compressedFile], originalFile.name, { type: "image/jpeg", lastModified: Date.now() });
          newPhotosArray.push({ file: finalFile, preview: URL.createObjectURL(finalFile) });
        }
        if (stage === 'BEFORE') setBeforePhotos(prev => [...prev, ...newPhotosArray]); else setAfterPhotos(prev => [...prev, ...newPhotosArray]);
        toast.success(`تم إدراج الصور.`);
      } catch (error) { toast.error("حدث خطأ أثناء المعالجة."); }
    }
    if (stage === 'BEFORE' && beforeFileInputRef.current) beforeFileInputRef.current.value = '';
    if (stage === 'AFTER' && afterFileInputRef.current) afterFileInputRef.current.value = '';
  };

  const onSubmit = async (data: CompleteAssignmentFormValues) => {
    const finalCollectedAmount = paymentMethod === 'CASH' ? collectedAmount : '0';
    const finalPaymentMethod = paymentMethod !== 'NONE' ? paymentMethod : 'NONE';
    const finalAdditionalExpenses = hasExpenses ? additionalExpenses : '0';
    const finalExpensesReason = hasExpenses ? expensesReason : '';

    if (paymentMethod === 'CASH' && (Number(finalCollectedAmount) <= 0 || !collectedAmount)) return toast.error("أدخل المبلغ المحصل!");
    if (hasExpenses) { if (Number(finalAdditionalExpenses) <= 0) return toast.error("أدخل المصروفات!"); if (!finalExpensesReason.trim()) return toast.error("اكتب سبب المصروفات!"); }

    if (existingBeforePhotos.length + beforePhotos.length === 0) return toast.error("أرفق صورة قبل العمل.");
    if (existingAfterPhotos.length + afterPhotos.length === 0) return toast.error("أرفق صورة بعد العمل.");

    for (const mat of selectedMaterials) { if (mat.is_serialized && mat.enteredSerials.length !== mat.selectedQty) { toast.error(`أكمل سيريالات (${mat.name || mat.name_ar}).`); return; } }

    const formData = new FormData();
    formData.append('tech_notes', techNotes || ''); formData.append('collected_amount', finalCollectedAmount); formData.append('payment_method', finalPaymentMethod); formData.append('additional_expenses', finalAdditionalExpenses); formData.append('expenses_reason', finalExpensesReason);

    const formattedMembers = data.members.map(m => m.user_id);
    formData.append('team_members', JSON.stringify(formattedMembers));

    const formattedServices = data.services.map(s => {
      const foundService = servicesList.find(sl => String(sl.id) === String(s.service_id));
      const oldService = execution?.services?.find((os:any)=> String(os.service_id) === String(s.service_id));
      return { service_id: Number(s.service_id), quantity: Number(s.quantity), unit_price: foundService ? Number(foundService.base_price) : (oldService ? oldService.unit_price : 0) }
    });
    formData.append('services', JSON.stringify(formattedServices));

    const formattedMaterials = selectedMaterials.map(mat => ({ material_id: mat.id, quantity: mat.selectedQty, serials: mat.enteredSerials || [], unit_cost: mat.unit_cost || 0, unit_price: mat.current_price || 0 }));
    formData.append('materials', JSON.stringify(formattedMaterials));

    formData.append('retained_photos', JSON.stringify([...existingBeforePhotos, ...existingAfterPhotos]));
    const photoStagesArray: string[] = [];
    beforePhotos.forEach((photoObj) => { formData.append('images', photoObj.file); photoStagesArray.push('BEFORE'); });
    afterPhotos.forEach((photoObj) => { formData.append('images', photoObj.file); photoStagesArray.push('AFTER'); });
    formData.append('new_photo_stages', JSON.stringify(photoStagesArray));

    try {
      await updateExecution({ id: execution.execution_id, data: formData }).unwrap();
      toast.success("تم التعديل وإرسال المهمة للمراجعة!");
      onClose(); 
    } catch (error: any) { toast.error(error?.data?.message || "حدث خطأ."); }
  };

  const safeTechNotes = execution?.tech_notes || "";
  const hasRejectionNote = safeTechNotes.includes('[سبب الرفض]');
  const rejectionReasonText = hasRejectionNote ? safeTechNotes.split('[سبب الرفض]:')[1]?.trim() : safeTechNotes;

  if (!execution) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        aria-describedby={undefined}
        // 🔴 الكلاس السحري: التصاق بالقاع، عرض كامل، وإلغاء التقوس السفلي
        className="p-0 bg-slate-50 border-none shadow-2xl flex flex-col overflow-hidden w-full max-w-full sm:max-w-[480px] h-[95vh] sm:h-[90vh] !rounded-b-none sm:!rounded-b-2xl !rounded-t-3xl sm:!rounded-t-2xl absolute sm:fixed !bottom-0 sm:!bottom-auto !top-auto sm:!top-[50%] !translate-y-0 sm:!-translate-y-1/2 left-[50%] -translate-x-1/2" 
        dir="rtl"
      >
        {/* Header - Compact */}
        <div className="flex justify-between bg-slate-900 px-3 py-2.5 items-center shrink-0 z-10 shadow-md">
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shadow-inner shrink-0">
               <Wrench size={14} className="text-white" />
             </div>
             <div>
               <DialogTitle className="text-[11px] font-bold text-white leading-tight">تعديل مهمة</DialogTitle>
               <p className="text-slate-400 text-[9px] font-medium mt-0.5">{execution?.booking_details?.booking_ref}</p>
             </div>
          </div>
          <button onClick={onClose} type="button" className="p-1.5 text-white/80 hover:bg-white/20 rounded-lg transition-all"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 bg-transparent">
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full w-full" dir="rtl">
              <div className="flex flex-col gap-3 p-3 pb-6">

                {/* Rejection Note */}
                {hasRejectionNote && (
                  <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-start gap-2 shadow-sm">
                    <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={14} />
                    <div>
                      <h4 className="text-[10px] font-bold text-rose-800 mb-0.5">ملاحظات الإدارة:</h4>
                      <p className="text-[10px] text-rose-600 font-medium leading-relaxed">{rejectionReasonText}</p>
                    </div>
                  </div>
                )}

                {/* Services */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/70">
                  <div className="text-[10px] px-3 py-2 bg-slate-100 rounded-t-xl font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-slate-100">
                      <Wrench size={12} /> الخدمات 
                  </div>
                  <div className="flex flex-col p-2.5 gap-2">
                    {serviceFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-1.5">
                        <div className="flex-1">
                          <Controller control={control} name={`services.${index}.service_id` as const} render={({ field: selectField }) => (
                            <Select value={selectField.value ? String(selectField.value) : undefined} onValueChange={(val) => selectField.onChange(val)}>
                              <SelectTrigger className={cn("w-full h-8 text-[10px] bg-slate-50 px-2.5 rounded-lg border-slate-200", errors.services?.[index]?.service_id && "border-red-500")}>
                                <SelectValue placeholder="اختر خدمة..." />
                              </SelectTrigger>
                              <SelectContent className="z-[9999] text-[10px] rounded-xl" position="popper" sideOffset={4}>
                                {servicesList.map(srv => (
                                  <SelectItem key={srv.id} value={String(srv.id)} className="text-[10px]">{srv.name_ar} {Number(srv.base_price) > 0 && `(${Number(srv.base_price)}ج)`}</SelectItem>
                                ))}
                                {selectField.value && !servicesList.find(s => String(s.id) === String(selectField.value)) && (
                                   <SelectItem value={String(selectField.value)} className="text-[10px] text-slate-500">{execution?.services?.find((s:any)=> String(s.service_id) === String(selectField.value))?.name_ar || 'خدمة سابقة'}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          )}/>
                        </div>
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 h-8 shrink-0">
                          <button type="button" onClick={() => { const qty = Number(getValues(`services.${index}.quantity`)); if (qty > 1) setValue(`services.${index}.quantity`, qty - 1); }} className="px-2 text-slate-500"><Minus size={10} /></button>
                          <span className="text-[10px] font-bold w-5 text-center">{watchedServices[index]?.quantity || 1}</span>
                          <button type="button" onClick={() => { const qty = Number(getValues(`services.${index}.quantity`)); setValue(`services.${index}.quantity`, qty + 1); }} className="px-2 text-slate-500"><Plus size={10} /></button>
                        </div>
                        {serviceFields.length > 1 && <button type="button" onClick={() => removeService(index)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => appendService({ service_id: "", quantity: 1 })} disabled={serviceFields.length >= servicesList.length} className="text-[10px] font-bold text-secondary mt-1 flex items-center gap-1 w-fit"><Plus size={12} /> إضافة خدمة</button>
                  </div>
                </div>

                {/* Team */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/70">
                  <div className="text-[10px] px-3 py-2 bg-slate-100 rounded-t-xl font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-slate-100">
                   <Users size={12} /> الفنيين 
                  </div>
                  <div className="p-2.5 pb-1.5 flex flex-wrap gap-1.5">
                    {watchedMembers.map(member => (
                      <div key={member.user_id} className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-[10px] font-bold text-slate-700">
                        <span>{member.name}</span><button type="button" onClick={() => handleRemoveMember(member.user_id)} className="text-slate-400"><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="px-2.5 pb-2.5 relative">
                    <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg px-2 h-8">
                      {isSearching ? <Loader2 size={12} className="animate-spin text-slate-400 ml-1" /> : <Search size={12} className="text-slate-400 ml-1" />}
                      <input type="text" placeholder="بحث وإضافة فني..." value={searchTerm} onChange={handleSearch} className="w-full text-[10px] bg-transparent outline-none" />
                    </div>
                    {searchTerm.length > 2 && activeSearchResults.length > 0 && (
                      <ul className="absolute z-20 w-[calc(100%-20px)] mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-32 overflow-y-auto p-1">
                        {activeSearchResults.map(res => (
                          <li key={res.user_id} onClick={() => handleAddMember(res)} className="p-2 text-[10px] font-bold hover:bg-slate-50 rounded flex justify-between cursor-pointer">
                            <span>{res.name}</span><span className="text-slate-400">#{res.user_id}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Materials */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/70">
                  <div className="text-[10px] px-3 py-2 bg-slate-100 rounded-t-xl font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-slate-100">
                       <Package size={12} /> الخامات 
                  </div>
                  <div className="p-2.5">
                    {selectedMaterials.length > 0 && (
                      <div className="flex flex-col gap-2 mb-2">
                        {selectedMaterials.map((mat) => (
                          <div key={mat.id} className={cn("p-2 bg-slate-50 border rounded-lg relative", mat.is_serialized && mat.enteredSerials.length !== mat.selectedQty ? "border-red-200" : "border-slate-200")}>
                            <button type="button" onClick={() => setSelectedMaterials(prev => prev.filter(m => m.id !== mat.id))} className="absolute top-1.5 left-1.5 text-slate-400 p-1 bg-white rounded border border-slate-100"><Trash2 size={10} /></button>
                            <div className="pr-1">
                              <span className="text-[10px] font-bold text-slate-800 flex items-center gap-1">{mat.name || mat.name_ar} {mat.is_serialized && <Badge variant="outline" className="text-[7px] px-1 py-0 h-3">مسريل</Badge>}</span>
                              {Number(mat.current_price) > 0 && <span className="text-[9px] text-primary">{Number(mat.current_price)} ج</span>}
                            </div>
                            <div className="mt-1.5 flex items-center justify-between bg-white px-2 py-1 rounded-md border border-slate-100">
                              <span className="text-[9px] text-slate-500 font-bold">الكمية:</span>
                              <div className="flex items-center bg-slate-50 rounded border border-slate-200 h-6">
                                <button type="button" onClick={() => handleUpdateMaterialQty(mat.id, -1)} className="px-1.5 text-slate-500"><Minus size={8} /></button>
                                <span className="text-[10px] font-bold w-4 text-center">{mat.selectedQty}</span>
                                <button type="button" onClick={() => handleUpdateMaterialQty(mat.id, 1)} className="px-1.5 text-slate-500"><Plus size={8} /></button>
                              </div>
                            </div>
                            {mat.is_serialized && (
                              <div className="mt-1.5 bg-white rounded-md p-1.5 border border-slate-100">
                                <div className="flex justify-between text-[8px] font-bold text-slate-500 mb-1">
                                  <span>السيريالات:</span>
                                  <span className={mat.enteredSerials.length === mat.selectedQty ? "text-emerald-500" : "text-rose-500"}>{mat.enteredSerials.length}/{mat.selectedQty}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {mat.enteredSerials.map((s:string, i:number) => (
                                    <div key={i} className="flex items-center gap-0.5 bg-slate-100 px-1 py-0.5 rounded text-[8px] font-mono"><button type="button" onClick={() => handleRemoveSerial(mat.id, s)}><X size={8}/></button> {s}</div>
                                  ))}
                                </div>
                                {mat.enteredSerials.length < mat.selectedQty && (
                                  <div className="flex gap-1">
                                    <input type="text" placeholder="السيريال" value={serialInput[mat.id] || ""} onChange={(e) => setSerialInput(p => ({...p, [mat.id]: e.target.value}))} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSerial(mat.id); } }} className="flex-1 h-6 px-1.5 text-[9px] rounded border border-slate-200 bg-slate-50" />
                                    <button type="button" onClick={() => handleAddSerial(mat.id)} className="h-6 px-2 bg-secondary text-white rounded text-[9px] font-bold">إضافة</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg px-2 h-8">
                        {isSearchingMaterials ? <Loader2 size={12} className="animate-spin text-slate-400 ml-1" /> : <Search size={12} className="text-slate-400 ml-1" />}
                        <input type="text" placeholder="بحث خامات..." value={materialSearchTerm} onChange={handleMaterialSearch} className="w-full text-[10px] bg-transparent outline-none" />
                      </div>
                      {materialSearchTerm.length > 1 && activeMaterialResults.length > 0 && (
                        <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-32 overflow-y-auto p-1">
                          {activeMaterialResults.map((res: any) => (
                            <li key={res.id} onClick={() => handleAddMaterial(res)} className="p-1.5 text-[10px] font-bold hover:bg-slate-50 rounded flex justify-between cursor-pointer"><span>{res.name}</span><span className="text-[8px] text-primary">{res.available_stock} متاح</span></li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financials */}
                <div className="bg-slate-50/80 border border-slate-200 p-2.5 rounded-xl space-y-2.5">
                   <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1"><Banknote size={12} className="text-emerald-600"/> التحصيل والماليات</h3>
                  {calculatedTotalAmount > 0 && (
                    <div className="bg-white border border-slate-200 px-2 py-1.5 rounded-md flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-600">المطلوب:</span><span className="font-mono text-xs font-bold text-emerald-600">{calculatedTotalAmount} ج</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button type="button" onClick={() => { setPaymentMethod('NONE'); setCollectedAmount(""); }} className={cn("h-7 rounded-md text-[9px] font-bold border", paymentMethod === 'NONE' ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200")}>آجل</button>
                    <button type="button" onClick={() => setPaymentMethod('CASH')} className={cn("h-7 rounded-md text-[9px] font-bold border", paymentMethod === 'CASH' ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200")}>كاش</button>
                    <button type="button" onClick={() => { setPaymentMethod('TRANSFER'); setCollectedAmount(""); }} className={cn("h-7 rounded-md text-[9px] font-bold border", paymentMethod === 'TRANSFER' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200")}>تحويل</button>
                  </div>
                  {paymentMethod === 'CASH' && (
                    <input type="number" placeholder="المبلغ المحصل..." value={collectedAmount} onChange={(e) => setCollectedAmount(e.target.value)} className="w-full h-8 px-2 rounded-md border border-emerald-200 text-[10px] font-mono outline-none" />
                  )}

                  <div className="h-px bg-slate-200 my-1.5"></div>
                  
                  <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1"><Sigma size={12} className="text-rose-600"/> مصروفات خارجية</h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button type="button" onClick={() => { setHasExpenses(false); setAdditionalExpenses(""); setExpensesReason(""); }} className={cn("h-7 rounded-md text-[9px] font-bold border", !hasExpenses ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200")}>لا يوجد</button>
                    <button type="button" onClick={() => setHasExpenses(true)} className={cn("h-7 rounded-md text-[9px] font-bold border", hasExpenses ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-500 border-slate-200")}>يوجد مصروفات</button>
                  </div>
                  {hasExpenses && (
                    <div className="space-y-1.5">
                      <input type="number" placeholder="المبلغ..." value={additionalExpenses} onChange={(e) => setAdditionalExpenses(e.target.value)} className="w-full h-8 px-2 rounded-md border border-rose-200 text-[10px] font-mono outline-none" />
                      <input type="text" placeholder="السبب والتفاصيل..." value={expensesReason} onChange={(e) => setExpensesReason(e.target.value)} className="w-full h-8 px-2 rounded-md border border-slate-200 text-[10px] outline-none" />
                    </div>
                  )}
                </div>

                {/* Photos & Notes */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/70">
                   <div className="text-[10px] px-3 py-2 bg-slate-100 rounded-t-xl font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-slate-100">
                         <Camera size={12} /> الصور والتقرير 
                  </div>
                  <div className="p-2.5 space-y-2.5">
                    <textarea value={techNotes} onChange={(e) => setTechNotes(e.target.value)} placeholder="ردك على الإدارة..." className="w-full h-14 p-2 text-[10px] border border-slate-200 rounded-lg bg-slate-50 outline-none resize-none"></textarea>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border border-slate-200 bg-slate-50 p-2 rounded-lg">
                        <h4 className="text-[9px] font-bold text-slate-700 mb-1.5">صور قبل</h4>
                        <input type="file" multiple accept="image/*" ref={beforeFileInputRef} className="hidden" onChange={(e) => handlePhotoUpload(e, 'BEFORE')} />
                        <button type="button" onClick={() => beforeFileInputRef.current?.click()} className="w-full h-6 border border-dashed border-primary/40 bg-white rounded text-primary text-[9px] font-bold mb-1.5 flex items-center justify-center"><ImagePlus size={10} className="mr-1"/> إضافة</button>
                        <div className="flex flex-wrap gap-1">
                          {existingBeforePhotos.map((p, i) => (<div key={`o-b-${i}`} className="relative w-8 h-8 rounded border border-slate-200"><img src={p.url} className="w-full h-full object-cover rounded"/><button type="button" onClick={() => setExistingBeforePhotos(pv=>pv.filter((_,idx)=>idx!==i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={6}/></button></div>))}
                          {beforePhotos.map((p, i) => (<div key={`n-b-${i}`} className="relative w-8 h-8 rounded border border-emerald-300"><img src={p.preview} className="w-full h-full object-cover rounded"/><button type="button" onClick={() => setBeforePhotos(pv=>pv.filter((_,idx)=>idx!==i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={6}/></button></div>))}
                        </div>
                      </div>
                      <div className="border border-slate-200 bg-slate-50 p-2 rounded-lg">
                        <h4 className="text-[9px] font-bold text-slate-700 mb-1.5">صور بعد</h4>
                        <input type="file" multiple accept="image/*" ref={afterFileInputRef} className="hidden" onChange={(e) => handlePhotoUpload(e, 'AFTER')} />
                        <button type="button" onClick={() => afterFileInputRef.current?.click()} className="w-full h-6 border border-dashed border-emerald-400 bg-white rounded text-emerald-600 text-[9px] font-bold mb-1.5 flex items-center justify-center"><ImagePlus size={10} className="mr-1"/> إضافة</button>
                        <div className="flex flex-wrap gap-1">
                          {existingAfterPhotos.map((p, i) => (<div key={`o-a-${i}`} className="relative w-8 h-8 rounded border border-slate-200"><img src={p.url} className="w-full h-full object-cover rounded"/><button type="button" onClick={() => setExistingAfterPhotos(pv=>pv.filter((_,idx)=>idx!==i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={6}/></button></div>))}
                          {afterPhotos.map((p, i) => (<div key={`n-a-${i}`} className="relative w-8 h-8 rounded border border-emerald-300"><img src={p.preview} className="w-full h-full object-cover rounded"/><button type="button" onClick={() => setAfterPhotos(pv=>pv.filter((_,idx)=>idx!==i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={6}/></button></div>))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </ScrollArea>
          </div>

          <div className="shrink-0 w-full mt-auto">
            <button 
              type="submit"
              disabled={isSubmitting || !isValid} 
              className={cn(
                "w-full h-[52px] rounded-none font-bold text-xs transition-all flex justify-center items-center gap-2",
                (isSubmitting || !isValid) ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white active:bg-slate-800"
              )}
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" /> جاري الإرسال...</>
              ) : (
                <><Send size={14} /> إعادة الإرسال للمراجعة</>
              )}
            </button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}