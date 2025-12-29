import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="text-center space-y-4">
          {/* Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>

          {/* Title */}
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Confirm your email address
          </CardTitle>

          {/* Subtitle */}
          <CardDescription className="text-sm text-muted-foreground">
            We’ve sent a confirmation link to your email
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            To activate your <span className="font-medium text-foreground">Choriad</span> account,
            please open the email we just sent and click the confirmation link.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Didn’t see it? Check your spam or promotions folder.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
