"use client"

import React, { useEffect } from "react"
import { useTranslations } from "next-intl"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { teamSchema, TeamFormValues } from "@/lib/validation/teamSchema"
import { useCreateTeamMutation, useUpdateTeamMutation } from "@/redux/features/teamsApiSlice"
import { useGetUsersListQuery } from "@/redux/features/authApiSlice" 
import LocationSelector from "@/components/shared/LocationSelector" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateTeamProps {
  isOpen: boolean
  onClose: () => void
  selectedTeam: any | null
}

export default function CreateTeam({ isOpen, onClose, selectedTeam }: CreateTeamProps) {
  const t = useTranslations("TeamsOperations")

  const { data: supervisorsData } = useGetUsersListQuery("supervisor")

  const supervisorsList = supervisorsData?.data || []

  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation()
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation()

  const teamForm = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: "", team_type: "mixed", governorate_id: 0, zone_id: 0, supervisor_id: 0, max_daily_tasks: 5, notes: "", is_active: true }
  })

  useEffect(() => {
    if (selectedTeam && isOpen) {
      teamForm.reset({
        name: selectedTeam.name,
        team_type: selectedTeam.team_type,
        governorate_id: selectedTeam.governorate_id || 0,
        zone_id: selectedTeam.zone_id || 0,
        supervisor_id: selectedTeam.supervisor_id || 0,
        max_daily_tasks: selectedTeam.max_daily_tasks,
        notes: selectedTeam.notes || "",
        is_active: selectedTeam.is_active
      })
    } else if (!selectedTeam && isOpen) {
      teamForm.reset({ name: "", team_type: "mixed", governorate_id: 0, zone_id: 0, supervisor_id: 0, max_daily_tasks: 5, notes: "", is_active: true })
    }
  }, [selectedTeam, isOpen, teamForm])

  const onTeamSubmit: SubmitHandler<TeamFormValues> = async (values) => {
    try {
      const { governorate_id, ...backendData } = values
      if (selectedTeam) {
        await updateTeam({ id: selectedTeam.id, data: backendData }).unwrap()
      } else {
        await createTeam(backendData).unwrap()
      }
      toast.success(selectedTeam ? t("toast.teamUpdated") : t("toast.teamCreated"))
      onClose()
    } catch (err: any) {
      toast.error(err?.data?.message || t("toast.errorSavingTeam"))
    }
  }


  const checkValid = teamForm?.formState?.isValid  

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] p-0 rounded-lg border-none bg-white shadow-2xl">
        <DialogHeader    className="w-full">
          <DialogTitle className="font-light text-xl p-5 rounded-t-lg py-5 bg-secondary text-white">
            {selectedTeam ? t("createEdit.editTitle") : t("createEdit.createTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={teamForm.handleSubmit(onTeamSubmit)} className="space-y-5 p-5 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase  tracking-wider mb-1 block">{t("createEdit.teamName")}</label>
              <Input {...teamForm.register("name")} className="rounded-lg px-2 border-slate-200 bg-slate-50 focus-visible:ring-0" placeholder={t("createEdit.teamNamePlaceholder")} />
              {teamForm.formState.errors.name && <span className="text-xs text-red-500">{teamForm.formState.errors.name.message}</span>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">{t("createEdit.serviceType")}</label>
              <Controller
                control={teamForm.control}
                name="team_type"
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger className="flex px-4 h-10 w-full border border-slate-200 bg-slate-50 py-2 text-sm rounded-lg focus:outline-none focus:ring-0">
                      <SelectValue placeholder={t("filters.mixed")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="installation">{t("filters.installation")}</SelectItem>
                      <SelectItem value="maintenance">{t("filters.maintenance")}</SelectItem>
                      <SelectItem value="mixed">{t("filters.mixed")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4">
            <h4 className="text-xs font-semibold mb-3 text-slate-500 uppercase tracking-widest">{t("createEdit.geographicalCoverage")}</h4>
            <LocationSelector 
              selectedGovId={teamForm.watch("governorate_id")}
              selectedZoneId={teamForm.watch("zone_id")}
              onGovChange={(id) => {
                teamForm.setValue("governorate_id", id)
                teamForm.setValue("zone_id", 0)
              }}
              onZoneChange={(id) => teamForm.setValue("zone_id", id)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">{t("createEdit.supervisor")}</label>
              <Controller
                control={teamForm.control}
                name="supervisor_id"
                render={({ field }) => (
                  <Select
                    value={field.value && field.value !== 0 ? String(field.value) : undefined}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger className="flex h-10 w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-0">
                      <SelectValue placeholder={t("createEdit.selectSupervisor")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-60 overflow-y-auto">
                      {supervisorsList.map((u: any) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">{t("createEdit.maxDailyTasks")}</label>
              <Input type="number" {...teamForm.register("max_daily_tasks", { valueAsNumber: true })} className="rounded-lg px-2 border-slate-200 bg-slate-50 focus-visible:ring-0" />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto rounded-lg  hover:bg-slate-600 bg-slate-500 hover:text-white text-white">{t("common.cancel")}</Button>
            <Button type="submit" disabled={isCreating || isUpdating || !checkValid } className= {`w-full ${!checkValid ? "bg-gray-400" : "bg-secondary"}  sm:w-auto rounded-lg  hover:bg-secondary/80 text-white border-none `}>
              {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} 
              {selectedTeam ? t("createEdit.saveChanges") : t("createEdit.deployTeam")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}