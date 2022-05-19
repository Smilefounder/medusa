import { PaymentService } from "medusa-interfaces"

class TestPayLegacyService extends PaymentService {
  static identifier = "test-pay"

  getIdentifier() {
    return TestPayLegacyService.identifier
  }

  constructor() {
    super()
  }

  withTransaction(...args) {
      return this
  }

  async getStatus(paymentData) {
    return "authorized"
  }

  async retrieveSavedMethods(customer) {
    return Promise.resolve([])
  }

  async createPayment(cart) {
    return undefined
  }

  async retrievePayment(data) {
    return {}
  }

  async getPaymentData(sessionData) {
    return {}
  }

  async authorizePayment(sessionData, context = {}) {
    return { data: {}, status: "authorized" }
  }

  async updatePaymentData(sessionData, update) {
    return {}
  }

  async updatePayment(sessionData, cart) {
    return {}
  }

  async deletePayment(payment) {
    return {}
  }

  async capturePayment(payment) {
    return {}
  }

  async refundPayment(payment, amountToRefund) {
    return {}
  }

  async cancelPayment(payment) {
    return {}
  }
}


TestPayLegacyService.prototype.createPayment = jest.fn().mockImplementation((cart) => {
  const fields = [
      "total",
      "subtotal",
      "tax_total",
      "discount_total",
      "shipping_total",
      "gift_card_total",
    ]

    const data = {}
    for (const k of fields) {
      data[k] = cart[k]
    }

    return data
})

TestPayLegacyService.prototype.updatePayment = jest.fn().mockImplementation(() => {
  return {}
})

TestPayLegacyService.prototype.deletePayment = jest.fn().mockImplementation(() => {
  return {}
})

TestPayLegacyService.prototype.deletePayment = jest.fn().mockImplementation(() => {
  return {}
})

TestPayLegacyService.prototype.authorizePayment = jest.fn().mockImplementation(() => {
  return {}
})

TestPayLegacyService.prototype.updatePaymentData = jest.fn().mockImplementation(() => {
  return {}
})

TestPayLegacyService.prototype.cancelPayment = jest.fn().mockImplementation(() => {
  return {}
})

TestPayLegacyService.prototype.capturePayment = jest.fn().mockImplementation(() => {
  return {}
})

TestPayLegacyService.prototype.refundPayment = jest.fn().mockImplementation(() => {
  return {}
})

export default TestPayLegacyService