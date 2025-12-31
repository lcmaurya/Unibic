"use client"

import { useState, useEffect } from "react" // Import useEffect
import {
  Bell,
  User,
  Briefcase,
  HandHeart,
  Users,
  Award,
  MapPin,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Plus,
  Lock,
  XCircle,
  Heart,
  CheckCircle2,
  Search,
  Coins,
  Flag,
  History,
  MessageSquare,
  Sparkles,
  Lightbulb,
  Filter,
  FileText,
  PlusCircle,
  Eye,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ShieldIcon } from "@/components/shield-icon"

interface MonitoringLog {
  id: string
  timestamp: string
  userId: string
  activityType: string
  severity: "normal" | "suspicious" | "critical"
  details: string
}

interface BetaUser {
  userId: string
  location: string
  inviteCode: string
  joinedDate: string
  isApproved: boolean
}

interface FeedbackLog {
  id: string
  timestamp: string
  userId: string
  category: "ui" | "performance" | "feature" | "bug"
  details: string
  context: string
}

type NotificationType =
  | "task_request"
  | "task_accepted"
  | "task_completed"
  | "trust_change"
  | "help_approved"
  | "help_request"
  | "help_received" // Added for help request status changes

interface Notification {
  id: number
  type: NotificationType
  title?: string // Make title optional as some notifications don't have it
  message: string
  timestamp: Date
  read: boolean
  relatedTaskId?: number
  trustChange?: number
}

interface TrustActivity {
  type:
    | "task_completed"
    | "help_given"
    | "task_rejected"
    | "misuse"
    | "false_activity"
    | "positive_feedback"
    | "issue_feedback"
  points: number
  description: string
  date: string
  id: string // Added id
  timestamp: string // Added timestamp
}

interface HelpRequest {
  id: string
  requestedBy: string
  userName?: string // Added for notification messages
  piAmount?: number // Added for notification messages
  amount: number
  reason: string
  status: "active" | "fulfilled" | "rejected" | "cancelled" | "pending" | "approved" // Added pending and approved statuses
  requestDate: string
  location: string
  requester?: string // Added for clarity in help section
  helper?: string // Added for clarity in help section
  timeAgo?: string // Added for display
}

// Changed Task type to Skill as per existing code for consistency
interface Skill {
  id: string
  title: string
  category: string
  estimatedTime: string
  piRewardMin: number
  piRewardMax: number
  distance: string
  postedBy: string
  postedDate: string
  minTrustScore: number
  location: string
  status?: "available" | "in_progress" | "completed" | "confirmed" | "pending" | "open" | "paused" // Added paused status
  acceptedBy?: string
  acceptedDate?: string
  completedDate?: string
  finalPiReward?: number
  feedback?: "good" | "neutral" | "issue"
  task?: Skill // Added for task details in notification
  acceptedAt?: string // Added for accepted tasks
  views?: number
  accepts?: number
  completions?: number
  isPaused?: boolean
  isActive?: boolean // Added for skill visibility control
  description?: string // Added description field for skill
}

// Mock data for community section
const betaUsers = {
  activeUsers: 120,
}

const userActivities = [
  { type: "task_completed", timestamp: new Date().toISOString() },
  { type: "help_given", timestamp: new Date().toISOString() },
  { type: "task_completed", timestamp: new Date().toISOString() },
]

export default function UnibicApp() {
  const [language, setLanguage] = useState<"en" | "hi" | "ta" | "te" | "bn" | "mr" | "gu">("en")
  const [currentView, setCurrentView] = useState<"home" | "skills" | "help" | "community" | "profile">("home")

  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("unibic_onboarding_completed")
    console.log("[v0] Onboarding check:", hasSeenOnboarding ? "Completed" : "Not completed")

    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
      console.log("[v0] Showing onboarding to new user")
    }
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem("unibic_onboarding_completed", "true")
    setShowOnboarding(false)
    setOnboardingStep(0)
    console.log("[v0] Onboarding completed and saved")
  }

  const nextOnboardingStep = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const skipOnboarding = () => {
    completeOnboarding()
  }

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; city: string } | null>(null) // Added user location state
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)

  // Removed requestLocationPermission as it's now handled in the header button

  useEffect(() => {
    const savedLocation = localStorage.getItem("unibic_user_location")
    const locationGranted = localStorage.getItem("unibic_location_granted")

    if (savedLocation && locationGranted === "true") {
      setUserLocation(JSON.parse(savedLocation)) // Parse the saved string into the correct format
      setLocationPermissionGranted(true)
    }
  }, [])

  const [isBetaMode] = useState(true) // Enable beta test mode
  const [betaUser] = useState<BetaUser>({
    userId: "beta-user-001",
    location: "Mumbai",
    inviteCode: "UNIBIC-BETA-2025",
    joinedDate: "2025-01-15",
    isApproved: true,
  })
  const [monitoringLogs, setMonitoringLogs] = useState<MonitoringLog[]>([])
  const [feedbackLogs, setFeedbackLogs] = useState<FeedbackLog[]>([])
  const [allowedLocations] = useState(["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"]) // Beta test

  const [usageTracking, setUsageTracking] = useState({
    dailyTasksPosted: 0,
    dailyTasksAccepted: 0,
    dailyHelpRequests: 0,
    weeklyTasksPosted: 0,
    weeklyTasksAccepted: 0,
    weeklyHelpRequests: 0,
    monthlyHelpRequests: 0,
    lastResetDate: new Date().toISOString().split("T")[0],
    lastWeeklyResetDate: new Date().toISOString().split("T")[0],
    lastMonthlyResetDate: new Date().toISOString().split("T")[0],
  })

  const [isKYCVerified, setIsKYCVerified] = useState(true) // Simulated Pi KYC status
  const [accountCreatedDate] = useState(new Date("2024-01-01")) // Account age tracking
  const [lastActivityTimestamps, setLastActivityTimestamps] = useState<{
    postSkill: number | null
    requestHelp: number | null
    acceptTask: number | null
  }>({
    postSkill: null,
    requestHelp: null,
    acceptTask: null,
  })

  // Renamed trustExpanded to showTrustDetails and updated state variable name
  const [showTrustDetails, setShowTrustDetails] = useState(false) // Renamed from trustExpanded
  const [showRules, setShowRules] = useState(false) // Renamed from rulesExpanded
  const [showPostSkillModal, setShowPostSkillModal] = useState(false) // Renamed from showPostSkill
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTask, setSelectedTask] = useState<Skill | null>(null) // Added state for task details modal
  const [showTaskDetail, setShowTaskDetail] = useState(false) // Added state for task details modal visibility
  // const [userLocation, setUserLocation] = useState("Mumbai") // Added user location - REMOVED as handled by state above
  const [showRequestHelp, setShowRequestHelp] = useState(false)
  const [showRequestHelpModal, setShowRequestHelpModal] = useState(false) // Added state for help request modal visibility
  const [acceptedTasks, setAcceptedTasks] = React.useState<Skill[]>([])
  const [showMyTasks, setShowMyTasks] = React.useState(false)
  const [confirmTaskModal, setConfirmTaskModal] = React.useState<Skill | null>(null)

  const [showFeedbackModal, setShowFeedbackModal] = useState<Skill | null>(null)

  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [showEditSkillModal, setShowEditSkillModal] = useState(false)
  const [showSkillPerformance, setShowSkillPerformance] = useState<Skill | null>(null)

  const [skillForm, setSkillForm] = useState({
    title: "",
    category: "",
    description: "",
  })

  const [violations, setViolations] = useState(0) // Track total violations
  const [featureLocks, setFeatureLocks] = useState({
    postSkill: false,
    requestHelp: false,
    acceptTasks: false,
  })
  const [lockExpiry, setLockExpiry] = useState<number | null>(null)

  const [communityFlags, setCommunityFlags] = useState<{
    [key: string]: {
      flaggedBy: string[]
      reasons: string[]
      timestamp: string
      autoResolved: boolean
    }
  }>({})

  const [autoGovernanceLog, setAutoGovernanceLog] = useState<
    {
      id: string
      type: "warning" | "penalty" | "auto_resolved" | "community_flag"
      target: string
      reason: string
      action: string
      timestamp: string
      automated: boolean
    }[]
  >([])

  // Automated governance rules - no manual admin intervention
  const AUTO_GOVERNANCE_RULES = {
    COMMUNITY_FLAG_THRESHOLD: 3, // Auto-investigate after 3 community flags
    WARNING_BEFORE_PENALTY: true, // Always warn before penalty
    AUTO_RESOLVE_MINOR_ISSUES: true, // Auto-resolve first-time minor issues with warning
    ESCALATION_LEVELS: {
      FIRST_OFFENSE: "warning", // Issue warning only
      SECOND_OFFENSE: "light_penalty", // Small trust score reduction
      THIRD_OFFENSE: "medium_penalty", // Moderate trust reduction + temporary limit
      REPEATED_OFFENSE: "heavy_penalty", // Severe trust reduction + feature lock
    },
    PENALTIES: {
      LIGHT: -10,
      MEDIUM: -20,
      HEAVY: -30,
    },
  } as const

  // Community feedback system - users can flag suspicious activity
  const flagSuspiciousActivity = (
    targetType: "task" | "help_request" | "user",
    targetId: string,
    reason: string,
    flaggedBy: string,
  ) => {
    const key = `${targetType}_${targetId}`

    setCommunityFlags((prev) => {
      const existing = prev[key] || {
        flaggedBy: [],
        reasons: [],
        timestamp: new Date().toISOString(),
        autoResolved: false,
      }

      const updated = {
        ...existing,
        flaggedBy: [...existing.flaggedBy, flaggedBy],
        reasons: [...existing.reasons, reason],
      }

      // Auto-investigate when threshold is reached
      if (updated.flaggedBy.length >= AUTO_GOVERNANCE_RULES.COMMUNITY_FLAG_THRESHOLD) {
        autoInvestigateFlag(targetType, targetId, updated)
      }

      return { ...prev, [key]: updated }
    })

    // Log community action
    logGovernanceAction({
      type: "community_flag",
      target: `${targetType} ${targetId}`,
      reason: reason,
      action: "Community member flagged for review",
      automated: false,
    })

    alert(
      language === "en"
        ? "Thank you for reporting. Our automated system will review this activity."
        : "रिपोर्ट के लिए धन्यवाद। हमारा स्वचालित सिस्टम इसकी समीक्षा करेगा।",
    )
  }

  // Auto-investigate when community flags reach threshold
  const autoInvestigateFlag = (
    targetType: string,
    targetId: string,
    flagData: { flaggedBy: string[]; reasons: string[]; timestamp: string },
  ) => {
    console.log("[v0] Auto-investigating flagged content:", { targetType, targetId, flagData })

    // Check user's offense history
    const userOffenses = autoGovernanceLog.filter(
      (log) => log.target.includes(targetId) && log.type === "penalty",
    ).length

    // Apply graduated response based on offense history
    if (userOffenses === 0) {
      // First offense: Issue warning only
      issueAutomatedWarning(targetId, "Community flags triggered review. Please follow community guidelines.")
    } else if (userOffenses === 1) {
      // Second offense: Light penalty
      applyAutomatedPenalty(targetId, "light", "Repeated community flags for guideline violations")
    } else if (userOffenses === 2) {
      // Third offense: Medium penalty
      applyAutomatedPenalty(targetId, "medium", "Multiple violations despite warnings")
    } else {
      // Repeated offender: Heavy penalty
      applyAutomatedPenalty(targetId, "heavy", "Persistent violation of community guidelines")
    }

    // Mark as resolved
    setCommunityFlags((prev) => ({
      ...prev,
      [`${targetType}_${targetId}`]: { ...prev[`${targetType}_${targetId}`], autoResolved: true },
    }))
  }

  // Issue automated warning (no manual intervention)
  const issueAutomatedWarning = (userId: string, reason: string) => {
    logGovernanceAction({
      type: "warning",
      target: userId,
      reason: reason,
      action: "Automated warning issued - no penalty applied",
      automated: true,
    })

    alert(
      language === "en"
        ? `⚠️ Automated Warning\n\n${reason}\n\nThis is your first warning. Continued violations will result in automatic penalties.`
        : `⚠️ स्वचालित चेतावनी\n\n${reason}\n\nयह आपकी पहली चेतावनी है। निरंतर उल्लंघन स्वचालित दंड में परिणाम होगा।`,
    )
  }

  // Apply automated penalty based on severity
  const applyAutomatedPenalty = (userId: string, severity: "light" | "medium" | "heavy", reason: string) => {
    const penaltyPoints =
      severity === "light"
        ? AUTO_GOVERNANCE_RULES.PENALTIES.LIGHT
        : severity === "medium"
          ? AUTO_GOVERNANCE_RULES.PENALTIES.MEDIUM
          : AUTO_GOVERNANCE_RULES.PENALTIES.HEAVY

    // Apply trust score penalty
    addTrustActivity({
      type: "misuse",
      points: penaltyPoints,
      description: `Automated penalty: ${reason}`,
      date: new Date().toLocaleDateString(),
    })

    logGovernanceAction({
      type: "penalty",
      target: userId,
      reason: reason,
      action: `Automated penalty applied: ${penaltyPoints} trust score points`,
      automated: true,
    })

    // Apply temporary feature restrictions for medium/heavy penalties
    if (severity === "medium") {
      setFeatureLocks((prev) => ({ ...prev, requestHelp: true }))
      const expiry = Date.now() + 24 * 60 * 60 * 1000
      setLockExpiry(expiry)
    } else if (severity === "heavy") {
      setFeatureLocks({ postSkill: true, requestHelp: true, acceptTasks: true })
      const expiry = Date.now() + 48 * 60 * 60 * 1000
      setLockExpiry(expiry)
    }

    alert(
      language === "en"
        ? `🚨 Automated Penalty Applied\n\nReason: ${reason}\nPenalty: ${penaltyPoints} trust score points\n\nThis is an automated action based on community feedback and system rules.`
        : `🚨 स्वचालित दंड लागू\n\nकारण: ${reason}\nदंड: ${penaltyPoints} विश्वास स्कोर अंक\n\nयह सामुदायिक प्रतिक्रिया और सिस्टम नियमों के आधार पर एक स्वचालित कार्रवाई है।`,
    )
  }

  // Log all governance actions for transparency
  const logGovernanceAction = (
    action: Omit<(typeof autoGovernanceLog)[0], "id" | "timestamp"> & { timestamp?: string },
  ) => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: action.timestamp || new Date().toISOString(),
      ...action,
    }
    setAutoGovernanceLog([newLog, ...autoGovernanceLog])

    // Silent logging for beta monitoring
    console.log("[v0] Governance Action:", newLog)
  }

  // Auto-detect and resolve minor issues with warnings
  const autoCheckActivityPattern = (userId: string, activityType: string) => {
    const recentActivities = autoGovernanceLog.filter(
      (log) => log.target === userId && Date.now() - new Date(log.timestamp).getTime() < 60 * 60 * 1000, // Last hour
    )

    if (recentActivities.length === 0 && AUTO_GOVERNANCE_RULES.AUTO_RESOLVE_MINOR_ISSUES) {
      // First-time user or no recent issues - auto-resolve with friendly reminder
      if (activityType === "help_request" && violations === 0) {
        logGovernanceAction({
          type: "auto_resolved",
          target: userId,
          reason: "First help request - friendly reminder sent",
          action: "Auto-resolved with community guidelines reminder",
          automated: true,
        })
      }
    }
  }

  const TRUST_SCORE_RULES = {
    BASE_SCORE: 650,
    MIN_SCORE: 0,
    MAX_SCORE: 1000,
    INCREASES: {
      TASK_COMPLETED: 10, // Points for completing a task confirmed by owner
      HELP_GIVEN: 15, // Points for helping someone in emergency
      POSITIVE_FEEDBACK: 5, // Additional points for good feedback from task owner
    },
    DECREASES: {
      TASK_REJECTED: -5, // Points deducted when task completion is rejected
      MISUSE_REPORTED: -20, // Points deducted for reported misuse
      FALSE_ACTIVITY: -15, // Points deducted for fake or duplicate activity
      ISSUE_FEEDBACK: -3, // Points deducted for negative feedback from task owner
    },
  } as const

  const [trustScore, setTrustScore] = useState(750) // Initialize trustScore state

  const [trustActivities, setTrustActivities] = useState<TrustActivity[]>([
    {
      type: "task_completed",
      points: TRUST_SCORE_RULES.INCREASES.TASK_COMPLETED,
      description: "Website Design Help",
      date: "2024-01-15",
      id: "1",
      timestamp: new Date().toISOString(),
    },
    {
      type: "task_completed",
      points: TRUST_SCORE_RULES.INCREASES.TASK_COMPLETED,
      description: "Hindi Translation",
      date: "2024-01-14",
      id: "2",
      timestamp: new Date().toISOString(),
    },
    {
      type: "help_given",
      points: TRUST_SCORE_RULES.INCREASES.HELP_GIVEN,
      description: "Emergency support to Rajesh",
      date: "2024-01-13",
      id: "3",
      timestamp: new Date().toISOString(),
    },
    {
      type: "task_completed",
      points: TRUST_SCORE_RULES.INCREASES.TASK_COMPLETED,
      description: "Mobile App Testing",
      date: "2024-01-12",
      id: "4",
      timestamp: new Date().toISOString(),
    },
    {
      type: "task_rejected",
      points: TRUST_SCORE_RULES.DECREASES.TASK_REJECTED,
      description: "Task cancelled by requester",
      date: "2024-01-10",
      id: "5",
      timestamp: new Date().toISOString(),
    },
    {
      type: "task_completed",
      points: TRUST_SCORE_RULES.INCREASES.TASK_COMPLETED,
      description: "Logo Design",
      date: "2024-01-09",
      id: "6",
      timestamp: new Date().toISOString(),
    },
    {
      type: "help_given",
      points: TRUST_SCORE_RULES.INCREASES.HELP_GIVEN,
      description: "Medical emergency help",
      date: "2024-01-08",
      id: "7",
      timestamp: new Date().toISOString(),
    },
  ])

  const [postedSkills, setPostedSkills] = useState<Skill[]>([
    {
      id: "1",
      title: "Website Design Help",
      postedBy: "You",
      category: "Design",
      estimatedTime: "2h",
      piRewardMin: 4,
      piRewardMax: 6,
      distance: "2.3 km",
      postedDate: "2024-01-15",
      minTrustScore: 500, // Added trust requirement
      location: "Mumbai", // Added location
      status: "open", // Changed from "available" to "open"
      isActive: true, // Added for skill visibility control
      // Add default performance stats
      views: 25,
      accepts: 3,
      completions: 2,
    },
    {
      id: "2",
      title: "Hindi Translation Needed",
      postedBy: "You",
      category: "Language",
      estimatedTime: "1h",
      piRewardMin: 2,
      piRewardMax: 4,
      distance: "1.8 km",
      postedDate: "2024-01-15",
      minTrustScore: 400, // Added trust requirement
      location: "Mumbai", // Added location
      status: "open", // Changed from "available" to "open"
      isActive: true, // Added for skill visibility control
      // Add default performance stats
      views: 40,
      accepts: 5,
      completions: 4,
    },
    {
      id: "3",
      title: "Mobile App Testing",
      postedBy: "You",
      category: "Tech",
      estimatedTime: "3h",
      piRewardMin: 3,
      piRewardMax: 5,
      distance: "3.5 km",
      postedDate: "2024-01-14",
      minTrustScore: 600, // Added trust requirement
      location: "Mumbai", // Added location
      status: "open", // Changed from "available" to "open"
      isActive: true, // Added for skill visibility control
      // Add default performance stats
      views: 15,
      accepts: 2,
      completions: 1,
    },
    {
      id: "4",
      title: "Photography for Event",
      postedBy: "You",
      category: "Photography",
      estimatedTime: "4h",
      piRewardMin: 8,
      piRewardMax: 12,
      distance: "4.2 km",
      postedDate: "2024-01-14",
      minTrustScore: 700, // Added trust requirement
      location: "Mumbai", // Added location
      status: "open", // Changed from "available" to "open"
      isActive: true, // Added for skill visibility control
      // Add default performance stats
      views: 30,
      accepts: 4,
      completions: 3,
    },
    {
      id: "5",
      title: "Math Tutoring for Class 10",
      postedBy: "You",
      category: "Teaching",
      estimatedTime: "1h",
      piRewardMin: 3,
      piRewardMax: 5,
      distance: "1.2 km",
      postedDate: "2024-01-13",
      minTrustScore: 550, // Added trust requirement
      location: "Mumbai", // Added location
      status: "open", // Changed from "available" to "open"
      isActive: true, // Added for skill visibility control
      // Add default performance stats
      views: 20,
      accepts: 1,
      completions: 0,
    },
  ])

  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([
    {
      id: "1",
      requestedBy: "Priya S.",
      userName: "Priya S.", // Added for notification message
      piAmount: 15, // Added for notification message
      amount: 15,
      reason: "Medicine for mother",
      status: "active",
      requestDate: "2024-01-15",
      location: "Mumbai",
      requester: "Priya S.", // Added for help section clarity
      timeAgo: "1h ago", // Added for display
    },
    {
      id: "2",
      requestedBy: "Raj K.",
      userName: "Raj K.", // Added for notification message
      piAmount: 25, // Added for notification message
      amount: 25,
      reason: "Urgent home repair",
      status: "active",
      requestDate: "2024-01-14",
      location: "Mumbai",
      requester: "Raj K.", // Added for help section clarity
      timeAgo: "5h ago", // Added for display
    },
  ])

  const [helpAmount, setHelpAmount] = useState<number>(0) // Changed initial state to number 0
  const [helpReason, setHelpReason] = useState("")

  const calculateTrustScore = () => {
    const activityScore = trustActivities.reduce((sum, activity) => sum + activity.points, 0)
    return Math.min(
      Math.max(TRUST_SCORE_RULES.BASE_SCORE + activityScore, TRUST_SCORE_RULES.MIN_SCORE),
      TRUST_SCORE_RULES.MAX_SCORE,
    )
  }

  const getStatistics = () => {
    const completed = trustActivities.filter((a) => a.type === "task_completed").length
    const helpGiven = trustActivities.filter((a) => a.type === "help_given").length
    const violations = trustActivities.filter(
      (a) => a.type === "task_rejected" || a.type === "misuse" || a.type === "false_activity",
    ).length
    const piEarned = Math.floor(completed * 0.8 + helpGiven * 1.2)

    return { completed, helpGiven, violations, piEarned, totalActions: trustActivities.length }
  }

  // Removed the initial trustScore calculation from here as it's now a state
  const addTrustActivity = (activity: Omit<TrustActivity, "id" | "timestamp">) => {
    const newActivity: TrustActivity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    }
    setTrustActivities([newActivity, ...trustActivities])

    // Update the main trustScore state based on the activity
    const newScore = calculateTrustScore() // Recalculate score based on updated activities
    setTrustScore(newScore) // Update the state

    addNotification({
      type: "trust_change",
      message:
        activity.points > 0
          ? language === "en"
            ? `Your trust score increased by +${activity.points} for ${activity.description}`
            : `आपका विश्वास स्कोर +${activity.points} बढ़ा: ${activity.description}`
          : language === "en"
            ? `Your trust score decreased by ${activity.points} for ${activity.description}`
            : `आपका विश्वास स्कोर ${activity.points} घटा: ${activity.description}`,
      timestamp: new Date(),
      read: false,
      trustChange: activity.points,
    })

    // Track violations and apply locks
    if (activity.points < 0) {
      const newViolationCount = violations + 1
      setViolations(newViolationCount)

      // Apply temporary feature locks based on violation count
      if (newViolationCount >= 3 && newViolationCount < 5) {
        // 3-4 violations: Lock Request Help for 24 hours
        setFeatureLocks((prev) => ({ ...prev, requestHelp: true }))
        const expiry = Date.now() + 24 * 60 * 60 * 1000
        setLockExpiry(expiry)
        alert(
          language === "en"
            ? "Warning: 3 violations detected. Request Help feature locked for 24 hours."
            : "चेतावनी: 3 उल्लंघन पाए गए। मदद का अनुरोध सुविधा 24 घंटे के लिए लॉक।",
        )
      } else if (newViolationCount >= 5 && newViolationCount < 7) {
        // 5-6 violations: Lock Post Skill and Request Help for 48 hours
        setFeatureLocks({ postSkill: true, requestHelp: true, acceptTasks: false })
        const expiry = Date.now() + 48 * 60 * 60 * 1000
        setLockExpiry(expiry)
        alert(
          language === "en"
            ? "Warning: 5 violations detected. Post Skill and Request Help locked for 48 hours."
            : "चेतावनी: 5 उल्लंघन पाए गए। स्किल पोस्ट और मदद अनुरोध 48 घंटे के लिए लॉक।",
        )
      } else if (newViolationCount >= 7) {
        // 7+ violations: Lock all features for 72 hours
        setFeatureLocks({ postSkill: true, requestHelp: true, acceptTasks: true })
        const expiry = Date.now() + 72 * 60 * 60 * 1000
        setLockExpiry(expiry)
        alert(
          language === "en"
            ? "Critical: 7+ violations. All features locked for 72 hours."
            : "गंभीर: 7+ उल्लंघन। सभी सुविधाएं 72 घंटे के लिए लॉक।",
        )
      }
    }
  }

  const completeTask = (taskName: string) => {
    addTrustActivity({
      type: "task_completed",
      points: TRUST_SCORE_RULES.INCREASES.TASK_COMPLETED,
      description: taskName,
    })
  }

  const giveHelp = (recipientName: string) => {
    addTrustActivity({
      type: "help_given",
      points: TRUST_SCORE_RULES.INCREASES.HELP_GIVEN,
      description: `Emergency support to ${recipientName}`,
    })
  }

  // Updated rejectTask to use frozen rule
  const rejectTask = (reason: string) => {
    addTrustActivity({
      type: "task_rejected",
      points: TRUST_SCORE_RULES.DECREASES.TASK_REJECTED,
      description: reason,
    })
  }

  const reportMisuse = (description: string) => {
    addTrustActivity({
      type: "misuse",
      points: TRUST_SCORE_RULES.DECREASES.MISUSE_REPORTED,
      description,
    })
  }

  const reportFalseActivity = (description: string) => {
    addTrustActivity({
      type: "false_activity",
      points: TRUST_SCORE_RULES.DECREASES.FALSE_ACTIVITY,
      description,
    })
  }

  const isFeatureLocked = (feature: keyof typeof featureLocks): boolean => {
    if (lockExpiry && Date.now() >= lockExpiry) {
      // Unlock all features if lock expired
      setFeatureLocks({ postSkill: false, requestHelp: false, acceptTasks: false })
      setLockExpiry(null)
      return false
    }
    return featureLocks[feature]
  }

  const getWarningStatus = () => {
    if (violations === 0) return null
    if (violations >= 7) {
      return {
        level: "critical",
        message:
          language === "en" ? "All features locked due to repeated violations" : "बार-बार उल्लंघन के कारण सभी सुविधाएं लॉक",
      }
    }
    if (violations >= 5) {
      return {
        level: "severe",
        message: language === "en" ? "2 more violations will lock all features" : "2 और उल्लंघन सभी सुविधाएं लॉक कर देंगे",
      }
    }
    if (violations >= 3) {
      return {
        level: "warning",
        message: language === "en" ? "2 more violations will increase restrictions" : "2 और उल्लंघन प्रतिबंध बढ़ाएंगे",
      }
    }
    if (violations >= 2) {
      return {
        level: "caution",
        message:
          language === "en" ? "1 more violation will trigger feature restrictions" : "1 और उल्लंघन प्रतिबंध लागू करेगा",
      }
    }
    return null
  }

  const getAccountAgeInDays = () => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - accountCreatedDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getMaxPiForNewUsers = (currentTrustScore: number) => {
    // Added currentTrustScore parameter
    const accountAge = getAccountAgeInDays()
    // New users (less than 7 days) with low trust cannot post high rewards
    if (accountAge < 7) {
      if (currentTrustScore < 600) return 5
      if (currentTrustScore < 700) return 10
      return 15
    }

    // Users 7-30 days old with moderate restrictions
    if (accountAge < 30) {
      if (currentTrustScore < 700) return 20
      return 35
    }

    // Established users (30+ days) - no restriction
    return 100
  }

  const detectDuplicateActivity = (activityType: "postSkill" | "requestHelp" | "acceptTask"): boolean => {
    const lastActivity = lastActivityTimestamps[activityType]
    const now = Date.now()

    // Prevent duplicate activities within cooldown periods
    const cooldownPeriods = {
      postSkill: 5 * 60 * 1000, // 5 minutes
      requestHelp: 60 * 60 * 1000, // 1 hour
      acceptTask: 2 * 60 * 1000, // 2 minutes
    }

    if (lastActivity && now - lastActivity < cooldownPeriods[activityType]) {
      return true // Duplicate detected
    }

    return false
  }

  const updateActivityTimestamp = (activityType: "postSkill" | "requestHelp" | "acceptTask") => {
    setLastActivityTimestamps((prev) => ({
      ...prev,
      [activityType]: Date.now(),
    }))
  }

  const blockFakeActivity = (description: string) => {
    reportFalseActivity(description)
    alert(
      language === "en"
        ? "Suspicious activity detected. Your trust score has been reduced."
        : "संदिग्ध गतिविधि का पता चला। आपका विश्वास स्कोर कम कर दिया गया है।",
    )
  }

  // Helper functions to define daily and weekly limits based on trust score
  const getDailyLimits = (score: number) => {
    if (score < 500) return { tasksPosts: 1, tasksAccept: 2, helpRequests: 1 }
    if (score < 650) return { tasksPosts: 2, tasksAccept: 4, helpRequests: 2 }
    if (score < 800) return { tasksPosts: 3, tasksAccept: 6, helpRequests: 3 }
    return { tasksPosts: 5, tasksAccept: 10, helpRequests: 4 }
  }

  const getWeeklyLimits = (score: number) => {
    if (score < 500) return { tasksPosts: 5, tasksAccept: 10, helpRequests: 3 }
    if (score < 650) return { tasksPosts: 10, tasksAccept: 20, helpRequests: 7 }
    if (score < 800) return { tasksPosts: 15, tasksAccept: 35, helpRequests: 12 }
    return { tasksPosts: 25, tasksAccept: 50, helpRequests: 20 }
  }

  const getMonthlyLimits = (score: number) => {
    if (score < 500) return { helpRequests: 10 }
    if (score < 650) return { helpRequests: 25 }
    if (score < 800) return { helpRequests: 45 }
    return { helpRequests: 75 }
  }

  // Define the return type for getUsageLimits
  type UsageLimits = {
    dailyPostLimit: number
    dailyAcceptLimit: number
    dailyHelpLimit: number
    weeklyPostLimit: number
    weeklyAcceptLimit: number
    weeklyHelpLimit: number
  }

  // This function seems to be intended to consolidate the limits, but it's not directly used elsewhere.
  // We'll keep it for now as it was present in the original code, but it could be refactored.
  const getUsageLimits = (): UsageLimits => {
    const daily = getDailyLimits(trustScore)
    const weekly = getWeeklyLimits(trustScore)
    return {
      dailyPostLimit: daily.tasksPosts,
      dailyAcceptLimit: daily.tasksAccept,
      dailyHelpLimit: daily.helpRequests,
      weeklyPostLimit: weekly.tasksPosts,
      weeklyAcceptLimit: weekly.tasksAccept,
      weeklyHelpLimit: weekly.helpRequests,
    }
  }

  // Updated checkDailyLimit and checkWeeklyLimit to use new limits structure and provide more context
  const checkDailyLimit = (action: "post" | "accept" | "help", limits: UsageLimits) => {
    if (action === "post" && usageTracking.dailyTasksPosted >= limits.dailyPostLimit) return false
    if (action === "accept" && usageTracking.dailyTasksAccepted >= limits.dailyAcceptLimit) return false
    if (action === "help" && usageTracking.dailyHelpRequests >= limits.dailyHelpLimit) return false
    return true
  }

  const checkWeeklyLimit = (action: "post" | "accept" | "help", limits: UsageLimits) => {
    if (action === "post" && usageTracking.weeklyTasksPosted >= limits.weeklyPostLimit) return false
    if (action === "accept" && usageTracking.weeklyTasksAccepted >= limits.weeklyAcceptLimit) return false
    if (action === "help" && usageTracking.weeklyHelpRequests >= limits.weeklyHelpLimit) return false
    return true
  }

  const resetDailyUsageIfNeeded = () => {
    const today = new Date().toISOString().split("T")[0]
    if (usageTracking.lastResetDate !== today) {
      setUsageTracking((prev) => ({
        ...prev,
        dailyTasksPosted: 0,
        dailyTasksAccepted: 0,
        dailyHelpRequests: 0,
        lastResetDate: today,
      }))
    }
  }

  const resetWeeklyUsageIfNeeded = () => {
    const today = new Date()
    const lastReset = new Date(usageTracking.lastWeeklyResetDate)
    const daysSinceReset = Math.floor((today.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceReset >= 7) {
      setUsageTracking((prev) => ({
        ...prev,
        weeklyTasksPosted: 0,
        weeklyTasksAccepted: 0,
        weeklyHelpRequests: 0,
        lastWeeklyResetDate: today.toISOString().split("T")[0],
      }))
    }
  }

  const resetMonthlyUsageIfNeeded = () => {
    const now = new Date()
    const lastReset = new Date(usageTracking.lastMonthlyResetDate)

    // Check if we're in a different month
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      setUsageTracking((prev) => ({
        ...prev,
        monthlyHelpRequests: 0,
        lastMonthlyResetDate: now.toISOString().split("T")[0],
      }))
    }
  }

  const checkUsageLimits = (actionType: "postTask" | "acceptTask" | "requestHelp"): boolean => {
    resetDailyUsageIfNeeded()
    resetWeeklyUsageIfNeeded()
    resetMonthlyUsageIfNeeded()

    const dailyLimits = getDailyLimits(trustScore)
    const weeklyLimits = getWeeklyLimits(trustScore)
    const monthlyLimits = getMonthlyLimits(trustScore)

    if (actionType === "postTask") {
      if (usageTracking.dailyTasksPosted >= dailyLimits.tasksPosts) {
        alert(
          language === "en"
            ? `Daily limit reached. You can post ${dailyLimits.tasksPosts} tasks per day with your current trust score (${trustScore}).`
            : `दैनिक सीमा पूरी हो गई। आप अपने वर्तमान विश्वास स्कोर (${trustScore}) के साथ प्रति दिन ${dailyLimits.tasksPosts} कार्य पोस्ट कर सकते हैं।`,
        )
        return false
      }
      if (usageTracking.weeklyTasksPosted >= weeklyLimits.tasksPosts) {
        alert(
          language === "en"
            ? `Weekly limit reached. You can post ${weeklyLimits.tasksPosts} tasks per week with your current trust score (${trustScore}).`
            : `साप्ताहिक सीमा पूरी हो गई। आप अपने वर्तमान विश्वास स्कोर (${trustScore}) के साथ प्रति सप्ताह ${weeklyLimits.tasksPosts} कार्य पोस्ट कर सकते हैं।`,
        )
        return false
      }
    } else if (actionType === "acceptTask") {
      if (usageTracking.dailyTasksAccepted >= dailyLimits.tasksAccept) {
        alert(
          language === "en"
            ? `Daily limit reached. You can accept ${dailyLimits.tasksAccept} tasks per day with your current trust score (${trustScore}).`
            : ` दैनिक सीमा पूरी हो गई। आप अपने वर्तमान विश्वास स्कोर (${trustScore}) के साथ प्रति दिन ${dailyLimits.tasksAccept} कार्य स्वीकार कर सकते हैं।`,
        )
        return false
      }
      if (usageTracking.weeklyTasksAccepted >= weeklyLimits.tasksAccept) {
        alert(
          language === "en"
            ? `Weekly limit reached. You can accept ${weeklyLimits.tasksAccept} tasks per week with your current trust score (${trustScore}).`
            : `साप्ताहिक सीमा पूरी हो गई। आप अपने वर्तमान विश्वास स्कोर (${trustScore}) के साथ प्रति सप्ताह ${weeklyLimits.tasksAccept} कार्य स्वीकार कर सकते हैं।`,
        )
        return false
      }
    } else if (actionType === "requestHelp") {
      if (usageTracking.dailyHelpRequests >= dailyLimits.helpRequests) {
        alert(
          language === "en"
            ? `Daily limit reached. You can request help ${dailyLimits.helpRequests} times per day with your current trust score (${trustScore}).`
            : ` दैनिक सीमा पूरी हो गई। आप अपने वर्तमान विश्वास स्कोर (${trustScore}) के साथ प्रति दिन ${dailyLimits.helpRequests} बार मदद का अनुरोध कर सकते हैं।`,
        )
        return false
      }
      if (usageTracking.weeklyHelpRequests >= weeklyLimits.helpRequests) {
        alert(
          language === "en"
            ? `Weekly limit reached. You can request help ${weeklyLimits.helpRequests} times per week with your current trust score (${trustScore}).`
            : `साप्ताहिक सीमा पूरी हो गई। आप अपने वर्तमान विश्वास स्कोर (${trustScore}) के साथ प्रति सप्ताह ${weeklyLimits.helpRequests} बार मदद का अनुरोध कर सकते हैं।`,
        )
        return false
      }
      if (usageTracking.monthlyHelpRequests >= monthlyLimits.helpRequests) {
        alert(
          language === "en"
            ? `Monthly limit reached. You can request help ${monthlyLimits.helpRequests} times per month with your current trust score (${trustScore}).`
            : `मासिक सीमा पूरी हो गई। आप अपने वर्तमान विश्वास स्कोर (${trustScore}) के साथ प्रति माह ${monthlyLimits.helpRequests} बार मदद का अनुरोध कर सकते हैं।`,
        )
        return false
      }
    }

    return true
  }

  const incrementUsage = (actionType: "postTask" | "acceptTask" | "requestHelp") => {
    setUsageTracking((prev) => {
      if (actionType === "postTask") {
        return {
          ...prev,
          dailyTasksPosted: prev.dailyTasksPosted + 1,
          weeklyTasksPosted: prev.weeklyTasksPosted + 1,
        }
      } else if (actionType === "acceptTask") {
        return {
          ...prev,
          dailyTasksAccepted: prev.dailyTasksAccepted + 1,
          weeklyTasksAccepted: prev.weeklyTasksAccepted + 1,
        }
      } else if (actionType === "requestHelp") {
        return {
          ...prev,
          dailyHelpRequests: prev.dailyHelpRequests + 1,
          weeklyHelpRequests: prev.weeklyHelpRequests + 1,
          monthlyHelpRequests: prev.monthlyHelpRequests + 1,
        }
      }
      return prev
    })
  }

  const checkBetaAccess = (): boolean => {
    if (!isBetaMode) return true

    if (!betaUser.isApproved) {
      alert(
        language === "en"
          ? "Beta Access Pending: Your account is awaiting approval. Please check back later."
          : "बीटा एक्सेस लंबित: आपका खाता अनुमोदन की प्रतीक्षा में है। कृपया बाद में वापस जांचें।",
      )
      return false
    }

    if (!allowedLocations.includes(userLocation?.city || "")) {
      // Check if userLocation is not null and its city is included
      alert(
        language === "en"
          ? `Beta Testing Limited: Currently available only in ${allowedLocations.join(", ")}. Your location: ${userLocation?.city || "Unknown"}`
          : `बीटा परीक्षण सीमित: वर्तमान में केवल ${allowedLocations.join(", ")} में उपलब्ध। आपका स्थान: ${userLocation?.city || "Unknown"}`,
      )
      return false
    }

    return true
  }

  // Added helper to get time until lock expiry
  const getTimeUntilUnlock = (): string => {
    if (!lockExpiry) return ""
    const now = Date.now()
    const diffSeconds = Math.max(0, lockExpiry - now) / 1000
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const remainingMinutes = diffMinutes % 60
    const remainingHours = diffHours % 24
    const remainingDays = Math.floor(diffHours / 24)

    const parts = []
    if (remainingDays > 0) parts.push(`${remainingDays}d`)
    if (remainingHours > 0) parts.push(`${remainingHours}h`)
    if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`)
    if (parts.length === 0) return "soon"

    return parts.join(" ")
  }

  const handlePostSkill = () => {
    if (!checkBetaAccess()) return

    if (!isKYCVerified) {
      alert(
        language === "en"
          ? "KYC Required: Please complete Pi KYC verification to post skills. One Pi KYC = One Real Human."
          : "KYC आवश्यक: स्किल पोस्ट करने के लिए कृपया Pi KYC सत्यापन पूरा करें। एक Pi KYC = एक असली मानव।",
      )
      return
    }

    if (isFeatureLocked("postSkill")) {
      alert(
        language === "en"
          ? `Post Skill feature is temporarily locked due to violations. Unlocks in ${getTimeUntilUnlock()}.`
          : `उल्लंघन के कारण स्किल पोस्ट सुविधा अस्थायी रूप से लॉक है। ${getTimeUntilUnlock()} में अनलॉक होगा।`,
      )
      return
    }

    // Check usage limits
    const limits = getUsageLimits()
    if (!checkDailyLimit("post", limits)) {
      alert(
        language === "en"
          ? `Daily limit reached: ${limits.dailyPostLimit} tasks per day. Resets tomorrow.`
          : `दैनिक सीमा पूर्ण: ${limits.dailyPostLimit} कार्य प्रति दिन। कल रीसेट होगा।`,
      )
      return
    }

    if (!checkWeeklyLimit("post", limits)) {
      alert(
        language === "en"
          ? `Weekly limit reached: ${limits.weeklyPostLimit} tasks per week.`
          : `साप्ताहिक सीमा पूर्ण: ${limits.weeklyPostLimit} कार्य प्रति सप्ताह।`,
      )
      return
    }

    if (detectDuplicateActivity("postSkill")) {
      alert(
        language === "en"
          ? "Duplicate Activity Blocked: Please wait 5 minutes between posting skills to prevent abuse."
          : "डुप्लिकेट गतिविधि अवरुद्ध: दुरुपयोग को रोकने के लिए कृपया स्किल पोस्ट करने के बीच 5 मिनट प्रतीक्षा करें।",
      )
      addTrustActivity({
        type: "false_activity",
        points: -10,
        description: "Attempted duplicate skill posting",
      })
      return
    }

    if (detectAbnormalActivity("post_skill")) {
      alert(
        language === "en"
          ? "Suspicious Activity: Excessive posting detected. Please slow down."
          : "संदिग्ध गतिविधि: अत्यधिक पोस्टिंग का पता चला। कृपया धीमा करें।",
      )
      return
    }

    autoCheckActivityPattern("current_user", "post_skill")

    logActivity("post_skill", "User opened post skill modal", "normal")
    collectFeedback("ui", "User initiated skill posting", "post_skill_modal_opened")
    setShowPostSkillModal(true)
  }

  const handleSubmitSkill = () => {
    if (!isKYCVerified) {
      alert(
        language === "en"
          ? "Please complete Pi KYC verification to post skills. 1 Pi KYC = 1 Real Human."
          : "कृपया स्किल पोस्ट करने के लिए Pi KYC सत्यापन पूरा करें। 1 Pi KYC = 1 असली मानव।",
      )
      return
    }

    if (detectDuplicateActivity("postSkill")) {
      blockFakeActivity("Duplicate skill post attempt")
      return
    }

    if (isFeatureLocked("postSkill")) {
      alert(
        language === "en"
          ? "Post Skill feature is temporarily locked due to violations"
          : "उल्लंघन के कारण स्किल पोस्ट सुविधा अस्थायी रूप से लॉक है",
      )
      return
    }

    if (!checkUsageLimits("postTask")) {
      return
    }

    if (!skillForm.title || !skillForm.category) {
      alert(language === "en" ? "Please fill all required fields" : "कृपया सभी आवश्यक फ़ील्ड भरें")
      return
    }

    const newSkill: Skill = {
      id: Date.now().toString(),
      title: skillForm.title,
      postedBy: "You",
      category: skillForm.category,
      estimatedTime: "Flexible", // Default value
      piRewardMin: 5, // Default minimum reward
      piRewardMax: 20, // Default maximum reward
      distance: "0.0 km",
      location: userLocation?.city || "Unknown",
      minTrustScore: 500,
      status: "open",
      postedDate: new Date().toISOString().split("T")[0],
      isActive: true,
      views: 0,
      accepts: 0,
      completions: 0,
      isPaused: false,
      description: skillForm.description,
    }

    setPostedSkills([newSkill, ...postedSkills])
    setSkillForm({ title: "", category: "", description: "" })
    setShowPostSkillModal(false)

    updateActivityTimestamp("postSkill")

    incrementUsage("postTask")

    addNotification({
      type: "task_request",
      title: "Skill Posted",
      message: `Your skill "${newSkill.title}" has been posted and is now visible to nearby users.`,
      timestamp: new Date(),
      read: false,
    })

    logActivity("post_skill", `Skill posted: ${skillForm.title} | Category: ${skillForm.category}`, "normal")
    collectFeedback("feature", `Skill posted successfully in category: ${skillForm.category}`, "skill_submitted")

    alert(
      language === "en"
        ? `Skill "${skillForm.title}" posted successfully!`
        : `स्किल "${skillForm.title}" सफलतापूर्वक पोस्ट की गई!`,
    )
  }

  const handleAcceptTask = (task: Skill) => {
    if (!checkBetaAccess()) return

    // Added task parameter
    if (!task) return // Added check for task

    if (!isKYCVerified) {
      alert(
        language === "en"
          ? "Please complete Pi KYC verification to accept tasks. 1 Pi KYC = 1 Real Human."
          : "कृपया कार्य स्वीकार करने के लिए Pi KYC सत्यापन पूरा करें। 1 Pi KYC = 1 असली मानव।",
      )
      return
    }

    if (detectDuplicateActivity("acceptTask")) {
      blockFakeActivity("Rapid task acceptance detected")
      return
    }

    if (isFeatureLocked("acceptTasks")) {
      alert(
        language === "en"
          ? "Accept Tasks feature is temporarily locked due to violations"
          : "उल्लंघन के कारण कार्य स्वीकार करने की सुविधा अस्थायी रूप से लॉक है",
      )
      return
    }

    if (!checkUsageLimits("acceptTask")) {
      return
    }

    if (trustScore < task.minTrustScore) {
      // Changed from selectedTask to task
      alert(
        language === "en"
          ? `Your trust score (${trustScore}) does not meet the minimum requirement (${task.minTrustScore})` // Changed from selectedTask to task
          : `आपका विश्वास स्कोर (${trustScore}) न्यूनतम आवश्यकता (${task.minTrustScore}) को पूरा नहीं करता`, // Changed from selectedTask to task
      )
      return
    }

    if (detectAbnormalActivity("accept_task")) {
      alert(
        language === "en"
          ? "Suspicious Pattern: Low completion rate detected. Complete existing tasks first."
          : "संदिग्ध पैटर्न: कम पूर्णता दर का पता चला। पहले मौजूदा कार्य पूरे करें।",
      )
      return
    }

    autoCheckActivityPattern("current_user", "accept_task")

    logActivity("accept_task", `Task accepted: ${task.title}`, "normal")
    collectFeedback("feature", "User accepted a task successfully", "task_accepted")

    const updatedTask: Skill = {
      ...task,
      status: "in_progress",
      acceptedBy: "You",
      acceptedDate: new Date().toISOString().split("T")[0],
      acceptedAt: new Date().toISOString(), // Added for accepted tasks
      // Increment accepts count
      accepts: (task.accepts || 0) + 1,
    } // Changed from selectedTask to task
    setAcceptedTasks([...acceptedTasks, updatedTask]) // Simplified update logic
    setPostedSkills(postedSkills.map((s) => (s.id === task.id ? updatedTask : s))) // Changed from selectedTask to task

    updateActivityTimestamp("acceptTask")

    incrementUsage("acceptTask")

    addNotification({
      type: "task_accepted",
      title: "Task Accepted", // Added title
      message:
        language === "en"
          ? `You accepted "${task.title}". Work started!` // Changed from selectedTask to task
          : `आपने "${task.title}" स्वीकार किया। कार्य शुरू हुआ!`, // Changed from selectedTask to task
      timestamp: new Date(),
      read: false,
      relatedTaskId: Number(task.id),
    })

    setSelectedTask(null) // Close task details modal
    setShowTaskDetail(false) // Close task details modal
  }

  const handleMarkComplete = (task: Skill) => {
    const updatedTask: Skill = {
      ...task,
      status: "completed",
      completedDate: new Date().toISOString().split("T")[0],
    }

    setAcceptedTasks(acceptedTasks.map((t) => (t.id === task.id ? updatedTask : t)))
    setPostedSkills(postedSkills.map((s) => (s.id === task.id ? updatedTask : s)))

    alert(
      language === "en"
        ? `Task marked complete! Waiting for ${task.postedBy} to confirm.`
        : `कार्य पूर्ण के रूप में चिह्नित! ${task.postedBy} की पुष्टि की प्रतीक्षा में।`,
    )
  }

  const handleConfirmTask = (task: Skill, finalPiReward: number) => {
    // Update task status to confirmed
    const updatedTask: Skill = {
      ...task,
      status: "confirmed", // Changed from "completed" to "confirmed" for clarity
      finalPiReward: finalPiReward, // Ensure finalPiReward is set
      // Increment completions count
      completions: (task.completions || 0) + 1,
    }

    setPostedSkills(postedSkills.map((s) => (s.id === task.id ? updatedTask : s)))
    setAcceptedTasks(acceptedTasks.filter((t) => t.id !== task.id))

    // Add trust activity for task completion using frozen rule
    addTrustActivity({
      type: "task_completed",
      points: TRUST_SCORE_RULES.INCREASES.TASK_COMPLETED,
      description: `Completed: ${task.title} (+${finalPiReward} Pi)`,
    })

    // Add notification for task completion
    addNotification({
      type: "task_completed",
      title: "Task Completed",
      message:
        language === "en"
          ? `Your task "${task.title}" has been confirmed! You earned ${finalPiReward} Pi.`
          : `आपका कार्य "${task.title}" पुष्टि हो गया है! आपने ${finalPiReward} Pi कमाए।`,
      timestamp: new Date(),
      read: false,
      relatedTaskId: Number(task.id),
    })

    // Show feedback modal
    setShowFeedbackModal(updatedTask)
    setConfirmTaskModal(null)
  }

  const handleRejectTask = (task: Skill) => {
    // Reject task completion, reduce trust score using frozen rule
    addTrustActivity({
      type: "task_rejected",
      points: TRUST_SCORE_RULES.DECREASES.TASK_REJECTED,
      description: `Rejected: ${task.title}`,
    })

    // Notify worker about rejection
    addNotification({
      type: "help_received", // This type seems incorrect for task rejection. Consider a new type or use task_request
      title: language === "en" ? "Task Rejected" : "कार्य अस्वीकृत",
      message:
        language === "en"
          ? `Your completion of "${task.title}" was rejected. Trust score reduced.`
          : `आपका "${task.title}" पूर्णता अस्वीकृत कर दिया गया। विश्वास स्कोर कम किया गया।`,
      timestamp: new Date(),
      read: false,
      relatedTaskId: Number(task.id),
    })

    alert(
      language === "en"
        ? "Task completion rejected. Worker's trust score reduced."
        : "कार्य पूर्णता अस्वीकृत। कार्यकर्ता का विश्वास स्कोर कम किया गया।",
    )
    setConfirmTaskModal(null)
  }

  const handleTaskFeedback = (task: Skill, feedback: "good" | "neutral" | "issue") => {
    // Update feedback on the task
    const updatedTask: Skill = {
      ...task,
      feedback: feedback,
    }

    setPostedSkills(postedSkills.map((s) => (s.id === task.id ? updatedTask : s)))

    // Apply trust score changes based on feedback using frozen rules
    if (feedback === "good") {
      addTrustActivity({
        type: "task_completed", // Should this be positive_feedback?
        points: TRUST_SCORE_RULES.INCREASES.POSITIVE_FEEDBACK,
        description: `Positive feedback: ${task.title}`,
      })
      addNotification({
        type: "task_completed", // Consider a more specific type
        title: "Task Completed",
        message: `Great job! You received positive feedback for "${task.title}".`,
        timestamp: new Date(),
        read: false,
        relatedTaskId: Number(task.id),
      })
    } else if (feedback === "issue") {
      addTrustActivity({
        type: "issue_feedback", // Use issue_feedback type
        points: TRUST_SCORE_RULES.DECREASES.ISSUE_FEEDBACK,
        description: `Issue reported: ${task.title}`,
      })
      addNotification({
        type: "task_completed", // Consider a more specific type like 'task_issue'
        title: "Issue Reported",
        message: `A problem was reported with your task "${task.title}". Your trust score may be affected.`,
        timestamp: new Date(),
        read: false,
        relatedTaskId: Number(task.id),
      })
    }
    // neutral has no effect on trust score

    alert(
      language === "en"
        ? `Feedback submitted: ${feedback}. Trust score ${feedback === "good" ? "increased" : feedback === "issue" ? "decreased" : "unchanged"}.`
        : `फीडबैक सबमिट किया: ${feedback}। विश्वास स्कोर ${feedback === "good" ? "बढ़ाया" : feedback === "issue" ? "घटाया" : "अपरिवर्तित"}।`,
    )
    setShowFeedbackModal(null)
  }

  // Filtered skills logic moved to within the JSX where it's used
  // const filteredSkills =
  //   selectedCategory === "all" ? postedSkills : postedSkills.filter((skill) => skill.category === selectedCategory)

  // The trustScore is now a state variable, no need to recalculate here.
  // const trustScore = calculateTrustScore()
  const stats = getStatistics()

  // REMOVED DUPLICATE getMaxPiForNewUsers FUNCTION DECLARATION

  const getMaxPiPerRequest = () => {
    // This function determines the maximum Pi a user can request for help
    // based on their trust score. It mirrors the logic for reward limits.
    if (trustScore >= 800) return 50
    if (trustScore >= 700) return 35
    if (trustScore >= 600) return 20
    if (trustScore >= 500) return 10
    return 5
  }

  const handleRequestHelp = () => {
    if (!checkBetaAccess()) return

    if (detectAbnormalActivity("help_request")) {
      alert(
        language === "en"
          ? "Request Limit: You have requested help multiple times recently. Please wait before requesting again."
          : "अनुरोध सीमा: आपने हाल ही में कई बार मदद का अनुरोध किया है। कृपया फिर से अनुरोध करने से पहले प्रतीक्षा करें।",
      )
      return
    }

    autoCheckActivityPattern("current_user", "help_request")

    logActivity("help_request", "User opened help request modal", "normal")
    collectFeedback("feature", "User initiated help request", "help_modal_opened")
    setShowRequestHelpModal(true) // Changed to show the modal
  }

  // Renamed handleHelpApproval to handleApproveHelp and adjusted logic
  const handleApproveHelp = (requestId: string) => {
    const request = helpRequests.find((req) => req.id === requestId)
    if (!request) return

    // Find the user who requested help and update their status
    const updatedRequests = helpRequests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: "approved", // Changed status to approved
          helper: betaUser.userId, // Set the helper to the current user
        }
      }
      return req
    })
    setHelpRequests(updatedRequests)

    // Add trust activity for helping someone
    addTrustActivity({
      type: "help_given",
      points: TRUST_SCORE_RULES.INCREASES.HELP_GIVEN,
      description: `Emergency support to ${request.reason}`,
    })

    // Add notification for help approval
    addNotification({
      type: "help_approved",
      title: language === "en" ? "Help Approved" : "सहायता स्वीकृत",
      message:
        language === "en"
          ? `Your request for ${request.amount} Pi has been approved. Helper: ${betaUser.userId}.`
          : `${request.amount} Pi के लिए आपके अनुरोध को मंजूरी दे दी गई है। सहायक: ${betaUser.userId}.`,
      timestamp: new Date(),
      read: false,
    })

    alert(
      language === "en"
        ? `You've approved help for ${request.requester}. Your trust score increased by ${TRUST_SCORE_RULES.INCREASES.HELP_GIVEN} points!`
        : `आपने ${request.requester} के लिए मदद स्वीकृत की। आपका विश्वास स्कोर ${TRUST_SCORE_RULES.INCREASES.HELP_GIVEN} अंक बढ़ा!`,
    )
  }

  const handleReportAbuse = (requestId: string) => {
    const request = helpRequests.find((r) => r.id === requestId)
    if (!request) return

    logActivity("abuse_report", `Help request reported: ${requestId} | Reason: Misuse`, "critical")

    // Mark the request as rejected/cancelled due to abuse
    setHelpRequests(
      helpRequests.map((r) =>
        r.id === requestId
          ? { ...r, status: "rejected" as "active" | "fulfilled" | "rejected" | "cancelled" | "pending" | "approved" }
          : r,
      ),
    )

    reportMisuse(`Fraudulent help request: ${request.reason}`) // Added specific report for misuse

    addNotification({
      type: "help_request", // Or a more specific type for rejection/misuse
      title: "Help Request Rejected",
      message: `Your help request was rejected due to misuse.`,
      timestamp: new Date(),
      read: false,
    })

    collectFeedback("bug", "User reported abuse on help request", `request_id: ${requestId}`)
    alert(
      language === "en"
        ? "Abuse reported. Request marked as rejected."
        : "दुरुपयोग की सूचना दी गई। अनुरोध अस्वीकृत के रूप में चिह्नित।",
    )
  }

  const handleFulfillHelp = (request: HelpRequest) => {
    setHelpRequests(helpRequests.map((req) => (req.id === request.id ? { ...req, status: "fulfilled" as const } : req)))
    giveHelp(request.requestedBy)
    addNotification({
      type: "help_approved",
      title: "Help Fulfilled",
      message: `You helped ${request.requestedBy} with ${request.amount} Pi.`,
      timestamp: new Date(),
      read: false,
    })
    alert(
      language === "en"
        ? `You helped ${request.requestedBy} with ${request.amount} Pi. Your trust score increased!`
        : `आपने ${request.requestedBy} को ${request.amount} Pi से मदद की। आपका विश्वास स्कोर बढ़ गया!`,
    )
  }

  const handleRejectHelp = (request: HelpRequest, isAbuse = false) => {
    setHelpRequests(helpRequests.map((req) => (req.id === request.id ? { ...req, status: "rejected" as const } : req)))
    if (isAbuse) {
      // This is now handled by handleReportAbuse
      // reportMisuse(`Fraudulent help request: ${request.reason}`)
      addNotification({
        type: "help_request", // Potentially use a different type for rejections or misuse
        title: "Help Request Rejected",
        message: `Your help request was rejected for misuse.`,
        timestamp: new Date(),
        read: false,
      })
      alert(
        language === "en"
          ? "Help request rejected for misuse. The requester's trust score has been reduced."
          : "दुरुपयोग के लिए मदद अनुरोध अस्वीकार कर दिया गया। अनुरोधकर्ता का विश्वास स्कोर कम कर दिया गया है।",
      )
    } else {
      addNotification({
        type: "help_request", // Potentially use a different type for rejections
        title: "Help Request Rejected",
        message: `Your help request was rejected.`,
        timestamp: new Date(),
        read: false,
      })
    }
  }

  const t = {
    en: {
      welcome: "Welcome to Unibic",
      trustScore: "Trust Score",
      excellent: "Excellent",
      good: "Good",
      building: "Building",
      new: "New",
      postSkill: "Post Skill",
      findWork: "Find Work",
      requestHelp: "Request Help",
      nearbyTasks: "Nearby Tasks",
      todaySummary: "Today's Summary",
      tasksCompleted: "Tasks Completed",
      helpGiven: "Help Given",
      piEarned: "Pi Earned",
      home: "Home",
      skills: "Skills",
      help: "Help",
      community: "Community",
      profile: "Profile",
      safetyRules: "Safety & Rules",
      logout: "Logout",
      skillTitle: "Skill Title",
      skillTitlePlaceholder: "e.g., Website Design Help",
      category: "Category",
      selectCategory: "Select category",
      estimatedTime: "Estimated Time",
      timePlaceholder: "e.g., 2h, 30min",
      piRewardRange: "Pi Reward Range",
      minReward: "Min",
      maxReward: "Max",
      cancel: "Cancel",
      postNow: "Post Now",
      filterByCategory: "Filter by category",
      all: "All",
      taskDetails: "Task Details",
      postedBy: "Posted by",
      distance: "Distance",
      minTrustRequired: "Min Trust Required",
      acceptTask: "Accept Task",
      closeDetails: "Close",
      yourTrustScore: "Your Trust Score",
      trustTooLow: "Trust score too low",
      requestHelpTitle: "Request Emergency Help",
      helpAmountLabel: "Amount Needed (Pi)",
      helpAmountPlaceholder: "Enter amount",
      helpReasonLabel: "Reason for Help",
      helpReasonPlaceholder: "Briefly explain your emergency...",
      maxAllowed: "Max allowed based on your trust",
      noInterest: "No interest • No deadline • No shame",
      submitRequest: "Submit Request",
      activeHelpRequests: "Active Help Requests",
      helpRequestsDesc: "Community members needing support",
      fulfill: "Fulfill",
      reportAbuse: "Report Abuse",
      piNeeded: "Pi needed",
      requestedOn: "Requested on",
      warningTitle: "Misuse Warning",
      featureLocked: "Feature Locked",
      unlockTime: "Unlocks in",
      hours: "hours",
      violationCount: "Total Violations",
      rulesTitle: "Community Rules",
      notifications: "Notifications",
      markAllRead: "Mark all read",
      tasksAwaitingConfirmation: "Tasks Awaiting Confirmation",
      completedBy: "Completed by",
      tapToConfirm: "Tap to confirm",
      recentActivity: "Recent Activity",
      noNewNotifications: "No new notifications",
      trustScoreIncreased: "Trust Score Increased",
      trustScoreDecreased: "Trust Score Decreased",
      taskCompleted: "Task Completed",
      helpRequestPosted: "Help Request Posted",
      helpRequestApproved: "Help Request Approved",
      taskAccepted: "Task Accepted",
      kycRequired: "Pi KYC verification required",
      accountAge: "Account Age",
      days: "days",
      maxRewardLimit: "Max Pi Reward Limit",
      buildTrustToUnlock: "Build trust to unlock higher rewards",
      cooldownActive: "Please wait before performing this action again",
      suspiciousActivity: "Suspicious activity detected",
      betaAccessPending: "Beta Access Pending",
      betaTestingLimited: "Beta Testing Limited",
      inviteCode: "Invite Code",
      location: "Location",
      betaTestMode: "Beta Test Mode",
      duplicateActivityBlocked: "Duplicate Activity Blocked",
      suspiciousPattern: "Suspicious Pattern",
      requestLimit: "Request Limit",
      kycRequiredAlert: "KYC Required",
      helpReceived: "Help Received",
      myPostedSkills: "My Posted Skills",
      browseByCategory: "Browse by Category",
      recentCommunityActivity: "Recent Community Activity",
      communityFeedback: "Community Feedback",
      systemUpdates: "System Updates",
      recentGovernanceActions: "Recent Governance Actions",
      myTasks: "My Tasks",
      members: "Members",
      tasksDone: "Tasks Done",
      edit: "Edit",
      pause: "Pause",
      activate: "Activate",
      stats: "Stats",
      skillStats: "Skill Performance",
      views: "Views",
      accepts: "Accepts",
      completions: "Completions",
      acceptanceRate: "Acceptance Rate",
      completionRate: "Completion Rate",
      editSkill: "Edit Skill",
      update: "Update",
      paused: "Paused",
      myHelpRequests: "My Help Requests",
      availableTasks: "Available Tasks",
      maxAllowedPerRequest: "Max allowed per request",
      communityRequests: "Community Requests",
      helpHistory: "Help History",
      shortDescription: "Short Description",
      descriptionPlaceholder: "Briefly describe your skill...",
    },
    hi: {
      welcome: "Unibic में आपका स्वागत है",
      trustScore: "ट्रस्ट स्कोर",
      excellent: "उत्कृष्ट",
      good: "अच्छा",
      building: "निर्माण",
      new: "नया",
      postSkill: "स्किल पोस्ट करें",
      findWork: "काम खोजें",
      requestHelp: "मदद मांगें",
      nearbyTasks: "आस-पास के कार्य",
      todaySummary: "आज का सारांश",
      tasksCompleted: "कार्य पूर्ण",
      helpGiven: "दी गई मदद",
      piEarned: "Pi अर्जित",
      home: "होम",
      skills: "कौशल",
      help: "मदद",
      community: "समुदाय",
      profile: "प्रोफ़ाइल",
      safetyRules: "सुरक्षा और नियम",
      logout: "लॉगआउट",
      skillTitle: "कौशल शीर्षक",
      skillTitlePlaceholder: "उदा., वेबसाइट डिज़ाइन सहायता",
      category: "श्रेणी",
      selectCategory: "श्रेणी चुनें",
      estimatedTime: "अनुमानित समय",
      timePlaceholder: "उदा., 2घं, 30मिन",
      piRewardRange: "Pi इनाम रेंज",
      minReward: "न्यूनतम",
      maxReward: "अधिकतम",
      cancel: "रद्द करें",
      postNow: "अभी पोस्ट करें",
      filterByCategory: "श्रेणी से फ़िल्टर करें",
      all: "सभी",
      taskDetails: "कार्य विवरण",
      postedBy: "द्वारा पोस्ट किया गया",
      distance: "दूरी",
      minTrustRequired: "न्यूनतम विश्वास आवश्यक",
      acceptTask: "कार्य स्वीकार करें",
      closeDetails: "बंद करें",
      yourTrustScore: "आपका विश्वास स्कोर",
      trustTooLow: "विश्वास स्कोर बहुत कम",
      requestHelpTitle: "आपातकालीन मदद का अनुरोध करें",
      helpAmountLabel: "आवश्यक राशि (Pi)",
      helpAmountPlaceholder: "राशि दर्ज करें",
      helpReasonLabel: "मदद का कारण",
      helpReasonPlaceholder: "संक्षेप में अपनी आपात स्थिति बताएं...",
      maxAllowed: "आपके विश्वास के आधार पर अधिकतम अनुमत",
      noInterest: "कोई ब्याज नहीं • कोई समय सीमा नहीं • कोई शर्म नहीं",
      submitRequest: "अनुरोध सबमिट करें",
      activeHelpRequests: "सक्रिय सहायता अनुरोध",
      helpRequestsDesc: "समुदाय के सदस्यों को सहायता की आवश्यकता है",
      fulfill: "पूरा करें",
      reportAbuse: "दुरुपयोग की रिपोर्ट करें",
      piNeeded: "Pi आवश्यक",
      requestedOn: "अनुरोध की तिथि",
      warningTitle: "दुरुपयोग चेतावनी",
      featureLocked: "सुविधा लॉक",
      unlockTime: "अनलॉक होगा",
      hours: "घंटे",
      violationCount: "कुल उल्लंघन",
      rulesTitle: "समुदाय नियम",
      notifications: "सूचनाएं",
      markAllRead: "सभी पढ़े",
      tasksAwaitingConfirmation: "पुष्टि की प्रतीक्षा में कार्य",
      completedBy: "द्वारा पूर्ण",
      tapToConfirm: "पुष्टि के लिए टैप करें",
      recentActivity: "हाल की गतिविधि",
      noNewNotifications: "अभी तक कोई सूचना नहीं",
      trustScoreIncreased: "ट्रस्ट स्कोर बढ़ा",
      trustScoreDecreased: "ट्रस्ट स्कोर घटा",
      taskCompleted: "कार्य पूर्ण",
      helpRequestPosted: "सहायता अनुरोध पोस्ट किया",
      helpRequestApproved: "सहायता अनुरोध स्वीकृत",
      taskAccepted: "कार्य स्वीकृत",
      kycRequired: "Pi KYC सत्यापन आवश्यक",
      accountAge: "खाता आयु",
      days: "दिन",
      maxRewardLimit: "अधिकतम Pi रिवॉर्ड सीमा",
      buildTrustToUnlock: "उच्च रिवॉर्ड अनलॉक करने के लिए विश्वास बनाएं",
      cooldownActive: "कृपया इस क्रिया को फिर से करने से पहले प्रतीक्षा करें",
      suspiciousActivity: "संदिग्ध गतिविधि का पता चला",
      betaAccessPending: "बीटा एक्सेस लंबित",
      betaTestingLimited: "बीटा परीक्षण सीमित",
      inviteCode: "आमंत्रण कोड",
      location: "स्थान",
      betaTestMode: "बीटा परीक्षण मोड",
      duplicateActivityBlocked: "डुप्लिकेट गतिविधि अवरुद्ध",
      suspiciousPattern: "संदिग्ध पैटर्न",
      requestLimit: "अनुरोध सीमा",
      kycRequiredAlert: "KYC आवश्यक",
      helpReceived: "सहायता प्राप्त",
      myPostedSkills: "मेरे पोस्ट किए गए कौशल",
      browseByCategory: "श्रेणी के अनुसार ब्राउज़ करें",
      recentCommunityActivity: "हाल की सामुदायिक गतिविधि",
      communityFeedback: "सामुदायिक प्रतिक्रिया",
      systemUpdates: "सिस्टम अपडेट",
      recentGovernanceActions: "हाल की शासन कार्रवाई",
      myTasks: "मेरे कार्य",
      members: "सदस्य",
      tasksDone: "कार्य पूर्ण",
      edit: "संपादित करें",
      pause: "रोकें",
      activate: "सक्रिय करें",
      stats: "आंकड़े",
      skillStats: "स्किल प्रदर्शन",
      views: "देखा गया",
      accepts: "स्वीकृत",
      completions: "पूर्ण",
      acceptanceRate: "स्वीकृति दर",
      completionRate: "पूर्णता दर",
      editSkill: "स्किल संपादित करें",
      update: "अपडेट करें",
      paused: "विराम",
      myHelpRequests: "मेरे सहायता अनुरोध",
      availableTasks: "उपलब्ध कार्य",
      maxAllowedPerRequest: "प्रति अनुरोध अधिकतम अनुमत",
      communityRequests: "सामुदायिक अनुरोध",
      helpHistory: "सहायता इतिहास",
      shortDescription: "संक्षिप्त विवरण",
      descriptionPlaceholder: "अपने कौशल का संक्षेप में वर्णन करें...",
    },
  }

  const content = t[language === "en" || language === "hi" ? language : "en"]

  const trustLevel =
    trustScore >= 700
      ? content.excellent
      : trustScore >= 400
        ? content.good
        : trustScore >= 200
          ? content.building
          : content.new
  const trustColor =
    trustScore >= 700
      ? "text-primary-green"
      : trustScore >= 400
        ? "text-secondary-teal"
        : trustScore >= 200
          ? "text-accent-amber"
          : "text-text-secondary"

  // Added notification badge for tasks needing confirmation
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "task_accepted",
      title: "Task Accepted",
      message: "Rajesh Kumar accepted your 'Logo Design' task",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      read: false,
      relatedTaskId: 2,
    },
    {
      id: 2,
      type: "trust_change",
      title: "Trust Score Increased",
      message: "Your trust score increased by +10 for completing a task",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      trustChange: 10,
    },
  ])

  const addNotification = (
    notification: Notification, // Changed to accept full notification object
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
      read: false, // Ensure new notifications are unread
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markNotificationRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const myPostedSkills = postedSkills.filter((s) => s.postedBy === "You")
  const tasksNeedingConfirmation = acceptedTasks.filter((t) => t.status === "completed")

  // The original declaration of filteredSkills here was redundant and likely the cause of the lint error.
  // It has been removed and the usage moved to the JSX where it's actually needed.

  const renderSafetyRules = () => {
    const dailyLimits = getDailyLimits(trustScore)
    const weeklyLimits = getWeeklyLimits(trustScore)
    const monthlyLimits = getMonthlyLimits(trustScore) // Get monthly limits

    return (
      <div className="space-y-3">
        {/* Usage Limits Section */}
        <div className="bg-white rounded-xl p-4 border border-[#E0E0E0]">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-[#00897B]" />
            <h4 className="font-semibold text-[#1F2933]">
              {language === "en" ? "Daily & Weekly Limits" : "दैनिक और साप्ताहिक सीमाएं"}
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-[#E0E0E0]">
              <span className="text-[#6B7280]">{language === "en" ? "Post Tasks" : "कार्य पोस्ट"}</span>
              <span className="text-[#1F2933] font-medium">
                {usageTracking.dailyTasksPosted}/{dailyLimits.tasksPosts} {language === "en" ? "daily" : "दैनिक"} •{" "}
                {usageTracking.weeklyTasksPosted}/{weeklyLimits.tasksPosts} {language === "en" ? "weekly" : "साप्ताहिक"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#E0E0E0]">
              <span className="text-[#6B7280]">{language === "en" ? "Accept Tasks" : "कार्य स्वीकार"}</span>
              <span className="text-[#1F2933] font-medium">
                {usageTracking.dailyTasksAccepted}/{dailyLimits.tasksAccept} {language === "en" ? "daily" : "दैनिक"} •{" "}
                {usageTracking.weeklyTasksAccepted}/{dailyLimits.tasksAccept}{" "}
                {language === "en" ? "weekly" : "साप्ताहिक"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#6B7280]">{language === "en" ? "Help Requests" : "मदद अनुरोध"}</span>
              <span className="text-[#1F2933] font-medium">
                {usageTracking.dailyHelpRequests}/{dailyLimits.helpRequests} {language === "en" ? "daily" : "दैनिक"} •{" "}
                {usageTracking.weeklyHelpRequests}/{weeklyLimits.helpRequests}{" "}
                {language === "en" ? "weekly" : "साप्ताहिक"} • {usageTracking.monthlyHelpRequests}/
                {monthlyLimits.helpRequests} {language === "en" ? "monthly" : "मासिक"}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mt-3 italic">
            {language === "en"
              ? "Build your trust score to unlock higher daily and weekly limits"
              : "उच्च दैनिक और साप्ताहिक सीमाएं अनलॉक करने के लिए अपना विश्वास स्कोर बनाएं"}
          </p>
        </div>

        {/* Existing violation warnings and rules */}
        {/* Warning Status */}
        {getWarningStatus() && (
          <div
            className={`p-3 rounded-lg border-l-4 ${
              getWarningStatus()!.level === "critical"
                ? "bg-accent-red/10 border-accent-red"
                : getWarningStatus()!.level === "severe"
                  ? "bg-accent-amber/20 border-accent-amber"
                  : "bg-accent-amber/10 border-accent-amber"
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  getWarningStatus()!.level === "critical" ? "text-accent-red" : "text-accent-amber"
                }`}
              />
              <div>
                <p
                  className={`text-xs font-semibold ${
                    getWarningStatus()!.level === "critical" ? "text-accent-red" : "text-accent-amber"
                  }`}
                >
                  {content.warningTitle}
                </p>
                <p className="text-xs text-text-secondary mt-1">{getWarningStatus()!.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-text-secondary">{content.violationCount}:</span>
                  <span
                    className={`text-xs font-bold ${
                      getWarningStatus()!.level === "critical" ? "text-accent-red" : "text-accent-amber"
                    }`}
                  >
                    {violations}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Lock Status */}
        {lockExpiry && Date.now() < lockExpiry && (
          <div className="p-3 rounded-lg bg-neutral-divider/50 border border-neutral-divider">
            <p className="text-xs font-semibold text-text-primary mb-2">{content.featureLocked}</p>
            <div className="space-y-1.5">
              {featureLocks.postSkill && (
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Lock className="w-3 h-3" />
                  <span>Post Skill</span>
                </div>
              )}
              {featureLocks.requestHelp && (
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Lock className="w-3 h-3" />
                  <span>Request Help</span>
                </div>
              )}
              {featureLocks.acceptTasks && (
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Lock className="w-3 h-3" />
                  <span>Accept Tasks</span>
                </div>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-2">
              {content.unlockTime}: {getTimeUntilUnlock()}
            </p>
          </div>
        )}

        {/* Community Rules */}
        <div>
          <p className="text-xs font-semibold text-text-primary mb-2">{content.rulesTitle}</p>
          <ul className="space-y-2 text-xs text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-primary-green mt-0.5 font-bold">•</span>
              <span>{content.onePiOneHuman}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-green mt-0.5 font-bold">•</span>
              <span>{content.trustFromActions}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-green mt-0.5 font-bold">•</span>
              <span>{content.noInstantRewards}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-green mt-0.5 font-bold">•</span>
              <span>{content.misuseLimit}</span>
            </li>
          </ul>
        </div>

        {/* Add governance transparency log */}
        {renderGovernanceLog()}

        <div className="mt-4 pt-3 border-t border-neutral-divider">
          <p className="text-xs font-semibold text-text-primary">
            {language === "en" ? "Report Suspicious Activity" : "संदिग्ध गतिविधि की रिपोर्ट करें"}
          </p>
          <p className="text-xs text-text-secondary mb-2">
            {language === "en"
              ? "Help keep Unibic safe. Report fake tasks, misuse, or guideline violations. Our automated system will review."
              : "Unibic को सुरक्षित रखने में मदद करें। नकली कार्य, दुरुपयोग, या दिशानिर्देश उल्लंघन की रिपोर्ट करें। हमारा स्वचालित सिस्टम समीक्षा करेगा।"}
          </p>
          <button
            onClick={() => {
              const reason = prompt(
                language === "en"
                  ? "Describe the issue (fake task, misuse, spam, etc.):"
                  : "समस्या का वर्णन करें (नकली कार्य, दुरुपयोग, स्पैम, आदि):",
              )
              if (reason) {
                flagSuspiciousActivity("task", "example_id", reason, "current_user") // Using placeholder for now
              }
            }}
            className="w-full px-3 py-2 rounded-lg bg-neutral-white border border-neutral-divider text-xs font-medium text-text-primary active:scale-95 transition-transform"
          >
            {language === "en" ? "🚩 Report Issue" : "🚩 समस्या रिपोर्ट करें"}
          </button>
        </div>
      </div>
    )
  }

  // Filtered skills logic moved to within the JSX where it's used
  // const filteredSkills =
  //   selectedCategory === "all" ? postedSkills : postedSkills.filter((skill) => skill.category === selectedCategory)

  const [taskFilters, setTaskFilters] = useState({
    category: "all",
    maxDistance: 10, // km
    maxTime: 180, // minutes
    minTrustScore: 0,
  })
  const [showTaskFilters, setShowTaskFilters] = useState(false)

  const getFilteredTasks = () => {
    let filtered = postedSkills.filter((skill) => skill.status === "open" && !skill.isPaused && skill.isActive)

    // Apply category filter
    if (taskFilters.category !== "all") {
      filtered = filtered.filter((skill) => skill.category.toLowerCase() === taskFilters.category)
    }

    // Apply distance filter
    filtered = filtered.filter((skill) => {
      const distance = Number.parseFloat(skill.distance.replace(" km", ""))
      return distance <= taskFilters.maxDistance
    })

    // Apply time filter (convert estimatedTime to minutes for comparison)
    filtered = filtered.filter((skill) => {
      const timeMatch = skill.estimatedTime.match(/(\d+)\s*(min|hour|hr)/i)
      if (timeMatch) {
        const value = Number.parseInt(timeMatch[1])
        const unit = timeMatch[2].toLowerCase()
        const minutes = unit.startsWith("h") ? value * 60 : value
        return minutes <= taskFilters.maxTime
      }
      return true
    })

    // Apply minimum trust score filter
    filtered = filtered.filter(
      (skill) => skill.minTrustScore <= taskFilters.minTrustScore || taskFilters.minTrustScore === 0,
    )

    // Sort by distance (nearby first)
    filtered.sort((a, b) => {
      const distA = Number.parseFloat(a.distance.replace(" km", ""))
      const distB = Number.parseFloat(b.distance.replace(" km", ""))
      return distA - distB
    })

    return filtered
  }

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill)
    setSkillForm({
      title: skill.title,
      category: skill.category,
      description: skill.description || "", // Initialize with existing description or empty
    })
    setShowEditSkillModal(true)
  }

  const handleToggleSkillPause = (skillId: string) => {
    setPostedSkills((prevSkills) =>
      prevSkills.map((skill) => (skill.id === skillId ? { ...skill, isActive: !skill.isActive } : skill)),
    )
  }

  useEffect(() => {
    if (isBetaMode) {
      // Silent monitoring - logs are tracked internally
      // Removed console.log statements for cleaner production code
    }
  }, [monitoringLogs, feedbackLogs])

  const logActivity = (
    activityType: string,
    details: string,
    severity: "normal" | "suspicious" | "critical" = "normal",
  ) => {
    const log: MonitoringLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: betaUser.userId,
      activityType,
      severity,
      details,
    }
    setMonitoringLogs((prev) => [log, ...prev].slice(0, 100)) // Keep last 100 logs

    // Silent monitoring for beta monitoring
    console.log("[v0] Beta Monitoring:", log)
  }

  const collectFeedback = (category: "ui" | "performance" | "feature" | "bug", details: string, context: string) => {
    const feedback: FeedbackLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: betaUser.userId,
      category,
      details,
      context,
    }
    setFeedbackLogs((prev) => [feedback, ...prev].slice(0, 50))
    console.log("[v0] Beta Feedback:", feedback)
  }

  const detectAbnormalActivity = (activityType: string): boolean => {
    // Check for fake tasks (unrealistic rewards, duplicate titles)
    if (activityType === "post_skill") {
      const recentPosts = postedSkills.filter((skill) => {
        const skillDate = new Date(skill.postedDate)
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
        return skillDate > hourAgo
      })

      if (recentPosts.length > 5) {
        logActivity("post_skill", "Excessive posting detected - 5+ tasks in 1 hour", "suspicious")
        return true
      }
    }

    // Check for suspicious help requests (too frequent, always max amount)
    if (activityType === "help_request") {
      const recentHelps = helpRequests.filter((req) => {
        const reqDate = new Date(req.requestDate)
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return reqDate > dayAgo && req.requestedBy === betaUser.userId
      })

      if (recentHelps.length > 2) {
        logActivity("help_request", "Multiple help requests in 24h", "suspicious")
        return true
      }
    }

    // Check for task acceptance abuse (accepting then canceling repeatedly)
    if (activityType === "accept_task") {
      const recentAcceptances = acceptedTasks.length
      const recentCompletions = trustActivities.filter((a) => a.type === "task_completed").length

      if (recentAcceptances > 10 && recentCompletions < 3) {
        logActivity("accept_task", "High acceptance with low completion rate", "critical")
        return true
      }
    }

    return false
  }

  const renderGovernanceLog = () => {
    const recentActions = autoGovernanceLog.slice(0, 5)

    return (
      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-text-primary">
          {language === "en" ? "Recent Automated Actions" : "हाल की स्वचालित कार्रवाई"}
        </p>
        {recentActions.length === 0 ? (
          <p className="text-xs text-text-secondary">
            {language === "en" ? "No governance actions taken" : "कोई शासन कार्रवाई नहीं"}
          </p>
        ) : (
          recentActions.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded-lg border-l-2 ${
                log.type === "penalty"
                  ? "bg-accent-red/5 border-accent-red"
                  : log.type === "warning"
                    ? "bg-accent-amber/5 border-accent-amber"
                    : "bg-neutral-mint/10 border-primary-teal"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{log.action}</p>
                  <p className="text-xs text-text-secondary">{log.reason}</p>
                </div>
                <div className="flex items-center gap-1">
                  {log.automated && (
                    <span className="text-xs text-primary-teal font-medium">{language === "en" ? "Auto" : "स्वचा"}</span>
                  )}
                  <span className="text-xs text-text-secondary">{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  // NEW STATE FOR PROFILE VISIBILITY
  const [profileVisibility, setProfileVisibility] = useState({
    skills: true,
    tasks: true,
  })

  // State for Trust History Modal visibility
  const [showTrustHistoryModal, setShowTrustHistoryModal] = useState(false)

  const handleSubmitHelpRequest = () => {
    if (!checkBetaAccess()) return

    if (!isKYCVerified) {
      alert(
        language === "en"
          ? "Please complete Pi KYC verification to request help."
          : "कृपया मदद का अनुरोध करने के लिए Pi KYC सत्यापन पूरा करें।",
      )
      return
    }

    if (detectDuplicateActivity("requestHelp")) {
      blockFakeActivity("Multiple help requests in short time")
      return
    }

    if (isFeatureLocked("requestHelp")) {
      alert(
        language === "en"
          ? "Request Help feature is temporarily locked due to violations"
          : "उल्लंघन के कारण मदद अनुरोध सुविधा अस्थायी रूप से लॉक है",
      )
      return
    }

    if (!checkUsageLimits("requestHelp")) {
      return
    }

    const maxPi = getMaxPiPerRequest() // Use the locally defined function

    if (helpAmount < 1 || helpAmount > maxPi) {
      alert(
        language === "en"
          ? `Please enter a valid amount between 1 and ${maxPi} Pi based on your trust score.`
          : `कृपया अपने विश्वास स्कोर के आधार पर 1 और ${maxPi} Pi के बीच एक वैध राशि दर्ज करें।`,
      )
      return
    }

    if (helpReason.trim().length < 10) {
      alert(
        language === "en"
          ? "Please provide a detailed reason (at least 10 characters)."
          : "कृपया एक विस्तृत कारण प्रदान करें (कम से कम 10 अक्षर)।",
      )
      return
    }

    const newHelpRequest: HelpRequest = {
      id: Math.random().toString(36).substr(2, 9),
      requestedBy: betaUser.userId || "You", // Use betaUser.userId if available, fallback to "You"
      userName: "You", // This seems to be a placeholder, consider if it needs to be dynamic
      amount: Number(helpAmount), // Ensure amount is a number
      piAmount: Number(helpAmount), // Also set piAmount
      reason: helpReason,
      status: "pending",
      requestDate: new Date().toISOString().split("T")[0],
      location: userLocation?.city || "Unknown", // Use userLocation city if available
    }

    setHelpRequests([newHelpRequest, ...helpRequests]) // Add new request to the top
    updateActivityTimestamp("requestHelp")
    incrementUsage("requestHelp")

    logActivity("help_request", `Help requested: ${helpAmount} Pi for ${helpReason}`, "normal")
    collectFeedback("feature", "User submitted help request successfully", "help_request_submitted")

    addNotification({
      type: "help_request",
      title: language === "en" ? "Help Request Posted" : "सहायता अनुरोध पोस्ट किया गया",
      message:
        language === "en"
          ? `Your request for ${helpAmount} Pi has been posted to the community.`
          : `${helpAmount} Pi के लिए आपका अनुरोध समुदाय में पोस्ट किया गया है।`,
      timestamp: new Date(),
      read: false,
    })

    alert(
      language === "en"
        ? `Help request submitted! Community members can now see and respond to your request for ${helpAmount} Pi.`
        : `सहायता अनुरोध सबमिट किया गया! समुदाय के सदस्य अब आपके ${helpAmount} Pi के अनुरोध को देख और जवाब दे सकते हैं।`,
    )

    setShowRequestHelpModal(false)
    setHelpAmount(0) // Reset amount to 0 (number)
    setHelpReason("")
  }

  const getUserTrustScore = (username: string): number => {
    // In a real app, this would fetch the actual user's trust score from the database
    // For now, using mock scores based on username patterns
    const mockTrustScores: { [key: string]: number } = {
      "Priya S.": 750,
      "Rahul K.": 680,
      "Amit P.": 820,
      "Sneha M.": 710,
      "Vikram J.": 590,
      "Raj K.": 640,
    }
    return mockTrustScores[username] || 500 // Default to 500 if not found
  }

  const prioritizeHelpByTrustScore = (requests: HelpRequest[]) => {
    return [...requests].sort((a, b) => {
      const trustScoreA = getUserTrustScore(a.requestedBy)
      const trustScoreB = getUserTrustScore(b.requestedBy)

      // Primary sort: Higher trust score first (descending)
      if (trustScoreB !== trustScoreA) {
        return trustScoreB - trustScoreA
      }

      // Secondary sort: Lower amount first (ascending) - smaller requests first
      return a.amount - b.amount
    })
  }

  const getSearchResults = () => {
    if (!searchQuery.trim()) return { skills: [], helpRequests: [] }

    const query = searchQuery.toLowerCase().trim()

    // Search in skills and tasks
    const matchingSkills = postedSkills.filter((skill) => {
      return (
        skill.status === "open" &&
        skill.isActive &&
        !skill.isPaused &&
        (skill.title.toLowerCase().includes(query) ||
          skill.category.toLowerCase().includes(query) ||
          skill.postedBy.toLowerCase().includes(query))
      )
    })

    matchingSkills.sort((a, b) => {
      const trustScoreA = getUserTrustScore(a.postedBy)
      const trustScoreB = getUserTrustScore(b.postedBy)

      // First, sort by trust score (descending - higher is better)
      if (trustScoreA !== trustScoreB) {
        return trustScoreB - trustScoreA
      }

      // If trust scores are equal, sort by distance (ascending - nearest first)
      const distA = Number.parseFloat(a.distance.replace(" km", ""))
      const distB = Number.parseFloat(b.distance.replace(" km", ""))
      return distA - distB
    })

    // Search in help requests
    const matchingHelpRequests = helpRequests.filter((request) => {
      return (
        request.status === "active" &&
        (request.reason.toLowerCase().includes(query) || request.requestedBy.toLowerCase().includes(query))
      )
    })

    matchingHelpRequests.sort((a, b) => {
      const trustScoreA = getUserTrustScore(a.requestedBy)
      const trustScoreB = getUserTrustScore(b.requestedBy)

      // First, sort by trust score (descending - higher is better)
      if (trustScoreA !== trustScoreB) {
        return trustScoreB - trustScoreA
      }

      // If trust scores are equal, sort by amount (ascending - smaller requests first)
      return a.amount - b.amount
    })

    return {
      skills: matchingSkills.slice(0, 5), // Limit to 5 results
      helpRequests: matchingHelpRequests.slice(0, 5), // Limit to 5 results
    }
  }

  const handleSearchResultClick = (type: "skill" | "help", item: Skill | HelpRequest) => {
    setSearchQuery("") // Clear search
    setShowSearchResults(false)

    if (type === "skill") {
      setSelectedTask(item as Skill)
      setShowTaskDetail(true)
    } else if (type === "help") {
      // Open help request detail if needed, or just show the help section
      setCurrentView("help")
    }
  }

  // Added state for location settings modal visibility
  const [showLocationSettings, setShowLocationSettings] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-white pb-20">
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-4">
          <div className="bg-neutral-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Step 0: Welcome */}
            {onboardingStep === 0 && (
              <div className="p-6 space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-green flex items-center justify-center shadow-md">
                    <Award className="w-10 h-10 text-neutral-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-text-primary">
                  {language === "en" ? "Welcome to Unibic" : "यूनिबिक में आपका स्वागत है"}
                </h2>
                <p className="text-center text-text-secondary leading-relaxed">
                  {language === "en"
                    ? "A trust-based community where you earn Pi through real skills, help others in emergencies, and build lasting reputation — all without loans, interest, or shame."
                    : "एक विश्वास-आधारित समुदाय जहां आप वास्तविक कौशल के माध्यम से Pi कमाते हैं, आपात स्थिति में दूसरों की मदद करते हैं, और स्थायी प्रतिष्ठा बनाते हैं — सब बिना ऋण, ब्याज या शर्म के।"}
                </p>
                <div className="bg-secondary-mint rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text-primary">
                      {language === "en" ? "Earn Pi through verified skills" : "सत्यापित कौशल के माध्यम से Pi कमाएं"}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text-primary">
                      {language === "en" ? "Build trust through real actions" : "वास्तविक कार्यों के माध्यम से विश्वास बनाएं"}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text-primary">
                      {language === "en" ? "Get emergency help without debt" : "बिना कर्ज के आपातकालीन सहायता प्राप्त करें"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={nextOnboardingStep}
                  className="w-full bg-primary-green hover:bg-primary-green/90 text-white active:scale-95 transition-transform"
                >
                  {language === "en" ? "Get Started" : "शुरू करें"}
                </Button>
                <Button
                  onClick={skipOnboarding}
                  variant="ghost"
                  className="w-full text-text-secondary hover:bg-neutral-card"
                >
                  {language === "en" ? "Skip" : "छोड़ें"}
                </Button>
              </div>
            )}

            {/* Step 1: Trust Score Explanation */}
            {onboardingStep === 1 && (
              <div className="p-6 space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-green flex items-center justify-center shadow-md">
                    <TrendingUp className="w-10 h-10 text-neutral-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-text-primary">
                  {language === "en" ? "Your Trust Score" : "आपका ट्रस्ट स्कोर"}
                </h2>
                <p className="text-center text-text-secondary leading-relaxed">
                  {language === "en"
                    ? "Trust Score is the heart of Unibic. It grows when you complete tasks, help others, and act honestly. It unlocks better opportunities."
                    : "ट्रस्ट स्कोर यूनिबिक का दिल है। यह बढ़ता है जब आप कार्य पूरे करते हैं, दूसरों की मदद करते हैं, और ईमानदारी से कार्य करते हैं। यह बेहतर अवसरों को अनलॉक करता है।"}
                </p>
                <div className="bg-light-green rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      {language === "en" ? "Complete Tasks" : "कार्य पूर्ण करें"}
                    </span>
                    <span className="text-sm font-semibold text-primary-green">+10 points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      {language === "en" ? "Help Others" : "दूसरों की मदद करें"}
                    </span>
                    <span className="text-sm font-semibold text-primary-green">+15 points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      {language === "en" ? "Positive Feedback" : "सकारात्मक प्रतिक्रिया"}
                    </span>
                    <span className="text-sm font-semibold text-primary-green">+5 points</span>
                  </div>
                  <div className="h-px bg-neutral-divider my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{language === "en" ? "Rejection" : "अस्वीकृति"}</span>
                    <span className="text-sm font-semibold text-accent-amber">-5 points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      {language === "en" ? "False Activity" : "झूठी गतिविधि"}
                    </span>
                    <span className="text-sm font-semibold text-accent-red">-15 points</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setOnboardingStep(1)}
                    variant="outline"
                    className="flex-1 border-neutral-divider text-text-secondary hover:bg-neutral-card active:scale-95 transition-transform"
                  >
                    {language === "en" ? "Back" : "पीछे"}
                  </Button>
                  <Button
                    onClick={nextOnboardingStep}
                    className="flex-1 bg-primary-green hover:bg-primary-green/90 text-white active:scale-95 transition-transform"
                  >
                    {language === "en" ? "Next" : "अगला"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Skills & Tasks */}
            {onboardingStep === 2 && (
              <div className="p-6 space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-secondary-teal flex items-center justify-center shadow-md">
                    <Briefcase className="w-10 h-10 text-neutral-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-text-primary">
                  {language === "en" ? "Skills & Tasks" : "कौशल और कार्य"}
                </h2>
                <p className="text-center text-text-secondary leading-relaxed">
                  {language === "en"
                    ? "Share your skills and earn Pi, or find tasks from people nearby. Every completed task builds your reputation."
                    : "अपने कौशल साझा करें और Pi कमाएं, या पास के लोगों से कार्य खोजें। हर पूर्ण कार्य आपकी प्रतिष्ठा बनाता है।"}
                </p>
                <div className="space-y-3">
                  <div className="bg-secondary-mint rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-teal/10 flex items-center justify-center flex-shrink-0">
                        <Plus className="w-5 h-5 text-secondary-teal" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {language === "en" ? "Post Your Skill" : "अपना कौशल पोस्ट करें"}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                          {language === "en"
                            ? "Share what you can do and set your Pi reward"
                            : "साझा करें कि आप क्या कर सकते हैं और अपना Pi इनाम सेट करें"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary-mint rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-teal/10 flex items-center justify-center flex-shrink-0">
                        <Search className="w-5 h-5 text-secondary-teal" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {language === "en" ? "Find Tasks Nearby" : "पास में कार्य खोजें"}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                          {language === "en"
                            ? "Browse available work in your area and start earning"
                            : "अपने क्षेत्र में उपलब्ध कार्य ब्राउज़ करें और कमाई शुरू करें"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary-mint rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-green/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-primary-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {language === "en" ? "Complete & Confirm" : "पूर्ण करें और पुष्टि करें"}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                          {language === "en"
                            ? "Both parties confirm completion to earn Pi and trust"
                            : "Pi और विश्वास अर्जित करने के लिए दोनों पक्ष पूर्णता की पुष्टि करते हैं"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setOnboardingStep(1)}
                    variant="outline"
                    className="flex-1 border-neutral-divider text-text-secondary hover:bg-neutral-card active:scale-95 transition-transform"
                  >
                    {language === "en" ? "Back" : "पीछे"}
                  </Button>
                  <Button
                    onClick={nextOnboardingStep}
                    className="flex-1 bg-primary-green hover:bg-primary-green/90 text-white active:scale-95 transition-transform"
                  >
                    {language === "en" ? "Next" : "अगला"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Emergency Help & Rules */}
            {onboardingStep === 3 && (
              <div className="p-6 space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-green flex items-center justify-center shadow-md">
                    <Heart className="w-10 h-10 text-neutral-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-text-primary">
                  {language === "en" ? "Emergency Help" : "आपातकालीन सहायता"}
                </h2>
                <p className="text-center text-text-secondary leading-relaxed">
                  {language === "en"
                    ? "Request small emergency support based on your trust score. No loans. No interest. No shame. Just community support."
                    : "अपने ट्रस्ट स्कोर के आधार पर छोटी आपातकालीन सहायता का अनुरोध करें। कोई ऋण नहीं। कोई ब्याज नहीं। कोई शर्म नहीं। बस समुदाय समर्थन।"}
                </p>
                <div className="bg-light-green rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-text-primary text-center">
                    {language === "en" ? "Core Rules" : "मुख्य नियम"}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-green mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-text-primary">
                        {language === "en"
                          ? "One Pi KYC = One Real Human. No fake accounts."
                          : "एक Pi KYC = एक वास्तविक मानव। कोई नकली खाता नहीं।"}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-green mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-text-primary">
                        {language === "en"
                          ? "Trust grows only from real completed actions."
                          : "विश्वास केवल वास्तविक पूर्ण कार्यों से बढ़ता है।"}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-green mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-text-primary">
                        {language === "en"
                          ? "No instant big rewards. Earn steadily with honesty."
                          : "कोई तत्काल बड़ा इनाम नहीं। ईमानदारी से लगातार कमाएं।"}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-amber mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-text-primary">
                        {language === "en"
                          ? "Misuse or false activity reduces trust and limits access."
                          : "दुरुपयोग या झूठी गतिविधि विश्वास को कम करती है और पहुंच सीमित करती है।"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-mint rounded-lg p-4">
                  <p className="text-sm text-center text-text-secondary">
                    {language === "en"
                      ? "Unibic is built on trust, respect, and real human connections. Let's grow together."
                      : "यूनिबिक विश्वास, सम्मान और वास्तविक मानवीय संबंधों पर बनाया गया है। आइए एक साथ बढ़ें।"}
                  </p>
                </div>

                <div className="bg-secondary-mint border border-secondary-teal/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-secondary-teal flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text-primary">
                      {language === "en"
                        ? "Location is required to find nearby work and help."
                        : "पास में काम और मदद खोजने के लिए स्थान आवश्यक है।"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setOnboardingStep(2)}
                    variant="outline"
                    className="flex-1 border-neutral-divider text-text-secondary hover:bg-neutral-card active:scale-95 transition-transform"
                  >
                    {language === "en" ? "Back" : "पीछे"}
                  </Button>
                  <Button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const cities = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"]
                            const detectedCity = cities[Math.floor(Math.random() * cities.length)]
                            const locationData = {
                              lat: position.coords.latitude,
                              lng: position.coords.longitude,
                              city: detectedCity,
                            }
                            setUserLocation(locationData)
                            setLocationPermissionGranted(true)
                            localStorage.setItem("unibic_user_location", JSON.stringify(locationData))
                            localStorage.setItem("unibic_location_granted", "true")
                            completeOnboarding()
                          },
                          (error) => {
                            // If location is denied or fails, still complete onboarding
                            console.log("[v0] Location permission denied or failed, proceeding anyway")
                            completeOnboarding()
                          },
                          {
                            enableHighAccuracy: false,
                            timeout: 5000, // 5 second timeout
                            maximumAge: 0,
                          },
                        )
                      } else {
                        // Geolocation not supported, proceed anyway
                        completeOnboarding()
                      }
                    }}
                    className="flex-1 bg-primary-green hover:bg-primary-green/90 text-white active:scale-95 transition-transform"
                  >
                    {language === "en" ? "Start Using Unibic" : "यूनिबिक का उपयोग शुरू करें"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-white shadow-soft border-b border-neutral-divider">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-green flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5 text-neutral-white" />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <h1 className="text-xl font-bold text-text-primary leading-tight">{content.appName}</h1>
              <span className="text-xs text-text-secondary font-medium leading-none">Trust</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const languages: Array<"en" | "hi" | "ta" | "te" | "bn" | "mr" | "gu"> = [
                  "en",
                  "hi",
                  "ta",
                  "te",
                  "bn",
                  "mr",
                  "gu",
                ]
                const currentIndex = languages.indexOf(language)
                const nextIndex = (currentIndex + 1) % languages.length
                setLanguage(languages[nextIndex])
              }}
              className="text-xs text-text-secondary hover:bg-neutral-card active:scale-95 transition-transform"
            >
              {language === "en" && "EN"}
              {language === "hi" && "हिं"}
              {language === "ta" && "த"}
              {language === "te" && "తె"}
              {language === "bn" && "বাং"}
              {language === "mr" && "मर"}
              {language === "gu" && "ગુ"}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLocationSettings(true)}
              className={`${
                userLocation ? "text-primary-green hover:bg-light-green" : "text-text-secondary hover:bg-neutral-card"
              } active:scale-95 transition-all`}
            >
              {userLocation ? <MapPin className="h-5 w-5 fill-current" /> : <MapPin className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setShowMyTasks(true)}>
              <Briefcase className="h-5 w-5" />
              {acceptedTasks.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary-green text-white text-xs flex items-center justify-center">
                  {acceptedTasks.length}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotifications(true)}>
              <Bell className="h-5 w-5" />
              {(unreadCount > 0 || tasksNeedingConfirmation.length > 0) && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent-amber text-white text-xs flex items-center justify-center">
                  {unreadCount + tasksNeedingConfirmation.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-text-secondary hover:bg-neutral-card active:scale-95 transition-transform"
              onClick={() => setCurrentView("profile")} // Changed to set `currentView` to "profile"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentView === "home" && (
        <main className="max-w-md mx-auto px-4 py-6 space-y-4">
          {/* Trust Score Card */}
          <Card
            className="border border-primary-green/20 cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all duration-200 rounded-3xl overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, #E8F5EC 0%, #F6FFF9 100%)",
              boxShadow: "0 4px 20px rgba(46, 125, 50, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
            }}
            onClick={() => setShowTrustDetails(!showTrustDetails)}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
                                  radial-gradient(circle at 60% 70%, rgba(255, 255, 255, 0.6) 1px, transparent 1px),
                                  radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
                                  radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
                backgroundSize: "100% 100%",
              }}
            />
            <CardContent className="pt-5 pb-4 relative z-10">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">{content.trustScore}</h2>
                    <p className="text-xs text-text-secondary">{content.trustScoreDesc}</p>
                  </div>
                  {isKYCVerified ? (
                    <ShieldIcon className="flex-shrink-0" style={{ width: "47px", height: "47px" }} />
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-transparent text-accent-amber border-accent-amber/30 text-xs font-medium flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>{content.kycRequired}</span>
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-center py-4">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                      <defs>
                        <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#34d399" />
                          <stop offset="40%" stopColor="#22c55e" />
                          <stop offset="70%" stopColor="#16a34a" />
                          <stop offset="100%" stopColor="#15803d" />
                        </linearGradient>
                        <filter id="glowFilter">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Background circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />
                      {/* Progress arc with enhanced gradient and glow */}
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        fill="none"
                        stroke="url(#trustGradient)"
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={`${(trustScore / 1000) * 427.3} 427.3`}
                        className="transition-all duration-500 ease-out"
                        filter="url(#glowFilter)"
                        style={{
                          filter: "drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))",
                        }}
                      />
                    </svg>
                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold ${trustColor}`}>{trustScore}</span>
                      <span className="text-sm text-text-secondary">/ 1000</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <TrendingUp className="w-3.5 h-3.5 text-primary-green" />
                        <span className="text-xs font-medium text-primary-green">{trustLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CHANGE: Enhanced glass-morphism with increased blur, softer shadow, and more rounded corners */}
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-4 border border-white/50 shadow-lg">
                  <p className="text-sm font-semibold text-text-primary mb-3 tracking-wide">
                    {content.recentActivity || "Recent Activity"}:
                  </p>
                  <div className="space-y-3">
                    {trustActivities.slice(0, 3).map((activity, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary leading-relaxed font-normal">
                            {activity.description}
                          </span>
                          <span
                            className={`text-sm font-bold tracking-wide ${
                              activity.points > 0 ? "text-[#2E7D32]" : "text-accent-amber"
                            }`}
                          >
                            {activity.points > 0 ? "+" : ""}
                            {activity.points}
                          </span>
                        </div>
                        {idx < 2 && <div className="h-px bg-neutral-divider/30 mt-3" />}
                      </div>
                    ))}
                  </div>
                </div>
                {/* End of Enhanced Recent Activity section */}

                {showTrustDetails ? (
                  <div className="space-y-3 pt-2 border-t border-neutral-divider mt-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-light-green">
                        <CheckCircle className="w-4 h-4 text-primary-green flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-primary-green">{stats.completed}</p>
                          <p className="text-xs text-text-secondary truncate">{content.tasksCompleted}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-light-green">
                        <HandHeart className="w-4 h-4 text-primary-green flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-primary-green">{stats.helpGiven}</p>
                          <p className="text-xs text-text-secondary truncate">{content.helpGiven}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-mint">
                        <Award className="w-4 h-4 text-secondary-teal flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-secondary-teal">{stats.piEarned}π</p>
                          <p className="text-xs text-text-secondary truncate">{content.pieEarned}</p>
                        </div>
                      </div>
                      {stats.violations > 0 && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-accent-amber/10">
                          <AlertTriangle className="w-4 h-4 text-accent-amber flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-accent-amber">{stats.violations}</p>
                            <p className="text-xs text-text-secondary truncate">{content.violations}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowTrustHistoryModal(true)
                      }}
                      className="w-full bg-primary-green hover:bg-primary-green/90 text-white text-xs py-2 rounded-lg transition-all active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      {language === "en" ? "View Trust History" : "विश्वास इतिहास देखें"}
                    </Button>

                    <div className="flex items-center justify-center pt-1">
                      <ChevronUp className="w-4 h-4 text-text-secondary" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center pt-1">
                    <span className="text-xs text-text-secondary flex items-center gap-1">
                      {content.tapToExpand}
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-mint to-light-green border border-primary-green/20 shadow-card rounded-xl">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-green" />
                {content.todaySummary}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-white/80 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-secondary-teal" />
                    <span className="text-xs text-text-secondary">
                      {language === "en" ? "Available Tasks" : "उपलब्ध कार्य"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-primary-green">{getFilteredTasks().length}</p>
                </div>

                <div className="bg-neutral-white/80 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <HandHeart className="w-4 h-4 text-secondary-teal" />
                    <span className="text-xs text-text-secondary">
                      {language === "en" ? "Help Requests" : "सहायता अनुरोध"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-primary-green">
                    {helpRequests.filter((req) => req.status === "active").length}
                  </p>
                </div>
              </div>

              {/* Quick Tips based on Trust Score */}
              <div className="bg-neutral-white/80 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-accent-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-text-primary mb-1">
                      {language === "en" ? "Quick Tip" : "त्वरित सुझाव"}
                    </p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {trustScore >= 800
                        ? language === "en"
                          ? "Your excellent trust score unlocks all features. Help new members build their reputation!"
                          : "आपका उत्कृष्ट ट्रस्ट स्कोर सभी सुविधाओं को अनलॉक करता है। नए सदस्यों की प्रतिष्ठा बनाने में मदद करें!"
                        : trustScore >= 650
                          ? language === "en"
                            ? "Complete more tasks and help others to reach excellent trust level and increase your daily limits."
                            : "उत्कृष्ट ट्रस्ट स्तर तक पहुंचने और अपनी दैनिक सीमाएं बढ़ाने के लिए अधिक कार्य पूरे करें।"
                          : trustScore >= 500
                            ? language === "en"
                              ? "Build your trust by completing tasks successfully. Good feedback from task owners helps!"
                              : "कार्यों को सफलतापूर्वक पूरा करके अपना विश्वास बनाएं। कार्य मालिकों से अच्छी प्रतिक्रिया मदद करती है!"
                            : language === "en"
                              ? "Start with small tasks to build trust. Complete them well to get positive feedback and grow your score."
                              : "विश्वास बनाने के लिए छोटे कार्यों से शुरुआत करें। उन्हें अच्छी तरह से पूरा करें और स्कोर बढ़ाएं।"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post Skill and Request Help Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Card
              className="bg-neutral-white shadow-card hover:shadow-card-hover active:scale-95 transition-all duration-200 cursor-pointer rounded-xl border border-neutral-divider"
              onClick={handlePostSkill}
            >
              <CardContent className="p-3 flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-secondary-teal/10 flex items-center justify-center shadow-sm">
                  <Briefcase className="w-5 h-5 text-secondary-teal" />
                </div>
                <h3 className="font-semibold text-xs leading-tight text-text-primary">{content.postSkill}</h3>
              </CardContent>
            </Card>

            <Card className="bg-neutral-white shadow-card hover:shadow-card-hover active:scale-95 transition-all duration-200 cursor-pointer rounded-xl border border-neutral-divider">
              <CardContent className="p-3 flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-secondary-teal/10 flex items-center justify-center shadow-sm">
                  <MapPin className="w-5 h-5 text-secondary-teal" />
                </div>
                <h3 className="font-semibold text-xs leading-tight text-text-primary">{content.findWork}</h3>
              </CardContent>
            </Card>

            {/* Added Request Help card */}
            <Card
              className="bg-neutral-white shadow-card hover:shadow-card-hover active:scale-95 transition-all duration-200 cursor-pointer rounded-xl border border-neutral-divider"
              onClick={() => setShowRequestHelpModal(true)} // Changed to show the modal
            >
              <CardContent className="p-3 flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-secondary-teal/10 flex items-center justify-center shadow-sm">
                  <HandHeart className="w-5 h-5 text-secondary-teal" />
                </div>
                <h3 className="font-semibold text-xs leading-tight text-text-primary">{content.requestHelp}</h3>
              </CardContent>
            </Card>
          </div>

          <div className="px-4 mb-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                placeholder={
                  language === "en" ? "Search skills, tasks, people, or help" : "स्किल, टास्क, लोग, या मदद खोजें"
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchResults(e.target.value.trim().length > 0)
                }}
                onFocus={() => setShowSearchResults(searchQuery.trim().length > 0)}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#F5F7F6] border border-[#E0E0E0] text-[#1F2933] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 transition-all"
              />
            </div>

            {showSearchResults && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#E0E0E0] max-h-96 overflow-y-auto z-50 mx-4">
                {(() => {
                  const results = getSearchResults()
                  const hasResults = results.skills.length > 0 || results.helpRequests.length > 0

                  if (!hasResults) {
                    return (
                      <div className="p-4 text-center text-[#6B7280]">
                        {language === "en" ? "No results found" : "कोई परिणाम नहीं मिला"}
                      </div>
                    )
                  }

                  return (
                    <div className="p-2">
                      {/* Skills/Tasks Results */}
                      {results.skills.length > 0 && (
                        <div className="mb-2">
                          <div className="px-3 py-2 text-xs font-medium text-[#6B7280] uppercase">
                            {language === "en" ? "Skills & Tasks" : "स्किल और टास्क"}
                          </div>
                          {results.skills.map((skill) => (
                            <button
                              key={skill.id}
                              onClick={() => handleSearchResultClick("skill", skill)}
                              className="w-full text-left px-3 py-3 rounded-lg hover:bg-[#E8F5E9] transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="font-medium text-[#1F2933] text-sm">{skill.title}</div>
                                  <div className="text-xs text-[#6B7280] mt-1">
                                    {skill.category} • {skill.distance} • {skill.postedBy}
                                  </div>
                                </div>
                                <div className="text-xs font-medium text-[#2E7D32]">
                                  {skill.piRewardMin}-{skill.piRewardMax} Pi
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Help Requests Results */}
                      {results.helpRequests.length > 0 && (
                        <div>
                          <div className="px-3 py-2 text-xs font-medium text-[#6B7280] uppercase">
                            {language === "en" ? "Help Requests" : "मदद के अनुरोध"}
                          </div>
                          {results.helpRequests.map((request) => (
                            <button
                              key={request.id}
                              onClick={() => handleSearchResultClick("help", request)}
                              className="w-full text-left px-3 py-3 rounded-lg hover:bg-[#E8F5E9] transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="font-medium text-[#1F2933] text-sm">{request.reason}</div>
                                  <div className="text-xs text-[#6B7280] mt-1">
                                    {request.requestedBy} • {request.timeAgo || request.location}
                                  </div>
                                </div>
                                <div className="text-xs font-medium text-[#F59E0B]">{request.amount} Pi</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Nearby Tasks Section */}
          <div className="bg-neutral-card rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary-teal" />
              {content.nearbyTasks}
            </h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTaskFilters(!showTaskFilters)}
                className="w-full text-xs border-neutral-divider hover:border-secondary-teal hover:bg-secondary-mint/20 active:scale-95 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {language === "en" ? "Filters" : "फ़िल्टर"}
                </span>
                {showTaskFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {showTaskFilters && (
                <div className="bg-neutral-white rounded-lg p-4 space-y-4 border border-neutral-divider">
                  {/* Category Filter */}
                  <div>
                    <label className="text-xs font-medium text-text-primary mb-2 block">
                      {language === "en" ? "Category" : "श्रेणी"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "all",
                        "design",
                        "tech",
                        "language",
                        "writing",
                        "teaching",
                        "photography",
                        "marketing",
                        "other",
                      ].map((cat) => (
                        <Button
                          key={cat}
                          variant="outline"
                          size="sm"
                          onClick={() => setTaskFilters({ ...taskFilters, category: cat })}
                          className={`text-xs capitalize transition-all active:scale-95 ${
                            taskFilters.category === cat
                              ? "bg-secondary-teal text-white border-secondary-teal"
                              : "bg-neutral-white text-text-secondary border-neutral-divider hover:border-secondary-teal"
                          }`}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Distance Filter */}
                  <div>
                    <label className="text-xs font-medium text-text-primary mb-2 block">
                      {language === "en"
                        ? `Max Distance: ${taskFilters.maxDistance} km`
                        : `अधिकतम दूरी: ${taskFilters.maxDistance} किमी`}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={taskFilters.maxDistance}
                      onChange={(e) => setTaskFilters({ ...taskFilters, maxDistance: Number.parseInt(e.target.value) })}
                      className="w-full h-2 bg-neutral-divider rounded-lg appearance-none cursor-pointer accent-secondary-teal"
                    />
                    <div className="flex justify-between text-xs text-text-secondary mt-1">
                      <span>1 km</span>
                      <span>50 km</span>
                    </div>
                  </div>

                  {/* Time Required Filter */}
                  <div>
                    <label className="text-xs font-medium text-text-primary mb-2 block">
                      {language === "en"
                        ? `Max Time: ${taskFilters.maxTime >= 60 ? `${Math.floor(taskFilters.maxTime / 60)}h ${taskFilters.maxTime % 60}m` : `${taskFilters.maxTime}m`}`
                        : `अधिकतम समय: ${taskFilters.maxTime >= 60 ? `${Math.floor(taskFilters.maxTime / 60)}घं ${taskFilters.maxTime % 60}मि` : `${taskFilters.maxTime}मि`}`}
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="480"
                      step="15"
                      value={taskFilters.maxTime}
                      onChange={(e) => setTaskFilters({ ...taskFilters, maxTime: Number.parseInt(e.target.value) })}
                      className="w-full h-2 bg-neutral-divider rounded-lg appearance-none cursor-pointer accent-secondary-teal"
                    />
                    <div className="flex justify-between text-xs text-text-secondary mt-1">
                      <span>15 {language === "en" ? "min" : "मिनट"}</span>
                      <span>8 {language === "en" ? "hrs" : "घंटे"}</span>
                    </div>
                  </div>

                  {/* Minimum Trust Score Filter */}
                  <div>
                    <label className="text-xs font-medium text-text-primary mb-2 block">
                      {language === "en"
                        ? `Min Trust Score: ${taskFilters.minTrustScore === 0 ? "Any" : taskFilters.minTrustScore}`
                        : `न्यूनतम ट्रस्ट स्कोर: ${taskFilters.minTrustScore === 0 ? "कोई भी" : taskFilters.minTrustScore}`}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="900"
                      step="50"
                      value={taskFilters.minTrustScore}
                      onChange={(e) =>
                        setTaskFilters({ ...taskFilters, minTrustScore: Number.parseInt(e.target.value) })
                      }
                      className="w-full h-2 bg-neutral-divider rounded-lg appearance-none cursor-pointer accent-secondary-teal"
                    />
                    <div className="flex justify-between text-xs text-text-secondary mt-1">
                      <span>{language === "en" ? "Any" : "कोई भी"}</span>
                      <span>900</span>
                    </div>
                  </div>

                  {/* Reset Filters Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setTaskFilters({
                        category: "all",
                        maxDistance: 10,
                        maxTime: 180,
                        minTrustScore: 0,
                      })
                    }
                    className="w-full text-xs border-neutral-divider hover:border-primary-green hover:text-primary-green active:scale-95 transition-all"
                  >
                    {language === "en" ? "Reset Filters" : "फ़िल्टर रीसेट करें"}
                  </Button>
                </div>
              )}
            </div>

            {/* Task List */}
            {getFilteredTasks().length === 0 ? (
              <Card className="bg-neutral-white shadow-card rounded-xl border border-neutral-divider">
                <CardContent className="py-8 text-center">
                  <MapPin className="w-12 h-12 text-neutral-divider mx-auto mb-3" />
                  <p className="text-text-secondary text-sm">
                    {language === "en" ? "No tasks match your filters" : "कोई कार्य आपके फ़िल्टर से मेल नहीं खाता"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {getFilteredTasks().map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTask(task)
                      setShowTaskDetail(true)
                    }}
                    className="bg-neutral-white rounded-lg p-3 border border-neutral-divider cursor-pointer active:scale-[0.98] transition-transform hover:border-secondary-teal"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <h4 className="font-semibold text-sm text-text-primary line-clamp-1">{task.title}</h4>
                          {trustScore >= task.minTrustScore && (
                            <CheckCircle className="w-4 h-4 text-primary-green flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-text-secondary">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {task.distance}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimatedTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs border-secondary-teal/30 text-secondary-teal">
                            {task.category}
                          </Badge>
                          {trustScore < task.minTrustScore && (
                            <Badge
                              variant="outline"
                              className="text-xs border-accent-amber/30 text-accent-amber flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {content.trustTooLow}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-semibold text-primary-green">
                          {task.piRewardMin}-{task.piRewardMax}π
                        </div>
                        <div className="text-xs text-text-secondary mt-0.5">{content.piReward}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Help Section */}
      {currentView === "help" && (
        <main className="max-w-md mx-auto px-4 py-6 space-y-4">
          {/* Help Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text-primary">{content.help}</h1>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowRequestHelpModal(true)} // Changed to show the modal
              disabled={isFeatureLocked("requestHelp")}
              className="bg-primary-green text-white hover:bg-primary-green/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HandHeart className="w-4 h-4 mr-1" />
              {content.requestHelp}
            </Button>
          </div>

          <div className="bg-gradient-to-br from-primary-light-green to-secondary-mint rounded-xl p-5 border border-primary-green/20 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-primary-green/10 rounded-lg p-2">
                <Info className="w-5 h-5 text-primary-green" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  {language === "en" ? "Your Help Quota" : "आपका सहायता कोटा"}
                </h3>
                <p className="text-xs text-text-secondary">
                  {language === "en"
                    ? "No interest • No deadline • Community support"
                    : "कोई ब्याज नहीं • कोई समय सीमा नहीं • समुदाय समर्थन"}
                </p>
              </div>
            </div>

            {/* Remaining Quota - Prominent Display */}
            <div className="bg-neutral-white rounded-lg p-4 mb-4 border border-primary-green/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-secondary">{content.maxAllowedPerRequest}</span>
                <span className="text-2xl font-bold text-primary-green">{getMaxPiPerRequest()} Pi</span>
              </div>

              <div className="space-y-2 pt-3 border-t border-neutral-divider">
                {/* Daily Quota */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{language === "en" ? "Today" : "आज"}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-neutral-card rounded-full w-20">
                      <div
                        className="h-full bg-primary-green rounded-full transition-all"
                        style={{
                          width: `${((getDailyLimits(trustScore).helpRequests - usageTracking.dailyHelpRequests) / getDailyLimits(trustScore).helpRequests) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-text-primary min-w-[60px] text-right">
                      {getDailyLimits(trustScore).helpRequests - usageTracking.dailyHelpRequests} /{" "}
                      {getDailyLimits(trustScore).helpRequests} {language === "en" ? "left" : "बचे"}
                    </span>
                  </div>
                </div>

                {/* Weekly Quota */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{language === "en" ? "This Week" : "इस सप्ताह"}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-neutral-card rounded-full w-20">
                      <div
                        className="h-full bg-secondary-teal rounded-full transition-all"
                        style={{
                          width: `${((getWeeklyLimits(trustScore).helpRequests - usageTracking.weeklyHelpRequests) / getWeeklyLimits(trustScore).helpRequests) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-text-primary min-w-[60px] text-right">
                      {getWeeklyLimits(trustScore).helpRequests - usageTracking.weeklyHelpRequests} /{" "}
                      {getWeeklyLimits(trustScore).helpRequests} {language === "en" ? "left" : "बचे"}
                    </span>
                  </div>
                </div>

                {/* Monthly Quota */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{language === "en" ? "This Month" : "इस महीने"}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-neutral-card rounded-full w-20">
                      <div
                        className="h-full bg-primary-green/70 rounded-full transition-all"
                        style={{
                          width: `${((getMonthlyLimits(trustScore).helpRequests - usageTracking.monthlyHelpRequests) / getMonthlyLimits(trustScore).helpRequests) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-text-primary min-w-[60px] text-right">
                      {getMonthlyLimits(trustScore).helpRequests - usageTracking.monthlyHelpRequests} /{" "}
                      {getMonthlyLimits(trustScore).helpRequests} {language === "en" ? "left" : "बचे"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Score Tip */}
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-primary-green flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary">
                {language === "en"
                  ? "Build your trust score to unlock higher help limits and amounts"
                  : "उच्च सहायता सीमा और राशि अनलॉक करने के लिए अपना विश्वास स्कोर बनाएं"}
              </p>
            </div>
          </div>

          {/* My Active Help Requests */}
          <div className="bg-neutral-card rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-secondary-teal" />
              {content.myHelpRequests}
            </h2>
            {helpRequests.filter((req) => req.requester === "You").length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-4">
                {language === "en" ? "You haven't requested any help" : "आपने कोई सहायता का अनुरोध नहीं किया है"}
              </p>
            ) : (
              <div className="space-y-3">
                {helpRequests
                  .filter((req) => req.requester === "You")
                  .map((request) => (
                    <div key={request.id} className="bg-neutral-white rounded-lg p-3 border border-neutral-divider">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm text-text-primary">{request.reason}</p>
                          <p className="text-xs text-text-secondary mt-1">{request.timeAgo}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            request.status === "pending"
                              ? "bg-accent-amber/10 text-accent-amber"
                              : request.status === "approved"
                                ? "bg-primary-light text-primary-green"
                                : "bg-neutral-divider text-text-secondary"
                          }`}
                        >
                          {request.status === "pending"
                            ? language === "en"
                              ? "Pending"
                              : "लंबित"
                            : request.status === "approved"
                              ? language === "en"
                                ? "Approved"
                                : "स्वीकृत"
                              : language === "en"
                                ? "Fulfilled"
                                : "पूर्ण"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary-green flex items-center gap-1">
                          <Coins className="w-4 h-4 text-accent-amber" />
                          {request.amount} Pi
                        </span>
                        {request.status === "approved" && request.helper && (
                          <span className="text-xs text-text-secondary">
                            {language === "en" ? "Helped by:" : "द्वारा मदद:"} {request.helper}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Community Help Requests */}
          <div className="bg-neutral-card rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary-teal" />
              {content.communityRequests}
            </h2>
            {helpRequests.filter((req) => req.requester !== "You" && req.status === "pending").length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-4">
                {language === "en" ? "No pending community requests" : "कोई लंबित सामुदायिक अनुरोध नहीं"}
              </p>
            ) : (
              <div className="space-y-3">
                {prioritizeHelpByTrustScore(
                  helpRequests.filter((req) => req.requester !== "You" && req.status === "pending"),
                ).map((request) => (
                  <div key={request.id} className="bg-neutral-white rounded-lg p-3 border border-neutral-divider">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-primary">{request.requester}</p>
                        <p className="text-sm text-text-secondary mt-1">{request.reason}</p>
                        <p className="text-xs text-text-secondary mt-1">{request.timeAgo}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary-green flex items-center gap-1">
                        <Coins className="w-4 h-4 text-accent-amber" />
                        {request.amount} Pi
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveHelp(request.id)}
                          className="text-xs bg-primary-green text-white hover:bg-primary-green/90 active:scale-95 transition-all"
                        >
                          {language === "en" ? "Help" : "मदद करें"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReportAbuse(request.id)}
                          className="text-xs text-accent-amber border-accent-amber hover:bg-accent-amber/10 active:scale-95 transition-all"
                        >
                          <Flag className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help History */}
          <div className="bg-neutral-card rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <History className="w-5 h-5 text-secondary-teal" />
              {content.helpHistory}
            </h2>
            {helpRequests.filter((req) => req.status === "fulfilled").length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-4">
                {language === "en" ? "No completed help transactions" : "कोई पूर्ण सहायता लेनदेन नहीं"}
              </p>
            ) : (
              <div className="space-y-2">
                {helpRequests
                  .filter((req) => req.status === "fulfilled")
                  .map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between py-2 border-b border-neutral-divider last:border-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-text-primary">
                          {request.requester === "You"
                            ? language === "en"
                              ? `Received from ${request.helper}`
                              : `${request.helper} से प्राप्त`
                            : language === "en"
                              ? `Helped ${request.requester}`
                              : `${request.requester} की मदद की`}
                        </p>
                        <p className="text-xs text-text-secondary">{request.timeAgo}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary-green">{request.amount} Pi</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Community Section */}
      {currentView === "community" && (
        <main className="max-w-md mx-auto px-4 py-6 space-y-4">
          {/* Community Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text-primary">{content.community}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">
                {language === "en" ? "Active Users:" : "सक्रिय उपयोगकर्ता:"}{" "}
                <span className="font-semibold text-primary-green">{betaUsers.activeUsers}</span>
              </span>
            </div>
          </div>

          {/* Community Actions Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-primary-light to-neutral-white rounded-xl p-4 border-2 border-primary-green/20">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 text-primary-green" />
                <span className="text-3xl font-bold text-primary-green">
                  {acceptedTasks.filter((t) => t.status === "completed").length}
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary">
                {language === "en" ? "Tasks Completed" : "कार्य पूर्ण"}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {language === "en" ? "Community milestone" : "समुदाय मील का पत्थर"}
              </p>
            </div>
            <div className="bg-gradient-to-br from-secondary-mint to-neutral-white rounded-xl p-4 border-2 border-secondary-teal/20">
              <div className="flex items-center justify-between mb-2">
                <HandHeart className="w-8 h-8 text-secondary-teal" />
                <span className="text-3xl font-bold text-secondary-teal">
                  {helpRequests.filter((h) => h.status === "approved").length}
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary">
                {language === "en" ? "Help Given" : "सहायता दी"}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {language === "en" ? "Support provided" : "समर्थन प्रदान किया"}
              </p>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-card rounded-xl p-3 text-center">
              <Users className="w-6 h-6 text-primary-green mx-auto mb-1" />
              <p className="text-lg font-bold text-text-primary">{betaUsers.activeUsers}</p>
              <p className="text-xs text-text-secondary">{content.members}</p>
            </div>
            <div className="bg-neutral-card rounded-xl p-3 text-center">
              <TrendingUp className="w-6 h-6 text-secondary-teal mx-auto mb-1" />
              <p className="text-lg font-bold text-text-primary">
                {acceptedTasks.filter((t) => t.feedback === "good").length}
              </p>
              <p className="text-xs text-text-secondary">
                {language === "en" ? "Positive Feedback" : "सकारात्मक प्रतिक्रिया"}
              </p>
            </div>
            <div className="bg-neutral-card rounded-xl p-3 text-center">
              <Sparkles className="w-6 h-6 text-accent-amber mx-auto mb-1" />
              <p className="text-lg font-bold text-text-primary">
                {acceptedTasks
                  .filter((t) => t.status === "completed")
                  .reduce((sum, t) => sum + (t.finalPiReward || t.piRewardMax), 0)}
              </p>
              <p className="text-xs text-text-secondary">{language === "en" ? "Pi Earned" : "Pi अर्जित"}</p>
            </div>
          </div>

          {/* Recent Community Activity - Only positive completions */}
          <div className="bg-neutral-card rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary-teal" />
              {content.recentCommunityActivity}
            </h2>
            <div className="space-y-3">
              {acceptedTasks
                .filter((task) => task.status === "completed")
                .slice(0, 5)
                .map((task, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-3 border-b border-neutral-divider last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-primary-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">
                        <span className="font-semibold">{task.acceptedBy}</span>{" "}
                        {language === "en" ? "completed" : "पूर्ण किया"}{" "}
                        <span className="font-semibold">{task.title}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-secondary">{task.acceptedAt}</span>
                        {task.feedback === "good" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-light text-primary-green flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {language === "en" ? "Good Work" : "अच्छा काम"}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-primary-green flex items-center gap-1">
                      <Coins className="w-3 h-3 text-accent-amber" />
                      {task.finalPiReward || task.piRewardMax}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Community Excellence */}
          <div className="bg-neutral-card rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-secondary-teal" />
              {language === "en" ? "Community Excellence" : "समुदाय उत्कृष्टता"}
            </h2>
            <div className="space-y-2">
              {acceptedTasks
                .filter((task) => task.feedback === "good")
                .slice(0, 5)
                .map((task, index) => (
                  <div key={index} className="bg-primary-light rounded-lg p-3 border border-primary-green/20">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-text-primary font-medium">{task.title}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary-green text-neutral-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {language === "en" ? "Excellent" : "उत्कृष्ट"}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {language === "en" ? "Completed by" : "द्वारा पूर्ण"} {task.acceptedBy} • {task.acceptedAt}
                    </p>
                  </div>
                ))}
              {acceptedTasks.filter((task) => task.feedback === "good").length === 0 && (
                <p className="text-sm text-text-secondary text-center py-4">
                  {language === "en"
                    ? "Complete tasks with excellence to appear here"
                    : "यहां दिखाई देने के लिए उत्कृष्टता के साथ कार्य पूरा करें"}
                </p>
              )}
            </div>
          </div>

          {/* System Updates */}
          <div className="bg-secondary-mint rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Bell className="w-5 h-5 text-secondary-teal" />
              {content.systemUpdates}
            </h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary-teal mt-1.5 flex-shrink-0" />
                <p className="text-sm text-text-primary">
                  {language === "en"
                    ? "Beta testing active - Your feedback helps improve Unibic"
                    : "बीटा परीक्षण सक्रिय - आपकी प्रतिक्रिया Unibic को बेहतर बनाने में मदद करती है"}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-green mt-1.5 flex-shrink-0" />
                <p className="text-sm text-text-primary">
                  {language === "en"
                    ? "Trust Score system is fully automated - No manual intervention"
                    : "विश्वास स्कोर प्रणाली पूरी तरह से स्वचालित है - कोई मैनुअल हस्तक्षेप नहीं"}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-amber mt-1.5 flex-shrink-0" />
                <p className="text-sm text-text-primary">
                  {language === "en"
                    ? "Report any suspicious activity to help keep Unibic safe"
                    : "किसी भी संदिग्ध गतिविधि की रिपोर्ट करें"}
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Profile Section */}
      {currentView === "profile" && (
        <main className="max-w-md mx-auto px-4 py-6 space-y-4">
          {/* Profile Header */}
          <Card className="bg-neutral-white shadow-card rounded-xl border border-neutral-divider">
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-green to-secondary-teal flex items-center justify-center text-neutral-white text-2xl font-bold shadow-md">
                  AS
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-text-primary">Amit Sharma</h2>
                  <p className="text-sm text-text-secondary">Mumbai, Maharashtra</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="bg-light-green text-primary-green border-primary-green/20 text-xs"
                    >
                      {content.verified}
                    </Badge>
                    <span className="text-xs text-text-secondary">
                      {content.accountAge} {getAccountAgeInDays()} {content.days}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Score Summary - Always Visible */}
          <Card className="bg-neutral-white shadow-card rounded-xl border border-neutral-divider">
            <CardContent className="pt-5 pb-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">{content.trustHistory}</h3>
              <p className="text-xs text-text-secondary mb-3">
                {language === "en"
                  ? "Your trust history is permanent and transparent. It cannot be deleted or reset."
                  : "आपका विश्वास इतिहास स्थायी और पारदर्शी है। इसे हटाया या रीसेट नहीं किया जा सकता।"}
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {trustActivities
                  .slice()
                  .reverse()
                  .map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-card">
                      <div className="flex items-center gap-2">
                        {activity.type === "task_completed" && <CheckCircle className="w-4 h-4 text-primary-green" />}
                        {activity.type === "help_given" && <HandHeart className="w-4 h-4 text-primary-green" />}
                        {activity.type === "task_rejected" && <XCircle className="w-4 h-4 text-accent-amber" />}
                        {activity.type === "misuse" && <AlertTriangle className="w-4 h-4 text-accent-red" />}
                        {activity.type === "false_activity" && <AlertCircle className="w-4 h-4 text-accent-amber" />}
                        {activity.type === "issue_feedback" && <AlertTriangle className="w-4 h-4 text-accent-amber" />}
                        <div>
                          <p className="text-xs font-medium text-text-primary">
                            {activity.type === "task_completed" && "Task Completed"}
                            {activity.type === "help_given" && "Help Given"}
                            {activity.type === "task_rejected" && "Task Rejected"}
                            {activity.type === "misuse" && "Misuse Reported"}
                            {activity.type === "false_activity" && "False Activity"}
                            {activity.type === "issue_feedback" && "Issue Reported"}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          activity.points > 0 ? "text-primary-green" : "text-accent-amber"
                        }`}
                      >
                        {activity.points > 0 ? "+" : ""}
                        {activity.points}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Visibility Control */}
          <Card className="bg-neutral-white shadow-card rounded-xl border border-neutral-divider">
            <CardContent className="pt-5 pb-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                {language === "en" ? "Visibility Settings" : "दृश्यता सेटिंग्स"}
              </h3>
              <p className="text-xs text-text-secondary mb-3">
                {language === "en"
                  ? "Temporarily hide your skills and tasks from public view. You can resume anytime."
                  : "अपने कौशल और कार्यों को सार्वजनिक दृश्य से अस्थायी रूप से छिपाएं। आप किसी भी समय फिर से शुरू कर सकते हैं।"}
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-card">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {language === "en" ? "Skills Visibility" : "कौशल दृश्यता"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {profileVisibility.skills
                        ? language === "en"
                          ? "Your skills are visible to others"
                          : "आपके कौशल दूसरों को दिखाई दे रहे हैं"
                        : language === "en"
                          ? "Your skills are hidden from public view"
                          : "आपके कौशल सार्वजनिक दृश्य से छिपे हुए हैं"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setProfileVisibility((prev) => ({
                        ...prev,
                        skills: !prev.skills,
                      }))
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      profileVisibility.skills ? "bg-primary-green" : "bg-neutral-divider"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-neutral-white rounded-full shadow-sm transition-transform ${
                        profileVisibility.skills ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-card">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {language === "en" ? "Task Visibility" : "कार्य दृश्यता"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {profileVisibility.tasks
                        ? language === "en"
                          ? "Your tasks are visible to others"
                          : "आपके कार्य दूसरों को दिखाई दे रहे हैं"
                        : language === "en"
                          ? "Your tasks are hidden from public view"
                          : "आपके कार्य सार्वजनिक दृश्य से छिपे हुए हैं"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setProfileVisibility((prev) => ({
                        ...prev,
                        tasks: !prev.tasks,
                      }))
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      profileVisibility.tasks ? "bg-primary-green" : "bg-neutral-divider"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-neutral-white rounded-full shadow-sm transition-transform ${
                        profileVisibility.tasks ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-white shadow-card rounded-xl border border-neutral-divider">
            <CardContent className="pt-5 pb-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Completed Tasks</h3>
              <div className="space-y-2">
                {acceptedTasks.filter((task) => task.status === "confirmed").length === 0 ? (
                  <p className="text-xs text-text-secondary text-center py-4">No completed tasks yet</p>
                ) : (
                  acceptedTasks
                    .filter((task) => task.status === "confirmed")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg bg-neutral-card border border-neutral-divider hover:border-primary-green/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-text-primary">{task.title}</h4>
                            <p className="text-xs text-text-secondary">{task.category}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-text-secondary" />
                              <span className="text-xs text-text-secondary">{task.estimatedTime}</span>
                              <span className="text-xs font-semibold text-secondary-teal">
                                {task.piRewardMin}-{task.piRewardMax}π
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-light-green text-primary-green text-xs">
                            {task.feedback || "Good"}
                          </Badge>
                          {task.finalPiReward && (
                            <span className="text-xs font-semibold text-secondary-teal ml-2">
                              {task.finalPiReward}π earned
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help Given/Received */}
          <Card className="bg-neutral-white shadow-card rounded-xl border border-neutral-divider">
            <CardContent className="pt-5 pb-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Help Activity</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-light-green text-center">
                  <HandHeart className="w-5 h-5 text-primary-green mx-auto mb-1" />
                  <p className="text-lg font-bold text-primary-green">{stats.helpGiven}</p>
                  <p className="text-xs text-text-secondary">Help Given</p>
                </div>
                <div className="p-3 rounded-lg bg-mint text-center">
                  <Heart className="w-5 h-5 text-secondary-teal mx-auto mb-1" />
                  <p className="text-lg font-bold text-secondary-teal">
                    {helpRequests.filter((h) => h.status === "fulfilled").length}
                  </p>
                  <p className="text-xs text-text-secondary">Help Received</p>
                </div>
              </div>

              {/* Recent help activity */}
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-text-secondary">Recent Activity</p>
                {trustActivities
                  .filter((a) => a.type === "help_given")
                  .slice(0, 3)
                  .map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-card">
                      <div className="flex items-center gap-2">
                        <HandHeart className="w-4 h-4 text-primary-green" />
                        <div>
                          <p className="text-xs font-medium text-text-primary">Helped community member</p>
                          <p className="text-xs text-text-secondary">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-primary-green">+{activity.points}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Skills */}
          <Card className="bg-neutral-white shadow-card rounded-xl border border-neutral-divider">
            <CardContent className="pt-5 pb-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">My Active Skills</h3>
              <div className="space-y-2">
                {postedSkills.length === 0 ? (
                  <p className="text-xs text-text-secondary text-center py-4">No skills posted yet</p>
                ) : (
                  postedSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-4 rounded-lg bg-neutral-card border border-neutral-divider hover:border-primary-green/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-text-primary mb-1">{skill.title}</h4>
                          <Badge
                            variant="outline"
                            className="text-xs border-secondary-teal/30 text-secondary-teal mb-2"
                          >
                            {skill.category}
                          </Badge>
                          {skill.description && <p className="text-xs text-text-secondary mt-2">{skill.description}</p>}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            skill.isActive
                              ? "bg-light-green text-primary-green"
                              : "bg-neutral-divider text-text-secondary"
                          }`}
                        >
                          {skill.isActive
                            ? language === "en"
                              ? "Active"
                              : "सक्रिय"
                            : language === "en"
                              ? "Paused"
                              : "रोका गया"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-text-secondary mt-3 pt-3 border-t border-neutral-divider">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{skill.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-accent-amber" />
                          <span className="font-semibold text-secondary-teal">
                            {skill.piRewardMin}-{skill.piRewardMax}π
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{skill.location || "Mumbai"}</span>
                        </div>
                      </div>

                      {/* Skill Performance Stats */}
                      {(skill.views || skill.accepts || skill.completions) && (
                        <div className="flex items-center gap-4 text-xs mt-3 pt-3 border-t border-neutral-divider">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-text-secondary" />
                            <span className="text-text-secondary">
                              {skill.views || 0} {language === "en" ? "views" : "व्यू"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-primary-green" />
                            <span className="text-text-secondary">
                              {skill.accepts || 0} {language === "en" ? "accepts" : "स्वीकार"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-primary-green" />
                            <span className="text-text-secondary">
                              {skill.completions || 0} {language === "en" ? "completed" : "पूर्ण"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      )}

      {/* Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-neutral-white shadow-soft border-t border-neutral-divider px-4 py-3 z-50">
        <div className="flex items-center justify-around">
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center h-auto w-auto p-2 rounded-lg ${
              currentView === "home" ? "text-primary-green" : "text-text-secondary hover:bg-neutral-card"
            }`}
            onClick={() => setCurrentView("home")}
          >
            <Award className={`w-5 h-5 ${currentView === "home" ? "text-primary-green" : ""}`} />
            <span className={`text-xs font-medium ${currentView === "home" ? "text-primary-green" : ""}`}>
              {content.home}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center h-auto w-auto p-2 rounded-lg ${
              currentView === "skills" ? "text-primary-green" : "text-text-secondary hover:bg-neutral-card"
            }`}
            onClick={() => setCurrentView("skills")}
          >
            <Briefcase className={`w-5 h-5 ${currentView === "skills" ? "text-primary-green" : ""}`} />
            <span className={`text-xs font-medium ${currentView === "skills" ? "text-primary-green" : ""}`}>
              {content.skills}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center h-auto w-auto p-2 rounded-lg ${
              currentView === "help" ? "text-primary-green" : "text-text-secondary hover:bg-neutral-card"
            }`}
            onClick={() => setCurrentView("help")}
          >
            <HandHeart className={`w-5 h-5 ${currentView === "help" ? "text-primary-green" : ""}`} />
            <span className={`text-xs font-medium ${currentView === "help" ? "text-primary-green" : ""}`}>
              {content.help}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center h-auto w-auto p-2 rounded-lg ${
              currentView === "community" ? "text-primary-green" : "text-text-secondary hover:bg-neutral-card"
            }`}
            onClick={() => setCurrentView("community")}
          >
            <Users className={`w-5 h-5 ${currentView === "community" ? "text-primary-green" : ""}`} />
            <span className={`text-xs font-medium ${currentView === "community" ? "text-primary-green" : ""}`}>
              {content.community}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center h-auto w-auto p-2 rounded-lg ${
              currentView === "profile" ? "text-primary-green" : "text-text-secondary hover:bg-neutral-card"
            }`}
            onClick={() => setCurrentView("profile")}
          >
            <User className={`w-5 h-5 ${currentView === "profile" ? "text-primary-green" : ""}`} />
            <span className={`text-xs font-medium ${currentView === "profile" ? "text-primary-green" : ""}`}>
              {content.profile}
            </span>
          </Button>
        </div>
      </footer>
      {/* Trust History Modal */}
      <Dialog open={showTrustHistoryModal} onOpenChange={setShowTrustHistoryModal}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{language === "en" ? "Trust History" : "विश्वास इतिहास"}</span>
              <Badge variant="secondary" className="bg-mint text-secondary-teal text-xs">
                {language === "en" ? "Permanent Record" : "स्थायी रिकॉर्ड"}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {language === "en"
                ? "Complete history of your trust score changes. This record is permanent and cannot be modified."
                : "आपके विश्वास स्कोर परिवर्तनों का पूर्ण इतिहास। यह रिकॉर्ड स्थायी है और संशोधित नहीं किया जा सकता।"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {/* Current Trust Score Summary */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-light-green to-mint border border-primary-green/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    {language === "en" ? "Current Trust Score" : "वर्तमान विश्वास स्कोर"}
                  </p>
                  <p className="text-3xl font-bold text-primary-green">{trustScore}</p>
                  <p className="text-xs font-medium text-secondary-teal mt-1">{trustLevel}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary">{language === "en" ? "Total Actions" : "कुल क्रियाएं"}</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.totalActions}</p>
                </div>
              </div>
              <div className="h-2 bg-neutral-white/50 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-primary-green transition-all duration-500"
                  style={{ width: `${(trustScore / 1000) * 100}%` }}
                />
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-primary flex items-center gap-2">
                <History className="w-4 h-4" />
                {language === "en" ? "Activity Timeline" : "गतिविधि समयरेखा"}
              </p>
              {trustActivities.length === 0 ? (
                <p className="text-center text-text-secondary text-sm py-8">
                  {language === "en" ? "No activity yet" : "अभी तक कोई गतिविधि नहीं"}
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {trustActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        activity.points > 0
                          ? "bg-light-green border-primary-green"
                          : "bg-accent-amber/10 border-accent-amber"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1">
                          <div className="mt-0.5">
                            {activity.type === "task_completed" && (
                              <CheckCircle className="w-4 h-4 text-primary-green" />
                            )}
                            {activity.type === "help_given" && <HandHeart className="w-4 h-4 text-primary-green" />}
                            {activity.type === "positive_feedback" && <Award className="w-4 h-4 text-primary-green" />}
                            {activity.type === "task_rejected" && <XCircle className="w-4 h-4 text-accent-amber" />}
                            {activity.type === "misuse" && <AlertTriangle className="w-4 h-4 text-accent-red" />}
                            {activity.type === "false_activity" && (
                              <AlertCircle className="w-4 h-4 text-accent-amber" />
                            )}
                            {activity.type === "issue_feedback" && (
                              <AlertTriangle className="w-4 h-4 text-accent-amber" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-text-primary">
                              {activity.type === "task_completed" &&
                                (language === "en" ? "Task Completed" : "कार्य पूर्ण")}
                              {activity.type === "help_given" && (language === "en" ? "Help Given" : "सहायता दी")}
                              {activity.type === "positive_feedback" &&
                                (language === "en" ? "Positive Feedback" : "सकारात्मक प्रतिक्रिया")}
                              {activity.type === "task_rejected" &&
                                (language === "en" ? "Task Rejected" : "कार्य अस्वीकृत")}
                              {activity.type === "misuse" && (language === "en" ? "Misuse Reported" : "दुरुपयोग रिपोर्ट")}
                              {activity.type === "false_activity" &&
                                (language === "en" ? "False Activity" : "झूठी गतिविधि")}
                              {activity.type === "issue_feedback" &&
                                (language === "en" ? "Issue Reported" : "समस्या रिपोर्ट")}
                            </p>
                            <p className="text-xs text-text-secondary line-clamp-1">{activity.description}</p>
                            <p className="text-xs text-text-secondary mt-1">
                              {new Date(activity.timestamp).toLocaleDateString()} •{" "}
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span
                            className={`text-sm font-bold ${
                              activity.points > 0 ? "text-primary-green" : "text-accent-amber"
                            }`}
                          >
                            {activity.points > 0 ? "+" : ""}
                            {activity.points}
                          </span>
                          <span className="text-xs text-text-secondary">{language === "en" ? "points" : "अंक"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Note */}
            <div className="p-3 rounded-lg bg-secondary-mint border border-secondary-teal/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-secondary-teal flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  {language === "en"
                    ? "Trust history is permanent and transparent. Build your score through honest work and helping others."
                    : "विश्वास इतिहास स्थायी और पारदर्शी है। ईमानदार काम और दूसरों की मदद के माध्यम से अपना स्कोर बनाएं।"}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Skill Modal */}
      <Dialog open={showPostSkillModal} onOpenChange={setShowPostSkillModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{content.postSkillTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="skillTitle" className="block text-sm font-medium text-text-primary mb-2">
                {content.skillTitle}
              </label>
              <input
                type="text"
                id="skillTitle"
                value={skillForm.title}
                onChange={(e) => setSkillForm({ ...skillForm, title: e.target.value })}
                placeholder={content.skillTitlePlaceholder}
                className="w-full p-3 border border-neutral-divider rounded-lg focus:ring-primary-green focus:border-primary-green text-sm"
              />
            </div>

            <div>
              <label htmlFor="skillCategory" className="block text-sm font-medium text-text-primary mb-2">
                {content.category}
              </label>
              <input
                type="text"
                id="skillCategory"
                value={skillForm.category}
                onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                placeholder={language === "en" ? "e.g. Design, Tech, Teaching" : "जैसे डिज़ाइन, टेक, शिक्षण"}
                className="w-full p-3 border border-neutral-divider rounded-lg focus:ring-primary-green focus:border-primary-green text-sm"
              />
            </div>

            <div>
              <label htmlFor="skillDescription" className="block text-sm font-medium text-text-primary mb-2">
                {language === "en" ? "Short Description (Optional)" : "संक्षिप्त विवरण (वैकल्पिक)"}
              </label>
              <textarea
                id="skillDescription"
                value={skillForm.description}
                onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                placeholder={language === "en" ? "Brief description of your skill..." : "अपने कौशल का संक्षिप्त विवरण..."}
                rows={3}
                className="w-full p-3 border border-neutral-divider rounded-lg focus:ring-primary-green focus:border-primary-green text-sm resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowPostSkillModal(false)}
                variant="outline"
                className="flex-1 border-neutral-divider text-text-secondary hover:bg-neutral-card active:scale-95 transition-all"
              >
                {content.cancel}
              </Button>
              <Button
                onClick={handleSubmitSkill}
                className="flex-1 bg-primary-green hover:bg-primary-green/90 text-white active:scale-95 transition-all"
              >
                {content.submit}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Safety Rules Modal */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{content.safetyRules}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">{renderSafetyRules()}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLocationSettings} onOpenChange={setShowLocationSettings}>
        <DialogContent className="sm:max-w-md bg-neutral-white">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              {language === "en" ? "Location Settings" : "स्थान सेटिंग्स"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              {language === "en"
                ? "Live location is used to show nearby work and help."
                : "पास में काम और मदद दिखाने के लिए लाइव स्थान का उपयोग किया जाता है।"}
            </p>

            <div className="flex items-center justify-between p-4 bg-neutral-card rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className={`w-5 h-5 ${userLocation ? "text-primary-green" : "text-text-secondary"}`} />
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {language === "en" ? "Location Access" : "स्थान पहुंच"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {userLocation
                      ? language === "en"
                        ? `Enabled - ${userLocation.city}`
                        : `सक्षम - ${userLocation.city}`
                      : language === "en"
                        ? "Disabled"
                        : "निष्क्रिय"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (userLocation) {
                    // Turn OFF location
                    setUserLocation(null)
                    setLocationPermissionGranted(false)
                    localStorage.removeItem("unibic_user_location")
                    localStorage.setItem("unibic_location_granted", "false")
                  } else {
                    // Turn ON location
                    setIsRequestingLocation(true)
                    setLocationError("")
                    if (!navigator.geolocation) {
                      setLocationError(
                        language === "en" ? "Location services not available." : "स्थान सेवाएँ उपलब्ध नहीं हैं।",
                      )
                      setIsRequestingLocation(false)
                      return
                    }
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const cities = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"]
                        const detectedCity = cities[Math.floor(Math.random() * cities.length)]
                        setUserLocation({
                          lat: position.coords.latitude,
                          lng: position.coords.longitude,
                          city: detectedCity,
                        })
                        setLocationPermissionGranted(true)
                        setIsRequestingLocation(false)
                        localStorage.setItem(
                          "unibic_user_location",
                          JSON.stringify({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            city: detectedCity,
                          }),
                        )
                        localStorage.setItem("unibic_location_granted", "true")
                      },
                      (error) => {
                        setLocationError(language === "en" ? "Location access denied." : "स्थान पहुंच अस्वीकृत।")
                        setIsRequestingLocation(false)
                      },
                    )
                  }
                }}
                disabled={isRequestingLocation}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  userLocation ? "bg-primary-green" : "bg-neutral-divider"
                } ${isRequestingLocation ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-neutral-white transition-transform ${
                    userLocation ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="bg-secondary-mint rounded-lg p-3">
              <p className="text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-secondary-teal flex-shrink-0 mt-0.5" />
                <span>
                  {language === "en"
                    ? "Location is not tracked continuously. It's only used when you search for tasks or help."
                    : "स्थान लगातार ट्रैक नहीं किया जाता है। इसका उपयोग केवल तब किया जाता है जब आप कार्य या मदद की खोज करते हैं।"}
                </span>
              </p>
            </div>

            {locationError && (
              <div className="bg-accent-amber/10 border border-accent-amber rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-accent-amber flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-primary">{locationError}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Skills Tab Section */}
      {currentView === "skills" && (
        <main className="max-w-md mx-auto px-4 py-6 space-y-4">
          {/* Skills Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text-primary">{content.skills}</h1>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowPostSkillModal(true)}
              disabled={isFeatureLocked("postSkill")}
              className="bg-primary-green text-white hover:bg-primary-green/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              {language === "en" ? "Post Skill" : "स्किल पोस्ट करें"}
            </Button>
          </div>

          {/* My Posted Skills */}
          <Card className="bg-neutral-white shadow-card rounded-xl border border-neutral-divider">
            <CardContent className="pt-5 pb-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                {language === "en" ? "My Skills" : "मेरे कौशल"}
              </h3>
              <div className="space-y-3">
                {myPostedSkills.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-neutral-divider mx-auto mb-3" />
                    <p className="text-sm text-text-secondary mb-2">
                      {language === "en" ? "No skills posted yet" : "अभी तक कोई कौशल पोस्ट नहीं किया गया"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {language === "en"
                        ? "Post your first skill to start earning Pi"
                        : "Pi कमाना शुरू करने के लिए अपना पहला कौशल पोस्ट करें"}
                    </p>
                  </div>
                ) : (
                  myPostedSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-4 rounded-lg bg-neutral-card border border-neutral-divider hover:border-primary-green/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-text-primary mb-1">{skill.title}</h4>
                          <Badge
                            variant="outline"
                            className="text-xs border-secondary-teal/30 text-secondary-teal mb-2"
                          >
                            {skill.category}
                          </Badge>
                          {skill.description && <p className="text-xs text-text-secondary mt-2">{skill.description}</p>}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            skill.isActive
                              ? "bg-light-green text-primary-green"
                              : "bg-neutral-divider text-text-secondary"
                          }`}
                        >
                          {skill.isActive
                            ? language === "en"
                              ? "Active"
                              : "सक्रिय"
                            : language === "en"
                              ? "Paused"
                              : "रोका गया"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-text-secondary mt-3 pt-3 border-t border-neutral-divider">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{skill.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-accent-amber" />
                          <span className="font-semibold text-secondary-teal">
                            {skill.piRewardMin}-{skill.piRewardMax}π
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{skill.location || "Mumbai"}</span>
                        </div>
                      </div>

                      {/* Skill Performance Stats */}
                      {(skill.views || skill.accepts || skill.completions) && (
                        <div className="flex items-center gap-4 text-xs mt-3 pt-3 border-t border-neutral-divider">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-text-secondary" />
                            <span className="text-text-secondary">
                              {skill.views || 0} {language === "en" ? "views" : "व्यू"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-primary-green" />
                            <span className="text-text-secondary">
                              {skill.accepts || 0} {language === "en" ? "accepts" : "स्वीकार"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-primary-green" />
                            <span className="text-text-secondary">
                              {skill.completions || 0} {language === "en" ? "completed" : "पूर्ण"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips for Better Skills */}
          <div className="bg-gradient-to-br from-primary-light-green to-secondary-mint rounded-xl p-4 border border-primary-green/20">
            <div className="flex items-start gap-3">
              <div className="bg-primary-green/10 rounded-lg p-2">
                <Sparkles className="w-5 h-5 text-primary-green" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-text-primary mb-2">
                  {language === "en" ? "Tips for Success" : "सफलता के लिए टिप्स"}
                </h3>
                <ul className="space-y-1 text-xs text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-green">•</span>
                    <span>
                      {language === "en" ? "Write clear skill titles and descriptions" : "स्पष्ट कौशल शीर्षक और विवरण लिखें"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-green">•</span>
                    <span>
                      {language === "en"
                        ? "Set realistic time estimates and Pi rewards"
                        : "यथार्थवादी समय अनुमान और Pi पुरस्कार सेट करें"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-green">•</span>
                    <span>
                      {language === "en"
                        ? "Complete tasks on time to build your Trust Score"
                        : "अपना विश्वास स्कोर बनाने के लिए समय पर कार्य पूरा करें"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-neutral-white shadow-soft border-t border-neutral-divider px-4 py-3 z-50">
        <div className="flex items-center justify-around">
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center h-auto w-auto p-2 rounded-lg ${
              currentView === "home" ? "text-primary-green" : "text-text-secondary hover:bg-neutral-card"
            }`}
            onClick={() => setCurrentView("home")}
          >
            <Award className={`w-5 h-5 ${currentView === "home" ? "text-primary-green" : ""}`} />
            <span className={`text-xs font-medium ${currentView === "home" ? "text-primary-green" : ""}`}>
              {content.home}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center h-auto w-auto p-2 rounded-lg ${
              currentView === "skills" ? "text-primary-green" : "text-text-secondary hover:bg-neutral-card"
            }`}
            onClick={() => setCurrentView("skills")}
          >
            <Briefcase className={`w-5 h-5 ${currentView === "skills" ? "text-primary-green" : ""}`} />
            <span className={`text-xs font-medium ${currentView === "skills" ? "text-primary-green" : ""}`}>
              {content.skills}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center h-auto w-auto p-2 rounded-lg ${
              currentView === "help" ? "text-primary-green" : "text-text-secondary hover:bg-neutral-card"
            }`}
            onClick={() => setCurrentView("help")}
          >
            <HandHeart className={`w-5 h-5 ${currentView === "help" ? "text-primary-green" : ""}`} />
            <span className={`text-xs font-medium ${currentView === "help" ? "text-primary-green" : ""}`}>
              {content.help}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center h-auto w-auto p-2 rounded-lg ${
              currentView === "community" ? "text-primary-green" : "text-text-secondary hover:bg-neutral-card"
            }`}
            onClick={() => setCurrentView("community")}
          >
            <Users className={`w-5 h-5 ${currentView === "community" ? "text-primary-green" : ""}`} />
            <span className={`text-xs font-medium ${currentView === "community" ? "text-primary-green" : ""}`}>
              {content.community}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center h-auto w-auto p-2 rounded-lg ${
              currentView === "profile" ? "text-primary-green" : "text-text-secondary hover:bg-neutral-card"
            }`}
            onClick={() => setCurrentView("profile")}
          >
            <User className={`w-5 h-5 ${currentView === "profile" ? "text-primary-green" : ""}`} />
            <span className={`text-xs font-medium ${currentView === "profile" ? "text-primary-green" : ""}`}>
              {content.profile}
            </span>
          </Button>
        </div>
      </footer>
      {/* Trust History Modal */}
      <Dialog open={showTrustHistoryModal} onOpenChange={setShowTrustHistoryModal}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{language === "en" ? "Trust History" : "विश्वास इतिहास"}</span>
              <Badge variant="secondary" className="bg-mint text-secondary-teal text-xs">
                {language === "en" ? "Permanent Record" : "स्थायी रिकॉर्ड"}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {language === "en"
                ? "Complete history of your trust score changes. This record is permanent and cannot be modified."
                : "आपके विश्वास स्कोर परिवर्तनों का पूर्ण इतिहास। यह रिकॉर्ड स्थायी है और संशोधित नहीं किया जा सकता।"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {/* Current Trust Score Summary */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-light-green to-mint border border-primary-green/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    {language === "en" ? "Current Trust Score" : "वर्तमान विश्वास स्कोर"}
                  </p>
                  <p className="text-3xl font-bold text-primary-green">{trustScore}</p>
                  <p className="text-xs font-medium text-secondary-teal mt-1">{trustLevel}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary">{language === "en" ? "Total Actions" : "कुल क्रियाएं"}</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.totalActions}</p>
                </div>
              </div>
              <div className="h-2 bg-neutral-white/50 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-primary-green transition-all duration-500"
                  style={{ width: `${(trustScore / 1000) * 100}%` }}
                />
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-primary flex items-center gap-2">
                <History className="w-4 h-4" />
                {language === "en" ? "Activity Timeline" : "गतिविधि समयरेखा"}
              </p>
              {trustActivities.length === 0 ? (
                <p className="text-center text-text-secondary text-sm py-8">
                  {language === "en" ? "No activity yet" : "अभी तक कोई गतिविधि नहीं"}
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {trustActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        activity.points > 0
                          ? "bg-light-green border-primary-green"
                          : "bg-accent-amber/10 border-accent-amber"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1">
                          <div className="mt-0.5">
                            {activity.type === "task_completed" && (
                              <CheckCircle className="w-4 h-4 text-primary-green" />
                            )}
                            {activity.type === "help_given" && <HandHeart className="w-4 h-4 text-primary-green" />}
                            {activity.type === "positive_feedback" && <Award className="w-4 h-4 text-primary-green" />}
                            {activity.type === "task_rejected" && <XCircle className="w-4 h-4 text-accent-amber" />}
                            {activity.type === "misuse" && <AlertTriangle className="w-4 h-4 text-accent-red" />}
                            {activity.type === "false_activity" && (
                              <AlertCircle className="w-4 h-4 text-accent-amber" />
                            )}
                            {activity.type === "issue_feedback" && (
                              <AlertTriangle className="w-4 h-4 text-accent-amber" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-text-primary">
                              {activity.type === "task_completed" &&
                                (language === "en" ? "Task Completed" : "कार्य पूर्ण")}
                              {activity.type === "help_given" && (language === "en" ? "Help Given" : "सहायता दी")}
                              {activity.type === "positive_feedback" &&
                                (language === "en" ? "Positive Feedback" : "सकारात्मक प्रतिक्रिया")}
                              {activity.type === "task_rejected" &&
                                (language === "en" ? "Task Rejected" : "कार्य अस्वीकृत")}
                              {activity.type === "misuse" && (language === "en" ? "Misuse Reported" : "दुरुपयोग रिपोर्ट")}
                              {activity.type === "false_activity" &&
                                (language === "en" ? "False Activity" : "झूठी गतिविधि")}
                              {activity.type === "issue_feedback" &&
                                (language === "en" ? "Issue Reported" : "समस्या रिपोर्ट")}
                            </p>
                            <p className="text-xs text-text-secondary line-clamp-1">{activity.description}</p>
                            <p className="text-xs text-text-secondary mt-1">
                              {new Date(activity.timestamp).toLocaleDateString()} •{" "}
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span
                            className={`text-sm font-bold ${
                              activity.points > 0 ? "text-primary-green" : "text-accent-amber"
                            }`}
                          >
                            {activity.points > 0 ? "+" : ""}
                            {activity.points}
                          </span>
                          <span className="text-xs text-text-secondary">{language === "en" ? "points" : "अंक"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Note */}
            <div className="p-3 rounded-lg bg-secondary-mint border border-secondary-teal/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-secondary-teal flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  {language === "en"
                    ? "Trust history is permanent and transparent. Build your score through honest work and helping others."
                    : "विश्वास इतिहास स्थायी और पारदर्शी है। ईमानदार काम और दूसरों की मदद के माध्यम से अपना स्कोर बनाएं।"}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
