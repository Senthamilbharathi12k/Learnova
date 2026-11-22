
const STORAGE_KEY = 'learnova_onboarding_v1'

const DEFAULT_STEPS = {
  profileCompleted: false,
  skillsCompleted: false,
  assessmentCompleted: false,
  recommendationsViewed: false,
}

export const getOnboardingProgress = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    return stored
      ? { ...DEFAULT_STEPS, ...JSON.parse(stored) }
      : { ...DEFAULT_STEPS }
  } catch {
    return { ...DEFAULT_STEPS }
  }
}

export const updateOnboardingStep = (step, completed = true) => {
  const allowedSteps = Object.keys(DEFAULT_STEPS)

  if (!allowedSteps.includes(step)) {
    return getOnboardingProgress()
  }

  const current = getOnboardingProgress()

  const updated = {
    ...current,
    [step]: completed,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

  window.dispatchEvent(new Event('learnova-onboarding-updated'))

  return updated
}

export const resetOnboardingProgress = () => {
  localStorage.removeItem(STORAGE_KEY)

  window.dispatchEvent(new Event('learnova-onboarding-updated'))
}

export const subscribeOnboardingProgress = (callback) => {
  const handleUpdate = () => callback(getOnboardingProgress())

  window.addEventListener('learnova-onboarding-updated', handleUpdate)
  window.addEventListener('storage', handleUpdate)

  return () => {
    window.removeEventListener('learnova-onboarding-updated', handleUpdate)
    window.removeEventListener('storage', handleUpdate)
  }
}
