"use client"

import React, { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Edit, Trash2, Loader2, Wrench, Layers, FolderTree, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { categorySchema, serviceSchema, CategoryFormValues, ServiceFormValues, Category, Service } from "@/lib/validation/servicesSchema"

import {
  useGetCategoriesAndServicesQuery,
  useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation,
  useCreateServiceMutation, useUpdateServiceMutation, useDeleteServiceMutation
} from "@/redux/features/servesAndCategorySlice"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// المكون الخاص بتسعير العمولة
import ServiceCommissionModal from "@/components/manager/services/ServiceCommissionModal"

export default function CategoriesAndServicesPage() {
  const [activeTab, setActiveTab] = useState("all")
  
  // التحكم في الأقسام المفتوحة والمقفولة
  const [expandedCats, setExpandedCats] = useState<number[]>([])

  // ================= API HOOKS =================
  const { data: combinedData, isLoading } = useGetCategoriesAndServicesQuery({})
  
  const categoriesList: Category[] = combinedData?.data || []
  const flatServicesList: any[] = categoriesList.flatMap((cat) => cat.services || [])

  // Mutations
  const [createCat, { isLoading: isCreatingCat }] = useCreateCategoryMutation()
  const [updateCat, { isLoading: isUpdatingCat }] = useUpdateCategoryMutation()
  const [deleteCat] = useDeleteCategoryMutation()

  const [createSrv, { isLoading: isCreatingSrv }] = useCreateServiceMutation()
  const [updateSrv, { isLoading: isUpdatingSrv }] = useUpdateServiceMutation()
  const [deleteSrv] = useDeleteServiceMutation()

  // ================= STATES =================
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [selectedCat, setSelectedCat] = useState<Category | null>(null)
  
  const [isSrvModalOpen, setIsSrvModalOpen] = useState(false)
  const [selectedSrv, setSelectedSrv] = useState<Service | null>(null)

  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false)
  const [selectedServiceForCommission, setSelectedServiceForCommission] = useState<any>(null)

  const [deleteItem, setDeleteItem] = useState<{ type: 'cat' | 'srv', id: number, name: string } | null>(null)

  // ================= FORMS =================
  const catForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name_ar: "", name_en: "", icon: "", sort_order: 0, is_active: true }
  })

  const srvForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { category_id: 0, name_ar: "", name_en: "", base_price: 0, duration_hours: 1, is_active: true }
  })

  // ================= HANDLERS =================
  const toggleCat = (id: number) => {
    setExpandedCats((prev) => prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id])
  }

  const openCatAdd = () => { 
    setSelectedCat(null); catForm.reset({ name_ar: "", name_en: "", icon: "", sort_order: 0, is_active: true }); setIsCatModalOpen(true); 
  }
  
  const openCatEdit = (cat: Category) => { 
    setSelectedCat(cat); catForm.reset({ name_ar: cat.name_ar, name_en: cat.name_en, icon: cat.icon || "", sort_order: cat.sort_order || 0, is_active: cat.is_active }); setIsCatModalOpen(true); 
  }
  
  const onCatSubmit: SubmitHandler<CategoryFormValues> = async (values) => {
    try {
      if (selectedCat) await updateCat({ id: selectedCat.id, ...values }).unwrap()
      else await createCat(values).unwrap()
      toast.success(selectedCat ? "Category updated!" : "Category created!")
      setIsCatModalOpen(false)
    } catch (err: any) { toast.error(err?.data?.message || "Error saving category") }
  }

  const openSrvAdd = (prefillCategoryId: number = 0) => { 
    setSelectedSrv(null); srvForm.reset({ category_id: prefillCategoryId, name_ar: "", name_en: "", base_price: 0, duration_hours: 1, is_active: true }); setIsSrvModalOpen(true); 
  }
  
  const openSrvEdit = (srv: Service) => { 
    setSelectedSrv(srv); srvForm.reset({ category_id: Number(srv.category_id), name_ar: srv.name_ar, name_en: srv.name_en, base_price: srv.base_price, duration_hours: srv.duration_hours, is_active: srv.is_active }); setIsSrvModalOpen(true); 
  }

  const onSrvSubmit: SubmitHandler<ServiceFormValues> = async (values) => {
    try {
      if (selectedSrv) await updateSrv({ id: selectedSrv.id, ...values }).unwrap()
      else await createSrv(values).unwrap()
      toast.success(selectedSrv ? "Service updated!" : "Service created!")
      setIsSrvModalOpen(false)
    } catch (err: any) { toast.error(err?.data?.message || "Error saving service") }
  }

  const openCommissionModal = (srv: any) => {
    setSelectedServiceForCommission(srv);
    setIsCommissionModalOpen(true);
  };

  // زر العمولة - مرن للموبايل والديسكتوب
  const renderCommissionBadge = (srv: any, isMobileCard = false) => {
    const baseClasses = isMobileCard ? "w-full justify-center h-9 mt-2" : "whitespace-nowrap";
    
    if (srv.has_commission_rule) {
      return (
        <Badge 
          variant="outline" 
          className={`cursor-pointer hover:bg-emerald-50 border-emerald-200 text-emerald-700 font-bold ${baseClasses}`} 
          onClick={() => openCommissionModal(srv)}
        >
          <CheckCircle2 className="w-3 h-3 mr-1.5" />
          {srv.commission_type === 'PERCENTAGE' ? `${srv.pool_value}%` : `${srv.pool_value} ج.م`}
        </Badge>
      );
    }
    return (
      <Badge 
        variant="outline" 
        className={`cursor-pointer hover:bg-amber-50 border-amber-200 text-amber-700 font-bold ${baseClasses}`} 
        onClick={() => openCommissionModal(srv)}
      >
        <AlertCircle className="w-3 h-3 mr-1.5" />
        Set Commission
      </Badge>
    );
  };

  const confirmDelete = async () => {
    if (!deleteItem) return
    try {
      if (deleteItem.type === 'cat') await deleteCat(deleteItem.id).unwrap()
      if (deleteItem.type === 'srv') await deleteSrv(deleteItem.id).unwrap()
      toast.success("Deleted successfully!")
      setDeleteItem(null)
    } catch (err: any) { toast.error(err?.data?.message || "Cannot delete item. It might be linked.") }
  }

  return (
    <div className="space-y-6 p-4 md:p-8 w-full max-w-full overflow-hidden bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            Categories & Services
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage main categories and their detailed services seamlessly.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile Scrollable Tabs */}
        <div className="   pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 w-full scrollbar-hide">
          <TabsList className=" flex-col w-max flex-wrap min-w-full h-11 bg-white border shadow-sm rounded-lg">
            <TabsTrigger value="all" className="flex-1  px-6"><FolderTree className="w-4 h-4 mr-2"/> All</TabsTrigger>
            <TabsTrigger value="categories" className="flex-1  px-6"><Layers className="w-4 h-4 mr-2"/> Categories</TabsTrigger>
            <TabsTrigger value="services" className="flex-1  px-6"><Wrench className="w-4 h-4 mr-2"/> Services</TabsTrigger>
          </TabsList>
        </div>

        {/* ======================= TAB 1: ALL ======================= */}
        <TabsContent value="all" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 w-full">
          {isLoading && <div className="text-center py-8">Loading data...</div>}
          {!isLoading && categoriesList.length === 0 && <div className="text-center py-8 text-muted-foreground">No data found.</div>}
          
          {categoriesList.map((cat) => {
            const isExpanded = expandedCats.includes(cat.id);
            return (
              <div key={cat.id} className="bg-white border shadow-sm p-4 overflow-hidden rounded-xl">
                {/* Category Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                  <div 
                    className="flex-1 flex items-center gap-3 cursor-pointer group w-full"
                    onClick={() => toggleCat(cat.id)}
                  >
                    <div className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 bg-slate-100 p-1.5 rounded-md">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold flex flex-wrap items-center gap-2 truncate">
                        {cat.name_en} 
                        <Badge variant={cat.is_active ? "default" : "secondary"} className="text-[10px] whitespace-nowrap h-5">
                          {cat.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </h3>
                      <p className="text-muted-foreground text-xs truncate">{cat.name_ar}</p>
                    </div>
                  </div>

                  {/* Category Actions - Mobile: Full width buttons, Desktop: Row buttons */}
                  <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <Button variant="outline" size="sm" onClick={() => openCatEdit(cat)} className="flex-1 md:flex-none">
                      <Edit className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Edit Cat.</span>
                    </Button>
                    <Button size="sm" onClick={() => openSrvAdd(cat.id)} className="flex-1 md:flex-none">
                      <Plus className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Add Service</span>
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 w-full">
                    {cat.services && cat.services.length > 0 ? (
                      <>
                        {/* 📱 MOBILE VIEW: SERVICE CARDS */}
                        <div className="grid grid-cols-1 gap-3 md:hidden">
                          {cat.services.map((srv: any) => (
                            <div key={srv.id} className="bg-slate-50 border rounded-lg p-3.5 flex flex-col gap-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-sm text-slate-800">{srv.name_en}</h4>
                                  <p className="text-xs text-muted-foreground">{srv.name_ar}</p>
                                </div>
                                <Badge variant={srv.is_active ? "outline" : "secondary"} className="text-[10px] bg-white">
                                  {srv.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center text-sm mt-1">
                                <span className="font-mono font-bold text-primary">{srv.base_price} ج.م</span>
                                <span className="text-muted-foreground text-xs">{srv.duration_hours} hrs</span>
                              </div>
                              
                              {/* زر العمولة واخد العرض كله في الموبايل */}
                              {renderCommissionBadge(srv, true)}

                              <div className="flex gap-2 pt-3 mt-1 border-t border-slate-200 border-dashed">
                                <Button variant="ghost" size="sm" className="flex-1 h-8 bg-white border" onClick={() => openSrvEdit(srv)}>
                                  <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="flex-1 h-8 bg-white border text-destructive hover:text-destructive hover:bg-red-50" onClick={() => setDeleteItem({ type: 'srv', id: srv.id, name: srv.name_en })}>
                                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 💻 DESKTOP VIEW: TABLE */}
                        <div className="hidden md:block overflow-x-auto w-full">
                          <Table>
                            <TableHeader className="bg-slate-50 rounded-t-lg">
                              <TableRow>
                                <TableHead className="whitespace-nowrap">Service (EN)</TableHead>
                                <TableHead className="whitespace-nowrap">Service (AR)</TableHead>
                                <TableHead className="whitespace-nowrap">Price (ج.م)</TableHead>
                                <TableHead className="whitespace-nowrap">Commission</TableHead>
                                <TableHead className="whitespace-nowrap">Duration</TableHead>
                                <TableHead className="whitespace-nowrap">Status</TableHead>
                                <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cat.services.map((srv: any) => (
                                <TableRow key={srv.id}>
                                  <TableCell className="font-medium whitespace-nowrap">{srv.name_en}</TableCell>
                                  <TableCell className="whitespace-nowrap text-muted-foreground">{srv.name_ar}</TableCell>
                                  <TableCell className="whitespace-nowrap font-mono">{srv.base_price}</TableCell>
                                  <TableCell className="whitespace-nowrap">{renderCommissionBadge(srv)}</TableCell>
                                  <TableCell className="whitespace-nowrap">{srv.duration_hours} hrs</TableCell>
                                  <TableCell className="whitespace-nowrap"><Badge variant={srv.is_active ? "outline" : "secondary"}>{srv.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                                  <TableCell className="text-right space-x-2 whitespace-nowrap">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10" onClick={() => openSrvEdit(srv)}><Edit className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteItem({ type: 'srv', id: srv.id, name: srv.name_en })}><Trash2 className="w-4 h-4" /></Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-xs text-muted-foreground bg-slate-50 border border-dashed rounded-lg">
                        No services linked to this category yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </TabsContent>

        {/* ======================= TAB 2: CATEGORIES ONLY ======================= */}
        <TabsContent value="categories" className="space-y-4 mt-6 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 border shadow-sm gap-3 md:gap-0 rounded-xl">
            <h2 className="text-lg font-semibold">Categories</h2>
            <Button onClick={openCatAdd} className="w-full md:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
          </div>
          
          {/* 📱 MOBILE VIEW: CATEGORY CARDS */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {isLoading && <div className="text-center py-8">Loading...</div>}
            {!isLoading && categoriesList.length === 0 && <div className="text-center py-8 text-muted-foreground">No categories found.</div>}
            {categoriesList.map((cat) => (
              <div key={cat.id} className="bg-white border shadow-sm rounded-lg p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800">{cat.name_en}</h4>
                    <p className="text-xs text-muted-foreground">{cat.name_ar}</p>
                    <span className="text-xs text-slate-400 mt-1 block">Sort: {cat.sort_order}</span>
                  </div>
                  <Badge variant={cat.is_active ? "default" : "secondary"}>{cat.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="flex-1 h-8" onClick={() => openCatEdit(cat)}><Edit className="w-3.5 h-3.5 mr-2" /> Edit</Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-destructive border-red-100 hover:bg-red-50" onClick={() => setDeleteItem({ type: 'cat', id: cat.id, name: cat.name_en })}><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</Button>
                </div>
              </div>
            ))}
          </div>

          {/* 💻 DESKTOP VIEW: CATEGORY TABLE */}
          <div className="hidden md:block bg-white border shadow-sm overflow-hidden rounded-xl w-full">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="whitespace-nowrap">Category (EN)</TableHead>
                  <TableHead className="whitespace-nowrap">Category (AR)</TableHead>
                  <TableHead className="whitespace-nowrap">Sort</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>}
                {!isLoading && categoriesList.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No categories found.</TableCell></TableRow>}
                {categoriesList.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium whitespace-nowrap">{cat.name_en}</TableCell>
                    <TableCell className="whitespace-nowrap">{cat.name_ar}</TableCell>
                    <TableCell className="whitespace-nowrap">{cat.sort_order}</TableCell>
                    <TableCell className="whitespace-nowrap"><Badge variant={cat.is_active ? "default" : "secondary"}>{cat.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary" onClick={() => openCatEdit(cat)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteItem({ type: 'cat', id: cat.id, name: cat.name_en })}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ======================= TAB 3: SERVICES ONLY ======================= */}
        <TabsContent value="services" className="space-y-4 mt-6 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 border shadow-sm gap-3 md:gap-0 rounded-xl">
            <h2 className="text-lg font-semibold">Services</h2>
            <Button onClick={() => openSrvAdd()} className="w-full md:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Service</Button>
          </div>
          
          {/* 📱 MOBILE VIEW: SERVICE CARDS */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {isLoading && <div className="text-center py-8">Loading...</div>}
            {!isLoading && flatServicesList.length === 0 && <div className="text-center py-8 text-muted-foreground">No services found.</div>}
            {flatServicesList.map((srv: any) => {
              const parentCat = categoriesList.find((c) => c.id === srv.category_id)
              return (
                <div key={srv.id} className="bg-white border shadow-sm rounded-lg p-4 flex flex-col gap-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800">{srv.name_en}</h4>
                      <p className="text-xs text-muted-foreground">{srv.name_ar}</p>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-1.5 inline-block">
                        Cat: {parentCat?.name_en || "N/A"}
                      </span>
                    </div>
                    <Badge variant={srv.is_active ? "outline" : "secondary"} className="text-[10px]">
                      {srv.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-mono font-bold text-primary text-sm">{srv.base_price} ج.م</span>
                    <span className="text-xs text-muted-foreground">{srv.duration_hours} hrs</span>
                  </div>

                  {/* Commission Button Mobile */}
                  {renderCommissionBadge(srv, true)}

                  <div className="flex gap-2 pt-3 mt-1 border-t border-slate-100">
                    <Button variant="outline" size="sm" className="flex-1 h-8" onClick={() => openSrvEdit(srv)}>
                      <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-destructive border-red-100 hover:bg-red-50" onClick={() => setDeleteItem({ type: 'srv', id: srv.id, name: srv.name_en })}>
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 💻 DESKTOP VIEW: SERVICE TABLE */}
          <div className="hidden md:block bg-white border shadow-sm overflow-hidden rounded-xl w-full">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="whitespace-nowrap">Service (EN)</TableHead>
                  <TableHead className="whitespace-nowrap">Category</TableHead>
                  <TableHead className="whitespace-nowrap">Price (ج.م)</TableHead>
                  <TableHead className="whitespace-nowrap">Commission</TableHead>
                  <TableHead className="whitespace-nowrap">Duration</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>}
                {!isLoading && flatServicesList.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No services found.</TableCell></TableRow>}
                {flatServicesList.map((srv: any) => {
                  const parentCat = categoriesList.find((c) => c.id === srv.category_id)
                  return (
                    <TableRow key={srv.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {srv.name_en} 
                        <div className="text-xs text-muted-foreground mt-1">{srv.name_ar}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{parentCat?.name_en || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap font-mono">{srv.base_price}</TableCell>
                      <TableCell className="whitespace-nowrap">{renderCommissionBadge(srv)}</TableCell>
                      <TableCell className="whitespace-nowrap">{srv.duration_hours} hrs</TableCell>
                      <TableCell className="whitespace-nowrap"><Badge variant={srv.is_active ? "outline" : "secondary"}>{srv.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary" onClick={() => openSrvEdit(srv)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteItem({ type: 'srv', id: srv.id, name: srv.name_en })}><Trash2 className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* المودال الخاص بالإضافة والتعديل للعمولة */}
      <ServiceCommissionModal open={isCommissionModalOpen} onOpenChange={setIsCommissionModalOpen} service={selectedServiceForCommission} />

      {/* ======================= CATEGORY MODAL ======================= */}
      <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[425px] rounded-2xl">
          <DialogHeader><DialogTitle>{selectedCat ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <form onSubmit={catForm.handleSubmit(onCatSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name (EN)</label>
                <Input {...catForm.register("name_en")} className="h-10 rounded-lg" />
                {catForm.formState.errors.name_en && <span className="text-xs text-destructive">{catForm.formState.errors.name_en.message}</span>}
              </div>
              <div>
                <label className="text-sm font-medium">Name (AR)</label>
                <Input dir="rtl" {...catForm.register("name_ar")} className="h-10 rounded-lg" />
                {catForm.formState.errors.name_ar && <span className="text-xs text-destructive">{catForm.formState.errors.name_ar.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Sort Order</label>
                <Input type="number" {...catForm.register("sort_order")} className="h-10 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium">Icon (Optional)</label>
                <Input value={catForm.watch("icon") || ""} onChange={(e) => catForm.setValue("icon", e.target.value)} className="h-10 rounded-lg" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="cat_active" className="w-4 h-4 cursor-pointer" {...catForm.register("is_active")} />
              <label htmlFor="cat_active" className="text-sm cursor-pointer select-none">Active Category</label>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCatModalOpen(false)} className="w-full sm:w-auto h-10 rounded-lg">Cancel</Button>
              <Button type="submit" disabled={isCreatingCat || isUpdatingCat} className="w-full sm:w-auto h-10 rounded-lg">
                {(isCreatingCat || isUpdatingCat) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} 
                {selectedCat ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================= SERVICE MODAL ======================= */}
      <Dialog open={isSrvModalOpen} onOpenChange={setIsSrvModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-2xl">
          <DialogHeader><DialogTitle>{selectedSrv ? "Edit Service" : "Add Service"}</DialogTitle></DialogHeader>
          <form onSubmit={srvForm.handleSubmit(onSrvSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select {...srvForm.register("category_id", { valueAsNumber: true })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value={0} disabled>Select a category...</option>
                {categoriesList.map((c) => <option key={c.id} value={c.id}>{c.name_en} ({c.name_ar})</option>)}
              </select>
              {srvForm.formState.errors.category_id && <span className="text-xs text-destructive">{srvForm.formState.errors.category_id.message}</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name (EN)</label>
                <Input {...srvForm.register("name_en")} className="h-10 rounded-lg" />
                {srvForm.formState.errors.name_en && <span className="text-xs text-destructive">{srvForm.formState.errors.name_en.message}</span>}
              </div>
              <div>
                <label className="text-sm font-medium">Name (AR)</label>
                <Input dir="rtl" {...srvForm.register("name_ar")} className="h-10 rounded-lg" />
                {srvForm.formState.errors.name_ar && <span className="text-xs text-destructive">{srvForm.formState.errors.name_ar.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Base Price (ج.م)</label>
                <Input type="number" step="0.01" {...srvForm.register("base_price")} className="h-10 rounded-lg font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium">Duration (Hours)</label>
                <Input type="number" step="0.1" {...srvForm.register("duration_hours")} className="h-10 rounded-lg" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="srv_active" className="w-4 h-4 cursor-pointer" {...srvForm.register("is_active")} />
              <label htmlFor="srv_active" className="text-sm cursor-pointer select-none">Active Service</label>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSrvModalOpen(false)} className="w-full sm:w-auto h-10 rounded-lg">Cancel</Button>
              <Button type="submit" disabled={isCreatingSrv || isUpdatingSrv} className="w-full sm:w-auto h-10 rounded-lg">
                {(isCreatingSrv || isUpdatingSrv) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} 
                {selectedSrv ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================= DELETE CONFIRMATION ======================= */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className="w-[90vw] sm:max-w-[425px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-bold text-foreground">{deleteItem?.name}</span> and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="mt-0 border rounded-lg h-10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg h-10 w-full sm:w-auto">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}