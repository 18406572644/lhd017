import { ref, computed, onMounted } from 'vue'
import type { UserHealthProfile, SpecialPeriodType, FamilyMember } from '@/types/medicine'
import { SPECIAL_PERIOD_INFO, FAMILY_MEMBERS } from '@/types/medicine'
import {
  getHealthProfiles,
  saveHealthProfile,
  getHealthProfileByMember,
  updateHealthProfile,
  deleteHealthProfile,
  getSpecialPeriodsForMember,
} from '@/utils/storage'
import { generateId, getTodayString } from '@/utils/date'

export function useHealthProfile() {
  const healthProfiles = ref<UserHealthProfile[]>([])
  const selectedMember = ref<FamilyMember | ''>('')

  const loadHealthProfiles = () => {
    healthProfiles.value = getHealthProfiles()
  }

  const createProfile = (
    familyMember: FamilyMember,
    data: {
      specialPeriods?: SpecialPeriodType[]
      allergies?: string[]
      chronicDiseases?: string[]
    }
  ): UserHealthProfile => {
    const existing = getHealthProfileByMember(familyMember)
    const now = getTodayString()

    if (existing) {
      const updated: UserHealthProfile = {
        ...existing,
        specialPeriods: data.specialPeriods || existing.specialPeriods,
        allergies: data.allergies || existing.allergies,
        chronicDiseases: data.chronicDiseases || existing.chronicDiseases,
        updatedAt: now,
      }
      saveHealthProfile(updated)
      loadHealthProfiles()
      return updated
    }

    const profile: UserHealthProfile = {
      id: generateId(),
      familyMember,
      specialPeriods: data.specialPeriods || [],
      allergies: data.allergies || [],
      chronicDiseases: data.chronicDiseases || [],
      createdAt: now,
      updatedAt: now,
    }
    saveHealthProfile(profile)
    loadHealthProfiles()
    return profile
  }

  const updateProfile = (familyMember: FamilyMember, data: Partial<UserHealthProfile>) => {
    updateHealthProfile(familyMember, data)
    loadHealthProfiles()
  }

  const removeProfile = (familyMember: FamilyMember) => {
    deleteHealthProfile(familyMember)
    loadHealthProfiles()
  }

  const toggleSpecialPeriod = (familyMember: FamilyMember, period: SpecialPeriodType) => {
    const profile = getHealthProfileByMember(familyMember)
    if (!profile) {
      createProfile(familyMember, { specialPeriods: [period] })
      return
    }

    const periods = [...profile.specialPeriods]
    const index = periods.indexOf(period)
    if (index !== -1) {
      periods.splice(index, 1)
    } else {
      periods.push(period)
    }

    updateProfile(familyMember, { specialPeriods: periods })
  }

  const addAllergy = (familyMember: FamilyMember, allergy: string) => {
    const profile = getHealthProfileByMember(familyMember)
    if (!profile) {
      createProfile(familyMember, { allergies: [allergy] })
      return
    }

    if (!profile.allergies.includes(allergy)) {
      updateProfile(familyMember, {
        allergies: [...profile.allergies, allergy],
      })
    }
  }

  const removeAllergy = (familyMember: FamilyMember, allergy: string) => {
    const profile = getHealthProfileByMember(familyMember)
    if (!profile) return

    updateProfile(familyMember, {
      allergies: profile.allergies.filter((a) => a !== allergy),
    })
  }

  const addChronicDisease = (familyMember: FamilyMember, disease: string) => {
    const profile = getHealthProfileByMember(familyMember)
    if (!profile) {
      createProfile(familyMember, { chronicDiseases: [disease] })
      return
    }

    if (!profile.chronicDiseases.includes(disease)) {
      updateProfile(familyMember, {
        chronicDiseases: [...profile.chronicDiseases, disease],
      })
    }
  }

  const removeChronicDisease = (familyMember: FamilyMember, disease: string) => {
    const profile = getHealthProfileByMember(familyMember)
    if (!profile) return

    updateProfile(familyMember, {
      chronicDiseases: profile.chronicDiseases.filter((d) => d !== disease),
    })
  }

  const getProfile = (familyMember: FamilyMember) => {
    return getHealthProfileByMember(familyMember)
  }

  const getSpecialPeriods = (familyMember: FamilyMember) => {
    return getSpecialPeriodsForMember(familyMember)
  }

  const hasSpecialPeriod = (familyMember: FamilyMember, period: SpecialPeriodType) => {
    const periods = getSpecialPeriods(familyMember)
    return periods.includes(period)
  }

  const selectedProfile = computed(() => {
    if (!selectedMember.value) return null
    return getHealthProfileByMember(selectedMember.value)
  })

  const familyMembersWithProfiles = computed(() => {
    return FAMILY_MEMBERS.map((member) => {
      const profile = getHealthProfileByMember(member.value)
      return {
        ...member,
        profile,
        hasSpecialPeriod: profile && profile.specialPeriods.length > 0,
        specialPeriods: profile?.specialPeriods || [],
      }
    })
  })

  const membersWithSpecialPeriods = computed(() => {
    return familyMembersWithProfiles.value.filter((m) => m.hasSpecialPeriod)
  })

  const specialPeriodOptions = computed(() => {
    return Object.entries(SPECIAL_PERIOD_INFO).map(([value, info]) => ({
      value: value as SpecialPeriodType,
      ...info,
    }))
  })

  onMounted(() => {
    loadHealthProfiles()
  })

  return {
    healthProfiles,
    selectedMember,
    selectedProfile,
    familyMembersWithProfiles,
    membersWithSpecialPeriods,
    specialPeriodOptions,
    loadHealthProfiles,
    createProfile,
    updateProfile,
    removeProfile,
    toggleSpecialPeriod,
    addAllergy,
    removeAllergy,
    addChronicDisease,
    removeChronicDisease,
    getProfile,
    getSpecialPeriods,
    hasSpecialPeriod,
  }
}
