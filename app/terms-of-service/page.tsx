import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using Choriad, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Permission is granted to temporarily use Choriad for personal, non-commercial transitory viewing only.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to reverse engineer any software contained on Choriad</li>
                  <li>Remove any copyright or other proprietary notations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
                <p className="text-muted-foreground leading-relaxed">
                  As a user of Choriad, you are responsible for maintaining the confidentiality of your account and password
                  and for restricting access to your computer. You agree to accept responsibility for all activities that
                  occur under your account or password.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Service Provider Guidelines</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Service providers on Choriad must maintain high standards of professionalism, complete tasks as described,
                  and adhere to agreed-upon timelines. Providers are independent contractors, not employees of Choriad.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Payments and Fees</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Choriad charges a 15% platform fee on completed transactions. All payments are processed securely through
                  our payment partners. Refunds are subject to our cancellation policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The materials on Choriad are provided on an 'as is' basis. Choriad makes no warranties, expressed or implied,
                  and hereby disclaims and negates all other warranties including, without limitation, implied warranties or
                  conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property
                  or other violation of rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Limitations</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In no event shall Choriad or its suppliers be liable for any damages (including, without limitation, damages
                  for loss of data or profit, or due to business interruption) arising out of the use or inability to use the
                  materials on Choriad.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These terms and conditions are governed by and construed in accordance with the laws of Nigeria and you
                  irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </section>

              <div className="p-4 bg-muted/50 rounded-lg mt-8">
                <p className="text-sm text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us at{" "}
                  <a href="mailto:legal@choriad.com" className="text-primary hover:underline">
                    legal@choriad.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}