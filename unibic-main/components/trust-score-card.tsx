"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export function TrustScoreRules() {
  return (
    <Card className="bg-white border border-[#E0E0E0] p-4 rounded-xl">
      <h3 className="font-semibold text-[#1F2933] mb-3 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
        Trust Score Rules
      </h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium text-[#2E7D32] mb-1">Score Increases:</p>
          <ul className="space-y-1 text-[#6B7280] ml-4">
            <li>• Task Completed: +10 points</li>
            <li>• Help Given: +15 points</li>
            <li>• Positive Feedback: +5 points</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-[#F59E0B] mb-1">Score Decreases:</p>
          <ul className="space-y-1 text-[#6B7280] ml-4">
            <li>• Task Rejected: -5 points</li>
            <li>• Issue Feedback: -3 points</li>
            <li>• False Activity: -15 points</li>
            <li>• Misuse Reported: -20 points</li>
          </ul>
        </div>
        <div className="pt-2 border-t border-[#E0E0E0]">
          <p className="text-xs text-[#6B7280]">Base Score: 650 | Range: 0-1000</p>
        </div>
      </div>
    </Card>
  )
}
