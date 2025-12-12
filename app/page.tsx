"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { CheckCircle2 } from "lucide-react"

interface OrnamentData {
  id: string
  design: string
  engraving: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}

export default function OrnamentOrderForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  })
  const [ornaments, setOrnaments] = useState<OrnamentData[]>([{ id: "1", design: "", engraving: "" }])
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToFinalEngravings, setAgreedToFinalEngravings] = useState(false)
  const [agreedToPickup, setAgreedToPickup] = useState(false)
  const [agreedToPayAtEvent, setAgreedToPayAtEvent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [formsClosed, setFormsClosed] = useState(true)

  const calculatePrice = () => {
    const count = ornaments.length
    const setsOfFour = Math.floor(count / 4)
    const remainder = count % 4
    return setsOfFour * 18 + remainder * 6
  }

  const addOrnament = () => {
    setOrnaments([...ornaments, { id: Date.now().toString(), design: "", engraving: "" }])
  }

  const removeOrnament = (id: string) => {
    if (ornaments.length > 1) {
      setOrnaments(ornaments.filter((o) => o.id !== id))
    }
  }

  const updateOrnament = (id: string, field: "design" | "engraving", value: string) => {
    setOrnaments(ornaments.map((o) => (o.id === id ? { ...o, [field]: value } : o)))
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const validateStep1 = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phoneNumber.trim() !== ""
    )
  }

  const validateStep2 = () => {
    return ornaments.every((ornament) => ornament.design !== "" && ornament.engraving.trim() !== "")
  }

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)

    try {
      const orderData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        ornaments: ornaments.map((ornament, index) => ({
          ornamentNumber: index + 1,
          design: ornament.design,
          engraving: ornament.engraving,
        })),
        totalOrnaments: ornaments.length,
        totalPrice: calculatePrice(),
        orderDate: serverTimestamp(),
        paymentStatus: "pending",
        agreedToTerms: agreedToTerms,
        agreedToFinalEngravings: agreedToFinalEngravings,
        agreedToPickup: agreedToPickup,
        agreedToPayAtEvent: agreedToPayAtEvent,
      }

      const ordersCollection = collection(db, "orders")
      const docRef = await addDoc(ordersCollection, orderData)

      setOrderSubmitted(true)
    } catch (error) {
      console.error("Error submitting order:", error)
      alert("There was an error submitting your order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPrice = calculatePrice()

  if (formsClosed) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-2xl shadow-2xl border-0">
          <CardContent className="space-y-8 py-12">
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-foreground">Thank You!</h1>
                <p className="text-xl text-muted-foreground">Order Forms Are Now Closed</p>
              </div>

              <div className="space-y-4 text-center text-base text-foreground">
                <p>We appreciate all the orders we received for our Christmas ornament sale!</p>
                <p className="text-lg font-semibold">Your custom ornaments are being created with care.</p>
                <p>
                  You will receive an email notification at the address you provided when your ornaments are ready for
                  pickup at <span className="font-semibold">Jean Augustine Secondary School - Main Office</span>.
                </p>
              </div>

              <div className="bg-festive/10 border-2 border-festive rounded-lg p-6 space-y-3">
                <h2 className="font-bold text-lg text-festive">What's Next?</h2>
                <ul className="space-y-2 text-left max-w-md mx-auto">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-festive flex-shrink-0 mt-0.5" />
                    <span>Watch for an email confirmation of your order</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-festive flex-shrink-0 mt-0.5" />
                    <span>We will notify you when your ornaments are ready for pickup</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-festive flex-shrink-0 mt-0.5" />
                    <span>Pick up your ornaments at the Main Office during school hours</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground italic">Merry Christmas!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold text-foreground">Custom Ornament Order</CardTitle>
            <div className="text-sm font-medium text-muted-foreground">Step {step} of 3</div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? "bg-festive" : "bg-muted"}`}
              />
            ))}
          </div>
          <CardDescription className="text-base">
            {step === 1 && "Please provide your contact information"}
            {step === 2 && "Design your custom ornaments"}
            {step === 3 && "Review your order before submitting"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Your Information</h2>
              <div className="rounded-lg overflow-hidden">
                <img
                  src="/images/design-mode/SEC.%201_COVER.png"
                  alt="Custom ornament designs showcase"
                  className="w-full h-auto"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Jane"
                    className="focus-visible:ring-festive"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Doe"
                    className="focus-visible:ring-festive"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="jane.doe@example.com"
                  className="focus-visible:ring-festive"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="(555) 123-4567"
                  className="focus-visible:ring-festive"
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full bg-festive hover:bg-festive-hover text-white font-semibold"
                size="lg"
                disabled={!validateStep1()}
              >
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Design Your Ornaments</h2>
                <div className="text-2xl font-bold text-festive">Total Price: ${totalPrice.toFixed(2)}</div>
              </div>

              <div className="bg-accent border-2 border-festive rounded-lg p-4 text-center space-y-1">
                <p className="text-lg font-bold text-festive">🎄 Special Offer: Buy 3, Get 1 Free! 🎄</p>
                <p className="text-sm text-muted-foreground">$1 per ornament goes to the SickKids Foundation</p>
              </div>

              <div className="rounded-lg overflow-hidden">
                <img
                  src="/images/design-mode/SEC.%202_SELECTION.png"
                  alt="Ornament design options numbered 1-6"
                  className="w-full h-auto"
                />
              </div>

              <div className="space-y-4">
                {ornaments.map((ornament, index) => (
                  <div key={ornament.id} className="border-2 border-border rounded-lg p-4 space-y-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">Ornament {index + 1}</h3>
                      {ornaments.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOrnament(ornament.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`design-${ornament.id}`}>Ornament Design</Label>
                      <Select
                        value={ornament.design}
                        onValueChange={(value) => updateOrnament(ornament.id, "design", value)}
                      >
                        <SelectTrigger id={`design-${ornament.id}`} className="focus:ring-festive">
                          <SelectValue placeholder="Select a design" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Design 1 - Classic Star</SelectItem>
                          <SelectItem value="2">Design 2 - Snowflake</SelectItem>
                          <SelectItem value="3">Design 3 - Christmas Tree</SelectItem>
                          <SelectItem value="4">Design 4 - Candy Cane</SelectItem>
                          <SelectItem value="5">Design 5 - Bell</SelectItem>
                          <SelectItem value="6">Design 6 - Ornament Ball</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`engraving-${ornament.id}`}>Custom Engraving Text</Label>
                      <Input
                        id={`engraving-${ornament.id}`}
                        value={ornament.engraving}
                        onChange={(e) => updateOrnament(ornament.id, "engraving", e.target.value)}
                        placeholder="Enter custom text"
                        className="focus-visible:ring-festive"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={addOrnament}
                variant="outline"
                className="w-full border-festive text-festive hover:bg-festive hover:text-white font-semibold bg-transparent"
                size="lg"
              >
                Add Another Ornament
              </Button>

              <div className="flex gap-4">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1" size="lg">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-festive hover:bg-festive-hover text-white font-semibold"
                  size="lg"
                  disabled={!validateStep2()}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && !orderSubmitted && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Confirm Your Order</h2>

              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-bold text-foreground border-b-2 border-festive pb-2">
                    Review Your Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-muted-foreground">Name</p>
                      <p className="text-foreground">
                        {formData.firstName} {formData.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Email</p>
                      <p className="text-foreground">{formData.email}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Phone Number</p>
                      <p className="text-foreground">{formData.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-bold text-foreground border-b-2 border-festive pb-2">Order Summary</h3>
                  <div className="space-y-3">
                    {ornaments.map((ornament, index) => (
                      <div key={ornament.id} className="flex justify-between items-start p-3 bg-background rounded-md">
                        <div>
                          <p className="font-semibold text-foreground">Ornament {index + 1}</p>
                          <p className="text-sm text-muted-foreground">
                            Design: {ornament.design ? `Design ${ornament.design}` : "Not selected"}
                          </p>
                          <p className="text-sm text-muted-foreground">Engraving: {ornament.engraving || "None"}</p>
                        </div>
                        <p className="font-semibold text-festive">$6.00</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-festive text-white rounded-lg p-6 flex justify-between items-center">
                  <p className="text-2xl font-bold">Final Price</p>
                  <p className="text-3xl font-bold">${totalPrice.toFixed(2)}</p>
                </div>

                <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-bold text-amber-900">Important Information</h3>
                  <div className="space-y-3 text-sm text-amber-900">
                    <p className="font-semibold">Before Submitting:</p>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                      <li>I confirm all information provided is accurate.</li>
                      <li>
                        All engravings and designs are final — any changes count as a new order with a new payment.
                      </li>
                      <li>
                        Ornaments will be ready for pickup at Jean Augustine Secondary School Main Office once notified
                        by email.
                      </li>
                      <li>Payment will be made at the Christmas Event before ornaments are created.</li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-4 border-t-2 border-amber-300">
                    <p className="font-bold text-base text-amber-900">I agree to the following:</p>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                        className="mt-1 border-amber-700 data-[state=checked]:bg-festive data-[state=checked]:border-festive"
                      />
                      <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                        Once I submit this form, I am agreeing that all the information that I have sent is valid.
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="finalEngravings"
                        checked={agreedToFinalEngravings}
                        onCheckedChange={(checked) => setAgreedToFinalEngravings(checked as boolean)}
                        className="mt-1 border-amber-700 data-[state=checked]:bg-festive data-[state=checked]:border-festive"
                      />
                      <label htmlFor="finalEngravings" className="text-sm leading-relaxed cursor-pointer">
                        Once I submit this form, all the engravings and the ornament designs have been finalized. Any
                        changes will be considered as a "new order" resulting in you having to pay again.
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="pickup"
                        checked={agreedToPickup}
                        onCheckedChange={(checked) => setAgreedToPickup(checked as boolean)}
                        className="mt-1 border-amber-700 data-[state=checked]:bg-festive data-[state=checked]:border-festive"
                      />
                      <label htmlFor="pickup" className="text-sm leading-relaxed cursor-pointer">
                        I agree that I do not expect the ornaments to be delivered to me. I will come to Jean Augustine
                        Secondary School in the Main Office to pick up my ornaments. I will be notified by Email once it
                        is ready.
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="payAtEvent"
                        checked={agreedToPayAtEvent}
                        onCheckedChange={(checked) => setAgreedToPayAtEvent(checked as boolean)}
                        className="mt-1 border-amber-700 data-[state=checked]:bg-festive data-[state=checked]:border-festive"
                      />
                      <label htmlFor="payAtEvent" className="text-sm leading-relaxed cursor-pointer">
                        I agree that only once I have paid at the Christmas Event, the ornament will be made.
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1" size="lg">
                  Back
                </Button>
                <Button
                  onClick={handleSubmitOrder}
                  className="flex-1 bg-festive hover:bg-festive-hover text-white font-semibold"
                  size="lg"
                  disabled={
                    !agreedToTerms || !agreedToFinalEngravings || !agreedToPickup || !agreedToPayAtEvent || isSubmitting
                  }
                >
                  {isSubmitting ? "Submitting..." : "Submit Order"}
                </Button>
              </div>
            </div>
          )}

          {orderSubmitted && (
            <div className="space-y-6 text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground">Order Submitted Successfully!</h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Thank you for your order! Your order has been received. Please remember to make your payment at the
                Christmas Event. You will receive an email at <span className="font-semibold">{formData.email}</span>{" "}
                when your ornaments are ready for pickup at the Main Office.
              </p>
              <div className="bg-muted rounded-lg p-6 space-y-2 max-w-md mx-auto">
                <p className="font-semibold text-foreground">Order Summary</p>
                <p className="text-sm text-muted-foreground">
                  Total Ornaments: <span className="font-semibold text-foreground">{ornaments.length}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Price: <span className="font-semibold text-festive text-lg">${totalPrice.toFixed(2)}</span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground italic">Merry Christmas! 🎄</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
