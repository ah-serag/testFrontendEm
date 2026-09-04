"use client"

import React, { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Edit, Trash2, Loader2, MapPin, Map, Globe2, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"

import { governorateSchema, zoneSchema, GovernorateFormValues, ZoneFormValues, Governorate, Zone } from "@/lib/validation/locationsSchema"

import {
  useGetGovernoratesAndZonesQuery,
  useCreateGovernorateMutation, useUpdateGovernorateMutation, useDeleteGovernorateMutation,
  useCreateZoneMutation, useUpdateZoneMutation, useDeleteZoneMutation
} from "@/redux/features/locationsApiSlice"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [expandedGovs, setExpandedGovs] = useState<number[]>([])

  // ================= API HOOKS =================
  const { data: combinedData, isLoading } = useGetGovernoratesAndZonesQuery({})
  
  const governoratesList: Governorate[] = combinedData?.data || []
  const flatZonesList: Zone[] = governoratesList.flatMap((gov) => gov.zones || [])

  // Mutations
  const [createGov, { isLoading: isCreatingGov }] = useCreateGovernorateMutation()
  const [updateGov, { isLoading: isUpdatingGov }] = useUpdateGovernorateMutation()
  const [deleteGov] = useDeleteGovernorateMutation()

  const [createZone, { isLoading: isCreatingZone }] = useCreateZoneMutation()
  const [updateZone, { isLoading: isUpdatingZone }] = useUpdateZoneMutation()
  const [deleteZone] = useDeleteZoneMutation()

  // ================= STATES =================
  const [isGovModalOpen, setIsGovModalOpen] = useState(false)
  const [selectedGov, setSelectedGov] = useState<Governorate | null>(null)
  
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)

  const [deleteItem, setDeleteItem] = useState<{ type: 'gov' | 'zone', id: number, name: string } | null>(null)

  // ================= FORMS =================
const govForm = useForm<GovernorateFormValues>({
  resolver: zodResolver(governorateSchema) as any,
  defaultValues: {
    name_ar: "",
    name_en: "",
    is_active: true,
  },
})
const zoneForm = useForm<ZoneFormValues>({
  resolver: zodResolver(zoneSchema) as any,
  defaultValues: {
    governorate_id: 0,
    name_ar: "",
    name_en: "",
    notes: "",
    is_active: true,
  },
})
  // ================= HANDLERS: EXPAND/COLLAPSE =================
  const toggleGov = (id: number) => {
    setExpandedGovs((prev) => 
      prev.includes(id) ? prev.filter(govId => govId !== id) : [...prev, id]
    )
  }

  // ================= HANDLERS: GOVERNORATES =================
  const openGovAdd = () => { 
    setSelectedGov(null); 
    govForm.reset({ name_ar: "", name_en: "", is_active: true }); 
    setIsGovModalOpen(true); 
  }
  
  const openGovEdit = (gov: Governorate) => { 
    setSelectedGov(gov); 
    govForm.reset({ name_ar: gov.name_ar, name_en: gov.name_en, is_active: gov.is_active }); 
    setIsGovModalOpen(true); 
  }
  
  // الحل النهائي لمشكلة الـ TypeScript
  const onGovSubmit: SubmitHandler<GovernorateFormValues> = async (values) => {
    try {
      if (selectedGov) {
        await updateGov({ id: selectedGov.id, ...values }).unwrap()
      } else {
        await createGov(values).unwrap()
      }
      toast.success(selectedGov ? "Governorate updated!" : "Governorate created!")
      setIsGovModalOpen(false)
    } catch (err: any) { 
      toast.error(err?.data?.message || "Error saving governorate") 
    }
  }

  // ================= HANDLERS: ZONES =================
  const openZoneAdd = (prefillGovId: number = 0) => { 
    setSelectedZone(null); 
    zoneForm.reset({ governorate_id: prefillGovId, name_ar: "", name_en: "", notes: "", is_active: true }); 
    setIsZoneModalOpen(true); 
  }
  
  const openZoneEdit = (zone: Zone) => { 
    setSelectedZone(zone); 
    zoneForm.reset({ 
      governorate_id: Number(zone.governorate_id), 
      name_ar: zone.name_ar, 
      name_en: zone.name_en, 
      notes: zone.notes || "", 
      is_active: zone.is_active 
    }); 
    setIsZoneModalOpen(true); 
  }

  // الحل النهائي لمشكلة الـ TypeScript
  const onZoneSubmit: SubmitHandler<ZoneFormValues> = async (values) => {
    try {
      if (selectedZone) {
        await updateZone({ id: selectedZone.id, ...values }).unwrap()
      } else {
        await createZone(values).unwrap()
      }
      toast.success(selectedZone ? "Zone updated!" : "Zone created!")
      setIsZoneModalOpen(false)
    } catch (err: any) { 
      toast.error(err?.data?.message || "Error saving zone") 
    }
  }

  // ================= HANDLERS: DELETE =================
  const confirmDelete = async () => {
    if (!deleteItem) return
    try {
      if (deleteItem.type === 'gov') await deleteGov(deleteItem.id).unwrap()
      if (deleteItem.type === 'zone') await deleteZone(deleteItem.id).unwrap()
      toast.success("Deleted successfully!")
      setDeleteItem(null)
    } catch (err: any) { 
      toast.error(err?.data?.message || "Cannot delete item. It might be linked.") 
    }
  }

  return (
    <div className="space-y-6 w-full p-4 md:p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe2 className="w-6 h-6 sm:w-8 sm:h-8 " />
            Locations Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage governorates and service zones in one place.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="flex w-full min-w-max md:w-[600px] h-11">
            <TabsTrigger value="all" className="flex-1"><Globe2 className="w-4 h-4 mr-2"/> All</TabsTrigger>
            <TabsTrigger value="governorates" className="flex-1"><Map className="w-4 h-4 mr-2"/> Governorates</TabsTrigger>
            <TabsTrigger value="zones" className="flex-1"><MapPin className="w-4 h-4 mr-2"/> Zones</TabsTrigger>
          </TabsList>
        </div>

        {/* ======================= TAB 1: ALL TOGETHER ======================= */}
        <TabsContent value="all" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {isLoading && <div className="text-center py-8">Loading locations...</div>}
          {!isLoading && governoratesList.length === 0 && <div className="text-center py-8 text-muted-foreground">No data found.</div>}
          
          {governoratesList.map((gov) => {
            const isExpanded = expandedGovs.includes(gov.id);
            return (
              <div key={gov.id} className="bg-background border shadow-sm p-3 sm:p-4 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-2">
                  <div 
                    className="flex-1 flex items-center gap-2 sm:gap-3 cursor-pointer group w-full"
                    onClick={() => toggleGov(gov.id)}
                  >
                    <div className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold flex flex-wrap items-center gap-2">
                        {gov.name_en} 
                        <Badge variant={gov.is_active ? "default" : "secondary"} className="text-xs">
                          {gov.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">{gov.name_ar}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto pl-7 sm:pl-0">
                    <Button variant="outline" size="sm" onClick={() => openGovEdit(gov)} className="flex-1 sm:flex-none">
                      <Edit className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button size="sm" onClick={() => openZoneAdd(gov.id)} className="flex-1 sm:flex-none">
                      <Plus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Add Zone</span>
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t">
                    {gov.zones && gov.zones.length > 0 ? (
                      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              <TableHead className="whitespace-nowrap">Zone (EN)</TableHead>
                              <TableHead className="whitespace-nowrap hidden sm:table-cell">Zone (AR)</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {gov.zones.map((zone) => (
                              <TableRow key={zone.id}>
                                <TableCell className="font-medium whitespace-nowrap">
                                  {zone.name_en}
                                  <div className="sm:hidden text-xs text-muted-foreground mt-1">{zone.name_ar}</div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{zone.name_ar}</TableCell>
                                <TableCell><Badge variant={zone.is_active ? "outline" : "secondary"}>{zone.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                                <TableCell className="text-right space-x-2 whitespace-nowrap">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openZoneEdit(zone)}><Edit className="w-4 h-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteItem({ type: 'zone', id: zone.id, name: zone.name_en })}><Trash2 className="w-4 h-4" /></Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs sm:text-sm text-muted-foreground bg-muted/20 border border-dashed">
                        No zones linked to this governorate yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </TabsContent>

        {/* ======================= TAB 2: GOVERNORATES ONLY ======================= */}
        <TabsContent value="governorates" className="space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-background p-4 border shadow-sm gap-4 sm:gap-0">
            <h2 className="text-lg font-semibold">Governorates</h2>
            <Button onClick={openGovAdd} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Governorate</Button>
          </div>
          
          <div className="bg-background border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Governorate (EN)</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Governorate (AR)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>}
                  {!isLoading && governoratesList.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No governorates found.</TableCell></TableRow>}
                  {governoratesList.map((gov) => (
                    <TableRow key={gov.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {gov.name_en}
                        <div className="sm:hidden text-xs text-muted-foreground mt-1">{gov.name_ar}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{gov.name_ar}</TableCell>
                      <TableCell><Badge variant={gov.is_active ? "default" : "secondary"}>{gov.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3" onClick={() => openGovEdit(gov)}><Edit className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Edit</span></Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3" onClick={() => setDeleteItem({ type: 'gov', id: gov.id, name: gov.name_en })}><Trash2 className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ======================= TAB 3: ZONES ONLY ======================= */}
      <TabsContent value="zones" className="space-y-4 mt-6">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-background p-4 rounded-xl border shadow-sm gap-4 sm:gap-0">
    <h2 className="text-lg font-semibold">Zones</h2>
    <Button onClick={() => openZoneAdd()} className="w-full sm:w-auto">
      <Plus className="w-4 h-4 mr-2" /> Add Zone
    </Button>
  </div>

  {isLoading ? (
    <div className="text-center py-10 bg-background border rounded-xl shadow-sm text-muted-foreground font-medium">
      Loading zones...
    </div>
  ) : !isLoading && flatZonesList.length === 0 ? (
    <div className="text-center py-10 bg-background border rounded-xl shadow-sm text-muted-foreground font-medium">
      No zones found.
    </div>
  ) : (
    <>
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {flatZonesList.map((zone) => {
          const parentGov = governoratesList.find((g) => g.id === zone.governorate_id);
          return (
            <div key={zone.id} className="bg-background border rounded-xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h3 className="font-bold text-base text-foreground">{zone.name_en}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{zone.name_ar}</p>
                </div>
                <Badge variant={zone.is_active ? "outline" : "secondary"}>
                  {zone.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground font-medium mb-0.5">Governorate</span>
                  <span className="text-sm font-semibold">{parentGov?.name_en || "N/A"}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-9 px-3" onClick={() => openZoneEdit(zone)}>
                    <Edit className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button variant="destructive" size="icon" className="h-9 w-9 shrink-0" onClick={() => setDeleteItem({ type: 'zone', id: zone.id, name: zone.name_en })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-background border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[600px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="whitespace-nowrap py-3">Zone (EN / AR)</TableHead>
                <TableHead className="whitespace-nowrap py-3">Governorate</TableHead>
                <TableHead className="py-3">Status</TableHead>
                <TableHead className="text-right py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flatZonesList.map((zone) => {
                const parentGov = governoratesList.find((g) => g.id === zone.governorate_id);
                return (
                  <TableRow key={zone.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium whitespace-nowrap py-3">
                      {zone.name_en}
                      <div className="text-xs text-muted-foreground mt-1">{zone.name_ar}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-3 font-medium">
                      {parentGov?.name_en || "N/A"}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant={zone.is_active ? "outline" : "secondary"}>
                        {zone.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-3 whitespace-nowrap space-x-2 rtl:space-x-reverse">
                      <Button variant="outline" size="sm" className="h-9" onClick={() => openZoneEdit(zone)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button variant="destructive" size="icon" className="h-9 w-9" onClick={() => setDeleteItem({ type: 'zone', id: zone.id, name: zone.name_en })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )}
</TabsContent>
      </Tabs>

      {/* ======================= GOVERNORATE MODAL ======================= */}
      <Dialog open={isGovModalOpen} onOpenChange={setIsGovModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{selectedGov ? "Edit Governorate" : "Add Governorate"}</DialogTitle></DialogHeader>
          <form onSubmit={govForm.handleSubmit(onGovSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name (EN)</label>
                <Input {...govForm.register("name_en")} />
                {govForm.formState.errors.name_en && <span className="text-xs text-destructive">{govForm.formState.errors.name_en.message}</span>}
              </div>
              <div>
                <label className="text-sm font-medium">Name (AR)</label>
                <Input dir="rtl" {...govForm.register("name_ar")} />
                {govForm.formState.errors.name_ar && <span className="text-xs text-destructive">{govForm.formState.errors.name_ar.message}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="gov_active" className="w-4 h-4 cursor-pointer" {...govForm.register("is_active")} />
              <label htmlFor="gov_active" className="text-sm cursor-pointer select-none">Active Governorate</label>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsGovModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={isCreatingGov || isUpdatingGov} className="w-full sm:w-auto">
                {(isCreatingGov || isUpdatingGov) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} 
                {selectedGov ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================= ZONE MODAL ======================= */}
      <Dialog open={isZoneModalOpen} onOpenChange={setIsZoneModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[400px]">
          <DialogHeader><DialogTitle>{selectedZone ? "Edit Zone" : "Add Zone"}</DialogTitle></DialogHeader>
          <form onSubmit={zoneForm.handleSubmit(onZoneSubmit)} className="space-y-4">
            
            <div>
              <label className="text-sm font-medium">Governorate</label>
              <select {...zoneForm.register("governorate_id", { valueAsNumber: true })} className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm">
                <option value={0} disabled>Select a governorate...</option>
                {governoratesList.map((g) => <option key={g.id} value={g.id}>{g.name_en} ({g.name_ar})</option>)}
              </select>
              {zoneForm.formState.errors.governorate_id && <span className="text-xs text-destructive">{zoneForm.formState.errors.governorate_id.message}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name (EN)</label>
                <Input {...zoneForm.register("name_en")} />
                {zoneForm.formState.errors.name_en && <span className="text-xs text-destructive">{zoneForm.formState.errors.name_en.message}</span>}
              </div>
              <div>
                <label className="text-sm font-medium">Name (AR)</label>
                <Input dir="rtl" {...zoneForm.register("name_ar")} />
                {zoneForm.formState.errors.name_ar && <span className="text-xs text-destructive">{zoneForm.formState.errors.name_ar.message}</span>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Input {...zoneForm.register("notes")} />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="zone_active" className="w-4 h-4 cursor-pointer" {...zoneForm.register("is_active")} />
              <label htmlFor="zone_active" className="text-sm cursor-pointer select-none">Active Zone</label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsZoneModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={isCreatingZone || isUpdatingZone} className="w-full sm:w-auto">
                {(isCreatingZone || isUpdatingZone) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} 
                {selectedZone ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================= DELETE CONFIRMATION ======================= */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className="w-[95vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-bold text-foreground">{deleteItem?.name}</span> and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="mt-0 border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}