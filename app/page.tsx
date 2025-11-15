"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from 'lucide-react'
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

interface OrnamentData {
  id: string
  design: string
  engraving: string
}

interface FormData {
  firstName: string
  lastName: string
  studentEmail: string
  studentNumber: string
  period1TeacherName: string
  period1Course: string
  period1Classroom: string
}

export default function OrnamentOrderForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    studentEmail: "",
    studentNumber: "",
    period1TeacherName: "",
    period1Course: "",
    period1Classroom: "",
  })
  const [ornaments, setOrnaments] = useState<OrnamentData[]>([{ id: "1", design: "", engraving: "" }])
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToFinalEngravings, setAgreedToFinalEngravings] = useState(false)
  const [agreedToPayment, setAgreedToPayment] = useState(false)
  const [agreedToAlternatePayment, setAgreedToAlternatePayment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)

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
      formData.studentEmail.trim() !== "" &&
      formData.studentNumber.trim() !== "" &&
      formData.period1TeacherName.trim() !== "" &&
      formData.period1Course.trim() !== "" &&
      formData.period1Classroom.trim() !== ""
    )
  }

  const validateStep2 = () => {
    return ornaments.every((ornament) => ornament.design !== "" && ornament.engraving.trim() !== "")
  }

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)

    try {
      console.log("[v0] Submitting order to Firebase...")
      
      const orderData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentEmail: formData.studentEmail,
        studentNumber: formData.studentNumber,
        period1TeacherName: formData.period1TeacherName,
        period1Course: formData.period1Course,
        period1Classroom: formData.period1Classroom,
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
        agreedToPayment: agreedToPayment,
        agreedToAlternatePayment: agreedToAlternatePayment,
      }

      console.log("[v0] Order data:", orderData)
      
      const ordersCollection = collection(db, "orders")
      const docRef = await addDoc(ordersCollection, orderData)
      
      console.log("[v0] Order saved successfully with ID:", docRef.id)
      setOrderSubmitted(true)
    } catch (error) {
      console.error("[v0] Error submitting order:", error)
      alert("There was an error submitting your order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPrice = calculatePrice()

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
            {step === 1 && "Please provide your contact and shipping information"}
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
                  src="https://i.postimg.cc/nzDh9Skn/SEC-1-COVER.png"
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
                <Label htmlFor="studentEmail">Student Email Address</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => handleInputChange("studentEmail", e.target.value)}
                  placeholder="jane.doe@student.edu"
                  className="focus-visible:ring-festive"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentNumber">Student Number</Label>
                <Input
                  id="studentNumber"
                  value={formData.studentNumber}
                  onChange={(e) => handleInputChange("studentNumber", e.target.value)}
                  placeholder="123456789"
                  className="focus-visible:ring-festive"
                />
              </div>

              <div className="space-y-4 pt-4 border-t-2 border-border">
                <h3 className="text-xl font-semibold text-foreground">Period 1 Schedule (Day 1)</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period1TeacherName">Teacher Name</Label>
                    <Input
                      id="period1TeacherName"
                      value={formData.period1TeacherName}
                      onChange={(e) => handleInputChange("period1TeacherName", e.target.value)}
                      placeholder="Mr. Williams"
                      className="focus-visible:ring-festive"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period1Course">Course</Label>
                    <Input
                      id="period1Course"
                      value={formData.period1Course}
                      onChange={(e) => handleInputChange("period1Course", e.target.value)}
                      placeholder="AP Math"
                      className="focus-visible:ring-festive"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period1Classroom">Classroom Number</Label>
                    <Input
                      id="period1Classroom"
                      value={formData.period1Classroom}
                      onChange={(e) => handleInputChange("period1Classroom", e.target.value)}
                      placeholder="Room 215"
                      className="focus-visible:ring-festive"
                    />
                  </div>
                </div>
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
                  src="https://i.postimg.cc/1551LYqV/SEC-2-SELECTION.png"
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
                      <p className="font-semibold text-muted-foreground">Student Email</p>
                      <p className="text-foreground">{formData.studentEmail}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Student Number</p>
                      <p className="text-foreground">{formData.studentNumber}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Period 1 Teacher</p>
                      <p className="text-foreground">{formData.period1TeacherName}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Period 1 Course</p>
                      <p className="text-foreground">{formData.period1Course}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Period 1 Classroom</p>
                      <p className="text-foreground">{formData.period1Classroom}</p>
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
                        I will send an e-transfer to <span className="font-semibold">inspirely4@gmail.com</span> for the
                        total amount.
                      </li>
                      <li>
                        My first & last name and student number (from this form) will be included in the message section
                        of the e-transfer.
                      </li>
                      <li>
                        If I can't e-transfer, I will pay by card or cash on{" "}
                        <span className="font-semibold">November 21, 2025</span>, in the main foyer during break.
                      </li>
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
                        id="engravings"
                        checked={agreedToFinalEngravings}
                        onCheckedChange={(checked) => setAgreedToFinalEngravings(checked as boolean)}
                        className="mt-1 border-amber-700 data-[state=checked]:bg-festive data-[state=checked]:border-festive"
                      />
                      <label htmlFor="engravings" className="text-sm leading-relaxed cursor-pointer">
                        Once I submit this form, all the engravings and the ornament designs have been finalized. Any
                        changes will be considered as a "new order" resulting in you having to pay again.
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="payment"
                        checked={agreedToPayment}
                        onCheckedChange={(checked) => setAgreedToPayment(checked as boolean)}
                        className="mt-1 border-amber-700 data-[state=checked]:bg-festive data-[state=checked]:border-festive"
                      />
                      <label htmlFor="payment" className="text-sm leading-relaxed cursor-pointer">
                        Once I submit this form, I will make an interac e-transfer to{" "}
                        <span className="font-semibold">inspirely4@gmail.com</span> with the final price. When
                        submitting the e-transfer, I agree that I will include my first and last name along with the
                        student number that I used to submit this purchase order in the "message" section of the
                        e-transfer.
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="alternate-payment"
                        checked={agreedToAlternatePayment}
                        onCheckedChange={(checked) => setAgreedToAlternatePayment(checked as boolean)}
                        className="mt-1 border-amber-700 data-[state=checked]:bg-festive data-[state=checked]:border-festive"
                      />
                      <label htmlFor="alternate-payment" className="text-sm leading-relaxed cursor-pointer">
                        If for any reason that I am unable to make the e-transfer, I will come on{" "}
                        <span className="font-semibold">November 21, 2025</span> to the main Foyer during break where I
                        can make the payment through tap (Card) or pay though cash.
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
                    !agreedToTerms ||
                    !agreedToFinalEngravings ||
                    !agreedToPayment ||
                    !agreedToAlternatePayment ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? "Submitting..." : "Submit Order"}
                </Button>
              </div>
            </div>
          )}

          {orderSubmitted && (
            <div className="space-y-6 text-center py-8">
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 space-y-4">
                <div className="text-6xl">✓</div>
                <h2 className="text-3xl font-bold text-green-800">Order Submitted Successfully!</h2>
                <p className="text-lg text-green-700">
                  Your order has been received and saved!
                </p>
                <div className="bg-white rounded-lg p-6 text-left space-y-3 text-sm text-gray-700">
                  <p className="font-semibold text-base text-gray-900">Next Steps:</p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li>
                      Send an e-transfer to <span className="font-semibold">inspirely4@gmail.com</span> for{" "}
                      <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                    </li>
                    <li>
                      Include your name ({formData.firstName} {formData.lastName}) and student number (
                      {formData.studentNumber}) in the e-transfer message
                    </li>
                    <li>If unable to e-transfer, pay on November 21, 2025 in the main foyer during break</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
